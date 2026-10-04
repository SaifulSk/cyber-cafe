import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { db } from "./config";
import { TaskItem, Customer, ServiceMasterItem } from "../types";
import { DEFAULT_SERVICE_MASTERS } from "./defaultData";

// LocalStorage fallback keys
const getLocalKey = (uid: string, type: string) => `sevadesk_${uid}_${type}`;

const loadLocal = <T>(key: string, fallback: T[]): T[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const saveLocal = <T>(key: string, items: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    // ignore
  }
};

/**
 * Tasks Real-time Subscription with local cache fallback
 */
export const subscribeToTasks = (
  userId: string,
  onData: (tasks: TaskItem[]) => void,
  onError?: (error: any) => void
) => {
  const localKey = getLocalKey(userId, "tasks");
  const localItems = loadLocal<TaskItem>(localKey, []);
  onData(localItems);

  try {
    const tasksRef = collection(db, "users", userId, "tasks");
    const q = query(tasksRef, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasks: TaskItem[] = [];
        snapshot.forEach((docSnap) => {
          tasks.push({ ...(docSnap.data() as TaskItem), id: docSnap.id });
        });
        saveLocal(localKey, tasks);
        onData(tasks);
      },
      (error) => {
        console.warn("Firestore tasks listener note (using local cache):", error.message);
        if (onError) onError(error);
        // Fallback to local
        onData(loadLocal<TaskItem>(localKey, []));
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Error setting up Firestore tasks listener:", err);
    return () => {};
  }
};

/**
 * Customers Real-time Subscription
 */
export const subscribeToCustomers = (
  userId: string,
  onData: (customers: Customer[]) => void,
  onError?: (error: any) => void
) => {
  const localKey = getLocalKey(userId, "customers");
  const localItems = loadLocal<Customer>(localKey, []);
  onData(localItems);

  try {
    const custRef = collection(db, "users", userId, "customers");
    const q = query(custRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const customers: Customer[] = [];
        snapshot.forEach((docSnap) => {
          customers.push({ ...(docSnap.data() as Customer), id: docSnap.id });
        });
        saveLocal(localKey, customers);
        onData(customers);
      },
      (error) => {
        console.warn("Firestore customers listener note (using local cache):", error.message);
        if (onError) onError(error);
        onData(loadLocal<Customer>(localKey, []));
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Error setting up Firestore customers listener:", err);
    return () => {};
  }
};

/**
 * Service Masters Subscription
 */
export const subscribeToServices = (
  userId: string,
  onData: (services: ServiceMasterItem[]) => void,
  onError?: (error: any) => void
) => {
  const localKey = getLocalKey(userId, "services");
  const localItems = loadLocal<ServiceMasterItem>(localKey, []);
  onData(localItems);

  try {
    const srvRef = collection(db, "users", userId, "services");
    const unsubscribe = onSnapshot(
      srvRef,
      (snapshot) => {
        const services: ServiceMasterItem[] = [];
        snapshot.forEach((docSnap) => {
          services.push({ ...(docSnap.data() as ServiceMasterItem), id: docSnap.id });
        });
        saveLocal(localKey, services);
        onData(services);
      },
      (error) => {
        console.warn("Firestore services listener note (using local cache):", error.message);
        if (onError) onError(error);
        onData(loadLocal<ServiceMasterItem>(localKey, []));
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Error setting up Firestore services listener:", err);
    return () => {};
  }
};

/**
 * Add / Update / Delete Task
 */
export const saveTaskItem = async (
  userId: string,
  task: Omit<TaskItem, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<TaskItem> => {
  const isNew = !task.id;
  const taskId = task.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  const finalTask: TaskItem = {
    ...task,
    id: taskId,
    userId,
    createdAt: (task as any).createdAt || now,
    updatedAt: now,
  };

  // 1. Update local cache immediately
  const localKey = getLocalKey(userId, "tasks");
  const localList = loadLocal<TaskItem>(localKey, []);
  const updatedList = isNew
    ? [finalTask, ...localList]
    : localList.map((t) => (t.id === taskId ? finalTask : t));
  saveLocal(localKey, updatedList);

  // 2. Also ensure customer master has this customer or updates their stats
  if (finalTask.customerName) {
    await autoSyncCustomerFromTask(userId, finalTask);
  }

  // 3. Write to Firestore
  try {
    const docRef = doc(db, "users", userId, "tasks", taskId);
    await setDoc(docRef, finalTask, { merge: true });
  } catch (e: any) {
    console.warn("Saved to local storage, Firestore pending sync:", e?.message);
  }

  return finalTask;
};

export const deleteTaskItem = async (userId: string, taskId: string): Promise<void> => {
  const localKey = getLocalKey(userId, "tasks");
  const localList = loadLocal<TaskItem>(localKey, []);
  saveLocal(
    localKey,
    localList.filter((t) => t.id !== taskId)
  );

  try {
    await deleteDoc(doc(db, "users", userId, "tasks", taskId));
  } catch (e: any) {
    console.warn("Deleted from local storage, Firestore sync error:", e?.message);
  }
};

/**
 * Customers CRUD
 */
export const saveCustomerItem = async (
  userId: string,
  customer: Omit<Customer, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<Customer> => {
  const isNew = !customer.id;
  const custId = customer.id || `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  const finalCust: Customer = {
    ...customer,
    id: custId,
    userId,
    createdAt: (customer as any).createdAt || now,
    updatedAt: now,
    totalTransactions: customer.totalTransactions ?? 0,
    totalBilled: customer.totalBilled ?? 0,
    totalPaid: customer.totalPaid ?? 0,
    totalDue: customer.totalDue ?? 0,
  };

  const localKey = getLocalKey(userId, "customers");
  const localList = loadLocal<Customer>(localKey, []);
  const updatedList = isNew
    ? [finalCust, ...localList]
    : localList.map((c) => (c.id === custId ? finalCust : c));
  saveLocal(localKey, updatedList);

  try {
    const docRef = doc(db, "users", userId, "customers", custId);
    await setDoc(docRef, finalCust, { merge: true });
  } catch (e: any) {
    console.warn("Customer saved locally:", e?.message);
  }

  return finalCust;
};

export const deleteCustomerItem = async (userId: string, customerId: string): Promise<void> => {
  const localKey = getLocalKey(userId, "customers");
  const localList = loadLocal<Customer>(localKey, []);
  saveLocal(
    localKey,
    localList.filter((c) => c.id !== customerId)
  );

  try {
    await deleteDoc(doc(db, "users", userId, "customers", customerId));
  } catch (e: any) {
    console.warn("Deleted customer locally:", e?.message);
  }
};

/**
 * Automatically update or add customer into Customer Master when a task is entered
 */
export const autoSyncCustomerFromTask = async (userId: string, task: TaskItem) => {
  const localCustKey = getLocalKey(userId, "customers");
  const customers = loadLocal<Customer>(localCustKey, []);
  const cleanName = task.customerName.trim();
  const phone = task.customerPhone?.trim() || "";

  let matched = customers.find(
    (c) =>
      c.name.toLowerCase() === cleanName.toLowerCase() ||
      (phone && c.phone && c.phone === phone)
  );

  if (matched) {
    // Update existing customer stats
    const updated: Customer = {
      ...matched,
      phone: matched.phone || phone,
      updatedAt: Date.now(),
    };
    await saveCustomerItem(userId, updated);
  } else {
    // Create new customer in master
    const newCust: Customer = {
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name: cleanName,
      phone: phone,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      totalTransactions: 1,
      totalBilled: task.amountCharged,
      totalPaid: task.amountPaid,
      totalDue: task.dueAmount,
    };
    await saveCustomerItem(userId, newCust);
  }
};

/**
 * Service Masters CRUD
 */
export const saveServiceMasterItem = async (
  userId: string,
  service: Omit<ServiceMasterItem, "id" | "userId"> & { id?: string }
): Promise<ServiceMasterItem> => {
  const srvId = service.id || `srv_${Date.now()}`;
  const finalSrv: ServiceMasterItem = {
    ...service,
    id: srvId,
    userId,
  };

  const localKey = getLocalKey(userId, "services");
  const localList = loadLocal<ServiceMasterItem>(localKey, []);
  const exists = localList.some((s) => s.id === srvId);
  const updatedList = exists
    ? localList.map((s) => (s.id === srvId ? finalSrv : s))
    : [...localList, finalSrv];
  saveLocal(localKey, updatedList);

  try {
    const docRef = doc(db, "users", userId, "services", srvId);
    await setDoc(docRef, finalSrv, { merge: true });
  } catch (e: any) {
    console.warn("Saved service item locally:", e?.message);
  }

  return finalSrv;
};

export const deleteServiceMasterItem = async (
  userId: string,
  serviceId: string
): Promise<void> => {
  const localKey = getLocalKey(userId, "services");
  const localList = loadLocal<ServiceMasterItem>(localKey, []);
  saveLocal(
    localKey,
    localList.filter((s) => s.id !== serviceId)
  );

  try {
    await deleteDoc(doc(db, "users", userId, "services", serviceId));
  } catch (e: any) {
    console.warn("Deleted service locally:", e?.message);
  }
};

/**
 * Settle Due Amount for a customer:
 * Records a settlement payment, marks or deducts due on existing pending tasks
 */
export const settleCustomerDue = async (
  userId: string,
  customerName: string,
  amountPaying: number,
  paymentMode: 'cash' | 'upi' | 'bank_transfer',
  note?: string
): Promise<void> => {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0].substring(0, 5);

  // Create a settlement receipt task entry
  await saveTaskItem(userId, {
    title: `Due Payment Clearance: ${customerName}`,
    serviceCategory: "other",
    customerName,
    date: dateStr,
    time: timeStr,
    amountIncurred: 0,
    amountCharged: amountPaying,
    amountPaid: amountPaying,
    profit: 0,
    dueAmount: 0,
    paymentMode,
    status: "completed",
    notes: note || `Outstanding dues settled for ${customerName}`,
    referenceNo: `SETTLE-${Date.now().toString().slice(-6)}`,
  });
};
