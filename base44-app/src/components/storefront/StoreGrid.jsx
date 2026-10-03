import React from 'react';
import ProductCard from '@/components/market/ProductCard';

export default function StoreGrid({ products, layout, title, className = '' }) {
  if (!products.length) return null;

  return (
    <section className={className}>
      {title && (
        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">{title}</h2>
      )}
      <div className={`${title ? 'mt-8 ' : ''}${layout.className}`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} source="brand_store" />
        ))}
      </div>
    </section>
  );
}