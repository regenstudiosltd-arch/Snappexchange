// src/components/settings/Appearancesection.tsx

'use client';

import { Moon, Sun, Monitor, Languages } from 'lucide-react';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AppearanceSettings,
  ThemeValue,
  THEME_OPTIONS,
  LANGUAGE_OPTIONS,
  SaveButton,
  SectionShell,
  SectionHeader,
  SectionBody,
  SectionFooter,
} from './Shared';
import { useTheme } from '@/src/context/ThemeContext';

const THEME_ICONS: Record<string, React.ReactNode> = {
  light: <Sun className="h-3.5 w-3.5" />,
  dark: <Moon className="h-3.5 w-3.5" />,
  system: <Monitor className="h-3.5 w-3.5" />,
};

interface AppearanceSectionProps {
  appearanceSettings: AppearanceSettings;
  onAppearanceChange: (updated: AppearanceSettings) => void;
  onSave: () => void;
}

export function AppearanceSection({
  appearanceSettings,
  onAppearanceChange,
  onSave,
}: AppearanceSectionProps) {
  const { theme, setTheme } = useTheme();
  const set = (patch: Partial<AppearanceSettings>) =>
    onAppearanceChange({ ...appearanceSettings, ...patch });

  return (
    <SectionShell id="appearance">
      <SectionHeader
        icon={<Moon className="h-4 w-4" />}
        title="Appearance"
        description="Personalise how the app looks and feels"
        accent="bg-slate-500/10 text-slate-600 dark:text-slate-400"
      />

      <SectionBody>
        {/* Theme picker — pill buttons */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Theme
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ value, label }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value as ThemeValue)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                    active
                      ? 'border-cyan-400 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:border-cyan-500 dark:text-cyan-300 shadow-sm shadow-cyan-400/20'
                      : 'border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/60'
                  }`}
                >
                  <span className={active ? 'text-cyan-500' : ''}>
                    {THEME_ICONS[value]}
                  </span>
                  <span className="text-xs">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5 text-muted-foreground/60" />
            <Label
              htmlFor="language"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Language
            </Label>
          </div>
          <Select
            value={appearanceSettings.language}
            onValueChange={(v) => set({ language: v })}
          >
            <SelectTrigger
              id="language"
              className="h-10 rounded-lg border-border/70 bg-background/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/60 shadow-lg">
              {LANGUAGE_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="text-sm">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SectionBody>

      <SectionFooter>
        <SaveButton
          onClick={onSave}
          isPending={false}
          idleLabel="Save Appearance"
          pendingLabel="Saving…"
        />
      </SectionFooter>
    </SectionShell>
  );
}
