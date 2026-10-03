import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SiteHeader from '@/components/SiteHeader';
import StatusPill from '@/components/brand/StatusPill';
import ApplicationForm from '@/components/brand/ApplicationForm';
import SetupChecklist from '@/components/founder/SetupChecklist';
import FounderNav from '@/components/founder/FounderNav';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { statusMeta, fmtDate } from '@/lib/branding';
import { sendBrandEmail } from '@/lib/emails';
import { toast } from '@/components/ui/use-toast';

const TIMELINE = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'in_review', label: 'In review' },
  { key: 'approved', label: 'Decision' },
];

export default function FounderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    (async () => {
      const list = await base44.entities.Brand.filter({ created_by_id: user.id }, '-created_date', 1);
      if (!active) return;
      if (!list.length) {
        navigate('/apply', { replace: true });
        return;
      }
      setBrand(list[0]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, navigate]);

  const resubmit = async (values) => {
    setSaving(true);
    const updated = await base44.entities.Brand.update(brand.id, {
      ...values,
      status: 'submitted',
      review_note: '',
      submitted_at: new Date().toISOString(),
    });
    await sendBrandEmail({
      to: updated.contact_email,
      subject: 'We received your updated CEO/$ application',
      heading: `Thanks — ${updated.name} is back in review`,
      lines: ['We have your updated application and will email you as soon as there is a decision.'],
    });
    setBrand(updated);
    setEditing(false);
    setSaving(false);
    toast({ title: 'Application resubmitted', description: 'We will email you once it is reviewed.' });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      </div>
    );
  }

  const meta = statusMeta(brand.status);
  const stageIndex = brand.status === 'declined' ? 1 : TIMELINE.findIndex((s) => s.key === brand.status);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <FounderNav />
      <main className="mx-auto max-w-4xl px-5 py-14">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-display text-4xl">{brand.name}</h1>
          <StatusPill status={brand.status} />
        </div>
        <p className="mt-3 max-w-xl text-muted-foreground">{meta.blurb}</p>

        {editing ? (
          <div className="mt-12">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.2em]">
                Update your application
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
            <ApplicationForm
              initial={brand}
              submitLabel="Resubmit application"
              submitting={saving}
              onSubmit={resubmit}
            />
          </div>
        ) : (
          <div className="mt-12 space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap gap-8">
                {TIMELINE.map((step, index) => {
                  const done = stageIndex >= index;
                  const declined = brand.status === 'declined' && index === 2;
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                          declined
                            ? 'border-rose-300 bg-rose-100 text-rose-700'
                            : done
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <div className="text-sm font-medium">
                          {declined ? 'Declined' : step.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {index === 0 && fmtDate(brand.submitted_at)}
                          {index === 2 && brand.reviewed_at && fmtDate(brand.reviewed_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {brand.status === 'declined' && brand.review_note && (
                <div className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-900">
                  <span className="font-medium">Note from our team: </span>
                  {brand.review_note}
                </div>
              )}
            </div>

            {brand.status === 'declined' && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
                <p className="max-w-md text-sm text-muted-foreground">
                  You can update your application and submit it again for review.
                </p>
                <Button onClick={() => setEditing(true)}>Edit and resubmit</Button>
              </div>
            )}

            {brand.status === 'approved' && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
                  <div>
                    <h2 className="font-display text-2xl">Your storefront</h2>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Add your logo, banner, story and colours. Preview every change before it goes
                      live.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline">
                      <Link to={`/brand/${brand.id}`}>View store</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/founder/orders">Orders</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/founder/billing">Billing</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/founder/storefront">Customise</Link>
                    </Button>
                  </div>
                </div>

                <SetupChecklist brand={brand} onBrandChange={setBrand} />
              </>
            )}

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.2em]">
                  Your application
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex gap-4">
                  <dt className="w-28 text-muted-foreground">Category</dt>
                  <dd>{brand.category || '—'}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-28 text-muted-foreground">Tagline</dt>
                  <dd>{brand.tagline || '—'}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-28 text-muted-foreground">About</dt>
                  <dd className="whitespace-pre-wrap">{brand.description || '—'}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-28 text-muted-foreground">Contact</dt>
                  <dd>{brand.contact_email || '—'}</dd>
                </div>
              </dl>
              {brand.sample_images?.length > 0 && (
                <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {brand.sample_images.map((url) => (
                    <div
                      key={url}
                      className="aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                    >
                      <Image src={url} alt="" fittingType="fill" className="h-full w-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}