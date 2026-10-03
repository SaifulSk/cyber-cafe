import React from "react";
import { Plus, ShieldCheck, Sun, Moon, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface NavbarProps {
  onOpenNewTask: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTask,
  onOpenProfile,
}) => {
  const { userProfile, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="top-navbar">
      {/* Left: Kendra Identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
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
            boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)",
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={20} />
        </div>

        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--text-bright)",
              letterSpacing: "-0.01em",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {userProfile?.kendraName || "Digital Seva Kendra"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span className="hide-mobile">{todayStr}</span>
            {userProfile?.cscId && (
              <>
                <span className="hide-mobile">•</span>
                <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>{userProfile.cscId}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-outline btn-sm"
          style={{ padding: "7px 10px" }}
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          <span className="hide-mobile">{theme === "light" ? "Dark" : "Light"}</span>
        </button>

        {/* New Task CTA */}
        <button onClick={onOpenNewTask} className="btn btn-primary btn-sm">
          <Plus size={15} /> <span className="hide-mobile">New Task</span>
        </button>

        {/* Profile / Kendra Settings */}
        <button
          onClick={onOpenProfile}
          className="btn btn-secondary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px" }}
          title="Center Profile & Settings"
        >
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "rgba(2, 132, 199, 0.15)",
              color: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.6875rem",
            }}
          >
            {(userProfile?.displayName || "O").charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600 }} className="hide-mobile">
            {userProfile?.displayName || "Operator"}
          </span>
          <Settings size={13} style={{ color: "var(--text-muted)" }} />
        </button>

        {/* Sign Out Button */}
        <button
          onClick={logoutUser}
          className="btn btn-outline btn-sm"
          style={{ padding: "7px 10px" }}
          title="Sign Out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};
