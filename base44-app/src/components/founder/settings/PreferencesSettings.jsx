import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SettingsSection from './SettingsSection';
import { CARRIERS } from '@/lib/tracking';

export default function PreferencesSettings({ brand, onSave }) {
  const saved = brand.default_carrier || 'usps';
  const [carrier, setCarrier] = useState(saved);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSave({ default_carrier: carrier }, 'Preferences saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      id="preferences"
      title="Preferences"
      blurb="Defaults that save you typing while you run the shop."
    >
      <div className="max-w-xs">
        <Label htmlFor="default-carrier">Default carrier</Label>
        <Select value={carrier} onValueChange={setCarrier}>
          <SelectTrigger id="default-carrier" className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CARRIERS.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-2 text-xs text-muted-foreground">
          Pre-selected whenever you mark an order shipped.
        </p>
      </div>

      <Button className="mt-5" onClick={save} disabled={saving || carrier === saved}>
        {saving ? 'Saving…' : 'Save preferences'}
      </Button>
    </SettingsSection>
  );
}