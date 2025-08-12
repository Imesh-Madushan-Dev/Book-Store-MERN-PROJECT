import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heart, Star, Share2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMockBookById, getMockReviewsByBookId, getMockBooks } from '@/lib/mock-data';
import { BookCard } from '@/components/book/book-card';
import { BookDetails } from './book-details';

interface BookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const book = getMockBookById(id);
  if (!book) {
    notFound();
  }

  const reviews = getMockReviewsByBookId(book._id);
  const relatedBooks = getMockBooks({ category: book.category?.slug, limit: 4 })
    .filter(b => b._id !== book._id);

  const discountPercentage = book.originalPrice 
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : book.rating || 0;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-primary">Shop</Link>
            <span>/</span>
            <Link href={`/shop/${book.category?.slug}`} className="hover:text-primary">
              {book.category?.name}
            </Link>
            <span>/</span>
            <span className="text-foreground">{book.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/shop">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>

        <BookDetails book={book} />

        <div className="mt-8">
          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{book.title}</h1>
                  <p className="text-lg text-muted-foreground">
                    by <Link href={`/authors/${book.author?._id}`} className="hover:text-primary font-medium">
                      {book.author?.name}
                    </Link>
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mt-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({reviews.length} reviews)</span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {book.bestseller && (
                  <Badge variant="destructive">Bestseller</Badge>
                )}
                {book.newRelease && (
                  <Badge variant="secondary">New Release</Badge>
                )}
                {book.featured && (
                  <Badge variant="default">Featured</Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge variant="outline">{discountPercentage}% Off</Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold">${book.price}</span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span className="text-xl text-muted-foreground line-through">
                  ${book.originalPrice}
                </span>
              )}
            </div>

            {/* Book Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Format:</span>
                <span className="ml-2 font-medium">{book.format}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pages:</span>
                <span className="ml-2 font-medium">{book.pages}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Publisher:</span>
                <span className="ml-2 font-medium">{book.publisher?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Published:</span>
                <span className="ml-2 font-medium">{book.publishedYear}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Language:</span>
                <span className="ml-2 font-medium">{book.language}</span>
              </div>
              <div>
                <span className="text-muted-foreground">ISBN:</span>
                <span className="ml-2 font-medium">{book.isbn}</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {book.stock > 0 ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-green-600 font-medium">In Stock ({book.stock} available)</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>


            {/* Seller Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={book.seller?.avatar} />
                    <AvatarFallback>{book.seller?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{book.seller?.storeName || book.seller?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {book.seller?.verified && '✓ Verified Seller'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {book.description}
                    </p>
                    
                    {book.tags && book.tags.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {book.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="font-semibold text-muted-foreground">Title</dt>
                      <dd>{book.title}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-muted-foreground">Author</dt>
                      <dd>{book.author?.name}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-muted-foreground">Publisher</dt>
                      <dd>{book.publisher?.name}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-muted-foreground">Publication Year</dt>
                      <dd>{book.publishedYear}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-muted-foreground">Format</dt>
                      <dd>{book.format}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-muted-foreground">Pages</dt>
                      <dd>{book.pages}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-muted-foreground">Language</dt>
                      <dd>{book.language}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-muted-foreground">ISBN</dt>
                      <dd>{book.isbn}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={review.user?.avatar} />
                          <AvatarFallback>{review.user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{review.user?.name}</p>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {review.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{review.title}</h4>
                            <p className="text-muted-foreground mt-1">{review.comment}</p>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <button className="text-muted-foreground hover:text-primary">
                              Helpful ({review.helpful})
                            </button>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Books</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => (
                <BookCard key={relatedBook._id} book={relatedBook} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}