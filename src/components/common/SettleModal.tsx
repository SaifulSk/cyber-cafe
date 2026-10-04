import React, { useState, useEffect } from "react";
import { X, DollarSign, CheckCircle } from "lucide-react";
import { TaskItem } from "../../types";
import { useData } from "../../context/DataContext";

interface SettleModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
}

export const SettleModal: React.FC<SettleModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const { settleDue } = useData();

  const [amount, setAmount] = useState<number | "">("");
  const [paidDate, setPaidDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paidTime, setPaidTime] = useState<string>(new Date().toTimeString().split(" ")[0].substring(0, 5));
  const [mode, setMode] = useState<"cash" | "upi" | "bank_transfer">("cash");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Background scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      return () => document.body.classList.remove("modal-open");
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setAmount(task.dueAmount);
      setPaidDate(new Date().toISOString().split("T")[0]);
      setPaidTime(new Date().toTimeString().split(" ")[0].substring(0, 5));
      setNote(`Due payment clearance for task: ${task.title}`);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payVal = Number(amount);
    if (!payVal || payVal <= 0) return;

    setSubmitting(true);
    try {
      await settleDue(
        task.customerName,
        payVal,
        mode,
        note,
        paidDate,
        paidTime,
        task.id,
        task.title
      );

      onClose();
    } catch (err: any) {
      alert("Error settling due: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--emerald-profit)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DollarSign size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                Collect Outstanding Due
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Record payment and clear client balance
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
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Task Details:</div>
              <div style={{ fontWeight: 700, color: "var(--text-bright)", fontSize: "0.875rem" }}>{task.title}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                Customer: <strong>{task.customerName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current Due:</span>
                <span className="font-mono text-due" style={{ fontWeight: 700 }}>₹{task.dueAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Payment Amount Collected *</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--emerald-profit)", fontWeight: 700 }}>
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max={task.dueAmount}
                  className="form-input font-mono"
                  style={{ paddingLeft: "28px" }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Payment Date & Time */}
            <div className="task-modal-grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Payment Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Payment Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={paidTime}
                  onChange={(e) => setPaidTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Payment Mode</label>
              <select className="form-select" value={mode} onChange={(e) => setMode(e.target.value as any)}>
                <option value="cash">Cash</option>
                <option value="upi">UPI / QR</option>
                <option value="bank_transfer">Card / Bank Transfer</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Receipt Note (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter note or payment reference"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={submitting || !amount}>
              {submitting ? "Saving..." : "Record & Clear Due"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
