'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { booksAPI, type Book } from '@/lib/api/books';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search,
  Edit, 
  Trash2,
  Eye,
  ArrowLeft,
  BookOpen,
  TrendingUp,
  Package,
  Star,
  BarChart3,
  Filter,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Remove interface as it's imported from API

const statusConfig = {
  ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active' },
  INACTIVE: { color: 'bg-yellow-100 text-yellow-800', label: 'Inactive' },
  OUT_OF_STOCK: { color: 'bg-red-100 text-red-800', label: 'Out of Stock' },
};

export default function BooksPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');

  // Redirect non-sellers
  useEffect(() => {
    if (user && user.role !== 'SELLER') {
      window.location.href = '/dashboard';
      return;
    }
  }, [user]);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const response = await booksAPI.getSellerBooks();
        setBooks(response.books || []);
      } catch (error) {
        console.error('Failed to fetch books:', error);
        toast.error('Failed to load books');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'SELLER') {
      fetchBooks();
    }
  }, [user]);

  // Filter and sort books
  useEffect(() => {
    let filtered = [...books];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.author?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(book => book.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        case 'sales':
          return (b.salesCount || 0) - (a.salesCount || 0);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredBooks(filtered);
  }, [books, searchQuery, statusFilter, sortBy]);

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await booksAPI.deleteBook(bookId);
        setBooks(prev => prev.filter(book => book._id !== bookId));
        toast.success('Book deleted successfully');
      } catch (error) {
        console.error('Failed to delete book:', error);
        toast.error('Failed to delete book');
      }
    }
  };

  const handleStatusChange = async (bookId: string, newStatus: Book['status']) => {
    try {
      await booksAPI.updateBook(bookId, { status: newStatus });
      setBooks(prev => prev.map(book => 
        book._id === bookId 
          ? { ...book, status: newStatus, updatedAt: new Date().toISOString() }
          : book
      ));
      toast.success(`Book ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Failed to update book status:', error);
      toast.error('Failed to update book status');
    }
  };

  // Stats calculation
  const stats = {
    totalBooks: books.length,
    publishedBooks: books.filter(b => b.status === 'ACTIVE').length,
    totalSales: books.reduce((sum, book) => sum + (book.salesCount || 0), 0),
    totalViews: books.reduce((sum, book) => sum + (book.views || 0), 0),
    averageRating: books.length > 0 
      ? books.filter(b => b.averageRating).reduce((sum, book) => sum + (book.averageRating || 0), 0) / books.filter(b => b.averageRating).length
      : 0,
    lowStockBooks: books.filter(b => b.stock <= 5 && b.status === 'ACTIVE').length
  };

  if (user?.role !== 'SELLER') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Books</h1>
          <p className="text-muted-foreground mt-1">
            Manage your book inventory and sales
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/books/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Book
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Books</p>
                <p className="text-xl font-bold">{stats.totalBooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-xl font-bold">{stats.totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-xl font-bold">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search books by title, author, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="price-high">Price High-Low</SelectItem>
                <SelectItem value="price-low">Price Low-High</SelectItem>
                <SelectItem value="sales">Most Sales</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Books List */}
      {filteredBooks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {books.length === 0 ? 'No books yet' : 'No books match your search'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {books.length === 0 
                ? 'Start building your book catalog by adding your first book.'
                : 'Try adjusting your search terms or filters to find what you\'re looking for.'
              }
            </p>
            <Button asChild>
              <Link href="/dashboard/books/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Book
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBooks.map((book) => (
            <Card key={book._id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Book Cover */}
                  <div className="flex-shrink-0 w-20 h-28 relative">
                    {book.thumbnail ? (
                      <Image
                        src={book.thumbnail}
                        alt={book.title}
                        fill
                        className="object-cover rounded"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center rounded">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{book.title}</h3>
                        <p className="text-muted-foreground">by {book.author?.name || 'Unknown Author'}</p>
                        {book.isbn && (
                          <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={statusConfig[book.status].color}>
                          {statusConfig[book.status].label}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                              <Link href={`/books/${book._id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/books/${book._id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {book.status === 'INACTIVE' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(book._id, 'ACTIVE')}>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {book.status === 'ACTIVE' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(book._id, 'INACTIVE')}>
                                <Package className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBook(book._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium">
                          {book.discountPrice ? (
                            <>
                              <span className="text-green-600">${book.discountPrice}</span>
                              <span className="text-sm text-muted-foreground line-through ml-2">
                                ${book.price}
                              </span>
                            </>
                          ) : (
                            `$${book.price}`
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Stock</p>
                        <p className={`font-medium ${book.stock <= 5 ? 'text-red-600' : ''}`}>
                          {book.stock} units
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Sales</p>
                        <p className="font-medium">{book.salesCount || 0}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Views</p>
                        <p className="font-medium">{(book.views || 0).toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <p className="font-medium">
                          {book.averageRating ? (
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-current text-yellow-400" />
                              {book.averageRating.toFixed(1)} ({book.totalReviews})
                            </span>
                          ) : (
                            'No ratings'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}