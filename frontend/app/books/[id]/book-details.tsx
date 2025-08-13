'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookDetailsProps {
  book: any;
}

export function BookDetails({ book }: BookDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-muted">
          <Image
            src={book.images[selectedImage] || book.thumbnail}
            alt={book.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        
        {book.images.length > 1 && (
          <div className="flex gap-2">
            {book.images.map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-[3/4] w-20 relative overflow-hidden rounded border-2 ${
                  selectedImage === index ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Image
                  src={image}
                  alt={`${book.title} view ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quantity and Add to Cart */}
      <div className="space-y-6">
        {/* Add to Cart */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                disabled={quantity <= 1}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                disabled={quantity >= book.stock}
                onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Button className="flex-1" size="lg" disabled={book.stock === 0}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart - ${(book.price * quantity).toFixed(2)}
            </Button>
          </div>
          
          <Button variant="outline" className="w-full" size="lg">
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}