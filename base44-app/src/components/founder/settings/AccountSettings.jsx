import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsSection from './SettingsSection';
import { toast } from '@/components/ui/use-toast';

export default function AccountSettings({ user }) {
  const [name, setName] = useState(user?.full_name || '');
  const [saving, setSaving] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: name.trim() });
      toast({ title: 'Account details saved' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not save your details',
        description: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      id="account"
      title="Account details"
      blurb="The name and email attached to your CEO/$ account."
    >
      <form onSubmit={save} className="max-w-md space-y-5">
        <div>
          <Label htmlFor="account-name">Name</Label>
          <Input
            id="account-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="account-email">Email</Label>
          <Input id="account-email" value={user?.email || ''} readOnly disabled className="mt-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            Your email is how you sign in, so it cannot be changed here.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? 'Saving…' : 'Save details'}
          </Button>
          <Button asChild variant="ghost">
            <Link to="/forgot-password">Change password</Link>
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}