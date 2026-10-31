import React, { useRef, useState } from 'react';
import {
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CreditCard,
  Crown,
  Database,
  Download,
  EyeOff,
  HelpCircle,
  Lock,
  LogOut,
  Mail,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  User,
  Zap,
} from 'lucide-react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { GoalCycle, SubScreen } from '../types/models';
import { formatReadableDate } from '../utils/formatters';
import { initiateSubscriptionCheckout } from '../services/paymentService';

export const SettingsView: React.FC = () => {
  const {
    user,
    logout,
    goalPreferences,
    updateGoalPreferences,
    exportGoalsData,
    importGoalsData,
    resetDemoData,
    openTutorial,
    openEmailSupport,
    openSubScreen,
    upgradeToPro,
    showToast,
  } = useBrainVibe();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStateMsg, setCheckoutStateMsg] = useState('');

  const handleDirectUpgrade = async () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    setCheckoutStateMsg('Preparing secure order...');

    await initiateSubscriptionCheckout({
      user,
      onStart: () => {
        setCheckoutStateMsg('Opening Razorpay Gateway...');
      },
      onSuccess: async (paymentId: string) => {
        setCheckoutStateMsg('Activating Premium...');
        await upgradeToPro(paymentId);
        setIsCheckingOut(false);
        setCheckoutStateMsg('');
        showToast(`Payment successful (Ref: ${paymentId})! Premium activated 🎉`, 'success');
      },
      onError: (errMsg: string) => {
        setIsCheckingOut(false);
        setCheckoutStateMsg('');
        showToast(errMsg, 'error');
      },
      onCancel: () => {
        setIsCheckingOut(false);
        setCheckoutStateMsg('');
        showToast('Payment cancelled. You remain on the Free Plan.', 'info');
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importGoalsData(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBackupClick = () => {
    if (!user.isPro) {
      openSubScreen(SubScreen.ProUpgrade);
    } else {
      exportGoalsData();
    }
  };

  const handleRestoreClick = () => {
    if (!user.isPro) {
      openSubScreen(SubScreen.ProUpgrade);
    } else {
      fileInputRef.current?.click();
    }
  };

  // Expiry date calculation formatted
  const expiryDisplay = user.subscriptionExpiry
    ? formatReadableDate(user.subscriptionExpiry)
    : '1 year from activation';

  // Monthly AI messages count
  const monthlyAiCount = user.monthlyAiCount || 0;
  const monthlyAiPct = Math.min(100, Math.round((monthlyAiCount / 100) * 100));

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-36 sm:pb-40">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Account membership, AI usage quotas, goal automation, and data backup
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="rounded-3xl bg-zinc-900/90 border border-white/8 p-5 sm:p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-white text-base shrink-0 overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-zinc-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white truncate">
                {user.name || 'Goal Achiever'}
              </h2>
              {user.isPro ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffcf07] text-zinc-950 flex items-center gap-1 shrink-0 shadow-sm shadow-[#ffcf07]/20">
                  <Crown className="w-3 h-3 fill-zinc-950" /> PREMIUM
                </span>
              ) : (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-zinc-400 shrink-0">
                  Free Plan
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 truncate">{user.email || 'Signed in via Google'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="text-xs font-semibold text-zinc-400 hover:text-rose-400 transition flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/10 shrink-0 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUBSCRIPTION & MEMBERSHIP SECTION (ONE UNIFIED CARD)          */}
      {/* ------------------------------------------------------------- */}
      <section aria-label="Subscription and Membership">
        {user.isPro ? (
          /* ================= ONE UNIFIED CARD: PREMIUM USER ================= */
          <div className="rounded-3xl bg-zinc-900/90 border border-[#ffcf07]/40 p-5 sm:p-6 space-y-5 shadow-xl shadow-[#ffcf07]/5 transition-all">
            {/* Header: Plan & Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#ffcf07] text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-[#ffcf07]/20 shrink-0">
                  <Crown className="w-6 h-6 fill-zinc-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">Current Plan: Premium</h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-[#ffcf07] font-semibold mt-0.5">
                    Subscription price: ₹499/year
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">
                  Expiry Date
                </span>
                <span className="text-xs font-bold text-white">{expiryDisplay}</span>
              </div>
            </div>

            {/* Core Status Badges: Ad-Free, Backup Access */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/70 border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">
                    Ad-Free Status
                  </span>
                  <span className="text-xs font-bold text-white">
                    Active (Zero Ads)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/70 border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">
                    Personal Backup Access
                  </span>
                  <span className="text-xs font-bold text-white">
                    Enabled
                  </span>
                </div>
              </div>
            </div>

            {/* AI Chat Usage: e.g. 25/100 messages used */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffcf07]" />
                  AI Chat Usage
                </span>
                <span className="font-bold text-[#ffcf07] tabular-nums">
                  {monthlyAiCount} / 100 messages used
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-[#ffcf07] rounded-full transition-all duration-300"
                  style={{ width: `${monthlyAiPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                <span>{Math.max(0, 100 - monthlyAiCount)} messages remaining this month</span>
                <span>Resets monthly on the 1st</span>
              </div>
            </div>
          </div>
        ) : (
          /* ================= ONE UNIFIED CARD: FREE USER ================= */
          <div className="rounded-3xl bg-zinc-900/90 border border-white/10 p-5 sm:p-6 space-y-5 shadow-xl shadow-black/40 transition-all">
            {/* Header: Plan & Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center font-black text-zinc-300 shrink-0">
                  <Zap className="w-6 h-6 text-[#ffcf07]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">Current Plan: Free Plan</h2>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-400 uppercase tracking-wider">
                      FREE
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Ad-supported plan with basic financial goal tracking and 5 daily AI chats.
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Benefits Available After Upgrading */}
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/6 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                Premium Benefits Available After Upgrading
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-zinc-200">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="font-medium">Completely ad-free experience</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-200">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="font-medium">100 AI chat messages per month</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-200">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="font-medium">Personal data backup and restore</span>
                </div>
              </div>
            </div>

            {/* Embedded Upgrade Button (Inside the same unified card) */}
            <button
              onClick={handleDirectUpgrade}
              disabled={isCheckingOut}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#ffcf07] hover:bg-yellow-400 text-zinc-950 font-bold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-[#ffcf07]/25 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
            >
              {isCheckingOut ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>{checkoutStateMsg || 'Preparing Secure Checkout...'}</span>
                </span>
              ) : (
                <>
                  <Crown className="w-4 h-4 fill-zinc-950" />
                  <span>Upgrade to Premium – ₹499/year</span>
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* Goal Setting Preferences */}
      <div className="rounded-3xl bg-zinc-900/90 border border-white/8 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#ffcf07]" />
          <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400">
            Goal Setting Preferences
          </h3>
        </div>

        {/* Default Frequency */}
        <div className="py-2.5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Default Payment Cycle</p>
            <p className="text-xs text-zinc-500">Preset frequency for new savings targets</p>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-950 border border-white/6 shrink-0">
            {(['Weekly', 'Monthly', 'Yearly'] as GoalCycle[]).map((cycle) => (
              <button
                key={cycle}
                onClick={() => updateGoalPreferences({ defaultCycle: cycle })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  goalPreferences?.defaultCycle === cycle
                    ? 'bg-[#ffcf07] text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cycle}
              </button>
            ))}
          </div>
        </div>

        {/* Auto-calculate Pacing */}
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div>
            <p className="text-sm font-semibold text-white">Auto-Calculate Savings Pace</p>
            <p className="text-xs text-zinc-500">
              Dynamically calculate required daily, weekly, or monthly savings
            </p>
          </div>
          <input
            type="checkbox"
            checked={goalPreferences?.autoCalculatePace ?? true}
            onChange={(e) => updateGoalPreferences({ autoCalculatePace: e.target.checked })}
            className="w-4 h-4 accent-[#ffcf07] cursor-pointer"
          />
        </div>

        {/* Milestone Reminders */}
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div>
            <p className="text-sm font-semibold text-white">Milestone Progress Alerts</p>
            <p className="text-xs text-zinc-500">
              Celebration notifications at 25%, 50%, 75%, and 100% completion
            </p>
          </div>
          <input
            type="checkbox"
            checked={goalPreferences?.milestoneReminders ?? true}
            onChange={(e) => updateGoalPreferences({ milestoneReminders: e.target.checked })}
            className="w-4 h-4 accent-[#ffcf07] cursor-pointer"
          />
        </div>

        {/* Currency Format */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-semibold text-white">Currency Format</p>
            <p className="text-xs text-zinc-500">Display denomination for goals</p>
          </div>
          <select
            value={goalPreferences?.currency || 'INR'}
            onChange={(e) =>
              updateGoalPreferences({
                currency: e.target.value as 'INR' | 'USD' | 'EUR' | 'GBP',
              })
            }
            className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-[#ffcf07] cursor-pointer"
          >
            <option value="INR">₹ INR (Indian Rupee)</option>
            <option value="USD">$ USD (US Dollar)</option>
            <option value="EUR">€ EUR (Euro)</option>
            <option value="GBP">£ GBP (British Pound)</option>
          </select>
        </div>
      </div>

      {/* Quick Navigation: How to Use & Help */}
      <div className="rounded-3xl bg-zinc-900/90 border border-white/8 p-5 space-y-2">
        <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400 mb-2">
          Guides & Support
        </h3>

        {/* How to Use */}
        <button
          onClick={openTutorial}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-950/50 hover:bg-zinc-800/80 border border-white/5 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-[#ffcf07]" />
            <div>
              <p className="text-sm font-semibold text-white">How to Use the App</p>
              <p className="text-xs text-zinc-500">Revisit the step-by-step goal & AI guide</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>

        {/* Email support directly to info@forestay.in */}
        <button
          onClick={openEmailSupport}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-950/50 hover:bg-zinc-800/80 border border-white/5 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-white">Help & Support</p>
              <p className="text-xs text-zinc-500">Contact team directly at info@forestay.in</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      {/* Data Management & Backup (Restricted to Paid Subscribers) */}
      <div className="rounded-3xl bg-zinc-900/90 border border-white/8 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#ffcf07]" />
            <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400">
              Personal Data Backup & Cloud Sync
            </h3>
          </div>
          {user.isPro ? (
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Unlocked
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> Requires Premium
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-400">
          {user.isPro
            ? 'Export full offline JSON copies of your goals, pacing schedules, and transaction ledger, or restore anytime.'
            : 'Personal data backup and offline JSON restore are exclusive to Premium subscribers. Upgrade for ₹499/year to secure your financial records.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleBackupClick}
            className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
              user.isPro
                ? 'bg-zinc-950 hover:bg-zinc-800 border-white/10 text-white shadow-sm'
                : 'bg-zinc-950/60 hover:bg-zinc-900 border-amber-400/30 text-amber-300'
            }`}
          >
            {user.isPro ? (
              <Download className="w-4 h-4 text-[#ffcf07]" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            <span>Export Goals Backup</span>
          </button>

          <button
            onClick={handleRestoreClick}
            className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
              user.isPro
                ? 'bg-zinc-950 hover:bg-zinc-800 border-white/10 text-white shadow-sm'
                : 'bg-zinc-950/60 hover:bg-zinc-900 border-amber-400/30 text-amber-300'
            }`}
          >
            {user.isPro ? (
              <Upload className="w-4 h-4 text-blue-400" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            <span>Restore from Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Goals</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-white/12 rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 text-[#ffcf07] flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">Reset Sample Goals?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This will restore initial baseline benchmarks. Any custom edits and transactions will be refreshed.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  resetDemoData();
                }}
                className="flex-1 py-3 rounded-2xl bg-[#ffcf07] hover:bg-yellow-400 text-zinc-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-[#ffcf07]/20"
              >
                Reset Goals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
