import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  History,
  Info,
  Plus,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { GoalCycle, GoalItem } from '../types/models';
import {
  calculateGoalPacing,
  generateSavingsRecommendation,
  SavingsRecommendation,
} from '../services/aiService';
import {
  daysAheadIso,
  formatDisplayDate,
  formatINR,
} from '../utils/formatters';

export const GoalsView: React.FC = () => {
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    addGoalTransaction,
    deleteGoalTransaction,
    isAddGoalModalOpen,
    setIsAddGoalModalOpen,
    openAddGoalModal,
    goalPreferences,
    totalGoalsTarget,
    totalGoalsSaved,
    activeGoalsCount,
    completedGoalsCount,
  } = useBrainVibe();

  const [tab, setTab] = useState<'active' | 'completed'>('active');
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);
  const [detailGoal, setDetailGoal] = useState<GoalItem | null>(null);
  const [txGoalId, setTxGoalId] = useState<string | null>(null);
  const [goalPendingDelete, setGoalPendingDelete] = useState<GoalItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('50000');
  const [targetDate, setTargetDate] = useState(daysAheadIso(90));
  const [cycle, setCycle] = useState<GoalCycle>(goalPreferences?.defaultCycle || 'Monthly');
  const [category, setCategory] = useState('Emergency');

  // Deposit Form Fields
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');

  // AI Recommendation State
  const [aiRec, setAiRec] = useState<SavingsRecommendation | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);
  const txGoal = goals.find((g) => g.id === txGoalId) || null;

  // Whenever goal amount, target date, or title changes, update the AI recommendation
  useEffect(() => {
    if (!isAddGoalModalOpen && !editingGoal) return;
    const numericAmount = Number(goalAmount);
    if (!numericAmount || numericAmount <= 0) return;

    let isMounted = true;
    setIsAiLoading(true);

    const timer = setTimeout(() => {
      generateSavingsRecommendation(
        title || 'Financial Milestone',
        numericAmount,
        targetDate,
        category,
        editingGoal?.amountSaved || 0
      )
        .then((rec) => {
          if (isMounted) {
            setAiRec(rec);
            setIsAiLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsAiLoading(false);
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [goalAmount, targetDate, title, category, isAddGoalModalOpen, editingGoal]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setGoalAmount('50000');
    setTargetDate(daysAheadIso(90));
    setCycle(goalPreferences?.defaultCycle || 'Monthly');
    setCategory('Emergency');
    setIsAddGoalModalOpen(true);
  };

  const openEditModal = (g: GoalItem) => {
    setEditingGoal(g);
    setTitle(g.title);
    setDescription(g.description);
    setGoalAmount(String(g.goalAmount));
    setTargetDate(g.targetDate);
    setCycle(g.paymentFrequency);
    setCategory(g.category || 'General');
    setIsAddGoalModalOpen(true);
  };

  const closeFormModal = () => {
    setIsAddGoalModalOpen(false);
    setEditingGoal(null);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(goalAmount);
    if (!title.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }

    if (editingGoal) {
      await updateGoal(editingGoal.id, {
        title: title.trim(),
        description: description.trim() || 'Personal savings milestone',
        goalAmount: numericAmount,
        targetDate,
        paymentFrequency: cycle,
        category,
      });
      closeFormModal();
    } else {
      const ok = await addGoal({
        title: title.trim(),
        description: description.trim() || 'Personal savings milestone',
        goalAmount: numericAmount,
        targetDate,
        paymentFrequency: cycle,
        category,
      });
      if (ok) closeFormModal();
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txGoal) return;
    const amt = Number(txAmount);
    if (!Number.isFinite(amt) || amt <= 0) return;
    await addGoalTransaction(txGoal.id, amt, txNote.trim() || undefined);
    setTxAmount('');
    setTxNote('');
    setTxGoalId(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Sleek Top Header Bar with Yellow Action Button */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Goals
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {activeGoals.length} Active {activeGoals.length === 1 ? 'Goal' : 'Goals'} • {completedGoals.length} Completed
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 sm:px-5 py-2.5 rounded-2xl bg-[#ffcf07] hover:bg-yellow-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 shadow-lg shadow-[#ffcf07]/20 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-zinc-950 stroke-[3]" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Tabs: Active vs Completed */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-2xl bg-zinc-900 border border-white/6">
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              tab === 'active'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Active Goals ({activeGoals.length})
          </button>
          <button
            onClick={() => setTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              tab === 'completed'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Completed ({completedGoals.length})
          </button>
        </div>

        <span className="text-xs text-zinc-500 hidden sm:inline-block">
          Tap any card to view detailed plan
        </span>
      </div>

      {/* Goals Grid */}
      {tab === 'active' ? (
        activeGoals.length === 0 ? (
          <div className="rounded-3xl bg-zinc-900/50 border border-white/6 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ffcf07]/10 border border-[#ffcf07]/25 flex items-center justify-center mx-auto text-[#ffcf07]">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No active goals yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Set a target amount and deadline to see your automated savings recommendations and progress timeline.
            </p>
            <div className="pt-2">
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 rounded-xl bg-[#ffcf07] hover:bg-yellow-400 text-zinc-950 font-bold text-xs transition cursor-pointer shadow-md shadow-[#ffcf07]/20"
              >
                Create First Goal
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => {
              const pacing = calculateGoalPacing(
                goal.goalAmount,
                goal.targetDate,
                goal.amountSaved
              );
              const pct = Math.min(
                100,
                Math.round((goal.amountSaved / Math.max(1, goal.goalAmount)) * 100)
              );

              const radius = 26;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (pct / 100) * circumference;

              return (
                <div
                  key={goal.id}
                  className="group rounded-3xl bg-zinc-900/90 border border-white/8 hover:border-[#ffcf07]/40 p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                  onClick={() => setDetailGoal(goal)}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#ffcf07]/15 text-[#ffcf07]">
                            {goal.category || 'Goal'}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {pacing.daysRemaining} days left
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white tracking-tight truncate">
                          {goal.title}
                        </h3>
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                          {goal.description}
                        </p>
                      </div>

                      {/* Circular Progress Indicator with Signature Yellow */}
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                          <circle
                            cx="32"
                            cy="32"
                            r={radius}
                            stroke="#27272a"
                            strokeWidth="5"
                            fill="transparent"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r={radius}
                            stroke="#ffcf07"
                            strokeWidth="5"
                            strokeLinecap="round"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                          />
                        </svg>
                        <span className="absolute text-[11px] font-bold text-white tabular-nums">
                          {pct}%
                        </span>
                      </div>
                    </div>

                    {/* Financial Numbers Bar */}
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-zinc-950/70 border border-white/5 mt-4">
                      <div>
                        <span className="text-[11px] text-zinc-400 block">Saved so far</span>
                        <span className="text-sm font-bold text-[#ffcf07] tabular-nums">
                          {formatINR(goal.amountSaved)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-400 block">Target Amount</span>
                        <span className="text-sm font-bold text-white tabular-nums">
                          {formatINR(goal.goalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* AI Pacing Indicator in Yellow */}
                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 px-1">
                      <span className="flex items-center gap-1.5 text-zinc-300">
                        <Sparkles className="w-3.5 h-3.5 text-[#ffcf07]" />
                        <span>Recommended Pace:</span>
                      </span>
                      <span className="font-semibold text-[#ffcf07] tabular-nums">
                        {goal.paymentFrequency === 'Weekly'
                          ? `${formatINR(pacing.weeklySavings)} / wk`
                          : `${formatINR(pacing.monthlySavings)} / mo`}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar with Yellow Primary Button */}
                  <div
                    className="flex items-center gap-2 pt-4 mt-2 border-t border-white/5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setTxGoalId(goal.id)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#ffcf07] hover:bg-yellow-400 text-zinc-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#ffcf07]/15 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Add Savings</span>
                    </button>

                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                      title="Edit Goal"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setGoalPendingDelete(goal);
                      }}
                      className="p-2.5 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : completedGoals.length === 0 ? (
        <div className="rounded-3xl bg-zinc-900/50 border border-white/6 p-12 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No completed goals yet</h3>
          <p className="text-xs text-zinc-400">
            Keep saving toward your targets. Once a milestone reaches 100%, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedGoals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-3xl bg-zinc-900/80 border border-[#ffcf07]/30 p-5 flex items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#ffcf07] shrink-0" />
                  <h3 className="text-base font-bold text-white truncate">{goal.title}</h3>
                </div>
                <p className="text-xs text-zinc-400">{goal.description}</p>
                <div className="text-sm font-bold text-[#ffcf07] tabular-nums pt-1">
                  {formatINR(goal.goalAmount)} <span className="text-xs text-zinc-500 font-normal">achieved</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-[#ffcf07]/15 text-[#ffcf07] text-xs font-semibold">
                  {formatDisplayDate(goal.completedDate || goal.targetDate)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGoalPendingDelete(goal);
                  }}
                  className="text-xs text-zinc-500 hover:text-rose-400 transition p-1 cursor-pointer"
                  title="Remove Goal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goal Details Modal */}
      {detailGoal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-white/12 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#ffcf07]/15 text-[#ffcf07]">
                  {detailGoal.category || 'Milestone'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1.5">
                  {detailGoal.title}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">{detailGoal.description}</p>
              </div>
              <button
                onClick={() => setDetailGoal(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Breakdown Card */}
            {(() => {
              const pacing = calculateGoalPacing(
                detailGoal.goalAmount,
                detailGoal.targetDate,
                detailGoal.amountSaved
              );
              const pct = Math.min(
                100,
                Math.round((detailGoal.amountSaved / Math.max(1, detailGoal.goalAmount)) * 100)
              );

              return (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-white/6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Overall Progress</span>
                      <span className="font-bold text-white">{pct}% achieved</span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#ffcf07] rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">Saved</span>
                        <span className="text-xs font-bold text-[#ffcf07] tabular-nums">
                          {formatINR(detailGoal.amountSaved)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">Target</span>
                        <span className="text-xs font-bold text-white tabular-nums">
                          {formatINR(detailGoal.goalAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">Remaining</span>
                        <span className="text-xs font-bold text-amber-300 tabular-nums">
                          {formatINR(Math.max(0, detailGoal.goalAmount - detailGoal.amountSaved))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Pacing Intelligence in Yellow Accent */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#ffcf07]/15 via-zinc-900 to-transparent border border-[#ffcf07]/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#ffcf07]">
                      <Sparkles className="w-4 h-4 fill-[#ffcf07]" />
                      <span>BrainVibe AI Pacing Schedule</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Daily Pace</span>
                        <span className="font-bold text-white">{formatINR(pacing.dailySavings)}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Weekly Pace</span>
                        <span className="font-bold text-white">{formatINR(pacing.weeklySavings)}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Monthly Pace</span>
                        <span className="font-bold text-white">{formatINR(pacing.monthlySavings)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Savings Deposit Ledger ({detailGoal.transactions.length})
                    </h4>
                    {detailGoal.transactions.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic py-2">
                        No deposits recorded yet. Tap "Add Savings" to log your first contribution.
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {detailGoal.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-xs"
                          >
                            <div>
                              <div className="font-semibold text-white">
                                {tx.note || 'Savings Deposit'}
                              </div>
                              <div className="text-[10px] text-zinc-500">
                                {formatDisplayDate(tx.date)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#ffcf07] tabular-nums">
                                + {formatINR(tx.amount)}
                              </span>
                              <button
                                onClick={() => deleteGoalTransaction(detailGoal.id, tx.id)}
                                className="text-zinc-500 hover:text-rose-400 transition cursor-pointer p-1"
                                title="Remove deposit"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setTxGoalId(detailGoal.id);
                  setDetailGoal(null);
                }}
                className="flex-1 py-3 rounded-2xl bg-[#ffcf07] hover:bg-yellow-400 text-zinc-950 font-bold text-xs transition cursor-pointer shadow-md shadow-[#ffcf07]/20"
              >
                Add Savings to This Goal
              </button>
              <button
                onClick={() => {
                  const g = detailGoal;
                  setDetailGoal(null);
                  openEditModal(g);
                }}
                className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                title="Edit Goal"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setGoalPendingDelete(detailGoal);
                }}
                className="p-3 rounded-2xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-white/5 transition cursor-pointer"
                title="Delete Goal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDetailGoal(null)}
                className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Create / Edit Form Modal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-white/12 rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/6">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {editingGoal ? 'Edit Goal Target' : 'Create New Savings Goal'}
              </h2>
              <button
                onClick={closeFormModal}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Goal Title
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Emergency Fund, Paris Vacation, MacBook Pro"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-[#ffcf07] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Target Amount (₹)
                </label>
                <input
                  required
                  type="number"
                  min={100}
                  step={100}
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  placeholder="e.g. 100000"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white tabular-nums focus:outline-none focus:border-[#ffcf07] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Target Completion Date
                  </label>
                  <input
                    required
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-[#ffcf07] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Preferred Pacing Cycle
                  </label>
                  <select
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value as GoalCycle)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-[#ffcf07] transition"
                  >
                    <option value="Weekly">Weekly Sprint</option>
                    <option value="Monthly">Monthly Allocation</option>
                    <option value="Yearly">Yearly Milestone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-[#ffcf07] transition"
                >
                  <option value="Emergency">Emergency Buffer</option>
                  <option value="Travel">Travel & Experiences</option>
                  <option value="Gadgets">Gadgets & Tech</option>
                  <option value="Vehicle">Vehicle / Auto</option>
                  <option value="Home">Home & Renovation</option>
                  <option value="Education">Education & Courses</option>
                  <option value="Investments">Investments / Wealth</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Brief Purpose Note
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why is this milestone important for your financial health?"
                  className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-[#ffcf07] transition resize-none"
                />
              </div>

              {/* AI Pacing Preview */}
              {aiRec && (
                <div className="p-3.5 rounded-2xl bg-[#ffcf07]/10 border border-[#ffcf07]/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#ffcf07]">
                    <Sparkles className="w-3.5 h-3.5 fill-[#ffcf07]" />
                    <span>BrainVibe AI Assessment ({aiRec.realismScore})</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed">{aiRec.assessmentText}</p>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl bg-[#ffcf07] hover:bg-yellow-400 text-zinc-950 font-bold text-sm transition cursor-pointer shadow-md shadow-[#ffcf07]/20"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="px-5 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Deposit / Contribution Modal */}
      {txGoal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-white/12 rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Record Savings</h3>
                <p className="text-xs text-zinc-400">
                  Target: {txGoal.title} (Remaining: {formatINR(Math.max(0, txGoal.goalAmount - txGoal.amountSaved))})
                </p>
              </div>
              <button
                onClick={() => setTxGoalId(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Amount Saved (₹)
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white tabular-nums focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Note / Source (Optional)
                </label>
                <input
                  type="text"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  placeholder="e.g., Monthly SIP transfer, bonus sweep"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#ffcf07] hover:bg-yellow-400 text-zinc-950 font-bold text-sm transition cursor-pointer mt-2 shadow-md shadow-[#ffcf07]/20"
              >
                Save Contribution
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom In-App Goal Deletion Confirmation Modal */}
      {goalPendingDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-white/12 rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/25 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">Delete Savings Goal?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Are you sure you want to delete <span className="text-white font-semibold">"{goalPendingDelete.title}"</span>? All recorded deposits and savings milestones for this goal will be removed.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setGoalPendingDelete(null)}
                className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = goalPendingDelete.id;
                  setGoalPendingDelete(null);
                  if (detailGoal?.id === targetId) {
                    setDetailGoal(null);
                  }
                  await deleteGoal(targetId);
                }}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-rose-600/25"
              >
                Delete Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
