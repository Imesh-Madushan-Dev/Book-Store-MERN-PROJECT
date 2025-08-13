'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, User, Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/api';

export function UserRegistration() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    setLoading(true);
    try {
      const registrationData = {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || user.firstName || user.username || 'User',
        role,
        ...(role === 'SELLER' && {
          storeName: formData.storeName,
          storeDescription: formData.storeDescription
        })
      };

      await authAPI.register(registrationData);
      
      // Redirect based on role
      if (role === 'SELLER') {
        router.push('/seller/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      // If user already exists, redirect based on their role
      if (error.response?.status === 400 && error.response?.data?.message === 'User already exists') {
        const existingUser = error.response.data.user;
        if (existingUser.role === 'SELLER') {
          router.push('/seller/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Let us know how you plan to use BookStore
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display user info */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Welcome, {user.firstName || user.username}!
              </p>
              <p className="text-xs text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
              <Label className="text-base font-medium">I want to:</Label>
              <RadioGroup 
                value={role} 
                onValueChange={(value: 'BUYER' | 'SELLER') => setRole(value)}
                className="grid grid-cols-1 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="BUYER" id="buyer" />
                  <Label htmlFor="buyer" className="flex items-center space-x-2 cursor-pointer flex-1">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Buy Books</div>
                      <div className="text-sm text-muted-foreground">Browse and purchase books</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="SELLER" id="seller" />
                  <Label htmlFor="seller" className="flex items-center space-x-2 cursor-pointer flex-1">
                    <Store className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Sell Books</div>
                      <div className="text-sm text-muted-foreground">Create a store and sell books</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Seller-specific fields */}
            {role === 'SELLER' && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name *</Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) => setFormData(prev => ({ ...prev, storeName: e.target.value }))}
                    placeholder="Enter your store name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Store Description</Label>
                  <Textarea
                    id="storeDescription"
                    value={formData.storeDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, storeDescription: e.target.value }))}
                    placeholder="Tell customers about your store..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || (role === 'SELLER' && !formData.storeName)}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {role === 'SELLER' ? 'Create Store' : 'Start Shopping'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}