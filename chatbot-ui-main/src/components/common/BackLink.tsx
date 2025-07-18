import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  text?: string;
  className?: string;
}

export default function BackLink({ 
  href, 
  text = "Back to Home", 
  className = "mb-6" 
}: BackLinkProps) {
  return (
    <div className={className}>
      <Link
        href={href}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {text}
      </Link>
    </div>
  );
} 