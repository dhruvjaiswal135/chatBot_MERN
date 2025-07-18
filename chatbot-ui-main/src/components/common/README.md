# Common Components

This directory contains reusable components that can be used across all pages in the application.

## Error and Loading Pages

### ErrorPage Component

A reusable error page component that provides consistent error handling across the application.

#### Basic Usage:
```tsx
// app/some-page/error.tsx
import { ErrorPage } from "@/components/common";
import { SomeIcon } from "lucide-react";

export default function SomePageError({ error, reset }) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      icon={SomeIcon}
      title="Page Error"
      subtitle="Something went wrong"
    />
  );
}
```

#### Advanced Usage:
```tsx
<ErrorPage
  error={error}
  reset={reset}
  icon={Smartphone}
  title="Login Error"
  subtitle="Something went wrong while loading the login page"
  cardTitle="Authentication Failed"
  cardDescription="Unable to load the login page"
  troubleshootingSteps={[
    'Check your internet connection',
    'Verify the service is available',
    'Try refreshing the page'
  ]}
  showBackLink={true}
  backLinkHref="/auth"
  backLinkText="Back to Auth"
  showHomeButton={false}
  customActions={<CustomActionButtons />}
/>
```

### LoadingPage Component

A reusable loading page component that provides consistent loading states across the application.

#### Basic Usage:
```tsx
// app/some-page/loading.tsx
import { LoadingPage } from "@/components/common";
import { SomeIcon } from "lucide-react";

export default function SomePageLoading() {
  return (
    <LoadingPage
      icon={SomeIcon}
      title="Loading..."
      subtitle="Please wait"
    />
  );
}
```

#### Advanced Usage:
```tsx
<LoadingPage
  icon={Smartphone}
  title="Welcome Back"
  subtitle="Sign in to your account"
  cardTitle="Sign In"
  cardDescription="Enter your credentials"
  skeletonFields={[
    { label: "Email Address", type: "input" },
    { label: "Password", type: "input" },
    { label: "Confirm Password", type: "input" }
  ]}
  showAdditionalContent={true}
  additionalContentSkeleton={<CustomSkeleton />}
  showBackLink={false}
/>
```

## Available Props

### ErrorPage Props:
- `error`: Error object with optional digest
- `reset`: Function to retry the operation
- `icon`: Lucide icon component
- `title`: Page title
- `subtitle`: Page subtitle
- `iconBgColor`: Background color for icon (default: "bg-red-500")
- `cardTitle`: Card title
- `cardDescription`: Card description
- `troubleshootingSteps`: Array of troubleshooting steps
- `showBackLink`: Whether to show back link (default: true)
- `backLinkHref`: Back link URL (default: "/")
- `backLinkText`: Back link text (default: "Back to Home")
- `showHomeButton`: Whether to show home button (default: true)
- `customActions`: Custom action buttons

### LoadingPage Props:
- `icon`: Lucide icon component (default: Loader2)
- `title`: Page title (default: "Loading...")
- `subtitle`: Page subtitle (default: "Please wait while we load the page")
- `cardTitle`: Card title (default: "Loading")
- `cardDescription`: Card description (default: "Please wait while we prepare everything")
- `showBackLink`: Whether to show back link (default: true)
- `backLinkHref`: Back link URL (default: "/")
- `backLinkText`: Back link text (default: "Back to Home")
- `skeletonFields`: Array of skeleton field configurations
- `showAdditionalContent`: Whether to show additional content skeleton (default: false)
- `additionalContentSkeleton`: Custom additional content skeleton

## Benefits

1. **Consistency**: All error and loading pages have the same look and feel
2. **Reusability**: Use the same components across different pages
3. **Maintainability**: Changes to error/loading UI only need to be made in one place
4. **Customization**: Highly customizable while maintaining consistency
5. **Type Safety**: Fully typed with TypeScript 