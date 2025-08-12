'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/lib/api/books';

interface BookCardProps {
  book: Book;
  className?: string;
}

export function BookCard({ book, className = '' }: BookCardProps) {
  const discountPercentage = book.discount || 0;

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md ${className}`}>
      <CardContent className="p-0">
        {/* Image Container with Fixed Exact Dimensions */}
        <div className="relative">
          <Link href={`/books/${book._id}`}>
            <div className="relative w-[220px] h-[280px] overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-50 to-gray-100">
              <Image
                src={book.thumbnail}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="220px"
                priority={false}
              />
              {/* Overlay for better badge visibility */}
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          </Link>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {book.bestseller && (
              <Badge variant="destructive" className="text-xs font-medium shadow-lg">
                🏆 Bestseller
              </Badge>
            )}
            {book.newRelease && (
              <Badge variant="secondary" className="text-xs font-medium shadow-lg bg-green-500 text-white hover:bg-green-600">
                ✨ New
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge variant="default" className="text-xs font-medium shadow-lg bg-red-500 text-white">
                -{discountPercentage}% OFF
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 h-9 w-9 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
          >
            <Heart className="h-4 w-4 text-gray-700 hover:text-red-500 transition-colors" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="w-[220px] p-4 space-y-1">
          {/* Title and Author - Fixed Height */}
          <div className="flex flex-col justify-start">
            <Link href={`/books/${book._id}`}>
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 hover:text-primary transition-colors text-gray-900 mb-1">
                {book.title}
              </h3>
            </Link>
            <p className="text-xs text-gray-600 font-medium">
              by {book.author?.name || 'Unknown Author'}
            </p>
          </div>

          {/* Rating - Fixed Height */}
          <div className="h-5 flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(book.averageRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {book.averageRating ? book.averageRating.toFixed(1) : '0.0'} ({book.totalReviews || 0})
            </span>
          </div>

          {/* Price Section */}
          <div className="py-2">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-bold text-xl text-gray-900">${book.price}</span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span className="text-sm text-gray-500 line-through font-medium">
                  ${book.originalPrice}
                </span>
              )}
            </div>
            
            {/* Format and Stock */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full">
                {book.format}
              </span>
              <span className={`font-medium ${
                book.stock > 0 
                  ? book.stock <= 5 
                    ? 'text-orange-600' 
                    : 'text-green-600'
                  : 'text-red-600'
              }`}>
                {book.stock > 0 
                  ? book.stock <= 5 
                    ? `Only ${book.stock} left!` 
                    : `${book.stock} in stock`
                  : 'Out of stock'
                }
              </span>
            </div>
          </div>

       
          {/* Add to Cart */}
          <Button
            className="w-full"
            size="sm"
            disabled={book.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}