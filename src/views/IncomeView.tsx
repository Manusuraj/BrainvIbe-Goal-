import React, { useState } from 'react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { BankAccount, IncomeCategoryName, IncomeItem, RepeatCycle } from '../types/models';
import { assetUrl, formatINR, formatReadableDate } from '../utils/formatters';
import { POPULAR_BANKS } from '../constants/brainvibeData';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  Wallet,
  Landmark,
  X,
  Briefcase
} from 'lucide-react';

export const IncomeView: React.FC = () => {
  const {
    banks,
    incomes,
    totalBankBalance,
    totalOtherIncome,
    addBank,
    updateBank,
    deleteBank,
    addIncome,
    updateIncome,
    deleteIncome
  } = useBrainVibe();

  const [activeTab, setActiveTab] = useState<'banks' | 'income'>('banks');

  // Bank Modal State
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [bankName, setBankName] = useState(POPULAR_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('');

  // Income Modal State
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);
  const [incomeTitle, setIncomeTitle] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeRepeat, setIncomeRepeat] = useState<RepeatCycle>('Monthly');
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategoryName>('Salary');
  const [incomeMode, setIncomeMode] = useState<'cash' | 'bank'>('bank');
  const [incomeBankId, setIncomeBankId] = useState(banks[0]?.id || '');

  // Bank submission
  const handleOpenBankModal = (bank?: BankAccount) => {
    if (bank) {
      setEditingBank(bank);
      setBankName(bank.bankName);
      setAccountNumber(bank.accountNumber);
      setBalance(bank.balance.toString());
    } else {
      setEditingBank(null);
      setBankName(POPULAR_BANKS[0].name);
      setAccountNumber('');
      setBalance('');
    }
    setShowBankModal(true);
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBankInfo = POPULAR_BANKS.find(b => b.name === bankName) || POPULAR_BANKS[0];
    const balanceNum = parseFloat(balance) || 0;

    if (editingBank) {
      updateBank(editingBank.id, {
        bankName,
        accountNumber: accountNumber.slice(-4) || 'XXXX',
        balance: balanceNum,
        logoPath: selectedBankInfo.logo
      });
    } else {
      addBank({
        bankName,
        accountNumber: accountNumber.slice(-4) || 'XXXX',
        balance: balanceNum,
        logoPath: selectedBankInfo.logo
      });
    }
    setShowBankModal(false);
  };

  // Income submission
  const handleOpenIncomeModal = (item?: IncomeItem) => {
    if (item) {
      setEditingIncome(item);
      setIncomeTitle(item.title);
      setIncomeAmount(item.amount.toString());
      setIncomeRepeat(item.repeat);
      setIncomeCategory(item.category);
      setIncomeMode(item.mode);
      setIncomeBankId(item.bankId || banks[0]?.id || '');
    } else {
      setEditingIncome(null);
      setIncomeTitle('');
      setIncomeAmount('');
      setIncomeRepeat('Monthly');
      setIncomeCategory('Salary');
      setIncomeMode('bank');
      setIncomeBankId(banks[0]?.id || '');
    }
    setShowIncomeModal(true);
  };

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(incomeAmount) || 0;
    if (!incomeTitle || amountNum <= 0) return;

    if (editingIncome) {
      updateIncome(editingIncome.id, {
        title: incomeTitle,
        amount: amountNum,
        repeat: incomeRepeat,
        category: incomeCategory,
        mode: incomeMode,
        bankId: incomeMode === 'bank' ? incomeBankId : undefined
      });
    } else {
      addIncome({
        title: incomeTitle,
        amount: amountNum,
        category: incomeCategory,
        date: new Date().toISOString(),
        repeat: incomeRepeat,
        mode: incomeMode,
        bankId: incomeMode === 'bank' ? incomeBankId : undefined
      });
    }
    setShowIncomeModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Income & Bank Accounts</span>
          </h1>
          <p className="text-sm text-neutral-400">Track liquid cash, deposits, and income inflows</p>
        </div>

        <button
          onClick={() => (activeTab === 'banks' ? handleOpenBankModal() : handleOpenIncomeModal())}
          className="flex items-center gap-2 bg-[#ffcf07] text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e6bb06] transition-all cursor-pointer shadow-lg shadow-[#ffcf07]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'banks' ? 'Add Bank Account' : 'Add Income Source'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Total Bank Balance</span>
            <Landmark className="w-4 h-4 text-[#ffcf07]" />
          </div>
          <p className="text-2xl font-extrabold text-white">{formatINR(totalBankBalance)}</p>
          <div className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
            <span className="text-[#46AA03] font-semibold">{banks.length} Connected accounts</span>
            <span>across Indian banking networks</span>
          </div>
        </div>

        <div className="bg-[#181818] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Total Active Income Sources</span>
            <TrendingUp className="w-4 h-4 text-[#46AA03]" />
          </div>
          <p className="text-2xl font-extrabold text-white">{formatINR(totalOtherIncome)}</p>
          <div className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
            <span className="text-white font-semibold">{incomes.length} Streams</span>
            <span>salary, trading yields, business profits</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab('banks')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'banks' ? 'text-[#ffcf07]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Bank Accounts ({banks.length})</span>
          {activeTab === 'banks' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffcf07] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'income' ? 'text-[#ffcf07]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Income Streams ({incomes.length})</span>
          {activeTab === 'income' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffcf07] rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Bank Accounts */}
      {activeTab === 'banks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banks.map(bank => (
            <div
              key={bank.id}
              className="bg-[#181818] border border-white/5 hover:border-white/15 rounded-2xl p-5 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1.5 shadow-md">
                      <img
                        src={assetUrl(bank.logoPath)}
                        alt={bank.bankName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{bank.bankName}</h3>
                      <p className="text-[11px] text-neutral-400">
                        •••• {bank.accountNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenBankModal(bank)}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBank(bank.id)}
                      className="p-1.5 hover:bg-rose-500/20 rounded-lg text-neutral-400 hover:text-rose-400 cursor-pointer"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <p className="text-[11px] text-neutral-400">Available Balance</p>
                  <p className="text-xl font-bold text-white mt-0.5">{formatINR(bank.balance)}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500">
                <span>Verified Net Banking</span>
                <span className="text-[#46AA03]">Active</span>
              </div>
            </div>
          ))}

          {/* Add Bank Card Placeholder */}
          <div
            onClick={() => handleOpenBankModal()}
            className="border-2 border-dashed border-white/10 hover:border-[#ffcf07]/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[170px] transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-[#ffcf07]/20 flex items-center justify-center text-neutral-400 group-hover:text-[#ffcf07] mb-2 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-white">Add Bank Account</p>
            <p className="text-xs text-neutral-500 mt-0.5">HDFC, SBI, ICICI, Axis or Other</p>
          </div>
        </div>
      )}

      {/* Tab 2: Income Sources */}
      {activeTab === 'income' && (
        <div className="space-y-3">
          {incomes.map(item => (
            <div
              key={item.id}
              className="bg-[#181818] border border-white/5 hover:border-white/15 rounded-2xl p-4 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#46AA03]/10 border border-[#46AA03]/20 flex items-center justify-center text-[#46AA03]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                    <span className="text-[#ffcf07]">{item.category}</span>
                    <span>•</span>
                    <span>{item.repeat}</span>
                    <span>•</span>
                    <span className="capitalize">{item.mode}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-base font-bold text-white flex items-center justify-end gap-1">
                    <span className="text-[#46AA03]">+</span>
                    {formatINR(item.amount)}
                  </p>
                  <p className="text-[10px] text-neutral-500 uppercase font-medium">{item.repeat}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenIncomeModal(item)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteIncome(item.id)}
                    className="p-1.5 hover:bg-rose-500/20 rounded-lg text-neutral-400 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {incomes.length === 0 && (
            <div className="bg-[#181818] border border-white/5 rounded-2xl p-10 text-center">
              <Wallet className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
              <p className="text-white font-medium">No income sources added yet</p>
              <p className="text-xs text-neutral-500 mt-1">Add your salary, business, or trading income</p>
            </div>
          )}
        </div>
      )}

      {/* Bank Account Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowBankModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">
              {editingBank ? 'Edit Bank Account' : 'Add Bank Account'}
            </h2>
            <p className="text-xs text-neutral-400 mb-6">Enter bank and current available liquid balance</p>

            <form onSubmit={handleSaveBank} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Select Bank</label>
                <select
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                >
                  {POPULAR_BANKS.map(b => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Account Number (Last 4 Digits)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 4821"
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Current Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                  placeholder="e.g. 150000"
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#ffcf07] hover:bg-[#e6bb06] cursor-pointer shadow-lg shadow-[#ffcf07]/20"
                >
                  {editingBank ? 'Save Changes' : 'Connect Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowIncomeModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">
              {editingIncome ? 'Edit Income Source' : 'Add Income Source'}
            </h2>
            <p className="text-xs text-neutral-400 mb-6">Log incoming regular or irregular cashflow</p>

            <form onSubmit={handleSaveIncome} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Source Title</label>
                <input
                  type="text"
                  value={incomeTitle}
                  onChange={e => setIncomeTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer Salary"
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Category</label>
                  <select
                    value={incomeCategory}
                    onChange={e => setIncomeCategory(e.target.value as IncomeCategoryName)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                  >
                    <option value="Salary">Salary</option>
                    <option value="Business">Business</option>
                    <option value="Trading">Trading</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Repeat Cycle</label>
                  <select
                    value={incomeRepeat}
                    onChange={e => setIncomeRepeat(e.target.value as RepeatCycle)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="None">None (One-time)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeAmount}
                  onChange={e => setIncomeAmount(e.target.value)}
                  placeholder="e.g. 125000"
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Mode</label>
                  <select
                    value={incomeMode}
                    onChange={e => setIncomeMode(e.target.value as 'cash' | 'bank')}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                  >
                    <option value="bank">Direct to Bank</option>
                    <option value="cash">Liquid Cash</option>
                  </select>
                </div>

                {incomeMode === 'bank' && (
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Target Bank</label>
                    <select
                      value={incomeBankId}
                      onChange={e => setIncomeBankId(e.target.value)}
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
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#ffcf07] hover:bg-[#e6bb06] cursor-pointer shadow-lg shadow-[#ffcf07]/20"
                >
                  {editingIncome ? 'Save Changes' : 'Record Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
