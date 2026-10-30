import React, { useState } from 'react';
import { ArrowRight, Delete, Lock, Phone, ShieldCheck, UserCheck } from 'lucide-react';
import { ONBOARDING_SLIDES } from '../constants/brainvibeData';
import { useBrainVibe } from '../context/BrainVibeContext';
import { AuthStage } from '../types/models';
import { assetUrl } from '../utils/formatters';

export const AuthFlow: React.FC = () => {
  const {
    authStage,
    setAuthStage,
    pendingPhone,
    setPendingPhone,
    user,
    updateUser,
    loginDemoAccount,
    showToast,
  } = useBrainVibe();

  const [slideIndex, setSlideIndex] = useState(0);
  const [otpInput, setOtpInput] = useState('123456');
  const [pinBuffer, setPinBuffer] = useState('');

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [dob, setDob] = useState(user.dob);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(user.gender);
  const [city, setCity] = useState(user.city);
  const [country, setCountry] = useState(user.country);

  const handlePinDigit = (digit: string, mode: 'set' | 'unlock') => {
    if (pinBuffer.length >= 4) return;
    const next = pinBuffer + digit;
    setPinBuffer(next);

    if (next.length === 4) {
      window.setTimeout(() => {
        if (mode === 'set') {
          updateUser({ qpin: next });
          setPinBuffer('');
          setAuthStage(AuthStage.Authenticated);
        } else {
          if (next === user.qpin) {
            setPinBuffer('');
            setAuthStage(AuthStage.Authenticated);
            showToast('Welcome back!', 'success');
          } else {
            setPinBuffer('');
            showToast(`Incorrect QPIN (Demo PIN is ${user.qpin})`, 'error');
          }
        }
      }, 160);
    }
  };

  if (authStage === AuthStage.Onboarding) {
    const slide = ONBOARDING_SLIDES[slideIndex];
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col justify-between px-6 py-8 max-w-xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={assetUrl('bv.png')} alt="BrainVibe" className="w-8 h-8 object-contain" />
            <span className="font-bold text-sm tracking-wide">BrainVibe</span>
          </div>
          <button
            onClick={() => setAuthStage(AuthStage.Login)}
            className="text-xs text-neutral-300 underline hover:text-[#ffcf07] cursor-pointer"
          >
            Skip
          </button>
        </div>

        <div className="my-auto py-8">
          {slide.isHeroIntro ? (
            <div className="space-y-6">
              <img
                src={assetUrl(slide.image)}
                alt="BrainVibe"
                className="w-24 h-24 object-contain"
              />
              <div className="text-4xl sm:text-5xl font-light leading-tight">
                <div>Manage</div>
                <div>Your</div>
                <div className="font-bold text-white">Finances.</div>
              </div>
              <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setSlideIndex(1)}
                  className="px-7 py-3.5 rounded-xl bg-[#ffcf07] text-black font-semibold text-base hover:brightness-105 cursor-pointer"
                >
                  Get Started
                </button>
                <button
                  onClick={loginDemoAccount}
                  className="px-5 py-3.5 rounded-xl bv-neu-secondary text-sm font-medium text-neutral-200 hover:text-[#ffcf07] border border-white/10 cursor-pointer"
                >
                  Continue with Demo Account
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                {slide.title}
              </h2>
              <div className="h-64 flex items-center justify-center p-4">
                <img
                  src={assetUrl(slide.image)}
                  alt={slide.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <p className="text-sm sm:text-base text-neutral-300 max-w-sm mx-auto leading-relaxed">
                {slide.subtitle}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-1.5">
            {ONBOARDING_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setSlideIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === slideIndex ? 'w-6 bg-[#ffcf07]' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (slideIndex + 1 >= ONBOARDING_SLIDES.length) {
                setAuthStage(AuthStage.Login);
              } else {
                setSlideIndex((i) => i + 1);
              }
            }}
            className="w-12 h-12 rounded-full bv-neu-primary flex items-center justify-center border border-white/10 hover:border-[#ffcf07] cursor-pointer"
          >
            <img src={assetUrl('ARROW1.svg')} alt="Next" className="w-4 h-4 object-contain" />
          </button>
        </div>
      </div>
    );
  }

  if (authStage === AuthStage.Login || authStage === AuthStage.OtpVerify) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bv-neu-secondary rounded-3xl p-7 border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <img src={assetUrl('bv.png')} alt="BrainVibe" className="w-11 h-11 object-contain" />
            <div>
              <h1 className="text-xl font-bold">
                {authStage === AuthStage.Login ? 'Sign In to BrainVibe' : 'Verify Mobile OTP'}
              </h1>
              <p className="text-xs text-neutral-400">
                {authStage === AuthStage.Login
                  ? 'Enter your mobile number to continue'
                  : `6-digit code sent to ${pendingPhone}`}
              </p>
            </div>
          </div>

          {authStage === AuthStage.Login ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!pendingPhone.trim()) {
                  showToast('Enter a valid phone number', 'error');
                  return;
                }
                setAuthStage(AuthStage.OtpVerify);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#121212] border border-white/10">
                  <Phone className="w-4 h-4 text-[#ffcf07]" />
                  <input
                    type="tel"
                    value={pendingPhone}
                    onChange={(e) => setPendingPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#ffcf07] text-black font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Send Verification OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (otpInput.trim().length < 4) {
                  showToast('Enter the verification code', 'error');
                  return;
                }
                updateUser({ phoneNumber: pendingPhone });
                setAuthStage(AuthStage.PersonalDetails);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">
                  6-Digit OTP (pre-filled for local verification)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#121212] border border-white/10 text-center tracking-[0.5em] text-lg font-bold text-[#ffcf07] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#ffcf07] text-black font-semibold text-sm cursor-pointer"
              >
                Verify & Continue
              </button>
              <button
                type="button"
                onClick={() => setAuthStage(AuthStage.Login)}
                className="w-full text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Change phone number
              </button>
            </form>
          )}

          <div className="pt-3 border-t border-white/10">
            <button
              onClick={loginDemoAccount}
              className="w-full py-2.5 rounded-xl bg-[#121212] text-xs font-medium text-neutral-300 hover:text-[#ffcf07] flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#ffcf07]" />
              <span>Instant Sign-In with Populated Demo Profile</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authStage === AuthStage.PersonalDetails) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !email.trim()) {
              showToast('Name and Email are required', 'error');
              return;
            }
            updateUser({ name, email, dob, gender, city, country });
            setAuthStage(AuthStage.SetQpin);
          }}
          className="w-full max-w-lg bv-neu-secondary rounded-3xl p-7 border border-white/10 space-y-4"
        >
          <h1 className="text-xl font-bold">Personal Details</h1>
          <p className="text-xs text-neutral-400">
            Complete your BrainVibe profile before setting your 4-digit Quick PIN.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Country</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#ffcf07] text-black font-semibold text-sm mt-2 cursor-pointer"
          >
            Continue to Quick PIN Setup
          </button>
        </form>
      </div>
    );
  }

  const isSetMode = authStage === AuthStage.SetQpin;
  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm bv-neu-secondary rounded-3xl p-7 border border-white/10 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[#121212] border border-[#ffcf07]/40 flex items-center justify-center mx-auto text-[#ffcf07]">
          {isSetMode ? <ShieldCheck className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
        </div>

        <div>
          <h1 className="text-xl font-bold">
            {isSetMode ? 'Set 4-Digit Quick PIN' : `Welcome Back, ${user.name.split(' ')[0]}`}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {isSetMode
              ? 'Create a 4-digit QPIN for rapid access'
              : `Enter your 4-digit QPIN to unlock (Default: ${user.qpin})`}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 py-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                pinBuffer.length > i
                  ? 'bg-[#ffcf07] scale-110'
                  : 'bg-white/15 border border-white/30'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-[250px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => handlePinDigit(d, isSetMode ? 'set' : 'unlock')}
              className="h-14 rounded-2xl bv-neu-primary text-lg font-semibold hover:text-[#ffcf07] active:scale-95 transition cursor-pointer"
            >
              {d}
            </button>
          ))}
          <button
            onClick={loginDemoAccount}
            title="Bypass with Biometric / Quick Unlock"
            className="h-14 rounded-2xl bv-neu-primary flex items-center justify-center hover:opacity-80 cursor-pointer"
          >
            <img
              src={assetUrl('fingerprint.svg')}
              alt="Fingerprint"
              className="w-6 h-6 object-contain"
            />
          </button>
          <button
            onClick={() => handlePinDigit('0', isSetMode ? 'set' : 'unlock')}
            className="h-14 rounded-2xl bv-neu-primary text-lg font-semibold hover:text-[#ffcf07] active:scale-95 transition cursor-pointer"
          >
            0
          </button>
          <button
            onClick={() => setPinBuffer((b) => b.slice(0, -1))}
            className="h-14 rounded-2xl bv-neu-primary flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setAuthStage(AuthStage.Onboarding)}
          className="text-xs text-neutral-400 hover:text-[#ffcf07] underline cursor-pointer"
        >
          Switch Account / View Onboarding
        </button>
      </div>
    </div>
  );
};
