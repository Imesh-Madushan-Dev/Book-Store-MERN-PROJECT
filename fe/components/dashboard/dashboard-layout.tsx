'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  ShoppingCart,
  Heart,
  User,
  Settings,
  LogOut,
  Menu,
  Store,
  Package,
  BarChart3,
  Users,
  BookOpen,
  Plus,
  ClipboardList,
  TrendingUp,
  MessageCircle
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Sidebar navigation items based on user role
  const buyerNavigation: SidebarItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { name: 'Addresses', href: '/dashboard/addresses', icon: User },
    { name: 'Reviews', href: '/dashboard/reviews', icon: MessageCircle },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const sellerNavigation: SidebarItem[] = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'My Books', href: '/dashboard/books', icon: BookOpen },
    { name: 'Add Book', href: '/dashboard/books/add', icon: Plus },
    { name: 'Orders', href: '/dashboard/orders', icon: ClipboardList },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Store Settings', href: '/dashboard/store', icon: Store },
    { name: 'Profile', href: '/dashboard/profile', icon: Settings },
  ];

  const navigation = user?.role === 'SELLER' ? sellerNavigation : buyerNavigation;

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">BookStore</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role === 'SELLER' ? user?.storeName : user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={`mr-3 h-5 w-5 flex-shrink-0`} />
              {item.name}
              {item.badge && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-3 h-4 w-4" />
              Account
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-card">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <div className="flex flex-col h-full">
          {/* Top bar */}
          <header className="bg-background border-b px-4 py-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="lg:hidden">
                {/* Mobile menu button is now handled by Sheet */}
              </div>
              <div className="hidden lg:block">
                <h1 className="text-2xl font-semibold text-foreground">
                  {user?.role === 'SELLER' ? 'Seller Dashboard' : 'My Dashboard'}
                </h1>
              </div>
              <div className="flex items-center space-x-4 ml-auto">
                {/* Quick actions */}
                <Button asChild size="sm">
                  <Link href="/shop">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Browse Books
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}