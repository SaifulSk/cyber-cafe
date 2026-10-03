import React, { useState, useEffect } from "react";
import { X, User, Phone, MapPin, CreditCard, FileText } from "lucide-react";
import { Customer } from "../../types";
import { useData } from "../../context/DataContext";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
}) => {
  const { addCustomer, updateCustomer } = useData();

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [aadhaarLast4, setAadhaarLast4] = useState<string>("");
  const [villageOrArea, setVillageOrArea] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone || "");
      setEmail(customerToEdit.email || "");
      setAadhaarLast4(customerToEdit.aadhaarLast4 || "");
      setVillageOrArea(customerToEdit.villageOrArea || "");
      setNotes(customerToEdit.notes || "");
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setAadhaarLast4("");
      setVillageOrArea("");
      setNotes("");
      setErrorMsg("");
    }
  }, [customerToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter customer name");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const custData = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        aadhaarLast4: aadhaarLast4.trim() || undefined,
        villageOrArea: villageOrArea.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (customerToEdit) {
        await updateCustomer({ ...customerToEdit, ...custData });
      } else {
        await addCustomer(custData);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save customer");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "rgba(6, 182, 212, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-primary)",
              }}
            >
              <User size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                {customerToEdit ? "Edit Customer Record" : "Add New Customer Master"}
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Add to your permanent Seva Kendra contact & Khata ledger
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

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Customer Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Mondal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone / WhatsApp</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Aadhaar (Last 4 digits)</label>
                <input
                  type="text"
                  maxLength={4}
                  className="form-input font-mono"
                  placeholder="e.g. 4821"
                  value={aadhaarLast4}
                  onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Village / Ward / Locality</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rampur Village, Ward 4"
                value={villageOrArea}
                onChange={(e) => setVillageOrArea(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email ID (Optional)</label>
              <input
                type="email"
                className="form-input"
                placeholder="customer@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Notes / Relationship Details</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Regular recharge customer / Teacher at primary school"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : customerToEdit ? "Update Customer" : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
