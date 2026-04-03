// src/components/settings/Dangerzonesection.tsx

'use client';

import { Trash2, TriangleAlert } from 'lucide-react';
import { Button } from '../ui/button';
import { SectionShell, SectionHeader, SectionBody } from './Shared';

export function DangerZoneSection() {
  return (
    <SectionShell id="danger">
      <div className="rounded-2xl border border-red-200/60 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/10 overflow-hidden">
        <SectionHeader
          icon={<TriangleAlert className="h-4 w-4" />}
          title="Danger Zone"
          description="Irreversible and destructive actions"
          accent="bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
        />

        <SectionBody>
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Delete Account
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Permanently removes your account, groups, contribution history
                and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0 h-9 px-4 text-sm rounded-lg bg-red-600 hover:bg-red-700 shadow-sm shadow-red-600/20 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" aria-hidden />
              Delete Account
            </Button>
          </div>
        </SectionBody>
      </div>
    </SectionShell>
  );
}
