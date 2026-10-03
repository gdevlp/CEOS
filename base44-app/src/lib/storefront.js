/**
 * The curated storefront options.
 *
 * Founders choose from these lists and nothing else — no free colour picker, no
 * custom CSS. That is what keeps every store on the same spacing and type scale,
 * so one weak design can never make the marketplace look cheap.
 */

import { SHIPPING_DEFAULTS } from '@/lib/shop';

export const ACCENTS = [
  { key: 'ink', name: 'Ink', hex: '#111111', hsl: '0 0% 7%' },
  { key: 'clay', name: 'Clay', hex: '#A8674A', hsl: '17 38% 47%' },
  { key: 'olive', name: 'Olive', hex: '#5A6B4F', hsl: '95 15% 36%' },
  { key: 'cobalt', name: 'Cobalt', hex: '#2B4A8B', hsl: '221 53% 36%' },
  { key: 'rose', name: 'Rose', hex: '#A85764', hsl: '350 31% 50%' },
  { key: 'sand', name: 'Sand', hex: '#B79A6B', hsl: '37 34% 57%' },
];

export const FONT_PAIRS = [
  {
    key: 'editorial',
    name: 'Editorial',
    blurb: 'High-contrast serif headings',
    display: "'Bodoni Moda', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
  },
  {
    key: 'classic',
    name: 'Classic',
    blurb: 'Soft literary serif headings',
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
  },
  {
    key: 'modern',
    name: 'Modern',
    blurb: 'One neutral sans throughout',
    display: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
  },
  {
    key: 'grotesk',
    name: 'Grotesk',
    blurb: 'Bold contemporary sans headings',
    display: "'Archivo', 'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
  },
];

export const GRID_LAYOUTS = [
  {
    key: 'three',
    name: 'Three columns',
    blurb: 'A denser, browsing-first catalogue',
    className: 'grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3',
  },
  {
    key: 'two',
    name: 'Two columns',
    blurb: 'Larger images with more room per piece',
    className: 'grid gap-x-8 gap-y-16 sm:grid-cols-2',
  },
];

export const BANNER_STYLES = [
  { key: 'full', name: 'Full bleed', blurb: 'A wide image with your name over it' },
  { key: 'split', name: 'Split', blurb: 'Image beside your name' },
  { key: 'minimal', name: 'Type only', blurb: 'No banner image, just your name' },
];

export const MAX_FEATURED = 4;

export const DEFAULT_STOREFRONT = {
  logo_url: '',
  banner_url: '',
  story: '',
  announcement: '',
  accent: 'ink',
  font_pair: 'editorial',
  grid_layout: 'three',
  banner_style: 'full',
  featured_product_ids: [],
  founder_photo_url: '',
  founder_message: '',
  shipping_policy: '',
  return_policy: '',
  ...SHIPPING_DEFAULTS,
};

export function findOption(list, key, fallback) {
  return list.find((option) => option.key === key) || list.find((option) => option.key === fallback) || list[0];
}

/**
 * Turns a brand record into the CSS custom properties its storefront renders
 * with. Overriding the tokens — rather than writing colours and fonts into the
 * markup — is what keeps a customised store on the same design system.
 */
export function storefrontTheme(brand) {
  const accent = findOption(ACCENTS, brand?.accent, 'ink');
  const fontPair = findOption(FONT_PAIRS, brand?.font_pair, 'editorial');
  const grid = findOption(GRID_LAYOUTS, brand?.grid_layout, 'three');
  const banner = findOption(BANNER_STYLES, brand?.banner_style, 'full');

  return {
    accent,
    fontPair,
    grid,
    banner,
    style: {
      '--accent': accent.hsl,
      '--brand': accent.hsl,
      '--font-display': fontPair.display,
      '--font-body': fontPair.body,
    },
  };
}

/** Featured pieces first, in the founder's chosen order; the rest by recency. */
export function orderProducts(products, featuredIds = []) {
  const ids = featuredIds || [];
  const featured = ids.map((id) => products.find((item) => item.id === id)).filter(Boolean);
  const rest = products.filter((item) => !ids.includes(item.id));
  return { featured, rest };
}

/* ---------- Image rules ---------- */

export const IMAGE_RULES = {
  logo: { label: 'Logo', minWidth: 200, minHeight: 200, box: 'h-24 w-24', note: 'Square works best.' },
  banner: { label: 'Banner', minWidth: 1600, minHeight: 600, box: 'aspect-[16/6] w-full', note: 'Wide works best.' },
  founder: { label: 'Founder photo', minWidth: 400, minHeight: 400, box: 'h-28 w-28', note: 'Square works best.' },
};

export function readImageSize(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file could not be read as an image.'));
    };
    image.src = url;
  });
}

/**
 * Rejects anything too small to look sharp at full size — a stretched or
 * pixelated banner is exactly what makes a marketplace look cheap.
 */
export async function checkImage(file, kind) {
  const rule = IMAGE_RULES[kind];
  const { width, height } = await readImageSize(file);
  if (width < rule.minWidth || height < rule.minHeight) {
    return {
      ok: false,
      message: `${rule.label} images need to be at least ${rule.minWidth}×${rule.minHeight}px. That one is ${width}×${height}px.`,
    };
  }
  return { ok: true };
}