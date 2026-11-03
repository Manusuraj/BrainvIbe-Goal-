import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Clock,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { ChatMessage } from '../types/models';
import { askAiSavingsAssistant } from '../services/aiService';
import { formatHmsCountdown } from '../utils/formatters';

const SUGGESTED_QUESTIONS = [
  'How much should I save every week?',
  'Is my current savings plan realistic?',
  'How can I reach my goal faster?',
  'What changes should I make to my spending habits?',
  'How can I save more money every month?',
];

export const AiAssistantView: React.FC = () => {
  const {
    user,
    goals,
    remainingAiMessages,
    secondsUntilMidnight,
    recordAiMessageSent,
    refundAiMessage,
    chatHistory,
    addChatMessage,
    clearChatHistory,
  } = useBrainVibe();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live formatted countdown to next midnight
  const formattedCountdown = useMemo(() => {
    return formatHmsCountdown(secondsUntilMidnight);
  }, [secondsUntilMidnight]);

  const isLimitReached = remainingAiMessages <= 0;

  // Active messages list combining persistent history or default welcome
  const displayMessages = useMemo(() => {
    if (chatHistory.length > 0) {
      return chatHistory;
    }
    const welcomeMsg: ChatMessage = {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello ${user.name ? user.name.split(' ')[0] : 'there'}! I'm **BrainVibe AI**, your dedicated savings coach.\n\nI calculate exact weekly savings paces, evaluate deadline realism, and help you reach your goals faster.\n\nYou have **5 daily chat credits** available. What goal would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    return [welcomeMsg];
  }, [chatHistory, user.name]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || isTyping || isLimitReached) return;

    // Backend-enforced credit deduction
    const canProceed = await recordAiMessageSent();
    if (!canProceed) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
    };

    await addChatMessage(userMessage);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await askAiSavingsAssistant(
        text,
        user,
        goals,
        displayMessages.map((m) => ({ role: m.role, content: m.content }))
      );

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      };

      await addChatMessage(botMessage);
    } catch {
      // Failed requests should not consume a credit
      await refundAiMessage();

      const errorMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered a temporary connection issue. Your chat credit has been preserved. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      };
      await addChatMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto">
      {/* Clean Header Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/8 mb-3 px-1 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#ffcf07] text-zinc-950 flex items-center justify-center font-black shadow-md shadow-[#ffcf07]/20 shrink-0">
            <Sparkles className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
                BrainVibe AI
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                Savings Coach
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Pacing & habit intelligence</p>
          </div>
        </div>

        {/* Daily Chat Usage Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border flex items-center gap-2 shadow-sm transition-colors ${
              isLimitReached
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-zinc-900 border-white/10 text-zinc-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                remainingAiMessages > 2
                  ? 'bg-emerald-400'
                  : remainingAiMessages > 0
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            <span className="tabular-nums">
              Daily chats: <strong className="text-white">{remainingAiMessages}/5</strong> remaining
            </span>
          </div>

          {chatHistory.length > 0 && (
            <button
              onClick={clearChatHistory}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/8 transition cursor-pointer"
              title="Clear chat history"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-3">
        {displayMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isUser
                    ? 'bg-zinc-800 text-zinc-200 border border-white/10'
                    : 'bg-[#ffcf07]/15 border border-[#ffcf07]/30 text-[#ffcf07]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#ffcf07] text-zinc-950 font-medium rounded-tr-sm shadow-sm'
                    : 'bg-zinc-900/90 border border-white/8 text-zinc-200 rounded-tl-sm backdrop-blur'
                }`}
              >
                <div className="whitespace-pre-line space-y-2">
                  {msg.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    isUser ? 'text-zinc-800' : 'text-zinc-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ffcf07]/15 border border-[#ffcf07]/30 text-[#ffcf07] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-zinc-900 border border-white/8 rounded-2xl px-4 py-2.5 text-xs text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffcf07] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffcf07] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffcf07] animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-zinc-300">Analyzing goal pacing...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Daily Limit Exhausted Banner with Live Midnight Countdown */}
      {isLimitReached && (
        <div className="mb-3 p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 text-center space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-semibold">
            <Clock className="w-4 h-4" />
            <span>Daily chat limit reached</span>
          </div>
          <p className="text-xs text-zinc-300 max-w-md mx-auto">
            You've used all 5 chats for today. Your next set of chats will be available tomorrow.
          </p>

          <div className="pt-1">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
              Next chats available in
            </div>
            <div className="inline-block px-4 py-1.5 rounded-xl bg-zinc-950 border border-white/10 text-base sm:text-lg font-mono font-bold text-[#ffcf07] tracking-wider tabular-nums shadow-inner">
              {formattedCountdown}
            </div>
          </div>
        </div>
      )}

      {/* Suggested Questions (Visible when limit is not reached) */}
      {!isLimitReached && (
        <div className="pt-1 pb-2">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-1.5 px-1">
            Suggested Prompts
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={isTyping || isLimitReached}
                className="text-xs px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/8 hover:border-white/15 text-zinc-300 hover:text-white transition whitespace-nowrap disabled:opacity-40 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isLimitReached
              ? 'Daily limit of 5 reached. Resets at midnight...'
              : 'Ask anything about pacing, weekly savings, or reaching your goal...'
          }
          disabled={isLimitReached}
          className="flex-1 bg-zinc-900/90 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ffcf07] transition disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          disabled={!input.trim() || isTyping || isLimitReached}
          className="p-3 rounded-2xl bg-[#ffcf07] hover:bg-yellow-400 text-zinc-950 font-bold disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-md shadow-[#ffcf07]/15 shrink-0 active:scale-95"
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
};
