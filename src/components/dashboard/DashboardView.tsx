import React from "react";
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Plus,
  Calendar,
  CalendarDays,
  Users,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  Clock
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { TaskItem } from "../../types";
import { StatCard } from "../common/StatCard";
import { TaskCard } from "../tasks/TaskCard";
import { ViewType } from "../layout/Sidebar";

interface DashboardViewProps {
  onOpenNewTask: () => void;
  onEditTask: (task: TaskItem) => void;
  onSettleDue: (task: TaskItem) => void;
  onPrintReceipt: (task: TaskItem) => void;
  onChangeView: (view: ViewType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewTask,
  onEditTask,
  onSettleDue,
  onPrintReceipt,
  onChangeView,
}) => {
  const { tasks, deleteTask, todayStats, overallStats } = useData();

  const recentTasks = tasks.slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Banner Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-bright)", letterSpacing: "-0.02em" }}>
            Operations Dashboard
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            Daily tasks, commission profits, customer khata ledger & dues
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => onChangeView("day")} className="btn btn-secondary btn-sm">
            <CalendarDays size={15} /> Day Drawer
          </button>
          <button onClick={onOpenNewTask} className="btn btn-primary btn-sm">
            <Plus size={15} /> New Task Entry
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Today's Net Profit"
          value={`+₹${todayStats.profit.toFixed(0)}`}
          subValue={`Revenue ₹${todayStats.revenue.toFixed(0)} • Cost ₹${todayStats.incurred.toFixed(0)}`}
          icon={TrendingUp}
          variant="emerald"
          badge="Net Margin"
          onClick={() => onChangeView("day")}
        />

        <StatCard
          title="Today's Total Billed"
          value={`₹${todayStats.revenue.toFixed(0)}`}
          subValue={`${todayStats.tasksCount} tasks entered today`}
          icon={DollarSign}
          variant="primary"
          onClick={() => onChangeView("tasks")}
        />

        <StatCard
          title="Pending Khata Dues"
          value={`₹${overallStats.totalDue.toFixed(0)}`}
          subValue="Outstanding customer credit balance"
          icon={CreditCard}
          variant="rose"
          badge={overallStats.totalDue > 0 ? "Pending" : "Cleared"}
          onClick={() => onChangeView("customers")}
        />

        <StatCard
          title="Clients & Records"
          value={overallStats.totalCustomers}
          subValue={`${overallStats.totalTasks} total tasks logged`}
          icon={Users}
          variant="indigo"
          onClick={() => onChangeView("customers")}
        />
      </div>

      {/* Main Section: Recent Tasks (Left) & Quick Navigation (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", alignItems: "start" }}>
        {/* Recent Tasks List */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-bright)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={16} style={{ color: "var(--accent-primary)" }} /> Recent Task Entries
            </h3>
            <button
              onClick={() => onChangeView("tasks")}
              className="btn btn-sm btn-secondary"
            >
              View All ({tasks.length}) <ArrowUpRight size={13} />
            </button>
          </div>

          {recentTasks.length === 0 ? (
            <div className="glass-panel" style={{ padding: "36px 20px", textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>No tasks logged yet.</p>
              <button onClick={onOpenNewTask} className="btn btn-primary btn-sm" style={{ marginTop: "10px" }}>
                <Plus size={14} /> Add First Task
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recentTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={onEditTask}
                  onDelete={deleteTask}
                  onSettleDue={onSettleDue}
                  onPrintReceipt={onPrintReceipt}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Shortcuts & Khata Alert */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Outstanding Khata Alert Box */}
          {overallStats.totalDue > 0 && (
            <div
              className="glass-panel"
              style={{
                padding: "16px",
                borderColor: "rgba(225, 29, 72, 0.3)",
                background: "rgba(225, 29, 72, 0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--rose-due)", marginBottom: "6px" }}>
                <AlertTriangle size={16} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 700 }}>Uncollected Customer Dues</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "10px" }}>
                Total <strong className="font-mono text-due">₹{overallStats.totalDue.toFixed(2)}</strong> pending across customer accounts.
              </p>
              <button
                onClick={() => onChangeView("customers")}
                className="btn btn-sm btn-danger-outline"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Open Customer Khata Ledger
              </button>
            </div>
          )}

          {/* Quick Views Navigation */}
          <div className="glass-panel" style={{ padding: "16px" }}>
            <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-bright)", marginBottom: "10px" }}>
              Quick Navigation
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <button
                onClick={() => onChangeView("day")}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: "flex-start" }}
              >
                <CalendarDays size={15} style={{ color: "var(--emerald-profit)" }} />
                <span>Today's Cash Drawer</span>
              </button>

              <button
                onClick={() => onChangeView("calendar")}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: "flex-start" }}
              >
                <Calendar size={15} style={{ color: "var(--accent-primary)" }} />
                <span>Calendar Timeline View</span>
              </button>

              <button
                onClick={() => onChangeView("customers")}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: "flex-start" }}
              >
                <Users size={15} style={{ color: "var(--purple-brand)" }} />
                <span>Customer Directory & Dues</span>
              </button>

              <button
                onClick={() => onChangeView("masters")}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: "flex-start" }}
              >
                <Layers size={15} style={{ color: "var(--amber-warning)" }} />
                <span>Master Menu Configuration</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
