'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Book, Users, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  return (
    <section className=" relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                📚 Over 1 Million Books Available
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Discover Your Next
                <span className="text-primary block">Great Read</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                From bestsellers to hidden gems, find the perfect book for every mood. 
                Join thousands of readers in our literary community.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/shop">
                  Explore Books
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/bestsellers">
                  View Bestsellers
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Book className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold">1M+</div>
                <div className="text-sm text-muted-foreground">Books</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm text-muted-foreground">Readers</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold">100K+</div>
                <div className="text-sm text-muted-foreground">Orders</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative lg:ml-12">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Background decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full blur-3xl"></div>
              
              {/* Main hero image */}
              <div className="relative z-10 aspect-square rounded-2xl overflow-hidden bg-white shadow-2xl">
                <Image
                  src="/hero-books.jpg"
                  alt="Stack of books"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Floating book cards */}
              <div className="absolute -top-6 -right-6 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded"></div>
                  <div className="text-xs">
                    <div className="font-semibold">Harry Potter</div>
                    <div className="text-muted-foreground">J.K. Rowling</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded"></div>
                  <div className="text-xs">
                    <div className="font-semibold">1984</div>
                    <div className="text-muted-foreground">George Orwell</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
    </section>
  );
}