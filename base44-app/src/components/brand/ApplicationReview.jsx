import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image } from '@/components/ui/image';
import StatusPill from './StatusPill';
import { fmtDate, socialUrl } from '@/lib/branding';
import { PLANS, DEFAULT_PLAN } from '@/lib/plans';
import { Loader2, X } from 'lucide-react';

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-border py-2.5 last:border-0">
      <div className="pt-0.5 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function SocialLink({ kind, value }) {
  if (!value) return '—';
  return (
    <a
      href={socialUrl(kind, value)}
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-2"
    >
      {value}
    </a>
  );
}

export default function ApplicationReview({ brand, busy, onClose, onUpdate }) {
  const [note, setNote] = useState(brand.review_note || '');
  const [plan, setPlan] = useState(brand.plan || DEFAULT_PLAN);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-xl overflow-y-auto bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start gap-3 border-b border-border bg-card px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="truncate font-display text-2xl">{brand.name}</h2>
              <StatusPill status={brand.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Applied {fmtDate(brand.submitted_at || brand.created_date)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <Row label="Category">{brand.category || '—'}</Row>
          <Row label="Tagline">{brand.tagline || '—'}</Row>
          <Row label="Founder">{brand.owner_name || '—'}</Row>
          <Row label="Email">{brand.contact_email || '—'}</Row>
          <Row label="Country">{brand.country || '—'}</Row>
          <Row label="Website">
            <SocialLink kind="website" value={brand.website} />
          </Row>
          <Row label="Instagram">
            <SocialLink kind="instagram" value={brand.instagram} />
          </Row>
          <Row label="TikTok">
            <SocialLink kind="tiktok" value={brand.tiktok} />
          </Row>

          <div className="py-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">About</div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
              {brand.description || '—'}
            </p>
          </div>

          {brand.sample_images?.length > 0 && (
            <div className="grid grid-cols-3 gap-3 py-2">
              {brand.sample_images.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                >
                  <Image src={url} alt="" fittingType="fill" className="h-full w-full" />
                </a>
              ))}
            </div>
          )}

          <div className="mt-6">
            <label htmlFor="note" className="text-xs uppercase tracking-wider text-muted-foreground">
              Review note (shared with the founder if declined)
            </label>
            <Textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add context for your decision"
              className="mt-2"
            />
          </div>

          <div className="mt-6">
            <label htmlFor="plan" className="text-xs uppercase tracking-wider text-muted-foreground">
              Plan (founder&apos;s choice)
            </label>
            <select
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              {PLANS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.name} — ${option.price}/mo · {option.fee}% per sale · {option.cap} live products
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {brand.status === 'submitted' && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => onUpdate({ status: 'in_review' })}
              >
                Mark in review
              </Button>
            )}
            <Button
              disabled={busy}
              onClick={() => onUpdate({ status: 'approved', review_note: note, plan })}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve brand'}
            </Button>
            <Button
              variant="outline"
              className="text-destructive"
              disabled={busy || !note.trim()}
              onClick={() => onUpdate({ status: 'declined', review_note: note })}
            >
              Decline
            </Button>
          </div>
          {!note.trim() && (
            <p className="mt-2 text-xs text-muted-foreground">Add a note to decline an application.</p>
          )}
        </div>
      </div>
    </div>
  );
}