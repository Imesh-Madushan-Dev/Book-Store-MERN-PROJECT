'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Package, TrendingUp, DollarSign, Eye, Edit, Trash2, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getMockBooks, mockUsers, mockOrders, getMockOrdersByUserId } from '@/lib/mock-data';
import { Book, SalesData } from '@/lib/types';

// Mock current user (seller)
const currentUser = mockUsers[1]; // Jane Smith - SELLER
const sellerBooks = getMockBooks().filter(book => book.sellerId === currentUser._id);
const sellerOrders = mockOrders.filter(order => 
  order.items.some(item => item.book.sellerId === currentUser._id)
);

// Mock sales data
const mockSalesData: SalesData[] = [
  { date: '2024-01-08', sales: 12, orders: 8, revenue: 245.60 },
  { date: '2024-01-09', sales: 15, orders: 10, revenue: 312.45 },
  { date: '2024-01-10', sales: 8, orders: 6, revenue: 189.30 },
  { date: '2024-01-11', sales: 20, orders: 14, revenue: 428.90 },
  { date: '2024-01-12', sales: 18, orders: 12, revenue: 395.20 },
  { date: '2024-01-13', sales: 22, orders: 16, revenue: 512.75 },
  { date: '2024-01-14', sales: 25, orders: 18, revenue: 634.50 },
];

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const totalRevenue = mockSalesData.reduce((sum, data) => sum + data.revenue, 0);
  const totalOrders = mockSalesData.reduce((sum, data) => sum + data.orders, 0);
  const totalSales = mockSalesData.reduce((sum, data) => sum + data.sales, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{currentUser.storeName || currentUser.name}</h1>
            <p className="text-muted-foreground">Seller Dashboard</p>
            {currentUser.verified && (
              <Badge variant="default" className="mt-1">✓ Verified Seller</Badge>
            )}
          </div>
        </div>
        
        <Button asChild>
          <Link href="/seller/add-product">
            <Plus className="mr-2 h-4 w-4" />
            Add New Book
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">My Books</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Books Sold</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSales}</div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Listed Books</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sellerBooks.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active listings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Orders
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sellerOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={order.user.avatar} />
                        <AvatarFallback>{order.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Order #{order._id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.user.name} • {order.items.length} items
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
                      <Badge variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}>
                        {order.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Books */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sellerBooks.slice(0, 5).map((book) => (
                  <div key={book._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-16 h-20 relative overflow-hidden rounded bg-muted flex-shrink-0">
                      <Image
                        src={book.thumbnail}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold">{book.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        by {book.author?.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{book.format}</Badge>
                        <span className="text-sm">Stock: {book.stock}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">${book.price}</p>
                      <p className="text-sm text-muted-foreground">
                        ⭐ {book.rating} ({book.reviewCount})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                My Books ({sellerBooks.length})
                <Button asChild>
                  <Link href="/seller/add-product">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Book
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sellerBooks.map((book) => (
                  <div key={book._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-16 h-20 relative overflow-hidden rounded bg-muted flex-shrink-0">
                      <Image
                        src={book.thumbnail}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            by {book.author?.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={book.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {book.status.toLowerCase()}
                            </Badge>
                            <Badge variant="outline">{book.format}</Badge>
                            {book.bestseller && (
                              <Badge variant="destructive">Bestseller</Badge>
                            )}
                            {book.featured && (
                              <Badge>Featured</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold">${book.price}</p>
                          {book.originalPrice && book.originalPrice > book.price && (
                            <p className="text-sm text-muted-foreground line-through">
                              ${book.originalPrice}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Stock: {book.stock}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ⭐ {book.rating} ({book.reviewCount})
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/books/${book._id}`}>
                            <Eye className="mr-2 h-3 w-3" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="mr-2 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Books</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellerOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">#{order._id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={order.user.avatar} />
                            <AvatarFallback>{order.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{order.user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.items.length} books</TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}>
                          {order.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          {order.status !== 'DELIVERED' && (
                            <Button variant="outline" size="sm">
                              Update
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Sales Analytics (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Simple chart representation */}
                <div className="grid grid-cols-7 gap-2 h-40">
                  {mockSalesData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="flex-1 flex flex-col justify-end mb-2">
                        <div
                          className="bg-primary rounded-t w-8 transition-all duration-300"
                          style={{
                            height: `${(data.revenue / Math.max(...mockSalesData.map(d => d.revenue))) * 100}%`,
                            minHeight: '10px'
                          }}
                        />
                      </div>
                      <div className="text-xs text-center">
                        <div className="font-medium">{new Date(data.date).getDate()}</div>
                        <div className="text-muted-foreground">${data.revenue.toFixed(0)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Analytics summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Total Revenue</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{totalOrders}</div>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">${(totalRevenue / totalOrders).toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Avg. Order Value</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Performing Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Fiction', 'Mystery & Thriller', 'Science Fiction & Fantasy', 'Romance'].map((category, index) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{category}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 20) + 5} books sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(Math.random() * 500 + 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(Math.random() * 30 + 5).toFixed(1)}% of sales
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}