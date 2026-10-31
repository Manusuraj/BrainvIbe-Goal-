import React, { useState } from 'react';
import {
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crown,
  PlusCircle,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';

interface TutorialStep {
  badge: string;
  title: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
  tip: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    badge: 'Step 1 of 6',
    title: 'Create Your Financial Goal',
    description:
      'Tap "Add Goal" anywhere to start a new savings milestone. Name your target (like Emergency Fund, Vacation, or MacBook) and pick a category.',
    icon: PlusCircle,
    accentColor: 'from-emerald-400 to-teal-500',
    tip: 'Starting with specific, named goals makes you 42% more likely to reach them.',
  },
  {
    badge: 'Step 2 of 6',
    title: 'Set Target Amount & Date',
    description:
      'Enter your desired savings amount in Rupees and select your completion deadline on the calendar. The app supports weekly, monthly, or yearly frequency cycles.',
    icon: Calendar,
    accentColor: 'from-blue-400 to-indigo-500',
    tip: 'Choose a realistic target date; the app dynamically computes your exact pace.',
  },
  {
    badge: 'Step 3 of 6',
    title: 'AI Savings Plan & Realism Check',
    description:
      'Whenever you adjust your target amount or date, our AI computes your required daily, weekly, and monthly savings and gives you an honest realism assessment.',
    icon: Sparkles,
    accentColor: 'from-amber-400 to-yellow-500',
    tip: 'Check the AI recommendation card before saving your goal to ensure it fits your budget.',
  },
  {
    badge: 'Step 4 of 6',
    title: 'Track Progress & Record Savings',
    description:
      'Tap "+ Add Savings" on any goal card whenever you put money aside. Watch your circular progress ring fill up and countdown your remaining installments.',
    icon: TrendingUp,
    accentColor: 'from-emerald-400 to-green-500',
    tip: 'Even micro-deposits of ₹500 build consistency and trigger milestone celebrations.',
  },
  {
    badge: 'Step 5 of 6',
    title: 'Consult BrainVibe AI Coach',
    description:
      'Open the BrainVibe AI tab anytime to chat with your financial coach. Ask how to cut unnecessary spending, accelerate your pace, or optimize your weekly budget.',
    icon: Bot,
    accentColor: 'from-amber-400 to-yellow-500',
    tip: 'Free accounts get 5 free AI queries daily, resetting every 24 hours.',
  },
  {
    badge: 'Step 6 of 6',
    title: 'Unlock Pro for Unlimited Growth',
    description:
      'Upgrade to Goal App Pro for unlimited AI conversations, advanced goal planning, multi-device cloud sync, and priority financial intelligence.',
    icon: Crown,
    accentColor: 'from-amber-400 to-orange-500',
    tip: 'You can revisit this guide anytime in Settings under "How to Use".',
  },
];

export const TutorialModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/12 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/8 text-zinc-300">
            {step.badge}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Graphic */}
        <div className="py-8 flex flex-col items-center text-center">
          <div
            className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${step.accentColor} text-zinc-950 flex items-center justify-center shadow-xl mb-6`}
          >
            <Icon className="w-10 h-10" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2.5">
            {step.title}
          </h3>

          <p className="text-sm text-zinc-300 leading-relaxed max-w-xs mx-auto">
            {step.description}
          </p>

          <div className="mt-6 p-3 rounded-2xl bg-zinc-900 border border-white/6 text-xs text-zinc-400 max-w-sm flex items-start gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 text-[#ffcf07] shrink-0 mt-0.5" />
            <span><strong className="text-zinc-200">Pro Tip:</strong> {step.tip}</span>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {TUTORIAL_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStep ? 'w-6 bg-white' : 'w-1.5 bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            disabled={currentStep === 0}
            className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-20 text-zinc-300 border border-white/5 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-[#ffcf07] hover:bg-yellow-400 text-zinc-950 font-bold text-sm transition shadow-lg shadow-[#ffcf07]/20 cursor-pointer"
            >
              Get Started with Goals
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep((p) => Math.min(TUTORIAL_STEPS.length - 1, p + 1))}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setCurrentStep((p) => Math.min(TUTORIAL_STEPS.length - 1, p + 1))}
            disabled={isLast}
            className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-20 text-zinc-300 border border-white/5 transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
