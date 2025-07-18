import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

export default function FormField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  icon,
  rightIcon,
  className = ""
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${icon ? "pl-10" : ""} ${rightIcon ? "pr-10" : ""} ${
            error ? "border-red-500 focus:border-red-500" : ""
          } ${className}`}
          disabled={disabled}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
} 