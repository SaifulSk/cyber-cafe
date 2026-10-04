import React, { useState, useEffect } from "react";
import { X, DollarSign, MessageCircle, Calendar, Phone, CheckCircle, AlertTriangle, History, Clock, Trash2 } from "lucide-react";
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
  const { getCustomerHistory, settleDue, duePayments, deleteDuePayment } = useData();

  const [settleAmount, setSettleAmount] = useState<number | "">("");
  const [settleMode, setSettleMode] = useState<"cash" | "upi" | "bank_transfer">("cash");
  const [paidDate, setPaidDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paidTime, setPaidTime] = useState<string>(
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
  );
  const [settleNote, setSettleNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"tasks" | "dues">("tasks");

  useEffect(() => {
    if (isOpen && customer) {
      document.body.classList.add("modal-open");
      return () => {
        document.body.classList.remove("modal-open");
      };
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const history = getCustomerHistory(customer.name);
  const netDue = history.totalDue;

  const customerDuePayments = duePayments.filter(
    (p) => p.customerName.toLowerCase().trim() === customer.name.toLowerCase().trim()
  );

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
        settleNote || `Payment towards balance for ${customer.name}`,
        paidDate,
        paidTime
      );
      setSuccessMsg(`Successfully recorded ₹${amount} payment on ${paidDate}!`);
      setSettleAmount("");
      setSettleNote("");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      alert("Error settling due: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp reminder message
  const handleSendWhatsAppReminder = () => {
    const phoneNum = customer.whatsapp || customer.phone;
    if (!phoneNum) {
      alert("No phone or WhatsApp number saved for this customer!");
      return;
    }
    const cleanPhone = phoneNum.replace(/[^0-9]/g, "");
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                {customer.phone && <span>Phone: {customer.phone}</span>}
                {customer.whatsapp && <span>• WA: {customer.whatsapp}</span>}
                {(customer.residence || customer.villageOrArea) && (
                  <span>• {customer.residence || customer.villageOrArea}</span>
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

                {(customer.phone || customer.whatsapp) && (
                  <button
                    onClick={handleSendWhatsAppReminder}
                    className="btn btn-sm btn-secondary"
                    style={{ borderColor: "#22c55e", color: "#4ade80" }}
                  >
                    <MessageCircle size={14} /> Send WhatsApp Reminder
                  </button>
                )}
              </div>

              {/* Settle Form with Date & Time tracking */}
              <form onSubmit={handleSettle} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                  <div>
                    <label style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", marginBottom: "3px", display: "block" }}>Payment Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={paidDate}
                      onChange={(e) => setPaidDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", marginBottom: "3px", display: "block" }}>Payment Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={paidTime}
                      onChange={(e) => setPaidTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", marginBottom: "3px", display: "block" }}>Payment Mode</label>
                    <select
                      className="form-select"
                      value={settleMode}
                      onChange={(e) => setSettleMode(e.target.value as any)}
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI / QR</option>
                      <option value="bank_transfer">Card / Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ position: "relative", flex: "1 1 140px" }}>
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
                      placeholder="Enter payment amount"
                      value={settleAmount}
                      onChange={(e) => setSettleAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      required
                    />
                  </div>

                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: "2 1 180px" }}
                    placeholder="Enter payment note / remarks (optional)"
                    value={settleNote}
                    onChange={(e) => setSettleNote(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={submitting || !settleAmount}
                    style={{ flexShrink: 0 }}
                  >
                    <DollarSign size={14} /> {submitting ? "Saving..." : "Record Payment"}
                  </button>
                </div>
              </form>

              {successMsg && (
                <div style={{ fontSize: "0.75rem", color: "var(--emerald-profit)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={14} /> {successMsg}
                </div>
              )}
            </div>
          )}

          {/* Navigation Tabs for History */}
          <div>
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px", marginBottom: "12px" }}>
              <button
                type="button"
                onClick={() => setActiveTab("tasks")}
                className={`btn btn-sm ${activeTab === "tasks" ? "btn-primary" : "btn-outline"}`}
                style={{ fontSize: "0.8125rem" }}
              >
                Task Entries ({history.tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("dues")}
                className={`btn btn-sm ${activeTab === "dues" ? "btn-primary" : "btn-outline"}`}
                style={{ fontSize: "0.8125rem", display: "inline-flex", alignItems: "center", gap: "5px" }}
              >
                <History size={13} /> Due Payment Clearances ({customerDuePayments.length})
              </button>
            </div>

            {/* Tab: Tasks */}
            {activeTab === "tasks" && (
              <div>
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
            )}

            {/* Tab: Due Payment Clearances History */}
            {activeTab === "dues" && (
              <div>
                {customerDuePayments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                    No recorded due clearance payments for this customer yet.
                  </div>
                ) : (
                  <div style={{ maxHeight: "260px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {customerDuePayments.map((payment) => (
                      <div
                        key={payment.id}
                        style={{
                          background: "rgba(16, 185, 129, 0.05)",
                          border: "1px solid rgba(16, 185, 129, 0.2)",
                          borderRadius: "var(--radius-md)",
                          padding: "10px 14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <CheckCircle size={15} style={{ color: "var(--emerald-profit)" }} />
                            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-bright)" }}>
                              Payment Cleared: ₹{payment.amount.toFixed(2)}
                            </span>
                            <span
                              style={{
                                fontSize: "0.6875rem",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                background: "var(--bg-card-hover)",
                                border: "1px solid var(--border-subtle)",
                                textTransform: "uppercase",
                                fontWeight: 700,
                              }}
                            >
                              {(payment.paymentMode || (payment as any).mode) === "bank_transfer"
                                ? "Card / Bank Transfer"
                                : (payment.paymentMode || (payment as any).mode) === "upi"
                                ? "UPI / QR"
                                : "Cash"}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <span><Calendar size={11} style={{ display: "inline", verticalAlign: "middle" }} /> {payment.paidDate}</span>
                            {payment.paidTime && <span><Clock size={11} style={{ display: "inline", verticalAlign: "middle" }} /> {payment.paidTime}</span>}
                            {(payment.notes || (payment as any).note) && <span>• {payment.notes || (payment as any).note}</span>}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="font-mono" style={{ fontSize: "1rem", fontWeight: 800, color: "var(--emerald-profit)" }}>
                            +₹{payment.amount.toFixed(2)}
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Delete settlement of ₹${payment.amount} and re-add due to customer?`)) {
                                await deleteDuePayment(payment.id);
                              }
                            }}
                            className="btn btn-sm btn-danger-outline"
                            style={{ padding: "4px 8px" }}
                            title="Delete Settlement & Re-add Due"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
