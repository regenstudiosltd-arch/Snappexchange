import { apiClient } from '@/src/lib/axios';
import { SignupForm } from '@/src/lib/schemas';

export const authService = {
  signup: async (data: SignupForm) => {
    const idempotencyKey = crypto.randomUUID();

    // Convert to FormData for file upload
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('password2', data.confirmPassword);
    formData.append('full_name', data.fullName);
    formData.append('date_of_birth', data.dateOfBirth);
    formData.append('user_type', data.userType);
    formData.append('ghana_post_address', data.ghanaPostAddress);
    formData.append('momo_provider', data.momoProvider);
    formData.append('momo_number', data.momoNumber);
    formData.append('momo_name', data.momoName);

    if (data.profilePicture instanceof File) {
      formData.append('profile_picture', data.profilePicture);
    }

    const response = await apiClient.post('/auth/signup/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Idempotency-Key': idempotencyKey,
      },
    });
    return response.data;
  },

  verifyOtp: async (payload: { phone_number: string; code: string }) => {
    const idempotencyKey = crypto.randomUUID();

    const response = await apiClient.post('/auth/otp/verify/', payload, {
      headers: {
        'X-Idempotency-Key': idempotencyKey,
      },
    });
    return response.data;
  },

  resendOtp: async (phone_number: string) => {
    const response = await apiClient.post('/auth/otp/send/', { phone_number });
    return response.data;
  },
};
