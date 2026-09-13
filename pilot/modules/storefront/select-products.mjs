function validateBound(value, name) {
  if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > 100000000)) {
    throw new RangeError(`${name} must be an integer in [0,100000000]`);
  }
}

export function selectProducts(products, options = {}) {
  const {query, minPrice, maxPrice} = options;
  validateBound(minPrice, 'minPrice');
  validateBound(maxPrice, 'maxPrice');
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new RangeError('minPrice must not exceed maxPrice');
  }

  const titleQuery = query === undefined ? undefined : query.trim().toLowerCase();
  return products.filter((product) => {
    const amount = product.price.amountMinor;
    return (titleQuery === undefined || product.title.toLowerCase().includes(titleQuery))
      && (minPrice === undefined || amount >= minPrice)
      && (maxPrice === undefined || amount <= maxPrice);
  });
}
