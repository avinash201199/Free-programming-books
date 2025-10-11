import { books as allBooks, type Book } from "@/data/books";

export type SortOption = "relevance" | "title" | "category" | "year";

export interface SearchFilters {
  category?: string;
  language?: string;
  level?: string;
}

export interface SearchResult {
  book: Book;
  score: number;
}

function normalize(text: string): string {
  return text.toLowerCase();
}

function fieldMatchScore(queryTokens: string[], fieldValue: string, weight: number): number {
  if (!fieldValue) return 0;
  const value = normalize(fieldValue);
  let score = 0;
  for (const token of queryTokens) {
    if (!token) continue;
    if (value === token) score += weight * 4; // exact
    else if (value.startsWith(token)) score += weight * 3; // prefix
    else if (value.includes(token)) score += weight; // substring
  }
  return score;
}

export function searchBooks(
  query: string,
  sourceBooks: Book[] = allBooks,
  filters: SearchFilters = {},
  sortBy: SortOption = "relevance",
): SearchResult[] {
  const q = normalize(query.trim());
  const tokens = q.split(/\s+/).filter(Boolean);

  const matchesFilters = (book: Book) => {
    if (filters.category && filters.category !== "all" && book.category !== filters.category) return false;
    if (filters.language && filters.language !== "all" && book.language !== filters.language) return false;
    if (filters.level && filters.level !== "all" && book.level !== filters.level) return false;
    return true;
  };

  const results: SearchResult[] = sourceBooks
    .filter(matchesFilters)
    .map((book) => {
      if (tokens.length === 0) {
        return { book, score: 0 };
      }

      let score = 0;
      score += fieldMatchScore(tokens, book.title, 5);
      score += fieldMatchScore(tokens, book.author, 3);
      score += fieldMatchScore(tokens, book.description, 2);
      score += fieldMatchScore(tokens, book.category, 1.5);
      score += fieldMatchScore(tokens, book.language, 1);
      score += book.tags?.reduce((acc, tag) => acc + fieldMatchScore(tokens, tag, 3), 0) ?? 0;

      // small bonus for featured books
      if (book.featured) score += 1;

      return { book, score };
    })
    .filter((r) => tokens.length === 0 ? true : r.score > 0);

  switch (sortBy) {
    case "title":
      results.sort((a, b) => a.book.title.localeCompare(b.book.title));
      break;
    case "category":
      results.sort((a, b) => a.book.category.localeCompare(b.book.category) || a.book.title.localeCompare(b.book.title));
      break;
    case "year":
      results.sort((a, b) => (b.book.year ?? 0) - (a.book.year ?? 0));
      break;
    case "relevance":
    default:
      results.sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title));
  }

  return results;
}


