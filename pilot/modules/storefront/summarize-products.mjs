export function summarizeProducts(products) {
  if (products.length === 0) {
    return {count: 0, minPrice: null, maxPrice: null, currency: 'EUR'};
  }

  let minPrice = Infinity;
  let maxPrice = -Infinity;
  for (const product of products) {
    minPrice = Math.min(minPrice, product.price.amountMinor);
    maxPrice = Math.max(maxPrice, product.price.amountMinor);
  }
  return {
    count: products.length,
    minPrice,
    maxPrice,
    currency: 'EUR'
  };
}
