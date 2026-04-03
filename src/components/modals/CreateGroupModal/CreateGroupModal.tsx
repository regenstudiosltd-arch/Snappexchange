'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { authService } from '@/src/services/auth.service';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import {
  CreateGroupForm,
  CreateGroupModalProps,
  CreateStep,
  FieldErrors,
  GroupData,
} from './types';
import { INITIAL_FORM, STEP_META } from './constants';
import { buildPayload, extractApiError } from './utils';
import { StepIndicator } from './StepIndicator';
import { Verification } from './verification';
import { GroupDetails } from './GroupDetails';
import { Review } from './Review';

export function CreateGroupModal({
  isOpen,
  onClose,
  onComplete,
}: CreateGroupModalProps) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<CreateStep>(1);
  const [form, setForm] = useState<CreateGroupForm>(INITIAL_FORM);
  const [livePictureData, setLivePictureData] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Derived validation ────────────────────────────────────────────────────
  const isStep1Valid = useMemo(
    () => Boolean(form.ghanaCardFront && form.ghanaCardBack && livePictureData),
    [form.ghanaCardFront, form.ghanaCardBack, livePictureData],
  );

  const isStep2Valid = useMemo(
    () =>
      Boolean(
        form.groupName &&
        form.contributionAmount &&
        !fieldErrors.contributionAmount &&
        form.contributionFrequency &&
        form.payoutTimeline &&
        form.memberCount,
      ),
    [form, fieldErrors.contributionAmount],
  );

  const isNextDisabled =
    isSubmitting ||
    (step === 1 && !isStep1Valid) ||
    (step === 2 && !isStep2Valid) ||
    (step === 3 && !termsAccepted);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFieldChange = useCallback(
    (field: keyof CreateGroupForm, value: string | File | null) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleFieldError = useCallback(
    (field: keyof CreateGroupForm, error: string) => {
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    },
    [],
  );

  const resetModal = useCallback(() => {
    setStep(1);
    setForm(INITIAL_FORM);
    setLivePictureData('');
    setFieldErrors({});
    setTermsAccepted(false);
  }, []);

  // ── API mutation ──────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: authService.createSavingsGroup,
    onSuccess: (data) => {
      const newGroup: GroupData = {
        id: data.group_id.toString(),
        groupName: form.groupName,
        contributionAmount: form.contributionAmount,
        frequency: form.contributionFrequency,
        expectedMembers: parseInt(form.memberCount) || 10,
        description: form.groupDescription || '',
        totalSaved: 0,
      };
      onComplete(newGroup);
      onClose();
      resetModal();
      toast.success('Group Created', {
        description: `"${form.groupName}" is now live.`,
      });
    },
    onError: (
      error: AxiosError<{
        error?: string;
        detail?: string;
        [key: string]: unknown;
      }>,
    ) => {
      toast.error('Creation Failed', {
        description: extractApiError(error),
      });
    },
    onSettled: () => setIsSubmitting(false),
  });

  // ── Submit / navigation ───────────────────────────────────────────────────
  const handleNext = async () => {
    if (step < 3) {
      setStep((s) => (s + 1) as CreateStep);
      return;
    }

    // Step 3 → submit
    setIsSubmitting(true);

    if (!livePictureData) {
      toast.error('Missing Photo', {
        description: 'Please capture a live photo to verify your identity.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = await buildPayload(form, livePictureData);
      createMutation.mutate(payload);
    } catch {
      toast.error('Invalid Image', {
        description: 'Live photo is empty or invalid. Please retake the photo.',
      });
      setIsSubmitting(false);
    }
  };

  const handleBack = () => setStep((s) => (s - 1) as CreateStep);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          // Don't reset mid-flow; let the user come back to where they were.
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto no-scrollbar border-border bg-card">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {STEP_META[step].title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {STEP_META[step].description}
          </DialogDescription>
          <StepIndicator currentStep={step} />
        </DialogHeader>

        <div className="py-4">
          {step === 1 && (
            <Verification
              form={form}
              livePictureData={livePictureData}
              onFieldChange={handleFieldChange}
              onLivePicture={setLivePictureData}
            />
          )}
          {step === 2 && (
            <GroupDetails
              form={form}
              fieldErrors={fieldErrors}
              onFieldChange={handleFieldChange}
              onFieldError={handleFieldError}
            />
          )}
          {step === 3 && (
            <Review
              form={form}
              termsAccepted={termsAccepted}
              onTermsChange={setTermsAccepted}
            />
          )}
        </div>

        {/* Navigation footer */}
        <div className="flex gap-3 border-t border-border pt-5">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="flex-1 font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Group...
              </>
            ) : step === 3 ? (
              'Create Group'
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
