import React from 'react';
import ProductCard from '@/components/market/ProductCard';

export default function StoreSpotlight({ products }) {
  if (!products.length) return null;

  return (
    <section className="border-b border-border pb-16">
      <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Featured</h2>
      <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} source="brand_store" />
        ))}
      </div>
    </section>
  );
}