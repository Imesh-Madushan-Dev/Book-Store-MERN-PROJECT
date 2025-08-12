'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/lib/types';

interface BookCardProps {
  book: Book;
  className?: string;
}

export function BookCard({ book, className = '' }: BookCardProps) {
  const discountPercentage = book.originalPrice 
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  return (
    <Card className={`group hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <CardContent className="p-4">
        <div className="relative mb-4">
          <Link href={`/books/${book._id}`}>
            <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-muted">
              <Image
                src={book.thumbnail}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </Link>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {book.bestseller && (
              <Badge variant="destructive" className="text-xs">
                Bestseller
              </Badge>
            )}
            {book.newRelease && (
              <Badge variant="secondary" className="text-xs">
                New
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge variant="default" className="text-xs">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {/* Title and Author */}
          <div className="min-h-[3rem]">
            <Link href={`/books/${book._id}`}>
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
                {book.title}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              by {book.author?.name || 'Unknown Author'}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(book.rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {book.rating || 0} ({book.reviewCount || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg">${book.price}</span>
            {book.originalPrice && book.originalPrice > book.price && (
              <span className="text-sm text-muted-foreground line-through">
                ${book.originalPrice}
              </span>
            )}
          </div>

          {/* Format and Stock */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{book.format}</span>
            <span>{book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}</span>
          </div>

          {/* Add to Cart */}
          <Button
            className="w-full mt-3"
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