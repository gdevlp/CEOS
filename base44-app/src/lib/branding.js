export const CATEGORIES = [
  'Womenswear',
  'Menswear',
  'Unisex',
  'Streetwear',
  'Tailoring',
  'Knitwear',
  'Denim',
  'Activewear',
  'Swimwear',
  'Lingerie',
  'Footwear',
  'Accessories',
  'Jewelry',
  'Kidswear',
  'Vintage',
  'Sustainable',
];

export const STATUS_META = {
  submitted: {
    label: 'Submitted',
    tone: 'bg-amber-100 text-amber-900 border-amber-200',
    blurb: 'Your application is with us. We review every brand by hand.',
  },
  in_review: {
    label: 'In review',
    tone: 'bg-sky-100 text-sky-900 border-sky-200',
    blurb: 'Our team is looking at your brand right now.',
  },
  approved: {
    label: 'Approved',
    tone: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    blurb: 'You are in. Your brand can now go live on CEO/$.',
  },
  declined: {
    label: 'Declined',
    tone: 'bg-rose-100 text-rose-900 border-rose-200',
    blurb: 'This application was not approved this time.',
  },
};

export const STATUS_ORDER = ['submitted', 'in_review', 'approved', 'declined'];

export function statusMeta(status) {
  return STATUS_META[status] || STATUS_META.submitted;
}

export function fmtDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function socialUrl(kind, handle) {
  if (!handle) return null;
  const trimmed = handle.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const clean = trimmed.replace(/^@/, '');
  if (kind === 'instagram') return `https://instagram.com/${clean}`;
  if (kind === 'tiktok') return `https://tiktok.com/@${clean}`;
  return `https://${clean}`;
}