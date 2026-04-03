'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Target,
  Plus,
  Calendar,
  BadgeCent,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

import { apiClient } from '@/src/lib/axios';
import { GoalFormModal } from '../modals/GoalFormModal';
import { Goal } from '@/src/lib/schemas';

// Types & Query Keys
const GOALS_QUERY_KEY = ['goals'] as const;

function GoalsOverviewCardSkeleton() {
  return (
    <div className="rounded-2xl bg-linear-to-br from-cyan-500 to-teal-600 p-6 shadow-lg animate-pulse">
      {/* Title */}
      <div className="h-6 w-36 rounded-md bg-white/30 mb-6" />

      {/* Grid: Total Target / Total Saved */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3.5 w-24 rounded bg-white/25" />
            <div className="h-8 w-32 rounded bg-white/30" />
          </div>
        ))}
      </div>

      {/* Progress label + bar */}
      <div className="mb-5 space-y-2">
        <div className="flex justify-between">
          <div className="h-3.5 w-28 rounded bg-white/25" />
          <div className="h-3.5 w-8 rounded bg-white/25" />
        </div>
        <div className="h-2 w-full rounded-full bg-white/20">
          <div className="h-2 w-2/5 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Footer: active goals count + button */}
      <div className="flex items-center justify-between border-t border-white/20 pt-4">
        <div className="h-3.5 w-24 rounded bg-white/25" />
        <div className="h-8 w-28 rounded-md bg-white/30" />
      </div>
    </div>
  );
}

function GoalCardSkeleton() {
  return (
    <Card className="border-border animate-pulse">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Goal name */}
            <div className="h-5 w-40 rounded bg-muted" />
            {/* Contribution · frequency */}
            <div className="h-3.5 w-32 rounded bg-muted" />
          </div>
          {/* Edit + Delete icon buttons */}
          <div className="flex gap-1">
            <div className="h-8 w-8 rounded-md bg-muted" />
            <div className="h-8 w-8 rounded-md bg-muted" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Current / target amounts */}
        <div className="flex items-baseline gap-2">
          <div className="h-8 w-28 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>

        {/* Progress label + bar */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3.5 w-16 rounded bg-muted" />
            <div className="h-3.5 w-8 rounded bg-muted" />
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div className="h-2 w-1/3 rounded-full bg-muted-foreground/20" />
          </div>
        </div>

        {/* Deadline row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="h-3.5 w-14 rounded bg-muted" />
          </div>
          <div className="h-3.5 w-20 rounded bg-muted" />
        </div>

        {/* Contribute button */}
        <div className="h-10 w-full rounded-md bg-muted" />
      </CardContent>
    </Card>
  );
}

/** Full page skeleton  */
function GoalsPageSkeleton() {
  return (
    <div className="space-y-6 mb-20 md:mb-0">
      {/* Overview card */}
      <GoalsOverviewCardSkeleton />

      {/* Section heading */}
      <div className="space-y-4">
        <div className="h-7 w-36 rounded-lg bg-muted animate-pulse" />

        {/* Goal cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <GoalCardSkeleton key={i} />
          ))}
          {/* Empty / create card placeholder */}
          <div className="min-h-80 rounded-2xl border-2 border-dashed border-border animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Reusable sub-components

function GoalsOverviewCard({
  goals,
  onCreateClick,
}: {
  goals: Goal[];
  onCreateClick: () => void;
}) {
  const totalTarget = useMemo(
    () => goals.reduce((sum, g) => sum + parseFloat(g.target_amount || '0'), 0),
    [goals],
  );
  const totalSaved = useMemo(
    () =>
      goals.reduce((sum, g) => sum + parseFloat(g.current_amount || '0'), 0),
    [goals],
  );
  const overallProgress = useMemo(() => {
    return totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  }, [totalTarget, totalSaved]);

  const formatCurrency = (amount: string | number): string => {
    const val = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₵${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  return (
    <Card className="bg-linear-to-br from-cyan-500 to-teal-600 text-white rounded-2xl border-none shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Goals Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Target</p>
              <p className="text-2xl font-bold">
                {formatCurrency(totalTarget)}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-90 mb-1">Total Saved</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSaved)}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2 opacity-90">
              <span>Overall Progress</span>
              <span>{overallProgress.toFixed(0)}%</span>
            </div>
            <Progress
              value={overallProgress}
              className="h-2 bg-primary-foreground/20"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-primary-foreground/20">
            <span className="text-sm opacity-90">
              {goals.length} Active Goals
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={onCreateClick}
              className="bg-white/90 text-primary hover:bg-white font-medium dark:text-muted"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GoalCard({
  goal,
  onEdit,
  onDelete,
  onContribute,
  isContributing,
  isDeleting,
}: {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: number) => void;
  onContribute: (id: number, name: string) => void;
  isContributing: boolean;
  isDeleting: boolean;
}) {
  const current = parseFloat(goal.current_amount) || 0;
  const target = parseFloat(goal.target_amount) || 0;
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  const formatCurrency = (amount: string | number): string => {
    const val = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₵${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-medium text-foreground">
              {goal.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {formatCurrency(goal.regular_contribution)} • {goal.frequency}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(goal)}
              aria-label="Edit goal"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onDelete(goal.id)}
              disabled={isDeleting}
              aria-label="Delete goal"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {formatCurrency(goal.current_amount)}
          </span>
          <span className="text-sm text-muted-foreground">
            of {formatCurrency(goal.target_amount)}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Deadline</span>
          </div>
          <span className="text-foreground">
            {goal.target_date
              ? new Date(goal.target_date).toLocaleDateString()
              : 'N/A'}
          </span>
        </div>

        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          onClick={() => onContribute(goal.id, goal.name)}
          disabled={isContributing || progress >= 100}
        >
          {isContributing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <BadgeCent className="h-5 w-5 mr-2" />
          )}
          Add Contribution
        </Button>

        {progress === 100 && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Goal Achieved!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyGoalCard({ onCreate }: { onCreate: () => void }) {
  return (
    <Card
      className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
      onClick={onCreate}
    >
      <CardContent className="flex flex-col items-center justify-center h-full min-h-80 text-center p-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-3 text-xl font-semibold text-foreground">
          Create New Goal
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Set a new savings target and start building your future
        </p>
      </CardContent>
    </Card>
  );
}

// Main component

export function GoalsPage() {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [goalIdToDelete, setGoalIdToDelete] = useState<number | null>(null);
  const [errorDialog, setErrorDialog] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const {
    data: goals = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Goal[]>({
    queryKey: GOALS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get('/accounts/goals/dashboard/');
      const data = response.data;
      return data.goals || data.results || (Array.isArray(data) ? data : []);
    },
    staleTime: 1000 * 60 * 5,
  });

  const contributeMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const idempotencyKey = crypto.randomUUID();
      await apiClient.post(
        `/accounts/goals/${id}/contribute/`,
        {},
        { headers: { 'X-Idempotency-Key': idempotencyKey } },
      );
      return { id, name };
    },
    onSuccess: async ({ name }) => {
      await queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
      toast.success(`Contribution added to ${name}`);
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { error?: string } } }).response?.data
          ?.error || 'Contribution failed.';
      setErrorDialog({ title: 'Transaction Failed', message: msg });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const idempotencyKey = crypto.randomUUID();
      await apiClient.delete(`/accounts/goals/${id}/`, {
        headers: { 'X-Idempotency-Key': idempotencyKey },
      });
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: GOALS_QUERY_KEY });
      const previousGoals = queryClient.getQueryData<Goal[]>(GOALS_QUERY_KEY);
      queryClient.setQueryData<Goal[]>(GOALS_QUERY_KEY, (old = []) =>
        old.filter((g) => g.id !== id),
      );
      return { previousGoals };
    },
    onError: (error, id, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(GOALS_QUERY_KEY, context.previousGoals);
      }
      const msg =
        (error as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail || 'Delete failed. Goal has been restored.';
      setErrorDialog({ title: 'Delete Error', message: msg });
    },
    onSuccess: (id) => {
      const goalName = goals.find((g) => g.id === id)?.name || 'Goal';
      toast.success(`${goalName} deleted successfully`);
    },
    onSettled: () => {
      setGoalIdToDelete(null);
      setDeleteConfirmOpen(false);
    },
  });

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
    setEditingGoal(null);
    setModalOpen(false);
  };

  const openCreate = () => {
    setEditingGoal(null);
    setModalOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleContribute = (id: number, name: string) => {
    contributeMutation.mutate({ id, name });
  };

  const handleDeleteClick = (id: number) => {
    setGoalIdToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    if (!goalIdToDelete) return;
    deleteMutation.mutate(goalIdToDelete);
  };

  if (isLoading) return <GoalsPageSkeleton />;

  return (
    <div className="space-y-6 mb-20 md:mb-0">
      <GoalsOverviewCard goals={goals} onCreateClick={openCreate} />

      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-semibold text-foreground">
          Your Goals
        </h3>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              Unable to synchronize goals.
              <Button
                variant="link"
                onClick={() => refetch()}
                className="h-auto p-0 underline"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={openEdit}
                onDelete={handleDeleteClick}
                onContribute={handleContribute}
                isContributing={contributeMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />
            ))}
            <EmptyGoalCard onCreate={openCreate} />
          </div>
        )}
      </div>

      <GoalFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleModalSuccess}
        editingGoal={editingGoal}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your savings goal and all associated
              contribution history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete Goal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!errorDialog}
        onOpenChange={(open) => !open && setErrorDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDialogTitle>{errorDialog?.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {errorDialog?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Dismiss</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// // src/app/components/pages/GoalsPage.tsx
// 'use client';

// import { useState, useMemo } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import {
//   Target,
//   Plus,
//   Calendar,
//   BadgeCent,
//   Edit2,
//   Trash2,
//   Loader2,
//   AlertCircle,
//   TrendingUp,
// } from 'lucide-react';
// import { toast } from 'sonner';

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import { Button } from '../ui/button';
// import { Progress } from '../ui/progress';
// import { Alert, AlertDescription } from '../ui/alert';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '../ui/alert-dialog';

// import { apiClient } from '@/src/lib/axios';
// import { GoalFormModal } from '../modals/GoalFormModal';
// import { Goal } from '@/src/lib/schemas';

// // -----------------------------------------------------------------------------
// // Types & Query Keys (for consistency across the app)
// const GOALS_QUERY_KEY = ['goals'] as const;

// // -----------------------------------------------------------------------------
// // Reusable sub-components (extracted for readability, testability & reusability)

// function GoalsOverviewCard({
//   goals,
//   onCreateClick,
// }: {
//   goals: Goal[];
//   onCreateClick: () => void;
// }) {
//   const totalTarget = useMemo(
//     () => goals.reduce((sum, g) => sum + parseFloat(g.target_amount || '0'), 0),
//     [goals],
//   );
//   const totalSaved = useMemo(
//     () =>
//       goals.reduce((sum, g) => sum + parseFloat(g.current_amount || '0'), 0),
//     [goals],
//   );
//   const overallProgress = useMemo(() => {
//     return totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
//   }, [totalTarget, totalSaved]);

//   const formatCurrency = (amount: string | number): string => {
//     const val = typeof amount === 'string' ? parseFloat(amount) : amount;
//     return `₵${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
//   };

//   return (
//     <Card className="bg-linear-to-br from-cyan-500 to-teal-600 text-white rounded-2xl border-none shadow-lg">
//       <CardHeader className="pb-2">
//         <CardTitle className="text-xl font-bold">Goals Overview</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-5">
//           <div className="grid grid-cols-2 gap-6">
//             <div>
//               <p className="text-sm opacity-90 mb-1">Total Target</p>
//               <p className="text-2xl font-bold">
//                 {formatCurrency(totalTarget)}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm opacity-90 mb-1">Total Saved</p>
//               <p className="text-2xl font-bold">{formatCurrency(totalSaved)}</p>
//             </div>
//           </div>

//           <div>
//             <div className="flex items-center justify-between text-sm mb-2 opacity-90">
//               <span>Overall Progress</span>
//               <span>{overallProgress.toFixed(0)}%</span>
//             </div>
//             <Progress
//               value={overallProgress}
//               className="h-2 bg-primary-foreground/20"
//             />
//           </div>

//           <div className="flex items-center justify-between pt-3 border-t border-primary-foreground/20">
//             <span className="text-sm opacity-90">
//               {goals.length} Active Goals
//             </span>
//             <Button
//               size="sm"
//               variant="secondary"
//               onClick={onCreateClick}
//               className="bg-white/90 text-primary hover:bg-white font-medium dark:text-muted"
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               New Goal
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function GoalCard({
//   goal,
//   onEdit,
//   onDelete,
//   onContribute,
//   isContributing,
//   isDeleting,
// }: {
//   goal: Goal;
//   onEdit: (goal: Goal) => void;
//   onDelete: (id: number) => void;
//   onContribute: (id: number, name: string) => void;
//   isContributing: boolean;
//   isDeleting: boolean;
// }) {
//   const current = parseFloat(goal.current_amount) || 0;
//   const target = parseFloat(goal.target_amount) || 0;
//   const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

//   const formatCurrency = (amount: string | number): string => {
//     const val = typeof amount === 'string' ? parseFloat(amount) : amount;
//     return `₵${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
//   };

//   return (
//     <Card className="hover:shadow-md transition-shadow bg-card border-border">
//       <CardHeader className="pb-4">
//         <div className="flex items-start justify-between">
//           <div className="flex-1">
//             <CardTitle className="text-lg font-medium text-foreground">
//               {goal.name}
//             </CardTitle>
//             <CardDescription className="mt-1">
//               {formatCurrency(goal.regular_contribution)} • {goal.frequency}
//             </CardDescription>
//           </div>
//           <div className="flex gap-1">
//             <Button
//               variant="ghost"
//               size="icon"
//               className="h-8 w-8"
//               onClick={() => onEdit(goal)}
//               aria-label="Edit goal"
//             >
//               <Edit2 className="h-4 w-4" />
//             </Button>
//             <Button
//               size="icon"
//               variant="ghost"
//               className="h-8 w-8"
//               onClick={() => onDelete(goal.id)}
//               disabled={isDeleting}
//               aria-label="Delete goal"
//             >
//               <Trash2 className="h-4 w-4 text-destructive" />
//             </Button>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-5">
//         <div className="flex items-baseline gap-2">
//           <span className="text-2xl font-bold text-foreground">
//             {formatCurrency(goal.current_amount)}
//           </span>
//           <span className="text-sm text-muted-foreground">
//             of {formatCurrency(goal.target_amount)}
//           </span>
//         </div>

//         <div>
//           <div className="flex items-center justify-between text-sm mb-2">
//             <span className="text-muted-foreground">Progress</span>
//             <span className="font-medium">{progress.toFixed(0)}%</span>
//           </div>
//           <Progress value={progress} className="h-2" />
//         </div>

//         <div className="flex items-center justify-between text-sm">
//           <div className="flex items-center gap-2 text-muted-foreground">
//             <Calendar className="h-4 w-4" />
//             <span>Deadline</span>
//           </div>
//           <span className="text-foreground">
//             {goal.target_date
//               ? new Date(goal.target_date).toLocaleDateString()
//               : 'N/A'}
//           </span>
//         </div>

//         <Button
//           className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
//           onClick={() => onContribute(goal.id, goal.name)}
//           disabled={isContributing || progress >= 100}
//         >
//           {isContributing ? (
//             <Loader2 className="h-4 w-4 animate-spin mr-2" />
//           ) : (
//             <BadgeCent className="h-5 w-5 mr-2" />
//           )}
//           Add Contribution
//         </Button>

//         {progress === 100 && (
//           <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
//             <TrendingUp className="h-4 w-4" />
//             <span className="text-sm font-medium">Goal Achieved!</span>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// function EmptyGoalCard({ onCreate }: { onCreate: () => void }) {
//   return (
//     <Card
//       className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
//       onClick={onCreate}
//     >
//       <CardContent className="flex flex-col items-center justify-center h-full min-h-80 text-center p-8">
//         <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
//           <Target className="h-8 w-8 text-primary" />
//         </div>
//         <h3 className="mb-3 text-xl font-semibold text-foreground">
//           Create New Goal
//         </h3>
//         <p className="text-sm text-muted-foreground max-w-xs">
//           Set a new savings target and start building your future
//         </p>
//       </CardContent>
//     </Card>
//   );
// }

// // Main component

// export function GoalsPage() {
//   const queryClient = useQueryClient();

//   // Modal state
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

//   // Delete dialog
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [goalIdToDelete, setGoalIdToDelete] = useState<number | null>(null);

//   // Error dialog
//   const [errorDialog, setErrorDialog] = useState<{
//     title: string;
//     message: string;
//   } | null>(null);

//   // Data fetching with React Query (replaces manual useEffect + useCallback)
//   const {
//     data: goals = [],
//     isLoading,
//     error,
//     refetch,
//   } = useQuery<Goal[]>({
//     queryKey: GOALS_QUERY_KEY,
//     queryFn: async () => {
//       const response = await apiClient.get('/accounts/goals/dashboard/');
//       const data = response.data;
//       // Keep original normalization logic
//       return data.goals || data.results || (Array.isArray(data) ? data : []);
//     },
//     staleTime: 1000 * 60 * 5,
//   });

//   // Contribute mutation
//   const contributeMutation = useMutation({
//     mutationFn: async ({ id, name }: { id: number; name: string }) => {
//       const idempotencyKey = crypto.randomUUID();
//       await apiClient.post(
//         `/accounts/goals/${id}/contribute/`,
//         {},
//         { headers: { 'X-Idempotency-Key': idempotencyKey } },
//       );
//       return { id, name };
//     },
//     onSuccess: async ({ name }) => {
//       await queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
//       toast.success(`Contribution added to ${name}`);
//     },
//     onError: (error: unknown) => {
//       const msg =
//         (error as { response?: { data?: { error?: string } } }).response?.data
//           ?.error || 'Contribution failed.';
//       setErrorDialog({ title: 'Transaction Failed', message: msg });
//     },
//   });

//   // Delete mutation with optimistic update + rollback
//   const deleteMutation = useMutation({
//     mutationFn: async (id: number) => {
//       const idempotencyKey = crypto.randomUUID();
//       await apiClient.delete(`/accounts/goals/${id}/`, {
//         headers: { 'X-Idempotency-Key': idempotencyKey },
//       });
//       return id;
//     },
//     onMutate: async (id) => {
//       // Optimistic update
//       await queryClient.cancelQueries({ queryKey: GOALS_QUERY_KEY });
//       const previousGoals = queryClient.getQueryData<Goal[]>(GOALS_QUERY_KEY);

//       queryClient.setQueryData<Goal[]>(GOALS_QUERY_KEY, (old = []) =>
//         old.filter((g) => g.id !== id),
//       );

//       return { previousGoals };
//     },
//     onError: (error, id, context) => {
//       // Rollback
//       if (context?.previousGoals) {
//         queryClient.setQueryData(GOALS_QUERY_KEY, context.previousGoals);
//       }
//       const msg =
//         (error as { response?: { data?: { detail?: string } } }).response?.data
//           ?.detail || 'Delete failed. Goal has been restored.';
//       setErrorDialog({ title: 'Delete Error', message: msg });
//     },
//     onSuccess: (id) => {
//       const goalName = goals.find((g) => g.id === id)?.name || 'Goal';
//       toast.success(`${goalName} deleted successfully`);
//     },
//     onSettled: () => {
//       setGoalIdToDelete(null);
//       setDeleteConfirmOpen(false);
//     },
//   });

//   // Handlers (clean & memoized where it matters)
//   const handleModalSuccess = () => {
//     queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
//     setEditingGoal(null);
//     setModalOpen(false);
//   };

//   const openCreate = () => {
//     setEditingGoal(null);
//     setModalOpen(true);
//   };

//   const openEdit = (goal: Goal) => {
//     setEditingGoal(goal);
//     setModalOpen(true);
//   };

//   const handleContribute = (id: number, name: string) => {
//     contributeMutation.mutate({ id, name });
//   };

//   const handleDeleteClick = (id: number) => {
//     setGoalIdToDelete(id);
//     setDeleteConfirmOpen(true);
//   };

//   const executeDelete = () => {
//     if (!goalIdToDelete) return;
//     deleteMutation.mutate(goalIdToDelete);
//   };

//   // Loading skeleton (much nicer UX than the original spinner)
//   if (isLoading) {
//     return (
//       <div className="space-y-6 mb-20 md:mb-0">
//         <div className="h-64 bg-muted animate-pulse rounded-2xl" />
//         <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <div key={i} className="h-96 bg-muted animate-pulse rounded-2xl" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 mb-20 md:mb-0">
//       {/* Overview Card */}
//       <GoalsOverviewCard goals={goals} onCreateClick={openCreate} />

//       {/* Goals List */}
//       <div className="space-y-4">
//         <h3 className="text-xl md:text-2xl font-semibold text-foreground">
//           Your Goals
//         </h3>

//         {error ? (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription className="flex items-center gap-2">
//               Unable to synchronize goals.
//               <Button
//                 variant="link"
//                 onClick={() => refetch()}
//                 className="h-auto p-0 underline"
//               >
//                 Retry
//               </Button>
//             </AlertDescription>
//           </Alert>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {goals.map((goal) => (
//               <GoalCard
//                 key={goal.id}
//                 goal={goal}
//                 onEdit={openEdit}
//                 onDelete={handleDeleteClick}
//                 onContribute={handleContribute}
//                 isContributing={contributeMutation.isPending}
//                 isDeleting={deleteMutation.isPending}
//               />
//             ))}

//             {/* Always-visible "Create new goal" card */}
//             <EmptyGoalCard onCreate={openCreate} />
//           </div>
//         )}
//       </div>

//       {/* Modals & Dialogs (unchanged API, just cleaner state flow) */}
//       <GoalFormModal
//         open={modalOpen}
//         onOpenChange={setModalOpen}
//         onSuccess={handleModalSuccess}
//         editingGoal={editingGoal}
//       />

//       <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will permanently delete your savings goal and all associated
//               contribution history. This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={executeDelete}
//               className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
//               disabled={deleteMutation.isPending}
//             >
//               {deleteMutation.isPending ? (
//                 <Loader2 className="h-4 w-4 animate-spin mr-2" />
//               ) : null}
//               Delete Goal
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       <AlertDialog
//         open={!!errorDialog}
//         onOpenChange={(open) => !open && setErrorDialog(null)}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <div className="flex items-center gap-2 text-destructive mb-2">
//               <AlertCircle className="h-5 w-5" />
//               <AlertDialogTitle>{errorDialog?.title}</AlertDialogTitle>
//             </div>
//             <AlertDialogDescription>
//               {errorDialog?.message}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogAction>Dismiss</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import {
//   Target,
//   Plus,
//   Calendar,
//   BadgeCent,
//   Edit2,
//   Trash2,
//   Loader2,
//   AlertCircle,
//   TrendingUp,
// } from 'lucide-react';
// import { toast } from 'sonner';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import { Button } from '../ui/button';
// import { Progress } from '../ui/progress';
// import { Alert, AlertDescription } from '../ui/alert';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '../ui/alert-dialog';
// import { apiClient } from '@/src/lib/axios';
// import { GoalFormModal } from '../modals/GoalFormModal';
// import { Goal } from '@/src/lib/schemas';

// export function GoalsPage() {
//   const [goals, setGoals] = useState<Goal[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
//   const [activeActionId, setActiveActionId] = useState<string | number | null>(
//     null,
//   );

//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [goalIdToDelete, setGoalIdToDelete] = useState<number | null>(null);
//   const [errorDialog, setErrorDialog] = useState<{
//     title: string;
//     message: string;
//   } | null>(null);

//   const fetchGoals = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await apiClient.get('/accounts/goals/dashboard/');
//       const data = response.data;
//       const normalizedGoals =
//         data.goals || data.results || (Array.isArray(data) ? data : []);
//       setGoals(normalizedGoals);
//       setError(null);
//     } catch (err) {
//       console.error('Failed to fetch goals:', err);
//       setError('Unable to synchronize goals.');
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchGoals();
//   }, [fetchGoals]);

//   const handleModalSuccess = () => {
//     fetchGoals();
//     setEditingGoal(null);
//     setModalOpen(false);
//   };

//   const openCreate = () => {
//     setEditingGoal(null);
//     setModalOpen(true);
//   };

//   const openEdit = (goal: Goal) => {
//     setEditingGoal(goal);
//     setModalOpen(true);
//   };

//   const handleAddContribution = async (id: number, goalName: string) => {
//     setActiveActionId(`contribute-${id}`);
//     try {
//       const idempotencyKey = crypto.randomUUID();
//       await apiClient.post(
//         `/accounts/goals/${id}/contribute/`,
//         {},
//         { headers: { 'X-Idempotency-Key': idempotencyKey } },
//       );
//       await fetchGoals();
//       toast.success(`Contribution added to ${goalName}`);
//     } catch (error: unknown) {
//       const msg =
//         (error as { response?: { data?: { error?: string } } }).response?.data
//           ?.error || 'Contribution failed.';
//       setErrorDialog({ title: 'Transaction Failed', message: msg });
//     } finally {
//       setActiveActionId(null);
//     }
//   };

//   const executeDelete = async () => {
//     if (!goalIdToDelete) return;

//     const id = goalIdToDelete;
//     const goalName = goals.find((g) => g.id === id)?.name || 'Goal';
//     const previousGoals = [...goals];
//     setActiveActionId(`delete-${id}`);
//     setGoals((prev) => prev.filter((g) => g.id !== id));

//     try {
//       const idempotencyKey = crypto.randomUUID();
//       await apiClient.delete(`/accounts/goals/${id}/`, {
//         headers: { 'X-Idempotency-Key': idempotencyKey },
//       });
//       toast.success(`${goalName} deleted successfully`);
//       setGoalIdToDelete(null);
//     } catch (error: unknown) {
//       setGoals(previousGoals);
//       const msg =
//         (error as { response?: { data?: { detail?: string } } }).response?.data
//           ?.detail || 'Delete failed. Goal has been restored.';
//       setErrorDialog({ title: 'Delete Error', message: msg });
//     } finally {
//       setActiveActionId(null);
//     }
//   };

//   const formatCurrency = (amount: string | number): string => {
//     const val = typeof amount === 'string' ? parseFloat(amount) : amount;
//     return `₵${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
//   };

//   const totalTarget = goals.reduce(
//     (sum, g) => sum + parseFloat(g.target_amount || '0'),
//     0,
//   );
//   const totalSaved = goals.reduce(
//     (sum, g) => sum + parseFloat(g.current_amount || '0'),
//     0,
//   );
//   const overallProgress =
//     totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

//   const GoalCard = ({ goal }: { goal: Goal }) => {
//     const current = parseFloat(goal.current_amount) || 0;
//     const target = parseFloat(goal.target_amount) || 0;
//     const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

//     return (
//       <Card className="hover:shadow-md transition-shadow bg-card border-border">
//         <CardHeader className="pb-4">
//           <div className="flex items-start justify-between">
//             <div className="flex-1">
//               <CardTitle className="text-lg font-medium text-foreground">
//                 {goal.name}
//               </CardTitle>
//               <CardDescription className="mt-1">
//                 {formatCurrency(goal.regular_contribution)} • {goal.frequency}
//               </CardDescription>
//             </div>
//             <div className="flex gap-1">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8"
//                 onClick={() => openEdit(goal)}
//               >
//                 <Edit2 className="h-4 w-4" />
//               </Button>
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 className="h-8 w-8"
//                 onClick={() => {
//                   setGoalIdToDelete(goal.id);
//                   setDeleteConfirmOpen(true);
//                 }}
//                 disabled={!!activeActionId}
//               >
//                 <Trash2 className="h-4 w-4 text-destructive" />
//               </Button>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-5">
//           <div className="flex items-baseline gap-2">
//             <span className="text-2xl font-bold text-foreground">
//               {formatCurrency(goal.current_amount)}
//             </span>
//             <span className="text-sm text-muted-foreground">
//               of {formatCurrency(goal.target_amount)}
//             </span>
//           </div>

//           <div>
//             <div className="flex items-center justify-between text-sm mb-2">
//               <span className="text-muted-foreground">Progress</span>
//               <span className="font-medium">{progress.toFixed(0)}%</span>
//             </div>
//             <Progress value={progress} className="h-2" />
//           </div>

//           <div className="flex items-center justify-between text-sm">
//             <div className="flex items-center gap-2 text-muted-foreground">
//               <Calendar className="h-4 w-4" />
//               <span>Deadline</span>
//             </div>
//             <span className="text-foreground">
//               {goal.target_date
//                 ? new Date(goal.target_date).toLocaleDateString()
//                 : 'N/A'}
//             </span>
//           </div>

//           <Button
//             className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
//             onClick={() => handleAddContribution(goal.id, goal.name)}
//             disabled={!!activeActionId || progress >= 100}
//           >
//             {activeActionId === `contribute-${goal.id}` ? (
//               <Loader2 className="h-4 w-4 animate-spin mr-2" />
//             ) : (
//               <BadgeCent className="h-5 w-5 mr-2" />
//             )}
//             Add Contribution
//           </Button>

//           {progress === 100 && (
//             <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
//               <TrendingUp className="h-4 w-4" />
//               <span className="text-sm font-medium">Goal Achieved!</span>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     );
//   };

//   return (
//     <div className="space-y-6 mb-20 md:mb-0">
//       {/* Overview Card */}
//       <Card className="bg-linear-to-br from-cyan-500 to-teal-600 text-white rounded-2xl border-none shadow-lg">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-xl font-bold">Goals Overview</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-5">
//             <div className="grid grid-cols-2 gap-6">
//               <div>
//                 <p className="text-sm opacity-90 mb-1">Total Target</p>
//                 <p className="text-2xl font-bold">
//                   {formatCurrency(totalTarget)}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm opacity-90 mb-1">Total Saved</p>
//                 <p className="text-2xl font-bold">
//                   {formatCurrency(totalSaved)}
//                 </p>
//               </div>
//             </div>

//             <div>
//               <div className="flex items-center justify-between text-sm mb-2 opacity-90">
//                 <span>Overall Progress</span>
//                 <span>{overallProgress.toFixed(0)}%</span>
//               </div>
//               <Progress
//                 value={overallProgress}
//                 className="h-2 bg-primary-foreground/20"
//               />
//             </div>

//             <div className="flex items-center justify-between pt-3 border-t border-primary-foreground/20">
//               <span className="text-sm opacity-90">
//                 {goals.length} Active Goals
//               </span>
//               <Button
//                 size="sm"
//                 variant="secondary"
//                 onClick={openCreate}
//                 className="bg-white/90 text-primary hover:bg-white font-medium dark:text-muted"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 New Goal
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Goals List */}
//       <div className="space-y-4">
//         <h3 className="text-xl md:text-2xl font-semibold text-foreground">
//           Your Goals
//         </h3>

//         {isLoading ? (
//           <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
//             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             <p className="mt-4 text-sm text-muted-foreground font-medium">
//               Loading your goals...
//             </p>
//           </div>
//         ) : error ? (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription className="flex items-center gap-2">
//               {error}
//               <Button
//                 variant="link"
//                 onClick={fetchGoals}
//                 className="h-auto p-0 underline"
//               >
//                 Retry
//               </Button>
//             </AlertDescription>
//           </Alert>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {goals.map((goal) => (
//               <GoalCard key={goal.id} goal={goal} />
//             ))}

//             {/* Create new goal */}
//             <Card
//               className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
//               onClick={openCreate}
//             >
//               <CardContent className="flex flex-col items-center justify-center h-full min-h-80 text-center p-8">
//                 <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
//                   <Target className="h-8 w-8 text-primary" />
//                 </div>
//                 <h3 className="mb-3 text-xl font-semibold text-foreground">
//                   Create New Goal
//                 </h3>
//                 <p className="text-sm text-muted-foreground max-w-xs">
//                   Set a new savings target and start building your future
//                 </p>
//               </CardContent>
//             </Card>
//           </div>
//         )}
//       </div>

//       {/* Modals & Dialogs */}
//       <GoalFormModal
//         open={modalOpen}
//         onOpenChange={setModalOpen}
//         onSuccess={handleModalSuccess}
//         editingGoal={editingGoal}
//       />

//       <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will permanently delete your savings goal and all associated
//               contribution history. This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={executeDelete}
//               className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
//             >
//               Delete Goal
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       <AlertDialog
//         open={!!errorDialog}
//         onOpenChange={(open) => !open && setErrorDialog(null)}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <div className="flex items-center gap-2 text-destructive mb-2">
//               <AlertCircle className="h-5 w-5" />
//               <AlertDialogTitle>{errorDialog?.title}</AlertDialogTitle>
//             </div>
//             <AlertDialogDescription>
//               {errorDialog?.message}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogAction>Dismiss</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }
