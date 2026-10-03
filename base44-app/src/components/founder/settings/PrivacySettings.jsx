import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import SettingsSection from './SettingsSection';

export default function PrivacySettings({ brand, onSave }) {
  const saved = brand.listed_publicly !== false;
  const [listed, setListed] = useState(saved);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSave(
        { listed_publicly: listed },
        listed ? 'Your brand is listed' : 'Your brand is unlisted'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      id="privacy"
      title="Privacy"
      blurb="Choose who can find your brand. Your storefront link keeps working either way — this only controls whether you appear in the marketplace and the brands directory."
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-medium">List my brand in the marketplace</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Off means only people you send a link to can reach your store.
          </p>
        </div>
        <Switch checked={listed} onCheckedChange={setListed} aria-label="List my brand publicly" />
      </div>

      <Button className="mt-6" onClick={save} disabled={saving || listed === saved}>
        {saving ? 'Saving…' : 'Save privacy settings'}
      </Button>
    </SettingsSection>
  );
}