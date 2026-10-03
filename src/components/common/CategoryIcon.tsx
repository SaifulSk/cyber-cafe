import React from "react";
import {
  Smartphone,
  Fingerprint,
  Zap,
  Utensils,
  Vote,
  CreditCard,
  Send,
  ShieldCheck,
  FileCheck,
  Printer,
  TrainTrack,
  Wheat,
  LayoutGrid,
  FileText,
  LucideProps,
} from "lucide-react";
import { ServiceCategory } from "../../types";

interface CategoryIconProps extends LucideProps {
  category?: ServiceCategory | string;
  iconName?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  iconName,
  ...props
}) => {
  const iconKey = iconName || category;

  switch (iconKey) {
    case "recharge":
    case "Smartphone":
      return <Smartphone {...props} />;
    case "aeps":
    case "Fingerprint":
      return <Fingerprint {...props} />;
    case "electric_bill":
    case "Zap":
      return <Zap {...props} />;
    case "ration_card":
    case "Utensils":
      return <Utensils {...props} />;
    case "voter_card":
    case "Vote":
      return <Vote {...props} />;
    case "pan_card":
    case "CreditCard":
      return <CreditCard {...props} />;
    case "money_transfer":
    case "Send":
      return <Send {...props} />;
    case "aadhaar_services":
    case "ShieldCheck":
      return <ShieldCheck {...props} />;
    case "certificates":
    case "FileCheck":
      return <FileCheck {...props} />;
    case "printing_xerox":
    case "Printer":
      return <Printer {...props} />;
    case "ticket_booking":
    case "TrainTrack":
      return <TrainTrack {...props} />;
    case "pm_kisan":
    case "Wheat":
      return <Wheat {...props} />;
    default:
      return <FileText {...props} />;
  }
};

export const getCategoryColor = (category?: ServiceCategory | string): string => {
  switch (category) {
    case "recharge":
      return "#3b82f6";
    case "aeps":
      return "#10b981";
    case "electric_bill":
      return "#f59e0b";
    case "ration_card":
      return "#8b5cf6";
    case "voter_card":
      return "#ec4899";
    case "pan_card":
      return "#06b6d4";
    case "money_transfer":
      return "#6366f1";
    case "aadhaar_services":
      return "#14b8a6";
    case "certificates":
      return "#f97316";
    case "printing_xerox":
      return "#64748b";
    case "ticket_booking":
      return "#e11d48";
    case "pm_kisan":
      return "#84cc16";
    default:
      return "#94a3b8";
  }
};

export const formatCategoryLabel = (cat: ServiceCategory | string): string => {
  return cat
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
