import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Filter,
  History,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { formatDisplayDate, formatINR } from '../utils/formatters';

interface FlattenedTransaction {
  goalId: string;
  goalTitle: string;
  isGoalCompleted: boolean;
  targetDate: string;
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export const GoalLedgerView: React.FC = () => {
  const {
    goals,
    addGoalTransaction,
    deleteGoalTransaction,
    totalGoalsTarget,
    totalGoalsSaved,
    activeGoalsCount,
    completedGoalsCount,
  } = useBrainVibe();

  const [selectedGoalId, setSelectedGoalId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState(
    goals.find((g) => !g.completed)?.id || goals[0]?.id || ''
  );
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');

  const activeGoals = goals.filter((g) => !g.completed);

  // Flatten all transactions across goals
  const allTransactions = useMemo<FlattenedTransaction[]>(() => {
    const list: FlattenedTransaction[] = [];
    goals.forEach((goal) => {
      goal.transactions.forEach((tx) => {
        list.push({
          goalId: goal.id,
          goalTitle: goal.title,
          isGoalCompleted: goal.completed,
          targetDate: goal.targetDate,
          id: tx.id,
          amount: tx.amount,
          date: tx.date,
          note: tx.note,
        });
      });
    });
    // Sort descending by date
    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [goals]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      if (selectedGoalId !== 'all' && tx.goalId !== selectedGoalId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesGoal = tx.goalTitle.toLowerCase().includes(q);
        const matchesNote = (tx.note || '').toLowerCase().includes(q);
        const matchesAmt = String(tx.amount).includes(q);
        if (!matchesGoal && !matchesNote && !matchesAmt) return false;
      }
      return true;
    });
  }, [allTransactions, selectedGoalId, searchQuery]);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(depositAmount);
    if (!depositGoalId || !Number.isFinite(amt) || amt <= 0) return;
    addGoalTransaction(depositGoalId, amt, depositNote.trim() || undefined);
    setDepositAmount('');
    setDepositNote('');
    setIsDepositModalOpen(false);
  };

  const overallProgress = Math.min(
    100,
    Math.round((totalGoalsSaved / Math.max(1, totalGoalsTarget)) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Contributions Ledger</span>
            <History className="w-5 h-5 text-[#ffcf07]" />
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Audit trail of every savings deposit, milestone transfer, and sweep towards your goals
          </p>
        </div>

        <button
          onClick={() => {
            if (activeGoals.length > 0) {
              setDepositGoalId(activeGoals[0].id);
            }
            setIsDepositModalOpen(true);
          }}
          disabled={activeGoals.length === 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#ffcf07] text-black font-semibold text-sm hover:brightness-105 transition disabled:opacity-40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Contribution</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bv-neu-secondary rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Saved</span>
            <TrendingUp className="w-4 h-4 text-[#46AA03]" />
          </div>
          <div className="text-xl font-bold text-[#46AA03] tabular-nums mt-1">
            {formatINR(totalGoalsSaved)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Across {goals.length} target milestones
          </p>
        </div>

        <div className="bv-neu-secondary rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Overall Target</span>
            <Target className="w-4 h-4 text-[#ffcf07]" />
          </div>
          <div className="text-xl font-bold text-white tabular-nums mt-1">
            {formatINR(totalGoalsTarget)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Remaining: {formatINR(Math.max(0, totalGoalsTarget - totalGoalsSaved))}
          </p>
        </div>

        <div className="bv-neu-secondary rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Contributions</span>
            <Calendar className="w-4 h-4 text-[#ffcf07]" />
          </div>
          <div className="text-xl font-bold text-[#ffcf07] tabular-nums mt-1">
            {allTransactions.length} Entries
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {activeGoalsCount} active, {completedGoalsCount} completed
          </p>
        </div>

        <div className="bv-neu-secondary rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Portfolio Pace</span>
            <span className="font-bold text-[#ffcf07]">{overallProgress}%</span>
          </div>
          <div className="w-full bg-[#121212] rounded-full h-2.5 overflow-hidden my-2 border border-white/5">
            <div
              className="bg-[#ffcf07] h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Funded</span>
            <span>{100 - overallProgress}% left</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bv-neu-secondary rounded-2xl p-3 border border-white/5 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by note, goal title, or amount..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121212] border border-white/10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffcf07]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-[#121212] border border-white/10 text-xs text-white focus:outline-none focus:border-[#ffcf07] cursor-pointer"
          >
            <option value="all">All Goals ({goals.length})</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title} {g.completed ? '✓' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table / List */}
      <div className="bv-neu-secondary rounded-3xl p-5 border border-white/5 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 px-2 pb-1 border-b border-white/5">
          <span>Date & Goal</span>
          <span>Contribution Amount</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <History className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-sm font-medium text-white">No contributions found</p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {searchQuery || selectedGoalId !== 'all'
                ? 'Try adjusting your search terms or filter selection.'
                : 'Tap "Record Contribution" above to log your first savings deposit.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121212] border border-white/5 hover:border-white/15 transition group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {tx.isGoalCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-[#46AA03]" />
                    ) : (
                      <Target className="w-5 h-5 text-[#ffcf07]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {tx.goalTitle}
                      </span>
                      {tx.isGoalCompleted && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#46AA03]/20 text-[#46AA03] font-semibold">
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>{formatDisplayDate(tx.date)}</span>
                      <span>•</span>
                      <span className="text-neutral-300 italic truncate">
                        {tx.note || 'Regular contribution'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-bold text-[#46AA03] tabular-nums">
                      + {formatINR(tx.amount)}
                    </div>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                      Deposited
                    </span>
                  </div>

                  <button
                    onClick={() => deleteGoalTransaction(tx.goalId, tx.id)}
                    className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-white/5 transition opacity-70 group-hover:opacity-100 cursor-pointer"
                    title="Remove contribution"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Contribution Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-3xl p-6 border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Record Contribution</h3>
                <p className="text-xs text-neutral-400">
                  Add a savings deposit directly to an active goal
                </p>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#121212] text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Select Goal
                </label>
                <select
                  required
                  value={depositGoalId}
                  onChange={(e) => setDepositGoalId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm text-white focus:outline-none focus:border-[#ffcf07] cursor-pointer"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} (Saved: {formatINR(g.amountSaved)} / {formatINR(g.goalAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Deposit Amount (₹)
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm text-white tabular-nums focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Contribution Note / Tag
                </label>
                <input
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  placeholder="e.g., SIP sweep, salary bonus, cashback"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#ffcf07] text-black font-semibold text-sm hover:brightness-105 cursor-pointer transition"
              >
                Record Contribution
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
