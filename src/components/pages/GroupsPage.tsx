'use client';
import { useState, useEffect } from 'react';
import { Users, Plus, Search, Crown, TrendingUp, Calendar } from 'lucide-react';
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

interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  totalSavings: number;
  contributionFrequency: string;
  contributionAmount: number;
  nextContribution: string;
  status: 'active' | 'pending' | 'completed';
  isAdmin: boolean;
}

interface GroupData {
  id: string;
  adminFullName: string;
  adminAge: string;
  adminEmail: string;
  adminContact: string;
  adminLocation: string;
  adminOccupation: string;
  ghanaCardFront: File | null;
  ghanaCardBack: File | null;
  groupName: string;
  contributionAmount: string;
  contributionFrequency: string;
  payoutTimeline: string;
  memberCount: string;
  groupDescription: string;
  livePicture: string;
  createdAt: string;
  members: Array<{ id: string; role: string }>;
  totalSaved: number;
}

export function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>(() => {
    const storedGroups = localStorage.getItem('snappx_groups');
    if (storedGroups) {
      return JSON.parse(storedGroups);
    } else {
      // Initialize with default groups
      const defaultGroups: Group[] = [
        {
          id: '1',
          name: 'University Friends',
          description: 'Saving for our graduation trip',
          members: 12,
          totalSavings: 24500,
          contributionFrequency: 'Weekly',
          contributionAmount: 50,
          nextContribution: '2025-12-10',
          status: 'active',
          isAdmin: true,
        },
        {
          id: '2',
          name: 'Family Savings Circle',
          description: 'Emergency fund for the family',
          members: 8,
          totalSavings: 18200,
          contributionFrequency: 'Monthly',
          contributionAmount: 200,
          nextContribution: '2025-12-15',
          status: 'active',
          isAdmin: false,
        },
        {
          id: '3',
          name: 'Startup Capital',
          description: 'Building funds for our business',
          members: 5,
          totalSavings: 12800,
          contributionFrequency: 'Bi-weekly',
          contributionAmount: 150,
          nextContribution: '2025-12-08',
          status: 'active',
          isAdmin: true,
        },
      ];
      localStorage.setItem('snappx_groups', JSON.stringify(defaultGroups));
      return defaultGroups;
    }
  });

  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem('snappx_groups', JSON.stringify(groups));
    }
  }, [groups]);

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = (groupData: GroupData) => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name: groupData.groupName,
      description: groupData.groupDescription,
      members: 1,
      totalSavings: 0,
      contributionFrequency: groupData.contributionFrequency,
      contributionAmount: parseFloat(groupData.contributionAmount),
      nextContribution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      status: 'active',
      isAdmin: true,
    };
    setGroups([newGroup, ...groups]);
    setIsCreateModalOpen(false);
  };

  const totalMembers = groups.reduce((sum, group) => sum + group.members, 0);
  const totalGroupSavings = groups.reduce(
    (sum, group) => sum + group.totalSavings,
    0
  );
  const activeGroups = groups.filter((g) => g.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="mb-1 text-[16px] md:text-3xl font-bold">My Groups</h1>
          <p className="text-muted-foreground">
            Manage and track your savings groups
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsJoinModalOpen(true)}
            variant="outline"
            className="gap-2 text-gray-600 hover:text-white"
          >
            <Search className="h-4 w-4" />
            Join Group
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-600 gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{groups.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeGroups} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">Across all groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              GHS {totalGroupSavings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Combined total</p>
          </CardContent>
        </Card>
      </div>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      {/* Groups List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="font-medium">{group.name}</span>
                      {group.isAdmin && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {group.members} members
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={group.status === 'active' ? 'default' : 'secondary'}
                  className={group.status === 'active' ? 'bg-green-500' : ''}
                >
                  {group.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {group.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Savings</span>
                  <span className="font-semibold">
                    GHS {group.totalSavings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contribution</span>
                  <span>
                    GHS {group.contributionAmount} /{' '}
                    {group.contributionFrequency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Next Due</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(group.nextContribution).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full text-gray-600 hover:text-white"
                onClick={() => {}}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl mb-2">No groups found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? 'Try a different search term'
              : 'Create or join a group to get started'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Group
            </Button>
          )}
        </div>
      )}
      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onComplete={handleCreateGroup}
      />
      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
}
