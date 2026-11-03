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
  ChatMessage,
  GoalCycle,
  GoalItem,
  GoalPreferences,
  GoalStatus,
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
  FirebaseUser,
} from '../services/firebase';
import {
  daysAgoIso,
  daysAheadIso,
  getLocalDateString,
  getNextLocalMidnight,
  getUserTimezone,
  parseGoalDeadline,
  todayIso,
} from '../utils/formatters';

const STORAGE_KEY = 'goal_app_state_v3';
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

export const INITIAL_USER_PROFILE: UserProfile = {
  uid: '',
  name: '',
  email: '',
  avatarUrl: '',
  dailyAiCount: 0,
  dailyAiDate: getLocalDateString(new Date(), getUserTimezone()),
  timezone: getUserTimezone(),
};

export const INITIAL_SAMPLE_GOALS: GoalItem[] = [
  {
    id: 'goal-1',
    title: 'Emergency Reserve (6 Months)',
    description: 'High-yield liquid buffer for complete financial peace of mind',
    goalAmount: 300000,
    amountSaved: 195000,
    targetDate: `${daysAheadIso(180)}T23:59:00`,
    createdAt: daysAgoIso(90),
    paymentFrequency: 'Monthly',
    category: 'Emergency',
    completed: false,
    status: 'active',
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
    targetDate: `${daysAheadIso(95)}T23:59:00`,
    createdAt: daysAgoIso(45),
    paymentFrequency: 'Weekly',
    category: 'Gadgets',
    completed: false,
    status: 'active',
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
    targetDate: `${daysAgoIso(10)}T23:59:00`,
    createdAt: daysAgoIso(100),
    paymentFrequency: 'Monthly',
    category: 'Travel',
    completed: true,
    completedDate: daysAgoIso(12),
    status: 'completed',
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
  chatHistory: ChatMessage[];
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

  // Pro Subscription (Graceful stub for backwards compatibility)
  upgradeToPro: (paymentIdOrPlan?: string) => Promise<boolean>;

  // AI Usage & Daily Limits (Strict 5 chats per day)
  remainingAiMessages: number;
  secondsUntilMidnight: number;
  nextMidnightResetIso: string;
  recordAiMessageSent: () => Promise<boolean>;
  refundAiMessage: () => Promise<void>;

  // Chat History
  chatHistory: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => Promise<void>;
  clearChatHistory: () => Promise<void>;

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
      'id' | 'amountSaved' | 'createdAt' | 'completed' | 'transactions' | 'status'
    > & { targetTime?: string }
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

  // Data Management & Backups (Unlocked for all users)
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

function computeDerivedGoalStatus(goal: GoalItem): GoalStatus {
  if (goal.completed) return 'completed';
  const deadline = parseGoalDeadline(goal.targetDate);
  if (deadline.getTime() < Date.now()) return 'overdue';
  return 'active';
}

function getInitialLocalState(): PersistedState {
  const userTz = getUserTimezone();
  const todayStr = getLocalDateString(new Date(), userTz);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user && Array.isArray(parsed.goals)) {
        const isAuthenticated =
          parsed.authStage === AuthStage.Authenticated &&
          parsed.user.uid &&
          parsed.user.uid !== GUEST_UID;

        // Ensure status is evaluated
        const sanitizedGoals = parsed.goals.map((g: GoalItem) => ({
          ...g,
          status: computeDerivedGoalStatus(g),
        }));

        const restoredUser: UserProfile = {
          ...INITIAL_USER_PROFILE,
          ...parsed.user,
          timezone: userTz,
          dailyAiDate: parsed.user.dailyAiDate === todayStr ? todayStr : todayStr,
          dailyAiCount: parsed.user.dailyAiDate === todayStr ? (parsed.user.dailyAiCount || 0) : 0,
        };

        return {
          authStage: isAuthenticated ? AuthStage.Authenticated : AuthStage.Welcome,
          user: restoredUser,
          goals: sanitizedGoals,
          goalPreferences: parsed.goalPreferences ?? DEFAULT_GOAL_PREFERENCES,
          chatHistory: Array.isArray(parsed.chatHistory) ? parsed.chatHistory : [],
          hasSeenTutorial: parsed.hasSeenTutorial ?? true,
        };
      }
    }
  } catch {
    // fallback
  }

  return {
    authStage: AuthStage.Welcome,
    user: {
      ...INITIAL_USER_PROFILE,
      timezone: userTz,
      dailyAiDate: todayStr,
    },
    goals: INITIAL_SAMPLE_GOALS.map((g) => ({ ...g, status: computeDerivedGoalStatus(g) })),
    goalPreferences: DEFAULT_GOAL_PREFERENCES,
    chatHistory: [],
    hasSeenTutorial: false,
  };
}

export const BrainVibeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [persisted, setPersisted] = useState<PersistedState>(getInitialLocalState);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(() => auth.currentUser);
  const [activeTab, setActiveTabState] = useState<MainTab>(MainTab.Goals);
  const [subScreen, setSubScreen] = useState<SubScreen>(SubScreen.None);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Timezone and midnight tracking
  const userTimezone = useMemo(() => persisted.user.timezone || getUserTimezone(), [persisted.user.timezone]);

  // Compute live seconds until midnight
  const [secondsUntilMidnight, setSecondsUntilMidnight] = useState<number>(() => {
    const nextMidnight = getNextLocalMidnight(new Date(), userTimezone);
    return Math.max(0, Math.floor((nextMidnight.getTime() - Date.now()) / 1000));
  });

  const nextMidnightResetIso = useMemo(() => {
    return getNextLocalMidnight(new Date(), userTimezone).toISOString();
  }, [userTimezone]);

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

  // Live Clock: Ticking every second to track countdown to local midnight and goal deadlines
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nextMidnight = getNextLocalMidnight(now, userTimezone);
      const remainingSec = Math.max(0, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));
      setSecondsUntilMidnight(remainingSec);

      // Check if calendar date transitioned (Midnight arrival)
      const currentLocalDate = getLocalDateString(now, userTimezone);
      if (persisted.user.dailyAiDate !== currentLocalDate) {
        setPersisted((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            dailyAiCount: 0,
            dailyAiDate: currentLocalDate,
          },
        }));

        // Sync reset to Firestore if authenticated
        if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
          setDoc(
            doc(db, 'users', persisted.user.uid),
            { dailyAiCount: 0, dailyAiDate: currentLocalDate, timezone: userTimezone },
            { merge: true }
          ).catch((e) => console.warn('Midnight reset sync note:', e));
        }
      }

      // Automatically evaluate goal statuses (active vs overdue)
      setPersisted((prev) => {
        let changed = false;
        const nextGoals = prev.goals.map((g) => {
          const derived = computeDerivedGoalStatus(g);
          if (g.status !== derived) {
            changed = true;
            return { ...g, status: derived };
          }
          return g;
        });
        return changed ? { ...prev, goals: nextGoals } : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [userTimezone, persisted.user.dailyAiDate, persisted.user.uid]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseAuthUser(firebaseUser);
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        try {
          const userDocRef = doc(db, 'users', uid);
          const snap = await getDoc(userDocRef);

          const currentTz = getUserTimezone();
          const today = getLocalDateString(new Date(), currentTz);

          let profileData: UserProfile;

          if (snap.exists()) {
            const data = snap.data() as Partial<UserProfile>;
            const userDate = data.dailyAiDate;
            const count = userDate === today ? (data.dailyAiCount || 0) : 0;

            profileData = {
              uid,
              name: data.name || firebaseUser.displayName || 'Goal Achiever',
              email: data.email || firebaseUser.email || '',
              avatarUrl: data.avatarUrl || firebaseUser.photoURL || '',
              dailyAiCount: count,
              dailyAiDate: today,
              timezone: data.timezone || currentTz,
              phoneNumber: data.phoneNumber || '',
              city: data.city || 'India',
              country: data.country || 'India',
            };

            // If date had rolled over, save normalized count
            if (userDate !== today) {
              await setDoc(
                userDocRef,
                { dailyAiCount: 0, dailyAiDate: today, timezone: currentTz },
                { merge: true }
              );
            }
          } else {
            profileData = {
              uid,
              name: firebaseUser.displayName || 'Goal Achiever',
              email: firebaseUser.email || '',
              avatarUrl: firebaseUser.photoURL || '',
              dailyAiCount: 0,
              dailyAiDate: today,
              timezone: currentTz,
            };
            await setDoc(userDocRef, profileData);

            // Seed initial sample goals in Firestore for new user if empty
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
          user: INITIAL_USER_PROFILE,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for Goals
  useEffect(() => {
    const uid = persisted.user?.uid;
    if (
      !firebaseAuthUser ||
      !uid ||
      uid === GUEST_UID ||
      firebaseAuthUser.uid !== uid ||
      persisted.authStage !== AuthStage.Authenticated
    ) {
      return;
    }

    try {
      const goalsColRef = collection(db, 'users', uid, 'goals');
      const unsubscribe = onSnapshot(
        goalsColRef,
        (snapshot) => {
          const remoteGoals: GoalItem[] = [];
          snapshot.forEach((docSnap) => {
            const g = docSnap.data() as GoalItem;
            remoteGoals.push({
              ...g,
              status: computeDerivedGoalStatus(g),
            });
          });
          setPersisted((prev) => ({
            ...prev,
            goals: remoteGoals,
          }));
        },
        (error) => {
          console.warn('Firestore goals snapshot listener note:', error.message);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Realtime goals sync error:', err);
    }
  }, [firebaseAuthUser, persisted.user?.uid, persisted.authStage]);

  // Real-time Firestore sync for Chat History
  useEffect(() => {
    const uid = persisted.user?.uid;
    if (
      !firebaseAuthUser ||
      !uid ||
      uid === GUEST_UID ||
      firebaseAuthUser.uid !== uid ||
      persisted.authStage !== AuthStage.Authenticated
    ) {
      return;
    }

    try {
      const chatsColRef = collection(db, 'users', uid, 'chats');
      const unsubscribe = onSnapshot(
        chatsColRef,
        (snapshot) => {
          const remoteChats: ChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            remoteChats.push(docSnap.data() as ChatMessage);
          });
          // Sort chronologically
          remoteChats.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeA - timeB;
          });

          if (remoteChats.length > 0) {
            setPersisted((prev) => ({
              ...prev,
              chatHistory: remoteChats,
            }));
          }
        },
        (error) => {
          console.warn('Firestore chats snapshot listener note:', error.message);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Realtime chats sync error:', err);
    }
  }, [firebaseAuthUser, persisted.user?.uid, persisted.authStage]);

  // Remaining daily AI messages calculation (Strict 5 chats per day)
  const remainingAiMessages = useMemo(() => {
    const todayStr = getLocalDateString(new Date(), userTimezone);
    const count = persisted.user.dailyAiDate === todayStr ? (persisted.user.dailyAiCount || 0) : 0;
    return Math.max(0, 5 - count);
  }, [persisted.user.dailyAiCount, persisted.user.dailyAiDate, userTimezone]);

  // Record an AI message sent with Backend Quota Enforcement
  const recordAiMessageSent = useCallback(async (): Promise<boolean> => {
    const todayStr = getLocalDateString(new Date(), userTimezone);
    const currentCount = persisted.user.dailyAiDate === todayStr ? (persisted.user.dailyAiCount || 0) : 0;

    if (currentCount >= 5) {
      showToast("You've used all 5 chats for today. Your next set of chats will be available tomorrow.", 'info');
      return false;
    }

    // Call server-side verification to prevent bypass and enforce concurrent safety
    try {
      const resp = await fetch('/api/chat/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: persisted.user.uid || GUEST_UID,
          timezone: userTimezone,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        showToast(
          errorData.error || "You've used all 5 chats for today. Your next set of chats will be available tomorrow.",
          'info'
        );
        return false;
      }

      const data = await resp.json();
      const updatedCount = data.usedToday ?? currentCount + 1;

      const patch = {
        dailyAiCount: updatedCount,
        dailyAiDate: todayStr,
        timezone: userTimezone,
      };

      setPersisted((prev) => ({
        ...prev,
        user: { ...prev.user, ...patch },
      }));

      if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        try {
          await setDoc(doc(db, 'users', persisted.user.uid), patch, { merge: true });
        } catch {
          // ignore offline sync
        }
      }

      return true;
    } catch {
      // Optimistic offline allowance fallback
      const nextCount = currentCount + 1;
      const patch = {
        dailyAiCount: nextCount,
        dailyAiDate: todayStr,
        timezone: userTimezone,
      };

      setPersisted((prev) => ({
        ...prev,
        user: { ...prev.user, ...patch },
      }));

      if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        setDoc(doc(db, 'users', persisted.user.uid), patch, { merge: true }).catch(() => {});
      }

      return true;
    }
  }, [persisted.user.dailyAiCount, persisted.user.dailyAiDate, persisted.user.uid, userTimezone, showToast]);

  // Refund message credit if AI response fails (Failed requests should not consume credit)
  const refundAiMessage = useCallback(async (): Promise<void> => {
    const todayStr = getLocalDateString(new Date(), userTimezone);
    const currentCount = persisted.user.dailyAiDate === todayStr ? (persisted.user.dailyAiCount || 0) : 0;
    const newCount = Math.max(0, currentCount - 1);

    fetch('/api/chat/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: persisted.user.uid || GUEST_UID,
        timezone: userTimezone,
      }),
    }).catch(() => {});

    const patch = {
      dailyAiCount: newCount,
      dailyAiDate: todayStr,
      timezone: userTimezone,
    };

    setPersisted((prev) => ({
      ...prev,
      user: { ...prev.user, ...patch },
    }));

    if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
      setDoc(doc(db, 'users', persisted.user.uid), patch, { merge: true }).catch(() => {});
    }
  }, [persisted.user.dailyAiCount, persisted.user.dailyAiDate, persisted.user.uid, userTimezone]);

  // Add Chat Message to conversation history & sync with Firebase
  const addChatMessage = useCallback(
    async (msg: ChatMessage) => {
      const messageWithMeta: ChatMessage = {
        ...msg,
        createdAt: msg.createdAt || new Date().toISOString(),
      };

      setPersisted((prev) => ({
        ...prev,
        chatHistory: [...prev.chatHistory, messageWithMeta],
      }));

      if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        try {
          await setDoc(
            doc(db, 'users', persisted.user.uid, 'chats', messageWithMeta.id),
            messageWithMeta
          );
        } catch (err) {
          console.warn('Chat persistence note:', err);
        }
      }
    },
    [persisted.user.uid]
  );

  // Clear Chat History
  const clearChatHistory = useCallback(async () => {
    setPersisted((prev) => ({
      ...prev,
      chatHistory: [],
    }));

    if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
      try {
        for (const chat of persisted.chatHistory) {
          await deleteDoc(doc(db, 'users', persisted.user.uid, 'chats', chat.id));
        }
      } catch {
        // ignore
      }
    }
    showToast('Chat history cleared', 'info');
  }, [persisted.user.uid, persisted.chatHistory, showToast]);

  // Google Login
  const loginWithGoogle = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setFirebaseAuthUser(user);
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
    setFirebaseAuthUser(null);
    setPersisted((prev) => ({
      ...prev,
      authStage: AuthStage.Welcome,
      user: INITIAL_USER_PROFILE,
    }));
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  // UpgradeToPro stub (Pro model removed)
  const upgradeToPro = useCallback(async (): Promise<boolean> => {
    return true;
  }, []);

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
    async (patch: Partial<GoalPreferences>) => {
      setPersisted((prev) => ({
        ...prev,
        goalPreferences: { ...prev.goalPreferences, ...patch },
      }));

      if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        try {
          await setDoc(doc(db, 'users', persisted.user.uid), { goalPreferences: patch }, { merge: true });
        } catch {
          // ignore
        }
      }
      showToast('Preferences saved', 'success');
    },
    [persisted.user.uid, showToast]
  );

  // Add Goal with deadline & live status
  const addGoal = useCallback(
    async (
      payload: Omit<
        GoalItem,
        'id' | 'amountSaved' | 'createdAt' | 'completed' | 'transactions' | 'status'
      > & { targetTime?: string }
    ): Promise<boolean> => {
      const id = `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      
      // Ensure targetDate has full time representation
      let targetDateFormatted = payload.targetDate;
      if (targetDateFormatted.length === 10) {
        const timePart = payload.targetTime ? `${payload.targetTime}:00` : '23:59:59';
        targetDateFormatted = `${targetDateFormatted}T${timePart}`;
      }

      const newGoal: GoalItem = {
        ...payload,
        targetDate: targetDateFormatted,
        id,
        amountSaved: 0,
        createdAt: new Date().toISOString(),
        completed: false,
        status: 'active',
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
          console.warn('Firestore goal write note:', err);
        }
      }

      setIsAddGoalModalOpen(false);
      showToast('Goal created! Live deadline countdown active.', 'success');
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
          const updated: GoalItem = { ...g, ...patch };
          if (updated.amountSaved >= updated.goalAmount && !updated.completed) {
            updated.completed = true;
            updated.completedDate = todayIso();
          }
          updated.status = computeDerivedGoalStatus(updated);
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

      const txId = `gt-${Date.now()}`;
      const newTx = {
        id: txId,
        amount,
        date: todayIso(),
        note: note?.trim() || 'Savings Contribution',
      };

      let targetGoal: GoalItem | null = null;

      setPersisted((prev) => {
        const nextGoals = prev.goals.map((g) => {
          if (g.id !== goalId) return g;
          const nextSaved = g.amountSaved + amount;
          const isNowCompleted = nextSaved >= g.goalAmount;
          const updated: GoalItem = {
            ...g,
            amountSaved: nextSaved,
            completed: isNowCompleted || g.completed,
            completedDate: isNowCompleted && !g.completed ? todayIso() : g.completedDate,
            transactions: [newTx, ...g.transactions],
          };
          updated.status = computeDerivedGoalStatus(updated);
          targetGoal = updated;
          return updated;
        });
        return { ...prev, goals: nextGoals };
      });

      if (targetGoal && persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        try {
          await setDoc(doc(db, 'users', persisted.user.uid, 'goals', goalId), targetGoal, {
            merge: true,
          });
        } catch {
          // ignore
        }
      }

      showToast(`+ ₹${amount.toLocaleString('en-IN')} added towards goal!`, 'success');
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
          const removed = g.transactions.find((t) => t.id === txId);
          const deduction = removed ? removed.amount : 0;
          const nextSaved = Math.max(0, g.amountSaved - deduction);
          const updated: GoalItem = {
            ...g,
            amountSaved: nextSaved,
            completed: nextSaved >= g.goalAmount,
            transactions: g.transactions.filter((t) => t.id !== txId),
          };
          updated.status = computeDerivedGoalStatus(updated);
          targetGoal = updated;
          return updated;
        });
        return { ...prev, goals: nextGoals };
      });

      if (targetGoal && persisted.user.uid && persisted.user.uid !== GUEST_UID) {
        try {
          await setDoc(doc(db, 'users', persisted.user.uid, 'goals', goalId), targetGoal, {
            merge: true,
          });
        } catch {
          // ignore
        }
      }

      showToast('Transaction removed', 'info');
    },
    [persisted.user.uid, showToast]
  );

  // Portfolio Totals
  const totalGoalsTarget = useMemo(
    () => persisted.goals.reduce((acc, g) => acc + g.goalAmount, 0),
    [persisted.goals]
  );

  const totalGoalsSaved = useMemo(
    () => persisted.goals.reduce((acc, g) => acc + g.amountSaved, 0),
    [persisted.goals]
  );

  const activeGoalsCount = useMemo(
    () => persisted.goals.filter((g) => !g.completed && g.status !== 'overdue').length,
    [persisted.goals]
  );

  const completedGoalsCount = useMemo(
    () => persisted.goals.filter((g) => g.completed).length,
    [persisted.goals]
  );

  // Standalone Data Export (Unlocked for all users)
  const exportGoalsData = useCallback(() => {
    try {
      const payload = {
        app: 'Goal App',
        exportedAt: new Date().toISOString(),
        goals: persisted.goals,
        goalPreferences: persisted.goalPreferences,
        user: {
          name: persisted.user.name,
          email: persisted.user.email,
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

  // Standalone Data Import (Unlocked for all users)
  const importGoalsData = useCallback(
    async (jsonStr: string): Promise<boolean> => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed && Array.isArray(parsed.goals)) {
          const sanitizedGoals = parsed.goals.map((g: GoalItem) => ({
            ...g,
            status: computeDerivedGoalStatus(g),
          }));

          setPersisted((prev) => ({
            ...prev,
            goals: sanitizedGoals,
            goalPreferences: parsed.goalPreferences
              ? { ...prev.goalPreferences, ...parsed.goalPreferences }
              : prev.goalPreferences,
          }));

          // Sync to Firestore if authenticated
          if (persisted.user.uid && persisted.user.uid !== GUEST_UID) {
            for (const g of sanitizedGoals) {
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
      goals: INITIAL_SAMPLE_GOALS.map((g) => ({ ...g, status: computeDerivedGoalStatus(g) })),
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
      secondsUntilMidnight,
      nextMidnightResetIso,
      recordAiMessageSent,
      refundAiMessage,
      chatHistory: persisted.chatHistory,
      addChatMessage,
      clearChatHistory,
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
      persisted.chatHistory,
      persisted.goals,
      persisted.goalPreferences,
      persisted.hasSeenTutorial,
      updateUser,
      loginWithGoogle,
      logout,
      isAuthLoading,
      upgradeToPro,
      remainingAiMessages,
      secondsUntilMidnight,
      nextMidnightResetIso,
      recordAiMessageSent,
      refundAiMessage,
      addChatMessage,
      clearChatHistory,
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
