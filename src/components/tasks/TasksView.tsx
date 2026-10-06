import React, { useState, useMemo } from "react";
import { Plus, Search, Filter, Download, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { TaskItem, ServiceCategory } from "../../types";
import { useData } from "../../context/DataContext";
import { TaskCard } from "./TaskCard";
import { CategoryIcon, formatCategoryLabel } from "../common/CategoryIcon";

interface TasksViewProps {
  onOpenNewTask: () => void;
  onEditTask: (task: TaskItem) => void;
  onSettleDue: (task: TaskItem) => void;
  onPrintReceipt: (task: TaskItem) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  onOpenNewTask,
  onEditTask,
  onSettleDue,
  onPrintReceipt,
}) => {
  const { tasks, deleteTask, services } = useData();

  // Local filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<"all" | "due_only" | "paid_only">("all");
  const [dateFilter, setDateFilter] = useState<string>("all"); // 'all', 'today', 'yesterday', 'this_month', 'custom'
  const [customDate, setCustomDate] = useState<string>("");

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

  // Dynamic categories from services and tasks
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => set.add(s.name));
    tasks.forEach((t) => {
      if (t.serviceCategory) set.add(t.serviceCategory);
    });
    return Array.from(set);
  }, [services, tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = task.customerName.toLowerCase().includes(query);
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesPhone = task.customerPhone?.includes(query);
        const matchesRef = task.referenceNo?.toLowerCase().includes(query);
        if (!matchesName && !matchesTitle && !matchesPhone && !matchesRef) return false;
      }

      // 2. Category filter
      if (selectedCategory !== "all" && (task.serviceCategory || "").toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 3. Due status filter
      if (dueFilter === "due_only" && (task.dueAmount <= 0 || task.status === "cancelled")) {
        return false;
      }
      if (dueFilter === "paid_only" && task.dueAmount > 0) {
        return false;
      }

      // 4. Date filter
      if (dateFilter === "today" && task.date !== todayStr) return false;
      if (dateFilter === "yesterday" && task.date !== yesterdayStr) return false;
      if (dateFilter === "this_month" && !task.date.startsWith(currentMonthPrefix)) return false;
      if (dateFilter === "custom" && customDate && task.date !== customDate) return false;

      return true;
    });
  }, [tasks, searchTerm, selectedCategory, dueFilter, dateFilter, customDate, todayStr, yesterdayStr, currentMonthPrefix]);

  // Aggregated totals for filtered tasks
  const stats = useMemo(() => {
    const totalBilled = filteredTasks.reduce((acc, t) => acc + (Number(t.amountCharged) || 0), 0);
    const totalCost = filteredTasks.reduce((acc, t) => acc + (Number(t.amountIncurred) || 0), 0);
    const totalProfit = filteredTasks.reduce((acc, t) => acc + (Number(t.profit) || 0), 0);
    const totalDue = filteredTasks.reduce((acc, t) => acc + (Number(t.dueAmount) || 0), 0);
    return { totalBilled, totalCost, totalProfit, totalDue };
  }, [filteredTasks]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTasks.length === 0) {
      alert("No tasks to export in current filter!");
      return;
    }

    const headers = [
      "Task ID",
      "Date",
      "Time",
      "Title",
      "Category",
      "Customer Name",
      "Customer Phone",
      "Incurred Cost (₹)",
      "Charged Fee (₹)",
      "Amount Paid (₹)",
      "Profit (₹)",
      "Due Amount (₹)",
      "Payment Mode",
      "Status",
      "Reference No",
      "Remarks",
    ];

    const rows = filteredTasks.map((t) => [
      t.id,
      t.date,
      t.time || "",
      `"${t.title.replace(/"/g, '""')}"`,
      t.serviceCategory,
      `"${t.customerName.replace(/"/g, '""')}"`,
      t.customerPhone || "",
      t.amountIncurred,
      t.amountCharged,
      t.amountPaid,
      t.profit,
      t.dueAmount,
      t.paymentMode,
      t.status,
      t.referenceNo || "",
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SevaDesk_Tasks_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Header Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-bright)", letterSpacing: "-0.02em" }}>
            Tasks & Service Ledger
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Complete log of all customer transactions, margins & outstanding credit
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={handleExportCSV} className="btn btn-secondary" title="Export current list to CSV">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={onOpenNewTask} className="btn btn-primary">
            <Plus size={16} /> New Task Entry
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Search Input */}
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
              placeholder="Search by customer name, phone, title, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Filter Dropdown */}
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "140px" }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_month">This Month</option>
            <option value="custom">Specific Date...</option>
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

          {/* Due Status Filter */}
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "150px" }}
            value={dueFilter}
            onChange={(e) => setDueFilter(e.target.value as any)}
          >
            <option value="all">All Payment Status</option>
            <option value="due_only">Has Pending Dues ⚠️</option>
            <option value="paid_only">Fully Paid Only</option>
          </select>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "4px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setSelectedCategory("all")}
            className={`btn btn-sm ${selectedCategory === "all" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "5px 12px", borderRadius: "var(--radius-full)" }}
          >
            All Services ({tasks.length})
          </button>

          {availableCategories.map((cat) => {
            const count = tasks.filter((t) => (t.serviceCategory || "").toLowerCase() === cat.toLowerCase()).length;
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? "all" : cat)}
                className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-secondary"}`}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                }}
              >
                <CategoryIcon category={cat} size={13} />
                <span>{cat}</span>
                <span style={{ opacity: 0.7, fontSize: "0.6875rem" }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Banner for Current Filter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          padding: "12px 20px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
          Showing <strong style={{ color: "var(--text-bright)" }}>{filteredTasks.length}</strong> tasks
        </span>

        <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: "0.8125rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Billed: </span>
            <strong className="font-mono" style={{ color: "var(--text-bright)" }}>
              ₹{stats.totalBilled.toFixed(2)}
            </strong>
          </div>
          <div style={{ fontSize: "0.8125rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Profit: </span>
            <strong className="font-mono" style={{ color: "var(--emerald-profit)" }}>
              +₹{stats.totalProfit.toFixed(2)}
            </strong>
          </div>
          <div style={{ fontSize: "0.8125rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Credit Dues: </span>
            <strong className="font-mono" style={{ color: stats.totalDue > 0 ? "var(--rose-due)" : "var(--text-muted)" }}>
              ₹{stats.totalDue.toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      {/* Tasks Grid / List */}
      {filteredTasks.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: "48px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            <Search size={22} />
          </div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
            No tasks match your search or filters
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: "400px" }}>
            Try clearing your search term, switching categories, or create a new task entry now.
          </p>
          <button onClick={onOpenNewTask} className="btn btn-primary" style={{ marginTop: "8px" }}>
            <Plus size={15} /> Add New Task Entry
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredTasks.map((task) => (
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
  );
};
