'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Heart, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  ShoppingBag,
  Star,
  Eye,
  Plus,
  BookOpen,
  User,
  MapPin,
  Settings,
  HelpCircle,
  MessageCircle
} from 'lucide-react';

interface BuyerDashboardProps {
  user: User;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  items: Array<{
    id: string;
    book: {
      id: string;
      title: string;
      thumbnail?: string;
      author: string;
    };
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  trackingNumber?: string;
}

interface WishlistItem {
  id: string;
  title: string;
  author: string;
  price: number;
  thumbnail?: string;
  averageRating?: number;
  totalReviews?: number;
}

export function BuyerDashboard({ user }: BuyerDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    completedOrders: 0
  });

  // Fetch user data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real app, these would be API calls
        // For now, using mock data
        const mockOrders: Order[] = [
          {
            id: '1',
            orderNumber: 'ORD-2024-001',
            status: 'DELIVERED',
            totalAmount: 89.97,
            items: [
              {
                id: '1',
                book: {
                  id: '1',
                  title: 'The Psychology of Programming',
                  thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
                  author: 'Gerald M. Weinberg'
                },
                quantity: 1,
                price: 29.99
              },
              {
                id: '2',
                book: {
                  id: '2',
                  title: 'Clean Code',
                  thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
                  author: 'Robert C. Martin'
                },
                quantity: 2,
                price: 29.99
              }
            ],
            createdAt: '2024-01-15T10:30:00Z',
            trackingNumber: 'TRK123456789'
          },
          {
            id: '2',
            orderNumber: 'ORD-2024-002',
            status: 'SHIPPED',
            totalAmount: 45.98,
            items: [
              {
                id: '3',
                book: {
                  id: '3',
                  title: 'JavaScript: The Good Parts',
                  thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                  author: 'Douglas Crockford'
                },
                quantity: 1,
                price: 22.99
              }
            ],
            createdAt: '2024-01-20T14:15:00Z',
            trackingNumber: 'TRK987654321'
          }
        ];

        const mockWishlist: WishlistItem[] = [
          {
            id: '4',
            title: 'Design Patterns',
            author: 'Gang of Four',
            price: 54.99,
            thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
            averageRating: 4.5,
            totalReviews: 128
          },
          {
            id: '5',
            title: 'The Pragmatic Programmer',
            author: 'David Thomas',
            price: 39.99,
            thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
            averageRating: 4.8,
            totalReviews: 256
          }
        ];

        setOrders(mockOrders);
        setWishlistItems(mockWishlist);
        
        // Calculate stats
        const totalOrders = mockOrders.length;
        const totalSpent = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const completedOrders = mockOrders.filter(order => order.status === 'DELIVERED').length;
        const wishlistCount = mockWishlist.length;

        setStats({
          totalOrders,
          totalSpent,
          wishlistCount,
          completedOrders
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account
          </p>
        </div>
        <Button asChild>
          <Link href="/shop">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse Books
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedOrders} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wishlistCount}</div>
            <p className="text-xs text-muted-foreground">
              Books saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Member since {new Date(user.createdAt).getFullYear()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Orders
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                Start shopping to see your orders here
              </p>
              <Button asChild>
                <Link href="/shop">Browse Books</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {order.status === 'DELIVERED' ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : order.status === 'SHIPPED' ? (
                      <TrendingUp className="h-8 w-8 text-blue-500" />
                    ) : (
                      <Clock className="h-8 w-8 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{order.orderNumber}</p>
                      <Badge 
                        variant={
                          order.status === 'DELIVERED' 
                            ? 'default' 
                            : order.status === 'SHIPPED'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {order.status.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} items • ${order.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wishlist Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Wishlist
            <Link href="/dashboard/wishlist">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wishlistItems.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Save books you're interested in to your wishlist
              </p>
              <Button asChild>
                <Link href="/shop">Browse Books</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {wishlistItems.slice(0, 4).map((book) => (
                <div key={book.id} className="group space-y-3">
                  <Link href={`/books/${book.id}`}>
                    <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-muted">
                      {book.thumbnail ? (
                        <Image
                          src={book.thumbnail}
                          alt={book.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">
                      {book.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      by {book.author}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">${book.price}</p>
                      {book.averageRating && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          {book.averageRating}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/shop">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse New Books
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/orders">
                <Package className="mr-2 h-4 w-4" />
                Track Orders
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/wishlist">
                <Heart className="mr-2 h-4 w-4" />
                View Wishlist
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/addresses">
                <MapPin className="mr-2 h-4 w-4" />
                Manage Addresses
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/help">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help Center
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/contact">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/feedback">
                <Star className="mr-2 h-4 w-4" />
                Leave Feedback
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}