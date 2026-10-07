import type { Category, CategoryId, Product } from "@/types";

/** Folds common Arabic spelling variants so "بيتزا/البيتزا" and "ة/ه" match. */
export function normalizeArabic(text: string) {
  return text
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "") // diacritics + tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenVariants(token: string) {
  // "البرغر" should match "برغر"; also "وبطاطا" → "بطاطا".
  const variants = [token];
  if (token.length > 3 && token.startsWith("ال")) variants.push(token.slice(2));
  if (token.length > 4 && token.startsWith("وال")) variants.push(token.slice(3));
  if (token.length > 3 && token.startsWith("و")) variants.push(token.slice(1));
  return variants;
}

interface Indexed {
  product: Product;
  name: string;
  keywords: string;
  category: string;
  body: string;
}

function index(product: Product, categoryName: string): Indexed {
  return {
    product,
    name: normalizeArabic(product.name),
    keywords: normalizeArabic((product.keywords ?? []).join(" ")),
    category: normalizeArabic(categoryName),
    body: normalizeArabic([product.description, ...(product.ingredients ?? [])].join(" ")),
  };
}

/**
 * Every query word must match the name, keywords, category or description.
 * Results are ranked: name > keywords > category > description.
 */
export function searchProducts(products: Product[], categories: Map<CategoryId, Category>, query: string) {
  const tokens = normalizeArabic(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return [];

  const scored: { product: Product; score: number }[] = [];
  for (const product of products) {
    const doc = index(product, categories.get(product.categoryId)?.name ?? "");
    let score = 0;
    let matchedAll = true;
    for (const token of tokens) {
      const variants = tokenVariants(token);
      const hit = (field: string) => variants.some((v) => field.includes(v));
      if (variants.some((v) => doc.name.startsWith(v))) score += 12;
      else if (hit(doc.name)) score += 8;
      else if (hit(doc.keywords)) score += 5;
      else if (hit(doc.category)) score += 4;
      else if (hit(doc.body)) score += 2;
      else {
        matchedAll = false;
        break;
      }
    }
    if (matchedAll) scored.push({ product, score: score + (product.available ? 1 : 0) });
  }
  return scored.sort((a, b) => b.score - a.score).map((entry) => entry.product);
}
