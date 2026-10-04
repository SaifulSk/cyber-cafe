import React, { useState, useEffect } from "react";
import { X, Building, Check, Palette, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateKendraProfile, logoutUser } = useAuth();
  const { theme, setTheme, colorTheme, setColorTheme, palettes } = useTheme();

  const [kendraName, setKendraName] = useState(userProfile?.kendraName || "");
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [cscId, setCscId] = useState(userProfile?.cscId || "");
  const [address, setAddress] = useState(userProfile?.address || "");
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      return () => {
        document.body.classList.remove("modal-open");
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateKendraProfile({
      kendraName: kendraName.trim(),
      displayName: displayName.trim(),
      phone: phone.trim(),
      cscId: cscId.trim(),
      address: address.trim(),
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Building size={20} style={{ color: "var(--accent-primary)" }} />
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                Center Profile & Settings
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Configures your printed receipt headers and operator credentials
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

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Digital Seva Kendra / Cafe Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter digital seva kendra or shop name"
                value={kendraName}
                onChange={(e) => setKendraName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Operator Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter operator name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">CSC / VLE ID (Optional)</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="Enter CSC / VLE ID"
                  value={cscId}
                  onChange={(e) => setCscId(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Helpline / WhatsApp Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Enter 10-digit mobile or helpline number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Physical Center Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter center address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Theme & Color Palette Selector */}
            <div
              style={{
                marginTop: "4px",
                padding: "14px 16px",
                background: "var(--bg-card-hover)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Palette size={18} style={{ color: "var(--accent-primary)" }} />
                  <div>
                    <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-bright)", margin: 0 }}>
                      Theme & Color Palette
                    </h4>
                    <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", margin: "1px 0 0" }}>
                      Choose your preferred theme mode and primary brand accent
                    </p>
                  </div>
                </div>

                {/* Light / Dark Mode Toggle */}
                <div
                  style={{
                    display: "inline-flex",
                    background: "var(--bg-primary)",
                    padding: "3px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: theme === "light" ? "var(--bg-secondary)" : "transparent",
                      color: theme === "light" ? "var(--accent-primary)" : "var(--text-muted)",
                      fontWeight: theme === "light" ? 700 : 500,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      boxShadow: theme === "light" ? "var(--shadow-sm)" : "none",
                    }}
                  >
                    <Sun size={13} /> Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: theme === "dark" ? "var(--bg-secondary)" : "transparent",
                      color: theme === "dark" ? "var(--accent-primary)" : "var(--text-muted)",
                      fontWeight: theme === "dark" ? 700 : 500,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      boxShadow: theme === "dark" ? "var(--shadow-sm)" : "none",
                    }}
                  >
                    <Moon size={13} /> Dark
                  </button>
                </div>
              </div>

              {/* Color Palette Grid */}
              <div>
                <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>
                  Brand Accent Palette
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: "8px",
                  }}
                >
                  {palettes.map((p) => {
                    const isSelected = colorTheme === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setColorTheme(p.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 10px",
                          borderRadius: "var(--radius-md)",
                          background: isSelected ? "var(--bg-secondary)" : "var(--bg-primary)",
                          border: isSelected ? `2px solid ${p.primary}` : "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          transition: "all var(--transition-fast)",
                          textAlign: "left",
                          boxShadow: isSelected ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none",
                        }}
                      >
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${p.primary} 0%, ${p.secondary} 100%)`,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `0 2px 6px ${p.primary}40`,
                          }}
                        >
                          {isSelected && <Check size={11} color="#ffffff" strokeWidth={3} />}
                        </div>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? "var(--text-bright)" : "var(--text-main)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Account Email: <strong style={{ color: "var(--text-main)" }}>{userProfile?.email || "Demo Operator"}</strong>
            </div>

            {savedNotice && (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "var(--emerald-profit)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8125rem",
                }}
              >
                <Check size={16} /> Center settings saved successfully!
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ justifyContent: "space-between" }}>
            <button
              type="button"
              onClick={() => {
                logoutUser();
                onClose();
              }}
              className="btn btn-danger-outline btn-sm"
            >
              Sign Out
            </button>

            <div style={{ display: "flex", gap: "8px" }}>
              <button type="button" onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
