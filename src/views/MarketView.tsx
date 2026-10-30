import React, { useState } from 'react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { CryptoCoin } from '../types/models';
import { formatINR } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Coins,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  RefreshCw
} from 'lucide-react';

interface GlobalIndexItem {
  symbol: string;
  name: string;
  country: string;
  value: number;
  change: number;
}

const GLOBAL_INDICES_DATA: GlobalIndexItem[] = [
  { symbol: 'NIFTY 50', name: 'Nifty 50', country: 'India', value: 24350.2, change: 0.85 },
  { symbol: 'SENSEX', name: 'BSE Sensex', country: 'India', value: 79950.4, change: 0.78 },
  { symbol: 'BANKNIFTY', name: 'Nifty Bank', country: 'India', value: 51820.6, change: 1.12 },
  { symbol: 'NASDAQ', name: 'Nasdaq Composite', country: 'United States', value: 18518.6, change: 1.45 },
  { symbol: 'S&P 500', name: 'S&P 500 Index', country: 'United States', value: 5815.2, change: 0.65 },
  { symbol: 'FTSE 100', name: 'FTSE 100', country: 'United Kingdom', value: 8240.1, change: -0.32 },
  { symbol: 'NIKKEI 225', name: 'Nikkei 225', country: 'Japan', value: 38980.5, change: -0.55 },
];

export const MarketView: React.FC = () => {
  const { cryptoCoins, isCryptoLoading, refreshCrypto } = useBrainVibe();
  const [activeTab, setActiveTab] = useState<'indices' | 'crypto' | 'stocks'>('indices');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockCategory, setStockCategory] = useState<'Gainers' | 'Losers' | 'MostActive'>('Gainers');

  // Indian stocks data
  const sampleStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2984.4, change: 2.14, volume: '8.4M' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3950.0, change: 1.45, volume: '3.1M' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1680.2, change: -0.85, volume: '14.2M' },
    { symbol: 'INFY', name: 'Infosys Limited', price: 1720.5, change: 1.88, volume: '6.8M' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1245.0, change: 0.95, volume: '9.3M' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 980.6, change: -2.35, volume: '11.5M' },
    { symbol: 'SBIN', name: 'State Bank of India', price: 825.1, change: -1.15, volume: '16.7M' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1640.0, change: 3.25, volume: '7.9M' },
    { symbol: 'LT', name: 'Larsen & Toubro', price: 3580.0, change: -0.45, volume: '2.4M' }
  ];

  const filteredCrypto = cryptoCoins.filter(
    (c: CryptoCoin) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStocks = sampleStocks.filter(s => {
    const matchesSearch =
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (stockCategory === 'Gainers') return matchesSearch && s.change > 0;
    if (stockCategory === 'Losers') return matchesSearch && s.change < 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Market Watch</span>
            <span className="w-2 h-2 rounded-full bg-[#46AA03] animate-pulse" />
          </h1>
          <p className="text-sm text-neutral-400">Global indices, Indian equities, and live INR Crypto spot</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full bg-[#181818] border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffcf07]"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab('indices')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'indices' ? 'text-[#ffcf07]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Global Indices</span>
          {activeTab === 'indices' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffcf07] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('crypto')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'crypto' ? 'text-[#ffcf07]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Crypto (INR)</span>
          {activeTab === 'crypto' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffcf07] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('stocks')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'stocks' ? 'text-[#ffcf07]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Indian Equities</span>
          {activeTab === 'stocks' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffcf07] rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Global Indices */}
      {activeTab === 'indices' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GLOBAL_INDICES_DATA.map((item: GlobalIndexItem) => {
            const isPos = item.change >= 0;
            return (
              <div
                key={item.symbol}
                className="bg-[#181818] border border-white/5 hover:border-white/15 rounded-2xl p-5 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#ffcf07] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-neutral-500">{item.country}</p>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-400">
                    {item.symbol}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-4 pt-3 border-t border-white/5">
                  <span className="text-xl font-mono font-bold text-white">
                    {item.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                      isPos ? 'bg-[#46AA03]/10 text-[#46AA03]' : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span>
                      {isPos ? '+' : ''}
                      {item.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Crypto */}
      {activeTab === 'crypto' && (
        <div className="bg-[#181818] border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between text-xs text-neutral-400">
            <span>Live cryptocurrency valuation in Indian Rupees (INR)</span>
            <button
              onClick={() => refreshCrypto()}
              disabled={isCryptoLoading}
              className="flex items-center gap-1 text-neutral-400 hover:text-[#ffcf07] cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isCryptoLoading ? 'animate-spin' : ''}`} />
              <span>{isCryptoLoading ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-neutral-400 bg-white/[0.02]">
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Price (INR)</th>
                  <th className="py-3 px-4">24h Change</th>
                  <th className="py-3 px-4 text-right">Market Cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredCrypto.map((coin: CryptoCoin) => {
                  const isPos = coin.change24h >= 0;
                  return (
                    <tr key={coin.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#ffcf07]/10 border border-[#ffcf07]/20 flex items-center justify-center font-bold text-xs text-[#ffcf07]">
                            {coin.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <p className="font-bold text-white">{coin.name}</p>
                            <p className="text-[10px] text-neutral-400 uppercase font-mono">{coin.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-white">{formatINR(coin.priceInr)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] ${
                            isPos ? 'bg-[#46AA03]/10 text-[#46AA03]' : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {isPos ? '+' : ''}
                          {coin.change24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-neutral-400 font-mono">
                        {coin.marketCapInr ? formatINR(coin.marketCapInr, 0) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Indian Equities */}
      {activeTab === 'stocks' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {(['Gainers', 'Losers', 'MostActive'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setStockCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  stockCategory === cat
                    ? 'bg-[#ffcf07] text-black font-bold'
                    : 'bg-[#181818] text-neutral-400 hover:text-white border border-white/5'
                }`}
              >
                {cat === 'Gainers' ? 'Top Gainers' : cat === 'Losers' ? 'Top Losers' : 'Most Active'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStocks.map(stock => {
              const isPos = stock.change >= 0;
              return (
                <div
                  key={stock.symbol}
                  className="bg-[#181818] border border-white/5 hover:border-white/15 rounded-2xl p-5 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{stock.symbol}</span>
                    <span
                      className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                        isPos ? 'bg-[#46AA03]/10 text-[#46AA03]' : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {isPos ? '+' : ''}
                      {stock.change}%
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 mb-4">{stock.name}</p>

                  <div className="flex items-baseline justify-between pt-3 border-t border-white/5 text-xs">
                    <span className="text-lg font-mono font-bold text-white">{formatINR(stock.price)}</span>
                    <span className="text-[11px] text-neutral-500 font-mono">Vol: {stock.volume}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
