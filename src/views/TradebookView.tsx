import React, { useState } from 'react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { TradeFundItem, TradeLogItem } from '../types/models';
import { formatINR, formatReadableDate } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Wallet,
  Layers,
  RotateCcw
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const TradebookView: React.FC = () => {
  const {
    tradeFunds,
    tradeLogs,
    tradeSummary,
    addTradeFund,
    deleteTradeFund,
    addTradeLog,
    deleteTradeLog,
    resetTradebook
  } = useBrainVibe();

  const [activeTab, setActiveTab] = useState<'logs' | 'funds'>('logs');

  // Trade Log Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [result, setResult] = useState<'profit' | 'loss'>('profit');
  const [segment, setSegment] = useState<'intraday' | 'swing'>('intraday');
  const [amount, setAmount] = useState('');
  const [comments, setComments] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Funds Modal
  const [showFundsModal, setShowFundsModal] = useState(false);
  const [fundType, setFundType] = useState<'deposit' | 'withdraw'>('deposit');
  const [fundAmount, setFundAmount] = useState('');
  const [fundNote, setFundNote] = useState('');

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(amount) || 0;
    if (amtNum <= 0) return;

    addTradeLog({
      date: new Date(date).toISOString(),
      result,
      segment,
      amount: amtNum,
      comments: comments || `${segment.toUpperCase()} ${result.toUpperCase()}`
    });

    setShowLogModal(false);
    setAmount('');
    setComments('');
  };

  const handleSaveFund = (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(fundAmount) || 0;
    if (amtNum <= 0) return;

    addTradeFund({
      type: fundType,
      amount: amtNum,
      date: new Date().toISOString(),
      note: fundNote || (fundType === 'deposit' ? 'Capital Injection' : 'Capital Withdrawal')
    });

    setShowFundsModal(false);
    setFundAmount('');
    setFundNote('');
  };

  // Cumulative PnL curve
  let runningBalance = tradeSummary.netFund;
  const equityCurve = tradeLogs.map((log: TradeLogItem, idx: number) => {
    const diff = log.result === 'profit' ? log.amount : -log.amount;
    runningBalance += diff;
    return {
      name: `#${idx + 1}`,
      balance: runningBalance,
      pnl: diff,
      date: formatReadableDate(log.date)
    };
  });

  const totalTrades = tradeLogs.length;
  const profitableTrades = tradeLogs.filter((l: TradeLogItem) => l.result === 'profit').length;
  const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Tradebook</span>
            <span className="text-xs bg-[#ffcf07]/20 text-[#ffcf07] px-2 py-0.5 rounded-full font-medium">
              NSE / BSE
            </span>
          </h1>
          <p className="text-sm text-neutral-400">Track Intraday & Swing trades, equity curve, and capital ledger</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFundsModal(true)}
            className="flex items-center gap-2 bg-[#181818] border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:border-white/20 transition-all cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-[#ffcf07]" />
            <span>Fund Ledger</span>
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-2 bg-[#ffcf07] text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e6bb06] transition-all cursor-pointer shadow-lg shadow-[#ffcf07]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record Trade</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-5">
          <p className="text-xs text-neutral-400 mb-1">Realized Net P&L</p>
          <p className={`text-2xl font-black ${tradeSummary.netPnL >= 0 ? 'text-[#46AA03]' : 'text-rose-400'}`}>
            {tradeSummary.netPnL >= 0 ? '+' : ''}
            {formatINR(tradeSummary.netPnL)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">ROI: {tradeSummary.returnPct.toFixed(2)}%</p>
        </div>

        <div className="bg-[#181818] border border-white/5 rounded-2xl p-5">
          <p className="text-xs text-neutral-400 mb-1">Win Rate</p>
          <p className="text-2xl font-black text-[#ffcf07]">{winRate.toFixed(1)}%</p>
          <p className="text-[11px] text-neutral-500 mt-1">
            {profitableTrades} Wins / {totalTrades - profitableTrades} Losses
          </p>
        </div>

        <div className="bg-[#181818] border border-white/5 rounded-2xl p-5">
          <p className="text-xs text-neutral-400 mb-1">Net Trading Capital</p>
          <p className="text-2xl font-black text-white">{formatINR(tradeSummary.netFund)}</p>
          <p className="text-[11px] text-neutral-500 mt-1">Current Balance: {formatINR(tradeSummary.currentBalance)}</p>
        </div>

        <div className="bg-[#181818] border border-white/5 rounded-2xl p-5">
          <p className="text-xs text-neutral-400 mb-1">Intraday vs Swing PnL</p>
          <p className="text-sm font-bold text-neutral-200 mt-1">
            Intra: <span className={tradeSummary.intradayProfit - tradeSummary.intradayLoss >= 0 ? 'text-[#46AA03]' : 'text-rose-400'}>
              {formatINR(tradeSummary.intradayProfit - tradeSummary.intradayLoss)}
            </span>
          </p>
          <p className="text-sm font-bold text-neutral-200 mt-0.5">
            Swing: <span className={tradeSummary.swingProfit - tradeSummary.swingLoss >= 0 ? 'text-[#46AA03]' : 'text-rose-400'}>
              {formatINR(tradeSummary.swingProfit - tradeSummary.swingLoss)}
            </span>
          </p>
        </div>
      </div>

      {/* Equity Curve Chart */}
      {equityCurve.length > 0 && (
        <div className="bg-[#181818] border border-white/5 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Trading Portfolio Trajectory</h3>
              <p className="text-xs text-neutral-400">Account balance progression across closed trades</p>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                tradeSummary.netPnL >= 0 ? 'bg-[#46AA03]/20 text-[#46AA03]' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              Current: {formatINR(tradeSummary.currentBalance)}
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurve}>
                <defs>
                  <linearGradient id="tradeCurveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffcf07" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ffcf07" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#666"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={val => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const v = payload[0].value as number;
                      return (
                        <div className="bg-[#121212] border border-white/10 p-2.5 rounded-xl shadow-xl">
                          <p className="text-xs text-neutral-400">{payload[0].payload.name} ({payload[0].payload.date})</p>
                          <p className="text-sm font-bold text-[#ffcf07]">
                            Balance: {formatINR(v)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#ffcf07"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tradeCurveGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'logs' ? 'text-[#ffcf07]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Trade History ({tradeLogs.length})</span>
          {activeTab === 'logs' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffcf07] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('funds')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'funds' ? 'text-[#ffcf07]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Capital Ledger ({tradeFunds.length})</span>
          {activeTab === 'funds' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffcf07] rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Trade History */}
      {activeTab === 'logs' && (
        <div className="bg-[#181818] border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Logged Trades</h3>
            <button
              onClick={resetTradebook}
              className="text-xs text-neutral-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Journal</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-neutral-400 bg-white/[0.02]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Segment</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Comments / Setup</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {tradeLogs.map((log: TradeLogItem) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-neutral-300 font-mono">
                      {formatReadableDate(log.date)}
                    </td>
                    <td className="py-3 px-4 uppercase font-bold text-neutral-300">
                      {log.segment}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.result === 'profit' ? 'bg-[#46AA03]/20 text-[#46AA03]' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold font-mono">
                      <span className={log.result === 'profit' ? 'text-[#46AA03]' : 'text-rose-400'}>
                        {log.result === 'profit' ? '+' : '-'}
                        {formatINR(log.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      {log.comments}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteTradeLog(log.id)}
                        className="p-1 hover:bg-rose-500/20 rounded-lg text-neutral-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Capital Ledger */}
      {activeTab === 'funds' && (
        <div className="bg-[#181818] border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-neutral-400 bg-white/[0.02]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Note</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {tradeFunds.map((fund: TradeFundItem) => (
                  <tr key={fund.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-neutral-300 font-mono">
                      {formatReadableDate(fund.date)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          fund.type === 'deposit' ? 'bg-[#46AA03]/20 text-[#46AA03]' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {fund.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-white">
                      {formatINR(fund.amount)}
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      {fund.note || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteTradeFund(fund.id)}
                        className="p-1 hover:bg-rose-500/20 rounded-lg text-neutral-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Trade Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">Record Closed Trade</h2>
            <p className="text-xs text-neutral-400 mb-6">Log trade result, segment, and amount</p>

            <form onSubmit={handleSaveLog} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Outcome</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setResult('profit')}
                      className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                        result === 'profit'
                          ? 'bg-[#46AA03] text-white border-[#46AA03]'
                          : 'bg-[#121212] text-neutral-300 border-white/10'
                      }`}
                    >
                      Profit
                    </button>
                    <button
                      type="button"
                      onClick={() => setResult('loss')}
                      className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                        result === 'loss'
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-[#121212] text-neutral-300 border-white/10'
                      }`}
                    >
                      Loss
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Segment</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSegment('intraday')}
                      className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                        segment === 'intraday'
                          ? 'bg-[#ffcf07] text-black border-[#ffcf07]'
                          : 'bg-[#121212] text-neutral-300 border-white/10'
                      }`}
                    >
                      Intraday
                    </button>
                    <button
                      type="button"
                      onClick={() => setSegment('swing')}
                      className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                        segment === 'swing'
                          ? 'bg-[#ffcf07] text-black border-[#ffcf07]'
                          : 'bg-[#121212] text-neutral-300 border-white/10'
                      }`}
                    >
                      Swing
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 4500"
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Comments / Script</label>
                <input
                  type="text"
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="e.g. RELIANCE Breakout Long, 1:2.5 RR achieved"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#ffcf07] hover:bg-[#e6bb06] cursor-pointer shadow-lg shadow-[#ffcf07]/20"
                >
                  Record Trade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Funds Modal */}
      {showFundsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowFundsModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">Trading Capital Ledger</h2>
            <p className="text-xs text-neutral-400 mb-6">Deposit or withdraw from trading capital</p>

            <form onSubmit={handleSaveFund} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFundType('deposit')}
                  className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                    fundType === 'deposit'
                      ? 'bg-[#46AA03] text-white border-[#46AA03]'
                      : 'bg-[#121212] text-neutral-300 border-white/10'
                  }`}
                >
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setFundType('withdraw')}
                  className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                    fundType === 'withdraw'
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-[#121212] text-neutral-300 border-white/10'
                  }`}
                >
                  Withdraw
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  step="100"
                  value={fundAmount}
                  onChange={e => setFundAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Note</label>
                <input
                  type="text"
                  value={fundNote}
                  onChange={e => setFundNote(e.target.value)}
                  placeholder="e.g. New margin deposit from HDFC"
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFundsModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#ffcf07] hover:bg-[#e6bb06] cursor-pointer shadow-lg shadow-[#ffcf07]/20"
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
