import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider, useData } from "./context/DataContext";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar, ViewType } from "./components/layout/Sidebar";
import { LoginPage } from "./components/auth/LoginPage";

import { DashboardView } from "./components/dashboard/DashboardView";
import { TasksView } from "./components/tasks/TasksView";
import { CalendarView } from "./components/calendar/CalendarView";
import { DayView } from "./components/dayview/DayView";
import { CustomerView } from "./components/customers/CustomerView";
import { MasterMenu } from "./components/masters/MasterMenu";

import { TaskModal } from "./components/tasks/TaskModal";
import { UserProfileModal } from "./components/auth/UserProfileModal";
import { SettleModal } from "./components/common/SettleModal";
import { ReceiptModal } from "./components/common/ReceiptModal";
import { TaskItem, ServiceCategory } from "./types";
import { ShieldCheck } from "lucide-react";

const MainAppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [taskDefaultDate, setTaskDefaultDate] = useState<string | undefined>(undefined);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [settleTask, setSettleTask] = useState<TaskItem | null>(null);
  const [receiptTask, setReceiptTask] = useState<TaskItem | null>(null);

  const [activeDayViewDate, setActiveDayViewDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if ((e.key === "n" || e.key === "N") && !e.ctrlKey && !e.metaKey) {
        setTaskToEdit(null);
        setTaskDefaultDate(undefined);
        setIsTaskModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 1. Loading state during auth initialization
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-primary)",
          color: "var(--text-main)",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, var(--accent-primary) 0%, #0284c7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <ShieldCheck size={28} />
        </div>
        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>
          Loading SevaDesk workspace...
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: FIRST PAGE IS LOGIN
  if (!currentUser) {
    return <LoginPage />;
  }

  // 3. Authenticated: Render Main App Workspace
  const handleOpenNewTask = () => {
    setTaskToEdit(null);
    setTaskDefaultDate(undefined);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTaskForDate = (dateStr: string) => {
    setTaskToEdit(null);
    setTaskDefaultDate(dateStr);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: TaskItem) => {
    setTaskToEdit(task);
    setTaskDefaultDate(undefined);
    setIsTaskModalOpen(true);
  };

  const handleSettleDue = (task: TaskItem) => {
    setSettleTask(task);
  };

  const handlePrintReceipt = (task: TaskItem) => {
    setReceiptTask(task);
  };

  const handleSwitchToDayView = (dateStr: string) => {
    setActiveDayViewDate(dateStr);
    setCurrentView("day");
  };

  return (
    <div className="app-container">
      {/* Sidebar (Desktop & Mobile Bottom Nav) */}
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          onOpenNewTask={handleOpenNewTask}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        <main className="page-body">
          {currentView === "dashboard" && (
            <DashboardView
              onOpenNewTask={handleOpenNewTask}
              onEditTask={handleEditTask}
              onSettleDue={handleSettleDue}
              onPrintReceipt={handlePrintReceipt}
              onChangeView={setCurrentView}
            />
          )}

          {currentView === "tasks" && (
            <TasksView
              onOpenNewTask={handleOpenNewTask}
              onEditTask={handleEditTask}
              onSettleDue={handleSettleDue}
              onPrintReceipt={handlePrintReceipt}
            />
          )}

          {currentView === "calendar" && (
            <CalendarView
              onOpenNewTaskForDate={handleOpenNewTaskForDate}
              onEditTask={handleEditTask}
              onSettleDue={handleSettleDue}
              onSwitchToDayView={handleSwitchToDayView}
            />
          )}

          {currentView === "day" && (
            <DayView
              initialDate={activeDayViewDate}
              onOpenNewTaskForDate={handleOpenNewTaskForDate}
              onEditTask={handleEditTask}
              onSettleDue={handleSettleDue}
              onPrintReceipt={handlePrintReceipt}
            />
          )}

          {currentView === "customers" && <CustomerView />}

          {currentView === "masters" && <MasterMenu />}
        </main>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultDate={taskDefaultDate}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <SettleModal
        isOpen={!!settleTask}
        onClose={() => setSettleTask(null)}
        task={settleTask}
      />

      <ReceiptModal
        isOpen={!!receiptTask}
        onClose={() => setReceiptTask(null)}
        task={receiptTask}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <MainAppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
