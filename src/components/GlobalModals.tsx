import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Crown,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { MainTab, SubScreen } from '../types/models';
import { assetUrl, formatReadableDate } from '../utils/formatters';

export const GlobalModals: React.FC = () => {
  const {
    isStoriesOpen,
    setIsStoriesOpen,
    stories,
    openSubScreen,
    setActiveTab,
    comingSoonFeature,
    closeComingSoon,
    activeArticle,
    setActiveArticle,
    bookmarkedIds,
    toggleBookmark,
    user,
  } = useBrainVibe();

  const [storyIdx, setStoryIdx] = useState(0);

  useEffect(() => {
    if (!isStoriesOpen) {
      setStoryIdx(0);
      return;
    }
    const timer = window.setInterval(() => {
      setStoryIdx((prev) => {
        if (prev + 1 >= stories.length) {
          setIsStoriesOpen(false);
          return 0;
        }
        return prev + 1;
      });
    }, 5500);
    return () => window.clearInterval(timer);
  }, [isStoriesOpen, setIsStoriesOpen, stories.length]);

  const currentStory = stories[storyIdx] || stories[0];

  return (
    <>
      {isStoriesOpen && currentStory && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#181818] rounded-3xl border border-white/15 overflow-hidden shadow-2xl">
            <div className="flex gap-1.5 px-4 pt-4">
              {stories.map((st, idx) => (
                <div
                  key={st.id}
                  className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden"
                >
                  <div
                    className={`h-full bg-[#ffcf07] transition-all duration-300 ${
                      idx <= storyIdx ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={assetUrl('bv.png')}
                  alt="BrainVibe"
                  className="w-8 h-8 rounded-full bg-[#121212] p-1"
                />
                <div>
                  <div className="text-sm font-semibold">BrainVibe Stories</div>
                  <div className="text-[11px] text-neutral-400">
                    Daily Wealth Bite {storyIdx + 1} of {stories.length}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsStoriesOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-4 flex flex-col items-center text-center">
              <div className="w-full h-64 rounded-2xl bg-[#121212] flex items-center justify-center p-3 overflow-hidden border border-white/5">
                <img
                  src={assetUrl(currentStory.imagePath)}
                  alt={currentStory.title}
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
              </div>
              <h3 className="text-lg font-bold mt-5 text-white">
                {currentStory.title}
              </h3>
              <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                {currentStory.caption}
              </p>

              <div className="mt-6 w-full flex items-center justify-between gap-3">
                <button
                  onClick={() => setStoryIdx((i) => Math.max(0, i - 1))}
                  disabled={storyIdx === 0}
                  className="p-2.5 rounded-xl bg-[#121212] disabled:opacity-35 hover:bg-white/10 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {currentStory.ctaLabel && (
                  <button
                    onClick={() => {
                      setIsStoriesOpen(false);
                      if (
                        currentStory.targetScreen &&
                        currentStory.targetScreen !== SubScreen.None
                      ) {
                        openSubScreen(currentStory.targetScreen);
                      } else {
                        setActiveTab(MainTab.Insights);
                      }
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#ffcf07] text-black font-semibold text-sm hover:brightness-105 cursor-pointer"
                  >
                    {currentStory.ctaLabel}
                  </button>
                )}

                <button
                  onClick={() => {
                    if (storyIdx + 1 >= stories.length) {
                      setIsStoriesOpen(false);
                    } else {
                      setStoryIdx((i) => i + 1);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-[#121212] hover:bg-white/10 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {comingSoonFeature && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bv-neu-secondary rounded-3xl p-6 border border-white/10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#ffcf07]/15 text-[#ffcf07] flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mt-4">{comingSoonFeature.title}</h3>
            <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
              {comingSoonFeature.description}
            </p>
            <div className="mt-4 px-3 py-2 rounded-xl bg-[#121212] text-xs text-[#ffcf07] inline-block font-medium">
              Coming Soon in BrainVibe Automated Integrations
            </div>
            <div className="mt-6">
              <button
                onClick={closeComingSoon}
                className="w-full py-3 rounded-xl bg-[#ffcf07] text-black font-semibold text-sm cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[88vh] flex flex-col bg-[#181818] rounded-3xl border border-white/15 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="px-2.5 py-1 rounded-lg bg-[#121212] text-[#ffcf07] font-semibold uppercase">
                  {activeArticle.category}
                </span>
                <span>{activeArticle.source}</span>
                <span>•</span>
                <span>{formatReadableDate(activeArticle.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(activeArticle.id)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    bookmarkedIds.includes(activeArticle.id)
                      ? 'bg-[#ffcf07] text-black border-[#ffcf07]'
                      : 'bg-[#121212] text-neutral-300 border-white/10 hover:text-white'
                  }`}
                  title="Bookmark article"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-2 rounded-xl bg-[#121212] text-neutral-300 hover:text-white border border-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold leading-snug text-white">
                {activeArticle.title}
              </h2>
              <p className="text-sm text-[#ffcf07]/90 font-medium leading-relaxed">
                {activeArticle.description}
              </p>

              {activeArticle.isProOnly && !user.isPro ? (
                <div className="mt-6 bv-neu-primary rounded-2xl p-6 border border-[#ffcf07]/30 text-center">
                  <Crown className="w-9 h-9 text-[#ffcf07] mx-auto" />
                  <h4 className="text-lg font-bold mt-3">
                    BrainVibe Pro Exclusive Deep-Dive
                  </h4>
                  <p className="text-sm text-neutral-300 mt-1.5 max-w-md mx-auto">
                    Upgrade to BrainVibe Pro to unlock institutional position
                    sizing research, portfolio risk diagnostics, and ad-free
                    briefings.
                  </p>
                  <button
                    onClick={() => {
                      setActiveArticle(null);
                      openSubScreen(SubScreen.PaymentOffers);
                    }}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-[#ffcf07] text-black font-semibold text-sm cursor-pointer"
                  >
                    View Pro Plans
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-sm sm:text-base text-neutral-200 leading-relaxed whitespace-pre-line pt-2 border-t border-white/10">
                  {activeArticle.content}
                </div>
              )}

              {activeArticle.url && (
                <div className="pt-4">
                  <a
                    href={activeArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ffcf07] hover:underline"
                  >
                    <span>Read original publisher dispatch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
