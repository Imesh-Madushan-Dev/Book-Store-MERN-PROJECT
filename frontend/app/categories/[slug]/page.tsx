'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { BookCard } from '@/components/book/book-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { booksAPI, type Book, type Category } from '@/lib/api/books';
import { categoriesAPI } from '@/lib/api/categories';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  // Fetch category and books
  useEffect(() => {
    const fetchCategoryAndBooks = async () => {
      setLoading(true);
      try {
        // First get the category by slug
        const categoryData = await categoriesAPI.getCategoryBySlug(slug);
        if (!categoryData) {
          notFound();
          return;
        }
        
        setCategory(categoryData);

        // Then fetch books for this category
        const booksResponse = await booksAPI.getBooks({
          category: categoryData._id,
          page: currentPage,
          limit: 12,
          sort: sortBy,
          order: sortOrder,
        });

        setBooks(booksResponse.books || []);
        setTotalPages(booksResponse.pagination?.totalPages || 1);
        setTotalBooks(booksResponse.pagination?.totalBooks || 0);
      } catch (error) {
        console.error('Error fetching category data:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryAndBooks();
    }
  }, [slug, currentPage, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        </div>
      </div>
    );
  }

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mt-2">{category.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {totalBooks} books found
          </p>
        </div>

        {/* Sort */}
        <Select 
          value={`${sortBy}-${sortOrder}`} 
          onValueChange={(value) => {
            const [field, order] = value.split('-');
            setSortBy(field);
            setSortOrder(order as 'asc' | 'desc');
            setCurrentPage(1);
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

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground mb-4">
            There are no books available in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}

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
  );
}