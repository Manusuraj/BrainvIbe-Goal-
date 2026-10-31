import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AuthStage,
  GoalCycle,
  GoalItem,
  GoalPreferences,
  MainTab,
  SubScreen,
  ToastMessage,
  UserProfile,
} from '../types/models';
import {
  auth,
  db,
  doc,
  collection,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  signInWithPopup,
  signOut,
  googleProvider,
  onAuthStateChanged,
  validateFirestoreConnection,
} from '../services/firebase';
import {
  computeDaysLeft,
  daysAgoIso,
  daysAheadIso,
  todayIso,
} from '../utils/formatters';

const STORAGE_KEY = 'goal_app_state_v2';
const GUEST_UID = 'guest-demo-user';

export const DEFAULT_GOAL_PREFERENCES: GoalPreferences = {
  defaultCycle: 'Monthly',
  autoCalculatePace: true,
  milestoneReminders: true,
  overdueAlerts: true,
  currency: 'INR',
  notifications: true,
  biometrics: false,
};

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const INITIAL_USER_PROFILE: UserProfile = {
  uid: '',
  name: '',
  email: '',
  avatarUrl: '',
  isPro: false,
  planName: 'Free Plan',
  subscriptionStatus: 'none',
  dailyAiCount: 0,
  dailyAiDate: todayIso(),
  monthlyAiCount: 0,
  monthlyAiMonth: currentMonthKey(),
};

export const INITIAL_SAMPLE_GOALS: GoalItem[] = [
  {
    id: 'goal-1',
    title: 'Emergency Reserve (6 Months)',
    description: 'High-yield liquid buffer for complete financial peace of mind',
    goalAmount: 300000,
    amountSaved: 195000,
    targetDate: daysAheadIso(180),
    createdAt: daysAgoIso(90),
    paymentFrequency: 'Monthly',
    category: 'Emergency',
    completed: false,
    transactions: [
      { id: 'gt-1', amount: 120000, date: daysAgoIso(60), note: 'Initial salary allocation' },
      { id: 'gt-2', amount: 75000, date: daysAgoIso(15), note: 'Monthly SIP transfer' },
    ],
  },
  {
    id: 'goal-2',
    title: 'MacBook Pro M4 Workstation',
    description: 'Hardware productivity upgrade funded strictly without EMI debt',
    goalAmount: 185000,
    amountSaved: 110000,
    targetDate: daysAheadIso(95),
    createdAt: daysAgoIso(45),
    paymentFrequency: 'Weekly',
    category: 'Gadgets',
    completed: false,
    transactions: [
      { id: 'gt-3', amount: 60000, date: daysAgoIso(30), note: 'Freelance design project' },
      { id: 'gt-4', amount: 50000, date: daysAgoIso(7), note: 'Weekly savings sweep' },
    ],
  },
  {
    id: 'goal-3',
    title: 'Goa Scuba Certification Trip',
    description: 'PADI Open Water diver certification course and beach stay',
    goalAmount: 55000,
    amountSaved: 55000,
    targetDate: daysAgoIso(10),
    createdAt: daysAgoIso(100),
    paymentFrequency: 'Monthly',
    category: 'Travel',
    completed: true,
    completedDate: daysAgoIso(12),
    transactions: [
      { id: 'gt-5', amount: 30000, date: daysAgoIso(50), note: 'Advance booking' },
      { id: 'gt-6', amount: 25000, date: daysAgoIso(12), note: 'Final milestone completed' },
    ],
  },
];

interface PersistedState {
  authStage: AuthStage;
  user: UserProfile;
  goals: GoalItem[];
  goalPreferences: GoalPreferences;
  hasSeenTutorial: boolean;
}

interface BrainVibeContextValue {
  // Navigation
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  subScreen: SubScreen;
  openSubScreen: (screen: SubScreen) => void;
  closeSubScreen: () => void;

  // Auth & Profile
  authStage: AuthStage;
  setAuthStage: (stage: AuthStage) => void;
  user: UserProfile;
  updateUser: (patch: Partial<UserProfile>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthLoading: boolean;

  // Pro Subscription
  upgradeToPro: (paymentIdOrPlan?: string) => Promise<boolean>;

  // AI Usage & Limits
  remainingAiMessages: number;
  recordAiMessageSent: () => Promise<boolean>;

  // Goals State & Actions
  goals: GoalItem[];
  goalPreferences: GoalPreferences;
  updateGoalPreferences: (patch: Partial<GoalPreferences>) => void;
  isAddGoalModalOpen: boolean;
  setIsAddGoalModalOpen: (open: boolean) => void;
  openAddGoalModal: () => void;
  closeAddGoalModal: () => void;

  // Goal Mutations
  addGoal: (
    payload: Omit<
      GoalItem,
      'id' | 'amountSaved' | 'createdAt' | 'completed' | 'transactions'
    >
  ) => Promise<boolean>;
  updateGoal: (id: string, patch: Partial<GoalItem>) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<void>;
  addGoalTransaction: (goalId: string, amount: number, note?: string) => Promise<void>;
  deleteGoalTransaction: (goalId: string, txId: string) => Promise<void>;

  // Metrics
  totalGoalsTarget: number;
  totalGoalsSaved: number;
  activeGoalsCount: number;
  completedGoalsCount: number;

  // Data Management & Backups
  exportGoalsData: () => void;
  importGoalsData: (jsonStr: string) => Promise<boolean>;
  resetDemoData: () => void;

  // Tutorial / Onboarding
  hasSeenTutorial: boolean;
  openTutorial: () => void;
  completeTutorial: () => void;

  // Support
  openEmailSupport: () => void;

  // Toast notifications
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const BrainVibeContext = createContext<BrainVibeContextValue | null>(null);

function getInitialLocalState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user && Array.isArray(parsed.goals)) {
        const isAuthenticated =
          parsed.authStage === AuthStage.Authenticated &&
          parsed.user.uid &&
          parsed.user.uid !== GUEST_UID;
        return {
          authStage: isAuthenticated ? AuthStage.Authenticated : AuthStage.Welcome,
          user: { ...INITIAL_USER_PROFILE, ...parsed.user },
          goals: parsed.goals,
          goalPreferences: parsed.goalPreferences ?? DEFAULT_GOAL_PREFERENCES,
          hasSeenTutorial: parsed.hasSeenTutorial ?? true,
        };
      }
    }
  } catch {
    // fallback
  }

  return {
    authStage: AuthStage.Welcome,
    user: INITIAL_USER_PROFILE,
    goals: INITIAL_SAMPLE_GOALS,
    goalPreferences: DEFAULT_GOAL_PREFERENCES,
    hasSeenTutorial: false,
  };
}

export const BrainVibeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [persisted, setPersisted] = useState<PersistedState>(getInitialLocalState);
  const [activeTab, setActiveTabState] = useState<MainTab>(MainTab.Goals);
  const [subScreen, setSubScreen] = useState<SubScreen>(SubScreen.None);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Show Toast
  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save local state backup whenever persisted changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // ignore quota errors
    }
  }, [persisted]);

  // Test Firestore connection on boot
  useEffect(() => {
    validateFirestoreConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        try {
          const userDocRef = doc(db, 'users', uid);
          const snap = await getDoc(userDocRef);

          let profileData: UserProfile;
          const currentMonth = currentMonthKey();
          const today = todayIso();
          const nowIso = new Date().toISOString();

          if (snap.exists()) {
            const data = snap.data() as Partial<UserProfile>;
            let isPro = Boolean(data.isPro);
            let subStatus: 'active' | 'expired' | 'none' = data.subscriptionStatus || (isPro ? 'active' : 'none');
            let planName = data.planName || (isPro ? 'Premium Annual' : 'Free Plan');

            // Handle subscription expiry check
            if (isPro && data.subscriptionExpiry && nowIso > data.subscriptionExpiry) {
              isPro = false;
              subStatus = 'expired';
              planName = 'Free Plan';
              try {
                await setDoc(
                  userDocRef,
                  {
                    isPro: false,
                    subscriptionStatus: 'expired',
                    planName: 'Free Plan',
                  },
                  { merge: true }
                );
              } catch {
                // ignore
              }
            }

            profileData = {
              uid,
              name: data.name || firebaseUser.displayName || 'Goal Achiever',
              email: data.email || firebaseUser.email || '',
              avatarUrl: data.avatarUrl || firebaseUser.photoURL || '',
              isPro,
              planName,
              subscriptionStatus: subStatus,
              subscriptionActivatedAt: data.subscriptionActivatedAt,
              subscriptionExpiry: data.subscriptionExpiry,
              lastPaymentId: data.lastPaymentId,
              dailyAiCount: data.dailyAiDate === today ? (data.dailyAiCount || 0) : 0,
              dailyAiDate: today,
              monthlyAiCount: data.monthlyAiMonth === currentMonth ? (data.monthlyAiCount || 0) : 0,
              monthlyAiMonth: currentMonth,
              city: data.city || 'India',
              country: data.country || 'India',
              phoneNumber: data.phoneNumber || '',
            };
          } else {
            profileData = {
              uid,
              name: firebaseUser.displayName || 'Goal Achiever',
              email: firebaseUser.email || '',
              avatarUrl: firebaseUser.photoURL || '',
              isPro: false,
              planName: 'Free Plan',
              subscriptionStatus: 'none',
              dailyAiCount: 0,
              dailyAiDate: today,
              monthlyAiCount: 0,
              monthlyAiMonth: currentMonth,
            };
            await setDoc(userDocRef, profileData);

            // Seed initial goals in Firestore for new user if empty
            for (const sampleGoal of INITIAL_SAMPLE_GOALS) {
              await setDoc(doc(db, 'users', uid, 'goals', sampleGoal.id), sampleGoal);
            }
          }

          setPersisted((prev) => ({
            ...prev,
            authStage: AuthStage.Authenticated,
            user: profileData,
          }));
        } catch (err) {
          console.warn('Could not sync user profile from Firestore:', err);
        }
      } else {
        setPersisted((prev) => ({
          ...prev,
          authStage: AuthStage.Welcome,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for goals
  useEffect(() => {
    const uid = persisted.user?.uid;
    if (!uid || uid === GUEST_UID) return;

    try {
      const goalsColRef = collection(db, 'users', uid, 'goals');
      const unsubscribe = onSnapshot(goalsColRef, (snapshot) => {
        const remoteGoals: GoalItem[] = [];
        snapshot.forEach((docSnap) => {
          remoteGoals.push(docSnap.data() as GoalItem);
        });
        setPersisted((prev) => ({
          ...prev,
          goals: remoteGoals,
        }));
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Realtime goals sync error:', err);
    }
  }, [persisted.user?.uid]);

  // Remaining AI messages calculation:
  // Paid/Premium: 100 messages per billing month
  // Free: 5 messages per day
  const remainingAiMessages = useMemo(() => {
    if (persisted.user.isPro) {
      const isCurrentMonth = persisted.user.monthlyAiMonth === currentMonthKey();
      const count = isCurrentMonth ? (persisted.user.monthlyAiCount || 0) : 0;
      return Math.max(0, 100 - count);
    }
    const isToday = persisted.user.dailyAiDate === todayIso();
    const count = isToday ? (persisted.user.dailyAiCount || 0) : 0;
    return Math.max(0, 5 - count);
  }, [
    persisted.user.isPro,
    persisted.user.monthlyAiCount,
    persisted.user.monthlyAiMonth,
    persisted.user.dailyAiCount,
    persisted.user.dailyAiDate,
  ]);

  // Record an AI message sent
  const recordAiMessageSent = useCallback(async (): Promise<boolean> => {
    if (persisted.user.isPro) {
      const monthKey = currentMonthKey();
      const isCurrentMonth = persisted.user.monthlyAiMonth === monthKey;
      const currentCount = isCurrentMonth ? (persisted.user.monthlyAiCount || 0) : 0;

      if (currentCount >= 100) {
        showToast('Monthly limit reached (100/100). Allowance resets on the 1st of next month.', 'error');
        return false;
      }

      const nextCount = currentCount + 1;
      const patch = {
        monthlyAiCount: nextCount,
        monthlyAiMonth: monthKey,
      };

      setPersisted((prev) => ({
        ...prev,
        user: { ...prev.user, ...patch },
      }));

      if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        try {
          await setDoc(doc(db, 'users', persisted.user.uid), patch, { merge: true });
        } catch {
          // ignore
        }
      }

      return true;
    }

    const isToday = persisted.user.dailyAiDate === todayIso();
    const currentCount = isToday ? (persisted.user.dailyAiCount || 0) : 0;

    if (currentCount >= 5) {
      showToast('Daily free limit reached (5/5). Upgrade to Premium (₹499/year) for 100 monthly chats & zero ads!', 'error');
      setSubScreen(SubScreen.ProUpgrade);
      return false;
    }

    const nextCount = currentCount + 1;
    const patch = {
      dailyAiCount: nextCount,
      dailyAiDate: todayIso(),
    };

    setPersisted((prev) => ({
      ...prev,
      user: { ...prev.user, ...patch },
    }));

    if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
      try {
        await setDoc(doc(db, 'users', persisted.user.uid), patch, { merge: true });
      } catch {
        // ignore
      }
    }

    return true;
  }, [
    persisted.user.isPro,
    persisted.user.monthlyAiCount,
    persisted.user.monthlyAiMonth,
    persisted.user.dailyAiCount,
    persisted.user.dailyAiDate,
    persisted.user.uid,
    showToast,
  ]);

  // Google Login
  const loginWithGoogle = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      showToast(`Welcome, ${user.displayName || 'friend'}!`, 'success');
      setPersisted((prev) => ({
        ...prev,
        authStage: AuthStage.Authenticated,
      }));
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      showToast(error.message || 'Google Sign-In failed. Please try again.', 'error');
    } finally {
      setIsAuthLoading(false);
    }
  }, [showToast]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setPersisted((prev) => ({
      ...prev,
      authStage: AuthStage.Welcome,
    }));
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  // Upgrade to Pro (Premium Annual - ₹499/year)
  const upgradeToPro = useCallback(
    async (paymentIdOrPlan?: string): Promise<boolean> => {
      const paymentId =
        paymentIdOrPlan && paymentIdOrPlan.startsWith('pay_')
          ? paymentIdOrPlan
          : `pay_rzp_${Date.now()}`;

      const now = new Date();
      const activatedAt = now.toISOString();
      const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
      const currentMonth = currentMonthKey();

      const patch: Partial<UserProfile> = {
        isPro: true,
        planName: 'Premium Annual',
        subscriptionStatus: 'active',
        subscriptionActivatedAt: activatedAt,
        subscriptionExpiry: expiresAt,
        lastPaymentId: paymentId,
        monthlyAiCount: 0,
        monthlyAiMonth: currentMonth,
      };

      setPersisted((prev) => ({
        ...prev,
        user: { ...prev.user, ...patch },
      }));

      if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        try {
          await setDoc(doc(db, 'users', persisted.user.uid), patch, { merge: true });

          // Record payment receipt in Firestore
          await setDoc(doc(db, 'users', persisted.user.uid, 'payments', paymentId), {
            paymentId,
            amount: 499,
            amountPaise: 49900,
            currency: 'INR',
            planName: 'Premium Annual',
            status: 'captured',
            activatedAt,
            expiresAt,
            userId: persisted.user.uid,
            createdAt: activatedAt,
          });
        } catch (err) {
          console.warn('Firestore subscription update error:', err);
        }
      }

      setSubScreen(SubScreen.None);
      showToast('🎉 Premium Annual activated! 100 AI chats/mo, backup access & zero ads!', 'success');
      return true;
    },
    [persisted.user.uid, showToast]
  );

  // Update User Profile
  const updateUser = useCallback(
    async (patch: Partial<UserProfile>) => {
      setPersisted((prev) => ({
        ...prev,
        user: { ...prev.user, ...patch },
      }));

      if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        try {
          await setDoc(doc(db, 'users', persisted.user.uid), patch, { merge: true });
        } catch {
          // ignore
        }
      }
      showToast('Profile updated', 'success');
    },
    [persisted.user.uid, showToast]
  );

  // Update Goal Preferences
  const updateGoalPreferences = useCallback(
    (patch: Partial<GoalPreferences>) => {
      setPersisted((prev) => ({
        ...prev,
        goalPreferences: { ...prev.goalPreferences, ...patch },
      }));
      showToast('Preferences updated', 'success');
    },
    [showToast]
  );

  // Add Goal
  const addGoal = useCallback(
    async (
      payload: Omit<
        GoalItem,
        'id' | 'amountSaved' | 'createdAt' | 'completed' | 'transactions'
      >
    ): Promise<boolean> => {
      const daysLeft = computeDaysLeft(payload.targetDate);
      if (daysLeft < 1) {
        showToast('Please select a target date in the future', 'error');
        return false;
      }

      const id = `goal-${Date.now()}`;
      const newGoal: GoalItem = {
        ...payload,
        id,
        amountSaved: 0,
        createdAt: todayIso(),
        completed: false,
        transactions: [],
      };

      setPersisted((prev) => ({
        ...prev,
        goals: [newGoal, ...prev.goals],
      }));

      if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        try {
          await setDoc(doc(db, 'users', persisted.user.uid, 'goals', id), newGoal);
        } catch (err) {
          console.warn('Firestore write failed, goal preserved locally:', err);
        }
      }

      setIsAddGoalModalOpen(false);
      showToast('Goal created! AI plan active.', 'success');
      return true;
    },
    [persisted.user.uid, showToast]
  );

  // Update Goal
  const updateGoal = useCallback(
    async (id: string, patch: Partial<GoalItem>): Promise<boolean> => {
      let updatedGoal: GoalItem | null = null;

      setPersisted((prev) => {
        const nextGoals = prev.goals.map((g) => {
          if (g.id !== id) return g;
          const updated = { ...g, ...patch };
          if (updated.amountSaved >= updated.goalAmount && !updated.completed) {
            updated.completed = true;
            updated.completedDate = todayIso();
          }
          updatedGoal = updated;
          return updated;
        });
        return { ...prev, goals: nextGoals };
      });

      if (updatedGoal && persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        try {
          await setDoc(doc(db, 'users', persisted.user.uid, 'goals', id), updatedGoal, {
            merge: true,
          });
        } catch {
          // ignore
        }
      }

      showToast('Goal updated', 'success');
      return true;
    },
    [persisted.user.uid, showToast]
  );

  // Delete Goal
  const deleteGoal = useCallback(
    async (id: string) => {
      setPersisted((prev) => ({
        ...prev,
        goals: prev.goals.filter((g) => g.id !== id),
      }));

      if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        try {
          await deleteDoc(doc(db, 'users', persisted.user.uid, 'goals', id));
        } catch {
          // ignore
        }
      }
      showToast('Goal removed', 'info');
    },
    [persisted.user.uid, showToast]
  );

  // Add Savings / Contribution Transaction
  const addGoalTransaction = useCallback(
    async (goalId: string, amount: number, note?: string) => {
      if (amount <= 0) {
        showToast('Please enter a valid savings amount', 'error');
        return;
      }

      let isNowCompleted = false;
      let targetGoal: GoalItem | null = null;

      setPersisted((prev) => {
        const nextGoals = prev.goals.map((g) => {
          if (g.id !== goalId) return g;
          const nextSaved = g.amountSaved + amount;
          const completed = nextSaved >= g.goalAmount;
          if (completed && !g.completed) isNowCompleted = true;

          const updated: GoalItem = {
            ...g,
            amountSaved: nextSaved,
            completed: completed || g.completed,
            completedDate: completed && !g.completedDate ? todayIso() : g.completedDate,
            transactions: [
              {
                id: `gt-${Date.now()}`,
                amount,
                date: todayIso(),
                note: note || 'Savings contribution',
              },
              ...g.transactions,
            ],
          };
          targetGoal = updated;
          return updated;
        });
        return { ...prev, goals: nextGoals };
      });

      if (targetGoal && persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        try {
          await setDoc(doc(db, 'users', persisted.user.uid, 'goals', goalId), targetGoal);
        } catch {
          // ignore
        }
      }

      if (isNowCompleted) {
        showToast('🎉 Congratulations! You reached this goal milestone!', 'success');
      } else {
        showToast(`+ ₹${amount.toLocaleString('en-IN')} added to goal!`, 'success');
      }
    },
    [persisted.user.uid, showToast]
  );

  // Delete Transaction
  const deleteGoalTransaction = useCallback(
    async (goalId: string, txId: string) => {
      let targetGoal: GoalItem | null = null;

      setPersisted((prev) => {
        const nextGoals = prev.goals.map((g) => {
          if (g.id !== goalId) return g;
          const tx = g.transactions.find((t) => t.id === txId);
          const deducted = tx ? tx.amount : 0;
          const newSaved = Math.max(0, g.amountSaved - deducted);
          const updated: GoalItem = {
            ...g,
            amountSaved: newSaved,
            completed: newSaved >= g.goalAmount,
            transactions: g.transactions.filter((t) => t.id !== txId),
          };
          targetGoal = updated;
          return updated;
        });
        return { ...prev, goals: nextGoals };
      });

      if (targetGoal && persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        try {
          await setDoc(doc(db, 'users', persisted.user.uid, 'goals', goalId), targetGoal);
        } catch {
          // ignore
        }
      }
      showToast('Contribution removed', 'info');
    },
    [persisted.user.uid, showToast]
  );

  // Metrics
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

  // Standalone Data Export
  const exportGoalsData = useCallback(() => {
    if (!persisted.user.isPro) {
      showToast('Personal Data Backup is a Premium feature. Upgrade for ₹499/year to unlock backup access.', 'error');
      setSubScreen(SubScreen.ProUpgrade);
      return;
    }

    try {
      const payload = {
        app: 'Goal App',
        version: '2.0-apple-minimal',
        exportedAt: new Date().toISOString(),
        goals: persisted.goals,
        goalPreferences: persisted.goalPreferences,
        user: {
          name: persisted.user.name,
          email: persisted.user.email,
          isPro: persisted.user.isPro,
          planName: persisted.user.planName,
        },
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `goal-app-backup-${todayIso()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Goals and settings exported to JSON', 'success');
    } catch {
      showToast('Could not export data', 'error');
    }
  }, [persisted.goals, persisted.goalPreferences, persisted.user, showToast]);

  // Standalone Data Import
  const importGoalsData = useCallback(
    async (jsonStr: string): Promise<boolean> => {
      if (!persisted.user.isPro) {
        showToast('Data Restore is a Premium feature. Upgrade for ₹499/year to unlock restore access.', 'error');
        setSubScreen(SubScreen.ProUpgrade);
        return false;
      }

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

          // Sync to Firestore if authenticated
          if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
            for (const g of parsed.goals) {
              await setDoc(doc(db, 'users', persisted.user.uid, 'goals', g.id), g);
            }
          }

          showToast('Data restored successfully!', 'success');
          return true;
        }
        showToast('Invalid backup file format', 'error');
        return false;
      } catch {
        showToast('Failed to parse backup JSON file', 'error');
        return false;
      }
    },
    [persisted.user.uid, showToast]
  );

  // Reset Demo Data
  const resetDemoData = useCallback(() => {
    setPersisted((prev) => ({
      ...prev,
      goals: INITIAL_SAMPLE_GOALS,
      goalPreferences: DEFAULT_GOAL_PREFERENCES,
    }));
    showToast('Reset to default sample goals', 'success');
  }, [showToast]);

  // Help & Support: opens email client
  const openEmailSupport = useCallback(() => {
    const subject = encodeURIComponent('Goal App – Support Request');
    const recipient = 'info@forestay.in';
    window.location.href = `mailto:${recipient}?subject=${subject}`;
  }, []);

  // Tutorial controls
  const openTutorial = useCallback(() => {
    setSubScreen(SubScreen.Tutorial);
  }, []);

  const completeTutorial = useCallback(() => {
    setPersisted((prev) => ({ ...prev, hasSeenTutorial: true }));
    setSubScreen(SubScreen.None);
  }, []);

  const openAddGoalModal = useCallback(() => setIsAddGoalModalOpen(true), []);
  const closeAddGoalModal = useCallback(() => setIsAddGoalModalOpen(false), []);

  const openSubScreen = useCallback((screen: SubScreen) => setSubScreen(screen), []);
  const closeSubScreen = useCallback(() => setSubScreen(SubScreen.None), []);

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab: setActiveTabState,
      subScreen,
      openSubScreen,
      closeSubScreen,
      authStage: persisted.authStage,
      setAuthStage: (stage: AuthStage) =>
        setPersisted((prev) => ({ ...prev, authStage: stage })),
      user: persisted.user,
      updateUser,
      loginWithGoogle,
      logout,
      isAuthLoading,
      upgradeToPro,
      remainingAiMessages,
      recordAiMessageSent,
      goals: persisted.goals,
      goalPreferences: persisted.goalPreferences,
      updateGoalPreferences,
      isAddGoalModalOpen,
      setIsAddGoalModalOpen,
      openAddGoalModal,
      closeAddGoalModal,
      addGoal,
      updateGoal,
      deleteGoal,
      addGoalTransaction,
      deleteGoalTransaction,
      totalGoalsTarget,
      totalGoalsSaved,
      activeGoalsCount,
      completedGoalsCount,
      exportGoalsData,
      importGoalsData,
      resetDemoData,
      hasSeenTutorial: persisted.hasSeenTutorial,
      openTutorial,
      completeTutorial,
      openEmailSupport,
      toasts,
      showToast,
      dismissToast,
    }),
    [
      activeTab,
      subScreen,
      persisted.authStage,
      persisted.user,
      persisted.goals,
      persisted.goalPreferences,
      persisted.hasSeenTutorial,
      updateUser,
      loginWithGoogle,
      logout,
      isAuthLoading,
      upgradeToPro,
      remainingAiMessages,
      recordAiMessageSent,
      updateGoalPreferences,
      isAddGoalModalOpen,
      openAddGoalModal,
      closeAddGoalModal,
      addGoal,
      updateGoal,
      deleteGoal,
      addGoalTransaction,
      deleteGoalTransaction,
      totalGoalsTarget,
      totalGoalsSaved,
      activeGoalsCount,
      completedGoalsCount,
      exportGoalsData,
      importGoalsData,
      resetDemoData,
      openTutorial,
      completeTutorial,
      openEmailSupport,
      toasts,
      showToast,
      dismissToast,
      openSubScreen,
      closeSubScreen,
    ]
  );

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
