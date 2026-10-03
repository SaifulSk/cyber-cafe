import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { TaskItem, Customer, ServiceMasterItem, ServiceCategory } from "../types";
import { useAuth } from "./AuthContext";
import {
  subscribeToTasks,
  subscribeToCustomers,
  subscribeToServices,
  saveTaskItem,
  deleteTaskItem,
  saveCustomerItem,
  deleteCustomerItem,
  saveServiceMasterItem,
  deleteServiceMasterItem,
  settleCustomerDue,
} from "../firebase/db";
import { DEFAULT_SERVICE_MASTERS } from "../firebase/defaultData";

interface DataContextType {
  tasks: TaskItem[];
  customers: Customer[];
  services: ServiceMasterItem[];
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
  settleDue: (customerName: string, amount: number, mode: 'cash' | 'upi' | 'bank_transfer', note?: string) => Promise<void>;
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
  const { currentUser, isDemoUser, userProfile } = useAuth();
  const activeUid = currentUser?.uid || (isDemoUser ? "demo_csc_operator" : "guest_operator");

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServiceMasterItem[]>([]);
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

    return () => {
      unsubTasks();
      unsubCust();
      unsubSrv();
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

  const settleDue = async (
    customerName: string,
    amount: number,
    mode: 'cash' | 'upi' | 'bank_transfer',
    note?: string
  ) => {
    await settleCustomerDue(activeUid, customerName, amount, mode, note);
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
        services: services.length > 0 ? services : (DEFAULT_SERVICE_MASTERS as any),
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
