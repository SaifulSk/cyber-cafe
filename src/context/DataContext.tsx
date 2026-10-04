import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { TaskItem, Customer, ServiceMasterItem, ServiceCategory, DuePaymentRecord } from "../types";
import { useAuth } from "./AuthContext";
import {
  subscribeToTasks,
  subscribeToCustomers,
  subscribeToServices,
  subscribeToDuePayments,
  saveTaskItem,
  deleteTaskItem,
  saveCustomerItem,
  deleteCustomerItem,
  saveServiceMasterItem,
  deleteServiceMasterItem,
  saveDuePaymentRecord,
  deleteDuePaymentRecord,
  settleCustomerDue,
} from "../firebase/db";

interface DataContextType {
  tasks: TaskItem[];
  customers: Customer[];
  services: ServiceMasterItem[];
  duePayments: DuePaymentRecord[];
  loading: boolean;
  activeFilterCategory: ServiceCategory | "all";
  setActiveFilterCategory: (cat: ServiceCategory | "all") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  // CRUD
  addTask: (task: Omit<TaskItem, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<TaskItem>;
  updateTask: (task: TaskItem) => Promise<TaskItem>;
  deleteTask: (taskId: string) => Promise<void>;
  addCustomer: (cust: Omit<Customer, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<Customer>;
  updateCustomer: (cust: Customer) => Promise<Customer>;
  deleteCustomer: (custId: string) => Promise<void>;
  addService: (srv: Omit<ServiceMasterItem, "id" | "userId"> & { id?: string }) => Promise<ServiceMasterItem>;
  updateService: (srv: ServiceMasterItem) => Promise<ServiceMasterItem>;
  deleteService: (srvId: string) => Promise<void>;
  recordDuePayment: (record: Omit<DuePaymentRecord, "id" | "userId" | "createdAt"> & { id?: string }) => Promise<DuePaymentRecord>;
  updateDuePayment: (record: DuePaymentRecord) => Promise<DuePaymentRecord>;
  deleteDuePayment: (paymentId: string) => Promise<void>;
  settleDue: (
    customerName: string,
    amount: number,
    mode: 'cash' | 'upi' | 'bank_transfer',
    note?: string,
    paidDate?: string,
    paidTime?: string,
    taskId?: string,
    taskTitle?: string
  ) => Promise<void>;
  // Derived
  todayStats: {
    revenue: number;
    incurred: number;
    profit: number;
    dues: number;
    tasksCount: number;
  };
  overallStats: {
    totalRevenue: number;
    totalProfit: number;
    totalIncurred: number;
    totalDue: number;
    totalTasks: number;
    totalCustomers: number;
  };
  getTasksForDate: (dateStr: string) => TaskItem[];
  getCustomerHistory: (customerName: string) => {
    tasks: TaskItem[];
    totalBilled: number;
    totalPaid: number;
    totalDue: number;
    lastVisit?: string;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const activeUid = currentUser?.uid || "guest_operator";

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServiceMasterItem[]>([]);
  const [duePayments, setDuePayments] = useState<DuePaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [activeFilterCategory, setActiveFilterCategory] = useState<ServiceCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Subscribe to Firestore / LocalStorage
  useEffect(() => {
    if (!activeUid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to tasks
    const unsubTasks = subscribeToTasks(activeUid, (items) => {
      setTasks(items);
      setLoading(false);
    });

    // Subscribe to customers
    const unsubCust = subscribeToCustomers(activeUid, (custs) => {
      setCustomers(custs);
    });

    // Subscribe to master services
    const unsubSrv = subscribeToServices(activeUid, (srvs) => {
      setServices(srvs);
    });

    // Subscribe to due payments
    const unsubDuePay = subscribeToDuePayments(activeUid, (records) => {
      setDuePayments(records);
    });

    return () => {
      unsubTasks();
      unsubCust();
      unsubSrv();
      unsubDuePay();
    };
  }, [activeUid]);

  // CRUD Operations
  const addTask = async (
    taskData: Omit<TaskItem, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    const saved = await saveTaskItem(activeUid, taskData);
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...prev];
    });
    return saved;
  };

  const updateTask = async (task: TaskItem) => {
    const updated = await saveTaskItem(activeUid, task);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    return updated;
  };

  const deleteTask = async (taskId: string) => {
    await deleteTaskItem(activeUid, taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const addCustomer = async (
    custData: Omit<Customer, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    const saved = await saveCustomerItem(activeUid, custData);
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved];
    });
    return saved;
  };

  const updateCustomer = async (cust: Customer) => {
    const updated = await saveCustomerItem(activeUid, cust);
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    return updated;
  };

  const deleteCustomer = async (custId: string) => {
    await deleteCustomerItem(activeUid, custId);
    setCustomers((prev) => prev.filter((c) => c.id !== custId));
  };

  const addService = async (
    srvData: Omit<ServiceMasterItem, "id" | "userId"> & { id?: string }
  ) => {
    const saved = await saveServiceMasterItem(activeUid, srvData);
    setServices((prev) => [...prev, saved]);
    return saved;
  };

  const updateService = async (srv: ServiceMasterItem) => {
    const updated = await saveServiceMasterItem(activeUid, srv);
    setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    return updated;
  };

  const deleteService = async (srvId: string) => {
    await deleteServiceMasterItem(activeUid, srvId);
    setServices((prev) => prev.filter((s) => s.id !== srvId));
  };

  const recordDuePayment = async (
    recordData: Omit<DuePaymentRecord, "id" | "userId" | "createdAt"> & { id?: string }
  ) => {
    const saved = await saveDuePaymentRecord(activeUid, recordData);
    setDuePayments((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
    return saved;
  };

  const updateDuePayment = async (updatedRecord: DuePaymentRecord) => {
    // 1. If amount changed, adjust the linked task
    const oldRecord = duePayments.find((p) => p.id === updatedRecord.id);
    if (oldRecord) {
      const oldAmount = Number(oldRecord.amount) || 0;
      const newAmount = Number(updatedRecord.amount) || 0;
      const diff = newAmount - oldAmount; // positive if paid more, negative if paid less

      if (diff !== 0) {
        let targetTask: TaskItem | undefined;
        if (updatedRecord.taskId) {
          targetTask = tasks.find((t) => t.id === updatedRecord.taskId);
        }
        if (!targetTask && updatedRecord.customerName) {
          const custTasks = tasks.filter(
            (t) => t.customerName.toLowerCase().trim() === updatedRecord.customerName.toLowerCase().trim()
          );
          targetTask = custTasks.find((t) => t.title === updatedRecord.taskTitle) || custTasks[0];
        }

        if (targetTask) {
          const currentPaid = Number(targetTask.amountPaid) || 0;
          const currentCharged = Number(targetTask.amountCharged) || 0;
          const newPaid = Math.max(0, currentPaid + diff);
          const newDue = Math.max(0, currentCharged - newPaid);
          const newStatus = newDue === 0 ? "completed" : targetTask.status;

          const updatedTask: TaskItem = {
            ...targetTask,
            amountPaid: newPaid,
            dueAmount: newDue,
            status: newStatus,
            updatedAt: Date.now(),
          };

          await saveTaskItem(activeUid, updatedTask);
          setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
        }
      }
    }

    // 2. Persist updated due payment record
    const saved = await saveDuePaymentRecord(activeUid, updatedRecord);
    setDuePayments((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    return saved;
  };

  const deleteDuePayment = async (paymentId: string) => {
    const record = duePayments.find((p) => p.id === paymentId);

    if (record) {
      const refundAmount = Number(record.amount) || 0;

      // 1. Find the task that was settled
      let targetTask: TaskItem | undefined;
      if (record.taskId) {
        targetTask = tasks.find((t) => t.id === record.taskId);
      }

      // If not found by taskId, search customer's tasks by title or name
      if (!targetTask && record.customerName) {
        const custTasks = tasks.filter(
          (t) => t.customerName.toLowerCase().trim() === record.customerName.toLowerCase().trim()
        );
        targetTask = custTasks.find((t) => t.title === record.taskTitle) || custTasks[0];
      }

      if (targetTask) {
        // Re-add the due amount and reduce amountPaid
        const currentPaid = Number(targetTask.amountPaid) || 0;
        const currentCharged = Number(targetTask.amountCharged) || 0;
        const revertedPaid = Math.max(0, currentPaid - refundAmount);
        const revertedDue = Math.max(0, currentCharged - revertedPaid);
        const revertedStatus = revertedDue > 0 && targetTask.status === "completed" ? "pending" : targetTask.status;

        const updatedTask: TaskItem = {
          ...targetTask,
          amountPaid: revertedPaid,
          dueAmount: revertedDue,
          status: revertedStatus,
          updatedAt: Date.now(),
        };

        // Persist task to localStorage & Firestore
        await saveTaskItem(activeUid, updatedTask);

        // Update React tasks state immediately
        setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      } else if (record.customerName) {
        // Reverse across customer's tasks where amountPaid > 0
        const custTasks = tasks.filter(
          (t) => t.customerName.toLowerCase().trim() === record.customerName.toLowerCase().trim()
        );
        let rem = refundAmount;
        const updatedBatch: TaskItem[] = [];
        const sorted = [...custTasks].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

        for (const t of sorted) {
          if (rem <= 0) break;
          const paid = Number(t.amountPaid) || 0;
          if (paid <= 0) continue;
          const chunk = Math.min(rem, paid);
          const newPaid = paid - chunk;
          const newDue = Math.max(0, (Number(t.amountCharged) || 0) - newPaid);
          const newStatus = newDue > 0 && t.status === "completed" ? "pending" : t.status;
          const updatedT: TaskItem = {
            ...t,
            amountPaid: newPaid,
            dueAmount: newDue,
            status: newStatus,
            updatedAt: Date.now(),
          };
          updatedBatch.push(updatedT);
          rem -= chunk;
          await saveTaskItem(activeUid, updatedT);
        }

        if (updatedBatch.length > 0) {
          setTasks((prev) =>
            prev.map((t) => {
              const found = updatedBatch.find((u) => u.id === t.id);
              return found || t;
            })
          );
        }
      }
    }

    // 2. Delete payment record from storage & Firestore
    await deleteDuePaymentRecord(activeUid, paymentId);

    // 3. Update React duePayments state immediately
    setDuePayments((prev) => prev.filter((p) => p.id !== paymentId));
  };

  const settleDue = async (
    customerName: string,
    amount: number,
    mode: 'cash' | 'upi' | 'bank_transfer',
    note?: string,
    paidDate?: string,
    paidTime?: string,
    taskId?: string,
    taskTitle?: string
  ) => {
    const payVal = Number(amount) || 0;
    if (payVal <= 0) return;

    let linkedTaskId = taskId;
    let linkedTaskTitle = taskTitle;

    // 1. If a specific task ID is provided, update that task
    if (taskId) {
      const targetTask = tasks.find((t) => t.id === taskId);
      if (targetTask) {
        linkedTaskTitle = targetTask.title;
        const currentPaid = Number(targetTask.amountPaid) || 0;
        const currentCharged = Number(targetTask.amountCharged) || 0;
        const newPaid = currentPaid + payVal;
        const newDue = Math.max(0, currentCharged - newPaid);
        const newStatus = newDue === 0 ? "completed" : targetTask.status;

        const updatedTask: TaskItem = {
          ...targetTask,
          amountPaid: newPaid,
          dueAmount: newDue,
          status: newStatus,
          updatedAt: Date.now(),
        };

        await saveTaskItem(activeUid, updatedTask);
        setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      }
    } else {
      // 2. If no specific taskId was provided, distribute payment across customer's tasks with dues
      const custTasks = tasks.filter(
        (t) => t.customerName.toLowerCase().trim() === customerName.toLowerCase().trim()
      );
      // Oldest unpaid tasks first
      const tasksWithDue = custTasks
        .filter((t) => Number(t.dueAmount) > 0)
        .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

      let remaining = payVal;
      const updatedBatch: TaskItem[] = [];

      for (const t of tasksWithDue) {
        if (remaining <= 0) break;
        const tDue = Number(t.dueAmount) || 0;
        const chunk = Math.min(remaining, tDue);
        const currentPaid = Number(t.amountPaid) || 0;
        const currentCharged = Number(t.amountCharged) || 0;
        const newPaid = currentPaid + chunk;
        const newDue = Math.max(0, currentCharged - newPaid);
        const newStatus = newDue === 0 ? "completed" : t.status;

        const updatedT: TaskItem = {
          ...t,
          amountPaid: newPaid,
          dueAmount: newDue,
          status: newStatus,
          updatedAt: Date.now(),
        };

        updatedBatch.push(updatedT);
        if (!linkedTaskId) {
          linkedTaskId = t.id;
          linkedTaskTitle = t.title;
        }
        remaining -= chunk;
        await saveTaskItem(activeUid, updatedT);
      }

      if (updatedBatch.length > 0) {
        setTasks((prev) =>
          prev.map((t) => {
            const found = updatedBatch.find((u) => u.id === t.id);
            return found || t;
          })
        );
      }
    }

    // 3. Save Due Payment Record
    const now = new Date();
    const dateStr = paidDate || now.toISOString().split("T")[0];
    const timeStr = paidTime || now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

    const savedRecord = await saveDuePaymentRecord(activeUid, {
      taskId: linkedTaskId,
      taskTitle: linkedTaskTitle || `Balance Settlement`,
      customerName,
      amount: payVal,
      paidDate: dateStr,
      paidTime: timeStr,
      paymentMode: mode,
      notes: note || `Payment collected for ${customerName}`,
    });

    // 4. Update React duePayments state immediately
    setDuePayments((prev) => [savedRecord, ...prev.filter((p) => p.id !== savedRecord.id)]);
  };

  // Helper: tasks for a specific date
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter((t) => t.date === dateStr);
  };

  // Helper: customer history and metrics calculation
  const getCustomerHistory = (customerName: string) => {
    const normalizedName = customerName.toLowerCase().trim();
    const customerTasks = tasks.filter(
      (t) => t.customerName.toLowerCase().trim() === normalizedName
    );

    let totalBilled = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let lastVisit: string | undefined = undefined;

    customerTasks.forEach((t) => {
      totalBilled += Number(t.amountCharged) || 0;
      totalPaid += Number(t.amountPaid) || 0;
      totalDue += Number(t.dueAmount) || 0;
      if (!lastVisit || t.date > lastVisit) {
        lastVisit = t.date;
      }
    });

    return {
      tasks: customerTasks,
      totalBilled,
      totalPaid,
      totalDue,
      lastVisit,
    };
  };

  // Compute Today's Stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todayStats = useMemo(() => {
    const todayTasks = tasks.filter((t) => t.date === todayStr && t.status !== "cancelled");
    const revenue = todayTasks.reduce((sum, t) => sum + (Number(t.amountCharged) || 0), 0);
    const incurred = todayTasks.reduce((sum, t) => sum + (Number(t.amountIncurred) || 0), 0);
    const profit = todayTasks.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
    const dues = todayTasks.reduce((sum, t) => sum + (Number(t.dueAmount) || 0), 0);

    return {
      revenue,
      incurred,
      profit,
      dues,
      tasksCount: todayTasks.length,
    };
  }, [tasks, todayStr]);

  // Overall Stats
  const overallStats = useMemo(() => {
    const validTasks = tasks.filter((t) => t.status !== "cancelled");
    const totalRevenue = validTasks.reduce((sum, t) => sum + (Number(t.amountCharged) || 0), 0);
    const totalIncurred = validTasks.reduce((sum, t) => sum + (Number(t.amountIncurred) || 0), 0);
    const totalProfit = validTasks.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
    const totalDue = validTasks.reduce((sum, t) => sum + (Number(t.dueAmount) || 0), 0);

    // Unique customer count
    const uniqueCustomerNames = new Set(
      tasks.map((t) => t.customerName.toLowerCase().trim()).filter(Boolean)
    );
    customers.forEach((c) => uniqueCustomerNames.add(c.name.toLowerCase().trim()));

    return {
      totalRevenue,
      totalIncurred,
      totalProfit,
      totalDue,
      totalTasks: validTasks.length,
      totalCustomers: uniqueCustomerNames.size,
    };
  }, [tasks, customers]);

  return (
    <DataContext.Provider
      value={{
        tasks,
        customers,
        services,
        duePayments,
        loading,
        activeFilterCategory,
        setActiveFilterCategory,
        searchQuery,
        setSearchQuery,
        selectedDate,
        setSelectedDate,
        addTask,
        updateTask,
        deleteTask,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addService,
        updateService,
        deleteService,
        recordDuePayment,
        updateDuePayment,
        deleteDuePayment,
        settleDue,
        todayStats,
        overallStats,
        getTasksForDate,
        getCustomerHistory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
