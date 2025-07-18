"use client";

import { Component, ReactNode } from "react";
import { ErrorPage } from "@/components/common";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorPage
          error={this.state.error || new Error("Unknown error occurred")}
          reset={() => this.setState({ hasError: false, error: undefined })}
          icon={AlertCircle}
          title="Application Error"
          subtitle="Something went wrong with the application"
          cardTitle="Unexpected Error"
          cardDescription="An unexpected error occurred"
          troubleshootingSteps={[
            'Refresh the page',
            'Clear your browser cache',
            'Check your internet connection',
            'Try again in a few moments'
          ]}
        />
      );
    }

    return this.props.children;
  }
} 