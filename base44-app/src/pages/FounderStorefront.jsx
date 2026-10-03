import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SiteHeader from '@/components/SiteHeader';
import StorefrontEditor from '@/components/founder/StorefrontEditor';
import FounderNav from '@/components/founder/FounderNav';
import StorefrontPreview from '@/components/storefront/StorefrontPreview';
import PreviewFrame from '@/components/founder/PreviewFrame';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { DEFAULT_STOREFRONT } from '@/lib/storefront';
import { planFor } from '@/lib/plans';
import { Eye, Loader2 } from 'lucide-react';

function toDraft(brand) {
  const draft = { ...DEFAULT_STOREFRONT };
  Object.keys(DEFAULT_STOREFRONT).forEach((key) => {
    if (brand[key] !== undefined && brand[key] !== null) draft[key] = brand[key];
  });
  return draft;
}

export default function FounderStorefront() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

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
      const record = list[0];
      const items = await base44.entities.Product.filter(
        { brand_id: record.id, status: 'published' },
        '-created_date',
        100
      );
      if (!active) return;
      setBrand(record);
      setProducts(items);
      setDraft(toDraft(record));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, navigate]);

  const update = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const publish = async () => {
    setSaving(true);
    try {
      const updated = await base44.entities.Brand.update(brand.id, {
        ...draft,
        storefront_published_at: new Date().toISOString(),
      });
      setBrand(updated);
      setDraft(toDraft(updated));
      setDirty(false);
      toast({
        title: 'Storefront published',
        description: 'Shoppers now see your changes.',
      });
    } finally {
      setSaving(false);
    }
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

  if (brand.status !== 'approved') {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="font-display text-3xl">Customisation opens once you are approved</h1>
          <p className="mt-3 text-muted-foreground">
            We will email you as soon as there is a decision on {brand.name}.
          </p>
          <Button asChild className="mt-8">
            <Link to="/founder">Back to my brand</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <FounderNav />

      <main className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="font-display text-4xl">Storefront</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Make {brand.name} your own. Nothing goes live until you publish, so try things freely.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link to={`/brand/${brand.id}`}>View live store</Link>
            </Button>
            <Button onClick={publish} disabled={saving || !dirty}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish changes
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
          <StorefrontEditor
            draft={draft}
            onChange={update}
            products={products}
            plan={planFor(brand)}
          />

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Live preview
                </span>
                {dirty && (
                  <span className="ml-auto text-xs text-muted-foreground">Unpublished changes</span>
                )}
              </div>
              <PreviewFrame className="h-[74vh]">
                <StorefrontPreview brand={{ ...brand, ...draft }} products={products} />
              </PreviewFrame>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Navigation, the bag and checkout stay the same on every store — that is what keeps
              shopping here feel safe.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}