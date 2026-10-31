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
