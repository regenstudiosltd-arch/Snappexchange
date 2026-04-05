'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, Crown, TrendingUp, Calendar } from 'lucide-react';
import { GroupsPageError } from '../ErrorStates';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { CreateGroupModal } from '../modals/CreateGroupModal/CreateGroupModal';
import { JoinGroupModal } from '../modals/JoinGroupModal/JoinGroupModal';

import { apiClient } from '@/src/lib/axios';
import { decodeHtmlEntities } from '@/src/lib/html';

// Types & Query Keys
interface Group {
  id: number;
  public_id: string;
  group_name: string;
  description: string;
  current_members: number;
  total_savings: string;
  frequency: string;
  contribution_amount: string;
  next_due: string | null;
  status: 'pending' | 'active' | 'completed';
  is_admin: boolean;
}

const GROUPS_QUERY_KEY = ['my-groups'] as const;

// Skeleton Components

function StatCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* Card title */}
        <div className="h-3.5 w-24 rounded bg-muted" />
        {/* Icon placeholder */}
        <div className="h-4 w-4 rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-1.5">
        {/* Big number */}
        <div className="h-8 w-20 rounded bg-muted" />
        {/* Sub-label */}
        <div className="h-3 w-28 rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

function GroupCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex justify-between items-start">
          {/* Avatar + name block */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
            </div>
          </div>
          {/* Badge */}
          <div className="h-5 w-14 rounded-full bg-muted" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description lines */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-full rounded bg-muted" />
          <div className="h-3.5 w-4/5 rounded bg-muted" />
        </div>

        {/* Data rows (Total Savings / Contribution / Next Due) */}
        <div className="pt-2 border-t space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3.5 w-24 rounded bg-muted" />
              <div className="h-3.5 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* View Details button */}
        <div className="h-10 w-full rounded-md bg-muted mt-2" />
      </CardContent>
    </Card>
  );
}

/** Full page skeleton */
function GroupsPageSkeleton() {
  return (
    <div className="space-y-6 mb-20 md:mb-0">
      {/* Header: title block + two action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-36 rounded-lg bg-muted" />
          <div className="h-4 w-52 rounded bg-muted" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="h-10 w-32 rounded-lg bg-muted" />
          <div className="h-10 w-36 rounded-lg bg-muted" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Search input */}
      <div className="h-11 w-full rounded-md bg-muted animate-pulse" />

      {/* Groups grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <GroupCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Reusable sub-components

function GroupsStats({ groups }: { groups: Group[] }) {
  const totalMembers = useMemo(
    () => groups.reduce((sum, g) => sum + (Number(g.current_members) || 0), 0),
    [groups],
  );

  const totalGroupSavings = useMemo(
    () =>
      groups.reduce((sum, g) => sum + (parseFloat(g.total_savings) || 0), 0),
    [groups],
  );

  const activeGroupsCount = useMemo(
    () => groups.filter((g) => g.status === 'active').length,
    [groups],
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{groups.length}</div>
          <p className="text-xs text-muted-foreground">
            {activeGroupsCount} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMembers}</div>
          <p className="text-xs text-muted-foreground">Across all groups</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Group Savings</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            GH₵ {totalGroupSavings.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Combined total</p>
        </CardContent>
      </Card>
    </div>
  );
}

function GroupCard({
  group,
  onViewDetails,
}: {
  group: Group;
  onViewDetails: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="font-semibold truncate max-w-30">
                  {group.group_name}
                </span>
                {group.is_admin && (
                  <Crown className="h-4 w-4 text-yellow-500 shrink-0" />
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                {group.current_members}
                {group.current_members === 1 ? ' member' : ' members'}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={group.status === 'active' ? 'default' : 'secondary'}
            className={
              group.status === 'active'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
            }
          >
            {group.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {group.description
            ? decodeHtmlEntities(group.description)
            : 'No description provided.'}
        </p>
        <div className="text-sm space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Savings</span>
            <span className="font-semibold">
              GH₵ {parseFloat(group.total_savings).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Contribution</span>
            <span>
              GH₵ {parseFloat(group.contribution_amount).toLocaleString()} /{' '}
              {group.frequency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Next Due</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {group.next_due
                ? new Date(group.next_due).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full mt-2 bg-cyan-500 hover:bg-cyan-600 text-white hover:text-white"
          onClick={onViewDetails}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyGroupsState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="text-center py-20 border-2 border-dashed rounded-xl">
      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
      <h3 className="text-xl font-medium mb-2">No groups found</h3>
      <p className="text-muted-foreground mb-6">
        {searchQuery
          ? `We couldn't find any groups matching "${searchQuery}"`
          : 'You have not joined any savings groups yet.'}
      </p>
    </div>
  );
}

// Main component

export function GroupsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const {
    data: groups = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Group[]>({
    queryKey: GROUPS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get('/accounts/groups/my-joined/');
      return response.data?.results || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return groups;
    return groups.filter(
      (group) =>
        group.group_name.toLowerCase().includes(q) ||
        (group.description && group.description.toLowerCase().includes(q)),
    );
  }, [groups, searchQuery]);

  const handleCreateComplete = () => {
    queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    setIsCreateModalOpen(false);
  };

  const handleViewDetails = (group: Group) => {
    router.push(`/groups/${group.public_id ?? group.id}`);
  };

  // ── Skeleton
  if (isLoading) return <GroupsPageSkeleton />;

  return (
    <div className="space-y-6 mb-20 md:mb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="mb-1 text-[24px] md:text-3xl font-bold">My Groups</h1>
          <p className="text-muted-foreground">Manage your savings circles</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setIsJoinModalOpen(true)}
            variant="outline"
            className="flex-1 sm:flex-none gap-2"
          >
            <Search className="h-4 w-4" /> Join Group
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 sm:flex-none bg-cyan-500 hover:bg-cyan-600 gap-2"
          >
            <Plus className="h-4 w-4" /> Create Group
          </Button>
        </div>
      </div>

      {/* Stats */}
      <GroupsStats groups={groups} />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Groups Grid */}
      {error ? (
        <GroupsPageError onRetry={() => refetch()} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onViewDetails={() => handleViewDetails(group)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredGroups.length === 0 && !error && (
        <EmptyGroupsState searchQuery={searchQuery} />
      )}

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onComplete={handleCreateComplete}
      />
      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
}
