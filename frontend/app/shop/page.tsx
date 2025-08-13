'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { BookCard } from '@/components/book/book-card';
import { booksAPI, type Book, type BookFilters, type Category, type Author } from '@/lib/api/books';
import { categoriesAPI } from '@/lib/api/categories';
import { authorsAPI } from '@/lib/api/authors';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [format, setFormat] = useState('');
  const [rating, setRating] = useState<number | undefined>();
  const [featured, setFeatured] = useState(false);
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  // Initialize from URL params
  useEffect(() => {
    if (searchParams.get('featured') === 'true') {
      setFeatured(true);
    }
    if (searchParams.get('category')) {
      setCategoryFilter(searchParams.get('category') || '');
    }
  }, [searchParams]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesData, authorsData] = await Promise.all([
          categoriesAPI.getCategories(),
          authorsAPI.getAuthors()
        ]);

        setCategories(categoriesData.categories || []);
        setAuthors(authorsData.authors || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch books when filters change
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const filters: BookFilters = {
          page: currentPage,
          limit: 12,
          sort: sortBy,
          order: sortOrder,
        };

        if (searchQuery.trim()) filters.search = searchQuery.trim();
        if (categoryFilter) filters.category = categoryFilter;
        if (authorFilter) filters.author = authorFilter;
        if (minPrice !== undefined) filters.minPrice = minPrice;
        if (maxPrice !== undefined) filters.maxPrice = maxPrice;
        if (format) filters.format = format;
        if (rating !== undefined) filters.rating = rating;
        if (featured) filters.featured = true;

        const response = await booksAPI.getBooks(filters);
        
        setBooks(response.books || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalBooks(response.pagination?.totalBooks || 0);
      } catch (error) {
        console.error('Error fetching books:', error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery, categoryFilter, authorFilter, sortBy, sortOrder, currentPage, minPrice, maxPrice, format, rating, featured]);

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setAuthorFilter('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setFormat('');
    setRating(undefined);
    setFeatured(false);
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    categoryFilter,
    authorFilter,
    minPrice,
    maxPrice,
    format,
    rating,
    featured ? 'featured' : ''
  ].filter(filter => filter !== undefined && filter !== '').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters - Desktop Sidebar */}
        <div className="hidden lg:block lg:w-64 space-y-6">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>

            <FilterSection 
              categories={categories}
              authors={authors}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              authorFilter={authorFilter}
              setAuthorFilter={setAuthorFilter}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              format={format}
              setFormat={setFormat}
              rating={rating}
              setRating={setRating}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                {featured ? 'Featured Books' : 'All Books'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {loading ? 'Loading...' : `${totalBooks} books found`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search books, authors..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSection 
                      categories={categories}
                      authors={authors}
                      categoryFilter={categoryFilter}
                      setCategoryFilter={setCategoryFilter}
                      authorFilter={authorFilter}
                      setAuthorFilter={setAuthorFilter}
                      minPrice={minPrice}
                      setMinPrice={setMinPrice}
                      maxPrice={maxPrice}
                      setMaxPrice={setMaxPrice}
                      format={format}
                      setFormat={setFormat}
                      rating={rating}
                      setRating={setRating}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select 
                value={`${sortBy}-${sortOrder}`} 
                onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="price-asc">Price Low to High</SelectItem>
                  <SelectItem value="price-desc">Price High to Low</SelectItem>
                  <SelectItem value="publishedYear-desc">Newest First</SelectItem>
                  <SelectItem value="publishedYear-asc">Oldest First</SelectItem>
                  <SelectItem value="salesCount-desc">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {categoryFilter && (
                <Badge variant="secondary" className="cursor-pointer">
                  Category: {categories.find(c => c._id === categoryFilter)?.name || categoryFilter}
                  <button
                    className="ml-2 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    onClick={() => {
                      setCategoryFilter('');
                      setCurrentPage(1);
                    }}
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {authorFilter && (
                <Badge variant="secondary" className="cursor-pointer">
                  Author: {authors.find(a => a._id === authorFilter)?.name || authorFilter}
                  <button
                    className="ml-2 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    onClick={() => {
                      setAuthorFilter('');
                      setCurrentPage(1);
                    }}
                  >
                    ×
                  </button>
                </Badge>
              )}

              {(minPrice !== undefined || maxPrice !== undefined) && (
                <Badge variant="secondary" className="cursor-pointer">
                  Price: ${minPrice || 0} - ${maxPrice || '∞'}
                  <button
                    className="ml-2 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    onClick={() => {
                      setMinPrice(undefined);
                      setMaxPrice(undefined);
                      setCurrentPage(1);
                    }}
                  >
                    ×
                  </button>
                </Badge>
              )}

              {format && (
                <Badge variant="secondary" className="cursor-pointer">
                  Format: {format}
                  <button
                    className="ml-2 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    onClick={() => {
                      setFormat('');
                      setCurrentPage(1);
                    }}
                  >
                    ×
                  </button>
                </Badge>
              )}

              {rating !== undefined && (
                <Badge variant="secondary" className="cursor-pointer">
                  Rating: {rating}+ Stars
                  <button
                    className="ml-2 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    onClick={() => {
                      setRating(undefined);
                      setCurrentPage(1);
                    }}
                  >
                    ×
                  </button>
                </Badge>
              )}

              {featured && (
                <Badge variant="secondary" className="cursor-pointer">
                  Featured
                  <button
                    className="ml-2 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    onClick={() => {
                      setFeatured(false);
                      setCurrentPage(1);
                    }}
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Books Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : 
                    currentPage >= totalPages - 2 ? totalPages - 4 + i :
                    currentPage - 2 + i;
                  
                  if (page < 1 || page > totalPages) return null;
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  categories: Category[];
  authors: Author[];
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  authorFilter: string;
  setAuthorFilter: (value: string) => void;
  minPrice: number | undefined;
  setMinPrice: (value: number | undefined) => void;
  maxPrice: number | undefined;
  setMaxPrice: (value: number | undefined) => void;
  format: string;
  setFormat: (value: string) => void;
  rating: number | undefined;
  setRating: (value: number | undefined) => void;
  setCurrentPage: (page: number) => void;
}

function FilterSection({
  categories,
  authors,
  categoryFilter,
  setCategoryFilter,
  authorFilter,
  setAuthorFilter,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  format,
  setFormat,
  rating,
  setRating,
  setCurrentPage
}: FilterSectionProps) {
  const updateFilter = (callback: () => void) => {
    callback();
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <Label className="text-sm font-medium">Category</Label>
        <Select 
          value={categoryFilter} 
          onValueChange={(value) => updateFilter(() => setCategoryFilter(value))}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Author Filter */}
      <div>
        <Label className="text-sm font-medium">Author</Label>
        <Select 
          value={authorFilter} 
          onValueChange={(value) => updateFilter(() => setAuthorFilter(value))}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="All Authors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Authors</SelectItem>
            {authors.map((author) => (
              <SelectItem key={author._id} value={author._id}>
                {author.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <Input
              type="number"
              placeholder="Min"
              value={minPrice || ''}
              onChange={(e) => updateFilter(() => 
                setMinPrice(e.target.value ? Number(e.target.value) : undefined)
              )}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice || ''}
              onChange={(e) => updateFilter(() => 
                setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
              )}
            />
          </div>
        </div>
      </div>

      {/* Format Filter */}
      <div>
        <Label className="text-sm font-medium">Format</Label>
        <Select 
          value={format} 
          onValueChange={(value) => updateFilter(() => setFormat(value))}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="All Formats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Formats</SelectItem>
            <SelectItem value="HARDCOVER">Hardcover</SelectItem>
            <SelectItem value="PAPERBACK">Paperback</SelectItem>
            <SelectItem value="EBOOK">eBook</SelectItem>
            <SelectItem value="AUDIOBOOK">Audiobook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rating Filter */}
      <div>
        <Label className="text-sm font-medium">Minimum Rating</Label>
        <Select 
          value={rating?.toString() || ''} 
          onValueChange={(value) => updateFilter(() => 
            setRating(value ? Number(value) : undefined)
          )}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Any Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Rating</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
            <SelectItem value="1">1+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}