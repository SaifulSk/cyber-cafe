import React, { useState } from "react";
import { X, Lock, Mail, User, ShieldCheck, Sparkles, Building, Phone, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginUser, registerUser, loginAsDemo } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [kendraName, setKendraName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

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
      onClose();
    } catch (err: any) {
      let msg = err.message || "Authentication failed";
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        msg = "Invalid email or password. Please verify your credentials.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "This email address is already registered. Please login instead.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = () => {
    loginAsDemo();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "var(--radius-md)",
                background: "rgba(6, 182, 212, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-primary)",
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                {mode === "login" ? "Operator Sign In" : "Register Digital Seva Center"}
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Each operator maintains their private tasks, margins & khata
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: "6px", borderRadius: "50%", width: "32px", height: "32px" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)" }}>
          <button
            type="button"
            onClick={() => { setMode("login"); setErrorMsg(""); }}
            style={{
              flex: 1,
              padding: "12px",
              background: mode === "login" ? "rgba(255,255,255,0.04)" : "transparent",
              border: "none",
              borderBottom: mode === "login" ? "2px solid var(--accent-primary)" : "2px solid transparent",
              color: mode === "login" ? "var(--accent-primary)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setErrorMsg(""); }}
            style={{
              flex: 1,
              padding: "12px",
              background: mode === "register" ? "rgba(255,255,255,0.04)" : "transparent",
              border: "none",
              borderBottom: mode === "register" ? "2px solid var(--accent-primary)" : "2px solid transparent",
              color: mode === "register" ? "var(--accent-primary)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            New Center Registration
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {errorMsg && (
              <div
                style={{
                  background: "rgba(244, 63, 94, 0.15)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  color: "#fca5a5",
                  fontSize: "0.8125rem",
                }}
              >
                {errorMsg}
              </div>
            )}

            {mode === "register" && (
              <>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Kendra / Cyber Cafe Name *</label>
                  <div style={{ position: "relative" }}>
                    <Building size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: "36px" }}
                      placeholder="e.g. Maa Durga Digital Seva Kendra"
                      value={kendraName}
                      onChange={(e) => setKendraName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Operator Full Name *</label>
                  <div style={{ position: "relative" }}>
                    <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: "36px" }}
                      placeholder="e.g. Saiful Sk"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Contact / Helpline Mobile</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      type="tel"
                      className="form-input"
                      style={{ paddingLeft: "36px" }}
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Operator Email ID *</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
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
                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
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

            <button type="submit" className="btn btn-primary" style={{ marginTop: "6px" }} disabled={loading}>
              {loading ? "Processing..." : mode === "login" ? "Sign In to SevaDesk" : "Register & Start Managing"}
            </button>

            {/* Instant Demo Access Button */}
            <div style={{ textAlign: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", marginTop: "4px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                Want to test immediately without signing up?
              </span>
              <button
                type="button"
                onClick={handleDemoClick}
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Sparkles size={14} style={{ color: "var(--accent-primary)" }} /> Launch Demo Operator Account
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
