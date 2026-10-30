import React, { useRef, useState } from 'react';
import { useBrainVibe } from '../context/BrainVibeContext';
import { GoalCycle, NewsArticle, SubScreen, UserProfile } from '../types/models';
import {
  User,
  Shield,
  Coins,
  Bookmark,
  LogOut,
  Gift,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  CreditCard,
  Bell,
  Lock,
  Edit2,
  X,
  ExternalLink,
  Info,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  Download,
  Upload,
  RotateCcw,
  Key,
  Target,
  Sliders,
} from 'lucide-react';
import { assetUrl, formatINR } from '../utils/formatters';

// ---------------- PROFILE VIEW ----------------
export const ProfileView: React.FC = () => {
  const { user, updateUser, openSubScreen, logoutToOnboarding, lockWithQpin } = useBrainVibe();
  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [city, setCity] = useState(user.city);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, phoneNumber, city });
    setShowEdit(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <button
          onClick={() => {
            setName(user.name);
            setEmail(user.email);
            setPhoneNumber(user.phoneNumber);
            setCity(user.city);
            setShowEdit(true);
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#ffcf07] hover:underline cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-[#181818] border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-[#ffcf07] text-black font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-[#ffcf07]/20 shrink-0">
          {user.name ? user.name.slice(0, 2).toUpperCase() : 'BV'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-white">{user.name || 'BrainVibe Member'}</h2>
            {user.isPro ? (
              <span className="inline-flex items-center gap-1 bg-[#ffcf07] text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider self-center sm:self-auto">
                <Sparkles className="w-3 h-3" /> {user.planName}
              </span>
            ) : (
              <span className="inline-block bg-white/10 text-neutral-400 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase self-center sm:self-auto">
                FREE BASIC PLAN
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-400">{user.email || 'user@brainvibe.app'}</p>
          <p className="text-xs text-neutral-500">{user.phoneNumber || '+91 98765 43210'} • {user.city}, {user.country}</p>

          {!user.isPro && (
            <div className="pt-4">
              <button
                onClick={() => openSubScreen(SubScreen.PaymentOffers)}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs px-4 py-2 rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-[#ffcf07]/20"
              >
                Upgrade to Pro (₹499/yr)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => openSubScreen(SubScreen.Coins)}
          className="bg-[#181818] border border-white/5 rounded-2xl p-4 text-left hover:border-white/15 transition cursor-pointer"
        >
          <span className="text-xs text-neutral-400 block mb-1">Coins Balance</span>
          <span className="text-xl font-bold text-[#ffcf07] flex items-center gap-1.5">
            <Coins className="w-5 h-5" />
            {user.bvCoins} BV
          </span>
        </button>

        <button
          onClick={lockWithQpin}
          className="bg-[#181818] border border-white/5 rounded-2xl p-4 text-left hover:border-white/15 transition cursor-pointer"
        >
          <span className="text-xs text-neutral-400 block mb-1">Security PIN</span>
          <span className="text-xl font-bold text-white flex items-center gap-1.5">
            <Shield className="w-5 h-5 text-[#46AA03]" />
            Active ({user.qpin.replace(/./g, '•')})
          </span>
        </button>
      </div>

      {/* Danger Zone */}
      <div className="pt-4">
        <button
          onClick={logoutToOnboarding}
          className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of BrainVibe</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowEdit(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">Edit Profile Details</h2>
            <p className="text-xs text-neutral-400 mb-6">Update your personal contact details</p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#ffcf07] hover:bg-[#e6bb06] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------- CONTROLS / SETTINGS VIEW ----------------
export const ControlsView: React.FC = () => {
  const {
    user,
    updateUser,
    openSubScreen,
    logoutToOnboarding,
    lockWithQpin,
    openComingSoon,
    goalPreferences,
    updateGoalPreferences,
    exportGoalsData,
    importGoalsData,
    resetDemoData,
    showToast,
  } = useBrainVibe();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      showToast('QPIN must be exactly 4 digits', 'error');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('PIN confirmation does not match', 'error');
      return;
    }
    updateUser({ qpin: newPin });
    setShowPinModal(false);
    setNewPin('');
    setConfirmPin('');
    showToast('Security QPIN updated successfully!', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importGoalsData(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white">Controls & Settings</h1>
        <p className="text-sm text-neutral-400">
          Preferences, goal automation rules, security, and account management
        </p>
      </div>

      {/* Pro Membership Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-[#ffcf07]/30 rounded-3xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#ffcf07] text-black flex items-center justify-center font-black">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {user.isPro ? `BrainVibe ${user.planName} Active` : 'Unlock BrainVibe Pro'}
            </h3>
            <p className="text-xs text-neutral-400">
              {user.isPro
                ? 'All premium goal analytics & custom milestones unlocked'
                : 'Advanced goal projections, tax calculators & unlimited targets'}
            </p>
          </div>
        </div>

        {!user.isPro && (
          <button
            onClick={() => openSubScreen(SubScreen.PaymentOffers)}
            className="bg-[#ffcf07] text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e6bb06] transition-colors cursor-pointer shrink-0"
          >
            Upgrade
          </button>
        )}
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => openSubScreen(SubScreen.Coins)}
          className="bg-[#181818] border border-white/5 hover:border-white/15 p-4 rounded-2xl text-center cursor-pointer transition"
        >
          <Coins className="w-6 h-6 text-[#ffcf07] mx-auto mb-1.5" />
          <span className="text-xs font-semibold text-white block">BV Coins</span>
        </button>

        <button
          onClick={() => openSubScreen(SubScreen.Profile)}
          className="bg-[#181818] border border-white/5 hover:border-white/15 p-4 rounded-2xl text-center cursor-pointer transition"
        >
          <User className="w-6 h-6 text-[#ffcf07] mx-auto mb-1.5" />
          <span className="text-xs font-semibold text-white block">My Profile</span>
        </button>

        <button
          onClick={() => openSubScreen(SubScreen.Tutorials)}
          className="bg-[#181818] border border-white/5 hover:border-white/15 p-4 rounded-2xl text-center cursor-pointer transition"
        >
          <BookOpen className="w-6 h-6 text-[#ffcf07] mx-auto mb-1.5" />
          <span className="text-xs font-semibold text-white block">Tutorials</span>
        </button>

        <button
          onClick={() => openSubScreen(SubScreen.Help)}
          className="bg-[#181818] border border-white/5 hover:border-white/15 p-4 rounded-2xl text-center cursor-pointer transition"
        >
          <HelpCircle className="w-6 h-6 text-[#ffcf07] mx-auto mb-1.5" />
          <span className="text-xs font-semibold text-white block">Help & Support</span>
        </button>
      </div>

      {/* Goal Setting & Automation Preferences */}
      <div className="bg-[#181818] border border-white/5 rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#ffcf07]" />
          <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
            Goal Setting Preferences
          </h3>
        </div>

        {/* Default Frequency */}
        <div className="py-2 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Default Payment Cycle</p>
            <p className="text-xs text-neutral-500">
              Preset frequency when adding new savings goals
            </p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#121212] border border-white/5 shrink-0">
            {(['Weekly', 'Monthly', 'Yearly'] as GoalCycle[]).map((cycle) => (
              <button
                key={cycle}
                onClick={() => updateGoalPreferences({ defaultCycle: cycle })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  goalPreferences?.defaultCycle === cycle
                    ? 'bg-[#ffcf07] text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cycle}
              </button>
            ))}
          </div>
        </div>

        {/* Auto-calculate Installments */}
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div>
            <p className="text-sm font-semibold text-white">Auto-Calculate Savings Pace</p>
            <p className="text-xs text-neutral-500">
              Calculate exact amount required per week or month to meet deadline
            </p>
          </div>
          <input
            type="checkbox"
            checked={goalPreferences?.autoCalculatePace ?? true}
            onChange={(e) =>
              updateGoalPreferences({ autoCalculatePace: e.target.checked })
            }
            className="w-4 h-4 accent-[#ffcf07] cursor-pointer"
          />
        </div>

        {/* Milestone Reminders */}
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div>
            <p className="text-sm font-semibold text-white">Milestone Progress Alerts</p>
            <p className="text-xs text-neutral-500">
              Celebration notifications at 25%, 50%, 75%, and 100% completion
            </p>
          </div>
          <input
            type="checkbox"
            checked={goalPreferences?.milestoneReminders ?? true}
            onChange={(e) =>
              updateGoalPreferences({ milestoneReminders: e.target.checked })
            }
            className="w-4 h-4 accent-[#ffcf07] cursor-pointer"
          />
        </div>

        {/* Due Date Overdue Alerts */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-semibold text-white">Target Date Deadlines</p>
            <p className="text-xs text-neutral-500">
              Highlight goals with less than 30 days remaining in yellow
            </p>
          </div>
          <input
            type="checkbox"
            checked={goalPreferences?.overdueAlerts ?? true}
            onChange={(e) =>
              updateGoalPreferences({ overdueAlerts: e.target.checked })
            }
            className="w-4 h-4 accent-[#ffcf07] cursor-pointer"
          />
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-[#181818] border border-white/5 rounded-3xl p-5 space-y-4">
        <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
          Security & Privacy
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-[#ffcf07]" />
            <div>
              <p className="text-sm font-semibold text-white">Quick PIN (QPIN)</p>
              <p className="text-xs text-neutral-500">
                4-digit PIN required on app resume (Currently {user.qpin.replace(/./g, '•')})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setNewPin('');
                setConfirmPin('');
                setShowPinModal(true);
              }}
              className="text-xs font-semibold text-neutral-300 hover:text-white cursor-pointer"
            >
              Change PIN
            </button>
            <button
              onClick={lockWithQpin}
              className="text-xs font-semibold text-[#ffcf07] hover:underline cursor-pointer"
            >
              Lock Now
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-[#ffcf07]" />
            <div>
              <p className="text-sm font-semibold text-white">Biometric Lock</p>
              <p className="text-xs text-neutral-500">Unlock via Face ID / Fingerprint</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={goalPreferences?.biometrics ?? true}
            onChange={(e) =>
              updateGoalPreferences({ biometrics: e.target.checked })
            }
            className="w-4 h-4 accent-[#ffcf07] cursor-pointer"
          />
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-[#181818] border border-white/5 rounded-3xl p-5 space-y-4">
        <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
          Preferences
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-[#ffcf07]" />
            <div>
              <p className="text-sm font-semibold text-white">Push Notifications</p>
              <p className="text-xs text-neutral-500">
                Savings milestones, goal pacing tips, and reminders
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={goalPreferences?.notifications ?? true}
            onChange={(e) =>
              updateGoalPreferences({ notifications: e.target.checked })
            }
            className="w-4 h-4 accent-[#ffcf07] cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-[#ffcf07]" />
            <div>
              <p className="text-sm font-semibold text-white">Currency & Format</p>
              <p className="text-xs text-neutral-500">Default financial denomination</p>
            </div>
          </div>
          <select
            value={goalPreferences?.currency || 'INR'}
            onChange={(e) =>
              updateGoalPreferences({
                currency: e.target.value as 'INR' | 'USD' | 'EUR' | 'GBP',
              })
            }
            className="px-3 py-1.5 rounded-xl bg-[#121212] border border-white/10 text-xs text-white focus:outline-none focus:border-[#ffcf07] cursor-pointer"
          >
            <option value="INR">Indian Rupee (₹ INR)</option>
            <option value="USD">US Dollar ($ USD)</option>
            <option value="EUR">Euro (€ EUR)</option>
            <option value="GBP">British Pound (£ GBP)</option>
          </select>
        </div>
      </div>

      {/* Standalone Data Management & Backup */}
      <div className="bg-[#181818] border border-white/5 rounded-3xl p-5 space-y-4">
        <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
          Data Management & Backup
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={exportGoalsData}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#121212] hover:bg-white/5 border border-white/10 text-xs font-semibold text-white transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#ffcf07]" />
            <span>Export Goals Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#121212] hover:bg-white/5 border border-white/10 text-xs font-semibold text-white transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#46AA03]" />
            <span>Restore From Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <button
          onClick={() => {
            if (
              window.confirm(
                'Are you sure you want to restore the default sample goals? Any unsaved edits will be refreshed.'
              )
            ) {
              resetDemoData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Goals</span>
        </button>
      </div>

      {/* Legal & About */}
      <div className="bg-[#181818] border border-white/5 rounded-3xl p-5 space-y-2">
        <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-wider mb-2">
          Legal & Support
        </h3>

        <button
          onClick={() =>
            openComingSoon(
              'Terms & Conditions',
              'BrainVibe Goals terms of service and end-user license agreements.'
            )
          }
          className="w-full flex items-center justify-between py-2.5 text-xs text-neutral-300 hover:text-white cursor-pointer"
        >
          <span>Terms & Conditions</span>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
        </button>

        <button
          onClick={() =>
            openComingSoon(
              'Privacy Policy',
              'We value your privacy. All financial goals and contribution logs are locally stored and never transmitted to third parties.'
            )
          }
          className="w-full flex items-center justify-between py-2.5 text-xs text-neutral-300 hover:text-white cursor-pointer"
        >
          <span>Privacy Policy</span>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
        </button>

        <button
          onClick={() =>
            openComingSoon(
              'About BrainVibe Goals',
              'BrainVibe Goals — standalone financial milestone planner and automated savings calculator.'
            )
          }
          className="w-full flex items-center justify-between py-2.5 text-xs text-neutral-300 hover:text-white cursor-pointer"
        >
          <span>About BrainVibe Goals</span>
          <Info className="w-3.5 h-3.5 text-neutral-500" />
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={logoutToOnboarding}
        className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-3.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of BrainVibe</span>
      </button>

      {/* Change QPIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#181818] rounded-3xl p-6 border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#ffcf07]" />
                <h3 className="text-lg font-bold text-white">Change Security QPIN</h3>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                className="p-1.5 rounded-xl bg-[#121212] text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePin} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  New 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-center text-xl tracking-widest text-white focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Confirm 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={confirmPin}
                  onChange={(e) =>
                    setConfirmPin(e.target.value.replace(/\D/g, ''))
                  }
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-center text-xl tracking-widest text-white focus:outline-none focus:border-[#ffcf07]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#ffcf07] text-black font-semibold text-sm hover:brightness-105 cursor-pointer transition"
              >
                Update PIN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------- COINS & REWARDS VIEW ----------------
export const CoinsView: React.FC = () => {
  const { user, claimReferralReward, openComingSoon } = useBrainVibe();
  const [claimed, setClaimed] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralCode = user.referralCode || 'BVIBE77';

  const handleClaimDaily = () => {
    if (claimed) return;
    claimReferralReward('DAILY_CLAIM');
    setClaimed(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://brainvibe.app/invite?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>BrainVibe Coins</span>
          <Coins className="w-6 h-6 text-[#ffcf07]" />
        </h1>
        <p className="text-sm text-neutral-400">Earn coins via daily check-ins & invite friends to redeem store rewards</p>
      </div>

      {/* Hero Coins Card */}
      <div className="bg-gradient-to-br from-[#181818] via-amber-950/20 to-[#181818] border border-[#ffcf07]/30 rounded-3xl p-6 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-[#ffcf07]/20 border border-[#ffcf07]/40 flex items-center justify-center mx-auto mb-3">
          <Coins className="w-8 h-8 text-[#ffcf07]" />
        </div>
        <p className="text-xs uppercase font-bold text-neutral-400 tracking-wider">Your Balance</p>
        <p className="text-4xl font-black text-white mt-1">
          {user.bvCoins} <span className="text-lg text-[#ffcf07]">COINS</span>
        </p>

        <div className="mt-5">
          <button
            onClick={handleClaimDaily}
            disabled={claimed}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              claimed
                ? 'bg-white/10 text-neutral-500 cursor-not-allowed'
                : 'bg-[#ffcf07] hover:bg-[#e6bb06] text-black shadow-lg shadow-[#ffcf07]/20'
            }`}
          >
            {claimed ? 'Claimed Today (+100 Coins)' : 'Claim Daily Reward (+100 Coins)'}
          </button>
        </div>
      </div>

      {/* Refer & Earn */}
      <div className="bg-[#181818] border border-white/5 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Gift className="w-5 h-5 text-[#ffcf07]" />
          <div>
            <h3 className="text-sm font-bold text-white">Refer & Earn 250 Coins</h3>
            <p className="text-xs text-neutral-400">Share your invite link with fellow investors</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded-2xl p-2.5">
          <span className="text-xs font-mono text-neutral-300 flex-1 truncate px-2">
            brainvibe.app/invite?ref={referralCode}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 bg-[#ffcf07] text-black px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#e6bb06] cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Redeem Rewards Store */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Redeem Coins</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: '1 Month BrainVibe Pro', cost: 1000, desc: 'Full premium analytics' },
            { title: 'Swiggy ₹250 Voucher', cost: 2500, desc: 'Dining gift coupon' },
            { title: 'Amazon ₹500 Gift Card', cost: 5000, desc: 'Online shopping credit' },
            { title: 'Stock Trading Course', cost: 1500, desc: 'Technical analysis masterclass' }
          ].map(reward => (
            <div
              key={reward.title}
              className="bg-[#181818] border border-white/5 rounded-2xl p-4 flex flex-col justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{reward.title}</h4>
                <p className="text-xs text-neutral-500 mt-0.5">{reward.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <span className="text-xs font-bold text-[#ffcf07]">{reward.cost} Coins</span>
                <button
                  onClick={() => openComingSoon(`Redeem: ${reward.title}`, `Exchange ${reward.cost} BV Coins for ${reward.title}. Partner inventory connects in next release.`)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Redeem
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------------- BOOKMARKS VIEW ----------------
export const BookmarksView: React.FC = () => {
  const { newsArticles, bookmarkedIds, toggleBookmark, setActiveArticle } = useBrainVibe();
  const bookmarkedNews = newsArticles.filter(n => bookmarkedIds.includes(n.id));

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>Bookmarked Articles</span>
          <Bookmark className="w-5 h-5 text-[#ffcf07]" />
        </h1>
        <p className="text-sm text-neutral-400">Articles you've saved for later reading</p>
      </div>

      {bookmarkedNews.length === 0 ? (
        <div className="bg-[#181818] border border-white/5 rounded-3xl p-12 text-center">
          <Bookmark className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-white font-bold text-base">No bookmarks saved yet</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Tap the bookmark icon on any article in the News feed to save it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarkedNews.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveArticle(item)}
              className="bg-[#181818] border border-white/5 hover:border-white/15 rounded-2xl p-4 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <img src={item.imageUrl || assetUrl('NEWS.svg')} alt="" className="w-16 h-16 rounded-xl object-cover bg-neutral-900" />
                <div>
                  <div className="text-[10px] text-[#ffcf07] uppercase font-bold tracking-wider">
                    {item.category} • {item.source}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#ffcf07] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{item.description}</p>
                </div>
              </div>

              <button
                onClick={e => {
                  e.stopPropagation();
                  toggleBookmark(item.id);
                }}
                className="p-2 text-[#ffcf07] hover:bg-white/5 rounded-xl cursor-pointer"
                title="Remove"
              >
                <Bookmark className="w-4 h-4 fill-[#ffcf07]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------- PAYMENT OFFERS VIEW ----------------
export const PaymentOffersView: React.FC = () => {
  const { user, activatePlanPreview } = useBrainVibe();

  const plans: Array<{
    name: UserProfile['planName'];
    price: string;
    period: string;
    highlight?: boolean;
    features: string[];
  }> = [
    {
      name: '7-Day Trial',
      price: '₹0',
      period: '7 days',
      features: ['Full Pro feature test drive', 'Advanced networth graphs', 'Cancel anytime']
    },
    {
      name: 'Monthly Pro',
      price: '₹59',
      period: '/month',
      features: ['Unlimited custom goals', 'Tax harvesting insights', 'Crypto & Stocks tracking', 'Monthly spending audit']
    },
    {
      name: 'Yearly Pro',
      price: '₹499',
      period: '/year',
      highlight: true,
      features: [
        'Save 30% on annual billing',
        'VIP priority market news alerts',
        'Direct wealth advisor consultation',
        'Unlimited bank accounts and trade logs'
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase font-extrabold text-[#ffcf07] tracking-wider bg-[#ffcf07]/10 px-3 py-1 rounded-full border border-[#ffcf07]/20">
          BrainVibe Pro Membership
        </span>
        <h1 className="text-3xl font-extrabold text-white">Elevate Your Financial Freedom</h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          Professional-grade portfolio analytics, automated tax deductions, and unlimited goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {plans.map(p => {
          const isCurrent = user.planName === p.name;
          return (
            <div
              key={p.name}
              className={`bg-[#181818] rounded-3xl p-6 flex flex-col justify-between transition-all relative ${
                p.highlight
                  ? 'border-2 border-[#ffcf07] shadow-xl shadow-[#ffcf07]/10 scale-102'
                  : 'border border-white/5 hover:border-white/15'
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ffcf07] text-black text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-2">{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-white">{p.price}</span>
                  <span className="text-xs text-neutral-400">{p.period}</span>
                </div>

                <div className="space-y-2.5 border-t border-white/5 pt-4">
                  {p.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#ffcf07] shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => activatePlanPreview(p.name)}
                  className={`w-full py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-white/10 text-neutral-400 cursor-default'
                      : p.highlight
                      ? 'bg-[#ffcf07] hover:bg-[#e6bb06] text-black shadow-lg shadow-[#ffcf07]/20'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : 'Select Plan (Instant Demo)'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------- TUTORIALS VIEW ----------------
export const TutorialsView: React.FC = () => {
  const tutorials = [
    { title: 'Connecting your first bank account', desc: 'Securely link savings accounts and keep liquid cash in sync', time: '3 min read' },
    { title: 'Setting financial goals with installment rules', desc: 'Calculate weekly and monthly targets to buy that home or car', time: '4 min read' },
    { title: 'Managing credit card utilization under 30%', desc: 'How to avoid CIBIL score drops with prompt bill payments', time: '5 min read' },
    { title: 'Logging trading setups in Tradebook', desc: 'Track your Risk to Reward and measure win-rate accurately', time: '4 min read' }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>Tutorials & Guides</span>
          <BookOpen className="w-5 h-5 text-[#ffcf07]" />
        </h1>
        <p className="text-sm text-neutral-400">Master every capability of the BrainVibe finance system</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tutorials.map(tut => (
          <div
            key={tut.title}
            className="bg-[#181818] border border-white/5 hover:border-white/15 p-5 rounded-2xl flex items-center justify-between group transition cursor-pointer"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white group-hover:text-[#ffcf07] transition-colors">{tut.title}</h3>
              <p className="text-xs text-neutral-400">{tut.desc}</p>
              <span className="text-[10px] text-neutral-500 font-medium block pt-1">{tut.time}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------- HELP VIEW ----------------
export const HelpView: React.FC = () => {
  const faqs = [
    { q: 'Is my financial data stored securely?', a: 'Yes! BrainVibe stores all transactions, goals, and credit data locally on your device with state-of-the-art encryption.' },
    { q: 'How does credit card bill payment work in BrainVibe?', a: 'When you tap "Pay Bill" on any credit card, you select one of your connected Bank Accounts. The chosen amount is deducted from that bank and subtracted from the card outstanding balance.' },
    { q: 'What are BrainVibe Coins?', a: 'BrainVibe Coins are reward tokens you earn daily for logging in, maintaining financial hygiene, and referring friends.' }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>Help & Support</span>
          <HelpCircle className="w-5 h-5 text-[#ffcf07]" />
        </h1>
        <p className="text-sm text-neutral-400">Frequently asked questions and support desk</p>
      </div>

      <div className="space-y-4">
        {faqs.map(faq => (
          <div key={faq.q} className="bg-[#181818] border border-white/5 p-5 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-[#ffcf07]">Q.</span> {faq.q}
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed pl-5">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
