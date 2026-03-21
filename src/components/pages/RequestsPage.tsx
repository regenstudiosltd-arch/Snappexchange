'use client';

import { useState } from 'react';
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
} from 'lucide-react';
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
  };
  requested_at: string;
  reason?: string;
}

interface Group {
  id: number;
  group_name: string;
}

export function RequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'pending' | 'accepted' | 'declined'
  >('pending');
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(
    null,
  );
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // ==================== STATS ====================
  const { data: stats } = useQuery({
    queryKey: ['join-requests-stats'],
    queryFn: authService.getJoinRequestsStats,
  });

  const pendingCount = stats?.pending ?? 0;
  const acceptedCount = stats?.accepted ?? 0;
  const declinedCount = stats?.declined ?? 0;

  // ==================== ALL PENDING REQUESTS ACROSS ADMIN GROUPS ====================
  const { data: myGroups } = useQuery<Group[]>({
    queryKey: ['my-joined-groups'],
    queryFn: authService.getMyJoinedGroups,
  });

  const { data: allPendingRequests = [] } = useQuery<JoinRequest[]>({
    queryKey: ['all-pending-requests'],
    queryFn: async () => {
      if (!myGroups || myGroups.length === 0) return [];

      const requestsPerGroup = await Promise.all(
        myGroups.map(async (group) => {
          try {
            const res = await authService.getGroupJoinRequests(group.id);
            return res.map((r: JoinRequest) => ({
              id: r.id,
              group_name: r.group_name,
              user_details: r.user_details,
              requested_at: r.requested_at,
              reason: r.reason,
            }));
          } catch (err: unknown) {
            const error = err as { response?: { status?: number } };
            if (error.response?.status === 403) return [];
            throw err;
          }
        }),
      );

      return requestsPerGroup.flat();
    },
    enabled: !!myGroups,
  });

  // ==================== ACTIONS ====================
  const actionMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number;
      action: 'approve' | 'reject';
    }) => authService.actionJoinRequest(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['join-requests-stats'] });
    },
  });

  const handleAccept = (requestId: number) => {
    actionMutation.mutate({ id: requestId, action: 'approve' });
    setIsProfileModalOpen(false);
  };

  const handleDecline = (requestId: number) => {
    actionMutation.mutate({ id: requestId, action: 'reject' });
    setIsProfileModalOpen(false);
  };

  const handleReview = (request: JoinRequest) => {
    setSelectedRequest(request);
    setIsProfileModalOpen(true);
  };

  // Filter only for current tab
  const filteredRequests =
    activeTab === 'pending'
      ? allPendingRequests.filter(
          (req) =>
            req.user_details.full_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            req.group_name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : [];

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
    <div className="space-y-6">
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

      {/* Search + Tabs */}
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
                    className="ml-2 bg-primary/20 text-primary dark:bg-primary/30"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </Button>

              <Button
                variant={activeTab === 'accepted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('accepted')}
              >
                Accepted
              </Button>

              <Button
                variant={activeTab === 'declined' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('declined')}
              >
                Declined
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {activeTab !== 'pending' ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No list available yet
              </h3>
              <p className="text-muted-foreground">
                Accepted and Declined requests can be viewed in the individual
                group details.
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No pending requests
              </h3>
              <p className="text-muted-foreground">
                You&apos;ll see join requests here when users apply to your
                groups
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
                          <UserCircle2 className="h-8 w-8 text-primary" />
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReview(request)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDecline(request.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleAccept(request.id)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
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
        />
      )}
    </div>
  );
}
