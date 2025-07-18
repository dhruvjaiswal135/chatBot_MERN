import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, RefreshCw, LucideIcon } from "lucide-react";
import { AuthLayout, AuthHeader, AuthCard, BackLink } from "@/components/common";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  iconBgColor?: string;
  cardTitle?: string;
  cardDescription?: string;
  troubleshootingSteps?: string[];
  showBackLink?: boolean;
  backLinkHref?: string;
  backLinkText?: string;
  showHomeButton?: boolean;
  customActions?: React.ReactNode;
}

export default function ErrorPage({
  error,
  reset,
  icon,
  title = "Page Error",
  subtitle = "Something went wrong while loading this page",
  iconBgColor = "bg-red-500",
  cardTitle = "Error Occurred",
  cardDescription = "Unable to load the requested page",
  troubleshootingSteps = [
    'Check your internet connection',
    'Verify the service is available',
    'Try refreshing the page',
    'Clear your browser cache'
  ],
  showBackLink = true,
  backLinkHref = "/",
  backLinkText = "Back to Home",
  showHomeButton = true,
  customActions
}: ErrorPageProps) {
  return (
    <AuthLayout>
      {showBackLink && <BackLink href={backLinkHref} text={backLinkText} />}
      <AuthHeader 
        icon={icon || AlertCircle}
        title={title}
        subtitle={subtitle}
        iconBgColor={iconBgColor}
      />
      <AuthCard 
        title={cardTitle}
        description={cardDescription}
      >
        <ErrorDetails error={error} />
        <Separator />
        <TroubleshootingGuide steps={troubleshootingSteps} />
        {customActions || <ActionButtons reset={reset} showHomeButton={showHomeButton} />}
        <Timestamp />
      </AuthCard>
    </AuthLayout>
  );
}

// Error Details Component
function ErrorDetails({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        </div>
        <div className="text-sm text-red-800">
          <p className="font-medium mb-2">Error Details:</p>
          <p className="text-xs font-mono bg-red-100 p-2 rounded">
            {error.message || 'Unknown error occurred'}
          </p>
          {error.digest && (
            <p className="text-xs text-red-600 mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Troubleshooting Guide Component
function TroubleshootingGuide({ steps }: { steps: string[] }) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
        </div>
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Troubleshooting:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Action Buttons Component
function ActionButtons({ reset, showHomeButton }: { reset: () => void; showHomeButton: boolean }) {
  return (
    <div className="flex flex-col space-y-3">
      <Button 
        onClick={reset}
        className="flex items-center space-x-2"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Try Again</span>
      </Button>
      
      {showHomeButton && (
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/'}
        >
          Go to Home
        </Button>
      )}
    </div>
  );
}

// Timestamp Component
function Timestamp() {
  return (
    <>
      <Separator />
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Error occurred at: {new Date().toLocaleString()}
        </p>
      </div>
    </>
  );
} 