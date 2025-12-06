"use client";

import { useState } from "react";
import { TrendingUp, Users, PlusCircle, Target, Bot, Lightbulb, Eye, EyeOff, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { CreateGroupModal } from "../modals/CreateGroupModal";
import { CashOutModal } from "../modals/CashOutModal";
import { JoinGroupModal } from "../modals/JoinGroupModal";

interface DashboardHomeEnhancedProps {
  onNavigate: (page: string) => void;
}

export function DashboardHomeEnhanced({ onNavigate }: DashboardHomeEnhancedProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);
  const [savingsExpanded, setSavingsExpanded] = useState(false);

  const totalSavings = 7150;
  const individualSavings = 1500;
  const groupSavings = 5650;

  const quickActions = [
    {
      icon: PlusCircle,
      label: "Create Group",
      color: "text-cyan-600",
      bgColor: "bg-cyan-500/10",
      onClick: () => setIsCreateGroupOpen(true),
    },
    {
      icon: Users,
      label: "Join Group",
      color: "text-teal-600",
      bgColor: "bg-teal-500/10",
      onClick: () => setIsJoinGroupOpen(true),
    },
    {
      icon: Lightbulb,
      label: "AI Tips",
      color: "text-cyan-600",
      bgColor: "bg-cyan-500/10",
      onClick: () => onNavigate("AI Assistant"),
    },
    {
      icon: Bot,
      label: "Chat Bot",
      color: "text-teal-600",
      bgColor: "bg-teal-500/10",
      onClick: () => onNavigate("Bot Integration"),
    },
  ];

  const recentActivity = [
    {
      type: "contribution",
      group: "Family Savings Circle",
      amount: 200,
      date: "2 hours ago",
      status: "completed",
    },
    {
      type: "payout",
      group: "Business Partners",
      amount: 1500,
      date: "1 day ago",
      status: "completed",
    },
    {
      type: "contribution",
      group: "Wedding Fund",
      amount: 300,
      date: "2 days ago",
      status: "completed",
    },
  ];

  const savingsGroups = [
    {
      name: "Family Savings Circle",
      members: 8,
      totalSaved: 16000,
      yourContribution: 2000,
      nextPayout: "5 days",
      progress: 65,
    },
    {
      name: "Business Partners",
      members: 12,
      totalSaved: 45000,
      yourContribution: 3750,
      nextPayout: "12 days",
      progress: 80,
    },
    {
      name: "Wedding Fund",
      members: 6,
      totalSaved: 8400,
      yourContribution: 1400,
      nextPayout: "2 days",
      progress: 45,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Total Savings Card */}
      <Card className="bg-gradient-to-br from-cyan-500 to-teal-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Total Savings</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-4xl mb-2">
                {showBalance ? `₵${totalSavings.toFixed(2)}` : "₵•••••"}
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+12.5% from last month</span>
              </div>
            </div>
            
            {savingsExpanded && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 animate-in slide-in-from-top">
                <div>
                  <div className="text-sm text-white/80 mb-1">Individual</div>
                  <div className="text-xl">₵{individualSavings.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-white/80 mb-1">Groups</div>
                  <div className="text-xl">₵{groupSavings.toFixed(2)}</div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-white/20">
              <Button
                variant="secondary"
                className="flex-1 bg-white text-cyan-600 hover:bg-gray-100"
                onClick={() => setSavingsExpanded(!savingsExpanded)}
              >
                {savingsExpanded ? "Hide" : "Show"} Details
              </Button>
              <Button
                variant="secondary"
                className="flex-1 bg-white text-cyan-600 hover:bg-gray-100"
                onClick={() => setIsCashOutOpen(true)}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Cash Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 hover:border-cyan-500 transition-all hover:shadow-lg group"
              >
                <div className={`w-14 h-14 rounded-full ${action.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-7 w-7 ${action.color}`} />
                </div>
                <span className="text-sm text-center">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Groups */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3>Your Savings Groups</h3>
            <Button variant="ghost" size="sm" className="text-cyan-600">
              View All
            </Button>
          </div>

          {savingsGroups.map((group, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription>{group.members} members</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Saved</div>
                    <div className="text-lg">₵{group.totalSaved.toLocaleString()}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{group.progress}%</span>
                  </div>
                  <Progress value={group.progress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Your Contribution</div>
                    <div>₵{group.yourContribution.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Next Payout</div>
                    <div className="text-teal-600">{group.nextPayout}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3>Recent Activity</h3>
          <Card>
            <CardContent className="p-0">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className={`p-4 ${index < recentActivity.length - 1 ? "border-b" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === "contribution" 
                        ? "bg-cyan-500/10" 
                        : "bg-teal-500/10"
                    }`}>
                      {activity.type === "contribution" ? (
                        <ArrowUpRight className={`h-4 w-4 ${
                          activity.type === "contribution" 
                            ? "text-cyan-600" 
                            : "text-teal-600"
                        }`} />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-teal-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{activity.group}</div>
                      <div className="text-xs text-muted-foreground">{activity.date}</div>
                    </div>
                    <div className={`text-sm ${
                      activity.type === "contribution" 
                        ? "text-cyan-600" 
                        : "text-teal-600"
                    }`}>
                      {activity.type === "contribution" ? "-" : "+"}₵{activity.amount}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Goals Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>Track your personal savings targets</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("Goals")}
            >
              <Target className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Emergency Fund", target: 5000, saved: 3200, progress: 64 },
              { name: "New Laptop", target: 3000, saved: 2100, progress: 70 },
              { name: "Vacation", target: 4000, saved: 1200, progress: 30 },
            ].map((goal, index) => (
              <div key={index} className="p-4 rounded-lg border hover:border-cyan-500 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm">{goal.name}</span>
                  <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2 mb-2" />
                <div className="text-xs text-muted-foreground">
                  ₵{goal.saved.toLocaleString()} of ₵{goal.target.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onComplete={(groupData) => {
          console.log("Group created:", groupData);
        }}
      />

      <JoinGroupModal
        isOpen={isJoinGroupOpen}
        onClose={() => setIsJoinGroupOpen(false)}
      />

      <CashOutModal
        isOpen={isCashOutOpen}
        onClose={() => setIsCashOutOpen(false)}
        availableBalance={totalSavings}
        payoutAccount={{
          provider: "MTN Momo",
          number: "024 XXX XXXX",
          name: "Kwame Asante",
        }}
      />
    </div>
  );
}