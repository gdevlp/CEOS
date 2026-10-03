import React from 'react';
import { Image } from '@/components/ui/image';
import { money } from '@/lib/shop';
import { CARD_HEIGHT, CARD_WIDTH } from '@/lib/shareCard';

export default function ShareImageCard({ product, photo, innerRef }) {
  return (
    <div
      ref={innerRef}
      className="flex flex-col overflow-hidden border border-border bg-background"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      <div className="h-[232px] w-full shrink-0 overflow-hidden bg-muted">
        <Image src={photo} alt="" fittingType="fill" className="h-full w-full object-cover" />
      </div>

      <div className="flex flex-1 flex-col justify-between px-6 py-5">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {product.brand_name}
          </p>
          <p className="mt-2 font-display text-[22px] leading-[1.15]">{product.title}</p>
        </div>

        <div className="flex items-end justify-between">
          <span className="text-[13px]">{money(product.price)}</span>
          <span className="font-display text-[13px] tracking-tight">CEO/$</span>
        </div>
      </div>
    </div>
  );
}