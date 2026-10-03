import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SiteHeader from '@/components/SiteHeader';
import StorefrontPreview from '@/components/storefront/StorefrontPreview';
import { Button } from '@/components/ui/button';

export default function BrandStore() {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const record = await base44.entities.Brand.get(id);
        const items = await base44.entities.Product.filter(
          { brand_id: id, status: 'published' },
          '-created_date',
          100
        );
        if (!active) return;
        setBrand(record);
        setProducts(items);
      } catch {
        if (active) setMissing(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (missing) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="font-display text-3xl">This store is not available</h1>
          <p className="mt-3 text-muted-foreground">
            The brand may not be live yet, or the link is out of date.
          </p>
          <Button asChild className="mt-8">
            <Link to="/market">Back to the marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {brand.vacation_mode && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto max-w-5xl px-5 py-3 text-sm text-amber-900">
            <span className="font-medium">{brand.name} is away.</span>{' '}
            {brand.vacation_message || 'Orders ship as soon as we are back.'}
          </div>
        </div>
      )}

      <StorefrontPreview brand={brand} products={products} />
    </div>
  );
}