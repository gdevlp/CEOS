import React from 'react';
import { Image } from '@/components/ui/image';
import StatusPill from './StatusPill';
import { fmtDate } from '@/lib/branding';

export default function ApplicationRow({ brand, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(brand)}
      className="flex w-full items-center gap-4 border-b border-border px-4 py-4 text-left transition-colors hover:bg-muted/50"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {brand.sample_images?.[0] && (
          <Image src={brand.sample_images[0]} alt="" fittingType="fill" className="h-full w-full" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{brand.name}</div>
        <div className="truncate text-sm text-muted-foreground">
          {brand.category} · {brand.contact_email || 'no email'}
        </div>
      </div>
      <div className="hidden text-sm text-muted-foreground sm:block">
        {fmtDate(brand.submitted_at || brand.created_date)}
      </div>
      <StatusPill status={brand.status} />
    </button>
  );
}