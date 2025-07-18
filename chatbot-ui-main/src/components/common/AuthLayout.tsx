import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  maxWidth?: string;
}

export default function AuthLayout({ children, maxWidth = "max-w-md" }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className={`w-full ${maxWidth}`}>
        {children}
      </div>
    </div>
  );
} 