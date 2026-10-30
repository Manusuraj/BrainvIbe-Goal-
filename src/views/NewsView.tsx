import React, { useState } from 'react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { NewsArticle, SubScreen } from '../types/models';
import { Search, Bookmark, BookmarkCheck, ExternalLink, Sparkles, TrendingUp, Filter } from 'lucide-react';
import { formatReadableDate, assetUrl } from '../utils/formatters';

export const NewsView: React.FC = () => {
  const {
    newsArticles,
    bookmarkedIds,
    toggleBookmark,
    setActiveArticle,
    user,
    openSubScreen,
  } = useBrainVibe();

  const [activeCategory, setActiveCategory] = useState<'all' | 'top' | 'business' | 'technology' | 'pro'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = newsArticles.filter((item: NewsArticle) => {
    const matchesCategory =
      activeCategory === 'all'
        ? true
        : activeCategory === 'pro'
        ? item.isProOnly || item.category === 'pro'
        : item.category === activeCategory;

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const trendingArticles = newsArticles.slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>News & Articles</span>
            <span className="text-xs bg-[#ffcf07]/20 text-[#ffcf07] px-2 py-0.5 rounded-full font-medium">
              Live Feed
            </span>
          </h1>
          <p className="text-sm text-neutral-400">Curated Indian & global financial intelligence</p>
        </div>

        {/* Pro Banner Pill */}
        {!user.isPro && (
          <button
            onClick={() => openSubScreen(SubScreen.PaymentOffers)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-[#ffcf07]/40 text-[#ffcf07] px-4 py-2 rounded-xl text-xs font-semibold hover:border-[#ffcf07] transition-all cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-[#ffcf07]" />
            <span>Unlock BrainVibe Pro Insights</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search news by company, keyword, or source..."
          className="w-full bg-[#181818] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffcf07]/50"
        />
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(['all', 'top', 'business', 'technology', 'pro'] as const).map((tab) => {
          const isActive = activeCategory === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer capitalize ${
                isActive
                  ? 'bg-[#ffcf07] text-black shadow-lg shadow-[#ffcf07]/20'
                  : 'bg-[#181818] text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              {tab === 'pro' && <Sparkles className="w-3.5 h-3.5" />}
              {tab === 'all' ? 'All Stories' : tab}
            </button>
          );
        })}
      </div>

      {/* Trending Carousel */}
      {activeCategory === 'all' && !searchQuery && (
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
            <TrendingUp className="w-4 h-4 text-[#ffcf07]" />
            <span>Trending Stories</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingArticles.map((article: NewsArticle) => (
              <div
                key={`trending-${article.id}`}
                onClick={() => setActiveArticle(article)}
                className="bg-[#181818] border border-white/5 hover:border-white/15 rounded-2xl overflow-hidden cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div className="relative h-36 overflow-hidden bg-neutral-900">
                  <img
                    src={article.imageUrl || assetUrl('NEWS.svg')}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-[10px] uppercase font-bold text-[#ffcf07] px-2 py-0.5 rounded-md">
                    {article.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[#ffcf07] transition-colors mb-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-white/5">
                    <span>{article.source}</span>
                    <span>{formatReadableDate(article.publishedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-400 font-medium px-1">
          <span>{filteredNews.length} articles found</span>
          <span>Updated continuously</span>
        </div>

        {filteredNews.length === 0 ? (
          <div className="bg-[#181818] border border-white/5 rounded-2xl p-12 text-center">
            <Filter className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-white font-medium">No articles matching your criteria</p>
            <p className="text-xs text-neutral-400 mt-1">Try clearing search or picking another category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredNews.map((article: NewsArticle) => {
              const isBookmarked = bookmarkedIds.includes(article.id);
              return (
                <div
                  key={article.id}
                  className={`bg-[#181818] border rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row gap-4 items-start ${
                    article.isProOnly
                      ? 'border-[#ffcf07]/30 bg-gradient-to-br from-[#181818] to-amber-950/20'
                      : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <div
                    onClick={() => setActiveArticle(article)}
                    className="w-full sm:w-44 h-32 rounded-xl overflow-hidden shrink-0 cursor-pointer relative bg-neutral-900"
                  >
                    <img
                      src={article.imageUrl || assetUrl('NEWS.svg')}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {article.isProOnly && (
                      <div className="absolute top-2 left-2 bg-[#ffcf07] text-black font-extrabold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3" /> PRO
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full flex flex-col justify-between min-h-[128px]">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffcf07]">
                            {article.category}
                          </span>
                          <span className="text-neutral-600 text-xs">•</span>
                          <span className="text-xs text-neutral-400">{article.source}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(article.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-[#ffcf07] transition-colors cursor-pointer"
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-[#ffcf07]" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <h2
                        onClick={() => setActiveArticle(article)}
                        className="text-base font-bold text-white hover:text-[#ffcf07] transition-colors cursor-pointer mb-1.5 line-clamp-2"
                      >
                        {article.title}
                      </h2>

                      <p
                        onClick={() => setActiveArticle(article)}
                        className="text-xs text-neutral-400 line-clamp-2 cursor-pointer mb-2"
                      >
                        {article.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-neutral-500">
                      <span>Published {formatReadableDate(article.publishedAt)}</span>
                      <button
                        onClick={() => setActiveArticle(article)}
                        className="text-[#ffcf07] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>Read article</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
