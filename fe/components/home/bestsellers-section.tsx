'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/book/book-card';
import { booksAPI } from '@/lib/api';
import { Book } from '@/lib/types';

export function BestsellersSection() {
  const [bestsellerBooks, setBestsellerBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestsellerBooks = async () => {
      try {
        const params = new URLSearchParams({
          sort: 'salesCount',
          order: 'desc',
          limit: '6',
          status: 'PUBLISHED'
        });
        const data = await booksAPI.getBooks(params);
        setBestsellerBooks(data.books || []);
      } catch (error) {
        console.error('Error fetching bestseller books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellerBooks();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading bestsellers...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Bestsellers</h2>
            </div>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/bestsellers">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="text-muted-foreground mb-8 text-lg">
          The most popular books among our readers this month
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestsellerBooks.map((book, index) => (
            <div key={book._id} className="relative">
              {/* Rank badge */}
              <div className="absolute -top-2 -left-2 z-10 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <BookCard book={book} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Join the Book Club</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get exclusive access to bestseller previews, author interviews, and special discounts
            </p>
            <Button size="lg">
              Join Now - It's Free!
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}