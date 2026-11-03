import { GoalCycle } from '../types/models';

export function assetUrl(relativePath: string): string {
  const cleaned = relativePath.replace(/^\/?assets\//, '');
  const encoded = cleaned
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `/assets/${encoded}`;
}

export function formatINR(amount: number, maximumFractionDigits = 2): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 2,
    maximumFractionDigits,
  }).format(Math.abs(safe));
  return `${safe < 0 ? '- ' : ''}₹ ${formatted}`;
}

export function formatCompactINR(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatReadableDate(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function maskAccountNumber(acc: string): string {
  const digits = acc.replace(/\s+/g, '');
  if (digits.length <= 4) return `XXXX ${digits}`;
  return `XXXX XXXX ${digits.slice(-4)}`;
}

export function maskCardNumber(cardNum: string): string {
  const digits = cardNum.replace(/\D/g, '');
  const last4 = digits.slice(-4).padStart(4, '0');
  return `XXXX  XXXX  XXXX  ${last4}`;
}

export function getCycleDays(cycle: GoalCycle): number {
  if (cycle === 'Weekly') return 7;
  if (cycle === 'Monthly') return 30;
  return 365;
}

export function computeDaysLeft(targetDateIso: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDateIso);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function computeGoalInstallment(
  goalAmount: number,
  amountSaved: number,
  targetDateIso: string,
  cycle: GoalCycle
): { amountPerCycle: number; unitLabel: string; daysLeft: number } {
  const daysLeft = Math.max(1, computeDaysLeft(targetDateIso));
  const cycleDays = getCycleDays(cycle);
  const remaining = Math.max(0, goalAmount - amountSaved);
  const periods = Math.max(1, daysLeft / cycleDays);
  const amountPerCycle = remaining / periods;
  const unitLabel =
    cycle === 'Weekly' ? 'Week' : cycle === 'Monthly' ? 'Month' : 'Year';
  return { amountPerCycle, unitLabel, daysLeft };
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function daysAheadIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns the user's local timezone (e.g., "Asia/Kolkata", "America/New_York")
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
}

/**
 * Get current date string formatted as YYYY-MM-DD in the user's specific timezone
 */
export function getLocalDateString(date: Date = new Date(), timezone: string = getUserTimezone()): string {
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

/**
 * Calculates the exact Date object for the upcoming midnight (12:00:00 AM) in the user's local timezone.
 */
export function getNextLocalMidnight(now: Date = new Date(), timezone: string = getUserTimezone()): Date {
  const todayStr = getLocalDateString(now, timezone);
  const [year, month, day] = todayStr.split('-').map(Number);
  
  // Tomorrow's calendar day
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));
  
  // Find local midnight in target timezone
  // Start with an approximation and align to exact 00:00:00 in timezone
  let candidate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  candidate.setHours(0, 0, 0, 0);
  
  // Fine tune using Intl to ensure it matches the beginning of the next calendar day in user timezone
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

  // Iteratively find next midnight offset in target timezone
  const parts = tzFormatter.formatToParts(now);
  const getPart = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
  const localHour = getPart('hour') % 24;
  const localMinute = getPart('minute');
  const localSecond = getPart('second');

  const secondsPassedToday = localHour * 3600 + localMinute * 60 + localSecond;
  const secondsUntilMidnight = Math.max(1, 86400 - secondsPassedToday);

  return new Date(now.getTime() + secondsUntilMidnight * 1000);
}

/**
 * Formats a duration in seconds into `03h 29m 45s` or `00h 00m 00s`
 */
export function formatHmsCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00h 00m 00s';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return `${hh}h ${mm}m ${ss}s`;
}

/**
 * Parses target date string into an exact target deadline Date object.
 * If targetDate only has YYYY-MM-DD, deadline defaults to 23:59:59 on that day.
 */
export function parseGoalDeadline(targetDateIso: string): Date {
  if (!targetDateIso) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 30);
    return fallback;
  }

  if (targetDateIso.length === 10) {
    // e.g. "2026-11-15" -> treat as 23:59:59 local
    const [y, m, d] = targetDateIso.split('-').map(Number);
    return new Date(y, m - 1, d, 23, 59, 59, 999);
  }

  const d = new Date(targetDateIso);
  if (Number.isNaN(d.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 30);
    return fallback;
  }
  return d;
}

export interface GoalCountdownResult {
  isOverdue: boolean;
  totalSeconds: number;
  formatted: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  statusLabel: string;
}

/**
 * Calculate live countdown for a goal deadline
 */
export function getGoalCountdown(targetDateIso: string, now: Date = new Date()): GoalCountdownResult {
  const deadline = parseGoalDeadline(targetDateIso);
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      isOverdue: true,
      totalSeconds: 0,
      formatted: '00h 00m 00s',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      statusLabel: 'Overdue',
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  const formatted = days > 0 ? `${days}d ${hh}h ${mm}m ${ss}s` : `${hh}h ${mm}m ${ss}s`;

  return {
    isOverdue: false,
    totalSeconds,
    formatted,
    days,
    hours,
    minutes,
    seconds,
    statusLabel: days > 0 ? `${days} days left` : 'Due today',
  };
}

/**
 * Formats a deadline for clean UI display with both date and time
 */
export function formatDeadlineDateTime(targetDateIso: string): string {
  const d = parseGoalDeadline(targetDateIso);
  const dateStr = d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateStr}, ${timeStr}`;
}

