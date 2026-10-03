import React from "react";
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  CheckCircle,
  Plus,
  Calendar,
  CalendarDays,
  Users,
  Layers,
  ArrowUpRight,
  Smartphone,
  Fingerprint,
  Zap,
  Utensils,
  Vote,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { TaskItem, ServiceCategory } from "../../types";
import { StatCard } from "../common/StatCard";
import { TaskCard } from "../tasks/TaskCard";
import { CategoryIcon, getCategoryColor } from "../common/CategoryIcon";
import { ViewType } from "../layout/Sidebar";

interface DashboardViewProps {
  onOpenNewTask: () => void;
  onOpenNewTaskWithService?: (category: ServiceCategory) => void;
  onEditTask: (task: TaskItem) => void;
  onSettleDue: (task: TaskItem) => void;
  onPrintReceipt: (task: TaskItem) => void;
  onChangeView: (view: ViewType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewTask,
  onOpenNewTaskWithService,
  onEditTask,
  onSettleDue,
  onPrintReceipt,
  onChangeView,
}) => {
  const { tasks, deleteTask, todayStats, overallStats, services } = useData();

  const recentTasks = tasks.slice(0, 5);

  const quickServices: { title: string; category: ServiceCategory; icon: any; color: string }[] = [
    { title: "Recharge", category: "recharge", icon: Smartphone, color: "#3b82f6" },
    { title: "AEPS Cash Out", category: "aeps", icon: Fingerprint, color: "#10b981" },
    { title: "Electric Bill", category: "electric_bill", icon: Zap, color: "#f59e0b" },
    { title: "Ration Card", category: "ration_card", icon: Utensils, color: "#8b5cf6" },
    { title: "Voter ID Card", category: "voter_card", icon: Vote, color: "#ec4899" },
    { title: "PAN Card", category: "pan_card", icon: CreditCard, color: "#06b6d4" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner / Welcome Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--text-bright)", letterSpacing: "-0.02em" }}>
            Operational Command Center
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Real-time daily tasks, commission profits, customer khata ledger & dues
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => onChangeView("day")} className="btn btn-secondary">
            <CalendarDays size={16} /> Day Drawer
          </button>
          <button onClick={onOpenNewTask} className="btn btn-primary">
            <Plus size={16} /> New Task Entry
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Today's Net Profit"
          value={`+₹${todayStats.profit.toFixed(0)}`}
          subValue={`Earned after ₹${todayStats.incurred.toFixed(0)} expenses`}
          icon={TrendingUp}
          variant="emerald"
          badge="Live Margin"
          onClick={() => onChangeView("day")}
        />

        <StatCard
          title="Today's Total Billed"
          value={`₹${todayStats.revenue.toFixed(0)}`}
          subValue={`${todayStats.tasksCount} transactions conducted today`}
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
          badge={overallStats.totalDue > 0 ? "Collect" : "Clear"}
          onClick={() => onChangeView("customers")}
        />

        <StatCard
          title="Registered Clients"
          value={overallStats.totalCustomers}
          subValue={`${overallStats.totalTasks} lifetime tasks recorded`}
          icon={Users}
          variant="indigo"
          onClick={() => onChangeView("customers")}
        />
      </div>

      {/* Quick Launch Service Matrix */}
      <div className="glass-panel" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} style={{ color: "var(--accent-primary)" }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-bright)" }}>
              One-Click Quick Task Launchers
            </h3>
          </div>
          <button
            onClick={() => onChangeView("masters")}
            className="btn btn-sm btn-outline"
            style={{ fontSize: "0.75rem" }}
          >
            Configure Masters <ArrowUpRight size={13} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
          {quickServices.map((qs) => {
            const Icon = qs.icon;
            return (
              <button
                key={qs.category}
                onClick={() => {
                  if (onOpenNewTaskWithService) {
                    onOpenNewTaskWithService(qs.category);
                  } else {
                    onOpenNewTask();
                  }
                }}
                className="glass-panel clickable"
                style={{
                  padding: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  border: `1px solid ${qs.color}30`,
                  background: `${qs.color}08`,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "var(--radius-sm)",
                    background: `${qs.color}25`,
                    color: qs.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                    {qs.title}
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>+ New Entry</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Bottom Section: Recent Tasks & Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", alignItems: "start" }}>
        {/* Recent Tasks List */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
              Recent Activity & Tasks
            </h3>
            <button
              onClick={() => onChangeView("tasks")}
              className="btn btn-sm btn-secondary"
            >
              View All ({tasks.length}) <ArrowUpRight size={13} />
            </button>
          </div>

          {recentTasks.length === 0 ? (
            <div className="glass-panel" style={{ padding: "36px", textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)" }}>No tasks logged yet today.</p>
              <button onClick={onOpenNewTask} className="btn btn-primary" style={{ marginTop: "10px" }}>
                <Plus size={15} /> Add First Task
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

        {/* Right Shortcuts & Khata Alert */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Outstanding Khata Box */}
          {overallStats.totalDue > 0 && (
            <div
              className="glass-panel"
              style={{
                padding: "18px",
                borderColor: "rgba(244, 63, 94, 0.3)",
                background: "rgba(244, 63, 94, 0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--rose-due)", marginBottom: "8px" }}>
                <AlertTriangle size={18} />
                <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>Uncollected Customer Dues</span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                You have <strong className="font-mono text-due">₹{overallStats.totalDue.toFixed(2)}</strong> pending across customers in your khata.
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

          {/* Quick Views Navigation Links */}
          <div className="glass-panel" style={{ padding: "18px" }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-bright)", marginBottom: "12px" }}>
              Workstation Shortcuts
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={() => onChangeView("calendar")}
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start" }}
              >
                <Calendar size={16} style={{ color: "var(--accent-primary)" }} />
                <span>Monthly Calendar View</span>
              </button>

              <button
                onClick={() => onChangeView("day")}
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start" }}
              >
                <CalendarDays size={16} style={{ color: "var(--emerald-profit)" }} />
                <span>Today's Cash Drawer & Report</span>
              </button>

              <button
                onClick={() => onChangeView("customers")}
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start" }}
              >
                <Users size={16} style={{ color: "var(--purple-brand)" }} />
                <span>Customer Master Directory</span>
              </button>

              <button
                onClick={() => onChangeView("masters")}
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start" }}
              >
                <Layers size={16} style={{ color: "var(--amber-warning)" }} />
                <span>Services Master & Fee Rates</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
