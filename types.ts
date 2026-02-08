
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface ShopStatus {
  isOpen: boolean;
  message: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface HistoryLog {
  id: string;
  status: boolean;
  updatedBy: string;
  timestamp: string;
}

export interface AppState {
  status: ShopStatus;
  users: User[];
  history: HistoryLog[];
  theme: 'light' | 'dark';
}
