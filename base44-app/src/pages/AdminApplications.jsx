import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SiteHeader from '@/components/SiteHeader';
import ApplicationRow from '@/components/brand/ApplicationRow';
import ApplicationReview from '@/components/brand/ApplicationReview';
import { STATUS_ORDER, statusMeta } from '@/lib/branding';
import { sendBrandEmail } from '@/lib/emails';
import { toast } from '@/components/ui/use-toast';

const TABS = [{ key: 'all', label: 'All' }, ...STATUS_ORDER.map((key) => ({ key, label: statusMeta(key).label }))];

export default function AdminApplications() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    (async () => {
      const list = await base44.entities.Brand.list('-created_date');
      if (!active) return;
      setBrands(list);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  const filtered = useMemo(
    () => (tab === 'all' ? brands : brands.filter((b) => b.status === tab)),
    [brands, tab],
  );

  const counts = useMemo(() => {
    const map = { all: brands.length };
    STATUS_ORDER.forEach((key) => {
      map[key] = brands.filter((b) => b.status === key).length;
    });
    return map;
  }, [brands]);

  const update = async (patch) => {
    setBusy(true);
    const updated = await base44.entities.Brand.update(open.id, {
      ...patch,
      reviewed_at: new Date().toISOString(),
    });
    setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setOpen(updated);
    setBusy(false);

    if (patch.status === 'approved') {
      await sendBrandEmail({
        to: updated.contact_email,
        subject: 'Your brand is approved for CEO/$',
        heading: `${updated.name} is approved`,
        lines: [
          'Welcome to CEO/$. Your brand passed review and can now go live on the marketplace.',
          'We will be in touch with the next steps for setting up your storefront.',
        ],
      });
      toast({ title: 'Brand approved', description: `${updated.name} is now approved.` });
    } else if (patch.status === 'declined') {
      await sendBrandEmail({
        to: updated.contact_email,
        subject: 'An update on your CEO/$ application',
        heading: `About your ${updated.name} application`,
        lines: [
          'Thank you for applying to CEO/$. After review, we are not able to approve this application.',
          updated.review_note ? `Note from our team: ${updated.review_note}` : '',
          'You are welcome to update your application and submit it again.',
        ].filter(Boolean),
      });
      toast({ title: 'Application declined' });
    } else {
      toast({ title: 'Marked in review' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-lg px-5 py-24 text-center">
          <h1 className="font-display text-3xl">Admins only</h1>
          <p className="mt-3 text-muted-foreground">
            This area is for the CEO/$ team. Ask an admin for access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Review queue</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">Brand applications</h1>

        <div className="mt-8 flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                tab === item.key
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
              <span className="ml-2 opacity-60">{counts[item.key] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center text-muted-foreground">
              Nothing here yet.
            </div>
          ) : (
            filtered.map((brand) => (
              <ApplicationRow key={brand.id} brand={brand} onOpen={setOpen} />
            ))
          )}
        </div>
      </main>

      {open && (
        <ApplicationReview
          brand={open}
          busy={busy}
          onClose={() => setOpen(null)}
          onUpdate={update}
        />
      )}
    </div>
  );
}