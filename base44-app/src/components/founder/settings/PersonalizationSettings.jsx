import React from 'react';
import SettingsSection from './SettingsSection';
import { useTheme } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

const OPTIONS = [
  { key: 'light', label: 'Light', Icon: Sun },
  { key: 'dark', label: 'Dark', Icon: Moon },
];

export default function PersonalizationSettings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <SettingsSection
      id="personalization"
      title="Personalization"
      blurb="How CEO/$ looks while you work. This is your own view — shoppers always see your storefront."
    >
      <div className="flex flex-wrap gap-3">
        {OPTIONS.map(({ key, label, Icon }) => {
          const active = theme === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => !active && toggleTheme()}
              className={cn(
                'flex w-36 flex-col items-start gap-4 rounded-xl border p-4 text-left transition-colors',
                active ? 'border-foreground bg-muted' : 'border-border hover:border-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm">{label}</span>
            </button>
          );
        })}
      </div>
    </SettingsSection>
  );
}