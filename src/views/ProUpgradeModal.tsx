import React, { useState } from 'react';
import {
  Check,
  Crown,
  Sparkles,
  X,
  Zap,
  ShieldCheck,
  Calendar,
  Bot,
  CreditCard,
  Lock,
  Database,
  EyeOff,
} from 'lucide-react';
import { useBrainVibe } from '../context/BrainVibeContext';

import { initiateSubscriptionCheckout } from '../services/paymentService';

export const ProUpgradeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, upgradeToPro, showToast } = useBrainVibe();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');

  const handleUpgrade = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProcessStatus('Preparing secure order...');

    await initiateSubscriptionCheckout({
      user,
      onStart: () => {
        setProcessStatus('Opening Razorpay Gateway...');
      },
      onSuccess: async (paymentId: string) => {
        setProcessStatus('Activating Premium...');
        await upgradeToPro(paymentId);
        showToast(`Payment successful (Ref: ${paymentId})! Premium Annual activated 🎉`, 'success');
        setIsProcessing(false);
        setProcessStatus('');
        onClose();
      },
      onError: (errMsg: string) => {
        setIsProcessing(false);
        setProcessStatus('');
        showToast(errMsg, 'error');
      },
      onCancel: () => {
        setIsProcessing(false);
        setProcessStatus('');
        showToast('Payment cancelled. You remain on the Free Plan.', 'info');
      },
    });
  };

  const PREMIUM_BENEFITS = [
    {
      icon: EyeOff,
      title: 'Completely Ad-Free Experience',
      desc: 'Zero promotional banners, sponsor placements, or interruptions across the entire app',
    },
    {
      icon: Bot,
      title: '100 AI Chat Messages per Month',
      desc: 'Actionable pacing advice, weekly savings calculations, and financial habit coaching',
    },
    {
      icon: Database,
      title: 'Personal Data Backup Access',
      desc: 'Full 1-click JSON data export and instant restore capability to keep your milestones secure',
    },
    {
      icon: Sparkles,
      title: 'Access to Premium Features without Ads',
      desc: 'Dynamic pacing recommendations, multi-device cloud sync, and priority milestone tracking',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-[430px] max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/12 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-40 h-40 bg-[#ffcf07]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-40 h-40 bg-[#ffcf07]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-10 h-10 rounded-2xl bg-[#ffcf07]/15 border border-[#ffcf07]/30 text-[#ffcf07] flex items-center justify-center mx-auto shadow-md shadow-[#ffcf07]/15">
            <Crown className="w-5 h-5 fill-[#ffcf07]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Upgrade to Premium
          </h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Unlock the ad-free experience, 100 monthly AI chats, and personal data backups
          </p>
        </div>

        {/* Compact Pricing Card (₹499/year) */}
        <div className="my-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#ffcf07]/15 via-zinc-900 to-zinc-950 border border-[#ffcf07]/80 relative shadow-md shadow-[#ffcf07]/10">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#ffcf07] text-zinc-950 uppercase tracking-wider">
              Special Annual Offer
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
              Save 58%
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2.5">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">
                ₹499 <span className="text-xs font-normal text-zinc-400">/year</span>
              </div>
              <div className="text-[11px] text-[#ffcf07] mt-0.5 font-medium">
                Just ₹41.50 per month • 1 full year access
              </div>
            </div>
            <span className="text-[11px] text-zinc-400">Renews annually</span>
          </div>
        </div>

        {/* Compact 2x2 Feature Highlights */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-2xl bg-zinc-900/60 border border-white/5">
          {PREMIUM_BENEFITS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-2 p-1.5">
                <div className="w-5 h-5 rounded-lg bg-[#ffcf07]/15 text-[#ffcf07] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-white leading-tight truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-zinc-400 leading-snug line-clamp-1 mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Razorpay Gateway Badge */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-zinc-900/70 border border-white/6 mb-3 text-[10px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#ffcf07]" />
            <span>Razorpay Secure 256-bit</span>
          </div>
          <span className="font-semibold text-white flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-[#ffcf07]" /> UPI / Cards / NetBanking
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleUpgrade}
          disabled={isProcessing}
          className="w-full py-3 rounded-2xl bg-[#ffcf07] hover:bg-yellow-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-[#ffcf07]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>{processStatus || 'Processing Secure Payment...'}</span>
            </span>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-zinc-950" />
              <span>Upgrade to Premium — ₹499/year</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-zinc-500 text-center mt-2">
          Automatic activation upon payment • 100% money-back guarantee within 7 days
        </p>
      </div>
    </div>
  );
};
