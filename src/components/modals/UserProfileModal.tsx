'use client';

import Image from 'next/image';
import {
  UserCircle2,
  Phone,
  Calendar,
  Users,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: number;
    group_name: string;
    user_details: {
      full_name: string;
      momo_number: string;
      profile_picture?: string | null;
    };
    reason?: string;
    requested_at: string;
  };
  onAccept: () => void;
  onDecline: () => void;
  isProcessing: boolean;
}

export function UserProfileModal({
  isOpen,
  onClose,
  request,
  onAccept,
  onDecline,
  isProcessing,
}: UserProfileModalProps) {
  const userPhoto = request.user_details.profile_picture;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[97vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            Review the user&apos;s profile before making a decision
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center text-center">
            {/* Profile Image Container */}
            <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-cyan-100 shadow-sm bg-muted">
              {userPhoto ? (
                <Image
                  src={userPhoto}
                  alt={request.user_details.full_name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-cyan-100">
                  <UserCircle2 className="h-12 w-12 text-cyan-600" />
                </div>
              )}
            </div>

            <h3 className="text-xl mb-1 font-semibold text-foreground">
              {request.user_details.full_name}
            </h3>
            <Badge
              variant="outline"
              className="flex py-1 px-2 items-center gap-1 text-cyan-700 dark:text-white bg-muted/50 border-border"
            >
              <Users className="h-3 w-3" />
              Requesting to join: {request.group_name}
            </Badge>
          </div>

          {request.reason && (
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground italic">
                &quot;{request.reason}&quot;
              </p>
            </div>
          )}

          <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">
                {request.user_details.momo_number}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Requested on{' '}
                {new Date(request.requested_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-2">
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={isProcessing}
            className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 dark:border-red-900/50 dark:hover:bg-red-950/50"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <X className="h-4 w-4 mr-2" />
            )}
            Decline
          </Button>

          <Button
            onClick={onAccept}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
