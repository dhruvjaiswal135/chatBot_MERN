"use client";

import { useState, useEffect } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, LogOut, Shield } from "lucide-react";

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  emailVerifiedAt: string;
  phone: string;
  phoneVerifiedAt: string;
  avatar: string;
  mfa_enabled: boolean;
  mfa_secret: string | null;
  loginAttempts: number;
  inactiveTill: string | null;
  roleId: number;
  permissions: {
    all: boolean;
  };
  status: string;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  token: string;
  refreshToken?: string;
  userData?: UserData;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  // Show loading while session is loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const user = session?.user as ExtendedUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome to your account</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              User Information
            </CardTitle>
            <CardDescription>
              Your account details and authentication status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg">{user?.name || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{user?.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-lg">{user?.id || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Authentication Status</label>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-green-600 font-medium">Authenticated</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Data Card */}
        {user?.userData && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed User Data</CardTitle>
              <CardDescription>
                Complete user information from the API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(user.userData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function DashboardWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  );
} 