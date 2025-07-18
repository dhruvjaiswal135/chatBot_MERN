"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { 
  AuthLayout, 
  AuthHeader, 
  AuthCard, 
  AuthFooter, 
  BackLink 
} from '@/components/common';
import { Button } from "@/components/ui/button";
import { Smartphone, Loader2, ArrowLeft } from "lucide-react";
import { FormField, ErrorAlert } from "@/components/common";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

interface OtpValidationData {
  otp: string;
}

export default function OtpValidationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<OtpValidationData>({
    otp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Check for required data on mount
  useEffect(() => {
    const storedReference = sessionStorage.getItem("auth_reference");
    const storedEmail = sessionStorage.getItem("auth_email");

    if (!storedReference || !storedEmail) {
      // Redirect back to login if no reference/email found
      router.push("/auth/login");
      return;
    }

    setReference(storedReference);
    setEmail(storedEmail);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otp || !reference || !email) {
      setError("OTP is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: email,
        otp: formData.otp,
        reference: reference,
        step: "verify",
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid OTP code");
      } else if (result?.ok) {
        // Clear session storage
        sessionStorage.removeItem("auth_reference");
        sessionStorage.removeItem("auth_email");
        
        // Redirect to dashboard on success
        router.push("/dashboard");
      } else {
        setError("Authentication failed");
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setFormData(prev => ({ ...prev, otp: value }));
    if (error) setError(null);
  };

  const handleBackToLogin = () => {
    // Clear session storage and redirect back
    sessionStorage.removeItem("auth_reference");
    sessionStorage.removeItem("auth_email");
    router.push("/auth/login");
  };

  // Show loading while checking for required data
  if (!reference || !email) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard title="Verify OTP" description="Enter the 6-digit code sent to your phone">
        <BackLink href="/auth/login" />
        <AuthHeader
          icon={Smartphone}
          title="Verify Your Identity"
          subtitle="Enter the 6-digit code sent to your phone"
        />
        
        {error && <ErrorAlert message={error} className="mb-4" />}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            id="otp"
            name="otp"
            label="OTP Code"
            type="text"
            placeholder="Enter 6-digit OTP"
            value={formData.otp}
            onChange={handleInputChange}
            disabled={isLoading}
            icon={<Smartphone className="h-4 w-4" />}
          />
          
          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBackToLogin}
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </div>
        </form>
        
        <AuthFooter />
      </AuthCard>
    </AuthLayout>
  );
} 