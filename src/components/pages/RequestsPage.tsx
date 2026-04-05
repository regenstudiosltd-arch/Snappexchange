'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus,
  Search,
  Check,
  X,
  Eye,
  UserCircle2,
  Calendar,
  Users,
  Loader2,
  Plus,
} from 'lucide-react';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { UserProfileModal } from '../modals/UserProfileModal';
import { RequestsPageError } from '../ErrorStates';

import { authService } from '@/src/services/auth.service';
import { cn } from '../ui/utils';

// Types & Query Keys
interface JoinRequest {
  id: number;
  group_name: string;
  user_details: {
    full_name: string;
    momo_number: string;
    profile_picture?: string | null;
  };
  requested_at: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Group {
  id: number;
  group_name: string;
  is_current_user_admin: boolean;
}

const STATS_QUERY_KEY = ['join-requests-stats'] as const;
const MY_GROUPS_QUERY_KEY = ['my-joined-groups'] as const;
const REQUESTS_QUERY_KEY = ['group-requests'] as const;

// Skeleton Components

function StatCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-3.5 w-28 rounded bg-muted" />
        <div className="h-4 w-4 rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-1.5">
        <div className="h-8 w-12 rounded bg-muted" />
        <div className="h-3 w-32 rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

function RequestCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-muted animate-pulse">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="rounded-full p-3 bg-muted h-14 w-14 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-5 w-24 rounded-full bg-muted" />
              </div>
              <div className="h-3.5 w-full rounded bg-muted" />
              <div className="h-3.5 w-4/5 rounded bg-muted" />
              <div className="flex items-center gap-2 pt-1">
                <div className="h-3 w-3 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-8 w-24 rounded-md bg-muted" />
            <div className="h-8 w-24 rounded-md bg-muted" />
            <div className="h-8 w-24 rounded-md bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestsPageSkeleton() {
  return (
    <div className="space-y-6 md:mb-0 mb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-10 flex-1 rounded-md bg-muted" />
            <div className="flex gap-2">
              <div className="h-8 w-24 rounded-md bg-muted" />
              <div className="h-8 w-24 rounded-md bg-muted" />
              <div className="h-8 w-24 rounded-md bg-muted" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <RequestCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable sub-components

function RequestsStats({
  stats,
}: {
  stats?: { pending?: number; accepted?: number; declined?: number };
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending Requests
          </CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats?.pending ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">Awaiting your review</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Accepted
          </CardTitle>
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats?.accepted ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">Members approved</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Declined
          </CardTitle>
          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats?.declined ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">Requests rejected</p>
        </CardContent>
      </Card>
    </div>
  );
}

function RequestCard({
  request,
  activeTab,
  onReview,
  onAccept,
  onDecline,
  isProcessing,
}: {
  request: JoinRequest;
  activeTab: 'pending' | 'approved' | 'rejected';
  onReview: (request: JoinRequest) => void;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  isProcessing: boolean;
}) {
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="border-l-4 border-l-primary bg-card">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-3">
              {request.user_details.profile_picture ? (
                <Image
                  src={request.user_details.profile_picture}
                  alt={`Profile picture of ${request.user_details.full_name}`}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <UserCircle2 className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <h3 className="font-semibold text-foreground">
                  {request.user_details.full_name}
                </h3>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-border text-muted-foreground"
                >
                  <Users className="h-3 w-3" />
                  {request.group_name}
                </Badge>
              </div>
              {request.reason && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {request.reason}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {getRelativeTime(request.requested_at)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeTab === 'pending' ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReview(request)}
                >
                  <Eye className="h-4 w-4 mr-2" /> Review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDecline(request.id)}
                  disabled={isProcessing}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />{' '}
                      Declining...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" /> Decline
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAccept(request.id)}
                  disabled={isProcessing}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />{' '}
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" /> Accept
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Badge
                variant={activeTab === 'approved' ? 'default' : 'destructive'}
                className="px-4 py-2 text-sm"
              >
                {activeTab === 'approved' ? '✓ Approved' : '✕ Rejected'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NoAdminGroupsState() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center text-center max-w-md px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
          <Users className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">
          No groups yet
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          You haven&apos;t created any savings groups yet. Once you create a
          group, join requests will appear here.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/groups">
            <Plus className="h-4 w-4" />
            Create a group
          </Link>
        </Button>
      </div>
    </div>
  );
}

function EmptyRequestsState({
  activeTab,
}: {
  activeTab: 'pending' | 'approved' | 'rejected';
}) {
  return (
    <div className="text-center py-12">
      <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        No {activeTab} requests
      </h3>
      <p className="text-muted-foreground">No requests in this category yet.</p>
    </div>
  );
}

// Main component

export function RequestsPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'pending' | 'approved' | 'rejected'
  >('pending');
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(
    null,
  );
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: STATS_QUERY_KEY,
    queryFn: authService.getJoinRequestsStats,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: groupsData,
    isLoading: isGroupsLoading,
    error: groupsError,
    refetch: refetchGroups,
  } = useQuery({
    queryKey: MY_GROUPS_QUERY_KEY,
    queryFn: authService.getMyJoinedGroups,
    staleTime: 1000 * 60 * 5,
  });

  const myGroups = useMemo<Group[]>(() => {
    return groupsData?.results || groupsData || [];
  }, [groupsData]);

  const adminGroups = useMemo(() => {
    return myGroups.filter((g) => g.is_current_user_admin);
  }, [myGroups]);

  const {
    data: requestsForTab = [],
    isLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useQuery<JoinRequest[]>({
    queryKey: [...REQUESTS_QUERY_KEY, activeTab, adminGroups.map((g) => g.id)],
    queryFn: async () => {
      if (adminGroups.length === 0) return [];
      const requestsPerGroup = await Promise.all(
        adminGroups.map(async (group) => {
          try {
            const res = await authService.getGroupJoinRequests(
              group.id,
              activeTab,
            );
            const dataArray: JoinRequest[] = Array.isArray(res)
              ? res
              : res?.results || [];
            return dataArray.map((r) => ({
              id: r.id,
              group_name: r.group_name || group.group_name,
              user_details: { ...r.user_details },
              requested_at: r.requested_at,
              reason: r.reason,
              status: r.status,
            }));
          } catch (err) {
            console.error(
              `Error fetching requests for group ${group.id}:`,
              err,
            );
            return [];
          }
        }),
      );
      return requestsPerGroup.flat();
    },
    enabled: adminGroups.length > 0,
  });

  const actionMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number;
      action: 'approve' | 'reject';
    }) => authService.actionJoinRequest(id, action),

    onMutate: async ({ id, action }) => {
      setActionError(null);
      await queryClient.cancelQueries({ queryKey: REQUESTS_QUERY_KEY });

      const currentKey = [
        ...REQUESTS_QUERY_KEY,
        activeTab,
        adminGroups.map((g) => g.id),
      ];

      const targetTab = action === 'approve' ? 'approved' : 'rejected';
      const targetKey = [
        ...REQUESTS_QUERY_KEY,
        targetTab,
        adminGroups.map((g) => g.id),
      ];

      const previousRequests =
        queryClient.getQueryData<JoinRequest[]>(currentKey);
      const previousStats = queryClient.getQueryData(STATS_QUERY_KEY);

      let movedRequest: JoinRequest | undefined;
      queryClient.setQueryData<JoinRequest[]>(currentKey, (old = []) => {
        movedRequest = old.find((r) => r.id === id);
        return old.filter((r) => r.id !== id);
      });

      if (movedRequest) {
        queryClient.setQueryData<JoinRequest[]>(targetKey, (old = []) => [
          { ...movedRequest!, status: targetTab },
          ...old,
        ]);
      }

      if (activeTab === 'pending') {
        queryClient.setQueryData<{
          pending?: number;
          accepted?: number;
          declined?: number;
        }>(STATS_QUERY_KEY, (old) => {
          if (!old) return old;
          return {
            ...old,
            pending: Math.max(0, (old.pending ?? 1) - 1),
            accepted:
              action === 'approve' ? (old.accepted ?? 0) + 1 : old.accepted,
            declined:
              action === 'reject' ? (old.declined ?? 0) + 1 : old.declined,
          };
        });
      }

      return { previousRequests, previousStats, currentKey };
    },

    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(context.currentKey, context.previousRequests);
        queryClient.setQueryData(STATS_QUERY_KEY, context.previousStats);
      }
      setActionError('Action failed. Please try again.');
    },

    onSuccess: () => {
      setIsProfileModalOpen(false);
      setSelectedRequest(null);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: REQUESTS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      }, 500);
    },
  });

  const handleAccept = (requestId: number) =>
    actionMutation.mutate({ id: requestId, action: 'approve' });
  const handleDecline = (requestId: number) =>
    actionMutation.mutate({ id: requestId, action: 'reject' });
  const handleReview = (request: JoinRequest) => {
    setSelectedRequest(request);
    setIsProfileModalOpen(true);
  };

  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return requestsForTab;
    return requestsForTab.filter(
      (req) =>
        req.user_details.full_name.toLowerCase().includes(q) ||
        req.group_name.toLowerCase().includes(q),
    );
  }, [requestsForTab, searchQuery]);

  // Show skeleton while either query is in flight
  if (isGroupsLoading || isLoading) return <RequestsPageSkeleton />;

  // ── Network/server failure on the groups fetch ────────────────────────────
  // This MUST come before the adminGroups.length check.
  // Without it, a failed fetch leaves groupsData undefined → adminGroups = []
  // → the user sees "No groups yet" instead of an error, which is wrong.
  if (groupsError) {
    return (
      <div className="space-y-6 md:mb-0 mb-20">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Join Requests
          </h1>
          <p className="text-muted-foreground">
            Manage requests to join your groups
          </p>
        </div>
        <RequestsPageError
          onRetry={() => {
            refetchGroups();
          }}
        />
      </div>
    );
  }

  if (adminGroups.length === 0) return <NoAdminGroupsState />;

  return (
    <div className="space-y-6 md:mb-0 mb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Join Requests
          </h1>
          <p className="text-muted-foreground">
            Manage requests to join your groups
          </p>
        </div>
      </div>

      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <RequestsStats stats={stats} />

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={activeTab === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('pending')}
                className={cn(
                  activeTab === 'pending' &&
                    'bg-primary hover:bg-primary/90 text-primary-foreground',
                )}
              >
                Pending
                {(stats?.pending ?? 0) > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-primary/20 text-primary"
                  >
                    {stats!.pending}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('approved')}
              >
                Accepted
                {(stats?.accepted ?? 0) > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-500/20 text-green-600"
                  >
                    {stats!.accepted}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('rejected')}
              >
                Declined
                {(stats?.declined ?? 0) > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-red-500/20 text-red-600"
                  >
                    {stats!.declined}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* ── Network failure on the requests fetch (tab-level) ── */}
          {requestsError ? (
            <RequestsPageError onRetry={() => refetchRequests()} />
          ) : filteredRequests.length === 0 ? (
            <EmptyRequestsState activeTab={activeTab} />
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  activeTab={activeTab}
                  onReview={handleReview}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  isProcessing={
                    actionMutation.isPending &&
                    actionMutation.variables?.id === request.id
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRequest && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onAccept={() => handleAccept(selectedRequest.id)}
          onDecline={() => handleDecline(selectedRequest.id)}
          isProcessing={
            actionMutation.isPending &&
            actionMutation.variables?.id === selectedRequest.id
          }
        />
      )}
    </div>
  );
}
