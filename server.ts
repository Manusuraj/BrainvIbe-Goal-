import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env file if available (for Node.js runtime)
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    if (typeof (process as any).loadEnvFile === 'function') {
      (process as any).loadEnvFile(envPath);
    } else {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...vals] = trimmed.split('=');
          const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      }
    }
  }
} catch (envErr) {
  console.warn('[Server] Could not parse .env:', envErr);
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware
app.use(express.json());

// ---------------------------------------------------------------------------
// Server-Side Daily Chat Usage & Quota Enforcement
// Strict Rule: Exactly 5 chat messages per user per day, resetting at local midnight.
// ---------------------------------------------------------------------------

interface UserChatUsage {
  date: string; // YYYY-MM-DD in user's timezone
  count: number; // number of chats consumed today (max 5)
  lastUpdated: string;
}

const chatUsageStore = new Map<string, UserChatUsage>();

function getLocalDateStringInTimezone(date: Date, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function calculateMidnightReset(now: Date, timezone: string): { resetAt: Date; secondsUntilReset: number } {
  try {
    const tzFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });

    const parts = tzFormatter.formatToParts(now);
    const getPart = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
    const localHour = getPart('hour') % 24;
    const localMinute = getPart('minute');
    const localSecond = getPart('second');

    const secondsPassedToday = localHour * 3600 + localMinute * 60 + localSecond;
    const secondsUntilReset = Math.max(1, 86400 - secondsPassedToday);
    const resetAt = new Date(now.getTime() + secondsUntilReset * 1000);

    return { resetAt, secondsUntilReset };
  } catch {
    const fallbackSec = 3600;
    return { resetAt: new Date(now.getTime() + fallbackSec * 1000), secondsUntilReset: fallbackSec };
  }
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'BrainVibe Goal App Server',
    chatLimitPerDay: 5,
    proPlanEnabled: false,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Check daily chat quota
app.post('/api/chat/quota', (req: Request, res: Response) => {
  try {
    const { uid, timezone = 'Asia/Kolkata' } = req.body || {};
    if (!uid) {
      return res.status(400).json({ success: false, error: 'User UID is required' });
    }

    const now = new Date();
    const today = getLocalDateStringInTimezone(now, timezone);
    const { resetAt, secondsUntilReset } = calculateMidnightReset(now, timezone);

    const record = chatUsageStore.get(uid);
    let count = 0;

    if (record && record.date === today) {
      count = Math.min(5, record.count);
    } else {
      chatUsageStore.set(uid, {
        date: today,
        count: 0,
        lastUpdated: now.toISOString(),
      });
    }

    const remaining = Math.max(0, 5 - count);

    return res.json({
      success: true,
      allowed: remaining > 0,
      totalLimit: 5,
      usedToday: count,
      remaining,
      date: today,
      timezone,
      resetAtIso: resetAt.toISOString(),
      secondsUntilReset,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Consume 1 chat message credit (Atomic server check)
app.post('/api/chat/consume', (req: Request, res: Response) => {
  try {
    const { uid, timezone = 'Asia/Kolkata' } = req.body || {};
    if (!uid) {
      return res.status(400).json({ success: false, error: 'User UID is required' });
    }

    const now = new Date();
    const today = getLocalDateStringInTimezone(now, timezone);
    const { resetAt, secondsUntilReset } = calculateMidnightReset(now, timezone);

    const record = chatUsageStore.get(uid);
    let currentCount = 0;

    if (record && record.date === today) {
      currentCount = record.count;
    }

    if (currentCount >= 5) {
      return res.status(429).json({
        success: false,
        error: "You've used all 5 chats for today. Your next set of chats will be available tomorrow.",
        remaining: 0,
        usedToday: 5,
        totalLimit: 5,
        resetAtIso: resetAt.toISOString(),
        secondsUntilReset,
      });
    }

    const newCount = currentCount + 1;
    chatUsageStore.set(uid, {
      date: today,
      count: newCount,
      lastUpdated: now.toISOString(),
    });

    const remaining = Math.max(0, 5 - newCount);

    return res.json({
      success: true,
      allowed: true,
      remaining,
      usedToday: newCount,
      totalLimit: 5,
      date: today,
      resetAtIso: resetAt.toISOString(),
      secondsUntilReset,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Refund 1 credit if message processing failed
app.post('/api/chat/refund', (req: Request, res: Response) => {
  try {
    const { uid, timezone = 'Asia/Kolkata' } = req.body || {};
    if (!uid) {
      return res.status(400).json({ success: false, error: 'User UID is required' });
    }

    const now = new Date();
    const today = getLocalDateStringInTimezone(now, timezone);
    const record = chatUsageStore.get(uid);

    if (record && record.date === today && record.count > 0) {
      record.count = Math.max(0, record.count - 1);
      record.lastUpdated = now.toISOString();
      chatUsageStore.set(uid, record);
    }

    const currentCount = record?.date === today ? record.count : 0;
    const { resetAt, secondsUntilReset } = calculateMidnightReset(now, timezone);

    return res.json({
      success: true,
      refunded: true,
      remaining: Math.max(0, 5 - currentCount),
      usedToday: currentCount,
      resetAtIso: resetAt.toISOString(),
      secondsUntilReset,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Pro subscription model removed — endpoints respond with disabled notification
app.all(['/api/payment/config', '/api/payment/create-order', '/api/payment/verify-payment'], (_req: Request, res: Response) => {
  res.status(200).json({
    proPlanActive: false,
    message: 'Pro plan subscription is currently discontinued. All users have equal access with 5 daily AI chats.',
  });
});

// Vite Middleware Setup
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BrainVibe Server] Running at http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('[BrainVibe Server] Fatal startup error:', err);
  process.exit(1);
});
