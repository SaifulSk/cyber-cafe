import React from "react";
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  CalendarDays,
  Users,
  Layers,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Smartphone,
  History
} from "lucide-react";
import { useData } from "../../context/DataContext";

export type ViewType = "dashboard" | "tasks" | "calendar" | "day" | "customers" | "due_history" | "masters";

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const { todayStats } = useData();

  const navItems: { id: ViewType; label: string; icon: React.ComponentType<any>; badge?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "All Tasks Ledger", icon: ListTodo },
    { id: "calendar", label: "Calendar View", icon: Calendar },
    { id: "day", label: "Day View & Drawer", icon: CalendarDays },
    { id: "customers", label: "Customer Khata", icon: Users },
    { id: "due_history", label: "Due History", icon: History },
    { id: "masters", label: "Master Menu", icon: Layers },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="app-sidebar">
        {/* Brand Header */}
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--accent-primary) 0%, #0284c7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 4px 14px rgba(6, 182, 212, 0.4)",
            }}
          >
            <ShieldCheck size={22} />
          </div>

          <div>
            <div style={{ fontSize: "1.1875rem", fontWeight: 800, color: "var(--text-bright)", letterSpacing: "-0.02em" }}>
              SevaDesk
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Digital Kendra Suite
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: isActive ? "linear-gradient(90deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)" : "transparent",
                  color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  textAlign: "left",
                  width: "100%",
                  borderLeft: isActive ? "3px solid var(--accent-primary)" : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.color = "var(--text-main)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Icon size={18} style={{ color: isActive ? "var(--accent-primary)" : "inherit" }} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      padding: "1px 6px",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(255, 255, 255, 0.08)",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Drawer: Today's Snapshot Widget */}
        <div style={{ padding: "16px" }}>
          <div
            style={{
              background: "linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "var(--radius-lg)",
              padding: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--emerald-profit)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Today's Profit
              </span>
              <TrendingUp size={14} style={{ color: "var(--emerald-profit)" }} />
            </div>

            <div className="font-mono" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--emerald-profit)" }}>
              +₹{todayStats.profit.toFixed(0)}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "6px" }}>
              <span>{todayStats.tasksCount} tasks done</span>
              <span>Dues: ₹{todayStats.dues.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              style={{
                background: "transparent",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
                color: isActive ? "var(--accent-primary)" : "var(--text-muted)",
                fontSize: "0.6875rem",
                cursor: "pointer",
                padding: "8px 4px",
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <Icon size={18} />
              <span>{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
