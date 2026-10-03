import React, { useState } from "react";
import { X, DollarSign, MessageCircle, Calendar, Phone, CheckCircle, AlertTriangle } from "lucide-react";
import { Customer, TaskItem } from "../../types";
import { useData } from "../../context/DataContext";
import { CategoryIcon, getCategoryColor } from "../common/CategoryIcon";

interface CustomerLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onEditCustomer?: (c: Customer) => void;
}

export const CustomerLedgerModal: React.FC<CustomerLedgerModalProps> = ({
  isOpen,
  onClose,
  customer,
  onEditCustomer,
}) => {
  const { getCustomerHistory, settleDue } = useData();

  const [settleAmount, setSettleAmount] = useState<number | "">("");
  const [settleMode, setSettleMode] = useState<"cash" | "upi" | "bank_transfer">("cash");
  const [settleNote, setSettleNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  if (!isOpen || !customer) return null;

  const history = getCustomerHistory(customer.name);
  const netDue = history.totalDue;

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(settleAmount);
    if (!amount || amount <= 0) return;

    setSubmitting(true);
    try {
      await settleDue(
        customer.name,
        amount,
        settleMode,
        settleNote || `Payment towards outstanding balance for ${customer.name}`
      );
      setSuccessMsg(`Successfully recorded ₹${amount} payment!`);
      setSettleAmount("");
      setSettleNote("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert("Error settling due: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp reminder message
  const handleSendWhatsAppReminder = () => {
    if (!customer.phone) {
      alert("No phone number saved for this customer!");
      return;
    }
    const cleanPhone = customer.phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hello ${customer.name}, Greetings from Digital Seva Kendra! Your current outstanding balance is ₹${netDue.toFixed(2)}. Kindly clear the dues at your convenience. Thank you!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent-primary) 0%, #0284c7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "1.125rem",
              }}
            >
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-bright)" }}>
                {customer.name}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {customer.phone ? (
                  <span>Phone: {customer.phone}</span>
                ) : (
                  <span>No phone recorded</span>
                )}
                {customer.villageOrArea && (
                  <>
                    <span>•</span>
                    <span>{customer.villageOrArea}</span>
                  </>
                )}
              </div>
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

        {/* Body */}
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Summary Banner */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              background: "var(--bg-card-hover)",
              padding: "14px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Total Billed</div>
              <div className="font-mono" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                ₹{history.totalBilled.toFixed(2)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Total Paid</div>
              <div className="font-mono" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--emerald-profit)" }}>
                ₹{history.totalPaid.toFixed(2)}
              </div>
            </div>

            <div style={{ borderLeft: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.6875rem", color: "var(--rose-due)", fontWeight: 700 }}>
                Pending Balance Due
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: netDue > 0 ? "var(--rose-due)" : "var(--emerald-profit)",
                }}
              >
                ₹{netDue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Quick Actions (WhatsApp Reminder & Settle) */}
          {netDue > 0 && (
            <div
              style={{
                background: "rgba(244, 63, 94, 0.08)",
                border: "1px solid rgba(244, 63, 94, 0.25)",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--rose-due)" }}>
                  <AlertTriangle size={18} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                    Outstanding Khata Due: ₹{netDue.toFixed(2)}
                  </span>
                </div>

                {customer.phone && (
                  <button
                    onClick={handleSendWhatsAppReminder}
                    className="btn btn-sm btn-secondary"
                    style={{ borderColor: "#22c55e", color: "#4ade80" }}
                  >
                    <MessageCircle size={14} /> Send WhatsApp Reminder
                  </button>
                )}
              </div>

              {/* Settle Form */}
              <form onSubmit={handleSettle} style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, minWidth: "120px" }}>
                  <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    max={netDue}
                    className="form-input font-mono"
                    style={{ paddingLeft: "24px" }}
                    placeholder={`Pay amount (max ₹${netDue})`}
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    required
                  />
                </div>

                <select
                  className="form-select"
                  style={{ width: "auto" }}
                  value={settleMode}
                  onChange={(e) => setSettleMode(e.target.value as any)}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / Scanner</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>

                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={submitting || !settleAmount}
                >
                  <DollarSign size={14} /> {submitting ? "Saving..." : "Record Payment"}
                </button>
              </form>

              {successMsg && (
                <div style={{ fontSize: "0.75rem", color: "var(--emerald-profit)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={14} /> {successMsg}
                </div>
              )}
            </div>
          )}

          {/* Transaction History Table */}
          <div>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-bright)", marginBottom: "10px" }}>
              Complete Service History ({history.tasks.length} transactions)
            </h4>

            {history.tasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                No past transactions recorded for this customer.
              </div>
            ) : (
              <div style={{ maxHeight: "260px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                {history.tasks.map((task) => {
                  const catColor = getCategoryColor(task.serviceCategory);
                  return (
                    <div
                      key={task.id}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "var(--radius-sm)",
                            background: `${catColor}20`,
                            color: catColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CategoryIcon category={task.serviceCategory} size={15} />
                        </div>
                        <div>
                          <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                            {task.title}
                          </div>
                          <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                            {task.date} {task.time ? `• ${task.time}` : ""} {task.referenceNo ? `• Ref: ${task.referenceNo}` : ""}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div className="font-mono" style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-bright)" }}>
                          ₹{task.amountCharged}
                        </div>
                        {task.dueAmount > 0 ? (
                          <div style={{ fontSize: "0.6875rem", color: "var(--rose-due)", fontWeight: 700 }}>
                            Due: ₹{task.dueAmount}
                          </div>
                        ) : (
                          <div style={{ fontSize: "0.6875rem", color: "var(--emerald-profit)" }}>
                            Paid
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
