import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, ArrowRight, DollarSign, X } from "lucide-react";
import { useData } from "../../context/DataContext";
import { TaskItem } from "../../types";
import { TaskCard } from "../tasks/TaskCard";
import { getCategoryColor } from "../common/CategoryIcon";

interface CalendarViewProps {
  onOpenNewTaskForDate: (dateStr: string) => void;
  onEditTask: (task: TaskItem) => void;
  onSettleDue: (task: TaskItem) => void;
  onSwitchToDayView: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenNewTaskForDate,
  onEditTask,
  onSettleDue,
  onSwitchToDayView,
}) => {
  const { tasks, deleteTask } = useData();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);

  // Background scroll lock when date modal is open
  useEffect(() => {
    if (isDateModalOpen) {
      document.body.classList.add("modal-open");
      return () => {
        document.body.classList.remove("modal-open");
      };
    }
  }, [isDateModalOpen]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const goToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDayStr(now.toISOString().split("T")[0]);
  };

  // Month name
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Group all tasks by date string (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map: Record<string, TaskItem[]> = {};
    tasks.forEach((t) => {
      if (!map[t.date]) {
        map[t.date] = [];
      }
      map[t.date].push(t);
    });
    return map;
  }, [tasks]);

  // Compute month cells (previous month padding + current month days + next month padding)
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      tasks: TaskItem[];
      profit: number;
      due: number;
    }[] = [];

    const todayStr = new Date().toISOString().split("T")[0];

    // Previous month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = prevDate.toISOString().split("T")[0];
      const dayTasks = tasksByDate[dateStr] || [];
      const profit = dayTasks.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
      const due = dayTasks.reduce((sum, t) => sum + (Number(t.dueAmount) || 0), 0);

      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDayStr,
        tasks: dayTasks,
        profit,
        due,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(year, month, d);
      const dateStr = thisDate.toISOString().split("T")[0];
      const dayTasks = tasksByDate[dateStr] || [];
      const profit = dayTasks.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
      const due = dayTasks.reduce((sum, t) => sum + (Number(t.dueAmount) || 0), 0);

      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDayStr,
        tasks: dayTasks,
        profit,
        due,
      });
    }

    // Next month padding days to fill 35 or 42 grid cells
    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = nextDate.toISOString().split("T")[0];
      const dayTasks = tasksByDate[dateStr] || [];
      const profit = dayTasks.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
      const due = dayTasks.reduce((sum, t) => sum + (Number(t.dueAmount) || 0), 0);

      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDayStr,
        tasks: dayTasks,
        profit,
        due,
      });
    }

    return cells;
  }, [year, month, tasksByDate, selectedDayStr]);

  // Selected Day's tasks and metrics
  const selectedDayTasks = tasksByDate[selectedDayStr] || [];
  const selectedDayBilled = selectedDayTasks.reduce((sum, t) => sum + (Number(t.amountCharged) || 0), 0);
  const selectedDayProfit = selectedDayTasks.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
  const selectedDayDue = selectedDayTasks.reduce((sum, t) => sum + (Number(t.dueAmount) || 0), 0);

  // Month totals
  const monthTasks = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return tasks.filter((t) => t.date.startsWith(prefix));
  }, [tasks, year, month]);

  const monthBilled = monthTasks.reduce((sum, t) => sum + (Number(t.amountCharged) || 0), 0);
  const monthProfit = monthTasks.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
  const monthDues = monthTasks.reduce((sum, t) => sum + (Number(t.dueAmount) || 0), 0);

  const handleCellClick = (dateStr: string) => {
    setSelectedDayStr(dateStr);
    setIsDateModalOpen(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Calendar Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-bright)", letterSpacing: "-0.02em" }}>
            Monthly Activity Calendar
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            Visual timeline of seva tasks, daily revenue, and pending dues
          </p>
        </div>

        {/* Navigation & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--bg-card)", padding: "4px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <button
              onClick={prevMonth}
              className="btn btn-outline"
              style={{ padding: "6px", borderRadius: "50%", width: "28px", height: "28px" }}
              title="Previous Month"
            >
              <ChevronLeft size={15} />
            </button>

            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-bright)", minWidth: "140px", textAlign: "center" }}>
              {monthNames[month]} {year}
            </span>

            <button
              onClick={nextMonth}
              className="btn btn-outline"
              style={{ padding: "6px", borderRadius: "50%", width: "28px", height: "28px" }}
              title="Next Month"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <button onClick={goToday} className="btn btn-secondary btn-sm">
            Current Day
          </button>

          <button
            onClick={() => onOpenNewTaskForDate(selectedDayStr)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>

      {/* Month Highlights Widget */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
        }}
      >
        <div className="glass-panel" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            {monthNames[month]} Total Revenue
          </div>
          <div className="font-mono" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-bright)", marginTop: "2px" }}>
            ₹{monthBilled.toFixed(2)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "14px 18px", borderLeft: "4px solid var(--emerald-profit)" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            {monthNames[month]} Net Profit
          </div>
          <div className="font-mono" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--emerald-profit)", marginTop: "2px" }}>
            +₹{monthProfit.toFixed(2)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "14px 18px", borderLeft: "4px solid var(--rose-due)" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            {monthNames[month]} Uncollected Dues
          </div>
          <div className="font-mono" style={{ fontSize: "1.25rem", fontWeight: 700, color: monthDues > 0 ? "var(--rose-due)" : "var(--text-muted)", marginTop: "2px" }}>
            ₹{monthDues.toFixed(2)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Total Tasks Logged
          </div>
          <div className="font-mono" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent-primary)", marginTop: "2px" }}>
            {monthTasks.length} tasks
          </div>
        </div>
      </div>

      {/* Main Full-Width Interactive Calendar Grid */}
      <div className="glass-panel" style={{ padding: "20px" }}>
        <div className="calendar-grid" style={{ marginBottom: "8px" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="calendar-day-header" style={{ padding: "10px 0", fontSize: "0.8125rem" }}>
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarDays.map((cell, idx) => {
            const hasTasks = cell.tasks.length > 0;
            const isSelected = cell.dateStr === selectedDayStr;

            return (
              <div
                key={idx}
                onClick={() => handleCellClick(cell.dateStr)}
                className={`calendar-cell ${!cell.isCurrentMonth ? "is-other-month" : ""} ${
                  cell.isToday ? "is-today" : ""
                } ${isSelected ? "is-selected" : ""}`}
                style={{
                  minHeight: "105px",
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
                title={`Click to view tasks for ${cell.dateStr}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: cell.isToday || isSelected ? 800 : 600,
                      color: cell.isToday ? "var(--accent-primary)" : "var(--text-main)",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: cell.isToday ? "rgba(6, 182, 212, 0.2)" : "transparent",
                    }}
                  >
                    {cell.day}
                  </span>

                  {hasTasks && (
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(255,255,255,0.08)",
                        color: "var(--text-bright)",
                      }}
                    >
                      {cell.tasks.length}
                    </span>
                  )}
                </div>

                {/* Day Content Badges */}
                {hasTasks ? (
                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "3px" }}>
                    {cell.profit > 0 && (
                      <div
                        className="font-mono"
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          color: "var(--emerald-profit)",
                          background: "rgba(16, 185, 129, 0.1)",
                          borderRadius: "3px",
                          padding: "2px 5px",
                        }}
                      >
                        +₹{cell.profit.toFixed(0)}
                      </div>
                    )}

                    {cell.due > 0 && (
                      <div
                        className="font-mono"
                        style={{
                          fontSize: "0.625rem",
                          fontWeight: 700,
                          color: "var(--rose-due)",
                          background: "rgba(244, 63, 94, 0.1)",
                          borderRadius: "3px",
                          padding: "2px 5px",
                        }}
                      >
                        Due ₹{cell.due.toFixed(0)}
                      </div>
                    )}

                    {/* Category dots */}
                    <div style={{ display: "flex", gap: "4px", marginTop: "2px", flexWrap: "wrap" }}>
                      {Array.from(new Set(cell.tasks.map((t) => t.serviceCategory)))
                        .slice(0, 5)
                        .map((cat, i) => (
                          <span
                            key={i}
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              background: getCategoryColor(cat),
                            }}
                          />
                        ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Modal (Opens when clicked on a calendar date) */}
      {isDateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDateModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "620px" }}
          >
            {/* Fixed Header */}
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(2, 132, 199, 0.15)",
                    color: "var(--accent-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-bright)", margin: 0 }}>
                    Tasks for {selectedDayStr}
                  </h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                    {selectedDayTasks.length} {selectedDayTasks.length === 1 ? "task entry" : "task entries"} recorded
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => {
                    setIsDateModalOpen(false);
                    onSwitchToDayView(selectedDayStr);
                  }}
                  className="btn btn-sm btn-secondary"
                  title="Open detailed Day View with cash drawer"
                >
                  Day View <ArrowRight size={13} />
                </button>
                <button
                  onClick={() => setIsDateModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: "6px", borderRadius: "50%", width: "32px", height: "32px" }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Day Metrics */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  background: "var(--bg-card-hover)",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  textAlign: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Total Billed</div>
                  <div className="font-mono" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-bright)" }}>
                    ₹{selectedDayBilled.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Net Profit</div>
                  <div className="font-mono" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--emerald-profit)" }}>
                    +₹{selectedDayProfit.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Pending Dues</div>
                  <div className="font-mono" style={{ fontSize: "1.125rem", fontWeight: 700, color: selectedDayDue > 0 ? "var(--rose-due)" : "var(--text-muted)" }}>
                    ₹{selectedDayDue.toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedDayTasks.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "36px 16px", color: "var(--text-muted)" }}>
                    <CalendarIcon size={36} style={{ margin: "0 auto 10px", opacity: 0.35 }} />
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "4px" }}>
                      No tasks recorded on this date
                    </p>
                    <p style={{ fontSize: "0.75rem", marginBottom: "14px" }}>
                      Click below to add a new task for {selectedDayStr}.
                    </p>
                    <button
                      onClick={() => {
                        setIsDateModalOpen(false);
                        onOpenNewTaskForDate(selectedDayStr);
                      }}
                      className="btn btn-sm btn-primary"
                    >
                      <Plus size={13} /> Add Task for {selectedDayStr}
                    </button>
                  </div>
                ) : (
                  selectedDayTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={(task) => {
                        setIsDateModalOpen(false);
                        onEditTask(task);
                      }}
                      onDelete={deleteTask}
                      onSettleDue={onSettleDue}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="modal-footer" style={{ justifyContent: "space-between" }}>
              <button
                onClick={() => {
                  setIsDateModalOpen(false);
                  onOpenNewTaskForDate(selectedDayStr);
                }}
                className="btn btn-sm btn-primary"
              >
                <Plus size={13} /> Add Task for this Date
              </button>
              <button onClick={() => setIsDateModalOpen(false)} className="btn btn-sm btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
