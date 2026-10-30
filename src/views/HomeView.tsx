import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Bell,
  ChevronDown,
  ChevronUp,
  Play,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  CREDIT_TILES,
  INSURANCE_TILES,
  INVESTMENT_TILES,
} from '../constants/brainvibeData';
import { useBrainVibe } from '../context/BrainVibeContext';
import { SubScreen } from '../types/models';
import { assetUrl, formatCompactINR, formatINR } from '../utils/formatters';

export const HomeView: React.FC = () => {
  const {
    user,
    totalNetworth,
    totalBankBalance,
    totalOtherIncome,
    totalIncomeCombined,
    totalExpenses,
    totalCreditDue,
    networthSeries,
    notifications,
    markAllNotificationsRead,
    openSubScreen,
    setIsStoriesOpen,
    openComingSoon,
  } = useBrainVibe();

  const [showAllInvestments, setShowAllInvestments] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedInvestments = showAllInvestments
    ? INVESTMENT_TILES
    : INVESTMENT_TILES.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => openSubScreen(SubScreen.Profile)}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative">
              <img
                src={user.avatarUrl || assetUrl('default.png')}
                alt={user.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-[#ffcf07] bg-[#181818]"
              />
            </div>
            <div className="text-left">
              <div className="text-xs text-neutral-400">Welcome back,</div>
              <div className="text-base font-semibold text-white group-hover:text-[#ffcf07] transition">
                {user.name}
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsStoriesOpen(true)}
            className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181818] border border-[#ffcf07]/60 hover:bg-[#ffcf07]/10 transition cursor-pointer"
            title="Watch BrainVibe Daily Stories"
          >
            <span className="w-6 h-6 rounded-full bg-[#ffcf07] text-black flex items-center justify-center">
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </span>
            <span className="text-xs font-semibold text-[#ffcf07] hidden sm:inline">
              Stories
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 relative">
          <button
            onClick={() => openSubScreen(SubScreen.Coins)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bv-neu-secondary border border-white/5 hover:border-[#ffcf07]/40 cursor-pointer"
          >
            <img
              src={assetUrl('BV COINS.png')}
              alt="Coins"
              className="w-4 h-4 object-contain"
            />
            <span className="text-xs font-semibold tabular-nums">
              {user.bvCoins}
            </span>
          </button>

          <button
            onClick={() => {
              setNotifOpen((o) => !o);
              if (!notifOpen) markAllNotificationsRead();
            }}
            className="relative p-2.5 rounded-2xl bv-neu-secondary border border-white/5 hover:border-[#ffcf07]/40 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-neutral-200" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#ffcf07]" />
            )}
          </button>

          <button
            onClick={() => openSubScreen(SubScreen.Controls)}
            className="p-2.5 rounded-2xl bv-neu-secondary border border-white/5 hover:border-[#ffcf07]/40 cursor-pointer"
            title="Controls"
          >
            <img
              src={assetUrl('CONTROLS.svg')}
              alt="Controls"
              className="w-5 h-5 object-contain"
            />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-13 w-80 sm:w-96 bg-[#181818] border border-white/15 rounded-2xl shadow-2xl p-4 z-40">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
                <span className="text-sm font-semibold">Notifications</span>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-[#ffcf07] hover:underline cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-[#121212] border border-white/5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {n.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="bv-neu-secondary rounded-3xl p-5 sm:p-7 border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400 font-medium">
              <span>My Networth</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#46AA03]/20 text-[#46AA03] text-[11px] font-semibold">
                <TrendingUp className="w-3 h-3" />
                Live Synced
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums mt-1.5">
              {formatINR(totalNetworth)}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Bank Savings ({formatINR(totalBankBalance, 0)}) + Other Income (
              {formatINR(totalOtherIncome, 0)}) − Expenses (
              {formatINR(totalExpenses, 0)})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openSubScreen(SubScreen.Tradebook)}
              className="px-3.5 py-2 rounded-xl bg-[#121212] border border-white/10 text-xs font-medium text-neutral-200 hover:border-[#ffcf07]/50 hover:text-[#ffcf07] transition cursor-pointer"
            >
              Open Tradebook
            </button>
            <button
              onClick={() => openSubScreen(SubScreen.Market)}
              className="px-3.5 py-2 rounded-xl bg-[#ffcf07] text-black text-xs font-semibold hover:brightness-105 transition cursor-pointer"
            >
              Live Market
            </button>
          </div>
        </div>

        <div className="h-52 sm:h-60 w-full mt-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={networthSeries}
              margin={{ top: 8, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="bvNetworthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffcf07" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#ffcf07" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCompactINR(Number(v))}
                width={64}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#121212',
                  borderColor: 'rgba(255,207,7,0.35)',
                  borderRadius: '14px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: number) => [formatINR(val), 'Networth']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#ffcf07"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#bvNetworthGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <button
            onClick={() => openSubScreen(SubScreen.Income)}
            className="bv-neu-primary rounded-2xl p-4 sm:p-5 flex items-center justify-between text-left border border-white/5 hover:border-[#46AA03]/50 transition group cursor-pointer"
          >
            <div>
              <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#46AA03]" />
                <span>Income & Bank Balances</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white tabular-nums mt-1">
                {formatINR(totalIncomeCombined)}
              </div>
              <div className="text-[11px] text-[#46AA03] mt-1">
                Manage Bank A/Cs & Cash Inflows →
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#46AA03]/15 text-[#46AA03] flex items-center justify-center group-hover:scale-105 transition">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={() => openSubScreen(SubScreen.Expenses)}
            className="bv-neu-primary rounded-2xl p-4 sm:p-5 flex items-center justify-between text-left border border-white/5 hover:border-[#ffcf07]/50 transition group cursor-pointer"
          >
            <div>
              <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ffcf07]" />
                <span>Expenses</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white tabular-nums mt-1">
                {formatINR(totalExpenses)}
              </div>
              <div className="text-[11px] text-[#ffcf07] mt-1">
                Open Expense Tracker & Reports →
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ffcf07]/15 text-[#ffcf07] flex items-center justify-center group-hover:scale-105 transition">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      </section>

      <section className="bv-neu-secondary rounded-3xl p-5 sm:p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Total Investments
            </h2>
            <p className="text-xs text-neutral-400">
              Tap Savings A/C, Stocks, or Crypto to manage active holdings
            </p>
          </div>
          <button
            onClick={() => setShowAllInvestments((s) => !s)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#ffcf07] hover:underline cursor-pointer"
          >
            <span>{showAllInvestments ? 'View Less' : 'View More'}</span>
            {showAllInvestments ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          {displayedInvestments.map((tile) => (
            <button
              key={tile.id}
              onClick={() => {
                if (tile.route) {
                  openSubScreen(tile.route);
                } else {
                  openComingSoon(tile.label, tile.description);
                }
              }}
              className="bv-neu-primary rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-2.5 border border-white/5 hover:border-[#ffcf07]/50 transition group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#181818] flex items-center justify-center p-2 group-hover:scale-105 transition">
                <img
                  src={assetUrl(tile.icon)}
                  alt={tile.label}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <span className="text-xs font-medium text-neutral-200 leading-tight">
                {tile.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bv-neu-secondary rounded-3xl p-5 sm:p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-white">My Insurance</h2>
          <p className="text-xs text-neutral-400 mb-4">
            Life & health protection coverage
          </p>
          <div className="grid grid-cols-2 gap-4">
            {INSURANCE_TILES.map((ins) => (
              <button
                key={ins.id}
                onClick={() => openComingSoon(ins.label, ins.description)}
                className="bv-neu-primary rounded-2xl p-4 flex items-center gap-3.5 text-left border border-white/5 hover:border-[#ffcf07]/40 transition cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-[#181818] flex items-center justify-center p-2.5 shrink-0">
                  <img
                    src={assetUrl(ins.icon)}
                    alt={ins.label}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {ins.label}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Add Policy
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="bv-neu-secondary rounded-3xl p-5 sm:p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Credit & Liabilities
              </h2>
              <p className="text-xs text-neutral-400">
                Card Dues: {formatINR(totalCreditDue)}
              </p>
            </div>
            <button
              onClick={() =>
                openComingSoon(
                  'Fetch My Credit Score',
                  'Direct CIBIL / Experian soft-inquiry score check is being integrated.'
                )
              }
              className="px-3 py-1.5 rounded-xl bg-[#ffcf07]/15 text-[#ffcf07] text-xs font-semibold hover:bg-[#ffcf07]/25 transition cursor-pointer"
            >
              Fetch Credit Score
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {CREDIT_TILES.map((ct) => (
              <button
                key={ct.id}
                onClick={() => {
                  if (ct.route) {
                    openSubScreen(ct.route);
                  } else {
                    openComingSoon(
                      'Loan Tracker',
                      'Automated EMI & principal amortization tracking coming soon.'
                    );
                  }
                }}
                className="bv-neu-primary rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-2 border border-white/5 hover:border-[#ffcf07]/50 transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#181818] flex items-center justify-center p-2">
                  <img
                    src={assetUrl(ct.icon)}
                    alt={ct.label}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <span className="text-xs font-medium text-neutral-200">
                  {ct.label}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
