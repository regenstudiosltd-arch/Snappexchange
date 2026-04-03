// src/components/settings/Notificationssection.tsx

'use client';

import { Bell } from 'lucide-react';
import {
  NotificationSettings,
  SaveButton,
  SwitchRow,
  SectionShell,
  SectionHeader,
  SectionBody,
  SectionFooter,
} from './Shared';

interface NotificationsSectionProps {
  settings: NotificationSettings;
  onChange: (updated: NotificationSettings) => void;
  onSave: () => void;
}

export function NotificationsSection({
  settings,
  onChange,
  onSave,
}: NotificationsSectionProps) {
  const set = (patch: Partial<NotificationSettings>) =>
    onChange({ ...settings, ...patch });

  return (
    <SectionShell id="notifications">
      <SectionHeader
        icon={<Bell className="h-4 w-4" />}
        title="Notifications"
        description="Control how and when we reach out to you"
        accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
      />

      <SectionBody>
        {/* Channels group */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
            Channels
          </p>
          <div className="space-y-3">
            <SwitchRow
              label="Email Notifications"
              description="Receive updates and alerts via email"
              checked={settings.emailNotifications}
              onCheckedChange={(v) => set({ emailNotifications: v })}
            />
            <SwitchRow
              label="SMS Notifications"
              description="Get important updates via text message"
              checked={settings.smsNotifications}
              onCheckedChange={(v) => set({ smsNotifications: v })}
            />
            <SwitchRow
              label="Push Notifications"
              description="In-app alerts and browser notifications"
              checked={settings.pushNotifications}
              onCheckedChange={(v) => set({ pushNotifications: v })}
              withSeparator={false}
            />
          </div>
        </div>

        {/* Activity group */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3 pt-1">
            Activity
          </p>
          <div className="space-y-3">
            <SwitchRow
              label="Contribution Reminders"
              description="Get reminded before contribution due dates"
              checked={settings.contributionReminders}
              onCheckedChange={(v) => set({ contributionReminders: v })}
            />
            <SwitchRow
              label="Group Updates"
              description="Stay informed about group activities and changes"
              checked={settings.groupUpdates}
              onCheckedChange={(v) => set({ groupUpdates: v })}
            />
            <SwitchRow
              label="Promotions & Tips"
              description="Savings tips, offers and product news"
              checked={settings.promotions}
              onCheckedChange={(v) => set({ promotions: v })}
              withSeparator={false}
            />
          </div>
        </div>
      </SectionBody>

      <SectionFooter>
        <SaveButton
          onClick={onSave}
          isPending={false}
          idleLabel="Save Preferences"
          pendingLabel="Saving…"
        />
      </SectionFooter>
    </SectionShell>
  );
}
