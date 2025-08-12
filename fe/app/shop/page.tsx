'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { BookCard } from '@/components/book/book-card';
import { getMockBooks, mockCategories, mockAuthors } from '@/lib/mock-data';
import { Book, BookFilters, SortOptions } from '@/lib/types';

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<BookFilters>({});
  const [sortBy, setSortBy] = useState<SortOptions>({ field: 'title', order: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const allBooks = getMockBooks();
  const itemsPerPage = 12;

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let books = [...allBooks];

    // Search filter
    if (searchQuery) {
      books = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category) {
      books = books.filter(book => book.category?.slug === filters.category);
    }

    // Author filter
    if (filters.author) {
      books = books.filter(book => book.authorId === filters.author);
    }

    // Price filters
    if (filters.minPrice !== undefined) {
      books = books.filter(book => book.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      books = books.filter(book => book.price <= filters.maxPrice!);
    }

    // Format filter
    if (filters.format) {
      books = books.filter(book => book.format === filters.format);
    }

    // Rating filter
    if (filters.rating) {
      books = books.filter(book => book.rating! >= filters.rating!);
    }

    // In stock filter
    if (filters.inStock) {
      books = books.filter(book => book.stock > 0);
    }

    // Sort books
    books.sort((a, b) => {
      const aValue = a[sortBy.field];
      const bValue = b[sortBy.field];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortBy.order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortBy.order === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });

    return books;
  }, [allBooks, searchQuery, filters, sortBy]);

  // Paginate books
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBooks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBooks, currentPage]);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key as keyof BookFilters] !== undefined && 
    filters[key as keyof BookFilters] !== ''
  ).length;

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
              filters={filters} 
              setFilters={setFilters}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">All Books</h1>
              <p className="text-muted-foreground mt-1">
                {filteredBooks.length} books found
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
                      filters={filters} 
                      setFilters={setFilters}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select 
                value={`${sortBy.field}-${sortBy.order}`} 
                onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy({ field: field as any, order: order as 'asc' | 'desc' });
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
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                  <SelectItem value="publishedYear-desc">Newest First</SelectItem>
                  <SelectItem value="publishedYear-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                
                let displayValue = value;
                if (key === 'category') {
                  const category = mockCategories.find(c => c.slug === value);
                  displayValue = category?.name || value;
                } else if (key === 'author') {
                  const author = mockAuthors.find(a => a._id === value);
                  displayValue = author?.name || value;
                }

                return (
                  <Badge key={key} variant="secondary" className="cursor-pointer">
                    {key}: {displayValue.toString()}
                    <button
                      className="ml-2 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, [key]: undefined }));
                        setCurrentPage(1);
                      }}
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
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
  filters: BookFilters;
  setFilters: (filters: BookFilters | ((prev: BookFilters) => BookFilters)) => void;
  setCurrentPage: (page: number) => void;
}

function FilterSection({ filters, setFilters, setCurrentPage }: FilterSectionProps) {
  const updateFilter = (key: keyof BookFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <Label className="text-sm font-medium">Category</Label>
        <Select 
          value={filters.category || ""} 
          onValueChange={(value) => updateFilter('category', value || undefined)}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {mockCategories.map((category) => (
              <SelectItem key={category._id} value={category.slug}>
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
          value={filters.author || ""} 
          onValueChange={(value) => updateFilter('author', value || undefined)}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="All Authors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Authors</SelectItem>
            {mockAuthors.map((author) => (
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
              value={filters.minPrice || ''}
              onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>
      </div>

      {/* Format Filter */}
      <div>
        <Label className="text-sm font-medium">Format</Label>
        <Select 
          value={filters.format || ""} 
          onValueChange={(value) => updateFilter('format', value || undefined)}
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
          value={filters.rating?.toString() || ""} 
          onValueChange={(value) => updateFilter('rating', value ? Number(value) : undefined)}
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