const MIN_PRICE = 0;
const MAX_PRICE = 100000000;

function validateBound(value) {
  if (value === undefined) return;
  if (!Number.isInteger(value) || value < MIN_PRICE || value > MAX_PRICE) {
    throw new RangeError('price bounds must be integer minor units in range');
  }
}

export function selectProducts(products, options = {}) {
  const {query, minPrice, maxPrice} = options;
  validateBound(minPrice);
  validateBound(maxPrice);
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new RangeError('minPrice must not exceed maxPrice');
  }

  const normalizedQuery = query === undefined ? undefined : query.trim().toLowerCase();
  return products.filter((product) => {
    if (normalizedQuery !== undefined && !product.title.toLowerCase().includes(normalizedQuery)) return false;
    const amount = product.price.amountMinor;
    if (minPrice !== undefined && amount < minPrice) return false;
    if (maxPrice !== undefined && amount > maxPrice) return false;
    return true;
  });
}
