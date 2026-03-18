'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { goalSchema, GoalFormData, Goal } from '@/src/lib/schemas';
import { apiClient } from '@/src/lib/axios';

interface GoalFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingGoal?: Goal | null;
}

export function GoalFormModal({
  open,
  onOpenChange,
  onSuccess,
  editingGoal = null,
}: GoalFormModalProps) {
  const isEdit = !!editingGoal;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      target_amount: '',
      regular_contribution: '',
      target_date: '',
      frequency: 'monthly',
    },
  });

  useEffect(() => {
    if (editingGoal && open) {
      reset({
        name: editingGoal.name,
        target_amount: editingGoal.target_amount,
        regular_contribution: editingGoal.regular_contribution,
        target_date: editingGoal.target_date,
        frequency: editingGoal.frequency as 'daily' | 'weekly' | 'monthly',
      });
    } else if (!editingGoal && open) {
      reset();
    }
  }, [editingGoal, open, reset]);

  const onSubmit = async (data: GoalFormData) => {
    const idempotencyKey = crypto.randomUUID();
    const headers = { 'X-Idempotency-Key': idempotencyKey };

    try {
      if (isEdit && editingGoal) {
        await apiClient.patch(`/accounts/goals/${editingGoal.id}/`, data, {
          headers,
        });
        toast.success(`${data.name} updated successfully`);
      } else {
        await apiClient.post('/accounts/goals/create/', data, { headers });
        toast.success(`${data.name} created successfully`);
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const backendError = (
        error as { response?: { data?: { error?: string } } }
      ).response?.data;
      const msg = backendError
        ? Object.entries(backendError)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' • ')
        : 'Operation failed. Please check your values.';
      setErrorMessage(msg);
    }
  };

  const title = isEdit ? 'Edit Savings Goal' : 'Create New Goal';
  const submitText = isSubmitting ? (
    <Loader2 className="h-5 w-5 animate-spin" />
  ) : isEdit ? (
    'Save Changes'
  ) : (
    'Create Goal'
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-white p-6 rounded-xl">
          <DialogTitle className="-mb-4 text-[16px] md:text-[24px] font-medium">
            {title}
          </DialogTitle>
          <p className="text-sm mb-2 text-gray-500">
            {isEdit
              ? 'Update your savings target'
              : 'Set a new savings target and start building your future'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-sm mb-1 font-bold text-gray-600">
                Goal Name
              </Label>
              <Input
                {...register('name')}
                placeholder="e.g. Hospital Fund"
                className="h-11"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm mb-1 font-bold text-gray-600">
                Target Amount (₵)
              </Label>
              <Input
                type="number"
                {...register('target_amount')}
                placeholder="4000"
                className="h-11"
              />
              {errors.target_amount && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.target_amount.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm mb-1 font-bold text-gray-600">
                Regular Contribution (₵)
              </Label>
              <Input
                type="number"
                {...register('regular_contribution')}
                placeholder="40"
                className="h-11"
              />
              {errors.regular_contribution && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.regular_contribution.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm mb-1 font-bold text-gray-600">
                Target Date
              </Label>
              <Input
                type="date"
                {...register('target_date')}
                className="h-11"
              />
              {errors.target_date && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.target_date.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm mb-1 font-bold text-gray-600">
                Frequency
              </Label>
              <Controller
                name="frequency"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.frequency && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.frequency.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 bg-transparent hover:bg-gray-100 text-gray-600 font-bold"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="flex-1 h-10 bg-cyan-500 hover:bg-cyan-600 text-white font-bold"
                disabled={isSubmitting}
              >
                {submitText}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!errorMessage}
        onOpenChange={(open) => !open && setErrorMessage(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDialogTitle>Submission Error</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-700">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-slate-900 text-white font-bold">
              Back to Form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
