"use client";

import { UserCircle2, Mail, Phone, MapPin, Calendar, Users, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    userBio?: string;
    groupName: string;
    requestDate: string;
    status: "pending" | "accepted" | "declined";
  };
  onAccept: () => void;
  onDecline: () => void;
}

export function UserProfileModal({ 
  isOpen, 
  onClose, 
  user, 
  onAccept, 
  onDecline 
}: UserProfileModalProps) {
  // Mock user details - in a real app, this would be fetched from a database
  const mockUserDetails = {
    email: `${user.userName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    phone: "+233 24 123 4567",
    location: "Accra, Ghana",
    joinedDate: "2024-11-15",
    groupsCount: 2,
    totalContributions: "GH₵ 5,200",
    reliabilityScore: 95,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            Review the user's profile before making a decision
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Avatar and Name */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-cyan-100 rounded-full p-6 mb-4">
              <UserCircle2 className="h-16 w-16 text-cyan-600" />
            </div>
            <h3 className="text-xl mb-1">{user.userName}</h3>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Requesting to join: {user.groupName}
            </Badge>
          </div>

          {/* Bio */}
          {user.userBio && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{user.userBio}</p>
            </div>
          )}

          {/* User Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{mockUserDetails.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{mockUserDetails.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{mockUserDetails.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Joined {new Date(mockUserDetails.joinedDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl text-cyan-600 mb-1">{mockUserDetails.groupsCount}</div>
              <div className="text-xs text-muted-foreground">Active Groups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-cyan-600 mb-1">{mockUserDetails.reliabilityScore}%</div>
              <div className="text-xs text-muted-foreground">Reliability</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-cyan-600 mb-1">{mockUserDetails.totalContributions}</div>
              <div className="text-xs text-muted-foreground">Total Saved</div>
            </div>
          </div>

          {/* Request Date */}
          <div className="text-center text-xs text-muted-foreground pt-2 border-t">
            Request submitted on {new Date(user.requestDate).toLocaleDateString()}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onDecline();
            }}
            className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
          >
            <X className="h-4 w-4 mr-2" />
            Decline
          </Button>
          <Button
            onClick={() => {
              onAccept();
            }}
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
