import React, { useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  History,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { GoalCycle, GoalItem } from '../types/models';
import {
  computeGoalInstallment,
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
    goalPreferences,
  } = useBrainVibe();

  const [tab, setTab] = useState<'active' | 'completed'>('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);
  const [txGoalId, setTxGoalId] = useState<string | null>(null);

  const txGoal = goals.find((g) => g.id === txGoalId) || null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [targetDate, setTargetDate] = useState(daysAheadIso(120));
  const [cycle, setCycle] = useState<GoalCycle>(goalPreferences?.defaultCycle || 'Monthly');

  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  React.useEffect(() => {
    if (isAddGoalModalOpen && !isAddModalOpen) {
      openCreateModal();
    }
  }, [isAddGoalModalOpen]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setGoalAmount('');
    setTargetDate(daysAheadIso(120));
    setCycle(goalPreferences?.defaultCycle || 'Monthly');
    setIsAddModalOpen(true);
    setIsAddGoalModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setIsAddGoalModalOpen(false);
    setEditingGoal(null);
  };

  const openEditModal = (g: GoalItem) => {
    setEditingGoal(g);
    setTitle(g.title);
    setDescription(g.description);
    setGoalAmount(String(g.goalAmount));
    setTargetDate(g.targetDate);
    setCycle(g.paymentFrequency);
    setIsAddModalOpen(true);
    setIsAddGoalModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(goalAmount);
    if (!title.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: title.trim(),
        description: description.trim() || 'Personal savings milestone',
        goalAmount: numericAmount,
        targetDate,
        paymentFrequency: cycle,
      });
      closeAddModal();
    } else {
      const ok = addGoal({
        title: title.trim(),
        description: description.trim() || 'Personal savings milestone',
        goalAmount: numericAmount,
        targetDate,
        paymentFrequency: cycle,
      });
      if (ok) closeAddModal();
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txGoal) return;
    const amt = Number(txAmount);
    if (!Number.isFinite(amt) || amt <= 0) return;
    addGoalTransaction(txGoal.id, amt, txNote.trim() || undefined);
    setTxAmount('');
    setTxNote('');
    setTxGoalId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Goals</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Break big milestones into automated Weekly, Monthly, or Yearly savings targets
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#ffcf07] text-black font-semibold text-sm hover:brightness-105 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-2 max-w-md bv-neu-secondary p-1.5 rounded-2xl border border-white/5">
        <button
          onClick={() => setTab('active')}
          className={`py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
            tab === 'active'
              ? 'bg-[#ffcf07] text-black'
              : 'text-neutral-300 hover:text-white'
          }`}
        >
          Active ({activeGoals.length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
            tab === 'completed'
              ? 'bg-[#ffcf07] text-black'
              : 'text-neutral-300 hover:text-white'
          }`}
        >
          Completed ({completedGoals.length})
        </button>
      </div>

      {tab === 'active' ? (
        activeGoals.length === 0 ? (
          <div className="bv-neu-secondary rounded-3xl p-10 text-center border border-white/5">
            <p className="text-base font-medium text-white">
              You have no active goals right now
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Tap &ldquo;Add Goal&rdquo; to set a target date and calculate your savings pace.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeGoals.map((goal) => {
              const pct = Math.min(
                100,
                Math.round((goal.amountSaved / Math.max(1, goal.goalAmount)) * 100)
              );
              const pending = Math.max(0, goal.goalAmount - goal.amountSaved);
              const { amountPerCycle, unitLabel, daysLeft } =
                computeGoalInstallment(
                  goal.goalAmount,
                  goal.amountSaved,
                  goal.targetDate,
                  goal.paymentFrequency
                );

              const radius = 30;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset =
                circumference - (pct / 100) * circumference;

              return (
                <div
                  key={goal.id}
                  className="bv-neu-secondary rounded-3xl p-5 border border-white/5 flex flex-col justify-between gap-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
                        <svg className="w-18 h-18 -rotate-90" viewBox="0 0 72 72">
                          <circle
                            cx="36"
                            cy="36"
                            r={radius}
                            stroke="#2b2b2b"
                            strokeWidth="6"
                            fill="transparent"
                          />
                          <circle
                            cx="36"
                            cy="36"
                            r={radius}
                            stroke="#ffcf07"
                            strokeWidth="6"
                            strokeLinecap="round"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                          />
                        </svg>
                        <span className="absolute text-xs font-bold text-white tabular-nums">
                          {pct}%
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white truncate">
                          {goal.title}
                        </h3>
                        <p className="text-xs text-neutral-400 line-clamp-2 mt-0.5">
                          {goal.description}
                        </p>
                        <div className="text-xs font-semibold text-[#ffcf07] mt-1.5 tabular-nums">
                          {formatINR(amountPerCycle)} / {unitLabel}
                        </div>
                      </div>
                    </div>

                    <div className="px-3 py-2 rounded-2xl bg-[#ffcf07] text-black text-center shrink-0">
                      <div className="text-sm font-bold leading-none tabular-nums">
                        {daysLeft > 60 ? Math.round(daysLeft / 30) : daysLeft}
                      </div>
                      <div className="text-[10px] font-semibold mt-0.5">
                        {daysLeft > 60 ? 'Months Left' : 'Days Left'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#121212] border border-white/5 text-xs">
                    <div>
                      <span className="text-neutral-400">Saved So Far</span>
                      <div className="text-sm font-bold text-[#46AA03] tabular-nums mt-0.5">
                        {formatINR(goal.amountSaved)}
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Pending Amount</span>
                      <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                        {formatINR(pending)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setTxGoalId(goal.id)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#ffcf07] text-black text-xs font-semibold flex items-center justify-center gap-1.5 hover:brightness-105 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Savings</span>
                    </button>
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-2.5 rounded-xl bg-[#121212] text-neutral-300 hover:text-white border border-white/10 cursor-pointer"
                      title="Edit Goal"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2.5 rounded-xl bg-[#121212] text-neutral-300 hover:text-red-400 border border-white/10 cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : completedGoals.length === 0 ? (
        <div className="bv-neu-secondary rounded-3xl p-10 text-center border border-white/5">
          <p className="text-base font-medium text-white">
            You Haven&apos;t Completed Any Goals Yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {completedGoals.map((goal) => (
            <div
              key={goal.id}
              className="bv-neu-primary rounded-3xl p-5 border border-[#46AA03]/30 flex items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#46AA03] shrink-0" />
                  <h3 className="text-lg font-semibold text-white truncate">
                    {goal.title}
                  </h3>
                </div>
                <p className="text-xs text-neutral-400">{goal.description}</p>
                <div className="text-base font-bold text-[#ffcf07] tabular-nums pt-1">
                  {formatINR(goal.goalAmount)}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="px-3.5 py-2.5 rounded-2xl bg-[#ffcf07] text-black text-xs font-semibold tabular-nums">
                  {formatDisplayDate(goal.completedDate || goal.targetDate)}
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-xs text-neutral-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveGoal}
            className="w-full max-w-md bg-[#181818] rounded-3xl p-6 border border-white/15 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h3>
              <button
                type="button"
                onClick={closeAddModal}
                className="p-1.5 rounded-xl bg-[#121212] text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Goal Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Europe Holiday or Emergency Fund"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Short Description
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why this goal matters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Target Amount (₹)
                </label>
                <input
                  required
                  type="number"
                  min={100}
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  placeholder="150000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Target Date
                </label>
                <input
                  required
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">
                Payment Cycle
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Weekly', 'Monthly', 'Yearly'] as GoalCycle[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCycle(c)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      cycle === c
                        ? 'bg-[#ffcf07] text-black border-[#ffcf07]'
                        : 'bg-[#121212] text-neutral-300 border-white/10'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#ffcf07] text-black font-semibold text-sm mt-2 cursor-pointer"
            >
              {editingGoal ? 'Update Goal' : 'Save Goal'}
            </button>
          </form>
        </div>
      )}

      {txGoal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-3xl p-6 border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{txGoal.title}</h3>
                <p className="text-xs text-neutral-400">
                  Remaining:{' '}
                  {formatINR(Math.max(0, txGoal.goalAmount - txGoal.amountSaved))}
                </p>
              </div>
              <button
                onClick={() => setTxGoalId(null)}
                className="p-1.5 rounded-xl bg-[#121212] text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Deposit Amount (₹)
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="Enter amount saved today"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Note (Optional)
                </label>
                <input
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  placeholder="e.g., Monthly SIP transfer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#ffcf07] text-black font-semibold text-sm cursor-pointer"
              >
                Record Contribution
              </button>
            </form>

            {txGoal.transactions.length > 0 && (
              <div className="pt-3 border-t border-white/10">
                <div className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5 mb-2">
                  <History className="w-3.5 h-3.5" />
                  <span>Recent Contributions</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {txGoal.transactions.map((tr) => (
                    <div
                      key={tr.id}
                      className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-[#121212]"
                    >
                      <span className="text-neutral-300">
                        {tr.note || 'Contribution'} • {formatDisplayDate(tr.date)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#46AA03] tabular-nums">
                          + {formatINR(tr.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteGoalTransaction(txGoal.id, tr.id)}
                          className="text-neutral-500 hover:text-red-400 p-0.5 cursor-pointer"
                          title="Delete contribution"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
