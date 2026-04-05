// src/components/modals/JoinGroupModal/JoinGroupModal.tsx

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { apiClient } from '@/src/lib/axios';
import { authService } from '@/src/services/auth.service';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

import { JoinStep, Group, JoinGroupModalProps } from './types';
import { extractJoinErrorMessage } from './utils';
import { STALE_TIME_MS, SEARCH_DEBOUNCE_MS } from './constants';
import { GroupDetailView } from './Groupdetailview';
import { GroupCard } from './Groupcard';
import { useDebounce } from '@/src/hooks/useDebounce';

const PAGE_SIZE = 6;
const EMPTY_GROUPS: Group[] = [];

interface GroupsPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: Group[];
}

// ── Pagination bar ────────────────────────────────────────────────────────────

interface PaginationBarProps {
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  isFetching: boolean;
  onPrev: () => void;
  onNext: () => void;
}

function PaginationBar({
  page,
  totalPages,
  hasPrev,
  hasNext,
  isFetching,
  onPrev,
  onNext,
}: PaginationBarProps) {
  // Don't render when everything fits on one page
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrev || isFetching}
        onClick={onPrev}
        className="gap-1.5"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <span className="text-sm text-muted-foreground tabular-nums select-none">
        {isFetching ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin inline-block" />
        ) : (
          <>
            Page {page} of {totalPages}
          </>
        )}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={!hasNext || isFetching}
        onClick={onNext}
        className="gap-1.5"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ── Skeleton grid (shown on initial load) ─────────────────────────────────────

function GroupCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-5 w-14 rounded-full bg-muted" />
      </div>
      <div className="h-3 w-24 rounded bg-muted" />
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-4/5 rounded bg-muted" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted" />
      <div className="flex justify-between border-t border-border pt-3">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-3 w-12 rounded bg-muted" />
      </div>
    </div>
  );
}

function GroupGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <GroupCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function JoinGroupModal({ isOpen, onClose }: JoinGroupModalProps) {
  // ── Pagination & search state ────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  // Reset to page 1 whenever the search term changes so we never land on a
  // page that doesn't exist for the new result set.
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  // ── Step / selection state ────────────────────────────────────────────────────
  const [step, setStep] = useState<JoinStep>('list');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  // ── Join-request form state ──────────────────────────────────────────────────
  const [isJoining, setIsJoining] = useState(false);
  const [joinReason, setJoinReason] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ── Reset everything when the modal closes ───────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setStep('list');
      setSelectedGroupId(null);
      setSearchQuery('');
      setJoinReason('');
      setTermsAccepted(false);
      setPage(1);
    }
  }, [isOpen]);

  // ── Server-side paginated + searched groups ──────────────────────────────────
  const {
    data: groupsPage,
    isLoading, // true only on the very first fetch (no cached data yet)
    isFetching, // true on every background refetch / page change
    isError,
  } = useQuery<GroupsPage>({
    queryKey: ['all-groups', page, debouncedQuery],
    queryFn: async () => {
      const params: Record<string, string | number> = { page };
      if (debouncedQuery.trim()) params.search = debouncedQuery.trim();
      const response = await apiClient.get('/accounts/groups/all/', { params });
      return response.data as GroupsPage;
    },
    enabled: isOpen, // don't fetch while the modal is closed
    staleTime: STALE_TIME_MS,
  });

  const groups = groupsPage?.results ?? EMPTY_GROUPS;
  const totalCount = groupsPage?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasNext = !!groupsPage?.next;
  const hasPrev = !!groupsPage?.previous;

  // ── User's existing memberships (to mark cards as "Joined") ─────────────────
  const { data: myJoinedData } = useQuery({
    queryKey: ['my-joined-groups'],
    queryFn: authService.getMyJoinedGroups,
    enabled: isOpen,
    staleTime: STALE_TIME_MS,
  });

  const userJoinedGroupIds = useMemo<Set<number>>(() => {
    const list: Group[] = myJoinedData?.results ?? myJoinedData ?? [];
    return new Set(list.map((g) => g.id));
  }, [myJoinedData]);

  // ── Derived selections ────────────────────────────────────────────────────────
  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  const isAlreadyMember =
    selectedGroupId !== null && userJoinedGroupIds.has(selectedGroupId);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleSelectGroup = useCallback((groupId: number) => {
    setSelectedGroupId(groupId);
    setStep('detail');
  }, []);

  const handleBack = useCallback(() => {
    setStep('list');
    setJoinReason('');
    setTermsAccepted(false);
  }, []);

  const handleJoinRequest = useCallback(async () => {
    if (!selectedGroup || !termsAccepted) return;

    setIsJoining(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const response = await apiClient.post(
        `/accounts/groups/${selectedGroup.id}/request_join/`,
        { reason: joinReason },
        { headers: { 'X-Idempotency-Key': idempotencyKey } },
      );
      toast.success('Request Sent', {
        description:
          response.data.message ??
          'Your join request has been sent successfully!',
      });
      onClose();
    } catch (err) {
      const axiosError = err as AxiosError<{
        error?: string;
        detail?: string;
        message?: string;
      }>;
      toast.error('Join Request Failed', {
        description: extractJoinErrorMessage(axiosError),
      });
    } finally {
      setIsJoining(false);
    }
  }, [selectedGroup, termsAccepted, joinReason, onClose]);

  // ── List-view content ─────────────────────────────────────────────────────────
  const renderListContent = () => {
    // Initial skeleton — only shown before the very first response arrives
    if (isLoading) return <GroupGridSkeleton />;

    if (isError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load savings groups. Please try again.
          </AlertDescription>
        </Alert>
      );
    }

    if (groups.length === 0) {
      const hasQuery = debouncedQuery.trim().length > 0;
      return (
        <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium text-foreground">
            {hasQuery ? 'No groups match your search' : 'No public groups yet'}
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {hasQuery
              ? `No results for "${debouncedQuery}". Try a different name or frequency.`
              : 'Be the first to create a savings circle for your community.'}
          </p>
        </div>
      );
    }

    return (
      // Subtle opacity fade during background page changes to signal loading
      // without collapsing the layout.
      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 transition-opacity duration-150"
        style={{ opacity: isFetching ? 0.55 : 1 }}
      >
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            isJoined={userJoinedGroupIds.has(group.id)}
            onClick={() => handleSelectGroup(group.id)}
          />
        ))}
      </div>
    );
  };

  // ── JSX ───────────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto no-scrollbar border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {step === 'detail' ? 'Group Details' : 'Join a Savings Group'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 'detail'
              ? 'Review group information before sending your request'
              : 'Browse and join public savings circles'}
          </DialogDescription>
        </DialogHeader>

        {step === 'list' ? (
          /* ── LIST VIEW ── */
          <div className="space-y-5 py-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or description..."
                className="h-11 bg-background pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
            </div>

            {/* Result count */}
            {!isLoading && totalCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {debouncedQuery.trim()
                  ? `${totalCount} group${totalCount !== 1 ? 's' : ''} match "${debouncedQuery}"`
                  : `${totalCount} group${totalCount !== 1 ? 's' : ''} available`}
              </p>
            )}

            {/* Group cards */}
            {renderListContent()}

            {/* Pagination */}
            <PaginationBar
              page={page}
              totalPages={totalPages}
              hasPrev={hasPrev}
              hasNext={hasNext}
              isFetching={isFetching && !isLoading}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => p + 1)}
            />
          </div>
        ) : (
          /* ── DETAIL VIEW ── */
          selectedGroup && (
            <GroupDetailView
              group={selectedGroup}
              isAlreadyMember={isAlreadyMember}
              isJoining={isJoining}
              joinReason={joinReason}
              termsAccepted={termsAccepted}
              onJoinReasonChange={setJoinReason}
              onTermsChange={setTermsAccepted}
              onBack={handleBack}
              onJoinRequest={handleJoinRequest}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

// // src/components/modals/JoinGroupModal/JoinGroupModal.tsx

// 'use client';

// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { Search, Users, AlertCircle, Loader2 } from 'lucide-react';
// import { Input } from '../../ui/input';
// import { Alert, AlertDescription } from '../../ui/alert';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '../../ui/dialog';
// import { apiClient } from '@/src/lib/axios';
// import { authService } from '@/src/services/auth.service';
// import { AxiosError } from 'axios';
// import { toast } from 'sonner';
// import { useQuery } from '@tanstack/react-query';

// import { JoinStep, Group, JoinGroupModalProps } from './types';
// import { filterGroups, extractJoinErrorMessage } from './utils';
// import { STALE_TIME_MS, SEARCH_DEBOUNCE_MS } from './constants';
// import { GroupDetailView } from './Groupdetailview';
// import { GroupCard } from './Groupcard';
// import { useDebounce } from '@/src/hooks/useDebounce';

// export function JoinGroupModal({ isOpen, onClose }: JoinGroupModalProps) {
//   // ── Data ────────────────────────────────────────────────────────────────────
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');

//   // ── UI ──────────────────────────────────────────────────────────────────────
//   const [step, setStep] = useState<JoinStep>('list');
//   const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
//   const [fetchState, setFetchState] = useState<'idle' | 'loading' | 'error'>(
//     'idle',
//   );
//   const [fetchError, setFetchError] = useState<string | null>(null);

//   // ── Form (join request) ──────────────────────────────────────────────────────
//   const [isJoining, setIsJoining] = useState(false);
//   const [joinReason, setJoinReason] = useState('');
//   const [termsAccepted, setTermsAccepted] = useState(false);

//   // ── Debounced search query for filtering ─────────────────────────────────────
//   const debouncedQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

//   // ── User's current memberships ───────────────────────────────────────────────
//   const { data: myJoinedData } = useQuery({
//     queryKey: ['my-joined-groups'],
//     queryFn: authService.getMyJoinedGroups,
//     enabled: isOpen,
//     staleTime: STALE_TIME_MS,
//   });

//   const userJoinedGroupIds = useMemo<Set<number>>(() => {
//     const list: Group[] = myJoinedData?.results ?? myJoinedData ?? [];
//     return new Set(list.map((g) => g.id));
//   }, [myJoinedData]);

//   // ── Derived selections ───────────────────────────────────────────────────────
//   const selectedGroup = useMemo(
//     () => groups.find((g) => g.id === selectedGroupId) ?? null,
//     [groups, selectedGroupId],
//   );

//   const isAlreadyMember =
//     selectedGroupId !== null && userJoinedGroupIds.has(selectedGroupId);

//   /**
//    * Client-side filtered list. Groups are fetched once on open;
//    * filtering is done in-memory to avoid extra network round-trips.
//    */
//   const filteredGroups = useMemo(
//     () => filterGroups(groups, debouncedQuery),
//     [groups, debouncedQuery],
//   );

//   // ── Fetch groups once per open ───────────────────────────────────────────────
//   const fetchGroups = useCallback(async () => {
//     setFetchState('loading');
//     setFetchError(null);
//     try {
//       const response = await apiClient.get('/accounts/groups/all/');
//       setGroups(response.data.results ?? response.data);
//       setFetchState('idle');
//     } catch (err) {
//       const axiosError = err as AxiosError<{ detail?: string }>;
//       setFetchError(
//         axiosError.response?.data?.detail ?? 'Failed to fetch savings groups.',
//       );
//       setFetchState('error');
//     }
//   }, []);

//   // Fetch on open; reset state on close.
//   useEffect(() => {
//     if (isOpen) {
//       fetchGroups();
//     } else {
//       // Reset everything so the modal starts fresh next time
//       setStep('list');
//       setSelectedGroupId(null);
//       setSearchQuery('');
//       setJoinReason('');
//       setTermsAccepted(false);
//     }
//   }, [isOpen, fetchGroups]);

//   // ── Handlers ─────────────────────────────────────────────────────────────────
//   const handleSelectGroup = useCallback((groupId: number) => {
//     setSelectedGroupId(groupId);
//     setStep('detail');
//   }, []);

//   const handleBack = useCallback(() => {
//     setStep('list');
//     setJoinReason('');
//     setTermsAccepted(false);
//   }, []);

//   const handleJoinRequest = useCallback(async () => {
//     if (!selectedGroup || !termsAccepted) return;

//     setIsJoining(true);
//     try {
//       const idempotencyKey = crypto.randomUUID();
//       const response = await apiClient.post(
//         `/accounts/groups/${selectedGroup.id}/request_join/`,
//         { reason: joinReason },
//         { headers: { 'X-Idempotency-Key': idempotencyKey } },
//       );

//       toast.success('Request Sent', {
//         description:
//           response.data.message ??
//           'Your join request has been sent successfully!',
//       });
//       onClose();
//     } catch (err) {
//       const axiosError = err as AxiosError<{
//         error?: string;
//         detail?: string;
//         message?: string;
//       }>;
//       toast.error('Join Request Failed', {
//         description: extractJoinErrorMessage(axiosError),
//       });
//     } finally {
//       setIsJoining(false);
//     }
//   }, [selectedGroup, termsAccepted, joinReason, onClose]);

//   // ── Render helpers ────────────────────────────────────────────────────────────
//   const renderListContent = () => {
//     if (fetchState === 'loading') {
//       return (
//         <div className="flex flex-col items-center justify-center py-20">
//           <Loader2 className="h-9 w-9 animate-spin text-primary" />
//           <p className="mt-3 text-sm text-muted-foreground">
//             Finding active circles...
//           </p>
//         </div>
//       );
//     }

//     if (fetchState === 'error') {
//       return (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{fetchError}</AlertDescription>
//         </Alert>
//       );
//     }

//     if (filteredGroups.length === 0) {
//       const hasQuery = debouncedQuery.trim().length > 0;
//       return (
//         <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16 text-center">
//           <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
//           <p className="font-medium text-foreground">
//             {hasQuery ? 'No groups match your search' : 'No public groups yet'}
//           </p>
//           <p className="mt-1 max-w-xs text-sm text-muted-foreground">
//             {hasQuery
//               ? `No results for "${debouncedQuery}". Try a different name or frequency.`
//               : 'Be the first to create a savings circle for your community.'}
//           </p>
//         </div>
//       );
//     }

//     return filteredGroups.map((group) => (
//       <GroupCard
//         key={group.id}
//         group={group}
//         isJoined={userJoinedGroupIds.has(group.id)}
//         onClick={() => handleSelectGroup(group.id)}
//       />
//     ));
//   };

//   // ── JSX ───────────────────────────────────────────────────────────────────────
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto no-scrollbar border-border bg-card">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-bold text-foreground">
//             {step === 'detail' ? 'Group Details' : 'Join a Savings Group'}
//           </DialogTitle>
//           <DialogDescription className="text-muted-foreground">
//             {step === 'detail'
//               ? 'Review group information before sending your request'
//               : 'Browse and join public savings circles'}
//           </DialogDescription>
//         </DialogHeader>

//         {step === 'list' ? (
//           /* ── LIST VIEW ── */
//           <div className="space-y-5 py-3">
//             {/* Search input */}
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//               <Input
//                 placeholder="Search by name, admin, or frequency..."
//                 className="h-11 bg-background pl-10"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 autoComplete="off"
//               />
//             </div>

//             {/* Results count */}
//             {fetchState === 'idle' && groups.length > 0 && (
//               <p className="text-xs text-muted-foreground">
//                 {debouncedQuery
//                   ? `${filteredGroups.length} of ${groups.length} groups`
//                   : `${groups.length} group${groups.length !== 1 ? 's' : ''} available`}
//               </p>
//             )}

//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//               {renderListContent()}
//             </div>
//           </div>
//         ) : (
//           /* ── DETAIL VIEW ── */
//           selectedGroup && (
//             <GroupDetailView
//               group={selectedGroup}
//               isAlreadyMember={isAlreadyMember}
//               isJoining={isJoining}
//               joinReason={joinReason}
//               termsAccepted={termsAccepted}
//               onJoinReasonChange={setJoinReason}
//               onTermsChange={setTermsAccepted}
//               onBack={handleBack}
//               onJoinRequest={handleJoinRequest}
//             />
//           )
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

// // src/components/modals/JoinGroupModal.tsx

// 'use client';
// import { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//   Search,
//   Users,
//   Banknote,
//   Calendar,
//   Check,
//   Loader2,
//   AlertCircle,
//   ArrowLeft,
// } from 'lucide-react';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Textarea } from '../ui/textarea';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '../ui/dialog';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import { Alert, AlertDescription } from '../ui/alert';
// import { Badge } from '../ui/badge';
// import { apiClient } from '@/src/lib/axios';
// import { authService } from '@/src/services/auth.service';
// import { AxiosError } from 'axios';
// import { toast } from 'sonner';
// import { useQuery } from '@tanstack/react-query';

// interface Group {
//   id: number;
//   group_name: string;
//   admin_name: string;
//   current_members: number;
//   expected_members: number;
//   contribution_amount: string;
//   frequency: string;
//   description: string;
// }

// export function JoinGroupModal({
//   isOpen,
//   onClose,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
// }) {
//   // Data State
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');

//   // UI State
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showDetails, setShowDetails] = useState(false);
//   const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

//   // Form State (only used when NOT already a member)
//   const [joiningId, setJoiningId] = useState<number | null>(null);
//   const [joinReason, setJoinReason] = useState('');
//   const [termsAccepted, setTermsAccepted] = useState(false);

//   // USER'S CURRENT MEMBERSHIPS
//   const { data: myJoinedData } = useQuery({
//     queryKey: ['my-joined-groups'],
//     queryFn: authService.getMyJoinedGroups,
//     enabled: isOpen,
//     staleTime: 5 * 60 * 1000,
//   });

//   const userJoinedGroupIds = useMemo(() => {
//     const joinedGroups = myJoinedData?.results || myJoinedData || [];
//     return new Set(joinedGroups.map((g: Group) => g.id));
//   }, [myJoinedData]);

//   const selectedGroupData = groups.find((g) => g.id === selectedGroupId);
//   const isAlreadyMember =
//     selectedGroupId !== null && userJoinedGroupIds.has(selectedGroupId);

//   // Fetch public groups
//   const fetchGroups = useCallback(async (query: string = '') => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await apiClient.get('/accounts/groups/all/', {
//         params: { search: query },
//       });
//       setGroups(response.data.results || response.data);
//     } catch (err) {
//       const axiosError = err as AxiosError<{ detail?: string }>;
//       setError(
//         axiosError.response?.data?.detail || 'Failed to fetch savings groups',
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (isOpen) {
//       fetchGroups(searchQuery);
//     } else {
//       setShowDetails(false);
//       setSelectedGroupId(null);
//       setJoinReason('');
//       setTermsAccepted(false);
//       setJoiningId(null);
//     }
//   }, [isOpen, searchQuery, fetchGroups]);

//   const handleJoinRequest = async (groupId: number) => {
//     if (!termsAccepted) return;
//     setJoiningId(groupId);
//     try {
//       const idempotencyKey = crypto.randomUUID();
//       const response = await apiClient.post(
//         `/accounts/groups/${groupId}/request_join/`,
//         { reason: joinReason },
//         { headers: { 'X-Idempotency-Key': idempotencyKey } },
//       );

//       toast.success('Request Sent', {
//         description: response.data.message || 'Join request sent successfully!',
//       });
//       onClose();
//     } catch (err) {
//       const axiosError = err as AxiosError<{ error?: string; detail?: string }>;
//       toast.error('Join Request Failed', {
//         description:
//           axiosError.response?.data?.error ||
//           axiosError.response?.data?.detail ||
//           'Failed to send join request. Please try again.',
//       });
//     } finally {
//       setJoiningId(null);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto no-scrollbar bg-card border-border">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold text-foreground">
//             {showDetails ? 'Group Details' : 'Join a Savings Group'}
//           </DialogTitle>
//           <DialogDescription className="text-muted-foreground">
//             {showDetails
//               ? 'Review group information before joining'
//               : 'Browse and join public savings groups'}
//           </DialogDescription>
//         </DialogHeader>

//         {!showDetails ? (
//           /*  LIST VIEW  */
//           <div className="space-y-6 py-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//               <Input
//                 placeholder="Search groups..."
//                 className="pl-10 h-12 bg-background"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>

//             {isLoading ? (
//               <div className="flex flex-col items-center justify-center py-20">
//                 <Loader2 className="h-10 w-10 animate-spin text-primary" />
//                 <p className="mt-4 text-muted-foreground">
//                   Finding active circles...
//                 </p>
//               </div>
//             ) : error ? (
//               <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {groups.length > 0 ? (
//                   groups.map((group) => {
//                     const alreadyJoined = userJoinedGroupIds.has(group.id);
//                     return (
//                       <Card
//                         key={group.id}
//                         className={`hover:shadow-md transition-all cursor-pointer bg-card border-border hover:border-primary/50 ${
//                           alreadyJoined ? 'opacity-90' : ''
//                         }`}
//                         onClick={() => {
//                           setSelectedGroupId(group.id);
//                           setShowDetails(true);
//                         }}
//                       >
//                         <CardHeader className="pb-3">
//                           <div className="flex justify-between items-start">
//                             <CardTitle className="text-lg font-semibold text-foreground">
//                               {group.group_name}
//                             </CardTitle>
//                             <div className="flex items-center gap-2">
//                               <span className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-1 rounded-full">
//                                 {group.frequency}
//                               </span>
//                               {alreadyJoined && (
//                                 <Badge
//                                   variant="secondary"
//                                   className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-[10px]"
//                                 >
//                                   ✓ Joined
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                           <CardDescription className="mt-1">
//                             Admin: {group.admin_name}
//                           </CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                           <p className="text-sm text-muted-foreground line-clamp-2">
//                             {group.description ||
//                               'Join this group to start your savings journey together.'}
//                           </p>
//                           <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
//                             <div className="flex items-center gap-2 text-muted-foreground">
//                               <Users className="h-4 w-4 text-primary" />
//                               <span>
//                                 {group.current_members}/{group.expected_members}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2 font-medium text-foreground">
//                               <span>
//                                 ₵
//                                 {parseFloat(
//                                   group.contribution_amount,
//                                 ).toLocaleString()}
//                               </span>
//                             </div>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     );
//                   })
//                 ) : (
//                   <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
//                     <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
//                     <p className="px-2 text-muted-foreground font-medium">
//                       There are no public groups at the moment. You can be the
//                       first to create one.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ) : (
//           /*  DETAIL VIEW  */
//           selectedGroupData && (
//             <div className="space-y-6 py-4">
//               {/* Header Card */}
//               <div className="bg-linear-to-r from-cyan-600 to-teal-500 rounded-xl p-6 text-primary-foreground shadow-md">
//                 <h3 className="text-2xl font-bold mb-1 dark:text-white">
//                   {selectedGroupData.group_name}
//                 </h3>
//                 <p className="opacity-90 text-sm dark:text-white">
//                   Administered by {selectedGroupData.admin_name}
//                 </p>
//               </div>

//               {/* Stats Grid */}
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 <div className="text-center p-5 bg-card border border-border rounded-xl">
//                   <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
//                   <div className="text-xs text-muted-foreground mb-1">
//                     Members
//                   </div>
//                   <div className="text-lg font-bold text-foreground">
//                     {selectedGroupData.current_members} /{' '}
//                     {selectedGroupData.expected_members}
//                   </div>
//                 </div>
//                 <div className="text-center p-5 bg-card border border-border rounded-xl">
//                   <Banknote className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
//                   <div className="text-xs text-muted-foreground mb-1">
//                     Contribution
//                   </div>
//                   <div className="text-lg font-bold text-foreground">
//                     ₵
//                     {parseFloat(
//                       selectedGroupData.contribution_amount,
//                     ).toLocaleString()}
//                   </div>
//                 </div>
//                 <div className="text-center p-5 bg-card border border-border rounded-xl">
//                   <Calendar className="h-6 w-6 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
//                   <div className="text-xs text-muted-foreground mb-1">
//                     Frequency
//                   </div>
//                   <div className="text-lg font-bold capitalize text-foreground">
//                     {selectedGroupData.frequency}
//                   </div>
//                 </div>
//               </div>

//               {/* Description */}
//               <div>
//                 <h4 className="font-semibold text-foreground mb-2">
//                   About This Group
//                 </h4>
//                 <p className="text-muted-foreground text-sm leading-relaxed">
//                   {selectedGroupData.description ||
//                     'No description provided for this group.'}
//                 </p>
//               </div>

//               {/* Rules Section */}
//               <div className="p-5 bg-muted/40 border border-border rounded-xl">
//                 <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
//                   Group Rules
//                 </h4>
//                 <ul className="space-y-2.5 text-sm text-muted-foreground">
//                   <li className="flex items-start gap-2">
//                     <span className="text-primary font-bold">•</span>
//                     Contributions must be made on time to ensure rotation
//                     integrity.
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="text-primary font-bold">•</span>
//                     Payouts follow the system-generated rotation schedule.
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="text-primary font-bold">•</span>
//                     Missing multiple contributions may lead to administrative
//                     removal.
//                   </li>
//                 </ul>
//               </div>

//               {/* CONDITIONAL MEMBER STATE */}
//               {isAlreadyMember ? (
//                 <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-6 rounded-2xl text-center">
//                   <Check className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
//                   <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
//                     You&apos;re already a member!
//                   </h4>
//                   <p className="text-emerald-600 dark:text-emerald-500 text-sm">
//                     You created or joined this savings group. No need to request
//                     again.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-5">
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-foreground">
//                       Introduction (Optional)
//                     </label>
//                     <Textarea
//                       placeholder="Tell the admin why you'd like to join this circle..."
//                       value={joinReason}
//                       onChange={(e) => setJoinReason(e.target.value)}
//                       className="min-h-25 bg-background"
//                     />
//                   </div>
//                   <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border">
//                     <input
//                       type="checkbox"
//                       id="terms"
//                       className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
//                       checked={termsAccepted}
//                       onChange={(e) => setTermsAccepted(e.target.checked)}
//                     />
//                     <label
//                       htmlFor="terms"
//                       className="text-sm text-muted-foreground leading-normal cursor-pointer"
//                     >
//                       I have read and agree to abide by the group rules and
//                       contribution schedule. I understand that financial
//                       commitment is essential for the circle&apos;s success.
//                     </label>
//                   </div>
//                 </div>
//               )}

//               {/* Footer Actions */}
//               <div className="flex gap-3 pt-5 border-t border-border">
//                 <Button
//                   variant="outline"
//                   className="flex-1"
//                   onClick={() => setShowDetails(false)}
//                 >
//                   <ArrowLeft className="h-4 w-4 mr-2" />
//                   Back to Groups
//                 </Button>

//                 {isAlreadyMember ? (
//                   <Button
//                     variant="secondary"
//                     className="flex-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300"
//                     disabled
//                   >
//                     <Check className="h-4 w-4 mr-2" />
//                     Already a Member
//                   </Button>
//                 ) : (
//                   <Button
//                     className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
//                     disabled={
//                       !termsAccepted || joiningId === selectedGroupData.id
//                     }
//                     onClick={() => handleJoinRequest(selectedGroupData.id)}
//                   >
//                     {joiningId === selectedGroupData.id ? (
//                       <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                     ) : (
//                       <>
//                         <Check className="h-4 w-4 mr-2" />
//                         Send Join Request
//                       </>
//                     )}
//                   </Button>
//                 )}
//               </div>
//             </div>
//           )
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }
