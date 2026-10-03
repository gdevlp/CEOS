/**
 * The setup checklist a founder works through once their brand is approved.
 * Steps without `manual` are marked done automatically from their real data;
 * manual steps are ticked by the founder and stored on the brand record.
 */
export const SETUP_STEPS = [
  {
    key: 'first_product',
    title: 'Add your first product',
    blurb: 'A name, a price and a photo is enough to go live.',
    cta: 'Add a product',
    to: () => '/founder/products',
    done: ({ products }) => products.length > 0,
  },
  {
    key: 'published_product',
    title: 'Publish a piece to the marketplace',
    blurb: 'Published products appear in the marketplace and on your storefront.',
    cta: 'Manage products',
    to: () => '/founder/products',
    done: ({ products }) => products.some((product) => product.status === 'published'),
  },
  {
    key: 'product_details',
    title: 'Add photos and a description',
    blurb: 'Shoppers decide from the photograph and the detail, so fill both in.',
    cta: 'Edit products',
    to: () => '/founder/products',
    done: ({ products }) =>
      products.some((product) => product.images?.length > 0 && product.description),
  },
  {
    key: 'storefront_customized',
    title: 'Make your storefront your own',
    blurb: 'Add your logo, banner, story and colours, then publish.',
    cta: 'Customise storefront',
    to: () => '/founder/storefront',
    done: ({ brand }) => Boolean(brand.storefront_published_at),
  },
  {
    key: 'storefront_check',
    title: 'See your storefront as a shopper',
    blurb: 'Check how your brand reads before you share the link.',
    cta: 'View storefront',
    to: ({ brand }) => `/brand/${brand.id}`,
    manual: true,
  },
  {
    key: 'orders_ready',
    title: 'Know where orders land',
    blurb: 'Orders arrive on your orders page — fulfil or cancel them from there.',
    cta: 'View orders',
    to: () => '/founder/orders',
    manual: true,
  },
];

export function setupProgress(brand, products) {
  const ticked = brand.setup_steps || [];
  const context = { brand, products: products || [] };
  const steps = SETUP_STEPS.map((step) => ({
    ...step,
    complete: step.manual ? ticked.includes(step.key) : step.done(context),
  }));
  return {
    steps,
    complete: steps.filter((step) => step.complete).length,
    total: steps.length,
  };
}