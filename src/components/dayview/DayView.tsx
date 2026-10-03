import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Printer,
  Plus,
  DollarSign,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Banknote,
  QrCode,
  AlertCircle
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { TaskItem } from "../../types";
import { TaskCard } from "../tasks/TaskCard";
import { CategoryIcon, getCategoryColor, formatCategoryLabel } from "../common/CategoryIcon";

interface DayViewProps {
  initialDate?: string;
  onOpenNewTaskForDate: (dateStr: string) => void;
  onEditTask: (task: TaskItem) => void;
  onSettleDue: (task: TaskItem) => void;
  onPrintReceipt: (task: TaskItem) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  initialDate,
  onOpenNewTaskForDate,
  onEditTask,
  onSettleDue,
  onPrintReceipt,
}) => {
  const { tasks, deleteTask, userProfile } = useData() as any;

  const [currentDateStr, setCurrentDateStr] = useState<string>(
    initialDate || new Date().toISOString().split("T")[0]
  );

  // Jump by days
  const changeDateBy = (days: number) => {
    const d = new Date(currentDateStr);
    d.setDate(d.getDate() + days);
    setCurrentDateStr(d.toISOString().split("T")[0]);
  };

  const jumpToToday = () => {
    setCurrentDateStr(new Date().toISOString().split("T")[0]);
  };

  // Tasks for current date
  const dayTasks = useMemo(() => {
    return tasks
      .filter((t: TaskItem) => t.date === currentDateStr)
      .sort((a: TaskItem, b: TaskItem) => (b.time || "").localeCompare(a.time || ""));
  }, [tasks, currentDateStr]);

  // Daily Cash Drawer calculation
  const metrics = useMemo(() => {
    let totalBilled = 0;
    let totalIncurred = 0;
    let totalProfit = 0;
    let totalPaid = 0;
    let totalDues = 0;
    let cashPaid = 0;
    let upiPaid = 0;
    let otherPaid = 0;

    const categorySummary: Record<string, { count: number; billed: number; profit: number }> = {};

    dayTasks.forEach((t: TaskItem) => {
      if (t.status === "cancelled") return;

      const charged = Number(t.amountCharged) || 0;
      const incurred = Number(t.amountIncurred) || 0;
      const profit = Number(t.profit) || 0;
      const paid = Number(t.amountPaid) || 0;
      const due = Number(t.dueAmount) || 0;

      totalBilled += charged;
      totalIncurred += incurred;
      totalProfit += profit;
      totalPaid += paid;
      totalDues += due;

      if (t.paymentMode === "cash") cashPaid += paid;
      else if (t.paymentMode === "upi") upiPaid += paid;
      else otherPaid += paid;

      if (!categorySummary[t.serviceCategory]) {
        categorySummary[t.serviceCategory] = { count: 0, billed: 0, profit: 0 };
      }
      categorySummary[t.serviceCategory].count += 1;
      categorySummary[t.serviceCategory].billed += charged;
      categorySummary[t.serviceCategory].profit += profit;
    });

    return {
      totalBilled,
      totalIncurred,
      totalProfit,
      totalPaid,
      totalDues,
      cashPaid,
      upiPaid,
      otherPaid,
      categorySummary,
    };
  }, [dayTasks]);

  // Formatted date label (e.g. Saturday, 04 October 2026)
  const formattedDateTitle = useMemo(() => {
    try {
      const d = new Date(currentDateStr + "T00:00:00");
      return d.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return currentDateStr;
    }
  }, [currentDateStr]);

  // Print Daily Closing Sheet
  const handlePrintDailySheet = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Header & Date Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Daily Cashbook & Closing Drawer
          </span>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-bright)", letterSpacing: "-0.02em", marginTop: "2px" }}>
            {formattedDateTitle}
          </h2>
        </div>

        {/* Date Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => changeDateBy(-1)} className="btn btn-secondary btn-sm" title="Previous Day">
            <ChevronLeft size={16} /> Prev Day
          </button>

          <button onClick={jumpToToday} className="btn btn-outline btn-sm">
            Today
          </button>

          <input
            type="date"
            className="form-input"
            style={{ width: "auto", padding: "6px 12px" }}
            value={currentDateStr}
            onChange={(e) => setCurrentDateStr(e.target.value)}
          />

          <button onClick={() => changeDateBy(1)} className="btn btn-secondary btn-sm" title="Next Day">
            Next Day <ChevronRight size={16} />
          </button>

          <button onClick={handlePrintDailySheet} className="btn btn-secondary btn-sm" title="Print Daily Summary">
            <Printer size={15} /> Print Sheet
          </button>

          <button onClick={() => onOpenNewTaskForDate(currentDateStr)} className="btn btn-primary btn-sm">
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Cash Drawer & Daily Financial Matrix */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Revenue */}
        <div className="glass-panel" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 600 }}>Total Billed</span>
            <div style={{ color: "var(--accent-primary)" }}><ArrowUpRight size={18} /></div>
          </div>
          <div className="font-mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-bright)" }}>
            ₹{metrics.totalBilled.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Cost Incurred: ₹{metrics.totalIncurred.toFixed(2)}
          </div>
        </div>

        {/* Daily Net Profit */}
        <div
          className="glass-panel"
          style={{
            padding: "18px",
            borderColor: "rgba(16, 185, 129, 0.3)",
            background: "rgba(16, 185, 129, 0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--emerald-profit)", fontWeight: 700 }}>Daily Net Profit</span>
            <div style={{ color: "var(--emerald-profit)" }}><TrendingUp size={18} /></div>
          </div>
          <div className="font-mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--emerald-profit)" }}>
            +₹{metrics.totalProfit.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Earnings after costs deducted
          </div>
        </div>

        {/* Cash Collected in Drawer */}
        <div className="glass-panel" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 600 }}>Cash Collected</span>
            <div style={{ color: "#34d399" }}><Banknote size={18} /></div>
          </div>
          <div className="font-mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#34d399" }}>
            ₹{metrics.cashPaid.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Physical cash in counter drawer
          </div>
        </div>

        {/* UPI / QR Received */}
        <div className="glass-panel" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 600 }}>UPI / Online</span>
            <div style={{ color: "#818cf8" }}><QrCode size={18} /></div>
          </div>
          <div className="font-mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#818cf8" }}>
            ₹{metrics.upiPaid.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Direct bank transfer / Scanner
          </div>
        </div>

        {/* New Dues Today */}
        <div
          className="glass-panel"
          style={{
            padding: "18px",
            borderColor: metrics.totalDues > 0 ? "rgba(244, 63, 94, 0.3)" : "var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.8125rem", color: metrics.totalDues > 0 ? "var(--rose-due)" : "var(--text-secondary)", fontWeight: 600 }}>
              New Dues Today
            </span>
            <div style={{ color: "var(--rose-due)" }}><CreditCard size={18} /></div>
          </div>
          <div className="font-mono" style={{ fontSize: "1.5rem", fontWeight: 700, color: metrics.totalDues > 0 ? "var(--rose-due)" : "var(--text-muted)" }}>
            ₹{metrics.totalDues.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Pending customer credit
          </div>
        </div>
      </div>

      {/* Category Breakdown for Today */}
      {Object.keys(metrics.categorySummary).length > 0 && (
        <div className="glass-panel" style={{ padding: "18px 22px" }}>
          <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-bright)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Service Categories Breakdown Today
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
            {Object.entries(metrics.categorySummary).map(([cat, data]) => {
              const color = getCategoryColor(cat);
              return (
                <div
                  key={cat}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${color}35`,
                    borderRadius: "var(--radius-md)",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "var(--radius-sm)",
                      background: `${color}20`,
                      color: color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CategoryIcon category={cat} size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                      {formatCategoryLabel(cat)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                      <span>{data.count} tasks</span>
                      <span className="font-mono text-profit">+₹{data.profit.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Tasks List */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
            Today's Transaction Log ({dayTasks.length} entries)
          </h3>
          <button onClick={() => onOpenNewTaskForDate(currentDateStr)} className="btn btn-primary btn-sm">
            <Plus size={14} /> Add Entry
          </button>
        </div>

        {dayTasks.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: "48px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <CalendarDays size={36} style={{ color: "var(--text-muted)" }} />
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-bright)" }}>
              No tasks recorded for {formattedDateTitle}
            </h4>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", maxWidth: "360px" }}>
              Start your day by logging tasks like recharges, AEPS cash-outs, electric bills or voter cards.
            </p>
            <button
              onClick={() => onOpenNewTaskForDate(currentDateStr)}
              className="btn btn-primary"
              style={{ marginTop: "6px" }}
            >
              <Plus size={15} /> Record First Task
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {dayTasks.map((task: TaskItem) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={deleteTask}
                onSettleDue={onSettleDue}
                onPrintReceipt={onPrintReceipt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
