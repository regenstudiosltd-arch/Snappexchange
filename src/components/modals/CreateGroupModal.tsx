'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Upload,
  Users,
  Banknote,
  Shield,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { LivePictureCapture } from '../LivePictureCapture';
import { authService } from '@/src/services/auth.service';
import { AxiosError } from 'axios';
import { cn } from '../ui/utils';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

interface GroupData {
  id: string;
  groupName: string;
  contributionAmount: string;
  frequency: string;
  expectedMembers: number;
  description?: string;
  totalSaved: number;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (groupData: GroupData) => void;
}

export function CreateGroupModal({
  isOpen,
  onClose,
  onComplete,
}: CreateGroupModalProps) {
  const [step, setStep] = useState(1);
  const [livePictureData, setLivePictureData] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    adminFullName: '',
    adminAge: '',
    adminEmail: '',
    adminContact: '',
    adminLocation: '',
    adminOccupation: '',
    ghanaCardFront: null as File | null,
    ghanaCardBack: null as File | null,
    groupName: '',
    contributionAmount: '',
    contributionFrequency: '',
    payoutTimeline: '',
    memberCount: '',
    groupDescription: '',
  });

  const updateFormData = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: string, file: File | null) => {
    updateFormData(field, file);
  };

  // API Mutation
  const createMutation = useMutation({
    mutationFn: authService.createSavingsGroup,
    onSuccess: (data) => {
      const newGroup: GroupData = {
        id: data.group_id.toString(),
        groupName: formData.groupName,
        contributionAmount: formData.contributionAmount,
        frequency: formData.contributionFrequency,
        expectedMembers: parseInt(formData.memberCount) || 10,
        description: formData.groupDescription || '',
        totalSaved: 0,
      };

      onComplete(newGroup);
      onClose();
      resetForm();

      toast.success('Group Created Successfully', {
        description: `${formData.groupName} has been set up.`,
      });
    },
    onError: (error: AxiosError<{ error?: string; detail?: string }>) => {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        'Failed to create group. Please try again.';

      toast.error('Creation Failed', {
        description: errorMsg,
      });
    },
    onSettled: () => setIsSubmitting(false),
  });

  const resetForm = () => {
    setStep(1);
    setLivePictureData('');
    setFormData({
      adminFullName: '',
      adminAge: '',
      adminEmail: '',
      adminContact: '',
      adminLocation: '',
      adminOccupation: '',
      ghanaCardFront: null,
      ghanaCardBack: null,
      groupName: '',
      contributionAmount: '',
      contributionFrequency: '',
      payoutTimeline: '',
      memberCount: '',
      groupDescription: '',
    });
  };

  const handleSubmit = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }

    setIsSubmitting(true);

    const payload = new FormData();

    payload.append('group_name', formData.groupName);
    payload.append('contribution_amount', formData.contributionAmount);
    payload.append('frequency', formData.contributionFrequency.toLowerCase());
    payload.append(
      'payout_timeline_days',
      formData.payoutTimeline.replace(/[^0-9]/g, '') || '30',
    );
    payload.append('expected_members', formData.memberCount);
    if (formData.groupDescription) {
      payload.append('description', formData.groupDescription);
    }

    if (formData.ghanaCardFront) {
      payload.append('kyc.ghana_card_front', formData.ghanaCardFront);
    }
    if (formData.ghanaCardBack) {
      payload.append('kyc.ghana_card_back', formData.ghanaCardBack);
    }

    if (livePictureData) {
      try {
        const blob = await fetch(livePictureData).then((r) => r.blob());
        if (blob.size === 0) throw new Error('Empty image');

        const liveFile = new File([blob], `live_photo_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        payload.append('kyc.live_photo', liveFile);
      } catch {
        toast.error('Invalid Image', {
          description:
            'Live photo is empty or invalid. Please retake the photo.',
        });
        setIsSubmitting(false);
        return;
      }
    } else {
      toast.error('Missing Photo', {
        description: 'Please capture a live photo to verify your identity.',
      });
      setIsSubmitting(false);
      return;
    }

    createMutation.mutate(payload);
  };

  const isStep1Valid =
    formData.ghanaCardFront && formData.ghanaCardBack && livePictureData;

  const isStep2Valid =
    formData.groupName &&
    formData.contributionAmount &&
    formData.contributionFrequency &&
    formData.payoutTimeline &&
    formData.memberCount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[97vh] overflow-y-auto no-scrollbar bg-card border-border">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl md:text-2xl font-semibold text-foreground">
            {step === 1
              ? 'Admin Verification Required'
              : step === 2
                ? 'Group Details'
                : 'Review & Create'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 1
              ? 'Verify your identity to create a savings group'
              : step === 2
                ? "Set up your group's contribution rules"
                : 'Review and confirm group creation'}
          </DialogDescription>

          <div className="flex gap-2 mt-5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-2 flex-1 rounded-full transition-colors',
                  step >= s ? 'bg-primary' : 'bg-muted',
                )}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ... Step content remains the same as your original file ... */}
          {/* Step 1 content */}
          {step === 1 && (
            <>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-5 flex items-start gap-4">
                <Shield className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div className="text-sm space-y-2">
                  <p className="font-medium text-foreground">
                    Admin verification is required to ensure trust and security
                    within savings groups.
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Your information will be kept confidential and secure.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-foreground">Full Name *</Label>
                  <Input
                    value={formData.adminFullName}
                    onChange={(e) =>
                      updateFormData('adminFullName', e.target.value)
                    }
                    placeholder="Enter full name"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Age *</Label>
                  <Input
                    type="number"
                    value={formData.adminAge}
                    onChange={(e) => updateFormData('adminAge', e.target.value)}
                    placeholder="Enter age"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Email Address *</Label>
                <Input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => updateFormData('adminEmail', e.target.value)}
                  placeholder="your@email.com"
                  className="bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-foreground">Contact Number *</Label>
                  <Input
                    value={formData.adminContact}
                    onChange={(e) =>
                      updateFormData('adminContact', e.target.value)
                    }
                    placeholder="0XX XXX XXXX"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Location *</Label>
                  <Input
                    value={formData.adminLocation}
                    onChange={(e) =>
                      updateFormData('adminLocation', e.target.value)
                    }
                    placeholder="City, Region"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Occupation *</Label>
                <Input
                  value={formData.adminOccupation}
                  onChange={(e) =>
                    updateFormData('adminOccupation', e.target.value)
                  }
                  placeholder="Your occupation"
                  className="bg-background"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-foreground">
                  Identity Verification *
                </Label>

                <div className="space-y-3">
                  <label
                    className={cn(
                      'flex items-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                      formData.ghanaCardFront
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border hover:border-primary/50',
                    )}
                  >
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {formData.ghanaCardFront
                        ? 'Ghana Card Front ✓'
                        : 'Upload Ghana Card (Front)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          'ghanaCardFront',
                          e.target.files?.[0] || null,
                        )
                      }
                      className="hidden"
                    />
                  </label>

                  <label
                    className={cn(
                      'flex items-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                      formData.ghanaCardBack
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border hover:border-primary/50',
                    )}
                  >
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {formData.ghanaCardBack
                        ? 'Ghana Card Back ✓'
                        : 'Upload Ghana Card (Back)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          'ghanaCardBack',
                          e.target.files?.[0] || null,
                        )
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Live Picture *</Label>
                  <LivePictureCapture
                    onCapture={setLivePictureData}
                    capturedImage={livePictureData}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2 content */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label className="text-foreground">Group Name</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={formData.groupName}
                    onChange={(e) =>
                      updateFormData('groupName', e.target.value)
                    }
                    placeholder="e.g., Family Savings Circle"
                    className="pl-10 bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-foreground">
                    Contribution Amount (₵)
                  </Label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="number"
                      value={formData.contributionAmount}
                      onChange={(e) =>
                        updateFormData('contributionAmount', e.target.value)
                      }
                      placeholder="100"
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Frequency</Label>
                  <Select
                    value={formData.contributionFrequency}
                    onValueChange={(value) =>
                      updateFormData('contributionFrequency', value)
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-foreground">Payout Timeline</Label>
                  <Input
                    value={formData.payoutTimeline}
                    onChange={(e) =>
                      updateFormData('payoutTimeline', e.target.value)
                    }
                    placeholder="e.g., 30 days"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Expected Members</Label>
                  <Input
                    type="number"
                    value={formData.memberCount}
                    onChange={(e) =>
                      updateFormData('memberCount', e.target.value)
                    }
                    placeholder="10"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">
                  Group Description (Optional)
                </Label>
                <Textarea
                  value={formData.groupDescription}
                  onChange={(e) =>
                    updateFormData('groupDescription', e.target.value)
                  }
                  placeholder="Describe the purpose and rules of your group..."
                  className="min-h-25 bg-background"
                />
              </div>
            </>
          )}

          {/* Step 3 content */}
          {step === 3 && (
            <>
              <div className="space-y-6">
                <div className="bg-muted/30 border border-border rounded-lg p-5 space-y-4">
                  <h4 className="font-semibold text-foreground">
                    Group Summary
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Group Name:</span>
                      <p className="font-medium text-foreground mt-0.5">
                        {formData.groupName}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Contribution:
                      </span>
                      <p className="font-medium text-foreground mt-0.5">
                        ₵{formData.contributionAmount}{' '}
                        {formData.contributionFrequency}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Payout Timeline:
                      </span>
                      <p className="font-medium text-foreground mt-0.5">
                        {formData.payoutTimeline}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Members:</span>
                      <p className="font-medium text-foreground mt-0.5">
                        {formData.memberCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">
                    Terms & Conditions
                  </h4>
                  <div className="border border-border rounded-lg p-5 max-h-60 overflow-y-auto text-sm space-y-3 bg-muted/20">
                    <p className="text-muted-foreground">
                      1. As a group admin, you are responsible for managing
                      contributions and payouts.
                    </p>
                    <p className="text-muted-foreground">
                      2. All members must contribute on time according to the
                      agreed schedule.
                    </p>
                    <p className="text-muted-foreground">
                      3. Payout rotation will be determined fairly and
                      transparently.
                    </p>
                    <p className="text-muted-foreground">
                      4. An 8% service fee applies to all cash-out transactions.
                    </p>
                    <p className="text-muted-foreground">
                      5. You agree to maintain accurate records and honest
                      communication.
                    </p>
                    <p className="text-muted-foreground">
                      6. SnappX reserves the right to suspend groups that
                      violate terms.
                    </p>
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      required
                    />
                    <span className="text-sm text-muted-foreground leading-normal">
                      I agree to the terms and conditions and will manage this
                      group responsibly
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-5 border-t border-border">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (step === 1 && !isStep1Valid) ||
              (step === 2 && !isStep2Valid)
            }
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Group...
              </>
            ) : step === 3 ? (
              'Create Group'
            ) : (
              'Continue'
            )}
            {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
