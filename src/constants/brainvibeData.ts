import {
  BankAccount,
  CreditCardItem,
  CryptoCoin,
  ExpenseCategoryName,
  ExpenseItem,
  GoalItem,
  IncomeCategoryName,
  IncomeItem,
  NewsArticle,
  NotificationItem,
  StorySlide,
  SubScreen,
  TradeFundItem,
  TradeLogItem,
  UserProfile,
} from '../types/models';
import { daysAgoIso, daysAheadIso, todayIso } from '../utils/formatters';

export const BV_COLORS = {
  primary: '#121212',
  secondary: '#181818',
  yellow: '#ffcf07',
  green: '#46AA03',
  danger: '#ef4444',
};

export const EXPENSE_CATEGORIES: Record<
  ExpenseCategoryName,
  { color: string; icon: string }
> = {
  Education: { color: '#023E8A', icon: 'expense/EDUCATION.svg' },
  Shopping: { color: '#ade8f4', icon: 'expense/SHOPPING.svg' },
  Bills: { color: '#00b4d8', icon: 'expense/BILLS.svg' },
  Grocery: { color: '#8ac926', icon: 'expense/GROCERY.svg' },
  Health: { color: '#CF9D29', icon: 'expense/HEALTH.svg' },
  Fuel: { color: '#34a0a4', icon: 'expense/FUEL.svg' },
  Travel: { color: '#76c893', icon: 'expense/TRAVEL.svg' },
  Transportation: { color: '#04FF8A', icon: 'expense/TRANSPORT.svg' },
  Dining: { color: '#d9ed92', icon: 'expense/DINING.svg' },
  Others: { color: '#ffcf07', icon: 'expense/OTHER.svg' },
};

export const INCOME_CATEGORY_COLORS: Record<IncomeCategoryName, string> = {
  Salary: '#ffcf07',
  Business: '#00b4d8',
  Trading: '#46AA03',
  Others: '#8ac926',
};

export const CARD_GRADIENTS: string[] = [
  'linear-gradient(135deg, #BD3F32 0%, #CB356B 100%)',
  'linear-gradient(135deg, #433A73 0%, #869FF0 100%)',
  'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
];

export interface PopularBankOption {
  name: string;
  logo: string;
}

export const POPULAR_BANKS: PopularBankOption[] = [
  { name: 'State Bank of India', logo: 'bank/SBI.svg' },
  { name: 'HDFC Bank', logo: 'bank/HDFC.svg' },
  { name: 'ICICI Bank', logo: 'bank/ICICI BANK.svg' },
  { name: 'Axis Bank', logo: 'bank/AXIS BANK.svg' },
  { name: 'Yes Bank', logo: 'bank/YES BANK.svg' },
  { name: 'Punjab National Bank', logo: 'bank/PNB.svg' },
  { name: 'HSBC Bank', logo: 'bank/HSBC.svg' },
  { name: 'Federal Bank', logo: 'bank/federal.svg' },
  { name: 'Indian Bank', logo: 'bank/Indian-Bank-01.svg' },
  { name: 'Saraswat Bank', logo: 'bank/SARASWAT BANK.svg' },
  { name: 'ANZ Bank', logo: 'bank/ANZ.svg' },
];

export const ALL_INDIAN_BANKS: string[] = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Yes Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IDFC FIRST Bank',
  'Federal Bank',
  'Indian Bank',
  'HSBC Bank',
  'Standard Chartered Bank',
  'RBL Bank',
  'South Indian Bank',
  'Bandhan Bank',
  'Saraswat Bank',
];

export interface InvestmentTileConfig {
  id: string;
  label: string;
  icon: string;
  route?: SubScreen;
  description: string;
}

export const INVESTMENT_TILES: InvestmentTileConfig[] = [
  {
    id: 'savings',
    label: 'Savings A/C',
    icon: 'INVESTMENTS/SAVINGS A-C.svg',
    route: SubScreen.Income,
    description: 'Manage linked bank balances and cash savings.',
  },
  {
    id: 'mf',
    label: 'Mutual Funds',
    icon: 'INVESTMENTS/MUTUAL FUNDS.svg',
    description: 'Direct & regular mutual fund SIP portfolio sync.',
  },
  {
    id: 'stocks',
    label: 'Stocks',
    icon: 'INVESTMENTS/STOCKS.svg',
    route: SubScreen.Tradebook,
    description: 'Track Indian equity trades & realized P&L in Tradebook.',
  },
  {
    id: 'crypto',
    label: 'Crypto',
    icon: 'INVESTMENTS/CRYPTO.svg',
    route: SubScreen.Market,
    description: 'Live INR cryptocurrency market prices and top movers.',
  },
  {
    id: 'us_stocks',
    label: 'US Stocks',
    icon: 'INVESTMENTS/US STOCKS.svg',
    description: 'Global equity holdings & fractional US shares.',
  },
  {
    id: 'epf',
    label: 'EPF',
    icon: 'INVESTMENTS/EPF.svg',
    description: 'Employee Provident Fund retirement corpus tracker.',
  },
  {
    id: 'ppf',
    label: 'PPF',
    icon: 'INVESTMENTS/PPF.svg',
    description: 'Public Provident Fund tax-exempt compounding tracker.',
  },
  {
    id: 'fd',
    label: 'FD',
    icon: 'INVESTMENTS/FD.svg',
    description: 'Bank fixed deposits & maturity schedule.',
  },
  {
    id: 'real_estate',
    label: 'Real Estate',
    icon: 'INVESTMENTS/REAL ESTATE.svg',
    description: 'Residential & commercial property valuations.',
  },
  {
    id: 'nps',
    label: 'NPS Tier-1',
    icon: 'INVESTMENTS/NPS TIER 1.svg',
    description: 'National Pension System Tier-1 retirement allocation.',
  },
  {
    id: 'bonds',
    label: 'Bonds',
    icon: 'INVESTMENTS/BONDS.svg',
    description: 'Sovereign Gold Bonds, G-Secs & corporate fixed income.',
  },
  {
    id: 'pms',
    label: 'PMS',
    icon: 'INVESTMENTS/PMS.svg',
    description: 'Portfolio Management Services performance tracking.',
  },
  {
    id: 'aif',
    label: 'AIF',
    icon: 'INVESTMENTS/AIF.svg',
    description: 'Alternative Investment Funds & private market allocations.',
  },
];

export const INSURANCE_TILES = [
  {
    id: 'life',
    label: 'Life Insurance',
    icon: 'HEALTH/LIFE.svg',
    description: 'Term life cover & policy renewal reminders.',
  },
  {
    id: 'health',
    label: 'Health Cover',
    icon: 'HEALTH/HEART.svg',
    description: 'Medical & family floater health insurance policies.',
  },
];

export const CREDIT_TILES = [
  {
    id: 'expenses',
    label: 'Expenses',
    icon: 'CREDIT/EXPENSES.svg',
    route: SubScreen.Expenses,
  },
  {
    id: 'loan',
    label: 'Loan',
    icon: 'CREDIT/LOAN.svg',
  },
  {
    id: 'credit_card',
    label: 'Credit Card',
    icon: 'CREDIT/CREDIT CARD.svg',
    route: SubScreen.CreditCards,
  },
];

export const ONBOARDING_SLIDES = [
  {
    id: 0,
    isHeroIntro: true,
    title: 'Manage Your Finances.',
    subtitle: 'Your all-in-one personal net worth, goals, expenses, credit card & tradebook companion.',
    image: 'bv.png',
  },
  {
    id: 1,
    isHeroIntro: false,
    title: 'Track & Grow your Networth',
    subtitle: 'Track your Investments And Grow With Us',
    image: '0.1 ONBOARDING.svg',
  },
  {
    id: 2,
    isHeroIntro: false,
    title: 'Set Goals',
    subtitle: 'Set Your Goals And We Will Help You Achieve Them!',
    image: '0.2 ONBOARDING.svg',
  },
  {
    id: 3,
    isHeroIntro: false,
    title: 'Insights And Analysis',
    subtitle: 'More Graphs To Help You Track Your Income, Expenses, And More',
    image: '0.36 ONBOARDING.svg',
  },
  {
    id: 4,
    isHeroIntro: false,
    title: 'Tradebook And Market',
    subtitle: 'Track Live Crypto & Trades And Get Analysis Of Your Portfolio',
    image: '0.4 ONBOARDING.svg',
  },
];

export const TUTORIAL_SLIDES = [
  { title: 'Home & Networth Overview', image: 'onboading/UI tutorial-01.png' },
  { title: 'Adding Bank Accounts & Income', image: 'onboading/UI tutorial-02.png' },
  { title: 'Tracking Daily Expenses', image: 'onboading/UI tutorial-03.png' },
  { title: 'Setting & Completing Goals', image: 'onboading/UI tutorial-04.png' },
  { title: 'Managing Credit Card Dues', image: 'onboading/UI tutorial-05.png' },
  { title: 'Monthly & Overall Insights', image: 'onboading/UI tutorial-06.png' },
  { title: 'Logging Intraday & Swing Trades', image: 'onboading/UI tutorial-07.png' },
  { title: 'BrainVibe Coins & Pro Benefits', image: 'onboading/UI tutorial-08.png' },
];

export const INITIAL_USER_PROFILE: UserProfile = {
  uid: 'bv-demo-user-01',
  name: 'Aarav Mehta',
  email: 'aarav.mehta@brainvibe.in',
  phoneNumber: '+91 98765 43210',
  dob: '1996-08-14',
  gender: 'Male',
  country: 'India',
  city: 'Bengaluru',
  avatarUrl: '',
  qpin: '1234',
  bvCoins: 250,
  referralCode: 'BV-AARAV25',
  isPro: false,
  planName: 'Basic',
};

export const INITIAL_BANKS: BankAccount[] = [
  {
    id: 'bank-hdfc-1',
    bankName: 'HDFC Bank',
    accountNumber: '501004829104',
    balance: 284500,
    logoPath: 'bank/HDFC.svg',
    updatedAt: todayIso(),
  },
  {
    id: 'bank-icici-2',
    bankName: 'ICICI Bank',
    accountNumber: '004201583920',
    balance: 142800,
    logoPath: 'bank/ICICI BANK.svg',
    updatedAt: daysAgoIso(2),
  },
  {
    id: 'bank-sbi-3',
    bankName: 'State Bank of India',
    accountNumber: '39104827165',
    balance: 96400,
    logoPath: 'bank/SBI.svg',
    updatedAt: daysAgoIso(5),
  },
];

export const INITIAL_INCOMES: IncomeItem[] = [
  {
    id: 'inc-1',
    title: 'Monthly Tech Lead Salary',
    category: 'Salary',
    amount: 165000,
    date: daysAgoIso(4),
    repeat: 'Monthly',
    mode: 'bank',
    bankId: 'bank-hdfc-1',
  },
  {
    id: 'inc-2',
    title: 'UI Architecture Advisory',
    category: 'Business',
    amount: 42000,
    date: daysAgoIso(9),
    repeat: 'Monthly',
    mode: 'bank',
    bankId: 'bank-icici-2',
  },
  {
    id: 'inc-3',
    title: 'Nifty Swing Dividend & Payout',
    category: 'Trading',
    amount: 18500,
    date: daysAgoIso(12),
    repeat: 'None',
    mode: 'cash',
  },
  {
    id: 'inc-4',
    title: 'Cashback & FD Interest',
    category: 'Others',
    amount: 6400,
    date: daysAgoIso(16),
    repeat: 'Monthly',
    mode: 'bank',
    bankId: 'bank-sbi-3',
  },
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    title: 'Apartment Broadband & Electricity',
    category: 'Bills',
    amount: 4850,
    date: todayIso(),
    paymentMode: 'Bank',
    sourceId: 'bank-hdfc-1',
  },
  {
    id: 'exp-2',
    title: 'Organic Weekly Groceries',
    category: 'Grocery',
    amount: 3420,
    date: daysAgoIso(1),
    paymentMode: 'Credit Card',
    sourceId: 'cc-hdfc-1',
  },
  {
    id: 'exp-3',
    title: 'Shell V-Power Tank Refill',
    category: 'Fuel',
    amount: 4100,
    date: daysAgoIso(2),
    paymentMode: 'Credit Card',
    sourceId: 'cc-icici-2',
  },
  {
    id: 'exp-4',
    title: 'Indiranagar Team Dinner',
    category: 'Dining',
    amount: 2950,
    date: daysAgoIso(3),
    paymentMode: 'Credit Card',
    sourceId: 'cc-hdfc-1',
  },
  {
    id: 'exp-5',
    title: 'Quantitative Finance Masterclass',
    category: 'Education',
    amount: 6500,
    date: daysAgoIso(4),
    paymentMode: 'Bank',
    sourceId: 'bank-icici-2',
  },
  {
    id: 'exp-6',
    title: 'Running Shoes & Apparel',
    category: 'Shopping',
    amount: 7800,
    date: daysAgoIso(5),
    paymentMode: 'Credit Card',
    sourceId: 'cc-hdfc-1',
  },
  {
    id: 'exp-7',
    title: 'Annual Preventive Blood Panel',
    category: 'Health',
    amount: 3600,
    date: daysAgoIso(6),
    paymentMode: 'Cash',
  },
  {
    id: 'exp-8',
    title: 'Coorg Weekend Homestay',
    category: 'Travel',
    amount: 11200,
    date: daysAgoIso(11),
    paymentMode: 'Credit Card',
    sourceId: 'cc-sbi-3',
  },
  {
    id: 'exp-9',
    title: 'Airport Cab & Metro Pass',
    category: 'Transportation',
    amount: 1850,
    date: daysAgoIso(14),
    paymentMode: 'Cash',
  },
];

export const INITIAL_GOALS: GoalItem[] = [
  {
    id: 'goal-1',
    title: 'Emergency Corpus (6 Months)',
    description: 'Liquid high-yield reserve for zero-stress financial runway',
    goalAmount: 300000,
    amountSaved: 195000,
    targetDate: daysAheadIso(180),
    createdAt: daysAgoIso(90),
    paymentFrequency: 'Monthly',
    completed: false,
    transactions: [
      { id: 'gt-1', amount: 120000, date: daysAgoIso(60), note: 'Initial transfer' },
      { id: 'gt-2', amount: 75000, date: daysAgoIso(15), note: 'Monthly top-up' },
    ],
  },
  {
    id: 'goal-2',
    title: 'MacBook Pro M4 Workstation',
    description: 'Hardware upgrade fund without EMI debt',
    goalAmount: 185000,
    amountSaved: 110000,
    targetDate: daysAheadIso(95),
    createdAt: daysAgoIso(45),
    paymentFrequency: 'Weekly',
    completed: false,
    transactions: [
      { id: 'gt-3', amount: 60000, date: daysAgoIso(30), note: 'Bonus allocation' },
      { id: 'gt-4', amount: 50000, date: daysAgoIso(7), note: 'Savings sweep' },
    ],
  },
  {
    id: 'goal-3',
    title: 'Goa Scuba Certification Trip',
    description: 'PADI Open Water course + flights fully saved',
    goalAmount: 55000,
    amountSaved: 55000,
    targetDate: daysAgoIso(10),
    createdAt: daysAgoIso(100),
    paymentFrequency: 'Monthly',
    completed: true,
    completedDate: daysAgoIso(12),
    transactions: [
      { id: 'gt-5', amount: 30000, date: daysAgoIso(50), note: 'First tranche' },
      { id: 'gt-6', amount: 25000, date: daysAgoIso(12), note: 'Final milestone' },
    ],
  },
];

export const INITIAL_CREDIT_CARDS: CreditCardItem[] = [
  {
    id: 'cc-hdfc-1',
    bankIssuer: 'HDFC Regalia Gold',
    cardHolderName: 'AARAV MEHTA',
    cardNumber: '4532891044217834',
    network: 'VISA',
    creditLimit: 500000,
    outstandingAmount: 28450,
    openDate: '2023-04-12',
    gradientIndex: 0,
  },
  {
    id: 'cc-icici-2',
    bankIssuer: 'ICICI Sapphiro',
    cardHolderName: 'AARAV MEHTA',
    cardNumber: '5412750091823319',
    network: 'MASTERCARD',
    creditLimit: 400000,
    outstandingAmount: 12600,
    openDate: '2023-11-05',
    gradientIndex: 1,
  },
  {
    id: 'cc-sbi-3',
    bankIssuer: 'SBI RuPay Select',
    cardHolderName: 'AARAV MEHTA',
    cardNumber: '6073849102836501',
    network: 'RUPAY',
    creditLimit: 250000,
    outstandingAmount: 0,
    openDate: '2024-02-19',
    gradientIndex: 2,
  },
];

export const INITIAL_TRADE_FUNDS: TradeFundItem[] = [
  {
    id: 'tf-1',
    type: 'deposit',
    amount: 200000,
    date: daysAgoIso(28),
    note: 'Initial brokerage capital allocation',
  },
  {
    id: 'tf-2',
    type: 'deposit',
    amount: 50000,
    date: daysAgoIso(14),
    note: 'Swing margin top-up',
  },
  {
    id: 'tf-3',
    type: 'withdraw',
    amount: 20000,
    date: daysAgoIso(5),
    note: 'Partial profit payout to HDFC Bank',
  },
];

export const INITIAL_TRADE_LOGS: TradeLogItem[] = [
  {
    id: 'tl-1',
    date: daysAgoIso(20),
    result: 'profit',
    segment: 'swing',
    amount: 14200,
    comments: 'TCS breakout above 200-DMA, held 6 sessions',
  },
  {
    id: 'tl-2',
    date: daysAgoIso(15),
    result: 'loss',
    segment: 'intraday',
    amount: 3800,
    comments: 'BankNifty opening range whipsaw, strict SL hit',
  },
  {
    id: 'tl-3',
    date: daysAgoIso(9),
    result: 'profit',
    segment: 'intraday',
    amount: 8650,
    comments: 'Reliance VWAP pullback momentum scalp',
  },
  {
    id: 'tl-4',
    date: daysAgoIso(3),
    result: 'profit',
    segment: 'swing',
    amount: 11400,
    comments: 'Larsen & Toubro order-book rally target achieved',
  },
  {
    id: 'tl-5',
    date: daysAgoIso(1),
    result: 'loss',
    segment: 'swing',
    amount: 2650,
    comments: 'Trimmed IT midcap ahead of macro print',
  },
];

export const INITIAL_STORIES: StorySlide[] = [
  {
    id: 'st-1',
    title: '50-30-20 Rule in India',
    caption: 'Keep fixed obligations under 50% of net take-home pay so compounding accelerates effortlessly.',
    imagePath: 'onboading/UI tutorial-06.png',
    ctaLabel: 'Open Insights',
    targetScreen: SubScreen.None,
  },
  {
    id: 'st-2',
    title: 'Zero Credit Card Interest',
    caption: 'Pay total statement dues directly from your linked bank account inside BrainVibe Credit Cards.',
    imagePath: 'onboading/UI tutorial-05.png',
    ctaLabel: 'Manage Cards',
    targetScreen: SubScreen.CreditCards,
  },
  {
    id: 'st-3',
    title: 'Discipline in Tradebook',
    caption: 'Track Intraday vs Swing win rates separately to spot where your real edge lives.',
    imagePath: 'onboading/UI tutorial-07.png',
    ctaLabel: 'Open Tradebook',
    targetScreen: SubScreen.Tradebook,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'HDFC Regalia Statement Due Soon',
    body: '₹ 28,450 unbilled/statement balance tracked. Pay anytime from Credit Cards.',
    timestamp: '2h ago',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Goal Milestone: 65% Reached!',
    body: 'Your Emergency Corpus goal is ₹ 1,95,000 / ₹ 3,00,000.',
    timestamp: 'Yesterday',
    read: false,
  },
  {
    id: 'notif-3',
    title: '250 BrainVibe Coins Credited',
    body: 'Welcome reward unlocked. Share your referral code to earn 50 BV Coins per friend.',
    timestamp: '3d ago',
    read: true,
  },
];

export const CURATED_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'pro-art-1',
    title: 'Building an All-Weather Indian Portfolio Across Equity, Debt & Gold',
    description: 'How combining Nifty 50 index SIPs, Sovereign Gold Bonds, and short-duration debt cushions drawdowns.',
    content:
      'Asset allocation explains over 85% of long-term portfolio variance. For Indian earners balancing career growth with inflation above 5%, a structured core-and-satellite framework outperforms reactive market timing.\n\n1. Emergency Liquidity First: Hold 6 months of mandatory expenses across sweep-in FDs and overnight liquid funds before taking equity risk.\n\n2. Core Equity (60-70%): Low-cost Nifty 50 and Nifty Next 50 index funds capture India’s corporate earnings compounding without fund-manager drift.\n\n3. Sovereign Gold & Fixed Income (20-30%): Gold acts as a rupee-depreciation hedge during global risk-off cycles, while EPF/PPF anchor tax-exempt compounding.\n\n4. Tactical Satellite (10%): Use your BrainVibe Tradebook to ring-fence active swing or intraday capital with strict risk-per-trade rules.',
    source: 'BrainVibe Editorial',
    publishedAt: todayIso(),
    category: 'pro',
    isProOnly: false,
  },
  {
    id: 'pro-art-2',
    title: 'Credit Utilization Ratio: The Hidden Lever Behind an 800+ Credit Score',
    description: 'Why keeping card utilization below 30% across Visa, Mastercard, and RuPay lines lowers borrowing costs.',
    content:
      'Credit bureaus weigh two factors more heavily than almost anything else: on-time payment history and total credit utilization ratio (CUR).\n\nEven if you pay your credit card bill in full every cycle, consistently exhausting 70–80% of your sanctioned credit limit signals liquidity stress to scoring models.\n\nPractical Checklist:\n• Keep aggregate utilization across all cards below 30%.\n• Never pay only the Minimum Amount Due—revolving interest in India ranges from 36% to 42% APR.\n• Retain your oldest zero-annual-fee card to lengthen average credit age.',
    source: 'BrainVibe Research',
    publishedAt: daysAgoIso(2),
    category: 'pro',
    isProOnly: false,
  },
  {
    id: 'pro-art-3',
    title: 'Position Sizing & Drawdown Math Every Swing Trader Must Master',
    description: 'A 50% drawdown requires a 100% gain just to break even. Here is how to cap single-trade risk at 1%.',
    content:
      'Most retail traders obsess over entry setups while ignoring risk-of-ruin mathematics. When a trading account loses 10%, it takes an 11.1% return to recover. Lose 50%, and you need 100% just to return to par.\n\nBy risking no more than 1% of your total Tradebook capital on any single setup—defined before entry via stop-loss distance—you can endure a 7-trade losing streak and still retain over 93% of your capital.\n\nLog every realized profit and loss honestly in your BrainVibe Tradebook, separate Intraday noise from Swing trends, and audit your monthly expectancy.',
    source: 'BrainVibe Pro Desk',
    publishedAt: daysAgoIso(4),
    category: 'pro',
    isProOnly: true,
  },
  {
    id: 'news-top-1',
    title: 'RBI Holds Policy Repo Rate Steady While Maintaining Focus on Durable Disinflation',
    description: 'Monetary Policy Committee highlights resilient domestic urban demand and steady banking liquidity.',
    content:
      'The Reserve Bank of India kept the benchmark policy repo rate unchanged as policymakers balanced robust domestic GDP momentum against food price volatility. Retail borrowers with repo-linked home and auto loans will see stable EMIs this quarter, while banks continue offering attractive 7.0%–7.6% rates on 1-to-3 year fixed deposits.',
    source: 'Financial Desk India',
    publishedAt: todayIso(),
    category: 'top',
  },
  {
    id: 'news-top-2',
    title: 'Monthly Mutual Fund SIP Inflows Cross New Milestone Led by Disciplined Retail Investors',
    description: 'Systematic Investment Plan accounts see record net additions across tier-1 and tier-2 Indian cities.',
    content:
      'Domestic institutional flows powered by monthly retail SIPs continue to counterbalance foreign portfolio volatility in Indian equities. Financial planners note that investors increasingly automate SIP deductions within 48 hours of salary credit—turning savings into a non-negotiable fixed commitment.',
    source: 'Market Pulse',
    publishedAt: daysAgoIso(1),
    category: 'top',
  },
  {
    id: 'news-biz-1',
    title: 'UPI Credit Line & RuPay Credit Card Volumes Surge Across Merchant Categories',
    description: 'Seamless QR interoperability accelerates short-term credit adoption alongside instant bank settlements.',
    content:
      'RuPay credit cards linked to UPI handles have recorded sharp growth in everyday grocery, fuel, and dining transactions. Analysts advise consumers to track micro-credit QR spends diligently inside an expense tracker so small daily taps do not snowball at statement billing.',
    source: 'India Business Wire',
    publishedAt: daysAgoIso(1),
    category: 'business',
  },
  {
    id: 'news-biz-2',
    title: 'Indian Infrastructure & Capital Goods Order Books Hit Multi-Quarter Highs',
    description: 'Power transmission, railway modernization, and data-center capex drive private sector visibility.',
    content:
      'Leading engineering and capital goods bellwethers reported healthy order inflows backed by grid upgrades and manufacturing localization. Institutional desks remain constructive on companies demonstrating clean working-capital cycles and low net debt.',
    source: 'Corporate Chronicle',
    publishedAt: daysAgoIso(2),
    category: 'business',
  },
  {
    id: 'news-tech-1',
    title: 'Account Aggregator Framework Expands Real-Time Financial Consent Architecture',
    description: 'Encrypted consent-based financial data sharing reaches over 100 million linked bank accounts.',
    content:
      'India’s Account Aggregator (AA) digital public infrastructure continues to streamline how individuals consolidate bank statements, tax filings, and investment holdings with explicit, revocable user consent—eliminating manual PDF uploads.',
    source: 'FinTech Review',
    publishedAt: daysAgoIso(1),
    category: 'technology',
  },
  {
    id: 'news-tech-2',
    title: 'Cloud & Semiconductor Engineering R&D Centers Expand Hiring in Bengaluru and Hyderabad',
    description: 'Global capability centers deepen systems engineering, cybersecurity, and silicon verification teams.',
    content:
      'High-value product engineering centers in India are expanding specialized hiring in distributed systems, silicon design, and financial security infrastructure, supporting strong urban salary growth for experienced technologists.',
    source: 'Tech Economy',
    publishedAt: daysAgoIso(3),
    category: 'technology',
  },
];

export const FALLBACK_CRYPTO_INR: CryptoCoin[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', priceInr: 7845200.0, change24h: 2.84 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', priceInr: 268450.5, change24h: 1.92 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', priceInr: 15840.25, change24h: 5.46 },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB', priceInr: 54120.0, change24h: 0.65 },
  { id: 'ripple', name: 'XRP', symbol: 'XRP', priceInr: 198.45, change24h: -1.38 },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', priceInr: 68.9, change24h: -2.74 },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', priceInr: 24.6, change24h: 3.18 },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', priceInr: 592.3, change24h: -0.92 },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', priceInr: 1645.8, change24h: 4.12 },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', priceInr: 8920.0, change24h: -0.45 },
];
