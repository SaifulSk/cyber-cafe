import React, { useState, useMemo, useEffect } from "react";
import {
  History,
  Search,
  DollarSign,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  X,
  CreditCard,
  Clock,
  Download
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { DuePaymentRecord, PaymentMode } from "../../types";
import { StatCard } from "../common/StatCard";
import { ConfirmDeleteModal } from "../common/ConfirmDeleteModal";

interface EditDuePaymentModalProps {
  record: DuePaymentRecord;
  onClose: () => void;
  onSave: (record: DuePaymentRecord) => Promise<void>;
}

const EditDuePaymentModal: React.FC<EditDuePaymentModalProps> = ({ record, onClose, onSave }) => {
  const [amount, setAmount] = useState<number | "">(record.amount);
  const [paidDate, setPaidDate] = useState<string>(record.paidDate || "");
  const [paidTime, setPaidTime] = useState<string>(record.paidTime || "");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(record.paymentMode || "cash");
  const [notes, setNotes] = useState<string>(record.notes || "");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) return;

    setSubmitting(true);
    try {
      await onSave({
        ...record,
        amount: val,
        paidDate,
        paidTime,
        paymentMode,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      alert("Error updating record: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "rgba(2, 132, 199, 0.15)",
                color: "var(--accent-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Edit2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                Edit Settlement Record
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Update collection amount, date, payment mode or notes
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
            {/* Meta Info banner */}
            <div
              style={{
                background: "rgba(0,0,0,0.25)",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Customer:</div>
              <div style={{ fontWeight: 700, color: "var(--text-bright)", fontSize: "0.875rem" }}>
                {record.customerName}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                Task: <strong>{record.taskTitle}</strong>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Payment Amount Collected (₹) *</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--emerald-profit)", fontWeight: 700 }}>
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  className="form-input font-mono"
                  style={{ paddingLeft: "28px" }}
                  placeholder="Enter payment amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                  autoFocus
                />
              </div>
            </div>

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
              <select
                className="form-select"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI / QR</option>
                <option value="bank_transfer">Card / Bank Transfer</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Notes / Remarks</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter payment notes or reference"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !amount}>
              {submitting ? "Saving..." : "Update Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const DuePaymentsView: React.FC = () => {
  const { duePayments, deleteDuePayment, updateDuePayment } = useData();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customDate, setCustomDate] = useState<string>("");
  const [editingRecord, setEditingRecord] = useState<DuePaymentRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<DuePaymentRecord | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const currentMonthPrefix = todayStr.substring(0, 7);

  // Filtered due payments
  const filteredRecords = useMemo(() => {
    return duePayments.filter((p) => {
      // 1. Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesCust = p.customerName.toLowerCase().includes(query);
        const matchesTitle = p.taskTitle.toLowerCase().includes(query);
        const matchesNotes = p.notes?.toLowerCase().includes(query);
        if (!matchesCust && !matchesTitle && !matchesNotes) return false;
      }

      // 2. Date filter
      if (dateFilter === "today" && p.paidDate !== todayStr) return false;
      if (dateFilter === "yesterday" && p.paidDate !== yesterdayStr) return false;
      if (dateFilter === "this_month" && !p.paidDate.startsWith(currentMonthPrefix)) return false;
      if (dateFilter === "custom" && customDate && p.paidDate !== customDate) return false;

      return true;
    });
  }, [duePayments, searchTerm, dateFilter, customDate, todayStr, yesterdayStr, currentMonthPrefix]);

  // Aggregate stats
  const totalCollectedAllTime = useMemo(() => {
    return duePayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [duePayments]);

  const totalCollectedToday = useMemo(() => {
    return duePayments
      .filter((p) => p.paidDate === todayStr)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [duePayments, todayStr]);

  const filteredTotal = useMemo(() => {
    return filteredRecords.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [filteredRecords]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = ["Payment ID", "Paid Date", "Paid Time", "Customer Name", "Task Title", "Amount (INR)", "Payment Mode", "Notes"];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.paidDate,
      r.paidTime || "",
      `"${r.customerName.replace(/"/g, '""')}"`,
      `"${r.taskTitle.replace(/"/g, '""')}"`,
      r.amount,
      r.paymentMode,
      `"${(r.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `due_payments_history_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-bright)", letterSpacing: "-0.02em" }}>
            Due Payments History
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            Complete audit trail of all customer credit settlements and cash clearances
          </p>
        </div>

        {filteredRecords.length > 0 && (
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm">
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          title="Total Dues Collected"
          value={`₹${totalCollectedAllTime.toFixed(2)}`}
          subValue={`${duePayments.length} total settlements logged`}
          icon={DollarSign}
          variant="emerald"
        />

        <StatCard
          title="Collected Today"
          value={`₹${totalCollectedToday.toFixed(2)}`}
          subValue="Settlements processed today"
          icon={Clock}
          variant="primary"
        />

        <StatCard
          title="Filtered Balance Collected"
          value={`₹${filteredTotal.toFixed(2)}`}
          subValue={`${filteredRecords.length} records matching filters`}
          icon={CreditCard}
          variant="indigo"
        />
      </div>

      {/* Filter Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          {/* Search Box */}
          <div style={{ position: "relative", flex: "1 1 260px", maxWidth: "400px" }}>
            <Search
              size={15}
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
              placeholder="Search by customer name, task, or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Filter Badges */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => setDateFilter("all")}
              className={`btn btn-sm ${dateFilter === "all" ? "btn-primary" : "btn-outline"}`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter("today")}
              className={`btn btn-sm ${dateFilter === "today" ? "btn-primary" : "btn-outline"}`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter("yesterday")}
              className={`btn btn-sm ${dateFilter === "yesterday" ? "btn-primary" : "btn-outline"}`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setDateFilter("this_month")}
              className={`btn btn-sm ${dateFilter === "this_month" ? "btn-primary" : "btn-outline"}`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateFilter("custom")}
              className={`btn btn-sm ${dateFilter === "custom" ? "btn-primary" : "btn-outline"}`}
            >
              Custom Date
            </button>

            {dateFilter === "custom" && (
              <input
                type="date"
                className="form-input"
                style={{ width: "auto", padding: "4px 8px", fontSize: "0.8125rem" }}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        {filteredRecords.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <History size={36} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: "4px" }}>
              No settlement payment records found
            </p>
            <p style={{ fontSize: "0.75rem" }}>
              Payments collected when clearing customer dues will be permanently catalogued here.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    background: "rgba(0,0,0,0.15)",
                    textAlign: "left",
                    color: "var(--text-secondary)",
                    fontWeight: 700,
                  }}
                >
                  <th style={{ padding: "10px 14px" }}>Date & Time</th>
                  <th style={{ padding: "10px 14px" }}>Customer</th>
                  <th style={{ padding: "10px 14px" }}>Task / Particular</th>
                  <th style={{ padding: "10px 14px" }}>Amount</th>
                  <th style={{ padding: "10px 14px" }}>Mode</th>
                  <th style={{ padding: "10px 14px" }}>Notes</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-bright)" }}>{r.paidDate}</div>
                      {r.paidTime && (
                        <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{r.paidTime}</div>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--text-bright)" }}>
                      {r.customerName}
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                      {r.taskTitle}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className="font-mono" style={{ fontWeight: 800, color: "var(--emerald-profit)", fontSize: "0.9375rem" }}>
                        ₹{Number(r.amount).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          borderRadius: "var(--radius-sm)",
                          background: r.paymentMode === "cash" ? "rgba(5, 150, 105, 0.1)" : "rgba(2, 132, 199, 0.1)",
                          color: r.paymentMode === "cash" ? "var(--emerald-profit)" : "var(--accent-primary)",
                          border: `1px solid ${r.paymentMode === "cash" ? "rgba(5, 150, 105, 0.25)" : "rgba(2, 132, 199, 0.25)"}`,
                        }}
                      >
                        {r.paymentMode === "cash" ? "Cash" : r.paymentMode === "upi" ? "UPI / QR" : "Bank Transfer"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--text-muted)", fontStyle: "italic", maxWidth: "220px" }}>
                      {r.notes || "—"}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setEditingRecord(r)}
                          className="btn btn-sm btn-outline"
                          style={{ padding: "4px 8px" }}
                          title="Edit Settlement Record"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => setRecordToDelete(r)}
                          className="btn btn-sm btn-danger-outline"
                          style={{ padding: "4px 8px" }}
                          title="Delete Settlement & Re-add Due"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Settlement Modal */}
      {editingRecord && (
        <EditDuePaymentModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={async (updated) => {
            await updateDuePayment(updated);
          }}
        />
      )}

      {/* Delete Confirmation Popup */}
      <ConfirmDeleteModal
        isOpen={!!recordToDelete}
        title="Delete Due Settlement Record"
        message={`Are you sure you want to delete settlement of ₹${recordToDelete?.amount.toFixed(2)} for ${recordToDelete?.customerName}?`}
        details={
          recordToDelete
            ? `Paid Date: ${recordToDelete.paidDate} • Mode: ${recordToDelete.paymentMode.toUpperCase()} • Task: ${recordToDelete.taskTitle}`
            : undefined
        }
        confirmText="Delete & Restore Due"
        onConfirm={async () => {
          if (recordToDelete) {
            await deleteDuePayment(recordToDelete.id);
          }
        }}
        onClose={() => setRecordToDelete(null)}
      />
    </div>
  );
};
