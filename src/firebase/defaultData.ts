import { ServiceMasterItem } from "../types";

// User will add their own master items as per their requirements
export const DEFAULT_SERVICE_MASTERS: Omit<ServiceMasterItem, "userId">[] = [];
