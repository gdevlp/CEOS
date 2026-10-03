/** The carriers a founder can pick when marking an order shipped. */
export const CARRIERS = [
  { key: 'usps', name: 'USPS', url: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=' },
  { key: 'ups', name: 'UPS', url: 'https://www.ups.com/track?tracknum=' },
  { key: 'fedex', name: 'FedEx', url: 'https://www.fedex.com/fedextrack/?trknbr=' },
  { key: 'dhl', name: 'DHL', url: 'https://www.dhl.com/global-en/home/tracking.html?tracking-id=' },
  { key: 'other', name: 'Other', url: '' },
];

export function carrierFor(key) {
  return CARRIERS.find((carrier) => carrier.key === key) || CARRIERS[CARRIERS.length - 1];
}

/**
 * The carrier's own tracking page for a number. Empty when we have no link for
 * that carrier — the number is still shown, just without a dead link.
 */
export function trackingUrl(carrierKey, number) {
  const carrier = carrierFor(carrierKey);
  if (!carrier.url || !number) return '';
  return `${carrier.url}${encodeURIComponent(number)}`;
}