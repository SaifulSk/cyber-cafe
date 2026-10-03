import React from "react";
import { Plus, User, ShieldCheck, Clock, LogIn, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  onOpenNewTask: () => void;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTask,
  onOpenLogin,
  onOpenProfile,
}) => {
  const { currentUser, userProfile, isDemoUser } = useAuth();

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="top-navbar">
      {/* Left: Kendra Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, var(--accent-primary) 0%, #0284c7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 0 15px rgba(6, 182, 212, 0.4)",
          }}
        >
          <ShieldCheck size={20} />
        </div>

        <div>
          <h1 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--text-bright)", letterSpacing: "-0.01em", margin: 0 }}>
            {userProfile?.kendraName || "Digital Seva Kendra & Cyber Cafe"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span>{todayStr}</span>
            {userProfile?.cscId && (
              <>
                <span>•</span>
                <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>{userProfile.cscId}</span>
              </>
            )}
            {isDemoUser && (
              <span
                style={{
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#fbbf24",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                }}
              >
                DEMO MODE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={onOpenNewTask} className="btn btn-primary">
          <Plus size={16} /> <span className="hide-mobile">New Task Entry</span>
        </button>

        {currentUser || isDemoUser ? (
          <button
            onClick={onOpenProfile}
            className="btn btn-secondary"
            style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "8px" }}
            title="Operator Settings"
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "rgba(6, 182, 212, 0.2)",
                color: "var(--accent-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
            >
              {(userProfile?.displayName || "O").charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600 }} className="hide-mobile">
              {userProfile?.displayName || "Operator"}
            </span>
            <Settings size={14} style={{ color: "var(--text-muted)" }} />
          </button>
        ) : (
          <button onClick={onOpenLogin} className="btn btn-secondary">
            <LogIn size={15} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
};
