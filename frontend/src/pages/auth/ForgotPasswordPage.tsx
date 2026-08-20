import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth/auth.service';
import { cn } from '../../utils';
import { Mail, Send } from 'lucide-react';
import { useState } from 'react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword({ email: data.email });
      setIsSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to send reset email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Mail className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold">PlaceX</span>
          </div>

          <div className="bg-card border rounded-xl p-8">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-6 w-6 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Check your email
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              If an account exists for the email address you provided, we've sent a password reset link.
              Please check your inbox and follow the instructions.
            </p>
            <Link
              to="/auth/login"
              className={cn(
                'inline-flex items-center justify-center w-full py-2 rounded-md font-medium',
                'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
              )}
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold">PlaceX</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-error-fg bg-error-bg border border-error/20 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={cn(
                'w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                errors.email && 'border-error focus:ring-error/20'
              )}
            />
            {errors.email && (
              <p className="text-xs text-error">{errors.email.message}</p>
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
            {isLoading ? 'Sending...' : 'Send reset link'}
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

export default ForgotPasswordPage;
