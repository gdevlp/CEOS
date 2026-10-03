import React from 'react';
import { carrierFor, trackingUrl } from '@/lib/tracking';

/** The carrier and tracking number, linked to the carrier's own tracking page. */
export default function TrackingLine({ order, className = '' }) {
  if (!order?.tracking_number) return null;

  const carrier = carrierFor(order.carrier);
  const url = order.tracking_url || trackingUrl(order.carrier, order.tracking_number);

  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {carrier.name} ·{' '}
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline underline-offset-4"
        >
          {order.tracking_number}
        </a>
      ) : (
        <span className="text-foreground">{order.tracking_number}</span>
      )}
    </p>
  );
}