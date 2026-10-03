import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, ArrowRight, DollarSign } from "lucide-react";
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
      const mStr = String(month + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      const dateStr = `${year}-${mStr}-${dStr}`;
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

    // Next month padding to fill out 35 or 42 cells (7 cols)
    const remaining = (7 - (cells.length % 7)) % 7;
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

  // Tasks for the selected day
  const selectedDayTasks = tasksByDate[selectedDayStr] || [];
  const selectedDayProfit = selectedDayTasks.reduce((s, t) => s + (Number(t.profit) || 0), 0);
  const selectedDayDue = selectedDayTasks.reduce((s, t) => s + (Number(t.dueAmount) || 0), 0);
  const selectedDayBilled = selectedDayTasks.reduce((s, t) => s + (Number(t.amountCharged) || 0), 0);

  // Month totals
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthTasks = tasks.filter((t) => t.date.startsWith(monthPrefix));
  const monthProfit = monthTasks.reduce((s, t) => s + (Number(t.profit) || 0), 0);
  const monthBilled = monthTasks.reduce((s, t) => s + (Number(t.amountCharged) || 0), 0);
  const monthDues = monthTasks.reduce((s, t) => s + (Number(t.dueAmount) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Calendar Header with Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-bright)", letterSpacing: "-0.02em" }}>
            Calendar Timeline View
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Monthly visual breakdown of tasks, daily profits and credit dues
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={goToday} className="btn btn-secondary btn-sm">
            Today
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              padding: "4px",
            }}
          >
            <button
              onClick={prevMonth}
              className="btn btn-outline btn-sm"
              style={{ padding: "6px", width: "32px", height: "32px" }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <span
              style={{
                minWidth: "150px",
                textAlign: "center",
                fontWeight: 700,
                fontSize: "0.9375rem",
                color: "var(--text-bright)",
              }}
            >
              {monthNames[month]} {year}
            </span>

            <button
              onClick={nextMonth}
              className="btn btn-outline btn-sm"
              style={{ padding: "6px", width: "32px", height: "32px" }}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

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

      {/* Main Calendar & Day Detail Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "20px", alignItems: "start" }}>
        {/* Left: The Interactive Calendar Grid */}
        <div className="glass-panel" style={{ padding: "18px" }}>
          <div className="calendar-grid" style={{ marginBottom: "6px" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="calendar-day-header">
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
                  onClick={() => setSelectedDayStr(cell.dateStr)}
                  className={`calendar-cell ${!cell.isCurrentMonth ? "is-other-month" : ""} ${
                    cell.isToday ? "is-today" : ""
                  } ${isSelected ? "is-selected" : ""}`}
                  style={{ minHeight: "92px", position: "relative" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: cell.isToday || isSelected ? 800 : 500,
                        color: cell.isToday ? "var(--accent-primary)" : "var(--text-main)",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
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
                          padding: "1px 5px",
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
                    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                      {cell.profit > 0 && (
                        <div
                          className="font-mono"
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            color: "var(--emerald-profit)",
                            background: "rgba(16, 185, 129, 0.1)",
                            borderRadius: "3px",
                            padding: "1px 4px",
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
                            padding: "1px 4px",
                          }}
                        >
                          Due ₹{cell.due.toFixed(0)}
                        </div>
                      )}

                      {/* Small category color dots */}
                      <div style={{ display: "flex", gap: "3px", marginTop: "2px" }}>
                        {Array.from(new Set(cell.tasks.map((t) => t.serviceCategory)))
                          .slice(0, 4)
                          .map((cat, i) => (
                            <span
                              key={i}
                              style={{
                                width: "6px",
                                height: "6px",
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

        {/* Right: Selected Day Drawer / Task List */}
        <div
          className="glass-panel"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            position: "sticky",
            top: "88px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700 }}>
                Selected Date
              </span>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-bright)", marginTop: "2px" }}>
                {selectedDayStr}
              </h3>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => onSwitchToDayView(selectedDayStr)}
                className="btn btn-sm btn-secondary"
                title="Open detailed Day View with cash drawer"
              >
                Day View <ArrowRight size={13} />
              </button>
              <button
                onClick={() => onOpenNewTaskForDate(selectedDayStr)}
                className="btn btn-sm btn-primary"
                title="Add task on this date"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Day Metric Summary */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              background: "rgba(0, 0, 0, 0.25)",
              padding: "10px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Billed</div>
              <div className="font-mono" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-bright)" }}>
                ₹{selectedDayBilled.toFixed(0)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Profit</div>
              <div className="font-mono" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--emerald-profit)" }}>
                +₹{selectedDayProfit.toFixed(0)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Dues</div>
              <div className="font-mono" style={{ fontSize: "0.9375rem", fontWeight: 700, color: selectedDayDue > 0 ? "var(--rose-due)" : "var(--text-muted)" }}>
                ₹{selectedDayDue.toFixed(0)}
              </div>
            </div>
          </div>

          {/* List of Tasks for this day */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "460px", overflowY: "auto" }}>
            {selectedDayTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 12px", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                <CalendarIcon size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                <p>No tasks recorded on this date.</p>
                <button
                  onClick={() => onOpenNewTaskForDate(selectedDayStr)}
                  className="btn btn-sm btn-outline"
                  style={{ marginTop: "10px" }}
                >
                  <Plus size={13} /> Add Entry for {selectedDayStr}
                </button>
              </div>
            ) : (
              selectedDayTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={onEditTask}
                  onDelete={deleteTask}
                  onSettleDue={onSettleDue}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
