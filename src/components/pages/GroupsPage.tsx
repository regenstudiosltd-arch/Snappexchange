'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Search,
  Crown,
  TrendingUp,
  Calendar,
  Loader2,
} from 'lucide-react';
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
import { CreateGroupModal } from '../modals/CreateGroupModal';
import { JoinGroupModal } from '../modals/JoinGroupModal';
import { AxiosError } from 'axios';
import { apiClient } from '@/src/lib/axios';
import { decodeHtmlEntities } from '@/src/lib/html';

interface Group {
  id: number;
  public_id: string;
  group_name: string;
  description: string;
  member_count: number;
  total_savings: string;
  frequency: string;
  contribution_amount: string;
  next_due: string | null;
  status: 'pending' | 'active' | 'completed';
  is_admin: boolean;
}

export function GroupsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/accounts/groups/my-joined/');
      setGroups(response.data?.results || []);
    } catch (error: unknown) {
      const err = error as AxiosError;
      console.error(err.response?.data || err.message);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const filteredGroups = groups.filter(
    (group) =>
      group.group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.description &&
        group.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const totalMembers = (groups || []).reduce(
    (sum, group) => sum + (Number(group.member_count) || 0),
    0,
  );
  const totalGroupSavings = (groups || []).reduce(
    (sum, group) => sum + (parseFloat(group.total_savings) || 0),
    0,
  );
  const activeGroupsCount = (groups || []).filter(
    (g) => g.status === 'active',
  ).length;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
        <p className="text-muted-foreground animate-pulse">
          Loading your groups...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow">
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
                      {group.member_count} members
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
                    GH₵ {parseFloat(group.contribution_amount).toLocaleString()}{' '}
                    / {group.frequency}
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
                className="w-full mt-2"
                onClick={() =>
                  router.push(`/groups/${group.public_id ?? group.id}`)
                }
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-medium mb-2">No groups found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? `We couldn't find any groups matching "${searchQuery}"`
              : 'You have not joined any savings groups yet.'}
          </p>
        </div>
      )}

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onComplete={fetchGroups}
      />
      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
}
