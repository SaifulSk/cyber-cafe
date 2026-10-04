import React, { useState, useEffect } from "react";
import { X, Check, Calculator, Sparkles, User, AlertCircle, ArrowRight } from "lucide-react";
import { TaskItem, ServiceCategory, PaymentMode, TaskStatus } from "../../types";
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
  const { services, customers, addTask, updateTask } = useData();

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<ServiceCategory>("other");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState<boolean>(false);

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
  const [referenceNo, setReferenceNo] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Dynamic calculations
  const numCharged = Number(amountCharged) || 0;
  const numIncurred = Number(amountIncurred) || 0;
  const numPaid = Number(amountPaid) || 0;

  const profit = Math.max(0, numCharged - numIncurred);
  const dueAmount = Math.max(0, numCharged - numPaid);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setCategory(taskToEdit.serviceCategory);
      setCustomerName(taskToEdit.customerName);
      setCustomerPhone(taskToEdit.customerPhone || "");
      setDate(taskToEdit.date);
      setTime(taskToEdit.time || "");
      setAmountIncurred(taskToEdit.amountIncurred);
      setAmountCharged(taskToEdit.amountCharged);
      setAmountPaid(taskToEdit.amountPaid);
      setPaymentMode(taskToEdit.paymentMode);
      setStatus(taskToEdit.status);
      setReferenceNo(taskToEdit.referenceNo || "");
      setNotes(taskToEdit.notes || "");
    } else {
      // Reset form
      setSelectedServiceId("");
      setTitle("");
      setCategory("other");
      setCustomerName("");
      setCustomerPhone("");
      setDate(defaultDate || new Date().toISOString().split("T")[0]);
      setTime(new Date().toTimeString().split(" ")[0].substring(0, 5));
      setAmountIncurred("");
      setAmountCharged("");
      setAmountPaid("");
      setPaymentMode("cash");
      setStatus("completed");
      setReferenceNo("");
      setNotes("");
      setErrorMsg("");
    }
  }, [taskToEdit, defaultDate, isOpen]);

  // When a Master Service is picked, pre-fill defaults
  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const selected = services.find((s) => s.id === serviceId);
    if (selected) {
      setTitle(selected.name);
      setCategory(selected.category);
      setAmountIncurred(selected.defaultIncurredCost);
      setAmountCharged(selected.defaultFee);
      setAmountPaid(selected.defaultFee); // default to fully paid
    }
  };

  // Filter customer suggestions based on input
  const customerSuggestions = customers.filter(
    (c) =>
      customerName.trim() &&
      c.name.toLowerCase().includes(customerName.toLowerCase().trim())
  );

  const handleSelectCustomer = (c: (typeof customers)[0]) => {
    setCustomerName(c.name);
    if (c.phone) setCustomerPhone(c.phone);
    setShowCustomerDropdown(false);
  };

  const handleFullPaidClick = () => {
    setAmountPaid(numCharged);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please enter a task title or select a service from the Master Menu");
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg("Please enter customer name");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const taskData = {
        title: title.trim(),
        serviceCategory: category,
        serviceId: selectedServiceId || undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        date,
        time,
        amountIncurred: numIncurred,
        amountCharged: numCharged,
        amountPaid: numPaid,
        profit,
        dueAmount,
        paymentMode,
        status,
        referenceNo: referenceNo.trim() || undefined,
        notes: notes.trim() || undefined,
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
        {/* Header */}
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

        {/* Body */}
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

            {/* Service Picker from Master Menu (Only if user has created master services) */}
            {services.length > 0 && (
              <div>
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Select from Master Menu (Optional)</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 500 }}>
                    Auto-fills rates
                  </span>
                </label>
                <select
                  className="form-select"
                  value={selectedServiceId}
                  onChange={(e) => handleServiceSelect(e.target.value)}
                >
                  <option value="">-- Choose from your Master Menu --</option>
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} {srv.defaultFee > 0 ? `(Cost: ₹${srv.defaultIncurredCost} | Fee: ₹${srv.defaultFee})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title & Category */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Task Title / Description *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jio 299 Recharge / Electricity Bill WBSEDCL"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Service Master Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                >
                  <option value="recharge">Recharge</option>
                  <option value="aeps">AEPS</option>
                  <option value="electric_bill">Electric Bill</option>
                  <option value="ration_card">Ration Card</option>
                  <option value="voter_card">Voter Card</option>
                  <option value="pan_card">PAN Card</option>
                  <option value="money_transfer">Money Transfer</option>
                  <option value="aadhaar_services">Aadhaar Services</option>
                  <option value="certificates">Certificates</option>
                  <option value="printing_xerox">Printing / Xerox</option>
                  <option value="ticket_booking">Ticket Booking</option>
                  <option value="pm_kisan">PM-Kisan</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Customer Details with Master Auto-Suggest */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
              <div className="form-group" style={{ margin: 0, position: "relative" }}>
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Customer Name * (Master Directory)</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Auto-syncs</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ramesh Mondal"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    required
                  />
                  {customerName && (
                    <button
                      type="button"
                      onClick={() => setCustomerName("")}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {showCustomerDropdown && customerSuggestions.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 60,
                      marginTop: "4px",
                      background: "var(--bg-dropdown)",
                      border: "1px solid var(--border-active)",
                      borderRadius: "var(--radius-md)",
                      maxHeight: "160px",
                      overflowY: "auto",
                      boxShadow: "var(--shadow-lg)",
                    }}
                  >
                    {customerSuggestions.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px solid var(--border-subtle)",
                          fontSize: "0.8125rem",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-bright)" }}>{c.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {c.phone || "No phone"} {c.villageOrArea ? `• ${c.villageOrArea}` : ""}
                          </div>
                        </div>
                        {c.totalDue && c.totalDue > 0 ? (
                          <span className="badge badge-due">Due: ₹{c.totalDue}</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone / WhatsApp</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="10-digit mobile"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
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

              {/* 3 Input Columns: Amount Incurred, Amount Charged, Amount Paid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: "var(--text-secondary)" }}>
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
                  <label className="form-label" style={{ color: "var(--accent-primary)" }}>
                    Amount Charged (Customer) *
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
                        // If paid wasn't modified yet or was 0, default paid to charged
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
                  <label className="form-label" style={{ color: "#34d399" }}>
                    Amount Paid by Customer *
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
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginTop: "14px",
                  padding: "10px 14px",
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                    Calculated Profit:
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      color: profit >= 0 ? "var(--emerald-profit)" : "var(--rose-due)",
                    }}
                  >
                    +₹{profit.toFixed(2)}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: "1px solid var(--border-subtle)", paddingLeft: "12px" }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                    Outstanding Due:
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      color: dueAmount > 0 ? "var(--rose-due)" : "var(--text-muted)",
                    }}
                  >
                    ₹{dueAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Date, Time, Payment Mode & Status */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
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

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="bank_transfer">Bank Transfer</option>
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

            {/* Reference No & Notes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Reference / Ack / Token No</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. UTR-92810 / WBSEDCL-8201"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Remarks / Consumer Details</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. WBSEDCL Consumer 104928"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
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
