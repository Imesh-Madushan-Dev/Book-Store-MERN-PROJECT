'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Users,
  Plus,
  Eye,
  Edit,
  BarChart3,
  BookOpen,
  Star,
  ShoppingCart,
  Clock,
  CheckCircle,
  User,
  HelpCircle
} from 'lucide-react';

interface SellerDashboardProps {
  user: User;
}

interface BookStats {
  id: string;
  title: string;
  thumbnail?: string;
  price: number;
  stock: number;
  views: number;
  sales: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  averageRating?: number;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  bookTitle: string;
  quantity: number;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED';
  orderDate: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalBooks: number;
  totalOrders: number;
  totalCustomers: number;
  monthlyRevenue: number;
  monthlyOrders: number;
}

export function SellerDashboard({ user }: SellerDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalBooks: 0,
    totalOrders: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    monthlyOrders: 0
  });
  const [recentBooks, setRecentBooks] = useState<BookStats[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch seller dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Mock data for seller dashboard
        const mockStats: DashboardStats = {
          totalRevenue: 12547.89,
          totalBooks: 24,
          totalOrders: 156,
          totalCustomers: 89,
          monthlyRevenue: 3247.50,
          monthlyOrders: 23
        };

        const mockBooks: BookStats[] = [
          {
            id: '1',
            title: 'Advanced JavaScript Programming',
            thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
            price: 49.99,
            stock: 15,
            views: 234,
            sales: 12,
            status: 'PUBLISHED',
            averageRating: 4.8
          },
          {
            id: '2',
            title: 'React Development Guide',
            thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
            price: 39.99,
            stock: 8,
            views: 189,
            sales: 8,
            status: 'PUBLISHED',
            averageRating: 4.5
          },
          {
            id: '3',
            title: 'Node.js Backend Development',
            thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            price: 44.99,
            stock: 12,
            views: 167,
            sales: 6,
            status: 'PUBLISHED',
            averageRating: 4.7
          }
        ];

        const mockOrders: OrderItem[] = [
          {
            id: '1',
            orderNumber: 'ORD-2024-001',
            customerName: 'John Smith',
            bookTitle: 'Advanced JavaScript Programming',
            quantity: 2,
            amount: 99.98,
            status: 'DELIVERED',
            orderDate: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            orderNumber: 'ORD-2024-002',
            customerName: 'Sarah Johnson',
            bookTitle: 'React Development Guide',
            quantity: 1,
            amount: 39.99,
            status: 'SHIPPED',
            orderDate: '2024-01-18T14:15:00Z'
          },
          {
            id: '3',
            orderNumber: 'ORD-2024-003',
            customerName: 'Mike Davis',
            bookTitle: 'Node.js Backend Development',
            quantity: 1,
            amount: 44.99,
            status: 'CONFIRMED',
            orderDate: '2024-01-20T09:45:00Z'
          }
        ];

        setStats(mockStats);
        setRecentBooks(mockBooks);
        setRecentOrders(mockOrders);
      } catch (error) {
        console.error('Failed to fetch seller dashboard data:', error);
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {user.storeName || `${user.name}'s Store`}
          </h1>
          <p className="text-muted-foreground">
            Manage your books, orders, and customers
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/books/add">
            <Plus className="mr-2 h-4 w-4" />
            Add New Book
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +${stats.monthlyRevenue.toFixed(2)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.monthlyOrders} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <p className="text-xs text-muted-foreground">
              Active listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Unique buyers
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
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                Start promoting your books to get your first orders
              </p>
              <Button asChild>
                <Link href="/dashboard/books/add">Add Your First Book</Link>
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
                      {order.customerName} • {order.bookTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {order.quantity} • ${order.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.orderDate).toLocaleDateString()}
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

      {/* Recent Books Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Books Performance
            <Link href="/dashboard/books">
              <Button variant="ghost" size="sm">
                Manage Books
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentBooks.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No books published</h3>
              <p className="text-muted-foreground mb-4">
                Add your first book to start selling
              </p>
              <Button asChild>
                <Link href="/dashboard/books/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Book
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBooks.map((book) => (
                <div key={book.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-16 h-20 relative overflow-hidden rounded bg-muted flex-shrink-0">
                    {book.thumbnail ? (
                      <Image
                        src={book.thumbnail}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold line-clamp-1">{book.title}</h4>
                      <Badge 
                        variant={
                          book.status === 'PUBLISHED' 
                            ? 'default' 
                            : book.status === 'DRAFT'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {book.status.toLowerCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Price: ${book.price}</span>
                      <span>Stock: {book.stock}</span>
                      <span>Views: {book.views}</span>
                      <span>Sales: {book.sales}</span>
                      {book.averageRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          {book.averageRating}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/books/${book.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/books/${book.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
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
            <CardTitle className="text-base">Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/books/add">
                <Plus className="mr-2 h-4 w-4" />
                Add New Book
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/books">
                <BookOpen className="mr-2 h-4 w-4" />
                Manage Books
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders & Sales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Manage Orders
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/customers">
                <Users className="mr-2 h-4 w-4" />
                View Customers
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/analytics">
                <TrendingUp className="mr-2 h-4 w-4" />
                Sales Reports
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Store Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/store">
                <Package className="mr-2 h-4 w-4" />
                Store Profile
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/help/seller">
                <HelpCircle className="mr-2 h-4 w-4" />
                Seller Guide
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}