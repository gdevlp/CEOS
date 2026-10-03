import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SiteHeader from '@/components/SiteHeader';
import { Image } from '@/components/ui/image';

export default function Brands() {
  const [brands, setBrands] = useState(null);

  useEffect(() => {
    let active = true;
    base44.entities.Brand.filter({ status: 'approved' }, 'name', 100).then((list) => {
      if (active) {
        setBrands(list.filter((brand) => brand.listed_publicly !== false && !brand.vacation_mode));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">The brands</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
          Every label on CEO/$.
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
          Emerging clothing brands, reviewed by hand before they go live. Open a store to see the
          full collection.
        </p>

        {brands === null ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
          </div>
        ) : brands.length === 0 ? (
          <div className="mt-14 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
            <h2 className="font-display text-2xl">No brands live yet</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Approved brands appear here as soon as they open their store.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <Link key={brand.id} to={`/brand/${brand.id}`} className="group flex flex-col">
                <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                  <Image
                    src={brand.sample_images?.[0]}
                    alt={brand.name}
                    fittingType="fill"
                    className="h-72 w-full transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {brand.category || 'Emerging brand'}
                </p>
                <h2 className="mt-2 font-display text-2xl">{brand.name}</h2>
                {brand.tagline && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {brand.tagline}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}