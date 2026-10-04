import React, { useState, useEffect } from "react";
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
import { ServiceMasterItem, ServiceCategory, Customer, CategoryCustomField } from "../../types";
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

  // Form states for service modal (only category name and dynamic custom fields)
  const [srvName, setSrvName] = useState<string>("");
  const [srvFields, setSrvFields] = useState<CategoryCustomField[]>([]);
  const [newFieldName, setNewFieldName] = useState<string>("");

  // Background scroll lock when modal is open
  useEffect(() => {
    if (isServiceModalOpen || isCustomerModalOpen) {
      document.body.classList.add("modal-open");
      return () => document.body.classList.remove("modal-open");
    }
  }, [isServiceModalOpen, isCustomerModalOpen]);

  const openAddServiceModal = () => {
    setEditingService(null);
    setSrvName("");
    setSrvFields([]);
    setNewFieldName("");
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (item: ServiceMasterItem) => {
    setEditingService(item);
    setSrvName(item.name);
    setSrvFields(item.customFields || []);
    setNewFieldName("");
    setIsServiceModalOpen(true);
  };

  const handleAddField = () => {
    const trimmed = newFieldName.trim();
    if (!trimmed) return;
    setSrvFields((prev) => [
      ...prev,
      { id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, name: trimmed }
    ]);
    setNewFieldName("");
  };

  const handleRemoveField = (id: string) => {
    setSrvFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = srvName.trim();
    if (!cleanName) return;

    const data = {
      name: cleanName,
      category: cleanName,
      customFields: srvFields,
      defaultIncurredCost: 0,
      defaultFee: 0,
      icon: cleanName,
      color: getCategoryColor(cleanName),
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
            Configure digital seva categories, default commission rates, and customer directory
          </p>
        </div>

        {activeTab === "services" ? (
          <button onClick={openAddServiceModal} className="btn btn-primary">
            <Plus size={16} /> Add Master Category
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
          <Layers size={16} /> Master Categories ({services.length})
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
              These master categories appear when recording tasks. Selecting any category will automatically fill your standard cost, fee, and calculate profit.
            </span>
          </div>

          {services.length === 0 ? (
            <div className="glass-panel" style={{ padding: "48px 24px", textAlign: "center" }}>
              <Layers size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-bright)" }}>
                No Master Categories Configured Yet
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", maxWidth: "420px", margin: "6px auto 14px" }}>
                Add your common categories to create your custom Master Menu.
              </p>
              <button onClick={openAddServiceModal} className="btn btn-primary btn-sm">
                <Plus size={14} /> Add First Category
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "16px",
              }}
            >
              {services.map((srv) => {
              const color = srv.color || getCategoryColor(srv.category);

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
                          Master Category
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => openEditServiceModal(srv)}
                        className="btn btn-sm btn-outline"
                        style={{ padding: "4px 8px" }}
                        title="Edit Master Category"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete category "${srv.name}"?`)) {
                            deleteService(srv.id);
                          }
                        }}
                        className="btn btn-sm btn-danger-outline"
                        style={{ padding: "4px 8px" }}
                        title="Delete Category"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Custom Fields Tags */}
                  <div>
                    <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      Dynamic Task Fields ({srv.customFields?.length || 0}):
                    </span>
                    {srv.customFields && srv.customFields.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {srv.customFields.map((f) => (
                          <span
                            key={f.id}
                            style={{
                              fontSize: "0.75rem",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-full)",
                              background: "rgba(6, 182, 212, 0.1)",
                              color: "var(--accent-primary)",
                              border: "1px solid rgba(6, 182, 212, 0.25)",
                              fontWeight: 600,
                            }}
                          >
                            {f.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                        Standard task fields only
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
              No customer master records found. Customers are automatically saved when you enter tasks, or you can add them manually.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-muted)" }}>
                    <th style={{ padding: "10px 14px" }}>Customer Name</th>
                    <th style={{ padding: "10px 14px" }}>Phone</th>
                    <th style={{ padding: "10px 14px" }}>WhatsApp</th>
                    <th style={{ padding: "10px 14px" }}>Email</th>
                    <th style={{ padding: "10px 14px" }}>Residence</th>
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
                      <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                        {c.whatsapp || "—"}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                        {c.email || "—"}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                        {c.residence || c.villageOrArea || c.address || "—"}
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
                            title="Edit Customer"
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
                            title="Delete Customer"
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

      {/* Category Modal (Only Category Name + Dynamic Custom Fields) */}
      {isServiceModalOpen && (
        <div className="modal-overlay" onClick={() => setIsServiceModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                {editingService ? "Edit Master Category" : "Add New Master Category"}
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
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter category name"
                    value={srvName}
                    onChange={(e) => setSrvName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {/* Custom Fields Configurator */}
                <div style={{ marginTop: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Custom Fields for this Category (Optional)
                    </label>
                    <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 600 }}>
                      Prompted during task entry
                    </span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "10px" }}>
                    Add extra information to record when creating a task in this category (such as Phone Number, Consumer ID, Vehicle No, Token No).
                  </p>

                  {/* List of Custom Fields */}
                  {srvFields.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                      {srvFields.map((f, idx) => (
                        <div
                          key={f.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            background: "rgba(0,0,0,0.2)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-md)",
                          }}
                        >
                          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-bright)" }}>
                            {idx + 1}. {f.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveField(f.id)}
                            className="btn btn-sm btn-danger-outline"
                            style={{ padding: "3px 6px" }}
                            title="Remove Field"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Field Input */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter field label"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddField();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="btn btn-secondary"
                      style={{ flexShrink: 0 }}
                    >
                      <Plus size={14} /> Add Field
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingService ? "Update Category" : "Save Master Category"}
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
