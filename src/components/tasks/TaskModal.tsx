import React, { useState, useEffect } from "react";
import { X, Check, Calculator, Sparkles, User, AlertCircle, Plus, Phone, MapPin, Mail, MessageSquare } from "lucide-react";
import { TaskItem, ServiceCategory, PaymentMode, TaskStatus, Customer, CategoryCustomField } from "../../types";
import { useData } from "../../context/DataContext";
import { CategoryIcon, getCategoryColor } from "../common/CategoryIcon";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskItem | null;
  defaultDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultDate,
}) => {
  const { services, customers, addTask, updateTask, addCustomer } = useData();

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  // Instant Add Customer mini form
  const [isInstantAddOpen, setIsInstantAddOpen] = useState<boolean>(false);
  const [quickCustName, setQuickCustName] = useState<string>("");
  const [quickCustPhone, setQuickCustPhone] = useState<string>("");
  const [quickCustWhatsapp, setQuickCustWhatsapp] = useState<string>("");
  const [quickCustEmail, setQuickCustEmail] = useState<string>("");
  const [quickCustResidence, setQuickCustResidence] = useState<string>("");
  const [quickCustSaving, setQuickCustSaving] = useState<boolean>(false);
  const [quickCustError, setQuickCustError] = useState<string>("");

  const [date, setDate] = useState<string>(
    defaultDate || new Date().toISOString().split("T")[0]
  );
  const [time, setTime] = useState<string>(
    new Date().toTimeString().split(" ")[0].substring(0, 5)
  );

  const [amountIncurred, setAmountIncurred] = useState<number | "">(0);
  const [amountCharged, setAmountCharged] = useState<number | "">(0);
  const [amountPaid, setAmountPaid] = useState<number | "">(0);

  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [status, setStatus] = useState<TaskStatus>("completed");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Background scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      return () => document.body.classList.remove("modal-open");
    }
  }, [isOpen]);

  // Dynamic calculations
  const numCharged = Number(amountCharged) || 0;
  const numIncurred = Number(amountIncurred) || 0;
  const numPaid = Number(amountPaid) || 0;

  const profit = Math.max(0, numCharged - numIncurred);
  const dueAmount = Math.max(0, numCharged - numPaid);

  // Active master category to discover dynamic custom fields
  const activeMasterCategory = services.find(
    (s) => s.name.toLowerCase() === category.toLowerCase()
  );

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setCategory(taskToEdit.serviceCategory || (services.length > 0 ? services[0].name : ""));
      setCustomerName(taskToEdit.customerName);
      setCustomerPhone(taskToEdit.customerPhone || "");
      setCustomFieldValues(taskToEdit.customFieldValues || {});
      setDate(taskToEdit.date);
      setTime(taskToEdit.time || "");
      setAmountIncurred(taskToEdit.amountIncurred);
      setAmountCharged(taskToEdit.amountCharged);
      setAmountPaid(taskToEdit.amountPaid);
      setPaymentMode(taskToEdit.paymentMode);
      setStatus(taskToEdit.status);
      setIsInstantAddOpen(false);
    } else {
      // Reset form
      if (services.length > 0) {
        const first = services[0];
        setSelectedServiceId(first.id);
        setCategory(first.name);
        setTitle(first.name);
      } else {
        setSelectedServiceId("");
        setCategory("");
        setTitle("");
      }
      setCustomerName(customers.length > 0 ? customers[0].name : "");
      setCustomerPhone(customers.length > 0 ? customers[0].phone || "" : "");
      setCustomFieldValues({});
      setDate(defaultDate || new Date().toISOString().split("T")[0]);
      setTime(new Date().toTimeString().split(" ")[0].substring(0, 5));
      setAmountIncurred("");
      setAmountCharged("");
      setAmountPaid("");
      setPaymentMode("cash");
      setStatus("completed");
      setErrorMsg("");
      setIsInstantAddOpen(false);
    }
  }, [taskToEdit, defaultDate, isOpen, services, customers]);

  // Category select handler
  const handleCategorySelect = (selectedCat: string) => {
    setCategory(selectedCat);
    const matched = services.find((s) => s.name === selectedCat);
    if (matched) {
      setSelectedServiceId(matched.id);
      if (!title.trim() || services.some((s) => s.name === title)) {
        setTitle(matched.name);
      }
    } else {
      setSelectedServiceId("");
    }
  };

  const handleFullPaidClick = () => {
    setAmountPaid(numCharged);
  };

  // Instant Add Customer submit
  const handleSaveInstantCustomer = async () => {
    if (!quickCustName.trim()) {
      setQuickCustError("Please enter customer name");
      return;
    }

    setQuickCustSaving(true);
    setQuickCustError("");

    try {
      const saved = await addCustomer({
        name: quickCustName.trim(),
        phone: quickCustPhone.trim() || undefined,
        whatsapp: quickCustWhatsapp.trim() || undefined,
        email: quickCustEmail.trim() || undefined,
        residence: quickCustResidence.trim() || undefined,
      });

      setCustomerName(saved.name);
      setCustomerPhone(saved.phone || "");
      setIsInstantAddOpen(false);
      setQuickCustName("");
      setQuickCustPhone("");
      setQuickCustWhatsapp("");
      setQuickCustEmail("");
      setQuickCustResidence("");
    } catch (err: any) {
      setQuickCustError(err.message || "Failed to save customer");
    } finally {
      setQuickCustSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim()) {
      setErrorMsg("Please select a category from your Master Menu");
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg("Please select or add a customer");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Please enter a task title or details");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const taskData = {
        title: title.trim(),
        serviceCategory: category.trim(),
        serviceId: selectedServiceId || undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customFieldValues: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
        date,
        time,
        amountIncurred: numIncurred,
        amountCharged: numCharged,
        amountPaid: numPaid,
        profit,
        dueAmount,
        paymentMode,
        status,
      };

      if (taskToEdit) {
        await updateTask({ ...taskToEdit, ...taskData });
      } else {
        await addTask(taskData);
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "660px" }}>
        {/* Fixed Header */}
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
              <Calculator size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                {taskToEdit ? "Edit Task Entry" : "New Seva Task Entry"}
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Record task cost, customer fee, profit & credit dues
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {errorMsg && (
              <div
                style={{
                  background: "rgba(244, 63, 94, 0.15)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  color: "#fca5a5",
                  fontSize: "0.8125rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Category & Task Title */}
            <div className="task-modal-grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Category *</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 500 }}>
                    Master Menu
                  </span>
                </label>
                {services.length > 0 ? (
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    required
                  >
                    <option value="">-- Select Category --</option>
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.name}>
                        {srv.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter category name"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                )}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Task Title / Details *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter task title or details"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Dynamic Custom Fields Defined on Selected Category (Requirement 10) */}
            {activeMasterCategory?.customFields && activeMasterCategory.customFields.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  padding: "14px",
                  background: "rgba(6, 182, 212, 0.05)",
                  border: "1px solid rgba(6, 182, 212, 0.2)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--accent-primary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {activeMasterCategory.name} Category Fields
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: activeMasterCategory.customFields.length > 1 ? "1fr 1fr" : "1fr",
                    gap: "12px",
                  }}
                >
                  {activeMasterCategory.customFields.map((field) => (
                    <div key={field.id} className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">{field.name}</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Enter ${field.name}`}
                        value={customFieldValues[field.name] || ""}
                        onChange={(e) =>
                          setCustomFieldValues((prev) => ({
                            ...prev,
                            [field.name]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Dropdown with Instant Add (Requirement 8) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Customer * (Master Directory)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsInstantAddOpen((prev) => !prev)}
                    className="btn btn-sm btn-outline"
                    style={{ padding: "3px 10px", fontSize: "0.75rem", color: "var(--accent-primary)" }}
                  >
                    <Plus size={13} /> {isInstantAddOpen ? "Close Quick Add" : "Instant Add Customer"}
                  </button>
                </div>

                {customers.length > 0 ? (
                  <select
                    className="form-select"
                    value={customerName}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setCustomerName(selected);
                      const found = customers.find((c) => c.name === selected);
                      if (found && found.phone) {
                        setCustomerPhone(found.phone);
                      }
                    }}
                    required
                  >
                    <option value="">-- Select Customer from Master --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.phone ? `(${c.phone})` : ""} {c.residence ? `• ${c.residence}` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setIsInstantAddOpen(true)}
                      className="btn btn-secondary btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      <Plus size={14} /> Add to Master
                    </button>
                  </div>
                )}
              </div>

              {/* Instant Add Customer Inline Panel */}
              {isInstantAddOpen && (
                <div
                  style={{
                    padding: "14px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-active)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                      Quick Add Customer to Master Directory
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsInstantAddOpen(false)}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {quickCustError && (
                    <div style={{ color: "#fca5a5", fontSize: "0.75rem" }}>{quickCustError}</div>
                  )}

                  <div className="task-modal-grid-2">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.75rem" }}>Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter full name"
                        value={quickCustName}
                        onChange={(e) => setQuickCustName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.75rem" }}>Phone Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="Enter phone number"
                        value={quickCustPhone}
                        onChange={(e) => setQuickCustPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="task-modal-grid-2">
                    <div className="form-group" style={{ margin: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <label className="form-label" style={{ fontSize: "0.75rem" }}>WhatsApp</label>
                        {quickCustPhone && (
                          <button
                            type="button"
                            onClick={() => setQuickCustWhatsapp(quickCustPhone)}
                            style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "0.6875rem", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                          >
                            Same as phone
                          </button>
                        )}
                      </div>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="Enter WhatsApp number"
                        value={quickCustWhatsapp}
                        onChange={(e) => setQuickCustWhatsapp(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.75rem" }}>Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="Enter email address"
                        value={quickCustEmail}
                        onChange={(e) => setQuickCustEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Residence</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter village, area, or residential address"
                      value={quickCustResidence}
                      onChange={(e) => setQuickCustResidence(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
                    <button
                      type="button"
                      onClick={() => setIsInstantAddOpen(false)}
                      className="btn btn-sm btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveInstantCustomer}
                      disabled={quickCustSaving}
                      className="btn btn-sm btn-primary"
                    >
                      {quickCustSaving ? "Saving..." : "Save & Select Customer"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Financials & Live Profit / Due Card */}
            <div
              style={{
                background: "var(--bg-card-hover)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-bright)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Financial Breakdown & Profit Matrix
                </span>
                <button
                  type="button"
                  onClick={handleFullPaidClick}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "3px 8px" }}
                >
                  <Sparkles size={12} /> Set Fully Paid
                </button>
              </div>

              {/* 3 Responsive Financial Columns (Requirement 7) */}
              <div className="task-modal-financials-grid">
                <div className="form-group" style={{ margin: 0 }}>
                  <label
                    className="form-label"
                    style={{ color: "var(--text-secondary)" }}
                    title="Amount Incurred (Cost)"
                  >
                    Amount Incurred (Cost)
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="form-input font-mono"
                      style={{ paddingLeft: "26px" }}
                      placeholder="0"
                      value={amountIncurred}
                      onChange={(e) =>
                        setAmountIncurred(e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />
                  </div>
                  <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                    Operator / Gateway cost
                  </span>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label
                    className="form-label"
                    style={{ color: "var(--accent-primary)" }}
                    title="Amount Charged (Customer) *"
                  >
                    Amount Charged (Customer)&nbsp;*
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--accent-primary)",
                        fontWeight: 600,
                      }}
                    >
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="form-input font-mono"
                      style={{ paddingLeft: "26px", borderColor: "rgba(6, 182, 212, 0.4)" }}
                      placeholder="0"
                      value={amountCharged}
                      onChange={(e) => {
                        const val = e.target.value === "" ? "" : Number(e.target.value);
                        setAmountCharged(val);
                        if (amountPaid === "" || amountPaid === 0) {
                          setAmountPaid(val);
                        }
                      }}
                      required
                    />
                  </div>
                  <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                    Total fee billed
                  </span>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label
                    className="form-label"
                    style={{ color: "#34d399" }}
                    title="Amount Paid by Customer *"
                  >
                    Amount Paid by Customer&nbsp;*
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#34d399",
                        fontWeight: 600,
                      }}
                    >
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="form-input font-mono"
                      style={{ paddingLeft: "26px" }}
                      placeholder="0"
                      value={amountPaid}
                      onChange={(e) =>
                        setAmountPaid(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      required
                    />
                  </div>
                  <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                    Received cash / online
                  </span>
                </div>
              </div>

              {/* Dynamic KPI Banner: Profit & Due */}
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  background: "rgba(0, 0, 0, 0.25)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Net Profit: </span>
                  <strong
                    className="font-mono"
                    style={{
                      fontSize: "1rem",
                      color: profit >= 0 ? "var(--emerald-profit)" : "var(--rose-due)",
                    }}
                  >
                    ₹{profit.toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Outstanding Due:{" "}
                  </span>
                  <strong
                    className="font-mono"
                    style={{
                      fontSize: "1rem",
                      color: dueAmount > 0 ? "var(--rose-due)" : "var(--text-muted)",
                    }}
                  >
                    ₹{dueAmount.toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Responsive Date & Time (Requirement 7) */}
            <div className="task-modal-grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            {/* Responsive Payment Mode & Task Status (Requirement 7 & 13) */}
            <div className="task-modal-grid-2">
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
                  <option value="credit">Khata / Credit</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Task Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                >
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending Documents</option>
                  <option value="delivered">Delivered to Client</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : taskToEdit ? "Update Task" : "Save Task Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
