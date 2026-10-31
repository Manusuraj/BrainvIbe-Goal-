import express, { type Request, type Response } from 'express';
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

// Razorpay credentials — both values must come from the SAME Razorpay account and mode
// (Dashboard → Account & Settings → API Keys). Test keys start with rzp_test_, live keys with rzp_live_.
export const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();
// Server-side Secret: exclusively available on backend; NEVER exposed to VITE / client
export const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || '').trim();
const PAYMENT_MODE = RAZORPAY_KEY_ID.startsWith('rzp_live_') ? 'live' : 'test';
const isRazorpayConfigured = Boolean(RAZORPAY_KEY_ID.startsWith('rzp_') && RAZORPAY_KEY_SECRET);

export const PLAN_AMOUNT_PAISE = 49900; // ₹499.00
export const PLAN_NAME = 'Premium Annual';

if (isRazorpayConfigured) {
  console.log(`[Razorpay Server Config] Mode: ${PAYMENT_MODE}, Key ID: ${RAZORPAY_KEY_ID}`);
} else {
  console.warn(
    '[Razorpay Server Config] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing — payments are disabled. Add them to .env.'
  );
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'BrainVibe Goal App Server',
    paymentMode: PAYMENT_MODE,
    paymentConfigured: isRazorpayConfigured,
    keyId: RAZORPAY_KEY_ID || null,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Config endpoint for client (Public only - never expose secret)
app.get('/api/payment/config', (_req: Request, res: Response) => {
  res.json({
    keyId: RAZORPAY_KEY_ID || null,
    configured: isRazorpayConfigured,
    mode: PAYMENT_MODE,
    amount: PLAN_AMOUNT_PAISE,
    currency: 'INR',
    planName: PLAN_NAME,
    priceDisplay: '₹499/year',
  });
});

// Create Order endpoint
app.post('/api/payment/create-order', async (req: Request, res: Response) => {
  if (!isRazorpayConfigured) {
    return res.status(503).json({
      success: false,
      error: 'Payments are not configured on the server (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing).',
    });
  }

  try {
    const { uid, email, name } = req.body || {};
    const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: PLAN_AMOUNT_PAISE,
        currency: 'INR',
        receipt: receiptId,
        notes: {
          plan: PLAN_NAME,
          uid: uid || 'anonymous',
          email: email || '',
          name: name || '',
        },
      }),
    });

    if (!rzpResponse.ok) {
      const errBody: any = await rzpResponse.json().catch(() => ({}));
      const description = errBody?.error?.description || `Razorpay responded with HTTP ${rzpResponse.status}`;
      console.error('[Razorpay] Order creation failed:', rzpResponse.status, description);
      return res.status(502).json({
        success: false,
        error:
          rzpResponse.status === 401
            ? 'Razorpay authentication failed — check that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are a matching pair.'
            : `Razorpay error: ${description}`,
      });
    }

    const rzpOrder = await rzpResponse.json();
    console.log('[Razorpay] Order created:', rzpOrder.id);
    return res.json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: RAZORPAY_KEY_ID,
      planName: PLAN_NAME,
      receipt: receiptId,
      mode: PAYMENT_MODE,
    });
  } catch (err: any) {
    console.error('[Razorpay] Error creating order:', err);
    return res.status(502).json({
      success: false,
      error: 'Could not reach Razorpay to create the order. Please try again.',
    });
  }
});

// Verify Payment endpoint — Pro must only be granted when the signature checks out
app.post('/api/payment/verify-payment', (req: Request, res: Response) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, uid } = req.body || {};

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Missing razorpay_payment_id, razorpay_order_id or razorpay_signature',
      });
    }
    if (!RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ success: false, verified: false, error: 'Payments are not configured on the server.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    const expected = Buffer.from(expectedSignature);
    const received = Buffer.from(String(razorpay_signature));
    const signatureVerified = expected.length === received.length && crypto.timingSafeEqual(expected, received);

    if (!signatureVerified) {
      console.warn(`[Payment Verification] Signature mismatch for payment ${razorpay_payment_id}`);
      return res.status(400).json({ success: false, verified: false, error: 'Payment signature verification failed.' });
    }

    const now = new Date();
    const activatedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

    console.log(`[Payment Verified] ID: ${razorpay_payment_id}, UID: ${uid || 'guest'}`);

    return res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      mode: PAYMENT_MODE,
      planName: PLAN_NAME,
      amount: 499,
      amountPaise: PLAN_AMOUNT_PAISE,
      currency: 'INR',
      activatedAt,
      expiresAt,
      uid: uid || null,
    });
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    return res.status(500).json({
      success: false,
      verified: false,
      error: 'Failed to verify payment',
    });
  }
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
    app.get('/{*splat}', (_req: Request, res: Response) => {
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
