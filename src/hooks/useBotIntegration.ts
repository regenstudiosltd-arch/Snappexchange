'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { botService } from '../services/bot.service';
import { botService } from '../components/bot-integration/bot.service';
import {
  BotPlatform,
  ConnectionStatus,
} from '../components/bot-integration/bot.types';

export function useBotIntegration() {
  const queryClient = useQueryClient();

  const [linkCode, setLinkCode] = useState({ whatsapp: '', telegram: '' });
  const [connectionStatus, setConnectionStatus] = useState<
    Record<BotPlatform, ConnectionStatus>
  >({ whatsapp: 'idle', telegram: 'idle' });
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [unlinkTarget, setUnlinkTarget] = useState<string | null>(null);

  // ─── Fetch connected groups ──────────────────────────────────────────────────
  const {
    data: connectedGroups = [],
    isLoading: groupsLoading,
    refetch: refetchGroups,
  } = useQuery({
    queryKey: ['bot-connected-groups'],
    queryFn: botService.getConnectedGroups,
    staleTime: 1000 * 60 * 2, // 2 min
    refetchInterval: 1000 * 60 * 5, // poll every 5 min
  });

  // ─── Link group mutation ─────────────────────────────────────────────────────
  const linkMutation = useMutation({
    mutationFn: botService.linkGroup,
    onMutate: ({ platform }) => {
      setConnectionStatus((prev) => ({ ...prev, [platform]: 'pending' }));
    },
    onSuccess: (data, { platform }) => {
      if (data.success) {
        setConnectionStatus((prev) => ({ ...prev, [platform]: 'connected' }));
        setLinkCode((prev) => ({ ...prev, [platform]: '' }));
        queryClient.invalidateQueries({ queryKey: ['bot-connected-groups'] });
        // Reset to idle after success animation
        setTimeout(() => {
          setConnectionStatus((prev) => ({ ...prev, [platform]: 'idle' }));
        }, 3000);
      } else {
        setConnectionStatus((prev) => ({ ...prev, [platform]: 'error' }));
        setTimeout(() => {
          setConnectionStatus((prev) => ({ ...prev, [platform]: 'idle' }));
        }, 2500);
      }
    },
    onError: (_err, { platform }) => {
      setConnectionStatus((prev) => ({ ...prev, [platform]: 'error' }));
      setTimeout(() => {
        setConnectionStatus((prev) => ({ ...prev, [platform]: 'idle' }));
      }, 2500);
    },
  });

  // ─── Unlink mutation ─────────────────────────────────────────────────────────
  const unlinkMutation = useMutation({
    mutationFn: botService.unlinkGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-connected-groups'] });
      setUnlinkTarget(null);
    },
  });

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const copyToClipboard = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2200);
    } catch {
      // fallback for older browsers
    }
  }, []);

  const handleLinkGroup = useCallback(
    (platform: BotPlatform) => {
      const code = linkCode[platform].trim().toUpperCase();
      if (!code || connectionStatus[platform] === 'pending') return;
      linkMutation.mutate({ linkCode: code, platform });
    },
    [linkCode, connectionStatus, linkMutation],
  );

  const handleUnlink = useCallback(
    (groupId: string) => {
      unlinkMutation.mutate(groupId);
    },
    [unlinkMutation],
  );

  const updateLinkCode = useCallback((platform: BotPlatform, value: string) => {
    setLinkCode((prev) => ({ ...prev, [platform]: value }));
  }, []);

  return {
    // State
    linkCode,
    connectionStatus,
    copied,
    connectedGroups,
    groupsLoading,
    unlinkTarget,
    // Mutations
    linkError:
      linkMutation.data?.success === false ? linkMutation.data.error : null,
    // Actions
    copyToClipboard,
    handleLinkGroup,
    handleUnlink,
    updateLinkCode,
    setUnlinkTarget,
    refetchGroups,
  };
}
