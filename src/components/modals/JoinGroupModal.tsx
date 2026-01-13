'use client';

import { useState } from 'react';
import { Search, Users, DollarSign, Calendar, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const publicGroups = [
  {
    id: '1',
    name: 'Tech Professionals Circle',
    admin: 'Kwame Mensah',
    members: 12,
    maxMembers: 15,
    contributionAmount: 500,
    frequency: 'Monthly',
    description:
      'For tech workers saving towards professional development and business opportunities',
    nextPayout: '15 days',
  },
  {
    id: '2',
    name: 'Women Entrepreneurs Fund',
    admin: 'Ama Osei',
    members: 8,
    maxMembers: 10,
    contributionAmount: 300,
    frequency: 'Weekly',
    description: 'Supporting women-owned businesses through collective savings',
    nextPayout: '5 days',
  },
  {
    id: '3',
    name: 'University Students Savings',
    admin: 'Kofi Antwi',
    members: 20,
    maxMembers: 25,
    contributionAmount: 100,
    frequency: 'Monthly',
    description:
      'Students helping students build financial discipline and savings habits',
    nextPayout: '20 days',
  },
  {
    id: '4',
    name: 'Market Traders Union',
    admin: 'Abena Frimpong',
    members: 15,
    maxMembers: 20,
    contributionAmount: 200,
    frequency: 'Weekly',
    description: 'Market traders pooling resources for business expansion',
    nextPayout: '3 days',
  },
];

export function JoinGroupModal({ isOpen, onClose }: JoinGroupModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const filteredGroups = publicGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinRequest = () => {
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setShowDetails(false);
      setSelectedGroup(null);
      onClose();
    }, 2000);
  };

  const selectedGroupData = publicGroups.find((g) => g.id === selectedGroup);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[97vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle>
            {showDetails && selectedGroupData
              ? 'Group Details'
              : 'Join a Savings Group'}
          </DialogTitle>
          <DialogDescription>
            {showDetails
              ? 'Review group information before joining'
              : 'Browse and join public savings groups'}
          </DialogDescription>
        </DialogHeader>

        {!showDetails ? (
          <div className="space-y-4 py-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups..."
                className="pl-10"
              />
            </div>

            {/* Groups List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGroups.map((group) => (
                <Card
                  key={group.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedGroup(group.id);
                    setShowDetails(true);
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription>Admin: {group.admin}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {group.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {group.members}/{group.maxMembers} members
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>₵{group.contributionAmount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {group.frequency}
                      </span>
                      <span className="text-[#059669]">
                        Next: {group.nextPayout}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredGroups.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No groups found matching your search
                </p>
              </div>
            )}
          </div>
        ) : (
          selectedGroupData && (
            <div className="space-y-6 py-4">
              {requestSent ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[#059669]/10 flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-[#059669]" />
                  </div>
                  <h3 className="text-xl mb-2">Request Sent!</h3>
                  <p className="text-muted-foreground">
                    The group admin will review your request
                  </p>
                </div>
              ) : (
                <>
                  {/* Group Header */}
                  <div className="bg-linear-to-br from-[#DC2626]/10 via-[#F59E0B]/10 to-[#059669]/10 rounded-lg p-6">
                    <h3 className="text-2xl mb-2">{selectedGroupData.name}</h3>
                    <p className="text-muted-foreground">
                      Administered by {selectedGroupData.admin}
                    </p>
                  </div>

                  {/* Group Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Users className="h-6 w-6 mx-auto mb-2 text-[#DC2626]" />
                      <div className="text-sm text-muted-foreground mb-1">
                        Members
                      </div>
                      <div>
                        {selectedGroupData.members}/
                        {selectedGroupData.maxMembers}
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <DollarSign className="h-6 w-6 mx-auto mb-2 text-[#F59E0B]" />
                      <div className="text-sm text-muted-foreground mb-1">
                        Contribution
                      </div>
                      <div>₵{selectedGroupData.contributionAmount}</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-[#059669]" />
                      <div className="text-sm text-muted-foreground mb-1">
                        Frequency
                      </div>
                      <div>{selectedGroupData.frequency}</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-[#DC2626]" />
                      <div className="text-sm text-muted-foreground mb-1">
                        Next Payout
                      </div>
                      <div>{selectedGroupData.nextPayout}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="mb-2">About This Group</h4>
                    <p className="text-muted-foreground">
                      {selectedGroupData.description}
                    </p>
                  </div>

                  {/* Group Rules */}
                  <div>
                    <h4 className="mb-2">Group Rules</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Contributions must be made on time</li>
                      <li>• Respect all group members and admin decisions</li>
                      <li>• Payouts follow a fair rotation system</li>
                      <li>• Missing 2 contributions results in removal</li>
                      <li>• All communication must be respectful</li>
                    </ul>
                  </div>

                  {/* Terms Acceptance */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 rounded border-gray-300"
                        required
                      />
                      <span className="text-sm text-muted-foreground">
                        I have read and agree to abide by the group rules and
                        contribution schedule. I understand that failure to
                        contribute on time may result in removal from the group.
                      </span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDetails(false);
                        setSelectedGroup(null);
                      }}
                      className="flex-1"
                    >
                      Back to Groups
                    </Button>
                    <Button
                      onClick={handleJoinRequest}
                      className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C]"
                    >
                      Send Join Request
                    </Button>
                  </div>
                </>
              )}
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
