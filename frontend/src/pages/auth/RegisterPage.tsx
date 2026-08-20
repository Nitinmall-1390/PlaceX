import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth/auth.context';
import { cn } from '../../utils';
import { Eye, EyeOff, ChevronRight, Smartphone, ShieldCheck, X } from 'lucide-react';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { auth as firebaseAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from '../../services/firebase';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  role: z.enum(['STUDENT', 'COMPANY']),
  studentId: z.string().optional(),
  department: z.string().optional(),
  course: z.string().optional(),
  graduationYear: z.union([z.number(), z.string()]).optional(),
  companyName: z.string().optional(),
  industry: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'STUDENT') {
    if (!data.studentId || data.studentId.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Student ID is required', path: ['studentId'] });
    }
    if (!data.department || data.department.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Department is required', path: ['department'] });
    }
    if (!data.course || data.course.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Course is required', path: ['course'] });
    }
    const year = Number(data.graduationYear);
    if (!data.graduationYear || isNaN(year) || year < 2000 || year > 2100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid graduation year is required', path: ['graduationYear'] });
    }
  }
  if (data.role === 'COMPANY') {
    if (!data.companyName || data.companyName.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Company name is required', path: ['companyName'] });
    }
    if (!data.industry || data.industry.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Industry is required', path: ['industry'] });
    }
  }
});

type RegisterFormData = z.infer<typeof registerSchema>;

const ROLES = [
  {
    id: 'STUDENT' as const,
    label: 'Student',
    description: 'Discover jobs, apply and track placements',
  },
  {
    id: 'COMPANY' as const,
    label: 'Company',
    description: 'Post jobs and hire top campus talent',
  },
];

const PASSWORD_RULES = [
  { label: '8 characters minimum', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase character', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase character', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

function RegisterPage() {
  const [role, setRole] = useState<'STUDENT' | 'COMPANY'>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone OTP Modal states
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { register: registerUser, googleLogin, phoneLogin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'STUDENT',
      studentId: '',
      department: '',
      course: '',
      graduationYear: '',
      companyName: '',
      industry: '',
    },
  });

  const watchedPassword = watch('password') || '';

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerUser({
        ...data,
        graduationYear: data.graduationYear ? Number(data.graduationYear) : undefined,
      });
      navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    if (!credential) {
      setError('Google registration failed — credential missing.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await googleLogin(credential, role);
      navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Google registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsSendingOtp(true);
    setPhoneError(null);

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.trim() : `+91${phoneNumber.trim()}`;
      const appVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-register-container', {
        size: 'invisible',
      });
      const confirmation = await signInWithPhoneNumber(firebaseAuth, formattedPhone, appVerifier);
      setConfirmResult(confirmation);
      setOtpSent(true);
    } catch (err: any) {
      setPhoneError(err.message || 'Failed to send SMS OTP. Check Firebase configuration.');
    } finally {
      setIsSendingOtp(false);
    }
  };

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
      await phoneLogin(idToken, formattedPhone, role);
      setShowPhoneModal(false);
      navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
    } catch (err: any) {
      setPhoneError(err.response?.data?.message || err.message || 'Invalid or expired OTP');
    } finally {
      setIsSendingOtp(false);
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
        .role-tab-btn {
          border-left: 2px solid transparent;
          transition: all 0.15s ease;
        }
        .role-tab-btn.active {
          border-left-color: #4C8DFF;
          background: rgba(76,141,255,0.06);
          color: #E7EAF0;
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

      {/* Invisible reCAPTCHA container for Register */}
      <div id="recaptcha-register-container"></div>

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
              PlaceX / Registration
            </span>
            <div className="flex-1 h-px bg-[#262B38]" />
          </div>

          {/* Page title */}
          <h1
            className="text-3xl font-bold text-[#E7EAF0] mb-8 text-center"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Create your account
          </h1>

          {/* Main panel */}
          <div className="auth-panel rounded-sm flex overflow-hidden relative">
            <div className="corner-bracket corner-tl" />
            <div className="corner-bracket corner-tr" />
            <div className="corner-bracket corner-bl" />
            <div className="corner-bracket corner-br" />

            {/* Left — Role selector sidebar */}
            <div className="w-44 flex-shrink-0 border-r border-[#262B38] py-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRole(r.id);
                    setValue('role', r.id);
                  }}
                  className={cn(
                    'role-tab-btn w-full text-left px-5 py-4',
                    role === r.id
                      ? 'active'
                      : 'text-[#565E70] hover:text-[#8B93A7] hover:bg-white/[0.02]'
                  )}
                >
                  <div className="text-sm font-medium mb-0.5" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    {r.label}
                  </div>
                  <div
                    className="text-[10px] leading-tight opacity-60 hidden sm:block"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {r.description}
                  </div>
                </button>
              ))}

              {/* Divider */}
              <div className="mx-4 my-2 border-t border-[#262B38]" />

              {/* Login link in sidebar */}
              <div className="px-5 py-3">
                <p className="text-[10px] text-[#565E70] mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Already a member?
                </p>
                <Link
                  to="/auth/login"
                  className="flex items-center gap-1 text-xs text-[#4C8DFF] hover:text-[#7DB0FF] transition-colors"
                >
                  Sign in
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Right — Form panel */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
              {/* Panel header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#262B38]">
                <div>
                  <div
                    className="text-xs text-[#565E70] uppercase tracking-widest mb-1"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    Role — {role === 'STUDENT' ? 'Student' : 'Company'}
                  </div>
                  <h2
                    className="text-lg font-semibold text-[#E7EAF0]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {role === 'STUDENT' ? 'Student Registration' : 'Company Registration'}
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

              {/* Fast 1-Click Social Sign-Up Options */}
              <div className="mb-5 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:flex-1 flex justify-center">
                    <GoogleAuthButton
                      onSuccess={(credential) => handleGoogleSuccess(credential)}
                      onError={(err) => setError('Google sign-up failed: ' + err)}
                      text="signup_with"
                    />
                  </div>

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
                    <span>PHONE REGISTER</span>
                  </button>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[#262B38]"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-mono text-[#565E70] uppercase">Or complete full profile</span>
                  <div className="flex-grow border-t border-[#262B38]"></div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="auth-form-panel space-y-4">
                <input type="hidden" {...register('role')} value={role} />

                {/* Core fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="auth-input">
                    <label className={labelCls}>Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      {...register('name')}
                      className={inputCls(!!errors.name)}
                    />
                    {errors.name && (
                      <p className="mt-1 text-[11px] text-[#F0555A]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="auth-input">
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
                </div>

                {/* Password */}
                <div className="auth-input">
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
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

                  {/* Password rules indicator */}
                  <div className="mt-2.5 p-2.5 bg-[#0A0C10] border border-[#262B38] rounded-sm">
                    <div className="grid grid-cols-2 gap-1.5">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = rule.test(watchedPassword);
                        return (
                          <div
                            key={rule.label}
                            className="flex items-center gap-1.5 text-[10px]"
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          >
                            <span className={cn('w-1.5 h-1.5 rounded-full', passed ? 'bg-[#34D399]' : 'bg-[#565E70]')} />
                            <span className={passed ? 'text-[#8B93A7]' : 'text-[#565E70]'}>{rule.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Role-specific fields */}
                {role === 'STUDENT' && (
                  <div className="space-y-4 pt-2 border-t border-[#262B38]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Student ID / Roll No</label>
                        <input
                          type="text"
                          placeholder="STU2026001"
                          {...register('studentId')}
                          className={inputCls(!!errors.studentId)}
                        />
                        {errors.studentId && (
                          <p className="mt-1 text-[11px] text-[#F0555A]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {errors.studentId.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={labelCls}>Department</label>
                        <input
                          type="text"
                          placeholder="Computer Science"
                          {...register('department')}
                          className={inputCls(!!errors.department)}
                        />
                        {errors.department && (
                          <p className="mt-1 text-[11px] text-[#F0555A]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {errors.department.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Course / Degree</label>
                        <input
                          type="text"
                          placeholder="B.Tech"
                          {...register('course')}
                          className={inputCls(!!errors.course)}
                        />
                        {errors.course && (
                          <p className="mt-1 text-[11px] text-[#F0555A]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {errors.course.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={labelCls}>Graduation Year</label>
                        <input
                          type="number"
                          placeholder="2026"
                          {...register('graduationYear')}
                          className={inputCls(!!errors.graduationYear)}
                        />
                        {errors.graduationYear && (
                          <p className="mt-1 text-[11px] text-[#F0555A]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {errors.graduationYear.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {role === 'COMPANY' && (
                  <div className="space-y-4 pt-2 border-t border-[#262B38]">
                    <div>
                      <label className={labelCls}>Company Name</label>
                      <input
                        type="text"
                        placeholder="Acme Corporation"
                        {...register('companyName')}
                        className={inputCls(!!errors.companyName)}
                      />
                      {errors.companyName && (
                        <p className="mt-1 text-[11px] text-[#F0555A]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {errors.companyName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Industry</label>
                      <input
                        type="text"
                        placeholder="Information Technology, FinTech, etc."
                        {...register('industry')}
                        className={inputCls(!!errors.industry)}
                      />
                      {errors.industry && (
                        <p className="mt-1 text-[11px] text-[#F0555A]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {errors.industry.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-btn w-full py-2.5 rounded-sm text-sm font-semibold text-white mt-2"
                  style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : 'Create Account'}
                </button>
              </form>
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

      {/* Phone Registration Modal */}
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
                    MOBILE OTP REGISTRATION
                  </h3>
                  <p className="font-mono text-[10px] text-[#8B93A7]">
                    Registering as {role === 'STUDENT' ? 'Student' : 'Company'}
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
                  {isSendingOtp ? 'VERIFYING...' : 'VERIFY & REGISTER'}
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

export default RegisterPage;
