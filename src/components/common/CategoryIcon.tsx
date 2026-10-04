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
  Layers,
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
  const normalized = (iconName || category || "").toLowerCase().trim();

  if (normalized.includes("recharge") || normalized.includes("mobile") || normalized.includes("dth")) {
    return <Smartphone {...props} />;
  }
  if (normalized.includes("aeps") || normalized.includes("fingerprint")) {
    return <Fingerprint {...props} />;
  }
  if (normalized.includes("electric") || normalized.includes("power") || normalized.includes("bill")) {
    return <Zap {...props} />;
  }
  if (normalized.includes("ration")) {
    return <Utensils {...props} />;
  }
  if (normalized.includes("voter") || normalized.includes("election")) {
    return <Vote {...props} />;
  }
  if (normalized.includes("pan") || normalized.includes("card")) {
    return <CreditCard {...props} />;
  }
  if (normalized.includes("money") || normalized.includes("transfer") || normalized.includes("dmt") || normalized.includes("remit")) {
    return <Send {...props} />;
  }
  if (normalized.includes("aadhaar") || normalized.includes("uidai")) {
    return <ShieldCheck {...props} />;
  }
  if (normalized.includes("cert") || normalized.includes("caste") || normalized.includes("income") || normalized.includes("domicile")) {
    return <FileCheck {...props} />;
  }
  if (normalized.includes("print") || normalized.includes("xerox") || normalized.includes("photo") || normalized.includes("lamination")) {
    return <Printer {...props} />;
  }
  if (normalized.includes("ticket") || normalized.includes("train") || normalized.includes("irctc") || normalized.includes("bus")) {
    return <TrainTrack {...props} />;
  }
  if (normalized.includes("kisan") || normalized.includes("farmer")) {
    return <Wheat {...props} />;
  }

  return <Layers {...props} />;
};

export const getCategoryColor = (category?: ServiceCategory | string): string => {
  const normalized = (category || "").toLowerCase().trim();

  if (normalized.includes("recharge") || normalized.includes("mobile") || normalized.includes("dth")) {
    return "#0284c7"; // Blue
  }
  if (normalized.includes("aeps") || normalized.includes("fingerprint")) {
    return "#059669"; // Emerald
  }
  if (normalized.includes("electric") || normalized.includes("power") || normalized.includes("bill")) {
    return "#d97706"; // Amber
  }
  if (normalized.includes("ration")) {
    return "#7c3aed"; // Violet
  }
  if (normalized.includes("voter") || normalized.includes("election")) {
    return "#db2777"; // Pink
  }
  if (normalized.includes("pan") || normalized.includes("card")) {
    return "#0891b2"; // Cyan
  }
  if (normalized.includes("money") || normalized.includes("transfer") || normalized.includes("dmt")) {
    return "#4f46e5"; // Indigo
  }
  if (normalized.includes("aadhaar")) {
    return "#0d9488"; // Teal
  }
  if (normalized.includes("cert")) {
    return "#ea580c"; // Orange
  }
  if (normalized.includes("print") || normalized.includes("xerox")) {
    return "#64748b"; // Slate
  }
  if (normalized.includes("ticket") || normalized.includes("train")) {
    return "#e11d48"; // Rose
  }
  if (normalized.includes("kisan")) {
    return "#65a30d"; // Lime
  }

  // Consistent pleasant color for any custom user category
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#0284c7", "#059669", "#7c3aed", "#d97706", "#0891b2", "#db2777", "#4f46e5", "#0d9488"];
  return colors[Math.abs(hash) % colors.length];
};

export const formatCategoryLabel = (cat: ServiceCategory | string): string => {
  if (!cat) return "";
  return cat
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
