// src/components/bot-integration/bot.types.ts

export type BotPlatform = 'whatsapp' | 'telegram';

export type ConnectionStatus = 'idle' | 'pending' | 'connected' | 'error';

/** Shape returned by GET /accounts/groups/bot/linked/ */
export interface ConnectedGroup {
  id: string; // "{group_id}-{platform}" — unique per link
  group_id: number;
  group_name: string;
  public_id: string;
  platform: BotPlatform;
  member_count: number;
  is_active: boolean;
  is_pending: boolean; // true = linked in DB but bot not yet added to Telegram chat
  is_admin: boolean;
  linked_at: string;
  last_activity: string | null;
  group_status: string;
}

/** Shape returned by GET /accounts/groups/bot/my-groups/ */
export interface AdminGroup {
  id: number;
  group_name: string;
  public_id: string;
  status: string;
  current_members: number;
  expected_members: number;
  linked_platforms: BotPlatform[];
}

export interface GenerateCodeResponse {
  link_code: string; // e.g. "SNPX-AB12-CD34"
  expires_in_seconds: number;
  platform: BotPlatform;
  group_name: string;
  warning?: string;
}

export interface LinkGroupPayload {
  link_code: string;
  platform: BotPlatform;
}

export interface LinkGroupResponse {
  success: boolean;
  message?: string;
  group_id?: number;
  group_name?: string;
  public_id?: string;
  platform?: BotPlatform;
  linked_at?: string;
  next_step?: string;
  error?: string;
}

export interface UnlinkPayload {
  group_id: string; // numeric id as string
  platform: BotPlatform;
}

// // src/components/bot-integration/bot.types.ts

// export type BotPlatform = 'whatsapp' | 'telegram';

// export type ConnectionStatus = 'idle' | 'pending' | 'connected' | 'error';

// /** Shape returned by GET /accounts/groups/bot/linked/ */
// export interface ConnectedGroup {
//   id: string; // "{group_id}-{platform}" — unique per link
//   group_id: number;
//   group_name: string;
//   public_id: string;
//   platform: BotPlatform;
//   member_count: number;
//   is_active: boolean;
//   is_admin: boolean;
//   linked_at: string;
//   last_activity: string | null;
//   group_status: string;
// }

// /** Shape returned by GET /accounts/groups/bot/my-groups/ */
// export interface AdminGroup {
//   id: number;
//   group_name: string;
//   public_id: string;
//   status: string;
//   current_members: number;
//   expected_members: number;
//   linked_platforms: BotPlatform[];
// }

// export interface GenerateCodeResponse {
//   link_code: string; // e.g. "SNPX-AB12-CD34"
//   expires_in_seconds: number;
//   platform: BotPlatform;
//   group_name: string;
//   warning?: string;
// }

// export interface LinkGroupPayload {
//   link_code: string;
//   platform: BotPlatform;
// }

// export interface LinkGroupResponse {
//   success: boolean;
//   message?: string;
//   group_id?: number;
//   group_name?: string;
//   public_id?: string;
//   platform?: BotPlatform;
//   linked_at?: string;
//   error?: string;
// }

// export interface UnlinkPayload {
//   group_id: string; // can be public_id or numeric id string
//   platform: BotPlatform;
// }

// // src/components/bot-integration/bot.types.ts

// export type BotPlatform = 'whatsapp' | 'telegram';

// export type ConnectionStatus = 'idle' | 'pending' | 'connected' | 'error';

// export interface ConnectedGroup {
//   id: string;
//   groupName: string;
//   platform: BotPlatform;
//   memberCount: number;
//   connectedAt: string;
//   isActive: boolean;
//   lastActivity?: string;
//   groupPublicId?: string;
// }

// export interface BotCapability {
//   id: string;
//   icon: string;
//   title: string;
//   description: string;
//   badge?: string;
// }

// export interface LinkGroupPayload {
//   linkCode: string;
//   platform: BotPlatform;
// }

// export interface LinkGroupResponse {
//   success: boolean;
//   group?: ConnectedGroup;
//   error?: string;
// }
