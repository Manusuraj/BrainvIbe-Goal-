import React from 'react';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Crown,
  HelpCircle,
  Info,
  LogOut,
  Mail,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Target,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { MainTab, SubScreen } from '../types/models';
import { formatINR } from '../utils/formatters';
import { ProUpgradeModal } from '../views/ProUpgradeModal';
import { TutorialModal } from '../views/TutorialModal';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    subScreen,
    closeSubScreen,
    user,
    totalGoalsSaved,
    totalGoalsTarget,
    openAddGoalModal,
    openTutorial,
    completeTutorial,
    openEmailSupport,
    openSubScreen,
    toasts,
    dismissToast,
    remainingAiMessages,
  } = useBrainVibe();

  const NAV_ITEMS = [
    {
      tab: MainTab.Goals,
      label: 'Goals',
      icon: Target,
    },
    {
      tab: MainTab.Assistant,
      label: 'BrainVibe AI',
      icon: Sparkles,
      badge: !user.isPro ? `${remainingAiMessages}/5 left` : `${remainingAiMessages}/100 left`,
    },
    {
      tab: MainTab.Settings,
      label: 'Settings',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row antialiased selection:bg-[#ffcf07] selection:text-black">
      {/* Desktop Sidebar (Apple-inspired minimal sidebar) */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-zinc-950/80 backdrop-blur-2xl border-r border-white/8 z-30 justify-between p-6">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab(MainTab.Goals)}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#ffcf07] text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-[#ffcf07]/20 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  Goal App
                  {user.isPro && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#ffcf07] text-zinc-950 flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> PRO
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">Financial Pacing & Savings</p>
              </div>
            </button>
          </div>

          {/* Quick Portfolio Metric Card */}
          <div className="rounded-2xl bg-zinc-900/90 border border-white/6 p-4 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 block uppercase tracking-wider">
              Total Saved
            </span>
            <div className="text-2xl font-extrabold text-[#ffcf07] tabular-nums">
              {formatINR(totalGoalsSaved)}
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-white/5">
              <span>Target: {formatINR(totalGoalsTarget)}</span>
              <span className="text-zinc-500 font-semibold">
                {Math.min(100, Math.round((totalGoalsSaved / Math.max(1, totalGoalsTarget)) * 100))}%
              </span>
            </div>

            <button
              onClick={openAddGoalModal}
              className="w-full mt-2 py-2.5 px-3 rounded-xl bg-[#ffcf07] hover:bg-yellow-400 text-zinc-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#ffcf07]/15 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Goal</span>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab && subScreen === SubScreen.None;
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    closeSubScreen();
                    setActiveTab(item.tab);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-white border border-white/10 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#ffcf07]' : 'text-zinc-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        user.isPro
                          ? 'bg-[#ffcf07]/15 text-[#ffcf07]'
                          : 'bg-white/8 text-zinc-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-2 pt-4 border-t border-white/6">
          <button
            onClick={openTutorial}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>How to Use the App</span>
          </button>

          <button
            onClick={openEmailSupport}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Support: info@forestay.in</span>
          </button>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-xs text-white overflow-hidden shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-zinc-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{user.name || 'Friend'}</div>
                <div className="text-[10px] text-zinc-400 truncate">{user.planName}</div>
              </div>
            </div>

            {!user.isPro ? (
              <button
                onClick={() => openSubScreen(SubScreen.ProUpgrade)}
                className="text-[11px] font-bold text-[#ffcf07] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Crown className="w-3 h-3 fill-[#ffcf07]" /> Upgrade ₹499
              </button>
            ) : (
              <span className="text-[10px] font-bold text-[#ffcf07] flex items-center gap-1">
                <Crown className="w-3 h-3 fill-[#ffcf07]" /> Premium
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen pb-32 sm:pb-36 lg:pb-12 overflow-x-hidden">
        {/* Ad Placement (Disabled for Active Premium Subscribers) */}
        {!user.isPro && (
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
            <div className="px-3.5 py-2.5 rounded-2xl bg-zinc-900/60 border border-white/6 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 shrink-0">
                  Sponsor
                </span>
                <span className="text-zinc-300 truncate text-[11px] sm:text-xs">
                  Smart Wealth SIPs & Liquid Mutual Funds • Zero commission direct plans
                </span>
              </div>
              <button
                onClick={() => openSubScreen(SubScreen.ProUpgrade)}
                className="text-[11px] font-bold text-[#ffcf07] hover:underline shrink-0 cursor-pointer flex items-center gap-1"
              >
                <span>Remove Ads</span>
                <span className="text-[10px] text-zinc-400 font-normal hidden sm:inline">(₹499/yr)</span>
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Floating Bottom Navigation Bar (Apple-style 3 tabs) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-zinc-950/90 backdrop-blur-2xl border-t border-white/10 px-4 py-2">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab && subScreen === SubScreen.None;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  closeSubScreen();
                  setActiveTab(item.tab);
                }}
                className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition cursor-pointer relative ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-[#ffcf07]/15 text-[#ffcf07]' : 'text-zinc-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-white font-semibold' : ''}`}>
                  {item.label}
                </span>

                {item.badge && !user.isPro && (
                  <span className="absolute top-1 right-5 w-2 h-2 rounded-full bg-[#ffcf07]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Global Modals */}
      {subScreen === SubScreen.ProUpgrade && (
        <ProUpgradeModal onClose={closeSubScreen} />
      )}

      {subScreen === SubScreen.Tutorial && (
        <TutorialModal onClose={completeTutorial} />
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900 border border-white/15 shadow-2xl text-xs sm:text-sm text-white animate-in slide-in-from-top-2"
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-amber-400 shrink-0" />}
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
