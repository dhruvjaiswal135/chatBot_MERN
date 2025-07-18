import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { LucideIcon, Loader2 } from "lucide-react";
import { AuthLayout, AuthHeader, AuthCard, BackLink } from "@/components/common";

interface LoadingPageProps {
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  cardTitle?: string;
  cardDescription?: string;
  showBackLink?: boolean;
  backLinkHref?: string;
  backLinkText?: string;
  skeletonFields?: SkeletonField[];
  showAdditionalContent?: boolean;
  additionalContentSkeleton?: React.ReactNode;
}

interface SkeletonField {
  label: string;
  type?: 'input' | 'textarea' | 'select';
  width?: string;
}

// Default skeleton dimensions
const SKELETON_DIMS = {
  input: 'h-10 w-full',
  button: 'h-10 w-full',
  text: 'h-4 w-64',
  smallText: 'h-3 w-32',
  footerText: 'h-3 w-80'
} as const;

export default function LoadingPage({
  icon,
  title = "Loading...",
  subtitle = "Please wait while we load the page",
  cardTitle = "Loading",
  cardDescription = "Please wait while we prepare everything",
  showBackLink = true,
  backLinkHref = "/",
  backLinkText = "Back to Home",
  skeletonFields = [
    { label: "Email Address", type: "input" },
    { label: "Password", type: "input" }
  ],
  showAdditionalContent = false,
  additionalContentSkeleton
}: LoadingPageProps) {
  return (
    <AuthLayout>
      {showBackLink && <BackLink href={backLinkHref} text={backLinkText} />}
      <AuthHeader 
        icon={icon || Loader2}
        title={title}
        subtitle={subtitle}
      />
      <AuthCard 
        title={cardTitle}
        description={cardDescription}
      >
        {/* Form Skeleton */}
        <div className="space-y-4">
          {skeletonFields.map((field, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className={`${SKELETON_DIMS.input} rounded-md`} />
            </div>
          ))}
          
          {/* Submit Button */}
          <Skeleton className={`${SKELETON_DIMS.button} rounded-md`} />
        </div>

        {showAdditionalContent && (
          <>
            <Separator />
            <div className="space-y-4">
              {additionalContentSkeleton || <DefaultAdditionalContent />}
            </div>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  );
}

// Default Additional Content Component
function DefaultAdditionalContent() {
  return (
    <>
      <div className="text-center">
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
      <div className="text-center">
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </>
  );
} 