import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CARRIERS } from '@/lib/tracking';

export default function ShipOrderForm({ order, onShip, onCancel, defaultCarrier = 'usps' }) {
  const [carrier, setCarrier] = useState(defaultCarrier);
  const [number, setNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const trimmed = number.trim();
    if (!trimmed) {
      setError('Add the tracking number before marking this shipped.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onShip(order, { carrier, tracking_number: trimmed });
    } catch (err) {
      setError(err.message || 'That could not be saved. Please try again.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Mark shipped
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]">
        <div>
          <Label htmlFor={`carrier-${order.id}`}>Carrier</Label>
          <Select value={carrier} onValueChange={setCarrier}>
            <SelectTrigger id={`carrier-${order.id}`} className="mt-2">
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
        </div>

        <div>
          <Label htmlFor={`tracking-${order.id}`}>Tracking number</Label>
          <Input
            id={`tracking-${order.id}`}
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            placeholder="9400 1000 0000 0000 0000 00"
            className="mt-2"
            autoFocus
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Saving…' : 'Mark shipped'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}