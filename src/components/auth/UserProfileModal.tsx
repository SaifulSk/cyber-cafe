import React, { useState } from "react";
import { X, Building, User, Phone, MapPin, Award, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateKendraProfile, logoutUser } = useAuth();

  const [kendraName, setKendraName] = useState(userProfile?.kendraName || "");
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [cscId, setCscId] = useState(userProfile?.cscId || "");
  const [address, setAddress] = useState(userProfile?.address || "");
  const [savedNotice, setSavedNotice] = useState(false);

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
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
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
                placeholder="e.g. New Life Digital Seva Kendra"
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
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">CSC / VLE ID (Optional)</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. CSC-WB-10928"
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
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Physical Center Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Shop No. 4, Market Complex, Station Road"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
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
