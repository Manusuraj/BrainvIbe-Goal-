import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Crown, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORY_COLORS,
} from '../constants/brainvibeData';
import { useBrainVibe } from '../context/BrainVibeContext';
import {
  ExpenseCategoryName,
  IncomeCategoryName,
  SubScreen,
} from '../types/models';
import {
  daysAgoIso,
  formatCompactINR,
  formatINR,
  todayIso,
} from '../utils/formatters';

export const InsightsView: React.FC = () => {
  const {
    incomes,
    expenses,
    totalBankBalance,
    totalCreditDue,
    networthSeries,
    tradeSummary,
    user,
    openSubScreen,
  } = useBrainVibe();

  const [tab, setTab] = useState<'monthly' | 'overall'>('monthly');
  const [startDate, setStartDate] = useState(daysAgoIso(30));
  const [endDate, setEndDate] = useState(todayIso());
  const [selectedIncomeIndex, setSelectedIncomeIndex] = useState(0);
  const [selectedExpenseIndex, setSelectedExpenseIndex] = useState(0);

  const filteredIncomes = useMemo(
    () =>
      incomes.filter((i) => i.date >= startDate && i.date <= endDate),
    [incomes, startDate, endDate]
  );

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((e) => e.date >= startDate && e.date <= endDate),
    [expenses, startDate, endDate]
  );

  const incomePieData = useMemo(() => {
    const totals: Record<IncomeCategoryName, number> = {
      Salary: 0,
      Business: 0,
      Trading: 0,
      Others: 0,
    };
    for (const item of filteredIncomes) {
      totals[item.category] = (totals[item.category] || 0) + item.amount;
    }
    return (Object.keys(totals) as IncomeCategoryName[])
      .map((name) => ({
        name,
        value: totals[name],
        color: INCOME_CATEGORY_COLORS[name],
      }))
      .filter((d) => d.value > 0);
  }, [filteredIncomes]);

  const expensePieData = useMemo(() => {
    const totals: Partial<Record<ExpenseCategoryName, number>> = {};
    for (const item of filteredExpenses) {
      totals[item.category] = (totals[item.category] || 0) + item.amount;
    }
    return (Object.keys(totals) as ExpenseCategoryName[])
      .map((name) => ({
        name,
        value: totals[name] || 0,
        color: EXPENSE_CATEGORIES[name].color,
      }))
      .filter((d) => d.value > 0);
  }, [filteredExpenses]);

  const periodIncomeTotal = filteredIncomes.reduce((s, i) => s + i.amount, 0);
  const periodExpenseTotal = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  const expenseRatioPct =
    periodIncomeTotal > 0
      ? Math.round((periodExpenseTotal / periodIncomeTotal) * 100)
      : 0;

  const riskBadge =
    expenseRatioPct < 50
      ? { label: 'NO RISK', color: 'text-[#46AA03] bg-[#46AA03]/15' }
      : expenseRatioPct <= 70
      ? { label: 'LOW RISK', color: 'text-[#ffcf07] bg-[#ffcf07]/15' }
      : { label: 'HIGHER RISK', color: 'text-red-400 bg-red-500/15' };

  const activeIncSlice =
    incomePieData[selectedIncomeIndex] || incomePieData[0] || null;
  const activeExpSlice =
    expensePieData[selectedExpenseIndex] || expensePieData[0] || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Insights & Portfolio Analysis
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Interactive category breakdowns, cashflow velocity, and Tradebook P&amp;L
          </p>
        </div>

        <div className="grid grid-cols-2 w-full sm:w-64 bv-neu-secondary p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setTab('monthly')}
            className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              tab === 'monthly'
                ? 'bg-[#ffcf07] text-black'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTab('overall')}
            className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              tab === 'overall'
                ? 'bg-[#ffcf07] text-black'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Overall
          </button>
        </div>
      </div>

      {tab === 'monthly' ? (
        <div className="space-y-6">
          <div className="bv-neu-secondary rounded-2xl p-4 border border-white/5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Analysis Period
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400">From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#121212] border border-white/10 text-white"
                />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#121212] border border-white/10 text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bv-neu-secondary rounded-3xl p-5 sm:p-6 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold">Income Breakdown</h3>
                <span className="text-sm font-bold text-[#46AA03] tabular-nums">
                  {formatINR(periodIncomeTotal)}
                </span>
              </div>

              {incomePieData.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-xs text-neutral-400">
                  No income entries in selected date range
                </div>
              ) : (
                <>
                  <div className="relative h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomePieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={62}
                          outerRadius={88}
                          paddingAngle={3}
                          onClick={(_, idx) => setSelectedIncomeIndex(idx)}
                        >
                          {incomePieData.map((entry, idx) => (
                            <Cell
                              key={entry.name}
                              fill={entry.color}
                              stroke={
                                idx === selectedIncomeIndex
                                  ? '#ffffff'
                                  : 'transparent'
                              }
                              strokeWidth={2}
                              className="cursor-pointer"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#121212',
                            borderColor: 'rgba(255,255,255,0.15)',
                            borderRadius: '12px',
                            fontSize: '12px',
                          }}
                          formatter={(v: number) => formatINR(v)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {activeIncSlice && (
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[11px] text-neutral-400">
                          {activeIncSlice.name}
                        </span>
                        <span className="text-sm font-bold text-white tabular-nums">
                          {formatCompactINR(activeIncSlice.value)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {incomePieData.map((d, idx) => (
                      <button
                        key={d.name}
                        onClick={() => setSelectedIncomeIndex(idx)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border cursor-pointer ${
                          idx === selectedIncomeIndex
                            ? 'bg-white/10 border-white/30 text-white'
                            : 'bg-[#121212] border-white/5 text-neutral-400'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                        <span>{d.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="bv-neu-secondary rounded-3xl p-5 sm:p-6 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold">Expenses Breakdown</h3>
                <span className="text-sm font-bold text-[#ffcf07] tabular-nums">
                  {formatINR(periodExpenseTotal)}
                </span>
              </div>

              {expensePieData.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-xs text-neutral-400">
                  No expenses in selected date range
                </div>
              ) : (
                <>
                  <div className="relative h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensePieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={62}
                          outerRadius={88}
                          paddingAngle={3}
                          onClick={(_, idx) => setSelectedExpenseIndex(idx)}
                        >
                          {expensePieData.map((entry, idx) => (
                            <Cell
                              key={entry.name}
                              fill={entry.color}
                              stroke={
                                idx === selectedExpenseIndex
                                  ? '#ffffff'
                                  : 'transparent'
                              }
                              strokeWidth={2}
                              className="cursor-pointer"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#121212',
                            borderColor: 'rgba(255,255,255,0.15)',
                            borderRadius: '12px',
                            fontSize: '12px',
                          }}
                          formatter={(v: number) => formatINR(v)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {activeExpSlice && (
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[11px] text-neutral-400">
                          {activeExpSlice.name}
                        </span>
                        <span className="text-sm font-bold text-white tabular-nums">
                          {formatCompactINR(activeExpSlice.value)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {expensePieData.map((d, idx) => (
                      <button
                        key={d.name}
                        onClick={() => setSelectedExpenseIndex(idx)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border cursor-pointer ${
                          idx === selectedExpenseIndex
                            ? 'bg-white/10 border-white/30 text-white'
                            : 'bg-[#121212] border-white/5 text-neutral-400'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                        <span>{d.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bv-neu-secondary rounded-3xl p-5 sm:p-6 border border-white/5">
            <h3 className="text-base font-semibold mb-4">
              Income vs Expenses Cashflow
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: 'Selected Period',
                      Income: periodIncomeTotal,
                      Expenses: periodExpenseTotal,
                    },
                  ]}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    stroke="#737373"
                    fontSize={11}
                    tickFormatter={(v) => formatCompactINR(Number(v))}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#737373"
                    fontSize={11}
                    hide
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#121212',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                    }}
                    formatter={(v: number) => formatINR(v)}
                  />
                  <Bar dataKey="Income" fill="#46AA03" radius={[0, 10, 10, 0]} barSize={28} />
                  <Bar dataKey="Expenses" fill="#ffcf07" radius={[0, 10, 10, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bv-neu-secondary rounded-3xl p-5 sm:p-6 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold">P&amp;L from Tradebook</h3>
              <p className="text-xs text-neutral-400">
                Realized Intraday &amp; Swing trading performance
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <div>
                <div className="text-[11px] text-neutral-400">Invested</div>
                <div className="text-sm sm:text-base font-bold tabular-nums">
                  {formatINR(tradeSummary.netFund, 0)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">Realised P&amp;L</div>
                <div
                  className={`text-sm sm:text-base font-bold tabular-nums ${
                    tradeSummary.netPnL >= 0 ? 'text-[#46AA03]' : 'text-red-400'
                  }`}
                >
                  {formatINR(tradeSummary.netPnL, 0)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">Currently</div>
                <div className="text-sm sm:text-base font-bold text-[#ffcf07] tabular-nums">
                  {formatINR(tradeSummary.currentBalance, 0)}
                </div>
              </div>
            </div>

            <button
              onClick={() => openSubScreen(SubScreen.Tradebook)}
              className="px-4 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-xs font-semibold hover:border-[#ffcf07] hover:text-[#ffcf07] cursor-pointer"
            >
              View Tradebook →
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bv-neu-secondary rounded-3xl p-5 sm:p-6 border border-white/5">
            <h3 className="text-base font-semibold mb-3">
              Cumulative Networth Trajectory
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={networthSeries}>
                  <defs>
                    <linearGradient id="overallNw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffcf07" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ffcf07" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#737373" fontSize={11} />
                  <YAxis
                    stroke="#737373"
                    fontSize={11}
                    tickFormatter={(v) => formatCompactINR(Number(v))}
                    width={64}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#121212',
                      borderColor: 'rgba(255,207,7,0.35)',
                      borderRadius: '12px',
                    }}
                    formatter={(v: number) => formatINR(v)}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#ffcf07"
                    strokeWidth={3}
                    fill="url(#overallNw)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bv-neu-secondary rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-neutral-400">Current Savings</div>
              <div className="text-lg font-bold text-[#46AA03] tabular-nums mt-1">
                {formatINR(totalBankBalance, 0)}
              </div>
            </div>
            <div className="bv-neu-secondary rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-neutral-400">Credit Card Dues</div>
              <div className="text-lg font-bold text-[#ffcf07] tabular-nums mt-1">
                {formatINR(totalCreditDue, 0)}
              </div>
            </div>
            <div className="bv-neu-secondary rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-neutral-400">Tradebook P &amp; L</div>
              <div
                className={`text-lg font-bold tabular-nums mt-1 ${
                  tradeSummary.netPnL >= 0 ? 'text-[#46AA03]' : 'text-red-400'
                }`}
              >
                {formatINR(tradeSummary.netPnL, 0)}
              </div>
            </div>
            <div className="bv-neu-secondary rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-neutral-400">Expense-to-Income</div>
              <div className="text-lg font-bold text-white tabular-nums mt-1">
                {expenseRatioPct}%
              </div>
            </div>
          </div>

          <div className="bv-neu-secondary rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                {expenseRatioPct <= 50 ? (
                  <ShieldCheck className="w-8 h-8 text-[#46AA03]" />
                ) : (
                  <ShieldAlert className="w-8 h-8 text-[#ffcf07]" />
                )}
                <div>
                  <h3 className="text-lg font-bold">
                    Portfolio Insights: Income To Expenditure Ratio
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Measures what percentage of monthly inflows goes toward consumption
                  </p>
                </div>
              </div>

              <span
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${riskBadge.color}`}
              >
                {riskBadge.label} ({expenseRatioPct}%)
              </span>
            </div>

            {!user.isPro && (
              <div className="mt-5 p-4 rounded-2xl bg-[#121212] border border-[#ffcf07]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                  <Crown className="w-5 h-5 text-[#ffcf07] shrink-0" />
                  <span>
                    Upgrade to <strong>BrainVibe Pro</strong> for deeper asset
                    allocation ratios and unlimited historical exports.
                  </span>
                </div>
                <button
                  onClick={() => openSubScreen(SubScreen.PaymentOffers)}
                  className="px-4 py-2 rounded-xl bg-[#ffcf07] text-black text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Unlock Pro
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
