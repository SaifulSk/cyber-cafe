import React, { useState } from "react";
import { Edit2, Trash2, Printer, CheckCircle, Clock, AlertTriangle, ArrowUpRight, DollarSign } from "lucide-react";
import { TaskItem } from "../../types";
import { CategoryIcon, getCategoryColor, formatCategoryLabel } from "../common/CategoryIcon";
import { ConfirmDeleteModal } from "../common/ConfirmDeleteModal";

interface TaskCardProps {
  task: TaskItem;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: string) => void;
  onSettleDue?: (task: TaskItem) => void;
  onPrintReceipt?: (task: TaskItem) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onSettleDue,
  onPrintReceipt,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const categoryColor = getCategoryColor(task.serviceCategory);

  const getStatusBadge = (status: TaskItem["status"]) => {
    switch (status) {
      case "completed":
        return <span className="badge badge-completed"><CheckCircle size={11} /> Done</span>;
      case "in_progress":
        return <span className="badge badge-in_progress"><Clock size={11} /> In Progress</span>;
      case "pending":
        return <span className="badge badge-pending"><AlertTriangle size={11} /> Pending</span>;
      case "delivered":
        return <span className="badge badge-delivered">Delivered</span>;
      case "cancelled":
        return <span className="badge badge-cancelled">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        borderLeft: `4px solid ${categoryColor}`,
      }}
    >
      {/* Top Row: Category tag, date/time, and status badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              background: `${categoryColor}25`,
              color: categoryColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CategoryIcon category={task.serviceCategory} size={15} />
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: categoryColor,
              letterSpacing: "0.02em",
            }}
          >
            {formatCategoryLabel(task.serviceCategory)}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>•</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {task.date} {task.time ? `at ${task.time}` : ""}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {getStatusBadge(task.status)}
          <span
            style={{
              fontSize: "0.6875rem",
              textTransform: "uppercase",
              padding: "2px 6px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(255, 255, 255, 0.06)",
              color: "var(--text-secondary)",
              fontWeight: 600,
            }}
          >
            {task.paymentMode}
          </span>
        </div>
      </div>

      {/* Middle Row: Title & Customer Name */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div>
          <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-bright)", marginBottom: "4px" }}>
            {task.title}
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            <span>Customer: <strong style={{ color: "var(--text-main)" }}>{task.customerName}</strong></span>
            {task.customerPhone && (
              <>
                <span style={{ color: "var(--text-muted)" }}>•</span>
                <span style={{ color: "var(--text-muted)" }}>{task.customerPhone}</span>
              </>
            )}
          </div>
          {task.referenceNo && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Ref/Ack: <span className="font-mono" style={{ color: "var(--accent-primary)" }}>{task.referenceNo}</span>
            </div>
          )}
          {task.customFieldValues && Object.keys(task.customFieldValues).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
              {Object.entries(task.customFieldValues).map(([k, v]) => (
                <span
                  key={k}
                  style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <strong style={{ color: "var(--text-muted)" }}>{k}:</strong> {v}
                </span>
              ))}
            </div>
          )}
          {task.notes && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px", fontStyle: "italic" }}>
              "{task.notes}"
            </div>
          )}
        </div>

        {/* Amount Matrix Box */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.25)",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            textAlign: "right",
            minWidth: "140px",
          }}
        >
          <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Total Charged</div>
          <div className="font-mono" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
            ₹{task.amountCharged.toFixed(2)}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "2px", fontSize: "0.75rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Cost: ₹{task.amountIncurred}</span>
            <span style={{ color: "var(--emerald-profit)", fontWeight: 600 }}>Profit: +₹{task.profit}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Due status & Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "10px",
          marginTop: "4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {task.dueAmount > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="badge badge-due">
                Due: ₹{task.dueAmount.toFixed(2)}
              </span>
              {onSettleDue && (
                <button
                  onClick={() => onSettleDue(task)}
                  className="btn btn-sm btn-success"
                  style={{ padding: "3px 8px", fontSize: "0.6875rem" }}
                >
                  <DollarSign size={11} /> Collect Due
                </button>
              )}
            </div>
          ) : (
            <span className="badge badge-paid">
              Paid in Full (₹{task.amountPaid})
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {onPrintReceipt && (
            <button
              onClick={() => onPrintReceipt(task)}
              className="btn btn-sm btn-secondary"
              title="Print Receipt Slip"
              style={{ padding: "6px 8px" }}
            >
              <Printer size={13} />
            </button>
          )}

          <button
            onClick={() => onEdit(task)}
            className="btn btn-sm btn-secondary"
            title="Edit Task"
            style={{ padding: "6px 8px" }}
          >
            <Edit2 size={13} />
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-sm btn-danger-outline"
            title="Delete Task"
            style={{ padding: "6px 8px" }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        title="Delete Seva Task"
        message={`Are you sure you want to delete task "${task.title}" for customer ${task.customerName}?`}
        details={`Amount Charged: ₹${task.amountCharged} • Paid: ₹${task.amountPaid} • Due: ₹${task.dueAmount}`}
        confirmText="Delete Task"
        onConfirm={() => onDelete(task.id)}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
