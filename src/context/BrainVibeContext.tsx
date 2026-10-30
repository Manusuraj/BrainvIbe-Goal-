import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CURATED_NEWS_ARTICLES,
  FALLBACK_CRYPTO_INR,
  INITIAL_BANKS,
  INITIAL_CREDIT_CARDS,
  INITIAL_EXPENSES,
  INITIAL_GOALS,
  INITIAL_INCOMES,
  INITIAL_NOTIFICATIONS,
  INITIAL_STORIES,
  INITIAL_TRADE_FUNDS,
  INITIAL_TRADE_LOGS,
  INITIAL_USER_PROFILE,
} from '../constants/brainvibeData';
import {
  AuthStage,
  BankAccount,
  CreditCardItem,
  CryptoCoin,
  ExpenseItem,
  GoalItem,
  IncomeItem,
  MainTab,
  NetworthPoint,
  NewsArticle,
  NotificationItem,
  StorySlide,
  SubScreen,
  ToastMessage,
  TradeFundItem,
  TradeLogItem,
  UserProfile,
  GoalPreferences,
} from '../types/models';
import {
  computeDaysLeft,
  daysAgoIso,
  detectCardNetwork,
  getCycleDays,
  todayIso,
} from '../utils/formatters';

const STORAGE_KEY = 'brainvibe_react_state_v1';

export const DEFAULT_GOAL_PREFERENCES: GoalPreferences = {
  defaultCycle: 'Monthly',
  autoCalculatePace: true,
  milestoneReminders: true,
  overdueAlerts: true,
  currency: 'INR',
  notifications: true,
  biometrics: true,
};

interface PersistedState {
  authStage: AuthStage;
  user: UserProfile;
  banks: BankAccount[];
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  goals: GoalItem[];
  goalPreferences: GoalPreferences;
  creditCards: CreditCardItem[];
  tradeFunds: TradeFundItem[];
  tradeLogs: TradeLogItem[];
  bookmarkedIds: string[];
  notifications: NotificationItem[];
}

export interface TradeSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  netFund: number;
  intradayProfit: number;
  intradayLoss: number;
  swingProfit: number;
  swingLoss: number;
  netPnL: number;
  currentBalance: number;
  returnPct: number;
}

interface BrainVibeContextValue {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  subScreen: SubScreen;
  openSubScreen: (screen: SubScreen) => void;
  closeSubScreen: () => void;

  isStoriesOpen: boolean;
  setIsStoriesOpen: (open: boolean) => void;
  comingSoonFeature: { title: string; description: string } | null;
  openComingSoon: (title: string, description: string) => void;
  closeComingSoon: () => void;
  activeArticle: NewsArticle | null;
  setActiveArticle: (article: NewsArticle | null) => void;

  authStage: AuthStage;
  setAuthStage: (stage: AuthStage) => void;
  pendingPhone: string;
  setPendingPhone: (phone: string) => void;
  user: UserProfile;
  updateUser: (patch: Partial<UserProfile>) => void;
  lockWithQpin: () => void;
  logoutToOnboarding: () => void;
  loginDemoAccount: () => void;
  resetDemoData: () => void;

  banks: BankAccount[];
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  goals: GoalItem[];
  creditCards: CreditCardItem[];
  tradeFunds: TradeFundItem[];
  tradeLogs: TradeLogItem[];
  stories: StorySlide[];
  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;

  totalBankBalance: number;
  totalOtherIncome: number;
  totalIncomeCombined: number;
  totalExpenses: number;
  totalCreditDue: number;
  totalNetworth: number;
  networthSeries: NetworthPoint[];
  tradeSummary: TradeSummary;

  addBank: (payload: Omit<BankAccount, 'id' | 'updatedAt'>) => void;
  updateBank: (id: string, patch: Partial<BankAccount>) => void;
  deleteBank: (id: string) => void;

  addIncome: (payload: Omit<IncomeItem, 'id'>) => void;
  updateIncome: (id: string, patch: Partial<IncomeItem>) => void;
  deleteIncome: (id: string) => void;

  addExpense: (payload: Omit<ExpenseItem, 'id'>) => void;
  updateExpense: (id: string, patch: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;

  addGoal: (
    payload: Omit<
      GoalItem,
      'id' | 'amountSaved' | 'createdAt' | 'completed' | 'transactions'
    >
  ) => boolean;
  updateGoal: (id: string, patch: Partial<GoalItem>) => boolean;
  deleteGoal: (id: string) => void;
  addGoalTransaction: (goalId: string, amount: number, note?: string) => void;
  deleteGoalTransaction: (goalId: string, txId: string) => void;
  isAddGoalModalOpen: boolean;
  setIsAddGoalModalOpen: (open: boolean) => void;
  openAddGoalModal: () => void;
  totalGoalsTarget: number;
  totalGoalsSaved: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  goalPreferences: GoalPreferences;
  updateGoalPreferences: (patch: Partial<GoalPreferences>) => void;
  exportGoalsData: () => void;
  importGoalsData: (jsonStr: string) => boolean;

  addCreditCard: (
    payload: Omit<CreditCardItem, 'id' | 'network' | 'gradientIndex'>
  ) => boolean;
  updateCreditCard: (id: string, patch: Partial<CreditCardItem>) => void;
  deleteCreditCard: (id: string) => void;
  payCreditCardBill: (cardId: string, bankId: string, amount: number) => boolean;

  addTradeFund: (payload: Omit<TradeFundItem, 'id'>) => boolean;
  deleteTradeFund: (id: string) => void;
  addTradeLog: (payload: Omit<TradeLogItem, 'id'>) => boolean;
  deleteTradeLog: (id: string) => void;
  resetTradebook: () => void;

  newsArticles: NewsArticle[];
  bookmarkedIds: string[];
  toggleBookmark: (articleId: string) => void;
  cryptoCoins: CryptoCoin[];
  isCryptoLoading: boolean;
  refreshCrypto: () => Promise<void>;

  claimReferralReward: (friendCodeOrName?: string) => void;
  activatePlanPreview: (plan: UserProfile['planName']) => void;

  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const BrainVibeContext = createContext<BrainVibeContextValue | null>(null);

function getInitialPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (parsed && parsed.user && Array.isArray(parsed.banks)) {
        return {
          authStage: parsed.authStage ?? AuthStage.Authenticated,
          user: { ...INITIAL_USER_PROFILE, ...parsed.user },
          banks: parsed.banks,
          incomes: parsed.incomes ?? INITIAL_INCOMES,
          expenses: parsed.expenses ?? INITIAL_EXPENSES,
          goals: parsed.goals ?? INITIAL_GOALS,
          goalPreferences: parsed.goalPreferences ?? DEFAULT_GOAL_PREFERENCES,
          creditCards: parsed.creditCards ?? INITIAL_CREDIT_CARDS,
          tradeFunds: parsed.tradeFunds ?? INITIAL_TRADE_FUNDS,
          tradeLogs: parsed.tradeLogs ?? INITIAL_TRADE_LOGS,
          bookmarkedIds: parsed.bookmarkedIds ?? ['pro-art-1'],
          notifications: parsed.notifications ?? INITIAL_NOTIFICATIONS,
        };
      }
    }
  } catch {
    // fallback
  }

  return {
    authStage: AuthStage.Authenticated,
    user: INITIAL_USER_PROFILE,
    banks: INITIAL_BANKS,
    incomes: INITIAL_INCOMES,
    expenses: INITIAL_EXPENSES,
    goals: INITIAL_GOALS,
    goalPreferences: DEFAULT_GOAL_PREFERENCES,
    creditCards: INITIAL_CREDIT_CARDS,
    tradeFunds: INITIAL_TRADE_FUNDS,
    tradeLogs: INITIAL_TRADE_LOGS,
    bookmarkedIds: ['pro-art-1'],
    notifications: INITIAL_NOTIFICATIONS,
  };
}

export const BrainVibeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [persisted, setPersisted] = useState<PersistedState>(
    getInitialPersistedState
  );
  const [activeTab, setActiveTabState] = useState<MainTab>(MainTab.Goals);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [subScreen, setSubScreen] = useState<SubScreen>(SubScreen.None);
  const [pendingPhone, setPendingPhone] = useState<string>(
    INITIAL_USER_PROFILE.phoneNumber
  );

  const [isStoriesOpen, setIsStoriesOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  const [newsArticles, setNewsArticles] =
    useState<NewsArticle[]>(CURATED_NEWS_ARTICLES);
  const [cryptoCoins, setCryptoCoins] =
    useState<CryptoCoin[]>(FALLBACK_CRYPTO_INR);
  const [isCryptoLoading, setIsCryptoLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // ignore
    }
  }, [persisted]);

  const showToast = useCallback(
    (message: string, type: ToastMessage['type'] = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setActiveTab = useCallback((tab: MainTab) => {
    setActiveTabState(tab);
    setSubScreen(SubScreen.None);
  }, []);

  const openSubScreen = useCallback((screen: SubScreen) => {
    setSubScreen(screen);
  }, []);

  const closeSubScreen = useCallback(() => {
    setSubScreen(SubScreen.None);
  }, []);

  const openComingSoon = useCallback((title: string, description: string) => {
    setComingSoonFeature({ title, description });
  }, []);

  const closeComingSoon = useCallback(() => {
    setComingSoonFeature(null);
  }, []);

  const refreshCrypto = useCallback(async () => {
    setIsCryptoLoading(true);
    try {
      const ids =
        'bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,polkadot,chainlink,litecoin';
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (res.ok) {
        const data = (await res.json()) as Array<{
          id: string;
          name: string;
          symbol: string;
          current_price: number;
          price_change_percentage_24h: number;
          market_cap?: number;
        }>;
        if (Array.isArray(data) && data.length > 0) {
          setCryptoCoins(
            data.map((c) => ({
              id: c.id,
              name: c.name,
              symbol: c.symbol.toUpperCase(),
              priceInr: Number(c.current_price) || 0,
              change24h: Number(c.price_change_percentage_24h) || 0,
              marketCapInr: c.market_cap,
            }))
          );
        }
      }
    } catch {
      // retain fallback
    } finally {
      setIsCryptoLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCrypto();
    const apiKey = import.meta.env.VITE_NEWSDATA_API_KEY;
    if (!apiKey) return;
    (async () => {
      try {
        const res = await fetch(
          `https://newsdata.io/api/1/news?apikey=${encodeURIComponent(
            apiKey
          )}&country=in&language=en&category=business,technology`
        );
        if (!res.ok) return;
        const json = await res.json();
        if (Array.isArray(json?.results) && json.results.length > 0) {
          const fetched: NewsArticle[] = json.results
            .slice(0, 8)
            .map((item: Record<string, unknown>, idx: number) => ({
              id: `live-news-${idx}`,
              title: String(item.title || 'Market Update'),
              description: String(
                item.description || 'Tap to read full financial briefing.'
              ),
              content: String(
                item.content ||
                  item.description ||
                  'Full story available from publisher.'
              ),
              source: String(item.source_id || 'India Wire'),
              publishedAt: String(item.pubDate || todayIso()).slice(0, 10),
              category:
                Array.isArray(item.category) &&
                item.category.includes('technology')
                  ? 'technology'
                  : idx % 2 === 0
                  ? 'top'
                  : 'business',
              imageUrl:
                typeof item.image_url === 'string' ? item.image_url : undefined,
              url: typeof item.link === 'string' ? item.link : undefined,
            }));
          setNewsArticles([
            ...CURATED_NEWS_ARTICLES.filter((a) => a.category === 'pro'),
            ...fetched,
          ]);
        }
      } catch {
        // retain
      }
    })();
  }, [refreshCrypto]);

  const setAuthStage = useCallback((stage: AuthStage) => {
    setPersisted((prev) => ({ ...prev, authStage: stage }));
  }, []);

  const updateUser = useCallback(
    (patch: Partial<UserProfile>) => {
      setPersisted((prev) => ({
        ...prev,
        user: { ...prev.user, ...patch },
      }));
      showToast('Profile updated', 'success');
    },
    [showToast]
  );

  const lockWithQpin = useCallback(() => {
    setSubScreen(SubScreen.None);
    setPersisted((prev) => ({ ...prev, authStage: AuthStage.UnlockQpin }));
  }, []);

  const logoutToOnboarding = useCallback(() => {
    setSubScreen(SubScreen.None);
    setActiveTabState(MainTab.Home);
    setPersisted((prev) => ({ ...prev, authStage: AuthStage.Onboarding }));
  }, []);

  const loginDemoAccount = useCallback(() => {
    setPersisted((prev) => ({
      ...prev,
      authStage: AuthStage.Authenticated,
    }));
    showToast('Signed in to BrainVibe', 'success');
  }, [showToast]);

  const resetDemoData = useCallback(() => {
    const fresh: PersistedState = {
      authStage: AuthStage.Authenticated,
      user: INITIAL_USER_PROFILE,
      banks: INITIAL_BANKS,
      incomes: INITIAL_INCOMES,
      expenses: INITIAL_EXPENSES,
      goals: INITIAL_GOALS,
      goalPreferences: DEFAULT_GOAL_PREFERENCES,
      creditCards: INITIAL_CREDIT_CARDS,
      tradeFunds: INITIAL_TRADE_FUNDS,
      tradeLogs: INITIAL_TRADE_LOGS,
      bookmarkedIds: ['pro-art-1'],
      notifications: INITIAL_NOTIFICATIONS,
    };
    setPersisted(fresh);
    setSubScreen(SubScreen.None);
    setActiveTabState(MainTab.Goals);
    showToast('Demo goals & settings restored', 'success');
  }, [showToast]);

  const markAllNotificationsRead = useCallback(() => {
    setPersisted((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const totalBankBalance = useMemo(
    () => persisted.banks.reduce((sum, b) => sum + b.balance, 0),
    [persisted.banks]
  );

  const totalOtherIncome = useMemo(
    () => persisted.incomes.reduce((sum, i) => sum + i.amount, 0),
    [persisted.incomes]
  );

  const totalIncomeCombined = useMemo(
    () => totalBankBalance + totalOtherIncome,
    [totalBankBalance, totalOtherIncome]
  );

  const totalExpenses = useMemo(
    () => persisted.expenses.reduce((sum, e) => sum + e.amount, 0),
    [persisted.expenses]
  );

  const totalCreditDue = useMemo(
    () =>
      persisted.creditCards.reduce((sum, c) => sum + c.outstandingAmount, 0),
    [persisted.creditCards]
  );

  const totalNetworth = useMemo(
    () => totalBankBalance + totalOtherIncome - totalExpenses,
    [totalBankBalance, totalOtherIncome, totalExpenses]
  );

  const tradeSummary = useMemo<TradeSummary>(() => {
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    for (const f of persisted.tradeFunds) {
      if (f.type === 'deposit') totalDeposits += f.amount;
      else totalWithdrawals += f.amount;
    }
    const netFund = Math.max(0, totalDeposits - totalWithdrawals);

    let intradayProfit = 0;
    let intradayLoss = 0;
    let swingProfit = 0;
    let swingLoss = 0;

    for (const t of persisted.tradeLogs) {
      if (t.segment === 'intraday') {
        if (t.result === 'profit') intradayProfit += t.amount;
        else intradayLoss += t.amount;
      } else {
        if (t.result === 'profit') swingProfit += t.amount;
        else swingLoss += t.amount;
      }
    }

    const netPnL =
      intradayProfit + swingProfit - (intradayLoss + swingLoss);
    const currentBalance = netFund + netPnL;
    const returnPct = netFund > 0 ? (netPnL / netFund) * 100 : 0;

    return {
      totalDeposits,
      totalWithdrawals,
      netFund,
      intradayProfit,
      intradayLoss,
      swingProfit,
      swingLoss,
      netPnL,
      currentBalance,
      returnPct,
    };
  }, [persisted.tradeFunds, persisted.tradeLogs]);

  const networthSeries = useMemo<NetworthPoint[]>(() => {
    const base = Math.max(0, totalNetworth);
    const factors = [0.81, 0.85, 0.84, 0.89, 0.93, 0.97, 1.0];
    const labels = ['6M', '5M', '4M', '3M', '2M', '1M', 'Now'];
    return factors.map((f, idx) => ({
      label: labels[idx],
      date: daysAgoIso((6 - idx) * 30),
      value: Math.round(base * f),
    }));
  }, [totalNetworth]);

  const addBank = useCallback(
    (payload: Omit<BankAccount, 'id' | 'updatedAt'>) => {
      const item: BankAccount = {
        ...payload,
        id: `bank-${Date.now()}`,
        updatedAt: todayIso(),
      };
      setPersisted((prev) => ({ ...prev, banks: [item, ...prev.banks] }));
      showToast(`${payload.bankName} account added`, 'success');
    },
    [showToast]
  );

  const updateBank = useCallback(
    (id: string, patch: Partial<BankAccount>) => {
      setPersisted((prev) => ({
        ...prev,
        banks: prev.banks.map((b) =>
          b.id === id ? { ...b, ...patch, updatedAt: todayIso() } : b
        ),
      }));
      showToast('Bank balance updated', 'success');
    },
    [showToast]
  );

  const deleteBank = useCallback(
    (id: string) => {
      setPersisted((prev) => ({
        ...prev,
        banks: prev.banks.filter((b) => b.id !== id),
      }));
      showToast('Bank account removed', 'info');
    },
    [showToast]
  );

  const addIncome = useCallback(
    (payload: Omit<IncomeItem, 'id'>) => {
      const item: IncomeItem = { ...payload, id: `inc-${Date.now()}` };
      setPersisted((prev) => ({
        ...prev,
        incomes: [item, ...prev.incomes],
      }));
      showToast('Income entry added', 'success');
    },
    [showToast]
  );

  const updateIncome = useCallback(
    (id: string, patch: Partial<IncomeItem>) => {
      setPersisted((prev) => ({
        ...prev,
        incomes: prev.incomes.map((inc) =>
          inc.id === id ? { ...inc, ...patch } : inc
        ),
      }));
      showToast('Income entry updated', 'success');
    },
    [showToast]
  );

  const deleteIncome = useCallback(
    (id: string) => {
      setPersisted((prev) => ({
        ...prev,
        incomes: prev.incomes.filter((inc) => inc.id !== id),
      }));
      showToast('Income entry deleted', 'info');
    },
    [showToast]
  );

  const addExpense = useCallback(
    (payload: Omit<ExpenseItem, 'id'>) => {
      const item: ExpenseItem = { ...payload, id: `exp-${Date.now()}` };
      setPersisted((prev) => {
        let nextBanks = prev.banks;
        let nextCards = prev.creditCards;

        if (payload.paymentMode === 'Bank' && payload.sourceId) {
          nextBanks = prev.banks.map((b) =>
            b.id === payload.sourceId
              ? { ...b, balance: Math.max(0, b.balance - payload.amount) }
              : b
          );
        } else if (payload.paymentMode === 'Credit Card' && payload.sourceId) {
          nextCards = prev.creditCards.map((c) =>
            c.id === payload.sourceId
              ? { ...c, outstandingAmount: c.outstandingAmount + payload.amount }
              : c
          );
        }

        return {
          ...prev,
          banks: nextBanks,
          creditCards: nextCards,
          expenses: [item, ...prev.expenses],
        };
      });
      showToast('Expense recorded', 'success');
    },
    [showToast]
  );

  const updateExpense = useCallback(
    (id: string, patch: Partial<ExpenseItem>) => {
      setPersisted((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) =>
          e.id === id ? { ...e, ...patch } : e
        ),
      }));
      showToast('Expense updated', 'success');
    },
    [showToast]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      setPersisted((prev) => ({
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== id),
      }));
      showToast('Expense deleted', 'info');
    },
    [showToast]
  );

  const addGoal = useCallback(
    (
      payload: Omit<
        GoalItem,
        'id' | 'amountSaved' | 'createdAt' | 'completed' | 'transactions'
      >
    ): boolean => {
      const daysLeft = computeDaysLeft(payload.targetDate);
      const minDays = getCycleDays(payload.paymentFrequency);
      if (daysLeft <= minDays) {
        showToast(
          `Target date must be more than ${minDays} days ahead for ${payload.paymentFrequency} cycle`,
          'error'
        );
        return false;
      }

      const goal: GoalItem = {
        ...payload,
        id: `goal-${Date.now()}`,
        amountSaved: 0,
        createdAt: todayIso(),
        completed: false,
        transactions: [],
      };
      setPersisted((prev) => ({ ...prev, goals: [goal, ...prev.goals] }));
      showToast('Goal created! Stay consistent.', 'success');
      return true;
    },
    [showToast]
  );

  const updateGoal = useCallback(
    (id: string, patch: Partial<GoalItem>): boolean => {
      setPersisted((prev) => ({
        ...prev,
        goals: prev.goals.map((g) => {
          if (g.id !== id) return g;
          const updated = { ...g, ...patch };
          if (updated.amountSaved >= updated.goalAmount && !updated.completed) {
            updated.completed = true;
            updated.completedDate = todayIso();
          }
          return updated;
        }),
      }));
      showToast('Goal updated', 'success');
      return true;
    },
    [showToast]
  );

  const deleteGoal = useCallback(
    (id: string) => {
      setPersisted((prev) => ({
        ...prev,
        goals: prev.goals.filter((g) => g.id !== id),
      }));
      showToast('Goal deleted', 'info');
    },
    [showToast]
  );

  const addGoalTransaction = useCallback(
    (goalId: string, amount: number, note?: string) => {
      if (amount <= 0) {
        showToast('Enter a valid contribution amount', 'error');
        return;
      }
      let completedJustNow = false;
      setPersisted((prev) => {
        const nextGoals = prev.goals.map((g) => {
          if (g.id !== goalId) return g;
          const nextSaved = g.amountSaved + amount;
          const isNowDone = nextSaved >= g.goalAmount;
          if (isNowDone && !g.completed) completedJustNow = true;
          return {
            ...g,
            amountSaved: nextSaved,
            completed: isNowDone || g.completed,
            completedDate:
              isNowDone && !g.completedDate ? todayIso() : g.completedDate,
            transactions: [
              {
                id: `gt-${Date.now()}`,
                amount,
                date: todayIso(),
                note: note || 'Goal deposit',
              },
              ...g.transactions,
            ],
          };
        });
        return {
          ...prev,
          user: completedJustNow
            ? { ...prev.user, bvCoins: prev.user.bvCoins + 25 }
            : prev.user,
          goals: nextGoals,
        };
      });
      if (completedJustNow) {
        showToast(
          'Goal completed! Moved to Completed tab (+25 BV Coins)',
          'success'
        );
      } else {
        showToast('Savings contribution added to goal', 'success');
      }
    },
    [showToast]
  );

  const deleteGoalTransaction = useCallback(
    (goalId: string, txId: string) => {
      setPersisted((prev) => ({
        ...prev,
        goals: prev.goals.map((g) => {
          if (g.id !== goalId) return g;
          const tx = g.transactions.find((t) => t.id === txId);
          const deducted = tx ? tx.amount : 0;
          const newSaved = Math.max(0, g.amountSaved - deducted);
          return {
            ...g,
            amountSaved: newSaved,
            completed: newSaved >= g.goalAmount,
            transactions: g.transactions.filter((t) => t.id !== txId),
          };
        }),
      }));
      showToast('Contribution removed', 'info');
    },
    [showToast]
  );

  const openAddGoalModal = useCallback(() => {
    setIsAddGoalModalOpen(true);
  }, []);

  const updateGoalPreferences = useCallback(
    (patch: Partial<GoalPreferences>) => {
      setPersisted((prev) => ({
        ...prev,
        goalPreferences: { ...prev.goalPreferences, ...patch },
      }));
      showToast('Goal settings updated', 'success');
    },
    [showToast]
  );

  const totalGoalsTarget = useMemo(
    () => persisted.goals.reduce((acc, g) => acc + (g.goalAmount || 0), 0),
    [persisted.goals]
  );
  const totalGoalsSaved = useMemo(
    () => persisted.goals.reduce((acc, g) => acc + (g.amountSaved || 0), 0),
    [persisted.goals]
  );
  const activeGoalsCount = useMemo(
    () => persisted.goals.filter((g) => !g.completed).length,
    [persisted.goals]
  );
  const completedGoalsCount = useMemo(
    () => persisted.goals.filter((g) => g.completed).length,
    [persisted.goals]
  );

  const exportGoalsData = useCallback(() => {
    try {
      const payload = {
        app: 'BrainVibe Goals',
        exportedAt: new Date().toISOString(),
        goals: persisted.goals,
        goalPreferences: persisted.goalPreferences,
        user: {
          name: persisted.user.name,
          email: persisted.user.email,
          bvCoins: persisted.user.bvCoins,
          isPro: persisted.user.isPro,
        },
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brainvibe-goals-backup-${todayIso()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Goals data exported to JSON file', 'success');
    } catch {
      showToast('Failed to export goals data', 'error');
    }
  }, [persisted.goals, persisted.goalPreferences, persisted.user, showToast]);

  const importGoalsData = useCallback(
    (jsonStr: string): boolean => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed && Array.isArray(parsed.goals)) {
          setPersisted((prev) => ({
            ...prev,
            goals: parsed.goals,
            goalPreferences: parsed.goalPreferences
              ? { ...prev.goalPreferences, ...parsed.goalPreferences }
              : prev.goalPreferences,
          }));
          showToast('Goals and settings restored from backup!', 'success');
          return true;
        }
        showToast('Invalid backup file structure', 'error');
        return false;
      } catch {
        showToast('Could not parse backup JSON file', 'error');
        return false;
      }
    },
    [showToast]
  );

  const addCreditCard = useCallback(
    (
      payload: Omit<CreditCardItem, 'id' | 'network' | 'gradientIndex'>
    ): boolean => {
      const digits = payload.cardNumber.replace(/\D/g, '');
      if (digits.length < 15 || digits.length > 16) {
        showToast('Card number must be 15 or 16 digits', 'error');
        return false;
      }
      const network = detectCardNetwork(digits);
      if (!network) {
        showToast(
          'Card must start with 4 (Visa), 5 (Mastercard), or 6 (RuPay)',
          'error'
        );
        return false;
      }

      setPersisted((prev) => {
        const card: CreditCardItem = {
          ...payload,
          cardNumber: digits,
          network,
          id: `cc-${Date.now()}`,
          gradientIndex: prev.creditCards.length % 3,
        };
        return { ...prev, creditCards: [card, ...prev.creditCards] };
      });
      showToast('Credit card added', 'success');
      return true;
    },
    [showToast]
  );

  const updateCreditCard = useCallback(
    (id: string, patch: Partial<CreditCardItem>) => {
      setPersisted((prev) => ({
        ...prev,
        creditCards: prev.creditCards.map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      }));
      showToast('Credit card updated', 'success');
    },
    [showToast]
  );

  const deleteCreditCard = useCallback(
    (id: string) => {
      setPersisted((prev) => ({
        ...prev,
        creditCards: prev.creditCards.filter((c) => c.id !== id),
      }));
      showToast('Credit card removed', 'info');
    },
    [showToast]
  );

  const payCreditCardBill = useCallback(
    (cardId: string, bankId: string, amount: number): boolean => {
      const card = persisted.creditCards.find((c) => c.id === cardId);
      const bank = persisted.banks.find((b) => b.id === bankId);
      if (!card || !bank) {
        showToast('Select a valid bank account', 'error');
        return false;
      }
      if (amount <= 0 || amount > card.outstandingAmount) {
        showToast('Payment must be between ₹1 and total due', 'error');
        return false;
      }
      if (bank.balance < amount) {
        showToast(
          `Insufficient balance in ${bank.bankName} for this payment`,
          'error'
        );
        return false;
      }

      setPersisted((prev) => ({
        ...prev,
        banks: prev.banks.map((b) =>
          b.id === bankId
            ? { ...b, balance: b.balance - amount, updatedAt: todayIso() }
            : b
        ),
        creditCards: prev.creditCards.map((c) =>
          c.id === cardId
            ? {
                ...c,
                outstandingAmount: Math.max(0, c.outstandingAmount - amount),
              }
            : c
        ),
      }));
      showToast(
        `Paid ₹${amount.toLocaleString('en-IN')} from ${bank.bankName}`,
        'success'
      );
      return true;
    },
    [persisted.banks, persisted.creditCards, showToast]
  );

  const addTradeFund = useCallback(
    (payload: Omit<TradeFundItem, 'id'>): boolean => {
      if (payload.amount <= 0) {
        showToast('Enter an amount greater than 0', 'error');
        return false;
      }
      if (
        payload.type === 'withdraw' &&
        payload.amount > tradeSummary.currentBalance
      ) {
        showToast('Withdrawal exceeds current trading balance', 'error');
        return false;
      }
      const item: TradeFundItem = { ...payload, id: `tf-${Date.now()}` };
      setPersisted((prev) => ({
        ...prev,
        tradeFunds: [item, ...prev.tradeFunds],
      }));
      showToast(
        payload.type === 'deposit'
          ? 'Trading funds deposited'
          : 'Trading funds withdrawn',
        'success'
      );
      return true;
    },
    [showToast, tradeSummary.currentBalance]
  );

  const deleteTradeFund = useCallback(
    (id: string) => {
      setPersisted((prev) => ({
        ...prev,
        tradeFunds: prev.tradeFunds.filter((f) => f.id !== id),
      }));
      showToast('Fund entry deleted', 'info');
    },
    [showToast]
  );

  const addTradeLog = useCallback(
    (payload: Omit<TradeLogItem, 'id'>): boolean => {
      if (tradeSummary.netFund <= 0) {
        showToast(
          'Add trading capital in the Funds tab before logging trades',
          'error'
        );
        return false;
      }
      if (payload.amount <= 0) {
        showToast('Net Realised P&L must be greater than 0', 'error');
        return false;
      }
      const item: TradeLogItem = { ...payload, id: `tl-${Date.now()}` };
      setPersisted((prev) => ({
        ...prev,
        tradeLogs: [item, ...prev.tradeLogs],
      }));
      showToast('Trade logged in Tradebook', 'success');
      return true;
    },
    [showToast, tradeSummary.netFund]
  );

  const deleteTradeLog = useCallback(
    (id: string) => {
      setPersisted((prev) => ({
        ...prev,
        tradeLogs: prev.tradeLogs.filter((t) => t.id !== id),
      }));
      showToast('Trade entry deleted', 'info');
    },
    [showToast]
  );

  const resetTradebook = useCallback(() => {
    setPersisted((prev) => ({
      ...prev,
      tradeFunds: [],
      tradeLogs: [],
    }));
    showToast('Tradebook funds & trade logs reset', 'info');
  }, [showToast]);

  const toggleBookmark = useCallback(
    (articleId: string) => {
      setPersisted((prev) => {
        const exists = prev.bookmarkedIds.includes(articleId);
        const next = exists
          ? prev.bookmarkedIds.filter((id) => id !== articleId)
          : [articleId, ...prev.bookmarkedIds];
        showToast(
          exists ? 'Removed from Bookmarks' : 'Saved to Bookmarks',
          'info'
        );
        return { ...prev, bookmarkedIds: next };
      });
    },
    [showToast]
  );

  const claimReferralReward = useCallback(
    (friendCodeOrName?: string) => {
      setPersisted((prev) => ({
        ...prev,
        user: { ...prev.user, bvCoins: prev.user.bvCoins + 50 },
      }));
      showToast(
        friendCodeOrName
          ? `Referral invite sent to ${friendCodeOrName}! +50 BV Coins credited`
          : '+50 BrainVibe Coins added to your wallet!',
        'success'
      );
    },
    [showToast]
  );

  const activatePlanPreview = useCallback(
    (plan: UserProfile['planName']) => {
      // TODO: Integrate Razorpay checkout order creation & signature verification for live billing
      const isPro = plan !== 'Basic';
      setPersisted((prev) => ({
        ...prev,
        user: { ...prev.user, isPro, planName: plan },
      }));
      showToast(
        isPro
          ? `${plan} unlocked (Billing preview mode)`
          : 'Switched back to Basic plan',
        'success'
      );
    },
    [showToast]
  );

  const value: BrainVibeContextValue = {
    activeTab,
    setActiveTab,
    subScreen,
    openSubScreen,
    closeSubScreen,
    isStoriesOpen,
    setIsStoriesOpen,
    comingSoonFeature,
    openComingSoon,
    closeComingSoon,
    activeArticle,
    setActiveArticle,
    authStage: persisted.authStage,
    setAuthStage,
    pendingPhone,
    setPendingPhone,
    user: persisted.user,
    updateUser,
    lockWithQpin,
    logoutToOnboarding,
    loginDemoAccount,
    resetDemoData,
    banks: persisted.banks,
    incomes: persisted.incomes,
    expenses: persisted.expenses,
    goals: persisted.goals,
    creditCards: persisted.creditCards,
    tradeFunds: persisted.tradeFunds,
    tradeLogs: persisted.tradeLogs,
    stories: INITIAL_STORIES,
    notifications: persisted.notifications,
    markAllNotificationsRead,
    totalBankBalance,
    totalOtherIncome,
    totalIncomeCombined,
    totalExpenses,
    totalCreditDue,
    totalNetworth,
    networthSeries,
    tradeSummary,
    addBank,
    updateBank,
    deleteBank,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    addGoal,
    updateGoal,
    deleteGoal,
    addGoalTransaction,
    deleteGoalTransaction,
    isAddGoalModalOpen,
    setIsAddGoalModalOpen,
    openAddGoalModal,
    totalGoalsTarget,
    totalGoalsSaved,
    activeGoalsCount,
    completedGoalsCount,
    goalPreferences: persisted.goalPreferences,
    updateGoalPreferences,
    exportGoalsData,
    importGoalsData,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    payCreditCardBill,
    addTradeFund,
    deleteTradeFund,
    addTradeLog,
    deleteTradeLog,
    resetTradebook,
    newsArticles,
    bookmarkedIds: persisted.bookmarkedIds,
    toggleBookmark,
    cryptoCoins,
    isCryptoLoading,
    refreshCrypto,
    claimReferralReward,
    activatePlanPreview,
    toasts,
    showToast,
    dismissToast,
  };

  return (
    <BrainVibeContext.Provider value={value}>
      {children}
    </BrainVibeContext.Provider>
  );
};

export function useBrainVibe(): BrainVibeContextValue {
  const ctx = useContext(BrainVibeContext);
  if (!ctx) {
    throw new Error('useBrainVibe must be used within a BrainVibeProvider');
  }
  return ctx;
}
