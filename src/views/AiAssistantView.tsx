import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Crown,
  HelpCircle,
  Lock,
  Send,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { ChatMessage, SubScreen } from '../types/models';
import { askAiSavingsAssistant } from '../services/aiService';

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
    recordAiMessageSent,
    openSubScreen,
  } = useBrainVibe();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello ${user.name ? user.name.split(' ')[0] : 'there'}! I'm **BrainVibe AI**, your personal savings coach.\n\nI can calculate your exact weekly savings pace, evaluate whether your goal targets are realistic, and suggest smart adjustments to help you finish months ahead of schedule.\n\nWhat would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || isTyping) return;

    if (!user.isPro && remainingAiMessages <= 0) {
      openSubScreen(SubScreen.ProUpgrade);
      return;
    }

    const canProceed = await recordAiMessageSent();
    if (!canProceed) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await askAiSavingsAssistant(
        text,
        user,
        goals,
        messages.map((m) => ({ role: m.role, content: m.content }))
      );

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered a temporary network delay. Please try again or tap one of the suggested prompts below.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-3xl mx-auto">
      {/* Clean Sleek Header Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/8 mb-3 px-1 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-zinc-950 flex items-center justify-center font-black shadow-md shadow-amber-500/10 shrink-0">
            <Sparkles className="w-5 h-5 text-zinc-950" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
              BrainVibe AI
            </h1>
            {user.isPro ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 flex items-center gap-1 shrink-0">
                <Crown className="w-3 h-3" /> PRO
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 shrink-0">
                Free
              </span>
            )}
          </div>
        </div>

        {/* Message limit counter / Pro upgrade pill */}
        <div className="shrink-0">
          {user.isPro ? (
            <div className="text-xs text-[#ffcf07] font-semibold px-3 py-1.5 rounded-full bg-[#ffcf07]/10 border border-[#ffcf07]/25 flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-[#ffcf07] text-[#ffcf07]" />
              <span>
                <strong className="text-white font-bold">{remainingAiMessages}</strong> / 100 monthly left
              </span>
            </div>
          ) : (
            <button
              onClick={() => openSubScreen(SubScreen.ProUpgrade)}
              className="group text-xs px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 hover:border-[#ffcf07]/40 transition cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${remainingAiMessages > 1 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="text-zinc-200 text-xs font-medium">
                  <strong className="text-white font-bold">{remainingAiMessages}</strong>/5 left today
                </span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#ffcf07] text-zinc-950 font-bold text-[10px] group-hover:bg-yellow-400 transition">
                Upgrade ₹499
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-4">
        {messages.map((msg) => {
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
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-500 text-zinc-950 font-medium rounded-tr-sm shadow-sm'
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
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-zinc-900 border border-white/8 rounded-2xl px-4 py-2.5 text-xs text-zinc-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1">Analyzing your goal pacing...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggested Prompts Pills */}
      <div className="pt-2 pb-2">
        <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-1.5 px-1 flex items-center justify-between">
          <span>Suggested Questions</span>
          {!user.isPro && remainingAiMessages <= 0 && (
            <span className="text-amber-400 text-xs normal-case font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" /> Daily limit reached
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={isTyping || (!user.isPro && remainingAiMessages <= 0)}
              className="text-xs px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/8 hover:border-white/15 text-zinc-300 hover:text-white transition whitespace-nowrap disabled:opacity-40 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

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
            !user.isPro && remainingAiMessages <= 0
              ? 'Daily free limit reached. Upgrade to Pro to continue...'
              : 'Ask anything about saving, pacing, or reaching your goal...'
          }
          disabled={!user.isPro && remainingAiMessages <= 0}
          className="flex-1 bg-zinc-900/90 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/80 transition disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!input.trim() || isTyping || (!user.isPro && remainingAiMessages <= 0)}
          className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold disabled:opacity-40 transition cursor-pointer shadow-md shadow-emerald-500/10 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
