export enum MainTab {
  Goals = 'goals',
  Contributions = 'contributions',
  Settings = 'settings',
  Home = 'home',
  Insights = 'insights',
  News = 'news',
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

export enum SubScreen {
  None = 'none',
  Income = 'income',
  Expenses = 'expenses',
  CreditCards = 'credit_cards',
  Controls = 'controls',
  Tradebook = 'tradebook',
  Market = 'market',
  Profile = 'profile',
  PaymentOffers = 'payment_offers',
  Coins = 'coins',
  Bookmarks = 'bookmarks',
  Tutorials = 'tutorials',
  Help = 'help',
}

export enum AuthStage {
  Onboarding = 'onboarding',
  Login = 'login',
  OtpVerify = 'otp_verify',
  PersonalDetails = 'personal_details',
  SetQpin = 'set_qpin',
  UnlockQpin = 'unlock_qpin',
  Authenticated = 'authenticated',
}

export type ExpenseCategoryName =
  | 'Education'
  | 'Shopping'
  | 'Bills'
  | 'Grocery'
  | 'Health'
  | 'Fuel'
  | 'Travel'
  | 'Transportation'
  | 'Dining'
  | 'Others';

export type IncomeCategoryName = 'Salary' | 'Business' | 'Trading' | 'Others';

export type RepeatCycle = 'Weekly' | 'Monthly' | 'Yearly' | 'None';

export type GoalCycle = 'Weekly' | 'Monthly' | 'Yearly';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  country: string;
  city: string;
  avatarUrl: string;
  qpin: string;
  bvCoins: number;
  referralCode: string;
  isPro: boolean;
  planName: 'Basic' | 'Monthly Pro' | 'Yearly Pro' | '7-Day Trial';
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  logoPath: string;
  updatedAt: string;
}

export interface IncomeItem {
  id: string;
  title: string;
  category: IncomeCategoryName;
  amount: number;
  date: string;
  repeat: RepeatCycle;
  mode: 'cash' | 'bank';
  bankId?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  category: ExpenseCategoryName;
  customCategory?: string;
  amount: number;
  date: string;
  paymentMode: 'Cash' | 'Bank' | 'Credit Card';
  sourceId?: string;
}

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
  transactions: GoalTransaction[];
}

export type CardNetwork = 'VISA' | 'MASTERCARD' | 'RUPAY';

export interface CreditCardItem {
  id: string;
  bankIssuer: string;
  cardHolderName: string;
  cardNumber: string;
  network: CardNetwork;
  creditLimit: number;
  outstandingAmount: number;
  openDate: string;
  gradientIndex: number;
}

export interface TradeFundItem {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  note?: string;
}

export interface TradeLogItem {
  id: string;
  date: string;
  result: 'profit' | 'loss';
  segment: 'intraday' | 'swing';
  amount: number;
  comments: string;
}

export interface NetworthPoint {
  label: string;
  date: string;
  value: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  source: string;
  publishedAt: string;
  category: 'top' | 'business' | 'technology' | 'pro';
  imageUrl?: string;
  url?: string;
  isProOnly?: boolean;
}

export interface StorySlide {
  id: string;
  title: string;
  caption: string;
  imagePath: string;
  ctaLabel?: string;
  targetScreen?: SubScreen;
}

export interface CryptoCoin {
  id: string;
  name: string;
  symbol: string;
  priceInr: number;
  change24h: number;
  marketCapInr?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
