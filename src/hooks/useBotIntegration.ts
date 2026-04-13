// src/hooks/useBotIntegration.ts

'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { botService } from '../components/bot-integration/bot.service';
import {
  AdminGroup,
  BotPlatform,
  ConnectionStatus,
  GenerateCodeResponse,
  UnlinkPayload,
} from '../components/bot-integration/bot.types';

export function useBotIntegration() {
  const queryClient = useQueryClient();

  // ── UI state ───────────────────────────────────────────────────────────────
  const [linkCode, setLinkCode] = useState<Record<BotPlatform, string>>({
    whatsapp: '',
    telegram: '',
  });
  const [connectionStatus, setConnectionStatus] = useState<
    Record<BotPlatform, ConnectionStatus>
  >({ whatsapp: 'idle', telegram: 'idle' });
  const [linkError, setLinkError] = useState<
    Record<BotPlatform, string | null>
  >({
    whatsapp: null,
    telegram: null,
  });
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [unlinkTarget, setUnlinkTarget] = useState<UnlinkPayload | null>(null);

  // ── Code generation state ──────────────────────────────────────────────────
  const [generatedCode, setGeneratedCode] = useState<
    Record<BotPlatform, GenerateCodeResponse | null>
  >({ whatsapp: null, telegram: null });
  const [codeGenerating, setCodeGenerating] = useState<
    Record<BotPlatform, boolean>
  >({ whatsapp: false, telegram: false });
  const [selectedGroup, setSelectedGroup] = useState<
    Record<BotPlatform, AdminGroup | null>
  >({ whatsapp: null, telegram: null });

  // ── Queries ────────────────────────────────────────────────────────────────
  const {
    data: connectedGroups = [],
    isLoading: groupsLoading,
    refetch: refetchGroups,
  } = useQuery({
    queryKey: ['bot-connected-groups'],
    queryFn: botService.getConnectedGroups,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });

  const { data: adminGroups = [], isLoading: adminGroupsLoading } = useQuery({
    queryKey: ['bot-admin-groups'],
    queryFn: botService.getAdminGroups,
    staleTime: 1000 * 60 * 5,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const linkMutation = useMutation({
    mutationFn: botService.linkGroup,
    onMutate: ({ platform }) => {
      setConnectionStatus((prev) => ({ ...prev, [platform]: 'pending' }));
      setLinkError((prev) => ({ ...prev, [platform]: null }));
    },
    onSuccess: (data, { platform }) => {
      if (data.success) {
        setConnectionStatus((prev) => ({ ...prev, [platform]: 'connected' }));
        setLinkCode((prev) => ({ ...prev, [platform]: '' }));
        setGeneratedCode((prev) => ({ ...prev, [platform]: null }));
        setSelectedGroup((prev) => ({ ...prev, [platform]: null }));
        queryClient.invalidateQueries({ queryKey: ['bot-connected-groups'] });
        setTimeout(() => {
          setConnectionStatus((prev) => ({ ...prev, [platform]: 'idle' }));
        }, 3000);
      } else {
        setConnectionStatus((prev) => ({ ...prev, [platform]: 'error' }));
        setLinkError((prev) => ({
          ...prev,
          [platform]: data.error ?? 'Something went wrong.',
        }));
        setTimeout(() => {
          setConnectionStatus((prev) => ({ ...prev, [platform]: 'idle' }));
        }, 4000);
      }
    },
    onError: (_err, { platform }) => {
      setConnectionStatus((prev) => ({ ...prev, [platform]: 'error' }));
      setLinkError((prev) => ({
        ...prev,
        [platform]: 'Connection failed. Please try again.',
      }));
      setTimeout(() => {
        setConnectionStatus((prev) => ({ ...prev, [platform]: 'idle' }));
      }, 4000);
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: botService.unlinkGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-connected-groups'] });
      setUnlinkTarget(null);
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  /** Copy text to clipboard and show a brief "Copied!" flash. */
  const copyToClipboard = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2200);
    } catch {
      /* fallback: silently ignore */
    }
  }, []);

  /** Generate a backend link code for the selected group + platform. */
  const handleGenerateCode = useCallback(
    async (platform: BotPlatform) => {
      const group = selectedGroup[platform];
      if (!group) return;

      setCodeGenerating((prev) => ({ ...prev, [platform]: true }));
      try {
        const result = await botService.generateLinkCode(group.id, platform);
        setGeneratedCode((prev) => ({ ...prev, [platform]: result }));
        // Pre-fill the link code input with the generated code
        setLinkCode((prev) => ({ ...prev, [platform]: result.link_code }));
      } catch {
        /* errors are surfaced via connectionStatus */
      } finally {
        setCodeGenerating((prev) => ({ ...prev, [platform]: false }));
      }
    },
    [selectedGroup],
  );

  /** Submit the link code to the backend. */
  const handleLinkGroup = useCallback(
    (platform: BotPlatform) => {
      const code = linkCode[platform].trim().toUpperCase();
      if (!code || connectionStatus[platform] === 'pending') return;
      linkMutation.mutate({ link_code: code, platform });
    },
    [linkCode, connectionStatus, linkMutation],
  );

  /** Unlink a connected group. */
  const handleUnlink = useCallback(
    (payload: UnlinkPayload) => {
      unlinkMutation.mutate(payload);
    },
    [unlinkMutation],
  );

  const updateLinkCode = useCallback((platform: BotPlatform, value: string) => {
    setLinkCode((prev) => ({ ...prev, [platform]: value }));
  }, []);

  const selectGroup = useCallback(
    (platform: BotPlatform, group: AdminGroup | null) => {
      setSelectedGroup((prev) => ({ ...prev, [platform]: group }));
      // Clear any stale generated code when the group changes
      setGeneratedCode((prev) => ({ ...prev, [platform]: null }));
      setLinkCode((prev) => ({ ...prev, [platform]: '' }));
    },
    [],
  );

  return {
    // State
    linkCode,
    connectionStatus,
    linkError,
    copied,
    connectedGroups,
    groupsLoading,
    adminGroups,
    adminGroupsLoading,
    unlinkTarget,
    generatedCode,
    codeGenerating,
    selectedGroup,
    // Actions
    copyToClipboard,
    handleGenerateCode,
    handleLinkGroup,
    handleUnlink,
    updateLinkCode,
    setUnlinkTarget,
    selectGroup,
    refetchGroups,
  };
}

// // src/hooks/useBotIntegration.ts

// 'use client';

// import { useState, useCallback } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// // import { botService } from '../services/bot.service';
// import { botService } from '../components/bot-integration/bot.service';
// import {
//   BotPlatform,
//   ConnectionStatus,
// } from '../components/bot-integration/bot.types';

// export function useBotIntegration() {
//   const queryClient = useQueryClient();

//   const [linkCode, setLinkCode] = useState({ whatsapp: '', telegram: '' });
//   const [connectionStatus, setConnectionStatus] = useState<
//     Record<BotPlatform, ConnectionStatus>
//   >({ whatsapp: 'idle', telegram: 'idle' });
//   const [copied, setCopied] = useState<Record<string, boolean>>({});
//   const [unlinkTarget, setUnlinkTarget] = useState<string | null>(null);

//   // ─── Fetch connected groups ──────────────────────────────────────────────────
//   const {
//     data: connectedGroups = [],
//     isLoading: groupsLoading,
//     refetch: refetchGroups,
//   } = useQuery({
//     queryKey: ['bot-connected-groups'],
//     queryFn: botService.getConnectedGroups,
//     staleTime: 1000 * 60 * 2, // 2 min
//     refetchInterval: 1000 * 60 * 5, // poll every 5 min
//   });

//   // ─── Link group mutation ─────────────────────────────────────────────────────
//   const linkMutation = useMutation({
//     mutationFn: botService.linkGroup,
//     onMutate: ({ platform }) => {
//       setConnectionStatus((prev) => ({ ...prev, [platform]: 'pending' }));
//     },
//     onSuccess: (data, { platform }) => {
//       if (data.success) {
//         setConnectionStatus((prev) => ({ ...prev, [platform]: 'connected' }));
//         setLinkCode((prev) => ({ ...prev, [platform]: '' }));
//         queryClient.invalidateQueries({ queryKey: ['bot-connected-groups'] });
//         // Reset to idle after success animation
//         setTimeout(() => {
//           setConnectionStatus((prev) => ({ ...prev, [platform]: 'idle' }));
//         }, 3000);
//       } else {
//         setConnectionStatus((prev) => ({ ...prev, [platform]: 'error' }));
//         setTimeout(() => {
//           setConnectionStatus((prev) => ({ ...prev, [platform]: 'idle' }));
//         }, 2500);
//       }
//     },
//     onError: (_err, { platform }) => {
//       setConnectionStatus((prev) => ({ ...prev, [platform]: 'error' }));
//       setTimeout(() => {
//         setConnectionStatus((prev) => ({ ...prev, [platform]: 'idle' }));
//       }, 2500);
//     },
//   });

//   // ─── Unlink mutation ─────────────────────────────────────────────────────────
//   const unlinkMutation = useMutation({
//     mutationFn: botService.unlinkGroup,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['bot-connected-groups'] });
//       setUnlinkTarget(null);
//     },
//   });

//   // ─── Helpers ─────────────────────────────────────────────────────────────────
//   const copyToClipboard = useCallback(async (text: string, key: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopied((prev) => ({ ...prev, [key]: true }));
//       setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2200);
//     } catch {
//       // fallback for older browsers
//     }
//   }, []);

//   const handleLinkGroup = useCallback(
//     (platform: BotPlatform) => {
//       const code = linkCode[platform].trim().toUpperCase();
//       if (!code || connectionStatus[platform] === 'pending') return;
//       linkMutation.mutate({ linkCode: code, platform });
//     },
//     [linkCode, connectionStatus, linkMutation],
//   );

//   const handleUnlink = useCallback(
//     (groupId: string) => {
//       unlinkMutation.mutate(groupId);
//     },
//     [unlinkMutation],
//   );

//   const updateLinkCode = useCallback((platform: BotPlatform, value: string) => {
//     setLinkCode((prev) => ({ ...prev, [platform]: value }));
//   }, []);

//   return {
//     // State
//     linkCode,
//     connectionStatus,
//     copied,
//     connectedGroups,
//     groupsLoading,
//     unlinkTarget,
//     // Mutations
//     linkError:
//       linkMutation.data?.success === false ? linkMutation.data.error : null,
//     // Actions
//     copyToClipboard,
//     handleLinkGroup,
//     handleUnlink,
//     updateLinkCode,
//     setUnlinkTarget,
//     refetchGroups,
//   };
// }
