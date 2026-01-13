'use client';

import { useState } from 'react';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  contributionAmount: number;
  deadline: string;
  contributionFrequency: string;
  createdAt: string;
}

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 5000,
      currentAmount: 3200,
      contributionAmount: 500,
      deadline: '2025-06-30',
      contributionFrequency: 'Monthly',
      createdAt: '2024-11-01',
    },
    {
      id: '2',
      name: 'New Laptop',
      targetAmount: 3000,
      currentAmount: 2100,
      contributionAmount: 300,
      deadline: '2025-03-15',
      contributionFrequency: 'Weekly',
      createdAt: '2024-10-15',
    },
    {
      id: '3',
      name: 'Vacation to Dubai',
      targetAmount: 4000,
      currentAmount: 1200,
      contributionAmount: 200,
      deadline: '2025-12-20',
      contributionFrequency: 'Monthly',
      createdAt: '2024-11-10',
    },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    contributionAmount: '',
    deadline: '',
    contributionFrequency: '',
  });

  const openCreateModal = () => setIsCreateModalOpen(true);

  const handleCreateGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount) || 0,
      currentAmount: 0,
      contributionAmount: parseFloat(newGoal.contributionAmount) || 0,
      deadline: newGoal.deadline,
      contributionFrequency: newGoal.contributionFrequency,
      createdAt: new Date().toISOString(),
    };

    setGoals([...goals, goal]);
    setIsCreateModalOpen(false);
    setNewGoal({
      name: '',
      targetAmount: '',
      contributionAmount: '',
      deadline: '',
      contributionFrequency: '',
    });
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const calculateProgress = (current: number, target: number): number => {
    if (target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const calculateDaysRemaining = (deadline: string): number => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (amount: number): string => {
    return `₵${amount.toLocaleString()}`;
  };

  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = calculateProgress(totalSaved, totalTarget);

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
    const daysRemaining = calculateDaysRemaining(goal.deadline);
    const isOverdue = daysRemaining < 0;

    const deadlineText = isOverdue
      ? 'Overdue'
      : daysRemaining === 0
      ? 'Today'
      : daysRemaining === 1
      ? 'Tomorrow'
      : `${daysRemaining} days`;

    return (
      <Card className="hover:shadow-lg transition-shadow bg-white border border-gray-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-medium">{goal.name}</CardTitle>
              <CardDescription className="mt-1 text-gray-500">
                ₵{goal.contributionAmount.toLocaleString()}{' '}
                {goal.contributionFrequency}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-gray-100"
              >
                <Edit2 className="h-4 w-4 " />
              </Button>
              <Button
                size="icon"
                className="h-8 w-8 bg-white hover:bg-gray-100"
                onClick={() => handleDeleteGoal(goal.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl">
                {formatCurrency(goal.currentAmount)}
              </span>
              <span className="text-sm text-gray-500">
                of {formatCurrency(goal.targetAmount)}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Deadline</span>
            </div>
            <span
              className={isOverdue ? 'text-destructive' : 'text-foreground'}
            >
              {deadlineText}
            </span>
          </div>

          <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
            <DollarSign className="h-4 w-4 mr-2" />
            Add Contribution
          </Button>

          {progress === 100 && (
            <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-teal-50 text-teal-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Goal Achieved!</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="bg-linear-to-br from-cyan-500 to-teal-600 text-white">
        <CardHeader>
          <CardTitle>Goals Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm opacity-90 mb-1">Total Target</div>
                <div className="text-2xl">{formatCurrency(totalTarget)}</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-1">Total Saved</div>
                <div className="text-2xl">{formatCurrency(totalSaved)}</div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="opacity-90">Overall Progress</span>
                <span>{overallProgress.toFixed(0)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2 bg-gray-200" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <span className="text-sm">{goals.length} Active Goals</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={openCreateModal}
                className="bg-white text-cyan-600 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] md:text-[24px] font-medium">Your Goals</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}

          <Card
            className="border-2 border-dashed border-gray-200 hover:border-cyan-500 hover:bg-gray-50 transition-all cursor-pointer"
            onClick={openCreateModal}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-75 text-center p-6">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="mb-2 text-[16px] md:text-[24px] font-medium">
                Create New Goal
              </h3>
              <p className="text-sm text-gray-500">
                Set a new savings target and start building your future
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Goal Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md max-h-[97vh] overflow-y-auto bg-white border border-gray-200 rounded-lg flex flex-col no-scrollbar">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogDescription className="text-gray-600">
              Set a savings target and track your progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                value={newGoal.name}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, name: e.target.value })
                }
                placeholder="e.g., Emergency Fund"
                className="border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount (₵)</Label>
              <Input
                id="targetAmount"
                type="number"
                value={newGoal.targetAmount}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, targetAmount: e.target.value })
                }
                placeholder="5000"
                className="border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contributionAmount">
                Regular Contribution (₵)
              </Label>
              <Input
                id="contributionAmount"
                type="number"
                value={newGoal.contributionAmount}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, contributionAmount: e.target.value })
                }
                placeholder="500"
                className="border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Target Date</Label>
              <Input
                id="deadline"
                type="date"
                value={newGoal.deadline}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, deadline: e.target.value })
                }
                className="border-gray-200 rounded-lg h-10 focus-visible:ring-gray-300 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-600">
                Contribution Frequency
              </Label>

              <Select
                value={newGoal.contributionFrequency}
                onValueChange={(value) =>
                  setNewGoal({ ...newGoal, contributionFrequency: value })
                }
              >
                <SelectTrigger className="h-11 w-full rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-300 data-placeholder:text-gray-400">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>

                <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                  {['Daily', 'Weekly', 'Monthly'].map((item) => (
                    <SelectItem
                      key={item}
                      value={item}
                      className="cursor-pointer px-3 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 data-[state=checked]:bg-gray-200"
                    >
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreateGoal}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
              disabled={
                !newGoal.name ||
                !newGoal.targetAmount ||
                !newGoal.contributionAmount ||
                !newGoal.deadline ||
                !newGoal.contributionFrequency
              }
            >
              Create Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
