import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Crown,
  Info,
  Lock,
  Plus,
  SlidersHorizontal,
  X,
  AlertCircle,
} from 'lucide-react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { MainTab, SubScreen } from '../types/models';
import { assetUrl, formatINR } from '../utils/formatters';

const MAIN_NAV_ITEMS: Array<{
  tab: MainTab;
  label: string;
  icon: string;
}> = [
  { tab: MainTab.Goals, label: 'Goals', icon: 'GOALS.svg' },
  { tab: MainTab.Contributions, label: 'Ledger', icon: 'HISTORY.svg' },
  { tab: MainTab.Settings, label: 'Settings', icon: 'CONTROLS.svg' },
];

const QUICK_MODULES: Array<{
  screen: SubScreen;
  label: string;
  icon: string;
  badge?: string;
}> = [
  { screen: SubScreen.Profile, label: 'My Profile', icon: 'EDIT PROFILE.svg' },
  { screen: SubScreen.Coins, label: 'BV Coins', icon: 'BV COINS.png' },
  { screen: SubScreen.Tutorials, label: 'Tutorials', icon: 'TUTORIAL.svg' },
  { screen: SubScreen.Help, label: 'Help & Support', icon: 'HELP AND SUPPORT.svg' },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    activeTab,
    setActiveTab,
    subScreen,
    openSubScreen,
    closeSubScreen,
    user,
    totalGoalsTarget,
    totalGoalsSaved,
    activeGoalsCount,
    completedGoalsCount,
    openAddGoalModal,
    lockWithQpin,
    toasts,
    dismissToast,
  } = useBrainVibe();

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col lg:flex-row">
      <aside className="hidden lg:flex lg:w-68 lg:flex-col lg:fixed lg:inset-y-0 bg-[#181818] border-r border-white/10 z-30">
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <button
            onClick={() => setActiveTab(MainTab.Goals)}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <img
              src={assetUrl('bv.png')}
              alt="BrainVibe"
              className="w-10 h-10 object-contain rounded-xl bg-[#121212] p-1.5"
            />
            <div>
              <div className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                BrainVibe
                {user.isPro && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#ffcf07] text-black">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">Goals & Savings Tracker</p>
            </div>
          </button>
        </div>

        <div className="px-4 pt-5 pb-3">
          <div className="bv-neu-primary rounded-2xl p-4 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-neutral-400">
              <span>Goals Saved</span>
              <span className="text-[10px] font-bold text-neutral-400">
                {activeGoalsCount} Active • {completedGoalsCount} Done
              </span>
            </div>
            <div className="text-xl font-bold text-[#46AA03] tabular-nums">
              {formatINR(totalGoalsSaved)}
            </div>
            <div className="text-xs text-neutral-400 flex items-center justify-between">
              <span>Target: {formatINR(totalGoalsTarget)}</span>
              <span className="text-neutral-500">
                {Math.min(100, Math.round((totalGoalsSaved / Math.max(1, totalGoalsTarget)) * 100))}%
              </span>
            </div>
            <div className="pt-1 flex items-center justify-between text-xs text-neutral-400 border-t border-white/5">
              <span className="flex items-center gap-1.5">
                <img
                  src={assetUrl('BV COINS.png')}
                  alt="BV Coins"
                  className="w-4 h-4 object-contain"
                />
                {user.bvCoins} Coins
              </span>
              <button
                onClick={() => openSubScreen(SubScreen.PaymentOffers)}
                className="text-[#ffcf07] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                {user.isPro ? user.planName : 'Upgrade'}
              </button>
            </div>

            <button
              onClick={openAddGoalModal}
              className="w-full py-2.5 px-3 rounded-xl bg-[#ffcf07] text-black text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-105 transition cursor-pointer mt-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Goal</span>
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Primary Views
            </div>
            <div className="space-y-1">
              {MAIN_NAV_ITEMS.map((item) => {
                const isActive =
                  subScreen === SubScreen.None && activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-[#ffcf07] text-[#121212] font-semibold shadow-md'
                        : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <img
                      src={assetUrl(item.icon)}
                      alt={item.label}
                      className={`w-5 h-5 object-contain ${
                        isActive ? 'brightness-0' : 'opacity-85'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Modules & Tools
            </div>
            <div className="space-y-1">
              {QUICK_MODULES.map((mod) => {
                const isActive = subScreen === mod.screen;
                return (
                  <button
                    key={mod.screen}
                    onClick={() => openSubScreen(mod.screen)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-white/12 text-[#ffcf07] border border-[#ffcf07]/40'
                        : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <img
                        src={assetUrl(mod.icon)}
                        alt={mod.label}
                        className="w-5 h-5 object-contain"
                      />
                      <span>{mod.label}</span>
                    </span>
                    {mod.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#ffcf07]/20 text-[#ffcf07]">
                        {mod.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={() => openSubScreen(SubScreen.Profile)}
            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 cursor-pointer"
          >
            <img
              src={user.avatarUrl || assetUrl('default.png')}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border border-[#ffcf07]/50 bg-[#121212]"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-[11px] text-neutral-400 truncate">
                {user.city}, {user.country}
              </div>
            </div>
          </button>
          <button
            onClick={lockWithQpin}
            title="Lock with 4-digit QPIN"
            className="p-2 rounded-xl bg-[#121212] text-neutral-300 hover:text-[#ffcf07] border border-white/10 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:pl-68 flex flex-col min-h-screen pb-24 lg:pb-8">
        {subScreen !== SubScreen.None && (
          <header className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
            <button
              onClick={closeSubScreen}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-200 hover:text-[#ffcf07] transition cursor-pointer"
            >
              <span className="p-2 rounded-xl bv-neu-secondary">
                <ArrowLeft className="w-4 h-4" />
              </span>
              <span>Back to {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
            </button>

            <div className="flex items-center gap-2">
              {subScreen !== SubScreen.Controls && (
                <button
                  onClick={() => openSubScreen(SubScreen.Controls)}
                  className="p-2 rounded-xl bv-neu-secondary text-neutral-300 hover:text-[#ffcf07] cursor-pointer"
                  title="Controls"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              )}
            </div>
          </header>
        )}

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {children}
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#181818]/98 backdrop-blur border-t border-white/10 px-2 py-2">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-1">
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive =
              subScreen === SubScreen.None && activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`flex flex-col items-center justify-center py-2 rounded-2xl transition cursor-pointer ${
                  isActive
                    ? 'text-[#ffcf07] bg-white/6'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <img
                  src={assetUrl(item.icon)}
                  alt={item.label}
                  className={`w-5 h-5 object-contain mb-1 transition ${
                    isActive ? 'scale-110' : 'opacity-65'
                  }`}
                />
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#181818] border border-white/15 shadow-2xl text-sm text-white"
          >
            {t.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-[#46AA03] shrink-0" />
            )}
            {t.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            {t.type === 'info' && (
              <Info className="w-4 h-4 text-[#ffcf07] shrink-0" />
            )}
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
