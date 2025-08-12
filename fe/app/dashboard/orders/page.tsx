'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  Search,
  Eye, 
  Download,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Calendar,
  DollarSign,
  ShoppingBag,
  BookOpen,
  Filter
} from 'lucide-react';

interface OrderItem {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    thumbnail?: string;
    isbn?: string;
  };
  quantity: number;
  price: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  createdAt: string;
  estimatedDelivery?: string;
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle },
};

const paymentStatusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800' },
  PAID: { color: 'bg-green-100 text-green-800' },
  FAILED: { color: 'bg-red-100 text-red-800' },
  REFUNDED: { color: 'bg-gray-100 text-gray-800' },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Mock orders data
        const mockOrders: Order[] = [
          {
            id: '1',
            orderNumber: 'ORD-2024-001',
            status: 'DELIVERED',
            paymentStatus: 'PAID',
            totalAmount: 89.97,
            shippingCost: 9.99,
            taxAmount: 7.20,
            items: [
              {
                id: '1',
                book: {
                  id: '1',
                  title: 'The Psychology of Programming',
                  author: 'Gerald M. Weinberg',
                  thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
                  isbn: '978-0932633420'
                },
                quantity: 1,
                price: 29.99,
                totalPrice: 29.99
              },
              {
                id: '2',
                book: {
                  id: '2',
                  title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
                  author: 'Robert C. Martin',
                  thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
                  isbn: '978-0132350884'
                },
                quantity: 2,
                price: 29.99,
                totalPrice: 59.98
              }
            ],
            shippingAddress: {
              name: 'John Doe',
              street: '123 Main Street',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA'
            },
            trackingNumber: 'TRK123456789',
            createdAt: '2024-01-15T10:30:00Z',
            estimatedDelivery: '2024-01-20T00:00:00Z'
          },
          {
            id: '2',
            orderNumber: 'ORD-2024-002',
            status: 'SHIPPED',
            paymentStatus: 'PAID',
            totalAmount: 45.98,
            shippingCost: 5.99,
            taxAmount: 3.60,
            items: [
              {
                id: '3',
                book: {
                  id: '3',
                  title: 'JavaScript: The Good Parts',
                  author: 'Douglas Crockford',
                  thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                  isbn: '978-0596517748'
                },
                quantity: 1,
                price: 22.99,
                totalPrice: 22.99
              },
              {
                id: '4',
                book: {
                  id: '4',
                  title: 'You Don\'t Know JS: Scope & Closures',
                  author: 'Kyle Simpson',
                  thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
                  isbn: '978-1449335588'
                },
                quantity: 1,
                price: 16.99,
                totalPrice: 16.99
              }
            ],
            shippingAddress: {
              name: 'John Doe',
              street: '123 Main Street',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA'
            },
            trackingNumber: 'TRK987654321',
            createdAt: '2024-01-20T14:15:00Z',
            estimatedDelivery: '2024-01-25T00:00:00Z'
          },
          {
            id: '3',
            orderNumber: 'ORD-2024-003',
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            totalAmount: 34.99,
            shippingCost: 5.99,
            taxAmount: 2.80,
            items: [
              {
                id: '5',
                book: {
                  id: '5',
                  title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
                  author: 'Gang of Four',
                  thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
                  isbn: '978-0201633612'
                },
                quantity: 1,
                price: 54.99,
                totalPrice: 54.99
              }
            ],
            shippingAddress: {
              name: 'John Doe',
              street: '123 Main Street',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA'
            },
            createdAt: '2024-01-22T09:45:00Z',
            estimatedDelivery: '2024-01-27T00:00:00Z'
          }
        ];

        setOrders(mockOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter and sort orders
  useEffect(() => {
    let filtered = [...orders];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.book.author.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      switch (sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'amount-high':
          return b.totalAmount - a.totalAmount;
        case 'amount-low':
          return a.totalAmount - b.totalAmount;
        default:
          return dateB - dateA;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchQuery, statusFilter, sortBy]);

  const getStatusIcon = (status: Order['status']) => {
    const IconComponent = statusConfig[status].icon;
    return <IconComponent className="h-4 w-4" />;
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
          </p>
        </div>
        <Button asChild>
          <Link href="/shop">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by order number or book title..."
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
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="amount-high">Highest Amount</SelectItem>
                <SelectItem value="amount-low">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {orders.length === 0 ? 'No orders yet' : 'No orders match your search'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {orders.length === 0 
                ? 'Start shopping to see your orders here.'
                : 'Try adjusting your search terms or filters to find what you\'re looking for.'
              }
            </p>
            <Button asChild>
              <Link href="/shop">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Books
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={statusConfig[order.status].color}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status.toLowerCase()}</span>
                        </Badge>
                        <Badge variant="outline" className={paymentStatusConfig[order.paymentStatus].color}>
                          {order.paymentStatus.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-16 h-20 relative">
                        {item.book.thumbnail ? (
                          <Image
                            src={item.book.thumbnail}
                            alt={item.book.title}
                            fill
                            className="object-cover rounded"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center rounded">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/books/${item.book.id}`}
                          className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.book.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">by {item.book.author}</p>
                        {item.book.isbn && (
                          <p className="text-xs text-muted-foreground mt-1">ISBN: {item.book.isbn}</p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm">Qty: {item.quantity}</p>
                        <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Subtotal</p>
                      <p className="font-medium">
                        ${(order.totalAmount - order.shippingCost - order.taxAmount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Shipping</p>
                      <p className="font-medium">${order.shippingCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tax</p>
                      <p className="font-medium">${order.taxAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                {order.status !== 'CANCELLED' && (
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.name}<br />
                      {order.shippingAddress.street}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                      {order.shippingAddress.country}
                    </p>
                    {order.trackingNumber && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Tracking:</span>{' '}
                          <span className="font-mono">{order.trackingNumber}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  {order.trackingNumber && order.status === 'SHIPPED' && (
                    <Button variant="outline" size="sm">
                      <Truck className="h-4 w-4 mr-2" />
                      Track Package
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}