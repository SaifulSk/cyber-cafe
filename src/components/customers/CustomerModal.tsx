import React, { useState, useEffect } from "react";
import { X, User, Phone, MapPin, Mail, MessageSquare } from "lucide-react";
import { Customer } from "../../types";
import { useData } from "../../context/DataContext";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
  onCustomerCreated?: (newCustomer: Customer) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
  onCustomerCreated,
}) => {
  const { addCustomer, updateCustomer } = useData();

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [residence, setResidence] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Lock background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      return () => document.body.classList.remove("modal-open");
    }
  }, [isOpen]);

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone || "");
      setWhatsapp(customerToEdit.whatsapp || "");
      setEmail(customerToEdit.email || "");
      setResidence(customerToEdit.residence || customerToEdit.villageOrArea || customerToEdit.address || "");
    } else {
      setName("");
      setPhone("");
      setWhatsapp("");
      setEmail("");
      setResidence("");
      setErrorMsg("");
    }
  }, [customerToEdit, isOpen]);

  const handleCopyPhoneToWhatsapp = () => {
    if (phone.trim()) {
      setWhatsapp(phone.trim());
    }
  };

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
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        email: email.trim() || undefined,
        residence: residence.trim() || undefined,
      };

      let saved: Customer;
      if (customerToEdit) {
        saved = await updateCustomer({ ...customerToEdit, ...custData });
      } else {
        saved = await addCustomer(custData);
      }

      if (onCustomerCreated) {
        onCustomerCreated(saved);
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
                Save contact details to your customer directory
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
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter customer full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="form-label" style={{ margin: 0 }}>WhatsApp Number</label>
                  {phone && (
                    <button
                      type="button"
                      onClick={handleCopyPhoneToWhatsapp}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-primary)",
                        fontSize: "0.6875rem",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      Same as phone
                    </button>
                  )}
                </div>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Enter WhatsApp number"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Residence</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter village, area, or residential address"
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
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
