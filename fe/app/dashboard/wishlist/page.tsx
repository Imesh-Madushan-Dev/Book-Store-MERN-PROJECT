'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Star, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  BookOpen,
  ArrowLeft
} from 'lucide-react';

interface WishlistItem {
  id: string;
  title: string;
  author: string;
  price: number;
  discountPrice?: number;
  thumbnail?: string;
  averageRating?: number;
  totalReviews?: number;
  inStock: boolean;
  category: string;
}

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        // Mock data for wishlist
        const mockWishlist: WishlistItem[] = [
          {
            id: '1',
            title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
            author: 'Gang of Four',
            price: 54.99,
            discountPrice: 44.99,
            thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
            averageRating: 4.5,
            totalReviews: 128,
            inStock: true,
            category: 'Programming'
          },
          {
            id: '2',
            title: 'The Pragmatic Programmer: Your Journey to Mastery',
            author: 'David Thomas, Andrew Hunt',
            price: 39.99,
            thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
            averageRating: 4.8,
            totalReviews: 256,
            inStock: true,
            category: 'Programming'
          },
          {
            id: '3',
            title: 'Clean Architecture: A Craftsman\'s Guide to Software Structure',
            author: 'Robert C. Martin',
            price: 44.99,
            thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            averageRating: 4.6,
            totalReviews: 189,
            inStock: false,
            category: 'Architecture'
          },
          {
            id: '4',
            title: 'Algorithms: 4th Edition',
            author: 'Robert Sedgewick, Kevin Wayne',
            price: 89.99,
            discountPrice: 69.99,
            thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
            averageRating: 4.7,
            totalReviews: 342,
            inStock: true,
            category: 'Computer Science'
          }
        ];

        setWishlistItems(mockWishlist);
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = (bookId: string) => {
    setWishlistItems(items => items.filter(item => item.id !== bookId));
  };

  const addToCart = (bookId: string) => {
    // In a real app, this would add to cart
    console.log('Adding to cart:', bookId);
  };

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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground mt-1">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'book' : 'books'} saved
          </p>
        </div>
        <Button asChild>
          <Link href="/shop">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      {wishlistItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Discover amazing books and save them to your wishlist for easy access later.
            </p>
            <Button asChild>
              <Link href="/shop">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Browse Books
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((book) => (
            <Card key={book.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative">
                <Link href={`/books/${book.id}`}>
                  <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                    {book.thumbnail ? (
                      <Image
                        src={book.thumbnail}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {!book.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => removeFromWishlist(book.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <Link 
                      href={`/books/${book.id}`}
                      className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors"
                    >
                      {book.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {book.author}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {book.category}
                    </Badge>
                  </div>

                  {book.averageRating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span className="font-medium">{book.averageRating}</span>
                      <span className="text-muted-foreground">
                        ({book.totalReviews} reviews)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {book.discountPrice ? (
                      <>
                        <span className="font-semibold text-lg">${book.discountPrice}</span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${book.price}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          Save ${(book.price - book.discountPrice).toFixed(2)}
                        </Badge>
                      </>
                    ) : (
                      <span className="font-semibold text-lg">${book.price}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      disabled={!book.inStock}
                      onClick={() => addToCart(book.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {book.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromWishlist(book.id)}
                    >
                      <Heart className="h-4 w-4 fill-current text-red-500" />
                    </Button>
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