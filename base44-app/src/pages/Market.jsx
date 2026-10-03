import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SiteHeader from '@/components/SiteHeader';
import ProductCard from '@/components/market/ProductCard';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export default function Market() {
  const [products, setProducts] = useState(null);
  const [brands, setBrands] = useState([]);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const [items, brandList] = await Promise.all([
        base44.entities.Product.filter({ status: 'published' }, '-created_date', 100),
        base44.entities.Brand.filter({ status: 'approved' }, 'name', 60),
      ]);
      if (!active) return;
      setProducts(items);
      setBrands(brandList);
    })();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set((products || []).map((item) => item.category).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  const search = query.trim().toLowerCase();

  // Brands that are unlisted or away keep their own storefront but drop out of
  // discovery, so their pieces leave the marketplace with them.
  const hiddenBrandIds = useMemo(
    () =>
      new Set(
        brands
          .filter((brand) => brand.listed_publicly === false || brand.vacation_mode)
          .map((brand) => brand.id)
      ),
    [brands]
  );

  const visible = useMemo(() => {
    if (!products) return [];
    return products.filter((item) => {
      if (hiddenBrandIds.has(item.brand_id)) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (!search) return true;
      return [item.title, item.brand_name, item.category, item.description]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search));
    });
  }, [products, category, search, hiddenBrandIds]);

  const matchingBrands = useMemo(
    () =>
      brands.filter(
        (brand) =>
          !hiddenBrandIds.has(brand.id) &&
          (!search || brand.name.toLowerCase().includes(search))
      ),
    [brands, search, hiddenBrandIds]
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          The marketplace
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
          Every brand, one bag.
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
          Curated pieces from approved emerging labels. Check out once — each brand ships its own
          order.
        </p>

        <div className="relative mt-10 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pieces, brands and categories"
            aria-label="Search the marketplace"
            className="h-11 pl-10"
          />
        </div>

        {matchingBrands.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {matchingBrands.map((brand) => (
              <Link
                key={brand.id}
                to={`/brand/${brand.id}`}
                className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                {brand.name}
              </Link>
            ))}
            <Link
              to="/brands"
              className="px-2 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              All brands
            </Link>
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm transition-colors',
                category === 'all'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All
            </button>
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm transition-colors',
                  category === item
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {products === null ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-14 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
            <h2 className="font-display text-2xl">Nothing here yet</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {search
                ? `Nothing matches “${query.trim()}”. Try another brand, piece or category.`
                : category === 'all'
                  ? 'Approved brands add their pieces here. Check back soon.'
                  : 'No pieces in this category yet.'}
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}