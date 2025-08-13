'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Heart, Menu, Book, LogOut, Settings, Package } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { categoriesAPI, cartAPI } from '@/lib/api-client';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getCategories();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!isClient) return;
      
      try {
        if (isAuthenticated) {
          const cart = await cartAPI.getCart();
          const totalItems = cart.cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
          setCartItemCount(totalItems);
        } else {
          // For guest users, you might want to check localStorage cart
          const guestCart = localStorage.getItem('guest_cart');
          if (guestCart) {
            const cart = JSON.parse(guestCart);
            const totalItems = cart.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
            setCartItemCount(totalItems);
          }
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartItemCount(0);
      }
    };

    fetchCartCount();
  }, [isAuthenticated, isClient]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl flex h-16 items-center">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <Book className="h-6 w-6" />
                <span className="font-bold text-xl">BookStore</span>
              </Link>
              <nav className="flex flex-col space-y-2">
                <Link href="/shop" className="text-sm font-medium hover:text-primary">
                  All Books
                </Link>
                <Link href="/categories" className="text-sm font-medium hover:text-primary">
                  Categories
                </Link>
                {!loading && categories.slice(0, 5).map((category) => (
                  <Link
                    key={category._id}
                    href={`/categories/${category.slug}`}
                    className="text-sm hover:text-primary"
                  >
                    {category.name}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
                      Dashboard
                    </Link>
                    <Link href="/cart" className="text-sm font-medium hover:text-primary">
                      Cart
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-medium hover:text-primary">
                      Sign In
                    </Link>
                    <Link href="/register" className="text-sm font-medium hover:text-primary">
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <Book className="h-8 w-8 text-primary" />
          <span className="hidden sm:block font-bold text-xl">BookStore</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Browse</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[400px] p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <NavigationMenuLink asChild>
                      <Link href="/shop" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">All Books</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Browse our complete collection
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    
                    <NavigationMenuLink asChild>
                      <Link href="/categories" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">Categories</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Browse by categories
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    
                    {!loading && categories.slice(0, 4).map((category) => (
                      <NavigationMenuLink key={category._id} asChild>
                        <Link href={`/categories/${category.slug}`} className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{category.name}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {category.description || `Browse ${category.name.toLowerCase()}`}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </form>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Cart */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Badge>
                )}
              </div>
            </Link>
          </Button>

          {/* Wishlist - only for authenticated users */}
          {isAuthenticated && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {/* User menu */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    {user.role === 'SELLER' && user.storeName && (
                      <p className="text-xs leading-none text-muted-foreground">
                        Store: {user.storeName}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                
                {user.role === 'BUYER' && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/orders">
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {user.role === 'SELLER' && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/books">
                      <Book className="mr-2 h-4 w-4" />
                      <span>My Books</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Sign in/up buttons for non-authenticated users */
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}