import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import SettingsSection from './SettingsSection';

export default function VacationSettings({ brand, onSave }) {
  const [away, setAway] = useState(Boolean(brand.vacation_mode));
  const [message, setMessage] = useState(brand.vacation_message || '');
  const [saving, setSaving] = useState(false);

  const unchanged = away === Boolean(brand.vacation_mode) && message.trim() === (brand.vacation_message || '');

  const save = async () => {
    setSaving(true);
    try {
      await onSave(
        { vacation_mode: away, vacation_message: message.trim() },
        away ? 'Vacation mode is on' : 'Vacation mode is off'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      id="vacation"
      title="Vacation mode"
      blurb="Step away without closing your account. Your store stays up with a note, and your brand drops out of the marketplace and the brands directory until you are back."
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-medium">Take my shop offline while I am away</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Only people with your direct link will find you.
          </p>
        </div>
        <Switch checked={away} onCheckedChange={setAway} aria-label="Vacation mode" />
      </div>

      <div className="mt-6 max-w-lg">
        <Label htmlFor="vacation-message">Note for shoppers</Label>
        <Textarea
          id="vacation-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="We are away until 14 October — orders ship the day we are back."
          className="mt-2"
          rows={3}
        />
      </div>

      <Button className="mt-5" onClick={save} disabled={saving || unchanged}>
        {saving ? 'Saving…' : 'Save vacation settings'}
      </Button>
    </SettingsSection>
  );
}