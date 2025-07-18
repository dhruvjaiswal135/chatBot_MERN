import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export default function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  );
} 