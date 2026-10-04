import React, { useState, useMemo } from "react";
import {
  History,
  Search,
  DollarSign,
  Calendar,
  Filter,
  Trash2,
  ArrowUpDown,
  CreditCard,
  User,
  Clock,
  Download
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { DuePaymentRecord } from "../../types";
import { StatCard } from "../common/StatCard";

export const DuePaymentsView: React.FC = () => {
  const { duePayments, deleteDuePayment } = useData();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customDate, setCustomDate] = useState<string>("");

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
          variant="purple"
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
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
            <Search
              size={16}
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

          {/* Date Filter */}
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "160px" }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_month">This Month</option>
            <option value="custom">Custom Date</option>
          </select>

          {dateFilter === "custom" && (
            <input
              type="date"
              className="form-input"
              style={{ width: "auto" }}
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="glass-panel" style={{ padding: "20px" }}>
        {filteredRecords.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <History size={40} style={{ margin: "0 auto 12px", opacity: 0.35 }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-bright)" }}>
              No Due Payment Records Found
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", maxWidth: "400px", margin: "6px auto 0" }}>
              When you click "Collect Due" on any task with pending dues, the settlement record and time stamp will appear here automatically.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "10px 14px" }}>Date & Time</th>
                  <th style={{ padding: "10px 14px" }}>Customer Name</th>
                  <th style={{ padding: "10px 14px" }}>Task / Description</th>
                  <th style={{ padding: "10px 14px" }}>Amount Collected</th>
                  <th style={{ padding: "10px 14px" }}>Payment Mode</th>
                  <th style={{ padding: "10px 14px" }}>Receipt Notes</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-bright)" }}>{r.paidDate}</div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{r.paidTime || "—"}</div>
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
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete settlement record of ₹${r.amount} for ${r.customerName} and re-add due?`)) {
                            deleteDuePayment(r.id);
                          }
                        }}
                        className="btn btn-sm btn-danger-outline"
                        style={{ padding: "4px 8px" }}
                        title="Delete Settlement & Re-add Due"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
