import React, { useState, useMemo } from "react";
import { User, Search, Plus, Phone, AlertCircle, ArrowUpRight, DollarSign, MessageCircle, Edit2, Trash2 } from "lucide-react";
import { Customer } from "../../types";
import { useData } from "../../context/DataContext";
import { CustomerLedgerModal } from "./CustomerLedgerModal";
import { CustomerModal } from "./CustomerModal";

export const CustomerView: React.FC = () => {
  const { customers, deleteCustomer, getCustomerHistory } = useData();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDueOnly, setFilterDueOnly] = useState<boolean>(false);

  // Modals
  const [selectedCustomerForLedger, setSelectedCustomerForLedger] = useState<Customer | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);

  // Aggregate customer metrics with their real-time tasks
  const customerListWithMetrics = useMemo(() => {
    return customers.map((c) => {
      const history = getCustomerHistory(c.name);
      return {
        ...c,
        calculatedBilled: history.totalBilled,
        calculatedPaid: history.totalPaid,
        calculatedDue: history.totalDue,
        taskCount: history.tasks.length,
        lastVisit: history.lastVisit,
      };
    });
  }, [customers, getCustomerHistory]);

  // Filter list
  const filteredCustomers = useMemo(() => {
    return customerListWithMetrics.filter((c) => {
      if (filterDueOnly && c.calculatedDue <= 0) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesPhone = c.phone?.includes(q);
        const matchesVillage = c.villageOrArea?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesVillage) return false;
      }
      return true;
    });
  }, [customerListWithMetrics, filterDueOnly, searchTerm]);

  // Totals
  const totalOutstandingDue = customerListWithMetrics.reduce((sum, c) => sum + c.calculatedDue, 0);
  const dueCustomersCount = customerListWithMetrics.filter((c) => c.calculatedDue > 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Customer Master & Khata Directory
          </span>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-bright)", letterSpacing: "-0.02em", marginTop: "2px" }}>
            Customer Ledger & Balances
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Track client visit histories, pending credits, and send payment reminders
          </p>
        </div>

        <button
          onClick={() => {
            setCustomerToEdit(null);
            setIsCustomerModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} /> Add New Customer
        </button>
      </div>

      {/* KPI Highlights */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <div className="glass-panel" style={{ padding: "18px" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>Total Active Clients</span>
          <div className="font-mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-bright)", marginTop: "4px" }}>
            {customerListWithMetrics.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Registered in Master Database
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "18px", borderLeft: "4px solid var(--rose-due)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--rose-due)", fontWeight: 600 }}>Total Outstanding Khata Dues</span>
          <div className="font-mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--rose-due)", marginTop: "4px" }}>
            ₹{totalOutstandingDue.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Across {dueCustomersCount} customers
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "16px 20px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "36px" }}
            placeholder="Search customer by name, mobile, or residence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setFilterDueOnly(false)}
            className={`btn btn-sm ${!filterDueOnly ? "btn-primary" : "btn-secondary"}`}
          >
            All Customers ({customerListWithMetrics.length})
          </button>
          <button
            onClick={() => setFilterDueOnly(true)}
            className={`btn btn-sm ${filterDueOnly ? "btn-primary" : "btn-secondary"}`}
            style={{ borderColor: "rgba(244, 63, 94, 0.4)", color: filterDueOnly ? "#fff" : "var(--rose-due)" }}
          >
            Has Dues Only ({dueCustomersCount})
          </button>
        </div>
      </div>

      {/* Customer Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center" }}>
          <User size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
          <p style={{ color: "var(--text-secondary)" }}>No customers found matching the criteria.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filteredCustomers.map((cust) => {
            const hasDue = cust.calculatedDue > 0;
            return (
              <div
                key={cust.id}
                className="glass-panel"
                style={{
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                  borderColor: hasDue ? "rgba(244, 63, 94, 0.3)" : "var(--border-subtle)",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: hasDue
                          ? "rgba(244, 63, 94, 0.15)"
                          : "rgba(6, 182, 212, 0.15)",
                        color: hasDue ? "var(--rose-due)" : "var(--accent-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      {cust.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-bright)" }}>
                        {cust.name}
                      </h4>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Phone size={11} /> {cust.phone || "No phone"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => {
                        setCustomerToEdit(cust);
                        setIsCustomerModalOpen(true);
                      }}
                      className="btn btn-sm btn-outline"
                      style={{ padding: "4px 6px" }}
                      title="Edit Customer"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete customer ${cust.name}?`)) {
                          deleteCustomer(cust.id);
                        }
                      }}
                      className="btn btn-sm btn-danger-outline"
                      style={{ padding: "4px 6px" }}
                      title="Delete Customer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Residence / WhatsApp / Email info */}
                {(cust.residence || cust.villageOrArea || cust.whatsapp || cust.email) && (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {(cust.residence || cust.villageOrArea) && <span>📍 {cust.residence || cust.villageOrArea}</span>}
                    {cust.whatsapp && <span>💬 WA: {cust.whatsapp}</span>}
                    {cust.email && <span>✉️ {cust.email}</span>}
                  </div>
                )}

                {/* Metrics Box */}
                <div
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Total Billed</span>
                    <div className="font-mono" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-bright)" }}>
                      ₹{cust.calculatedBilled.toFixed(0)}
                    </div>
                    <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{cust.taskCount} visits</span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.6875rem", color: hasDue ? "var(--rose-due)" : "var(--text-muted)" }}>
                      {hasDue ? "Khata Due" : "Balance Due"}
                    </span>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        color: hasDue ? "var(--rose-due)" : "var(--emerald-profit)",
                      }}
                    >
                      ₹{cust.calculatedDue.toFixed(0)}
                    </div>
                    {hasDue ? (
                      <span className="badge badge-due" style={{ fontSize: "0.625rem", padding: "1px 5px" }}>
                        Unpaid
                      </span>
                    ) : (
                      <span className="badge badge-paid" style={{ fontSize: "0.625rem", padding: "1px 5px" }}>
                        Settled
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setSelectedCustomerForLedger(cust)}
                    className="btn btn-sm btn-secondary"
                    style={{ flex: 1 }}
                  >
                    View Ledger <ArrowUpRight size={13} />
                  </button>

                  {hasDue && (
                    <button
                      onClick={() => setSelectedCustomerForLedger(cust)}
                      className="btn btn-sm btn-success"
                      title="Clear dues"
                    >
                      <DollarSign size={13} /> Settle
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Ledger Modal */}
      <CustomerLedgerModal
        isOpen={!!selectedCustomerForLedger}
        onClose={() => setSelectedCustomerForLedger(null)}
        customer={selectedCustomerForLedger}
      />

      {/* Customer Add/Edit Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerToEdit={customerToEdit}
      />
    </div>
  );
};
