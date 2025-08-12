'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookCard } from '@/components/book/book-card';
import { Marquee } from '@/components/magicui/marquee';
import { booksAPI, categoriesAPI } from '@/lib/api';
import { Book, Category } from '@/lib/types';

// Sample slider images (YouTube thumbnail size: 1280x720)
const sliderImages = [
  {
    id: 1,
    src: 'https://makeenbooks.com/public/img/banner/nonfiction.jpg',
    title: 'Discover New Worlds',
    subtitle: 'Explore our vast collection of books',
    cta: 'Shop Now',
    link: '/shop'
  },
  {
    id: 2,
    src: 'https://makeenbooks.com/public/img/banner/2025july.png',
    title: 'Bestselling Authors',
    subtitle: 'Find books from your favorite writers',
    cta: 'Browse Authors',
    link: '/authors'
  },
  {
    id: 3,
    src: 'https://makeenbooks.com/public/img/banner/booklistWeb.png',
    title: 'Special Offers',
    subtitle: 'Up to 50% off on selected books',
    cta: 'View Deals',
    link: '/deals'
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [newReleases, setNewReleases] = useState<Book[]>([]);
  const [bestsellers, setBestsellers] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, featuredData, newReleasesData, bestsellersData] = await Promise.all([
          categoriesAPI.getCategories(),
          booksAPI.getBooks(new URLSearchParams({ featured: 'true', limit: '12' })),
          booksAPI.getBooks(new URLSearchParams({ newRelease: 'true', limit: '12' })),
          booksAPI.getBooks(new URLSearchParams({ bestseller: 'true', limit: '12' }))
        ]);
        
        setCategories((categoriesData.categories || []).slice(0, 8));
        setFeaturedBooks(featuredData.books || []);
        setNewReleases(newReleasesData.books || []);
        setBestsellers(bestsellersData.books || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  return (
    <div className="min-h-screen">
    
      {/* Image Slider - YouTube Thumbnail Size */}
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <div className="relative w-full h-full">
          {sliderImages.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.src}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center">
             
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find your favorite genres and discover new worlds of literature
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading categories...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
              {categories.map((category) => (
                <Link key={category._id} href={`/shop/${category.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-4 text-center">
                      <div className="relative aspect-square mb-3 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-lg overflow-hidden">
                        <Image
                          src={category.image || '/placeholder-category.jpg'}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12.5vw"
                        />
                      </div>
                      <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {category.bookCount || 0} books
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/categories">
                View All Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Books Marquee */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Books</h2>
              <p className="text-muted-foreground mt-2">
                Hand-picked selections from our editorial team
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/shop?featured=true">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading featured books...</div>
            </div>
          ) : (
            <Marquee className="py-4" pauseOnHover>
              {featuredBooks.map((book) => (
                <div key={book._id} className="mx-3">
                  <BookCard book={book} />
                </div>
              ))}
            </Marquee>
          )}
        </div>
      </section>

      {/* New Releases Marquee */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">New Releases</h2>
              <p className="text-muted-foreground mt-2">
                Latest arrivals in our bookstore
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/shop?newRelease=true">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading new releases...</div>
            </div>
          ) : (
            <Marquee className="py-4" pauseOnHover reverse>
              {newReleases.map((book) => (
                <div key={book._id} className="mx-3">
                  <BookCard book={book} />
                </div>
              ))}
            </Marquee>
          )}
        </div>
      </section>

      {/* Bestsellers Marquee */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Bestsellers</h2>
              <p className="text-muted-foreground mt-2">
                Most popular books among our readers
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/shop?bestseller=true">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading bestsellers...</div>
            </div>
          ) : (
            <Marquee className="py-4" pauseOnHover>
              {bestsellers.map((book) => (
                <div key={book._id} className="mx-3">
                  <BookCard book={book} />
                </div>
              ))}
            </Marquee>
          )}
        </div>
      </section>
    </div>
  );
}