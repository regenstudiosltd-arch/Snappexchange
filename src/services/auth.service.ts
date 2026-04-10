import { apiClient } from '@/src/lib/axios';
import {
  SignupForm,
  UserProfile,
  ProfileUpdatePayload,
} from '@/src/lib/schemas';
import { getSession } from 'next-auth/react';

const AI_MAX_MESSAGES = 30;
const AI_MAX_CHARS_PER_MSG = 2000;
const AI_MAX_TOTAL_CHARS = 12_000;

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

  forgotPassword: async (login_field: string) => {
    const response = await apiClient.post('/auth/forgot-password/', {
      login_field: login_field.trim().toLowerCase(),
    });
    return response.data;
  },

  resetPassword: async (payload: {
    phone: string;
    code: string;
    password: string;
    confirmPassword: string;
  }) => {
    const idempotencyKey = crypto.randomUUID();
    const response = await apiClient.post(
      '/auth/reset-password/',
      {
        phone: payload.phone,
        code: payload.code,
        password: payload.password,
        password2: payload.confirmPassword,
      },
      {
        headers: { 'X-Idempotency-Key': idempotencyKey },
      },
    );
    return response.data;
  },

  aiChat: async (
    messages: { role: 'user' | 'assistant'; content: string }[],
    onChunk: (text: string) => void,
    signal?: AbortSignal,
  ): Promise<void> => {
    // Client-side validation
    if (messages.length > AI_MAX_MESSAGES) {
      throw new Error(
        `Conversation too long. Please start a new chat (max ${AI_MAX_MESSAGES} messages).`,
      );
    }

    let totalChars = 0;
    for (const msg of messages) {
      if (msg.content.length > AI_MAX_CHARS_PER_MSG) {
        throw new Error(
          `Message too long. Please keep each message under ${AI_MAX_CHARS_PER_MSG} characters.`,
        );
      }
      totalChars += msg.content.length;
    }
    if (totalChars > AI_MAX_TOTAL_CHARS) {
      throw new Error(
        'Conversation history too long. Please start a new chat.',
      );
    }

    // Network request
    const session = await getSession();
    const token = session?.user?.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/accounts/ai/chat/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal,
        body: JSON.stringify({ messages }),
      },
    );

    // HTTP-level errors
    if (response.status === 401) {
      throw new Error('auth');
    }

    if (response.status === 429) {
      // Rate limited — user sent too many messages this hour
      throw new Error('rate_limit');
    }

    if (response.status === 400) {
      // Validation error — parse the body for the specific message
      try {
        const body = await response.json();
        throw new Error(body.error || 'Invalid request to AI service.');
      } catch {
        throw new Error('Invalid request to AI service.');
      }
    }

    if (response.status === 503) {
      throw new Error('AI service is not available right now.');
    }

    if (!response.ok) {
      throw new Error(`http_${response.status}`);
    }

    // Stream reading
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value, { stream: true }).split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6);

        if (raw.trim() === '[DONE]') return;

        if (raw.trim().startsWith('[ERROR]')) {
          const errorText = raw.trim().replace('[ERROR]', '').trim();

          // Map backend error strings to user-friendly messages
          if (errorText.toLowerCase().includes('rate limit')) {
            throw new Error('rate_limit');
          }
          if (errorText.toLowerCase().includes('authentication')) {
            throw new Error('auth');
          }
          throw new Error(errorText || 'AI service error');
        }

        try {
          onChunk(JSON.parse(raw));
        } catch {
          // Raw text chunk (non-JSON) — pass through directly
          onChunk(raw);
        }
      }
    }
  },

  getInviteLink: async (groupId: string) => {
    const response = await apiClient.get(`/accounts/groups/${groupId}/invite/`);
    return response.data;
  },

  regenerateInviteLink: async (groupId: string) => {
    const response = await apiClient.post(
      `/accounts/groups/${groupId}/invite/`,
    );
    return response.data;
  },

  getInvitePreview: async (token: string) => {
    // Public endpoint — no auth header needed
    const response = await apiClient.get(`/accounts/invite/${token}/`);
    return response.data;
  },

  acceptInvite: async (token: string) => {
    const response = await apiClient.post(`/accounts/invite/${token}/accept/`);
    return response.data as {
      already_member: boolean;
      message: string;
      group_public_id: string;
      group_id: number;
      group_name: string;
    };
  },

  requestJoinGroup: async (groupId: number, reason: string = '') => {
    const idempotencyKey = crypto.randomUUID();
    const response = await apiClient.post(
      `/accounts/groups/${groupId}/request_join/`,
      { reason },
      { headers: { 'X-Idempotency-Key': idempotencyKey } },
    );
    return response.data;
  },
};
