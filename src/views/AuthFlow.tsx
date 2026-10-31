import React from 'react';
import {
  Bot,
  Calendar,
  Lock,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { useBrainVibe } from '../context/BrainVibeContext';

export const AuthFlow: React.FC = () => {
  const { loginWithGoogle, isAuthLoading } = useBrainVibe();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 sm:p-10 max-w-lg mx-auto relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-[#ffcf07]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#ffcf07] text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-[#ffcf07]/20">
            <Target className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">Goal App</span>
        </div>
      </div>

      {/* Middle Hero */}
      <div className="my-auto py-10 space-y-8 z-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffcf07]/15 border border-[#ffcf07]/30 text-[#ffcf07] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 fill-[#ffcf07]" />
            <span>AI-Powered Financial Pacing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
            Save Smarter. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffcf07] via-amber-300 to-yellow-200">
              Reach Goals Faster.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-sm pt-1">
            Turn ambitious financial milestones into clear, automated daily and weekly savings plans with our Apple-inspired tracker.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-white/6 text-xs text-zinc-200">
            <Calendar className="w-4 h-4 text-[#ffcf07] shrink-0" />
            <span>Accurate calendar day calculations & pacing recommendations</span>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-white/6 text-xs text-zinc-200">
            <Bot className="w-4 h-4 text-[#ffcf07] shrink-0" />
            <span>BrainVibe AI answers questions & optimizes savings habits</span>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-white/6 text-xs text-zinc-200">
            <ShieldCheck className="w-4 h-4 text-[#ffcf07] shrink-0" />
            <span>Secure Cloud Firestore multi-device synchronization</span>
          </div>
        </div>
      </div>

      {/* Bottom Auth Buttons */}
      <div className="space-y-3 pt-6 z-10">
        {/* Google Sign-In Button */}
        <button
          onClick={loginWithGoogle}
          disabled={isAuthLoading}
          className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-sm transition-all duration-150 flex items-center justify-center gap-3 shadow-xl cursor-pointer disabled:opacity-50 active:scale-[0.99]"
        >
          {isAuthLoading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>Connecting to Google...</span>
            </div>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-zinc-500 text-center pt-2">
          Your personal data and goals are securely protected and isolated in Google Cloud.
        </p>
      </div>
    </div>
  );
};
