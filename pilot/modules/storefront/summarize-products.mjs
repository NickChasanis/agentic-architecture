export function summarizeProducts(products) {
  if (products.length === 0) {
    return {count: 0, minPrice: null, maxPrice: null, currency: 'EUR'};
  }

  const prices = products.map((product) => product.price.amountMinor);
  return {
    count: products.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    currency: 'EUR'
  };
}
