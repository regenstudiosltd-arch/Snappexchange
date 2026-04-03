// src/lib/schema.ts

import { z } from 'zod';

export const loginSchema = z.object({
  login_field: z.string().min(1, 'Email or Phone is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Full Name is required'),
    email: z.string().email('Invalid email address'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    userType: z.enum(['student', 'worker']),
    momoNumber: z.string().min(9, 'Phone number is too short'),
    momoProvider: z.enum(['mtn', 'telecel', 'airteltigo']),
    momoName: z.string().min(2, 'Account Name is required'),
    ghanaPostAddress: z
      .string()
      .regex(/^[A-Z]{2}-\d{3}-\d{4}$/, 'Invalid GPS format (GA-123-4567)'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm Password is required'),
    profilePicture: z.any().optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const otpSchema = z.object({
  phoneNumber: z.string(),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  date_of_birth: string;
  user_type: 'student' | 'worker';
  momo_number: string;
  ghana_post_address: string;
  momo_provider: 'mtn' | 'telecel' | 'airteltigo';
  momo_name: string;
  profile_picture?: string;
}

export const goalSchema = z.object({
  name: z.string().min(3, 'Goal name must be at least 3 characters'),
  target_amount: z
    .string()
    .min(1, 'Target amount is required')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'Target must be a positive number',
    ),
  regular_contribution: z
    .string()
    .min(1, 'Contribution is required')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'Contribution must be a positive number',
    ),
  target_date: z.string().min(1, 'Target date is required'),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
});

export const forgotPasswordSchema = z.object({
  login_field: z
    .string()
    .min(9, 'Phone number must be at least 9 digits')
    .regex(/^\+?233[0-9]{9}$|^0[0-9]{9}$/, {
      message:
        'Please enter a valid Ghanaian phone number (e.g. 0551234567 or +233551234567)',
    }),
});

export const resetPasswordSchema = z
  .object({
    phone: z.string().min(1),
    code: z.string().length(6, 'OTP must be 6 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export type GoalFormData = z.infer<typeof goalSchema>;
export type Goal = {
  id: number;
  name: string;
  target_amount: string;
  current_amount: string;
  regular_contribution: string;
  target_date: string;
  frequency: string;
  created_at: string;
};

export type ProfileUpdatePayload = Partial<{
  email?: string;
  full_name?: string;
  user_type?: 'student' | 'worker';
  ghana_post_address?: string;
  momo_provider?: 'mtn' | 'telecel' | 'airteltigo';
  momo_number?: string;
  momo_name?: string;
}>;
