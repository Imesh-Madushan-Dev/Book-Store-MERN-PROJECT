import Link from 'next/link';
import { Book, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Book className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">BookStore</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your one-stop destination for all kinds of books. Discover, read, and share the books you love.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-sm text-muted-foreground hover:text-primary">All Books</Link></li>
              <li><Link href="/bestsellers" className="text-sm text-muted-foreground hover:text-primary">Bestsellers</Link></li>
              <li><Link href="/new-releases" className="text-sm text-muted-foreground hover:text-primary">New Releases</Link></li>
              <li><Link href="/deals" className="text-sm text-muted-foreground hover:text-primary">Special Offers</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2">
              <li><Link href="/shop/fiction" className="text-sm text-muted-foreground hover:text-primary">Fiction</Link></li>
              <li><Link href="/shop/mystery-thriller" className="text-sm text-muted-foreground hover:text-primary">Mystery & Thriller</Link></li>
              <li><Link href="/shop/sci-fi-fantasy" className="text-sm text-muted-foreground hover:text-primary">Sci-Fi & Fantasy</Link></li>
              <li><Link href="/shop/romance" className="text-sm text-muted-foreground hover:text-primary">Romance</Link></li>
              <li><Link href="/shop/non-fiction" className="text-sm text-muted-foreground hover:text-primary">Non-Fiction</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest book recommendations and exclusive offers.
            </p>
            <div className="flex space-x-2">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-muted-foreground">
                © 2025 BookStore. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}