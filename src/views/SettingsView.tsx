import React, { useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Database,
  Download,
  Info,
  LogOut,
  Mail,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  User,
} from 'lucide-react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { GoalCycle } from '../types/models';
import { formatHmsCountdown } from '../utils/formatters';

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
    remainingAiMessages,
    secondsUntilMidnight,
  } = useBrainVibe();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  const usedToday = 5 - remainingAiMessages;
  const usedPct = Math.min(100, Math.round((usedToday / 5) * 100));

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-36 sm:pb-40">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Account information, AI usage limits, goal preferences, and data backup
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
            <h2 className="text-base font-bold text-white truncate">
              {user.name || 'Goal Achiever'}
            </h2>
            <p className="text-xs text-zinc-400 truncate">{user.email || 'Free Account'}</p>
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

      {/* Daily Chat Usage & Midnight Reset Card */}
      <div className="rounded-3xl bg-zinc-900/90 border border-white/8 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ffcf07]" />
            <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-300">
              Daily AI Chat Usage
            </h3>
          </div>
          <span className="text-xs font-bold text-[#ffcf07] tabular-nums">
            {usedToday} / 5 used today
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-[#ffcf07] rounded-full transition-all duration-300"
            style={{ width: `${usedPct}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 pt-1 gap-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>
              <strong className="text-white font-semibold">{remainingAiMessages}</strong> messages remaining today
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-[#ffcf07]" />
            <span>
              Resets at midnight in:{' '}
              <strong className="text-white font-mono">{formatHmsCountdown(secondsUntilMidnight)}</strong>
            </span>
          </div>
        </div>
      </div>

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

      {/* Guides & Support */}
      <div className="rounded-3xl bg-zinc-900/90 border border-white/8 p-5 space-y-2">
        <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400 mb-2">
          Guides & Support
        </h3>

        <button
          onClick={openTutorial}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-950/50 hover:bg-zinc-800/80 border border-white/5 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-[#ffcf07]" />
            <div>
              <p className="text-sm font-semibold text-white">How to Use the App</p>
              <p className="text-xs text-zinc-500">Step-by-step goal & AI guide</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>

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

      {/* Personal Data Backup & Cloud Sync (Unlocked for all users) */}
      <div className="rounded-3xl bg-zinc-900/90 border border-white/8 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#ffcf07]" />
            <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400">
              Personal Data Backup & Cloud Sync
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Unlocked
          </span>
        </div>

        <p className="text-xs text-zinc-400">
          Export full offline JSON copies of your goals, deadlines, and contribution history, or restore an earlier backup anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={exportGoalsData}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-white/10 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-[#ffcf07]" />
            <span>Export Goals Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-white/10 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4 text-blue-400" />
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
