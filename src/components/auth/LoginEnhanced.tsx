'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  LucideChevronLeft,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { loginSchema, LoginForm } from '@/src/lib/schemas';

interface LoginEnhancedProps {
  onSuccess: () => void;
  onNavigate: (view: string) => void;
}

export function LoginEnhanced({ onSuccess, onNavigate }: LoginEnhancedProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        login_field: data.login_field,
        password: data.password,
        remember_me: data.rememberMe,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        onSuccess();
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Link href="/" className="inline-block mb-4">
        <div className="group flex items-center gap-2 px-3 py-2 rounded-lg w-fit transition-all duration-200 cursor-pointer hover:bg-muted/60">
          <LucideChevronLeft className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-foreground" />

          <h3 className="text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
            Back to home
          </h3>
        </div>
      </Link>
      <div className="min-h-screen flex items-center justify-center px-4 pb-8 pt-3">
        <Card className="w-full max-w-md bg-card border-border shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-6 pt-10">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-linear-to-br from-[#DC2626] via-[#F59E0B] to-[#059669]">
                <span className="text-white text-xl">SX</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Login to your SnappX account
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login_field" className="text-foreground">
                  Email or Phone Number
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="login_field"
                    placeholder="Enter your email or phone"
                    className="pl-11 bg-background h-11"
                    {...register('login_field')}
                  />
                </div>
                {errors.login_field && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.login_field.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-11 bg-background h-11"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-border text-primary focus:ring-primary"
                    {...register('rememberMe')}
                  />
                  <span className="text-sm text-muted-foreground">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-medium mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">Logging in...</span>
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-4">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
