/**
 * Colourways are the variants inside a single product.
 *
 * A product's colours live in `colorways`. Pieces created before colourways
 * existed have no such field, so they are read as one unnamed colour built from
 * the product's own photos and sizes — nothing needs migrating, and a product
 * stays one "live piece" however many colours or sizes sit inside it.
 */

export const blankColorway = () => ({ name: '', swatch: '', images: [], sizes: [] });

/** A product's colours, with single-colour pieces normalised to one entry. */
export function productColorways(product) {
  const list = (product?.colorways || []).filter((color) => color?.name);
  if (list.length) return list;

  return [
    {
      name: '',
      swatch: '',
      images: (product?.images || []).filter(Boolean),
      sizes: (product?.sizes || []).filter(Boolean).map((label) => ({ label, stock: null })),
    },
  ];
}

/** True once the founder has named colours — until then there is no picker. */
export const productHasColors = (product) =>
  (product?.colorways || []).some((color) => color?.name);

/** Photos for a colour, falling back to the product's own photos. */
export function colorwayImages(product, colorway) {
  const images = (colorway?.images || []).filter(Boolean);
  return images.length ? images : (product?.images || []).filter(Boolean);
}

/** A size is buyable unless a stock count says otherwise — older pieces carry none. */
export const sizeInStock = (size) => size?.stock == null || size.stock > 0;

/** A colour is buyable while at least one of its sizes is. */
export function colorwayInStock(colorway) {
  const sizes = colorway?.sizes || [];
  return sizes.length === 0 || sizes.some(sizeInStock);
}

/** "Black · Size M" — the chosen colour and size for one line. */
export function variantLabel(item) {
  return [item?.color, item?.size ? `Size ${item.size}` : ''].filter(Boolean).join(' · ');
}

/** "Black · Size M · Qty 2" — the line plus how many. */
export function lineLabel(item) {
  return [variantLabel(item), `Qty ${item?.quantity ?? 1}`].filter(Boolean).join(' · ');
}