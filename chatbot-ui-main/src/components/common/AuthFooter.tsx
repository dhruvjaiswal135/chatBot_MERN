import Link from "next/link";

interface AuthFooterProps {
  termsHref?: string;
  privacyHref?: string;
  className?: string;
}

export default function AuthFooter({ 
  termsHref = "/terms", 
  privacyHref = "/privacy",
  className = "text-center mt-6"
}: AuthFooterProps) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500">
        By signing in, you agree to our{" "}
        <Link href={termsHref} className="text-blue-600 hover:text-blue-800">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href={privacyHref} className="text-blue-600 hover:text-blue-800">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
} 