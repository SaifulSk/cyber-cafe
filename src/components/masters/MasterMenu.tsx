import React, { useState } from "react";
import {
  Layers,
  Users,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Smartphone,
  Fingerprint,
  Zap,
  Utensils,
  Vote,
  CreditCard,
  Send,
  Printer,
  X,
  Check
} from "lucide-react";
import { ServiceMasterItem, ServiceCategory, Customer } from "../../types";
import { useData } from "../../context/DataContext";
import { CategoryIcon, getCategoryColor, formatCategoryLabel } from "../common/CategoryIcon";
import { CustomerModal } from "../customers/CustomerModal";

export const MasterMenu: React.FC = () => {
  const { services, addService, updateService, deleteService, customers, deleteCustomer } = useData();

  const [activeTab, setActiveTab] = useState<"services" | "customers">("services");

  // Service Edit / Add Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ServiceMasterItem | null>(null);

  // Customer Edit Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states for service modal
  const [srvName, setSrvName] = useState<string>("");
  const [srvCategory, setSrvCategory] = useState<ServiceCategory>("other");
  const [srvCost, setSrvCost] = useState<number | "">("");
  const [srvFee, setSrvFee] = useState<number | "">("");
  const [srvDesc, setSrvDesc] = useState<string>("");

  const openAddServiceModal = () => {
    setEditingService(null);
    setSrvName("");
    setSrvCategory("other");
    setSrvCost(0);
    setSrvFee(50);
    setSrvDesc("");
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (item: ServiceMasterItem) => {
    setEditingService(item);
    setSrvName(item.name);
    setSrvCategory(item.category);
    setSrvCost(item.defaultIncurredCost);
    setSrvFee(item.defaultFee);
    setSrvDesc(item.description || "");
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName.trim()) return;

    const data = {
      name: srvName.trim(),
      category: srvCategory,
      defaultIncurredCost: Number(srvCost) || 0,
      defaultFee: Number(srvFee) || 0,
      icon: srvCategory,
      color: getCategoryColor(srvCategory),
      description: srvDesc.trim() || undefined,
      isActive: true,
    };

    if (editingService) {
      await updateService({ ...editingService, ...data });
    } else {
      await addService(data);
    }

    setIsServiceModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Configuration & Masters
          </span>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-bright)", letterSpacing: "-0.02em", marginTop: "2px" }}>
            Master Menu Management
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Configure predefined digital seva services, default commission rates, and customer directory
          </p>
        </div>

        {activeTab === "services" ? (
          <button onClick={openAddServiceModal} className="btn btn-primary">
            <Plus size={16} /> Add Custom Service
          </button>
        ) : (
          <button
            onClick={() => {
              setEditingCustomer(null);
              setIsCustomerModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} /> Add New Customer
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "10px",
        }}
      >
        <button
          onClick={() => setActiveTab("services")}
          className={`btn ${activeTab === "services" ? "btn-primary" : "btn-secondary"}`}
        >
          <Layers size={16} /> Services Master ({services.length})
        </button>

        <button
          onClick={() => setActiveTab("customers")}
          className={`btn ${activeTab === "customers" ? "btn-primary" : "btn-secondary"}`}
        >
          <Users size={16} /> Customer Master Directory ({customers.length})
        </button>
      </div>

      {/* Tab 1: Services Master */}
      {activeTab === "services" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              padding: "12px 18px",
              background: "rgba(6, 182, 212, 0.08)",
              border: "1px solid rgba(6, 182, 212, 0.2)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.8125rem",
              color: "var(--text-main)",
            }}
          >
            <Sparkles size={18} style={{ color: "var(--accent-primary)", flexShrink: 0 }} />
            <span>
              These master services appear in the "+ New Task" dropdown. Selecting any service will automatically populate the standard operator cost, customer fee, and profit margin.
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "16px",
            }}
          >
            {services.map((srv) => {
              const color = srv.color || getCategoryColor(srv.category);
              const margin = srv.defaultFee - srv.defaultIncurredCost;
              const marginPercent = srv.defaultFee > 0 ? ((margin / srv.defaultFee) * 100).toFixed(0) : 0;

              return (
                <div
                  key={srv.id}
                  className="glass-panel"
                  style={{
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px",
                    borderLeft: `4px solid ${color}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "var(--radius-md)",
                          background: `${color}20`,
                          color: color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <CategoryIcon category={srv.category} size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-bright)" }}>
                          {srv.name}
                        </h4>
                        <span style={{ fontSize: "0.6875rem", color: color, fontWeight: 600 }}>
                          {formatCategoryLabel(srv.category)}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => openEditServiceModal(srv)}
                        className="btn btn-sm btn-outline"
                        style={{ padding: "4px 8px" }}
                        title="Edit Master Service"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete service "${srv.name}"?`)) {
                            deleteService(srv.id);
                          }
                        }}
                        className="btn btn-sm btn-danger-outline"
                        style={{ padding: "4px 8px" }}
                        title="Delete Service"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {srv.description && (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      {srv.description}
                    </p>
                  )}

                  {/* Pricing Matrix */}
                  <div
                    style={{
                      background: "rgba(0,0,0,0.25)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)",
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "8px",
                      textAlign: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Default Cost</div>
                      <div className="font-mono" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-bright)" }}>
                        ₹{srv.defaultIncurredCost}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Default Fee</div>
                      <div className="font-mono" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--accent-primary)" }}>
                        ₹{srv.defaultFee}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--emerald-profit)" }}>Est. Profit</div>
                      <div className="font-mono" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--emerald-profit)" }}>
                        +₹{margin} ({marginPercent}%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Customer Master Directory */}
      {activeTab === "customers" && (
        <div className="glass-panel" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-bright)" }}>
              Registered Customer Master Records ({customers.length})
            </h3>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setIsCustomerModalOpen(true);
              }}
              className="btn btn-sm btn-primary"
            >
              <Plus size={14} /> Add Customer
            </button>
          </div>

          {customers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
              No customer master records found. Customers are automatically added when you enter tasks, or you can add them manually.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-muted)" }}>
                    <th style={{ padding: "10px 14px" }}>Customer Name</th>
                    <th style={{ padding: "10px 14px" }}>Phone</th>
                    <th style={{ padding: "10px 14px" }}>Aadhaar (Last 4)</th>
                    <th style={{ padding: "10px 14px" }}>Village / Area</th>
                    <th style={{ padding: "10px 14px" }}>Notes</th>
                    <th style={{ padding: "10px 14px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: "1px solid var(--border-subtle)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--text-bright)" }}>
                        {c.name}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                        {c.phone || "—"}
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>
                        {c.aadhaarLast4 ? `**** ${c.aadhaarLast4}` : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                        {c.villageOrArea || "—"}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-muted)", fontStyle: "italic", maxWidth: "200px" }}>
                        {c.notes || "—"}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            onClick={() => {
                              setEditingCustomer(c);
                              setIsCustomerModalOpen(true);
                            }}
                            className="btn btn-sm btn-outline"
                            style={{ padding: "4px 8px" }}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete customer ${c.name}?`)) {
                                deleteCustomer(c.id);
                              }
                            }}
                            className="btn btn-sm btn-danger-outline"
                            style={{ padding: "4px 8px" }}
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
      )}

      {/* Service Modal */}
      {isServiceModalOpen && (
        <div className="modal-overlay" onClick={() => setIsServiceModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                {editingService ? "Edit Master Service Item" : "Add New Master Service"}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="btn btn-outline"
                style={{ padding: "6px", borderRadius: "50%", width: "32px", height: "32px" }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveService}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Service Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. WBSEDCL Electric Bill / Jio Recharge"
                    value={srvName}
                    onChange={(e) => setSrvName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={srvCategory}
                    onChange={(e) => setSrvCategory(e.target.value as ServiceCategory)}
                  >
                    <option value="recharge">Mobile / DTH Recharge</option>
                    <option value="aeps">AEPS Cash Out & Deposit</option>
                    <option value="electric_bill">Electricity Bill Payment</option>
                    <option value="ration_card">Ration Card Services</option>
                    <option value="voter_card">Voter Card Services</option>
                    <option value="pan_card">PAN Card Services</option>
                    <option value="money_transfer">Money Remittance (DMT)</option>
                    <option value="aadhaar_services">Aadhaar PVC & Prints</option>
                    <option value="certificates">Caste / Income Certificates</option>
                    <option value="printing_xerox">Printing & Xerox</option>
                    <option value="ticket_booking">Train / Flight Tickets</option>
                    <option value="pm_kisan">PM-Kisan Services</option>
                    <option value="other">Other Cyber Cafe Service</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Default Incurred Cost (₹)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="form-input font-mono"
                      value={srvCost}
                      onChange={(e) => setSrvCost(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Default Customer Fee (₹)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="form-input font-mono"
                      value={srvFee}
                      onChange={(e) => setSrvFee(e.target.value === "" ? "" : Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Short Description / Operator Guidance</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Minimum commission ₹20 per ₹1000 cash out"
                    value={srvDesc}
                    onChange={(e) => setSrvDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Master Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerToEdit={editingCustomer}
      />
    </div>
  );
};
