// src/components/bot-integration/bot.service.ts

import { apiClient } from '@/src/lib/axios';
import {
  AdminGroup,
  ConnectedGroup,
  GenerateCodeResponse,
  LinkGroupPayload,
  LinkGroupResponse,
  UnlinkPayload,
} from './bot.types';

export const botService = {
  /**
   * Fetch all groups (where the current user is admin or member) that have
   * an active bot link. Populates the Connected Groups panel.
   */
  getConnectedGroups: async (): Promise<ConnectedGroup[]> => {
    const response = await apiClient.get('/accounts/groups/bot/linked/');
    return (response.data?.results ?? []) as ConnectedGroup[];
  },

  /**
   * Fetch groups administered by the current user.
   * Used in the "Generate Code" flow so the admin picks which group to connect.
   */
  getAdminGroups: async (): Promise<AdminGroup[]> => {
    const response = await apiClient.get('/accounts/groups/bot/my-groups/');
    return (response.data?.results ?? []) as AdminGroup[];
  },

  /**
   * Ask the backend to generate a short-lived link code for a specific group
   * and platform. Only the group admin can call this.
   */
  generateLinkCode: async (
    groupId: string | number,
    platform: string,
  ): Promise<GenerateCodeResponse> => {
    const response = await apiClient.post(
      `/accounts/groups/${groupId}/bot/generate-code/`,
      { platform },
    );
    return response.data as GenerateCodeResponse;
  },

  /**
   * Verify a link code and create a BotGroupLink record on the backend.
   */
  linkGroup: async (payload: LinkGroupPayload): Promise<LinkGroupResponse> => {
    try {
      const idempotencyKey = crypto.randomUUID();
      const response = await apiClient.post(
        '/accounts/groups/bot/link/',
        payload,
        { headers: { 'X-Idempotency-Key': idempotencyKey } },
      );
      return response.data as LinkGroupResponse;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Invalid or expired link code. Please try again.';
      return { success: false, error: msg };
    }
  },

  /**
   * Unlink a group from the bot. Only the group admin can do this.
   */
  unlinkGroup: async (
    payload: UnlinkPayload,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiClient.delete(
        `/accounts/groups/${payload.group_id}/bot/unlink/`,
        { data: { platform: payload.platform } },
      );
      return { success: true };
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Failed to unlink. Please try again.';
      return { success: false, error: msg };
    }
  },
};

// // src/components/bot-integration/bot.service.ts

// import { apiClient } from '@/src/lib/axios';
// import {
//   ConnectedGroup,
//   LinkGroupPayload,
//   LinkGroupResponse,
// } from './bot.types';

// export const botService = {
//   /**
//    * Fetch all groups connected to the bot (both WhatsApp + Telegram).
//    * Reads from the user's joined groups and filters those with bot_linked = true.
//    */
//   getConnectedGroups: async (): Promise<ConnectedGroup[]> => {
//     try {
//       const response = await apiClient.get('/accounts/groups/my-joined/');
//       const allGroups = response.data ?? [];

//       // Filter groups that have a bot channel linked
//       return allGroups
//         .filter((g: Record<string, unknown>) => g.bot_platform && g.bot_linked)
//         .map((g: Record<string, unknown>) => ({
//           id: String(g.id),
//           groupName: g.group_name as string,
//           platform: g.bot_platform as 'whatsapp' | 'telegram',
//           memberCount: (g.current_members as number) ?? 0,
//           connectedAt:
//             (g.bot_connected_at as string) ?? (g.created_at as string),
//           isActive: g.status === 'active',
//           lastActivity: g.last_activity as string | undefined,
//           groupPublicId: g.public_id as string | undefined,
//         }));
//     } catch {
//       // Return mock data for dev — replace with [] or rethrow in production
//       return getMockConnectedGroups();
//     }
//   },

//   /**
//    * Attempt to link a savings group to a bot via a link code.
//    */
//   linkGroup: async (payload: LinkGroupPayload): Promise<LinkGroupResponse> => {
//     try {
//       const idempotencyKey = crypto.randomUUID();
//       const response = await apiClient.post(
//         '/accounts/groups/bot/link/',
//         payload,
//         { headers: { 'X-Idempotency-Key': idempotencyKey } },
//       );
//       return { success: true, group: response.data };
//     } catch (err: unknown) {
//       const msg =
//         (err as { response?: { data?: { error?: string } } })?.response?.data
//           ?.error ?? 'Invalid or expired link code. Please try again.';
//       return { success: false, error: msg };
//     }
//   },

//   /**
//    * Unlink a group from the bot.
//    */
//   unlinkGroup: async (groupId: string): Promise<{ success: boolean }> => {
//     try {
//       await apiClient.delete(`/accounts/groups/${groupId}/bot/unlink/`);
//       return { success: true };
//     } catch {
//       return { success: false };
//     }
//   },
// };

// // ─── Mock helpers (used until backend implements bot endpoints) ───────────────

// function getMockConnectedGroups(): ConnectedGroup[] {
//   return [
//     {
//       id: '1',
//       groupName: 'Family Savings Circle',
//       platform: 'whatsapp',
//       memberCount: 8,
//       connectedAt: new Date(
//         Date.now() - 1000 * 60 * 60 * 24 * 14,
//       ).toISOString(),
//       isActive: true,
//       lastActivity: new Date(Date.now() - 1000 * 60 * 37).toISOString(),
//     },
//     {
//       id: '2',
//       groupName: 'Business Partners Susu',
//       platform: 'telegram',
//       memberCount: 12,
//       connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
//       isActive: true,
//       lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
//     },
//   ];
// }
