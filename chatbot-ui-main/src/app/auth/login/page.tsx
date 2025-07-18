"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  AuthLayout, 
  AuthHeader, 
  AuthCard, 
  AuthFooter, 
  BackLink 
} from '@/components/common';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { FormField, ErrorAlert } from "@/components/common";
import fetcher from "@/lib/utils/fetcher";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    user: {
      email: string;
    };
  };
  timestamp: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetcher<LoginResponse>("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      }, false, false);

      if (response.status && response.data?.reference) {
        // Store reference in sessionStorage for the next step
        sessionStorage.setItem("auth_reference", response.data.reference);
        sessionStorage.setItem("auth_email", formData.email);
        
        // Redirect to OTP validation page
        router.push("/auth/login/validate");
      } else {
        setError(response.message || "Invalid email or password");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <AuthLayout>
      <AuthCard title="Sign In" description="Enter your credentials to access your account">
        <BackLink href="/" />
        <AuthHeader
          icon={Mail}
          title="Welcome Back"
          subtitle="Sign in to your account to continue"
        />
        
        {error && <ErrorAlert message={error} className="mb-4" />}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            id="email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange("email")}
            disabled={isLoading}
            icon={<Mail className="h-4 w-4" />}
          />
          
          <FormField
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange("password")}
            disabled={isLoading}
            icon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>

        <Separator />
        
        {/* Additional Options */}
        <div className="space-y-4 mt-4">
          {/* Forgot Password */}
          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
        
        <AuthFooter />
      </AuthCard>
    </AuthLayout>
  );
}