export type BotPlatform = 'whatsapp' | 'telegram';

export type ConnectionStatus = 'idle' | 'pending' | 'connected' | 'error';

export interface ConnectedGroup {
  id: string;
  groupName: string;
  platform: BotPlatform;
  memberCount: number;
  connectedAt: string;
  isActive: boolean;
  lastActivity?: string;
  groupPublicId?: string;
}

export interface BotCapability {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

export interface LinkGroupPayload {
  linkCode: string;
  platform: BotPlatform;
}

export interface LinkGroupResponse {
  success: boolean;
  group?: ConnectedGroup;
  error?: string;
}
