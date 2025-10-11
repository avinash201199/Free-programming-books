import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BookCard from "@/components/BookCard";
import { books, categories, languages, levels } from "@/data/books";
import { searchBooks, type SortOption } from "@/lib/search";

function useQueryParam(name: string): string {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search).get(name) ?? "", [search, name]);
}

const Search = () => {
  const navigate = useNavigate();
  const initialQ = useQueryParam("q");
  const initialCategory = useQueryParam("category") || "all";
  const initialLanguage = useQueryParam("language") || "all";
  const initialLevel = useQueryParam("level") || "all";
  const initialSort = (useQueryParam("sort") || "relevance") as SortOption;

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [language, setLanguage] = useState(initialLanguage);
  const [level, setLevel] = useState(initialLevel);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [showFilters, setShowFilters] = useState(false);

  // Keep URL in sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category && category !== "all") params.set("category", category);
    if (language && language !== "all") params.set("language", language);
    if (level && level !== "all") params.set("level", level);
    if (sort && sort !== "relevance") params.set("sort", sort);
    navigate({ pathname: "/search", search: params.toString() }, { replace: true });
  }, [q, category, language, level, sort, navigate]);

  const results = useMemo(() => {
    return searchBooks(q, books, { category, language, level }, sort);
  }, [q, category, language, level, sort]);

  const clearAll = () => {
    setQ("");
    setCategory("all");
    setLanguage("all");
    setLevel("all");
    setSort("relevance");
  };

  const hasActiveFilters = category !== "all" || language !== "all" || level !== "all" || q !== "" || sort !== "relevance";

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold">Search</h1>
          <p className="text-muted-foreground">Find books by title, author, tags, description, category, or language.</p>
        </div>

        <Card className="p-6 mb-8 border-2">
          <div className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search books..."
                className="pl-10 h-12 text-base"
              />
            </div>

            <div className="flex items-center justify-between md:hidden">
              <Button variant="outline" className="w-full" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="outline" className="w-full" onClick={clearAll}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 pt-2">
                {q && <Badge variant="secondary" className="px-3 py-1">Search: "{q}"</Badge>}
                {category !== "all" && <Badge variant="secondary" className="px-3 py-1">Category: {category}</Badge>}
                {language !== "all" && <Badge variant="secondary" className="px-3 py-1">Language: {language}</Badge>}
                {level !== "all" && <Badge variant="secondary" className="px-3 py-1">Level: {level}</Badge>}
                {sort !== "relevance" && <Badge variant="secondary" className="px-3 py-1">Sort: {sort}</Badge>}
              </div>
            )}
          </div>
        </Card>

        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{results.length}</span> results
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {results.map((r) => (
              <BookCard key={r.book.id} book={r.book} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results</h3>
            <p className="text-muted-foreground mb-4">Try different keywords or clear filters</p>
            <Button onClick={clearAll} variant="outline">Clear All</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Search;


