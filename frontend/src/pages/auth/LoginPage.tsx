import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/auth/auth.context';
import { cn } from '../../utils';
import { Eye, EyeOff, ChevronRight, Phone, Smartphone, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { auth as firebaseAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from '../../services/firebase';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = {
  STUDENT: {
    name: 'Demo Student',
    email: 'student@placex.com',
    password: 'Password123!',
    role: 'STUDENT',
    studentId: 'STU2026001',
    department: 'Computer Science',
    course: 'B.Tech',
    graduationYear: 2026,
  },
  COMPANY: {
    name: 'Demo Recruiter',
    email: 'company@placex.com',
    password: 'Password123!',
    role: 'COMPANY',
    companyName: 'TechCorp Solutions',
    industry: 'Software & IT',
  },
  ADMIN: {
    name: 'Demo Administrator',
    email: 'admin@placex.com',
    password: 'Password123!',
    role: 'ADMIN',
  },
};

const ROLE_TABS = [
  { id: 'STUDENT' as const, label: 'Student', sub: 'Campus & placement portal' },
  { id: 'COMPANY' as const, label: 'Company', sub: 'Recruiter & hiring portal' },
  { id: 'ADMIN' as const,   label: 'Admin',   sub: 'Platform administration' },
];

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'COMPANY' | 'ADMIN'>('STUDENT');
  
  // Phone OTP Modal States
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, phoneLogin, register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const from = (location.state as { from?: string })?.from || '/';

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    if (!credential) {
      setError('Google login failed — credential missing.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await googleLogin(credential, activeTab === 'ADMIN' ? 'STUDENT' : activeTab);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Google sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Send Phone OTP via Firebase
  const handleSendPhoneOtp = async () => {
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsSendingOtp(true);
    setPhoneError(null);

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.trim() : `+91${phoneNumber.trim()}`;
      
      const appVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
        size: 'invisible',
      });

      const confirmation = await signInWithPhoneNumber(firebaseAuth, formattedPhone, appVerifier);
      setConfirmResult(confirmation);
      setOtpSent(true);
    } catch (err: any) {
      setPhoneError(err.message || 'Failed to send SMS OTP. Verify your Firebase configuration.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 2. Verify Phone OTP & Exchange with Backend
  const handleVerifyPhoneOtp = async () => {
    if (!otp.trim() || otp.length < 6) {
      setPhoneError('Please enter the 6-digit OTP received via SMS');
      return;
    }
    setIsSendingOtp(true);
    setPhoneError(null);

    try {
      let idToken = '';
      if (confirmResult) {
        const userCredential = await confirmResult.confirm(otp);
        idToken = await userCredential.user.getIdToken();
      }

      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.trim() : `+91${phoneNumber.trim()}`;
      await phoneLogin(idToken, formattedPhone, activeTab === 'ADMIN' ? 'STUDENT' : activeTab);
      setShowPhoneModal(false);
      navigate(from, { replace: true });
    } catch (err: any) {
      setPhoneError(err.response?.data?.message || err.message || 'Invalid or expired OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleDemoLogin = async (roleType: 'STUDENT' | 'COMPANY' | 'ADMIN') => {
    const demo = DEMO_ACCOUNTS[roleType];
    setValue('email', demo.email);
    setValue('password', demo.password);
    setActiveTab(roleType as 'STUDENT' | 'COMPANY' | 'ADMIN');
    setIsLoading(true);
    setError(null);

    try {
      try {
        await login(demo.email, demo.password);
      } catch (loginErr: unknown) {
        try {
          await registerUser(demo);
        } catch {
          throw loginErr;
        }
      }
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (hasErr: boolean) =>
    cn(
      'w-full px-3.5 py-2.5 bg-[#0A0C10] border rounded-sm text-sm text-[#E7EAF0] placeholder-[#565E70]',
      'transition-all duration-150',
      'focus:outline-none focus:ring-1',
      hasErr
        ? 'border-[#F0555A] focus:border-[#F0555A] focus:ring-[#F0555A]/30'
        : 'border-[#262B38] focus:border-[#4C8DFF] focus:ring-[#4C8DFF]/20 hover:border-[#333a4d]'
    );

  const labelCls = 'block text-xs font-medium text-[#8B93A7] uppercase tracking-wider mb-1.5';

  return (
    <>
      <style>{`
        .auth-grid-bg {
          background-color: #0A0C10;
          background-image:
            linear-gradient(rgba(38,43,56,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(38,43,56,0.3) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .auth-panel {
          background: #12151C;
          border: 1px solid #262B38;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px -12px rgba(0,0,0,0.7);
        }
        .role-tab-login {
          border-left: 2px solid transparent;
          transition: all 0.15s ease;
        }
        .role-tab-login.active {
          border-left-color: #4C8DFF;
          background: rgba(76,141,255,0.06);
          color: #E7EAF0;
        }
        .demo-btn {
          background: #0A0C10;
          border: 1px solid #262B38;
          transition: all 0.15s ease;
        }
        .demo-btn:hover {
          border-color: #4C8DFF;
          color: #4C8DFF;
          background: rgba(76,141,255,0.04);
        }
        .submit-btn {
          background: #4C8DFF;
          transition: all 0.15s ease;
        }
        .submit-btn:hover:not(:disabled) {
          background: #7DB0FF;
          box-shadow: 0 0 20px rgba(76,141,255,0.35);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .corner-bracket {
          position: absolute;
          width: 8px;
          height: 8px;
          border-color: #4C8DFF;
          border-style: solid;
          pointer-events: none;
        }
        .corner-tl { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
        .corner-tr { top: -1px; right: -1px; border-width: 1px 1px 0 0; }
        .corner-bl { bottom: -1px; left: -1px; border-width: 0 0 1px 1px; }
        .corner-br { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }
      `}</style>

      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-container"></div>

      <div
        className="auth-grid-bg min-h-screen flex items-center justify-center p-4"
        style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
      >
        <div className="w-full max-w-2xl relative">
          {/* Header breadcrumb */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-px bg-[#262B38]" />
            <span
              className="text-xs tracking-[0.2em] text-[#565E70] uppercase"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              PlaceX / Sign In
            </span>
            <div className="flex-1 h-px bg-[#262B38]" />
          </div>

          {/* Page title */}
          <h1
            className="text-3xl font-bold text-[#E7EAF0] mb-8 text-center"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Welcome back
          </h1>

          {/* Main panel */}
          <div className="auth-panel rounded-sm flex overflow-hidden relative">
            <div className="corner-bracket corner-tl" />
            <div className="corner-bracket corner-tr" />
            <div className="corner-bracket corner-bl" />
            <div className="corner-bracket corner-br" />

            {/* Left — Role sidebar */}
            <div className="w-44 flex-shrink-0 border-r border-[#262B38] py-2">
              {ROLE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'role-tab-login w-full text-left px-5 py-4',
                    activeTab === tab.id
                      ? 'active'
                      : 'text-[#565E70] hover:text-[#8B93A7] hover:bg-white/[0.02]'
                  )}
                >
                  <div className="text-sm font-medium mb-0.5" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    {tab.label}
                  </div>
                  <div
                    className="text-[10px] leading-tight opacity-60 hidden sm:block"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {tab.sub}
                  </div>
                </button>
              ))}

              <div className="mx-4 my-2 border-t border-[#262B38]" />

              {/* Register link */}
              <div className="px-5 py-3">
                <p className="text-[10px] text-[#565E70] mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  New to PlaceX?
                </p>
                <Link
                  to="/auth/register"
                  className="flex items-center gap-1 text-xs text-[#4C8DFF] hover:text-[#7DB0FF] transition-colors"
                >
                  Create account
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Right — Form */}
            <div className="flex-1 p-6 sm:p-8">
              {/* Panel header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#262B38]">
                <div>
                  <div
                    className="text-xs text-[#565E70] uppercase tracking-widest mb-1"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    Portal — {ROLE_TABS.find(t => t.id === activeTab)?.label}
                  </div>
                  <h2
                    className="text-lg font-semibold text-[#E7EAF0]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Sign in to your account
                  </h2>
                </div>
                <div
                  className="text-[10px] px-2 py-1 rounded border border-[#262B38] text-[#565E70]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  SECURE
                </div>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 text-sm text-[#F0555A] bg-[#F0555A]/8 border border-[#F0555A]/20 rounded-sm">
                  {error}
                </div>
              )}

              {/* Google One-Click Auth + Mobile OTP Row */}
              <div className="mb-5 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Google OAuth Login */}
                  <div className="w-full sm:flex-1 flex justify-center">
                    <GoogleAuthButton
                      onSuccess={(credential) => handleGoogleSuccess(credential)}
                      onError={(err) => setError('Google Sign-in was cancelled or encountered an error: ' + err)}
                      text="continue_with"
                    />
                  </div>

                  {/* Phone OTP Login Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowPhoneModal(true);
                      setPhoneError(null);
                      setOtpSent(false);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-[#0A0C10] hover:bg-[#171B24] border border-[#262B38] hover:border-[#4C8DFF] text-xs font-mono text-[#E7EAF0] flex items-center justify-center gap-2 transition-colors rounded-sm"
                  >
                    <Smartphone className="h-4 w-4 text-[#4C8DFF]" />
                    <span>MOBILE OTP</span>
                  </button>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[#262B38]"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-mono text-[#565E70] uppercase">Or login with password</span>
                  <div className="flex-grow border-t border-[#262B38]"></div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="auth-form-in space-y-4">
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className={inputCls(!!errors.email)}
                  />
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-[#F0555A]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={cn(labelCls, 'mb-0')}>Password</label>
                    <Link
                      to="/auth/forgot-password"
                      className="text-[11px] text-[#565E70] hover:text-[#4C8DFF] transition-colors"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password')}
                      className={cn(inputCls(!!errors.password), 'pr-10')}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#565E70] hover:text-[#8B93A7] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-[11px] text-[#F0555A]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-btn w-full py-2.5 rounded-sm text-sm font-semibold text-white"
                  style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>

              {/* Demo accounts */}
              <div className="mt-6 pt-5 border-t border-[#262B38]">
                <div
                  className="text-[10px] text-[#565E70] uppercase tracking-widest mb-3"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Quick Demo Access
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['STUDENT', 'COMPANY', 'ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleDemoLogin(r)}
                      disabled={isLoading}
                      className="demo-btn py-2 px-3 rounded-sm text-[11px] font-medium text-[#8B93A7]"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-px bg-[#262B38]" />
            <span
              className="text-[10px] tracking-widest text-[#3a4155] uppercase"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              PlaceX &mdash; Campus Placement Platform
            </span>
            <div className="flex-1 h-px bg-[#262B38]" />
          </div>
        </div>
      </div>

      {/* Phone OTP Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0C10]/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12151C] border border-[#262B38] p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-start justify-between pb-4 border-b border-[#262B38]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#4C8DFF]/10 border border-[#4C8DFF]/30">
                  <Smartphone className="h-5 w-5 text-[#4C8DFF]" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-[#E7EAF0] uppercase">
                    MOBILE NUMBER OTP SIGN IN
                  </h3>
                  <p className="font-mono text-[10px] text-[#8B93A7]">
                    Role: {ROLE_TABS.find(t => t.id === activeTab)?.label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPhoneModal(false)}
                className="p-1 text-[#8B93A7] hover:text-[#E7EAF0]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {phoneError && (
              <div className="p-3 text-xs text-[#F0555A] bg-[#F0555A]/10 border border-[#F0555A]/30">
                {phoneError}
              </div>
            )}

            {!otpSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#8B93A7] uppercase mb-1.5">
                    10-Digit Mobile Number
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2.5 bg-[#0A0C10] border border-[#262B38] font-mono text-xs text-[#8B93A7]">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0A0C10] border border-[#262B38] text-sm text-[#E7EAF0] font-mono focus:outline-none focus:border-[#4C8DFF]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendPhoneOtp}
                  disabled={isSendingOtp}
                  className="w-full py-2.5 bg-[#4C8DFF] hover:bg-[#7DB0FF] text-[#0A0C10] font-mono text-xs font-bold uppercase transition-colors"
                >
                  {isSendingOtp ? 'SENDING SMS OTP...' : 'SEND OTP CODE'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono text-[#8B93A7] uppercase">
                      Enter 6-Digit SMS Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[10px] font-mono text-[#4C8DFF] hover:underline"
                    >
                      Change Number
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0A0C10] border border-[#262B38] text-center tracking-[0.5em] text-lg text-[#E7EAF0] font-mono focus:outline-none focus:border-[#34D399]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyPhoneOtp}
                  disabled={isSendingOtp}
                  className="w-full py-2.5 bg-[#34D399] hover:bg-[#34D399]/80 text-[#0A0C10] font-mono text-xs font-bold uppercase transition-colors"
                >
                  {isSendingOtp ? 'VERIFYING...' : 'VERIFY & SIGN IN'}
                </button>
              </div>
            )}

            <div className="p-2.5 bg-[#0A0C10] border border-[#262B38] text-[10px] font-mono text-[#565E70] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#4C8DFF] shrink-0" />
              <span>SMS delivery powered by Firebase Authentication (10k Free SMS/mo).</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LoginPage;
