import React from "react";
import {
  Zap,
  Droplets,
  Fan,
  Armchair,
  Sparkles,
  Wifi,
  ShieldAlert,
  Bug,
  Building2,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import { ComplaintCategory } from "@/types";

interface CategoryIconProps {
  category: ComplaintCategory | string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  Electrical: Zap,
  Plumbing: Droplets,
  "HVAC / Air Conditioning": Fan,
  "Furniture & Carpentry": Armchair,
  "Cleanliness & Sanitation": Sparkles,
  "Internet & Wi-Fi": Wifi,
  "Security & Safety": ShieldAlert,
  "Pest Control": Bug,
  "Civil Infrastructure": Building2,
  Other: HelpCircle,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = "w-5 h-5" }) => {
  const IconComponent = iconMap[category] || HelpCircle;
  return <IconComponent className={className} />;
};
