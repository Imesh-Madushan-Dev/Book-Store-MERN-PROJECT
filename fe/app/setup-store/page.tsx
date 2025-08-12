'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { sellersAPI } from '@/lib/api';
import Link from 'next/link';

export default function SetupStorePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Redirect if no user or not loaded
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/choose-role');
    }
  }, [isLoaded, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    // Validation
    const newErrors: {[key: string]: string} = {};
    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }
    if (formData.storeName.trim().length < 2) {
      newErrors.storeName = 'Store name must be at least 2 characters';
    }
    if (formData.storeDescription.length > 500) {
      newErrors.storeDescription = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const registrationData = {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || user.firstName || user.username || 'Seller',
        role: 'SELLER' as const,
        storeName: formData.storeName.trim(),
        storeDescription: formData.storeDescription.trim() || ''
      };

      console.log('Attempting registration with data:', {
        ...registrationData,
        clerkId: registrationData.clerkId ? 'PROVIDED' : 'MISSING'
      });

      const response = await sellersAPI.registerSeller(registrationData);
      console.log('Seller registration successful:', response);
      
      // Clean up sessionStorage
      sessionStorage.removeItem('selectedRole');
      sessionStorage.removeItem('authReturnUrl');
      
      // Redirect to seller dashboard
      router.push('/seller/dashboard');
    } catch (error: any) {
      console.error('Store setup failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Handle different response scenarios
      if (error.response?.status === 200 || 
          (error.response?.status === 400 && error.response?.data?.message?.includes('successfully'))) {
        // Registration successful
        router.push('/seller/dashboard');
      } else {
        // Show specific error message if available
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.errors?.[0]?.msg ||
                           error.message ||
                           'Failed to set up your store. Please try again.';
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Store className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Set Up Your Store</CardTitle>
              <CardDescription>
                Tell us about your bookstore to get started
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Welcome, {user.fullName || user.firstName || 'Seller'}!</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Your account has been created. Now let's set up your bookstore.
              </p>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {errors.general}
              </div>
            )}

            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="storeName" className="text-base font-medium">
                Store Name *
              </Label>
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, storeName: e.target.value }));
                  if (errors.storeName) {
                    setErrors(prev => ({ ...prev, storeName: '' }));
                  }
                }}
                placeholder="e.g., Classic Books Corner"
                className={errors.storeName ? 'border-red-500' : ''}
                maxLength={100}
              />
              {errors.storeName && (
                <p className="text-red-500 text-sm">{errors.storeName}</p>
              )}
              <p className="text-muted-foreground text-xs">
                This will be the name customers see for your store
              </p>
            </div>

            {/* Store Description */}
            <div className="space-y-2">
              <Label htmlFor="storeDescription" className="text-base font-medium">
                Store Description
              </Label>
              <Textarea
                id="storeDescription"
                value={formData.storeDescription}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, storeDescription: e.target.value }));
                  if (errors.storeDescription) {
                    setErrors(prev => ({ ...prev, storeDescription: '' }));
                  }
                }}
                placeholder="Tell customers about your store, what types of books you specialize in, your story..."
                rows={4}
                className={errors.storeDescription ? 'border-red-500' : ''}
                maxLength={500}
              />
              {errors.storeDescription && (
                <p className="text-red-500 text-sm">{errors.storeDescription}</p>
              )}
              <p className="text-muted-foreground text-xs">
                {formData.storeDescription.length}/500 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/choose-role')}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 flex items-center gap-2"
                disabled={loading || !formData.storeName.trim()}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Creating Store...' : 'Create Store'}
              </Button>
            </div>

            {/* Skip Option */}
            <div className="text-center pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                You can also set this up later in your seller dashboard
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push('/seller/dashboard')}
                disabled={loading}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}