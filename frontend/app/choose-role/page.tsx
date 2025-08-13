'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, User, ArrowRight, Book } from 'lucide-react';
import Link from 'next/link';

export default function ChooseRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('return_to') || '/dashboard';
  const [selectedRole, setSelectedRole] = useState<'BUYER' | 'SELLER' | null>(null);

  const handleRoleSelect = (role: 'BUYER' | 'SELLER') => {
    // Store the selected role in sessionStorage to use after Clerk auth
    sessionStorage.setItem('selectedRole', role);
    
    // Set return URL based on role
    const redirectUrl = role === 'SELLER' ? '/seller/dashboard' : '/dashboard';
    sessionStorage.setItem('authReturnUrl', redirectUrl);
    
    // Redirect to Clerk sign-up with the role information
    router.push('/sign-up');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <Book className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">BookStore</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            How do you want to use BookStore?
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose your role to get started with the right experience
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Buyer Card */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedRole === 'BUYER' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/20'
            }`}
            onClick={() => setSelectedRole('BUYER')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">I want to Buy Books</CardTitle>
              <CardDescription className="text-base">
                Browse, discover, and purchase books from various sellers
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Browse millions of books</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Create wishlists and favorites</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Track orders and reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Get personalized recommendations</span>
                </div>
              </div>
              <Button 
                className="w-full mt-6" 
                onClick={() => handleRoleSelect('BUYER')}
                variant={selectedRole === 'BUYER' ? 'default' : 'outline'}
              >
                Continue as Buyer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Seller Card */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedRole === 'SELLER' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/20'
            }`}
            onClick={() => setSelectedRole('SELLER')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Store className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">I want to Sell Books</CardTitle>
              <CardDescription className="text-base">
                Create your bookstore and start selling to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Set up your online bookstore</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>List and manage your inventory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Process orders and payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Track sales and analytics</span>
                </div>
              </div>
              <Button 
                className="w-full mt-6" 
                onClick={() => handleRoleSelect('SELLER')}
                variant={selectedRole === 'SELLER' ? 'default' : 'outline'}
              >
                Continue as Seller
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Already have an account? 
            <Link href="/sign-in" className="text-primary hover:underline ml-1">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}