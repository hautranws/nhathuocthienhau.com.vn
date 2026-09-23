export interface SearchableProduct {
  title?: string | null;
  category?: string | null;
  specification?: string | null;
}

export function normalizeSearchText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSearchScore(product: SearchableProduct, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedTitle = normalizeSearchText(product.title);
  const normalizedCategory = normalizeSearchText(product.category);
  const normalizedSpecification = normalizeSearchText(product.specification);
  const words = normalizedQuery.split(" ").filter(Boolean);

  if (!normalizedQuery || !normalizedTitle) return 0;

  const titleWords = normalizedTitle.split(" ");
  const allTitleWordsMatch = words.every((word) => normalizedTitle.includes(word));
  const exactPhrase = normalizedTitle.includes(normalizedQuery);
  const titleStartsWithQuery = normalizedTitle.startsWith(normalizedQuery);
  const titleWordStartsWithQuery = titleWords.some((word) => word.startsWith(normalizedQuery));
  const matchedTitleWords = words.filter((word) => normalizedTitle.includes(word)).length;
  const categoryMatch = words.filter((word) => normalizedCategory.includes(word)).length;
  const specificationMatch = words.filter((word) => normalizedSpecification.includes(word)).length;

  return (
    (exactPhrase ? 10000 : 0) +
    (allTitleWordsMatch ? 5000 : 0) +
    (titleStartsWithQuery ? 2500 : 0) +
    (titleWordStartsWithQuery ? 1000 : 0) +
    matchedTitleWords * 500 +
    categoryMatch * 100 +
    specificationMatch * 50
  );
}

export function sortSearchResults<T extends SearchableProduct>(products: T[], query: string) {
  return [...products].sort((firstProduct, secondProduct) => {
    const scoreDifference =
      getSearchScore(secondProduct, query) - getSearchScore(firstProduct, query);

    if (scoreDifference !== 0) return scoreDifference;
    return String(firstProduct.title ?? "").localeCompare(
      String(secondProduct.title ?? ""),
      "vi",
      { sensitivity: "base" },
    );
  });
}

export function buildSearchOrFilter(query: string) {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (word) =>
        `title.ilike.%${word}%,category.ilike.%${word}%,specification.ilike.%${word}%`,
    )
    .join(",");
}
