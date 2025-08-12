'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getMockBookById } from '@/lib/mock-data';
import { CartItem } from '@/lib/types';

// Mock cart data - in a real app this would come from context/state management
const mockCartItems: CartItem[] = [
  {
    _id: '1',
    bookId: '1',
    book: getMockBookById('1')!,
    quantity: 1,
    price: 12.99,
    addedAt: new Date(),
  },
  {
    _id: '2',
    bookId: '3',
    book: getMockBookById('3')!,
    quantity: 2,
    price: 11.99,
    addedAt: new Date(),
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [promoCode, setPromoCode] = useState('');
  
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setCartItems(items =>
      items.map(item =>
        item._id === itemId
          ? { ...item, quantity: Math.min(newQuantity, item.book?.stock || 0) }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item._id !== itemId));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any books to your cart yet.
          </p>
          <Button asChild>
            <Link href="/shop">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        
        <Button variant="outline" asChild>
          <Link href="/shop">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item._id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Book Image */}
                  <Link href={`/books/${item.book?._id}`} className="flex-shrink-0">
                    <div className="w-20 h-28 relative overflow-hidden rounded border bg-muted">
                      <Image
                        src={item.book?.thumbnail || ''}
                        alt={item.book?.title || ''}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </Link>

                  {/* Book Details */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <Link href={`/books/${item.book?._id}`} className="hover:text-primary">
                        <h3 className="font-semibold">{item.book?.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        by {item.book?.author?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.book?.format} • {item.book?.publisher?.name}
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-1">
                      {item.book?.bestseller && (
                        <Badge variant="destructive" className="text-xs">Bestseller</Badge>
                      )}
                      {item.book?.stock && item.book.stock < 10 && (
                        <Badge variant="outline" className="text-xs">
                          Only {item.book.stock} left
                        </Badge>
                      )}
                    </div>

                    {/* Mobile Price and Quantity */}
                    <div className="flex items-center justify-between md:hidden">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">${item.price}</span>
                        {item.book?.originalPrice && item.book?.originalPrice > item.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${item.book?.originalPrice}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item._id!, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={item.quantity >= (item.book?.stock || 0)}
                            onClick={() => updateQuantity(item._id!, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Price and Controls */}
                  <div className="hidden md:flex md:flex-col md:items-end md:space-y-3">
                    <div className="text-right">
                      <div className="font-bold">${item.price}</div>
                      {item.book?.originalPrice && item.book?.originalPrice > item.price && (
                        <div className="text-sm text-muted-foreground line-through">
                          ${item.book?.originalPrice}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item._id!, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={item.quantity >= (item.book?.stock || 0)}
                          onClick={() => updateQuantity(item._id!, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item._id!)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-sm font-medium">
                      Total: ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Mobile Remove Button */}
                <div className="flex justify-between items-center mt-4 md:hidden">
                  <div className="font-medium">
                    Total: ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeItem(item._id!)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium">Promo Code</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>

              {/* Checkout Button */}
              <Button className="w-full mt-6" size="lg" asChild>
                <Link href="/checkout">
                  Proceed to Checkout
                </Link>
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-3">
                Secure checkout powered by Stripe
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}