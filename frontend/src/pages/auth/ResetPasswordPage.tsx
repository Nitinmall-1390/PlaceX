import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/auth.service';
import { cn } from '../../utils';
import { Lock, Shield } from 'lucide-react';
import { useState } from 'react';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const resetToken = (location.search.split('token=')[1]?.split('&')[0]) || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: resetToken,
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword({
        token: data.token,
        otp: data.otp,
        password: data.password,
      });
      navigate('/auth/login');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to reset password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold">PlaceX</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your OTP and new password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-error-fg bg-error-bg border border-error/20 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Reset Token</label>
            <input
              type="text"
              placeholder="Enter the token from your email"
              {...register('token')}
              className={cn(
                'w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                errors.token && 'border-error focus:ring-error/20'
              )}
            />
            {errors.token && (
              <p className="text-xs text-error">{errors.token.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">OTP Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit OTP"
              {...register('otp')}
              className={cn(
                'w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                errors.otp && 'border-error focus:ring-error/20'
              )}
            />
            {errors.otp && (
              <p className="text-xs text-error">{errors.otp.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={cn(
                  'w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-10',
                  errors.password && 'border-error focus:ring-error/20'
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.062L13.5 18h-3l-.375.062C7.857 18.214 5.5 19.81 4 21.5C5.5 23.19 7.857 24.786 10.125 24.938L10.5 24.75h3l.375.062C15.143 23.786 17.5 22.19 19 20.5C17.5 18.81 15.143 17.214 13.875 18.062Z" />
                  </svg>
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-error">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={cn(
                  'w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-10',
                  errors.confirmPassword && 'border-error focus:ring-error/20'
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.062L13.5 18h-3l-.375.062C7.857 18.214 5.5 19.81 4 21.5C5.5 23.19 7.857 24.786 10.125 24.938L10.5 24.75h3l.375.062C15.143 23.786 17.5 22.19 19 20.5C17.5 18.81 15.143 17.214 13.875 18.062Z" />
                  </svg>
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-2 rounded-md font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/auth/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
