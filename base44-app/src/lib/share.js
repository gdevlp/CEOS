import { money } from '@/lib/shop';

// A brand's own shares get their own traffic source, so the founder's analytics
// can tell a share apart from the marketplace or a plain direct link.
export const SHARE_SOURCE = 'share';

export const shareUrlFor = (product) =>
  `${window.location.origin}/product/${product.id}?src=${SHARE_SOURCE}`;

export const captionFor = (product, brandName) =>
  `New from ${brandName}: ${product.title}, ${money(product.price)}.\nNow live on CEO/$.`;

export const canShareNatively = () =>
  typeof navigator !== 'undefined' && typeof navigator.share === 'function';

// WhatsApp, text and email all take a pre-filled message through a URL.
// Instagram and TikTok do not — they have no browser share URL at all, so the
// phone's own share menu is the only way to reach them.
export const DIRECT_TARGETS = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    external: true,
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
  },
  {
    key: 'sms',
    label: 'Text',
    href: (url, text) => `sms:?&body=${encodeURIComponent(`${text}\n${url}`)}`,
  },
  {
    key: 'email',
    label: 'Email',
    href: (url, text) =>
      `mailto:?subject=${encodeURIComponent('New from my brand')}&body=${encodeURIComponent(
        `${text}\n\n${url}`
      )}`,
  },
];

export const APP_ONLY_TARGETS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
];

export async function shareNatively({ title, text, url }) {
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}

export async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export const slugify = (value) =>
  (value || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'product';

const setMeta = (attr, key, content) => {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

/**
 * Preview tags for a product page, written by the browser after load.
 *
 * This app is a single-page app with no server-side rendering, so there is no
 * way to serve a per-product preview image or title to a link preview. These
 * tags help search engines and Base44's crawler snapshot; chat apps that read
 * the raw page will still fall back to the app-wide image and title.
 */
export function applyProductMeta({ title, description, image, url }) {
  document.title = title;
  setMeta('name', 'description', description);
  setMeta('property', 'og:type', 'product');
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  if (image) setMeta('property', 'og:image', image);
}