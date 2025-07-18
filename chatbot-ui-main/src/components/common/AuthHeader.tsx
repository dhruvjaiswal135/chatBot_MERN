import { LucideIcon } from "lucide-react";

interface AuthHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconBgColor?: string;
}

export default function AuthHeader({ 
  icon: Icon, 
  title, 
  subtitle, 
  iconBgColor = "bg-blue-500" 
}: AuthHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className={`${iconBgColor} p-3 rounded-full`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  );
} 