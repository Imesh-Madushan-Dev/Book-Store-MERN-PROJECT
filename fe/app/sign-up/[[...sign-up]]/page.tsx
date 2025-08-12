'use client';

import { useUser } from "@clerk/nextjs";
import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI, sellersAPI } from "@/lib/api";

export default function SignUpPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handlePostSignUp = async () => {
      if (isSignedIn && user && !isProcessing) {
        setIsProcessing(true);
        
        try {
          // Get the selected role from sessionStorage
          const selectedRole = sessionStorage.getItem('selectedRole') as 'BUYER' | 'SELLER' || 'BUYER';
          const returnUrl = sessionStorage.getItem('authReturnUrl') || '/dashboard';
          
          // Check if user already exists in our database
          let userData;
          try {
            const response = await authAPI.getCurrentUser();
            userData = response.user;
          } catch (error) {
            // User doesn't exist, create them
            userData = null;
          }

          if (!userData) {
            // Register the user with their selected role
            const registrationData = {
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              name: user.fullName || user.firstName || user.username || 'User',
              role: selectedRole
            };

            // If seller, we need to get store information
            if (selectedRole === 'SELLER') {
              // Redirect to store setup page
              router.push('/setup-store');
              return;
            } else {
              // Create buyer account
              await authAPI.register(registrationData);
            }
          }

          // Clean up sessionStorage
          sessionStorage.removeItem('selectedRole');
          sessionStorage.removeItem('authReturnUrl');
          
          // Redirect to appropriate dashboard
          const redirectUrl = userData?.role === 'SELLER' || selectedRole === 'SELLER' 
            ? '/seller/dashboard' 
            : '/dashboard';
          
          router.push(redirectUrl);
          
        } catch (error) {
          console.error('Post-signup processing error:', error);
          // If there's an error, still redirect to a safe page
          router.push('/dashboard');
        } finally {
          setIsProcessing(false);
        }
      }
    };

    if (isLoaded) {
      handlePostSignUp();
    }
  }, [isSignedIn, user, isLoaded, router, isProcessing]);

  // Show Clerk signup if user is not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-primary hover:bg-primary/90 text-sm normal-case",
            }
          }}
          afterSignUpUrl="/sign-up"
          redirectUrl="/sign-up"
        />
      </div>
    );
  }

  // Show loading while processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Setting up your account...</p>
      </div>
    </div>
  );
}