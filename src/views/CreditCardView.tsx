import React, { useState } from 'react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { CreditCardItem } from '../types/models';
import { formatINR, formatReadableDate } from '../utils/formatters';
import { CARD_GRADIENTS } from '../constants/brainvibeData';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';

export const CreditCardView: React.FC = () => {
  const {
    creditCards,
    banks,
    totalCreditDue,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    payCreditCardBill
  } = useBrainVibe();

  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardItem | null>(null);

  // Card form state
  const [bankIssuer, setBankIssuer] = useState('HDFC Bank');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [creditLimit, setCreditLimit] = useState('100000');
  const [outstandingAmount, setOutstandingAmount] = useState('15000');
  const [openDate, setOpenDate] = useState(new Date().toISOString().split('T')[0]);

  // Pay bill modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingCard, setPayingCard] = useState<CreditCardItem | null>(null);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payError, setPayError] = useState<string | null>(null);

  const handleOpenCardModal = (card?: CreditCardItem) => {
    if (card) {
      setEditingCard(card);
      setBankIssuer(card.bankIssuer);
      setCardHolderName(card.cardHolderName);
      setCardNumber(card.cardNumber);
      setCreditLimit(card.creditLimit.toString());
      setOutstandingAmount(card.outstandingAmount.toString());
      setOpenDate(card.openDate ? card.openDate.split('T')[0] : '');
    } else {
      setEditingCard(null);
      setBankIssuer('HDFC Bank');
      setCardHolderName('Aryan Sharma');
      setCardNumber('4532890123456789');
      setCreditLimit('100000');
      setOutstandingAmount('15000');
      setOpenDate(new Date().toISOString().split('T')[0]);
    }
    setShowCardModal(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(creditLimit) || 0;
    const dueNum = parseFloat(outstandingAmount) || 0;

    if (editingCard) {
      updateCreditCard(editingCard.id, {
        bankIssuer,
        cardHolderName,
        cardNumber,
        creditLimit: limitNum,
        outstandingAmount: dueNum,
        openDate: new Date(openDate).toISOString()
      });
    } else {
      addCreditCard({
        bankIssuer,
        cardHolderName,
        cardNumber,
        creditLimit: limitNum,
        outstandingAmount: dueNum,
        openDate: new Date(openDate).toISOString()
      });
    }
    setShowCardModal(false);
  };

  const handleOpenPayModal = (card: CreditCardItem) => {
    setPayingCard(card);
    setPayAmount(card.outstandingAmount.toString());
    setSelectedBankId(banks[0]?.id || '');
    setPayError(null);
    setShowPayModal(true);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingCard || !selectedBankId) return;
    const amountNum = parseFloat(payAmount) || 0;
    if (amountNum <= 0) return;

    const bank = banks.find(b => b.id === selectedBankId);
    if (!bank || bank.balance < amountNum) {
      setPayError('Insufficient bank balance in selected account.');
      return;
    }

    const success = payCreditCardBill(payingCard.id, selectedBankId, amountNum);
    if (success) {
      setShowPayModal(false);
    }
  };

  const totalLimit = creditCards.reduce((s, c) => s + c.creditLimit, 0);
  const overallUtilization = totalLimit > 0 ? (totalCreditDue / totalLimit) * 100 : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Credit Cards</span>
          </h1>
          <p className="text-sm text-neutral-400">Manage limits, billing cycles, and utilization</p>
        </div>

        <button
          onClick={() => handleOpenCardModal()}
          className="flex items-center gap-2 bg-[#ffcf07] text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e6bb06] transition-all cursor-pointer shadow-lg shadow-[#ffcf07]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Credit Card</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-5">
          <p className="text-xs text-neutral-400 mb-1">Total Outstanding</p>
          <p className="text-2xl font-black text-rose-400">{formatINR(totalCreditDue)}</p>
          <p className="text-[11px] text-neutral-500 mt-1">Due across {creditCards.length} cards</p>
        </div>

        <div className="bg-[#181818] border border-white/5 rounded-2xl p-5">
          <p className="text-xs text-neutral-400 mb-1">Total Credit Line</p>
          <p className="text-2xl font-black text-white">{formatINR(totalLimit)}</p>
          <p className="text-[11px] text-neutral-500 mt-1">Available: {formatINR(totalLimit - totalCreditDue)}</p>
        </div>

        <div className="bg-[#181818] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Overall Utilization</span>
            <span
              className={`font-bold ${
                overallUtilization < 30
                  ? 'text-[#46AA03]'
                  : overallUtilization < 60
                  ? 'text-[#ffcf07]'
                  : 'text-rose-400'
              }`}
            >
              {overallUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all duration-500 ${
                overallUtilization < 30
                  ? 'bg-[#46AA03]'
                  : overallUtilization < 60
                  ? 'bg-[#ffcf07]'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, overallUtilization)}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            {overallUtilization < 30
              ? 'Safe (<30% recommended)'
              : overallUtilization < 60
              ? 'Moderate utilization'
              : 'High utilization: consider partial repayment'}
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditCards.map(card => {
          const utilPct = card.creditLimit > 0 ? (card.outstandingAmount / card.creditLimit) * 100 : 0;
          const bgGradient = CARD_GRADIENTS[card.gradientIndex % CARD_GRADIENTS.length] || CARD_GRADIENTS[0];

          return (
            <div key={card.id} className="space-y-3">
              {/* Metallic Card */}
              <div
                className="w-full aspect-[1.586] rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-white/10"
                style={{ background: bgGradient }}
              >
                {/* Decorative background elements */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-black/30 rounded-full blur-xl pointer-events-none" />

                {/* Top Row: Bank Name and Network */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-white">
                    {card.bankIssuer}
                  </span>
                  <div className="text-xs font-black tracking-widest text-[#ffcf07] uppercase bg-black/40 px-2 py-0.5 rounded">
                    {card.network}
                  </div>
                </div>

                {/* EMV Chip and Contactless Symbol */}
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-200 border border-amber-500/50 flex items-center justify-center shadow-inner">
                    <div className="w-8 h-5 border border-amber-700/40 rounded flex items-center justify-center">
                      <div className="w-4 h-full border-x border-amber-700/30" />
                    </div>
                  </div>
                  <span className="text-white/60 text-xs font-mono font-bold tracking-tight">)))</span>
                </div>

                {/* Masked Card Number */}
                <div className="font-mono text-base sm:text-lg tracking-[0.2em] text-white/95 relative z-10">
                  •••• •••• •••• {card.cardNumber.slice(-4)}
                </div>

                {/* Bottom Row: Card Holder & Open Date */}
                <div className="flex items-end justify-between relative z-10 text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/70 block">CARD HOLDER</span>
                    <span className="font-semibold text-white tracking-wider uppercase">{card.cardHolderName}</span>
                  </div>
                  {card.openDate && (
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-white/70 block">ACTIVE SINCE</span>
                      <span className="font-mono text-white/90 font-semibold">
                        {formatReadableDate(card.openDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Meta & Actions Card */}
              <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Outstanding Due:</span>
                  <span className="font-bold text-rose-400">{formatINR(card.outstandingAmount)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Total Credit Limit:</span>
                  <span className="text-neutral-300">{formatINR(card.creditLimit)}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-neutral-500">Utilization</span>
                    <span
                      className={`font-semibold ${
                        utilPct < 30 ? 'text-[#46AA03]' : utilPct < 60 ? 'text-[#ffcf07]' : 'text-rose-400'
                      }`}
                    >
                      {utilPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        utilPct < 30 ? 'bg-[#46AA03]' : utilPct < 60 ? 'bg-[#ffcf07]' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, utilPct)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenPayModal(card)}
                    className="flex-1 bg-[#ffcf07] hover:bg-[#e6bb06] text-black text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-[#ffcf07]/10"
                  >
                    <span>Pay Bill</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenCardModal(card)}
                    className="p-2 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white cursor-pointer"
                    title="Edit card"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteCreditCard(card.id)}
                    className="p-2 hover:bg-rose-500/20 rounded-xl text-neutral-400 hover:text-rose-400 cursor-pointer"
                    title="Delete card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {creditCards.length === 0 && (
          <div className="col-span-full bg-[#181818] border border-white/5 rounded-3xl p-12 text-center">
            <CreditCard className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-white font-bold text-base">No credit cards added</h3>
            <p className="text-xs text-neutral-400 mt-1 mb-4">
              Add your Visa, Mastercard or RuPay cards to keep track of limits and bills
            </p>
            <button
              onClick={() => handleOpenCardModal()}
              className="bg-[#ffcf07] text-black px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#e6bb06] transition-colors cursor-pointer"
            >
              Add First Card
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCardModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">
              {editingCard ? 'Edit Credit Card' : 'Add Credit Card'}
            </h2>
            <p className="text-xs text-neutral-400 mb-6">Enter card specifications and credit line</p>

            <form onSubmit={handleSaveCard} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Card Issuer Bank</label>
                <input
                  type="text"
                  value={bankIssuer}
                  onChange={e => setBankIssuer(e.target.value)}
                  placeholder="e.g. HDFC Bank, SBI Card, ICICI Bank"
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Cardholder Name</label>
                <input
                  type="text"
                  value={cardHolderName}
                  onChange={e => setCardHolderName(e.target.value)}
                  placeholder="e.g. Aryan Sharma"
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Card Number (16 Digits)</label>
                <input
                  type="text"
                  maxLength={19}
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 4532890123456789"
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Credit Limit (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    value={creditLimit}
                    onChange={e => setCreditLimit(e.target.value)}
                    placeholder="e.g. 250000"
                    required
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Current Due (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={outstandingAmount}
                    onChange={e => setOutstandingAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    required
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Open Date</label>
                <input
                  type="date"
                  value={openDate}
                  onChange={e => setOpenDate(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#ffcf07] hover:bg-[#e6bb06] cursor-pointer shadow-lg shadow-[#ffcf07]/20"
                >
                  {editingCard ? 'Save Changes' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Bill Modal */}
      {showPayModal && payingCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">Pay Credit Card Bill</h2>
            <p className="text-xs text-neutral-400 mb-6">
              Settling {payingCard.bankIssuer} (•••• {payingCard.cardNumber.slice(-4)})
            </p>

            {payError && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{payError}</span>
              </div>
            )}

            <form onSubmit={handleExecutePayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Debit from Bank Account</label>
                <select
                  value={selectedBankId}
                  onChange={e => setSelectedBankId(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                >
                  {banks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} (•••• {b.accountNumber}) — Avail: {formatINR(b.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-300">Payment Amount (₹)</label>
                  <button
                    type="button"
                    onClick={() => setPayAmount(payingCard.outstandingAmount.toString())}
                    className="text-[11px] text-[#ffcf07] hover:underline cursor-pointer"
                  >
                    Pay Full Due ({formatINR(payingCard.outstandingAmount)})
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Current Outstanding:</span>
                  <span className="text-white">{formatINR(payingCard.outstandingAmount)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>After Payment:</span>
                  <span className="text-[#46AA03] font-semibold">
                    {formatINR(Math.max(0, payingCard.outstandingAmount - (parseFloat(payAmount) || 0)))}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#ffcf07] hover:bg-[#e6bb06] cursor-pointer shadow-lg shadow-[#ffcf07]/20"
                >
                  Confirm & Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
