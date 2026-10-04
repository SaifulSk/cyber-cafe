import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isDeleting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = "Confirm Deletion",
  message,
  details,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onClose,
  isDeleting = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      return () => {
        document.body.classList.remove("modal-open");
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "440px" }}
      >
        {/* Fixed Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "rgba(244, 63, 94, 0.15)",
                color: "var(--rose-due)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--text-bright)", margin: 0 }}>
                {title}
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                This operation cannot be undone
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: "6px", borderRadius: "50%", width: "32px", height: "32px" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "18px 20px" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-main)", lineHeight: 1.5, margin: 0 }}>
            {message}
          </p>

          {details && (
            <div
              style={{
                background: "var(--bg-card-hover)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                fontSize: "0.8125rem",
                color: "var(--text-secondary)",
              }}
            >
              {details}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="modal-footer" style={{ padding: "12px 20px" }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={isDeleting}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className="btn btn-danger"
            disabled={isDeleting}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Trash2 size={14} />
            {isDeleting ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
