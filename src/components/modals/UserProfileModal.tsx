'use client';

import { UserCircle2, Phone, Calendar, Users, Check, X } from 'lucide-react';
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
    };
    reason?: string;
    requested_at: string;
  };
  onAccept: () => void;
  onDecline: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  request,
  onAccept,
  onDecline,
}: UserProfileModalProps) {
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
            <div className="bg-cyan-100 rounded-full p-6 mb-4">
              <UserCircle2 className="h-16 w-16 text-cyan-600" />
            </div>
            <h3 className="text-xl mb-1">{request.user_details.full_name}</h3>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Requesting to join: {request.group_name}
            </Badge>
          </div>

          {request.reason && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{request.reason}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {request.user_details.momo_number}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Requested {new Date(request.requested_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onDecline}
            className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
          >
            <X className="h-4 w-4 mr-2" />
            Decline
          </Button>
          <Button
            onClick={onAccept}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
