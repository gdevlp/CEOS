import React from 'react';
import StorefrontIdentity from '@/components/founder/StorefrontIdentity';
import StorefrontStyle from '@/components/founder/StorefrontStyle';
import StorefrontDetails from '@/components/founder/StorefrontDetails';
import ShippingSettings from '@/components/founder/ShippingSettings';

export default function StorefrontEditor({ draft, onChange, products, plan }) {
  return (
    <div className="space-y-8">
      <StorefrontIdentity draft={draft} onChange={onChange} />
      <StorefrontStyle draft={draft} onChange={onChange} products={products} plan={plan} />
      <StorefrontDetails draft={draft} onChange={onChange} />
      <ShippingSettings draft={draft} onChange={onChange} />
    </div>
  );
}