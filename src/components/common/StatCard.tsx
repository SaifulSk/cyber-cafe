import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  variant?: "primary" | "emerald" | "rose" | "amber" | "indigo";
  badge?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  variant = "primary",
  badge,
  onClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "emerald":
        return {
          glow: "var(--shadow-profit)",
          iconBg: "rgba(16, 185, 129, 0.15)",
          iconColor: "var(--emerald-profit)",
          borderColor: "rgba(16, 185, 129, 0.2)",
        };
      case "rose":
        return {
          glow: "var(--shadow-due)",
          iconBg: "rgba(244, 63, 94, 0.15)",
          iconColor: "var(--rose-due)",
          borderColor: "rgba(244, 63, 94, 0.2)",
        };
      case "amber":
        return {
          glow: "0 0 20px rgba(245, 158, 11, 0.15)",
          iconBg: "rgba(245, 158, 11, 0.15)",
          iconColor: "var(--amber-warning)",
          borderColor: "rgba(245, 158, 11, 0.2)",
        };
      case "indigo":
        return {
          glow: "0 0 20px rgba(99, 102, 241, 0.15)",
          iconBg: "rgba(99, 102, 241, 0.15)",
          iconColor: "var(--indigo-brand)",
          borderColor: "rgba(99, 102, 241, 0.2)",
        };
      default:
        return {
          glow: "var(--shadow-glow)",
          iconBg: "rgba(6, 182, 212, 0.15)",
          iconColor: "var(--accent-primary)",
          borderColor: "rgba(6, 182, 212, 0.2)",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={`glass-panel ${onClick ? "clickable" : ""}`}
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderColor: styles.borderColor,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
        <div>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            {title}
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
            <h3
              className="font-mono"
              style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--text-bright)", letterSpacing: "-0.02em" }}
            >
              {value}
            </h3>
            {badge && (
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  background: styles.iconBg,
                  color: styles.iconColor,
                  fontWeight: 600,
                }}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "var(--radius-md)",
            background: styles.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: styles.iconColor,
            flexShrink: 0,
          }}
        >
          <Icon size={22} />
        </div>
      </div>

      {subValue && (
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
          {subValue}
        </div>
      )}
    </div>
  );
};
