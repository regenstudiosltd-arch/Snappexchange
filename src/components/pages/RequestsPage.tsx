'use client';

import { useState } from 'react';
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
import { UserProfileModal } from '../modals/UserProfileModal';
import { authService } from '@/src/services/auth.service';
import { cn } from '../ui/utils';

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

export function RequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'pending' | 'approved' | 'rejected'
  >('pending');
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(
    null,
  );
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['join-requests-stats'],
    queryFn: authService.getJoinRequestsStats,
  });

  const pendingCount = stats?.pending ?? 0;
  const acceptedCount = stats?.accepted ?? 0;
  const declinedCount = stats?.declined ?? 0;

  const { data: groupsData } = useQuery({
    queryKey: ['my-joined-groups'],
    queryFn: authService.getMyJoinedGroups,
  });

  const myGroups: Group[] = groupsData?.results || groupsData || [];

  const adminGroups = myGroups.filter((g) => g.is_current_user_admin);

  const { data: requestsForTab = [] } = useQuery<JoinRequest[]>({
    queryKey: ['group-requests', activeTab, adminGroups],
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

  //  ACTIONS
  const actionMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number;
      action: 'approve' | 'reject';
    }) => authService.actionJoinRequest(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-requests'] });
      queryClient.invalidateQueries({ queryKey: ['join-requests-stats'] });
      setIsProfileModalOpen(false);
    },
  });

  const handleAccept = (requestId: number) => {
    setProcessingId(requestId);
    actionMutation.mutate(
      { id: requestId, action: 'approve' },
      {
        onSettled: () => setProcessingId(null),
      },
    );
  };

  const handleDecline = (requestId: number) => {
    setProcessingId(requestId);
    actionMutation.mutate(
      { id: requestId, action: 'reject' },
      {
        onSettled: () => setProcessingId(null),
      },
    );
  };

  const handleReview = (request: JoinRequest) => {
    setSelectedRequest(request);
    setIsProfileModalOpen(true);
  };

  const filteredRequests = requestsForTab.filter(
    (req) =>
      req.user_details.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      req.group_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

  if (adminGroups.length === 0) {
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
              Create a group.
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:mb-0 mb-16">
      {/* Header */}
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

      {/* Stats Cards */}
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
              {pendingCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
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
              {acceptedCount}
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
              {declinedCount}
            </div>
            <p className="text-xs text-muted-foreground">Requests rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Tabs (now all have badges) */}
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
                {pendingCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-primary/20 text-primary"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('approved')}
              >
                Accepted
                {acceptedCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-500/20 text-green-600"
                  >
                    {acceptedCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('rejected')}
              >
                Declined
                {declinedCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-red-500/20 text-red-600"
                  >
                    {declinedCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No {activeTab} requests
              </h3>
              <p className="text-muted-foreground">
                No requests in this category yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card
                  key={request.id}
                  className="border-l-4 border-l-primary bg-card"
                >
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
                        {/* Only show action buttons on Pending tab */}
                        {activeTab === 'pending' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReview(request)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> Review
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDecline(request.id)}
                              disabled={
                                processingId === request.id ||
                                actionMutation.isPending
                              }
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                            >
                              {processingId === request.id ? (
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
                              onClick={() => handleAccept(request.id)}
                              disabled={
                                processingId === request.id ||
                                actionMutation.isPending
                              }
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              {processingId === request.id ? (
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
                            variant={
                              activeTab === 'approved'
                                ? 'default'
                                : 'destructive'
                            }
                            className="px-4 py-2 text-sm"
                          >
                            {activeTab === 'approved'
                              ? '✓ Approved'
                              : '✕ Rejected'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {selectedRequest && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          request={selectedRequest}
          onAccept={() => handleAccept(selectedRequest.id)}
          onDecline={() => handleDecline(selectedRequest.id)}
          isProcessing={
            actionMutation.isPending && processingId === selectedRequest.id
          }
        />
      )}
    </div>
  );
}
