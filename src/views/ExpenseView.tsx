import React, { useState } from 'react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { ExpenseItem, ExpenseCategoryName } from '../types/models';
import { formatINR, formatReadableDate, assetUrl } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../constants/brainvibeData';
import {
  Plus,
  Trash2,
  Edit2,
  TrendingDown,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  X,
  Receipt,
  MoreHorizontal
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CATEGORY_NAMES = Object.keys(EXPENSE_CATEGORIES) as ExpenseCategoryName[];

export const ExpenseView: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, banks, creditCards } = useBrainVibe();
  const [activeTab, setActiveTab] = useState<'tracker' | 'reports'>('tracker');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategoryName>('Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank' | 'Credit Card'>('Bank');
  const [sourceId, setSourceId] = useState('');

  const handleOpenModal = (expense?: ExpenseItem) => {
    if (expense) {
      setEditingExpense(expense);
      setTitle(expense.title);
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDate(expense.date.split('T')[0]);
      setPaymentMode(expense.paymentMode);
      setSourceId(expense.sourceId || '');
    } else {
      setEditingExpense(null);
      setTitle('');
      setAmount('');
      setCategory('Dining');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMode('Bank');
      setSourceId(banks[0]?.id || '');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount) || 0;
    if (!title || amountNum <= 0) return;

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        title,
        amount: amountNum,
        category,
        date: new Date(date).toISOString(),
        paymentMode,
        sourceId: paymentMode !== 'Cash' ? sourceId : undefined
      });
    } else {
      addExpense({
        title,
        amount: amountNum,
        category,
        date: new Date(date).toISOString(),
        paymentMode,
        sourceId: paymentMode !== 'Cash' ? sourceId : undefined
      });
    }
    setShowModal(false);
  };

  const filteredExpenses = expenses.filter(item => {
    if (selectedCategoryFilter === 'All') return true;
    return item.category === selectedCategoryFilter;
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by day of week for the weekly bar chart
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals: { [key: string]: number } = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  expenses.forEach(e => {
    const d = new Date(e.date);
    const day = daysOfWeek[d.getDay()];
    dayTotals[day] = (dayTotals[day] || 0) + e.amount;
  });

  const weeklyChartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    amount: dayTotals[day] || 0
  }));

  // Category breakdown data
  const categoryData = CATEGORY_NAMES.map(catKey => {
    const sum = expenses
      .filter(e => e.category === catKey)
      .reduce((s, e) => s + e.amount, 0);
    return {
      name: catKey,
      value: sum,
      color: EXPENSE_CATEGORIES[catKey].color
    };
  }).filter(c => c.value > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Expenses</span>
          </h1>
          <p className="text-sm text-neutral-400">Track outgoings, categorization, and spending velocity</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#ffcf07] text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e6bb06] transition-all cursor-pointer shadow-lg shadow-[#ffcf07]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Top Banner KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Total Logged Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white">{formatINR(totalExpense)}</p>
          <p className="text-[11px] text-neutral-500 mt-1">{expenses.length} Total transactions recorded</p>
        </div>

        <div className="bg-[#181818] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Top Outflow Category</span>
            <PieChartIcon className="w-4 h-4 text-[#ffcf07]" />
          </div>
          <p className="text-2xl font-black text-[#ffcf07]">
            {categoryData.length > 0 ? [...categoryData].sort((a, b) => b.value - a.value)[0].name : 'None'}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            {categoryData.length > 0
              ? formatINR([...categoryData].sort((a, b) => b.value - a.value)[0].value)
              : '₹0'}
          </p>
        </div>

        <div className="bg-[#181818] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Daily Average</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {formatINR(totalExpense > 0 ? Math.round(totalExpense / 30) : 0)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Standardized 30-day run rate</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'tracker' ? 'text-[#ffcf07]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Expense Tracker</span>
          {activeTab === 'tracker' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffcf07] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'reports' ? 'text-[#ffcf07]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visual Reports & Breakdown</span>
          {activeTab === 'reports' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffcf07] rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Tracker */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategoryFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategoryFilter === 'All'
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#181818] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              All Categories
            </button>
            {CATEGORY_NAMES.map(catKey => {
              const isSelected = selectedCategoryFilter === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategoryFilter(catKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#ffcf07] text-black font-bold'
                      : 'bg-[#181818] text-neutral-400 hover:text-white border border-white/5'
                  }`}
                >
                  {catKey}
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="space-y-2.5">
            {filteredExpenses.map(item => {
              const catMeta = EXPENSE_CATEGORIES[item.category] || EXPENSE_CATEGORIES.Others;
              const color = catMeta.color;
              return (
                <div
                  key={item.id}
                  className="bg-[#181818] border border-white/5 hover:border-white/15 rounded-2xl p-4 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 p-2"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <img
                        src={assetUrl(catMeta.icon)}
                        alt={item.category}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#ffcf07] transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                        <span style={{ color }}>{item.category}</span>
                        <span>•</span>
                        <span>{item.paymentMode}</span>
                        <span>•</span>
                        <span>{formatReadableDate(item.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-base font-bold text-white">-{formatINR(item.amount)}</p>
                      <span className="text-[10px] text-neutral-500 uppercase">{item.paymentMode}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteExpense(item.id)}
                        className="p-1.5 hover:bg-rose-500/20 rounded-lg text-neutral-400 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredExpenses.length === 0 && (
              <div className="bg-[#181818] border border-white/5 rounded-2xl p-10 text-center">
                <Receipt className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                <p className="text-white font-medium">No expenses found for this category</p>
                <p className="text-xs text-neutral-500 mt-1">Tap 'Add Expense' above to record a transaction</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Reports */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Outflow Chart */}
          <div className="bg-[#181818] border border-white/5 rounded-3xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Weekly Day-wise Spend</h3>
            <p className="text-xs text-neutral-400 mb-6">Aggregate outflows across the 7 days of the week</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData}>
                  <XAxis dataKey="day" stroke="#666" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#666"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={val => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#121212] border border-white/10 p-2.5 rounded-xl shadow-xl">
                            <p className="text-xs text-neutral-400">{payload[0].payload.day}</p>
                            <p className="text-sm font-bold text-[#ffcf07]">{formatINR(payload[0].value as number)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" fill="#ffcf07" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Donut & List */}
          <div className="bg-[#181818] border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Category Distribution</h3>
              <p className="text-xs text-neutral-400 mb-4">Percentage allocation of total expenditure</p>

              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categoryData.map(entry => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          const pct = totalExpense > 0 ? ((data.value as number) / totalExpense) * 100 : 0;
                          return (
                            <div className="bg-[#121212] border border-white/10 p-2.5 rounded-xl shadow-xl">
                              <p className="text-xs text-neutral-400">{data.name}</p>
                              <p className="text-sm font-bold text-white">{formatINR(data.value as number)}</p>
                              <p className="text-xs text-[#ffcf07]">{pct.toFixed(1)}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-neutral-400 uppercase">Total</span>
                  <span className="text-sm font-extrabold text-white">{formatINR(totalExpense)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 max-h-36 overflow-y-auto no-scrollbar">
              {categoryData.map(item => {
                const pct = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(0) : '0';
                return (
                  <div key={item.name} className="flex items-center justify-between bg-black/20 p-2 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-neutral-300 truncate max-w-[80px]">{item.name}</span>
                    </div>
                    <span className="text-white font-semibold">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">
              {editingExpense ? 'Edit Expense' : 'Record New Expense'}
            </h2>
            <p className="text-xs text-neutral-400 mb-6">Enter transaction details and category</p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Expense Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Swiggy Dinner / Grocery Run"
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="e.g. 850"
                    required
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategoryName)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                  >
                    {CATEGORY_NAMES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value as any)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                  >
                    <option value="Bank">Bank Account / UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              {paymentMode === 'Bank' && (
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Bank Source</label>
                  <select
                    value={sourceId}
                    onChange={e => setSourceId(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                  >
                    {banks.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} (•• {b.accountNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {paymentMode === 'Credit Card' && (
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Card Source</label>
                  <select
                    value={sourceId}
                    onChange={e => setSourceId(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                  >
                    {creditCards.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.bankIssuer} (•••• {c.cardNumber.slice(-4)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#ffcf07] hover:bg-[#e6bb06] cursor-pointer shadow-lg shadow-[#ffcf07]/20"
                >
                  {editingExpense ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
