'use client';

import { Shield } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { LivePictureCapture } from '@/src/components/landingPage/LivePictureCapture';
import { CreateGroupForm } from './types';
import { FileUploadField } from './FileUploadField';

interface Step1Props {
  form: CreateGroupForm;
  livePictureData: string;
  onFieldChange: (
    field: keyof CreateGroupForm,
    value: string | File | null,
  ) => void;
  onLivePicture: (data: string) => void;
}

/** Thin wrapper that renders a labelled Input row. */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function Verification({
  form,
  livePictureData,
  onFieldChange,
  onLivePicture,
}: Step1Props) {
  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/8 p-4 dark:bg-primary/10">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            Identity verification required
          </p>
          <p className="text-xs text-muted-foreground">
            Your information is kept confidential and used solely for trust &
            security within savings groups.
          </p>
        </div>
      </div>

      {/* Personal details */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name *">
          <Input
            value={form.adminFullName}
            onChange={(e) => onFieldChange('adminFullName', e.target.value)}
            placeholder="Enter full name"
            className="bg-background"
          />
        </Field>
        <Field label="Age *">
          <Input
            type="number"
            min={18}
            value={form.adminAge}
            onChange={(e) => onFieldChange('adminAge', e.target.value)}
            placeholder="e.g. 28"
            className="bg-background"
          />
        </Field>
      </div>

      <Field label="Email Address *">
        <Input
          type="email"
          value={form.adminEmail}
          onChange={(e) => onFieldChange('adminEmail', e.target.value)}
          placeholder="you@example.com"
          className="bg-background"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Contact Number *">
          <Input
            value={form.adminContact}
            onChange={(e) => onFieldChange('adminContact', e.target.value)}
            placeholder="0XX XXX XXXX"
            className="bg-background"
          />
        </Field>
        <Field label="Location *">
          <Input
            value={form.adminLocation}
            onChange={(e) => onFieldChange('adminLocation', e.target.value)}
            placeholder="City, Region"
            className="bg-background"
          />
        </Field>
      </div>

      <Field label="Occupation *">
        <Input
          value={form.adminOccupation}
          onChange={(e) => onFieldChange('adminOccupation', e.target.value)}
          placeholder="Your occupation"
          className="bg-background"
        />
      </Field>

      {/* Ghana Card uploads */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Ghana Card *
        </Label>
        <div className="space-y-2.5">
          <FileUploadField
            label="Upload Ghana Card — Front"
            file={form.ghanaCardFront}
            onChange={(f) => onFieldChange('ghanaCardFront', f)}
          />
          <FileUploadField
            label="Upload Ghana Card — Back"
            file={form.ghanaCardBack}
            onChange={(f) => onFieldChange('ghanaCardBack', f)}
          />
        </div>
      </div>

      {/* Live photo */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">
          Live Photo *
        </Label>
        <p className="text-xs text-muted-foreground">
          Take a clear selfie to match your Ghana Card identity.
        </p>
        <LivePictureCapture
          onCapture={onLivePicture}
          capturedImage={livePictureData}
        />
      </div>
    </div>
  );
}
