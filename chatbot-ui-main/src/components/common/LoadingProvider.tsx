"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { LoadingPage } from "@/components/common";
import { Loader2, LucideIcon } from "lucide-react";

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  loadingConfig: LoadingConfig;
  setLoadingConfig: (config: Partial<LoadingConfig>) => void;
}

interface LoadingConfig {
  title: string;
  subtitle: string;
  cardTitle: string;
  cardDescription: string;
  icon?: LucideIcon;
  showBackLink: boolean;
  backLinkHref: string;
  backLinkText: string;
  skeletonFields: Array<{
    label: string;
    type?: 'input' | 'textarea' | 'select';
    width?: string;
  }>;
  showAdditionalContent: boolean;
  additionalContentSkeleton?: ReactNode;
}

const defaultConfig: LoadingConfig = {
  title: "Loading...",
  subtitle: "Please wait while we load the page",
  cardTitle: "Loading",
  cardDescription: "Please wait while we prepare everything",
  icon: Loader2,
  showBackLink: true,
  backLinkHref: "/",
  backLinkText: "Back to Home",
  skeletonFields: [
    { label: "Email Address", type: "input" },
    { label: "Password", type: "input" }
  ],
  showAdditionalContent: false
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingConfig, setLoadingConfigState] = useState<LoadingConfig>(defaultConfig);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const setLoadingConfig = (config: Partial<LoadingConfig>) => {
    setLoadingConfigState(prev => ({ ...prev, ...config }));
  };

  if (isLoading) {
    return (
      <LoadingPage
        icon={loadingConfig.icon}
        title={loadingConfig.title}
        subtitle={loadingConfig.subtitle}
        cardTitle={loadingConfig.cardTitle}
        cardDescription={loadingConfig.cardDescription}
        showBackLink={loadingConfig.showBackLink}
        backLinkHref={loadingConfig.backLinkHref}
        backLinkText={loadingConfig.backLinkText}
        skeletonFields={loadingConfig.skeletonFields}
        showAdditionalContent={loadingConfig.showAdditionalContent}
        additionalContentSkeleton={loadingConfig.additionalContentSkeleton}
      />
    );
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, loadingConfig, setLoadingConfig }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
} 