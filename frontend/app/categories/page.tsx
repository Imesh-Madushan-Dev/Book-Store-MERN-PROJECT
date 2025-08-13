'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Book, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { categoriesAPI, type Category } from '@/lib/api/categories';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getCategories();
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse by Categories</h1>
        <p className="text-muted-foreground">
          Discover books in your favorite genres and topics
        </p>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">No categories available</h3>
          <p className="text-muted-foreground">
            Categories will appear here once they are added.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              className="group"
            >
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Book className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      {category.bookCount !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          {category.bookCount} books
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {category.description}
                  </p>
                )}

                {category.children && category.children.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Subcategories:</p>
                    <div className="flex flex-wrap gap-1">
                      {category.children.slice(0, 3).map((child) => (
                        <span
                          key={child._id}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {child.name}
                        </span>
                      ))}
                      {category.children.length > 3 && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          +{category.children.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Browse All Books Link */}
      <div className="mt-12 text-center">
        <Button variant="outline" asChild>
          <Link href="/shop">
            <Grid className="w-4 h-4 mr-2" />
            Browse All Books
          </Link>
        </Button>
      </div>
    </div>
  );
}