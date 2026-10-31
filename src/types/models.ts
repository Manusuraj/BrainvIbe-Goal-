export enum MainTab {
  Goals = 'goals',
  Assistant = 'assistant',
  Settings = 'settings',
  // Backwards compatibility aliases
  Contributions = 'contributions',
  Home = 'goals',
  Insights = 'assistant',
}

export enum SubScreen {
  None = 'none',
  Profile = 'profile',
  ProUpgrade = 'pro_upgrade',
  Tutorial = 'tutorial',
  // Backwards compatibility aliases
  Controls = 'controls',
  Coins = 'coins',
  Tutorials = 'tutorial',
  Help = 'help',
  PaymentOffers = 'pro_upgrade',
  Bookmarks = 'bookmarks',
  Income = 'income',
  Expenses = 'expenses',
  CreditCards = 'credit_cards',
  Tradebook = 'tradebook',
  Market = 'market',
}

export enum AuthStage {
  Welcome = 'welcome',
  Authenticated = 'authenticated',
  // Backwards compatibility aliases
  Onboarding = 'welcome',
  Login = 'welcome',
  OtpVerify = 'welcome',
  PersonalDetails = 'welcome',
  SetQpin = 'welcome',
  UnlockQpin = 'welcome',
}

export type GoalCycle = 'Weekly' | 'Monthly' | 'Yearly';

export interface GoalTransaction {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  amountSaved: number;
  targetDate: string;
  createdAt: string;
  paymentFrequency: GoalCycle;
  completed: boolean;
  completedDate?: string;
  category?: string;
  transactions: GoalTransaction[];
}

export interface GoalPreferences {
  defaultCycle: GoalCycle;
  autoCalculatePace: boolean;
  milestoneReminders: boolean;
  overdueAlerts: boolean;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  notifications: boolean;
  biometrics: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string;
  isPro: boolean;
  planName: 'Free Plan' | 'Premium Annual' | 'Pro Monthly' | 'Pro Yearly' | string;
  subscriptionStatus: 'active' | 'expired' | 'none';
  subscriptionActivatedAt?: string;
  subscriptionExpiry?: string;
  lastPaymentId?: string;
  dailyAiCount: number;
  dailyAiDate: string;
  monthlyAiCount: number;
  monthlyAiMonth: string;
  // Optional legacy fields for seamless transition
  phoneNumber?: string;
  city?: string;
  country?: string;
  qpin?: string;
  bvCoins?: number;
}

export interface PaymentRecord {
  paymentId: string;
  amount: number;
  amountPaise: number;
  currency: string;
  planName: string;
  status: 'captured' | 'failed' | 'pending';
  activatedAt: string;
  expiresAt: string;
  userId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}
