import React from "react";
import { X, Printer, CheckCircle, ShieldCheck } from "lucide-react";
import { TaskItem } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { formatCategoryLabel } from "./CategoryIcon";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const { userProfile } = useAuth();

  if (!isOpen || !task) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "460px", background: "#ffffff", color: "#111827" }}
      >
        {/* Screen Controls Header (Hidden on Print) */}
        <div
          className="no-print"
          style={{
            padding: "12px 18px",
            background: "#f1f5f9",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#475569" }}>
            Customer Payment & Acknowledgement Slip
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handlePrint}
              style={{
                background: "#0284c7",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Printer size={14} /> Print Slip
            </button>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "6px",
                cursor: "pointer",
                display: "inline-flex",
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div
          id="printable-slip"
          style={{
            padding: "24px 28px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "0.875rem",
          }}
        >
          {/* Kendra Header */}
          <div style={{ textAlign: "center", borderBottom: "2px dashed #94a3b8", paddingBottom: "14px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "4px" }}>
              <ShieldCheck size={20} color="#0284c7" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                {userProfile?.kendraName || "DIGITAL SEVA KENDRA"}
              </h2>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
              Authorized Common Services Centre & Cyber Cafe
            </p>
            {userProfile?.address && (
              <p style={{ fontSize: "0.6875rem", color: "#64748b", margin: "2px 0 0" }}>
                {userProfile.address}
              </p>
            )}
            {userProfile?.phone && (
              <p style={{ fontSize: "0.6875rem", color: "#64748b", margin: "2px 0 0" }}>
                Helpline / Operator: {userProfile.phone}
              </p>
            )}
          </div>

          {/* Slip Meta */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#475569", marginBottom: "12px" }}>
            <div>
              <span>Receipt No: </span>
              <strong style={{ fontFamily: "monospace", color: "#0f172a" }}>
                {task.referenceNo || `SEVA-${task.id.slice(-6).toUpperCase()}`}
              </strong>
            </div>
            <div>
              <span>Date: </span>
              <strong>{task.date} {task.time || ""}</strong>
            </div>
          </div>

          {/* Customer Details */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "10px 12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Customer Name:</span>
              <strong style={{ color: "#0f172a" }}>{task.customerName}</strong>
            </div>
            {task.customerPhone && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Mobile Number:</span>
                <span>{task.customerPhone}</span>
              </div>
            )}
          </div>

          {/* Task / Service Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #cbd5e1", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "6px 0" }}>Particulars</th>
                <th style={{ padding: "6px 0", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px 0" }}>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>{task.title}</div>
                  <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                    Service: {formatCategoryLabel(task.serviceCategory)}
                  </div>
                  {task.notes && (
                    <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                      Details: {task.notes}
                    </div>
                  )}
                </td>
                <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 700, fontFamily: "monospace" }}>
                  ₹{task.amountCharged.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Payment Summary */}
          <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
              <span style={{ color: "#64748b" }}>Total Bill Amount:</span>
              <strong style={{ fontFamily: "monospace" }}>₹{task.amountCharged.toFixed(2)}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "#059669" }}>
              <span>Amount Paid ({task.paymentMode.toUpperCase()}):</span>
              <strong style={{ fontFamily: "monospace" }}>₹{task.amountPaid.toFixed(2)}</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.875rem",
                fontWeight: 700,
                borderTop: "1px dashed #cbd5e1",
                paddingTop: "6px",
                marginTop: "2px",
                color: task.dueAmount > 0 ? "#dc2626" : "#059669",
              }}
            >
              <span>Balance Due:</span>
              <span style={{ fontFamily: "monospace" }}>
                {task.dueAmount > 0 ? `₹${task.dueAmount.toFixed(2)}` : "NIL (PAID)"}
              </span>
            </div>
          </div>

          {/* Stamp & Footer */}
          <div style={{ marginTop: "24px", paddingTop: "14px", borderTop: "2px dashed #94a3b8", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#059669", fontSize: "0.75rem", fontWeight: 700 }}>
                <CheckCircle size={14} /> TRANSACTION CONFIRMED
              </div>
              <div style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: "2px" }}>
                Computer generated receipt.
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid #94a3b8", width: "120px", height: "30px", marginBottom: "4px" }}></div>
              <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>Operator Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
