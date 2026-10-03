import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  ArrowRight,
  Sun,
  Moon,
  Smartphone,
  Zap,
  Fingerprint,
  Users,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export const LoginPage: React.FC = () => {
  const { loginUser, registerUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [kendraName, setKendraName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (!name.trim()) throw new Error("Please enter your name");
        if (!email.trim() || !password) throw new Error("Email and password are required");
        if (password.length < 6) throw new Error("Password must be at least 6 characters");

        await registerUser(email, password, name, kendraName || "Digital Seva Kendra", phone);
      } else {
        if (!email.trim() || !password) throw new Error("Please enter email and password");
        await loginUser(email, password);
      }
    } catch (err: any) {
      let msg = err.message || "Authentication failed";
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        msg = "Invalid email or password. Please verify your credentials.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "This email address is already registered. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-primary)",
        color: "var(--text-main)",
        position: "relative",
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-glass)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              boxShadow: "0 2px 10px rgba(6, 182, 212, 0.35)",
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-bright)", letterSpacing: "-0.02em" }}>
              SevaDesk
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "8px" }}>
              Digital Kendra Portal
            </span>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-outline btn-sm"
          style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "6px" }}
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          <span style={{ fontSize: "0.8125rem" }}>{theme === "light" ? "Dark" : "Light"} Mode</span>
        </button>
      </header>

      {/* Main Login / Hero Container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
        }}
      >
        <div
          className="glass-panel"
          style={{
            width: "100%",
            maxWidth: "460px",
            padding: "32px 28px",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Logo & Intro */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "var(--radius-lg)",
                background: "linear-gradient(135deg, var(--accent-primary) 0%, #0284c7 100%)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 16px rgba(6, 182, 212, 0.4)",
                marginBottom: "12px",
              }}
            >
              <ShieldCheck size={28} />
            </div>

            <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--text-bright)", letterSpacing: "-0.02em" }}>
              {mode === "login" ? "Sign In to Your Kendra" : "Register Digital Seva Center"}
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Manage recharges, AEPS, bills, cards, daily cashbook & customer dues
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(0,0,0,0.06)",
              borderRadius: "var(--radius-md)",
              padding: "4px",
              marginBottom: "20px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: mode === "login" ? "var(--bg-card)" : "transparent",
                color: mode === "login" ? "var(--text-bright)" : "var(--text-secondary)",
                fontWeight: 700,
                fontSize: "0.8125rem",
                cursor: "pointer",
                boxShadow: mode === "login" ? "var(--shadow-sm)" : "none",
                transition: "all var(--transition-fast)",
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMsg("");
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: mode === "register" ? "var(--bg-card)" : "transparent",
                color: mode === "register" ? "var(--text-bright)" : "var(--text-secondary)",
                fontWeight: 700,
                fontSize: "0.8125rem",
                cursor: "pointer",
                boxShadow: mode === "register" ? "var(--shadow-sm)" : "none",
                transition: "all var(--transition-fast)",
              }}
            >
              Register New Center
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                background: "rgba(244, 63, 94, 0.12)",
                border: "1px solid rgba(244, 63, 94, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                color: "#e11d48",
                fontSize: "0.8125rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {mode === "register" && (
              <>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Digital Seva Kendra / Cafe Name *</label>
                  <div style={{ position: "relative" }}>
                    <Building
                      size={16}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)",
                      }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: "36px" }}
                      placeholder="e.g. Maa Tara Digital Seva Kendra"
                      value={kendraName}
                      onChange={(e) => setKendraName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Operator Full Name *</label>
                  <div style={{ position: "relative" }}>
                    <User
                      size={16}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)",
                      }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: "36px" }}
                      placeholder="Your Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Helpline / WhatsApp Number</label>
                  <div style={{ position: "relative" }}>
                    <Phone
                      size={16}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)",
                      }}
                    />
                    <input
                      type="tel"
                      className="form-input"
                      style={{ paddingLeft: "36px" }}
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email ID *</label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: "36px" }}
                  placeholder="operator@digitalseva.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Password *</label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: "36px" }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: "6px" }}
              disabled={loading}
            >
              {loading ? "Authenticating..." : mode === "login" ? "Sign In" : "Register Center"}
            </button>
          </form>

          {/* Footer note */}
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border-subtle)",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            🔒 All tasks, customer khata, and financial records are securely isolated to your private account.
          </div>
        </div>
      </div>
    </div>
  );
};
