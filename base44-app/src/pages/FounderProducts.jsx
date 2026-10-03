import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SiteHeader from '@/components/SiteHeader';
import ProductForm from '@/components/founder/ProductForm';
import FounderNav from '@/components/founder/FounderNav';
import ListingLiveDialog from '@/components/founder/ListingLiveDialog';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { money } from '@/lib/shop';
import { planFor } from '@/lib/plans';
import { toast } from '@/components/ui/use-toast';
import { Pencil, Plus, Share2, Trash2 } from 'lucide-react';

export default function FounderProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [justPublished, setJustPublished] = useState(null);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    (async () => {
      const brands = await base44.entities.Brand.filter(
        { created_by_id: user.id },
        '-created_date',
        1
      );
      if (!active) return;
      if (!brands.length) {
        navigate('/apply', { replace: true });
        return;
      }
      const record = brands[0];
      const items = await base44.entities.Product.filter(
        { brand_id: record.id },
        '-created_date',
        100
      );
      if (!active) return;
      setBrand(record);
      setProducts(items);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, navigate]);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setOpen(true);
  };

  const save = async (values) => {
    const otherLive = products.filter(
      (item) => item.status === 'published' && item.id !== editing?.id
    ).length;
    if (values.status === 'published' && otherLive >= plan.cap) {
      toast({
        title: 'Plan limit reached',
        description: `Your ${plan.name} plan includes ${plan.cap} live products.`,
      });
      return;
    }
    setSaving(true);
    try {
      // The share screen belongs to the moment a piece goes live, not to every
      // later edit of something already published.
      let wentLive = null;

      if (editing) {
        const updated = await base44.entities.Product.update(editing.id, values);
        setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        if (updated.status === 'published' && editing.status !== 'published') wentLive = updated;
      } else {
        const created = await base44.entities.Product.create({
          ...values,
          brand_id: brand.id,
          brand_name: brand.name,
          brand_owner_id: user.id,
        });
        setProducts((prev) => [created, ...prev]);
        if (created.status === 'published') wentLive = created;
      }

      setOpen(false);
      setEditing(null);

      if (wentLive) setJustPublished(wentLive);
      else toast({ title: 'Product saved' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product) => {
    await base44.entities.Product.delete(product.id);
    setProducts((prev) => prev.filter((item) => item.id !== product.id));
    toast({ title: 'Product removed' });
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

  const approved = brand.status === 'approved';
  const plan = planFor(brand);
  const liveCount = products.filter((item) => item.status === 'published').length;
  const atCap = liveCount >= plan.cap;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <FounderNav />

      <main className="mx-auto max-w-5xl px-5 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              to="/founder"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {brand.name}
            </Link>
            <h1 className="mt-3 font-display text-4xl">Products</h1>
            <p className="mt-3 max-w-lg text-muted-foreground">
              Everything you publish here appears in the marketplace and on your storefront.
            </p>
          </div>
          {approved && (
            <div className="sm:text-right">
              <Button onClick={openNew} className="h-11" disabled={atCap}>
                <Plus className="h-4 w-4" />
                New product
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                {liveCount} of {plan.cap} live products · {plan.fee}% fee per sale · {plan.name} plan
              </p>
              {atCap && (
                <p className="mt-1 text-xs text-muted-foreground">
                  You have reached your plan limit.
                </p>
              )}
            </div>
          )}
        </div>

        {!approved ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl">Not open yet</h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Products can be added once your brand is approved. You can check your application
              status on your brand page.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/founder">View your brand</Link>
            </Button>
          </div>
        ) : products === null || products.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
            <h2 className="font-display text-2xl">No products yet</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
              Add your first piece — a name, a price and a photo is enough to go live.
            </p>
            <Button onClick={openNew} className="mt-8">
              <Plus className="h-4 w-4" />
              New product
            </Button>
          </div>
        ) : (
          <div className="mt-12 space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-card p-4"
              >
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                  <Image
                    src={product.images?.[0]}
                    alt={product.title}
                    fittingType="fill"
                    className="h-full w-full"
                  />
                </div>
                <div className="min-w-48 flex-1">
                  <p className="font-heading text-base">{product.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {money(product.price)}
                    {product.sizes?.length ? ` · ${product.sizes.join(', ')}` : ''}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs ${
                    product.status === 'published'
                      ? 'border-emerald-200 bg-emerald-100 text-emerald-900'
                      : 'border-border bg-muted text-muted-foreground'
                  }`}
                >
                  {product.status === 'published' ? 'Published' : 'Draft'}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setJustPublished(product)}
                    title="Share this listing"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(product)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ProductForm
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSubmit={save}
        submitting={saving}
      />

      <ListingLiveDialog
        open={Boolean(justPublished)}
        onOpenChange={(next) => !next && setJustPublished(null)}
        product={justPublished}
      />
    </div>
  );
}