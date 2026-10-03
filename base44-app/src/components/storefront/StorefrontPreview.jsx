import React from 'react';
import StoreAnnouncement from '@/components/storefront/StoreAnnouncement';
import StoreHero from '@/components/storefront/StoreHero';
import StoreSpotlight from '@/components/storefront/StoreSpotlight';
import StoreGrid from '@/components/storefront/StoreGrid';
import StoreStory from '@/components/storefront/StoreStory';
import { Lock } from 'lucide-react';
import { orderProducts, storefrontTheme } from '@/lib/storefront';
import { planFor, planHasFeature } from '@/lib/plans';

/**
 * Renders a brand's storefront from its record. The founder editor renders this
 * same component against unsaved draft values, so what they preview is exactly
 * what shoppers get.
 *
 * Everything outside this component — the site header, the bag and checkout — is
 * deliberately fixed, so those behave identically on every store.
 */
export default function StorefrontPreview({ brand, products }) {
  const theme = storefrontTheme(brand);
  const list = products || [];
  const canFeature = planHasFeature(planFor(brand), 'featured_picks');
  const { featured, rest } = orderProducts(list, canFeature ? brand.featured_product_ids : []);

  return (
    <div style={theme.style}>
      <StoreAnnouncement text={brand.announcement} />
      <StoreHero brand={brand} bannerStyle={theme.banner.key} />

      <div className="mx-auto max-w-6xl px-5 py-16">
        {products === null ? (
          <div className="flex h-[30vh] items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-20 text-center">
            <h2 className="font-display text-2xl">No pieces yet</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
              {brand.name} has not added any products to the marketplace yet.
            </p>
          </div>
        ) : (
          <>
            <StoreSpotlight products={featured} />
            <StoreGrid
              products={featured.length ? rest : list}
              layout={theme.grid}
              title={featured.length ? 'All pieces' : null}
              className={featured.length ? 'pt-16' : ''}
            />
          </>
        )}
      </div>

      <StoreStory brand={brand} />

      <div className="flex items-center justify-center gap-2 border-t border-border px-5 py-6 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        <span>Secure checkout · Ships from {brand.name}</span>
      </div>
    </div>
  );
}