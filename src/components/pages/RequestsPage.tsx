"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, Check, X, Eye, UserCircle2, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { UserProfileModal } from "../modals/UserProfileModal";

interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userBio?: string;
  groupId: string;
  groupName: string;
  requestDate: string;
  status: "pending" | "accepted" | "declined";
}

export function RequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "accepted" | "declined">("pending");
  const [selectedUser, setSelectedUser] = useState<JoinRequest | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [requests, setRequests] = useState<JoinRequest[]>([]);

  // Load requests from localStorage on mount
  useEffect(() => {
    const storedRequests = localStorage.getItem("snappx_join_requests");
    if (storedRequests) {
      setRequests(JSON.parse(storedRequests));
    } else {
      // Initialize with mock data
      const mockRequests: JoinRequest[] = [
        {
          id: "1",
          userId: "u1",
          userName: "Kwame Mensah",
          userAvatar: undefined,
          userBio: "Looking to join your group to save for my business. I'm committed to regular contributions.",
          groupId: "1",
          groupName: "University Friends",
          requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
        },
        {
          id: "2",
          userId: "u2",
          userName: "Ama Osei",
          userAvatar: undefined,
          userBio: "I've been saving with other groups successfully. Would love to join your circle!",
          groupId: "3",
          groupName: "Startup Capital",
          requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
        },
        {
          id: "3",
          userId: "u3",
          userName: "Kofi Asante",
          userAvatar: undefined,
          userBio: "Referred by a mutual friend. Interested in contributing to the group goals.",
          groupId: "1",
          groupName: "University Friends",
          requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
        },
        {
          id: "4",
          userId: "u4",
          userName: "Abena Boateng",
          userAvatar: undefined,
          userBio: "Experienced saver looking for a reliable group.",
          groupId: "3",
          groupName: "Startup Capital",
          requestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "accepted",
        },
      ];
      setRequests(mockRequests);
      localStorage.setItem("snappx_join_requests", JSON.stringify(mockRequests));
    }
  }, []);

  // Save requests to localStorage whenever they change
  useEffect(() => {
    if (requests.length > 0) {
      localStorage.setItem("snappx_join_requests", JSON.stringify(requests));
    }
  }, [requests]);

  const handleAccept = (requestId: string) => {
    const request = requests.find(req => req.id === requestId);
    if (request) {
      // Update request status
      setRequests(requests.map(req =>
        req.id === requestId ? { ...req, status: "accepted" as const } : req
      ));

      // Update group membership in localStorage
      const storedGroups = localStorage.getItem("snappx_groups");
      if (storedGroups) {
        const groups = JSON.parse(storedGroups);
        const updatedGroups = groups.map((group: any) =>
          group.id === request.groupId
            ? { ...group, members: group.members + 1 }
            : group
        );
        localStorage.setItem("snappx_groups", JSON.stringify(updatedGroups));
      }
    }
  };

  const handleDecline = (requestId: string) => {
    setRequests(requests.map(req =>
      req.id === requestId ? { ...req, status: "declined" as const } : req
    ));
  };

  const handleReview = (request: JoinRequest) => {
    setSelectedUser(request);
    setIsProfileModalOpen(true);
  };

  const filteredRequests = requests.filter(request => {
    const matchesTab = request.status === activeTab;
    const matchesSearch = 
      request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.groupName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const acceptedCount = requests.filter(r => r.status === "accepted").length;
  const declinedCount = requests.filter(r => r.status === "declined").length;

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl mb-1">Join Requests</h1>
          <p className="text-muted-foreground">
            Manage requests to join your groups
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Requests</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Accepted</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{acceptedCount}</div>
            <p className="text-xs text-muted-foreground">
              Members approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Declined</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{declinedCount}</div>
            <p className="text-xs text-muted-foreground">
              Requests rejected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <Button
                variant={activeTab === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("pending")}
                className={activeTab === "pending" ? "bg-cyan-500 hover:bg-cyan-600" : ""}
              >
                Pending
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-white text-cyan-600">
                    {pendingCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === "accepted" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("accepted")}
                className={activeTab === "accepted" ? "bg-cyan-500 hover:bg-cyan-600" : ""}
              >
                Accepted
              </Button>
              <Button
                variant={activeTab === "declined" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("declined")}
                className={activeTab === "declined" ? "bg-cyan-500 hover:bg-cyan-600" : ""}
              >
                Declined
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredRequests.length === 0 ? (
            // Empty State
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg mb-2">No {activeTab} requests</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {activeTab === "pending"
                  ? "You'll see join requests here when users apply to your groups"
                  : `No ${activeTab} requests found`}
              </p>
            </div>
          ) : (
            // Request List
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-cyan-500">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* User Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-cyan-100 rounded-full p-3">
                          <UserCircle2 className="h-8 w-8 text-cyan-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{request.userName}</h3>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {request.groupName}
                            </Badge>
                          </div>
                          {request.userBio && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {request.userBio}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {getRelativeTime(request.requestDate)}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {request.status === "pending" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReview(request)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Review
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDecline(request.id)}
                              className="flex items-center gap-2 text-red-600 hover:bg-red-50 border-red-200"
                            >
                              <X className="h-4 w-4" />
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAccept(request.id)}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                              Accept
                            </Button>
                          </>
                        ) : (
                          <Badge
                            variant={request.status === "accepted" ? "default" : "destructive"}
                            className={request.status === "accepted" ? "bg-green-600" : ""}
                          >
                            {request.status === "accepted" ? "Accepted" : "Declined"}
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

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={selectedUser}
          onAccept={() => {
            handleAccept(selectedUser.id);
            setIsProfileModalOpen(false);
          }}
          onDecline={() => {
            handleDecline(selectedUser.id);
            setIsProfileModalOpen(false);
          }}
        />
      )}
    </div>
  );
}