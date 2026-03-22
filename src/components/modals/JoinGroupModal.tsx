'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Users,
  DollarSign,
  Calendar,
  Check,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
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
import { Alert, AlertDescription } from '../ui/alert';
import { apiClient } from '@/src/lib/axios';
import { AxiosError } from 'axios';

interface Group {
  id: number;
  group_name: string;
  admin_name: string;
  current_members: number;
  expected_members: number;
  contribution_amount: string;
  frequency: string;
  description: string;
}

export function JoinGroupModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // Data State
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  // Form State
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [joinReason, setJoinReason] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const fetchGroups = useCallback(async (query: string = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/accounts/groups/all/', {
        params: { search: query },
      });
      setGroups(response.data.results || response.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      setError(
        axiosError.response?.data?.detail || 'Failed to fetch savings groups',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchGroups(searchQuery);
    } else {
      // Reset state when modal closes
      setShowDetails(false);
      setSelectedGroupId(null);
      setJoinReason('');
      setTermsAccepted(false);
    }
  }, [isOpen, searchQuery, fetchGroups]);

  const handleJoinRequest = async (groupId: number) => {
    if (!termsAccepted) return;

    setJoiningId(groupId);
    try {
      const idempotencyKey = self.crypto.randomUUID();
      const response = await apiClient.post(
        `/accounts/groups/${groupId}/request_join/`,
        { reason: joinReason },
        { headers: { 'X-Idempotency-Key': idempotencyKey } },
      );

      alert(response.data.message || 'Join request sent successfully!');
      onClose();
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string; detail?: string }>;
      alert(
        axiosError.response?.data?.error ||
          axiosError.response?.data?.detail ||
          'Failed to join',
      );
    } finally {
      setJoiningId(null);
    }
  };

  const selectedGroupData = groups.find((g) => g.id === selectedGroupId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto no-scrollbar bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {showDetails ? 'Group Details' : 'Join a Savings Group'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {showDetails
              ? 'Review group information before joining'
              : 'Browse and join public savings groups'}
          </DialogDescription>
        </DialogHeader>

        {!showDetails ? (
          /* LIST VIEW */
          <div className="space-y-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                className="pl-10 h-12 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">
                  Finding active circles...
                </p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.length > 0 ? (
                  groups.map((group) => (
                    <Card
                      key={group.id}
                      className="hover:shadow-md transition-all cursor-pointer bg-card border-border hover:border-primary/50"
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setShowDetails(true);
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-semibold text-foreground">
                            {group.group_name}
                          </CardTitle>
                          <span className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                            {group.frequency}
                          </span>
                        </div>
                        <CardDescription className="mt-1">
                          Admin: {group.admin_name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {group.description ||
                            'Join this group to start your savings journey together.'}
                        </p>
                        <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 text-primary" />
                            <span>
                              {group.current_members}/{group.expected_members}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-medium text-foreground">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span>
                              ₵
                              {parseFloat(
                                group.contribution_amount,
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="px-2 text-muted-foreground font-medium">
                      There are no public groups at the moment. You can be the
                      first to create one.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* DETAIL VIEW */
          selectedGroupData && (
            <div className="space-y-6 py-4">
              {/* Header Card */}
              <div className="bg-linear-to-r from-cyan-600 to-teal-500 rounded-xl p-6 text-primary-foreground shadow-md">
                <h3 className="text-2xl font-bold mb-1 dark:text-white">
                  {selectedGroupData.group_name}
                </h3>
                <p className="opacity-90 text-sm dark:text-white">
                  Administered by {selectedGroupData.admin_name}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-5 bg-card border border-border rounded-xl">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-xs text-muted-foreground mb-1">
                    Members
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {selectedGroupData.current_members} /{' '}
                    {selectedGroupData.expected_members}
                  </div>
                </div>

                <div className="text-center p-5 bg-card border border-border rounded-xl">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                  <div className="text-xs text-muted-foreground mb-1">
                    Contribution
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    ₵
                    {parseFloat(
                      selectedGroupData.contribution_amount,
                    ).toLocaleString()}
                  </div>
                </div>

                <div className="text-center p-5 bg-card border border-border rounded-xl">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                  <div className="text-xs text-muted-foreground mb-1">
                    Frequency
                  </div>
                  <div className="text-lg font-bold capitalize text-foreground">
                    {selectedGroupData.frequency}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  About This Group
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selectedGroupData.description ||
                    'No description provided for this group.'}
                </p>
              </div>

              {/* Rules Section */}
              <div className="p-5 bg-muted/40 border border-border rounded-xl">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  Group Rules
                </h4>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    Contributions must be made on time to ensure rotation
                    integrity.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    Payouts follow the system-generated rotation schedule.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    Missing multiple contributions may lead to administrative
                    removal.
                  </li>
                </ul>
              </div>

              {/* User Input Section */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Introduction (Optional)
                  </label>
                  <Textarea
                    placeholder="Tell the admin why you'd like to join this circle..."
                    value={joinReason}
                    onChange={(e) => setJoinReason(e.target.value)}
                    className="min-h-25 bg-background"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground leading-normal cursor-pointer"
                  >
                    I have read and agree to abide by the group rules and
                    contribution schedule. I understand that financial
                    commitment is essential for the circle&apos;s success.
                  </label>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 pt-5 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDetails(false)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Groups
                </Button>

                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={
                    !termsAccepted || joiningId === selectedGroupData.id
                  }
                  onClick={() => handleJoinRequest(selectedGroupData.id)}
                >
                  {joiningId === selectedGroupData.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Send Join Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
