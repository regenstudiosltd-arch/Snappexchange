import { apiClient } from '@/src/lib/axios';
import {
  SignupForm,
  UserProfile,
  ProfileUpdatePayload,
} from '@/src/lib/schemas';

export const authService = {
  signup: async (data: SignupForm) => {
    const idempotencyKey = crypto.randomUUID();
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

  dashboard: async () => {
    const response = await apiClient.get('/accounts/dashboard/');
    return response.data;
  },

  goalsDashboard: async () => {
    const response = await apiClient.get('/accounts/goals/dashboard/');
    return response.data;
  },

  verifyOtp: async (payload: { phone_number: string; code: string }) => {
    const idempotencyKey = crypto.randomUUID();
    const response = await apiClient.post('/auth/otp/verify/', payload, {
      headers: { 'X-Idempotency-Key': idempotencyKey },
    });
    return response.data;
  },

  resendOtp: async (phone_number: string) => {
    const response = await apiClient.post('/auth/otp/send/', { phone_number });
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('/auth/me/');
    const { user, profile } = response.data;

    return {
      id: user.id,
      email: user.email,
      full_name: profile.full_name,
      date_of_birth: profile.date_of_birth,
      user_type: profile.user_type as 'student' | 'worker',
      momo_number: profile.momo_number,
      ghana_post_address: profile.ghana_post_address,
      momo_provider: profile.momo_provider as 'mtn' | 'telecel' | 'airteltigo',
      momo_name: profile.momo_name,
      profile_picture: profile.profile_picture,
    };
  },

  updateProfile: async (payload: ProfileUpdatePayload) => {
    const idempotencyKey = crypto.randomUUID();

    const response = await apiClient.patch('/accounts/profile/', payload, {
      headers: {
        'X-Idempotency-Key': idempotencyKey,
      },
    });

    const { user, profile } = response.data;

    return {
      id: user.id,
      email: user.email,
      full_name: profile.full_name,
      date_of_birth: profile.date_of_birth,
      user_type: profile.user_type as 'student' | 'worker',
      momo_number: profile.momo_number,
      ghana_post_address: profile.ghana_post_address,
      momo_provider: profile.momo_provider as 'mtn' | 'telecel' | 'airteltigo',
      momo_name: profile.momo_name,
      profile_picture: profile.profile_picture,
    };
  },

  createSavingsGroup: async (formData: FormData) => {
    const response = await apiClient.post(
      '/accounts/groups/create/',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data;
  },

  getJoinRequestsStats: async () => {
    const response = await apiClient.get(
      '/accounts/groups/join-requests/stats/',
    );
    return response.data;
  },

  getMyJoinedGroups: async () => {
    const response = await apiClient.get('/accounts/groups/my-joined/');
    return response.data;
  },

  getGroupJoinRequests: async (
    groupId: number,
    status: 'pending' | 'approved' | 'rejected' = 'pending',
  ) => {
    const response = await apiClient.get(
      `/accounts/groups/${groupId}/requests/?status=${status}`,
    );
    return response.data;
  },

  actionJoinRequest: async (
    requestId: number,
    action: 'approve' | 'reject',
  ) => {
    const response = await apiClient.post(
      `/accounts/groups/requests/${requestId}/action/`,
      { action },
    );
    return response.data;
  },

  analytics: async (period: string = '6months') => {
    const response = await apiClient.get(
      `/accounts/analytics/?period=${period}`,
    );
    return response.data;
  },

  changePassword: async (payload: {
    current_password: string;
    new_password: string;
  }) => {
    const idempotencyKey = crypto.randomUUID();
    const response = await apiClient.post('/auth/change-password/', payload, {
      headers: {
        'X-Idempotency-Key': idempotencyKey,
      },
    });
    return response.data;
  },

  getGroupDetail: async (groupId: string) => {
    const response = await apiClient.get(`/accounts/groups/${groupId}/`);
    return response.data;
  },

  contributeToGroup: async (groupId: string) => {
    const idempotencyKey = crypto.randomUUID();
    const response = await apiClient.post(
      `/accounts/groups/${groupId}/contribute/`,
      {},
      {
        headers: { 'X-Idempotency-Key': idempotencyKey },
      },
    );
    return response.data;
  },
};
