
import { AppState, User, UserRole, ShopStatus, HistoryLog } from '../types';

const STORAGE_KEY = 'saanchi_dairy_state';

const defaultState: AppState = {
  status: {
    isOpen: true,
    message: "आज दूध उपलब्ध है",
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  users: [
    {
      id: 'admin-1',
      name: 'Owner',
      phone: '1234567890',
      password: 'admin',
      role: UserRole.ADMIN
    }
  ],
  history: [],
  theme: 'light'
};

export const StorageService = {
  getState: (): AppState => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : defaultState;
  },

  saveState: (state: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  updateStatus: (isOpen: boolean, message: string, updatedBy: string) => {
    const state = StorageService.getState();
    const newStatus: ShopStatus = {
      isOpen,
      message,
      lastUpdated: new Date().toISOString(),
      updatedBy
    };
    
    const newLog: HistoryLog = {
      id: Math.random().toString(36).substr(2, 9),
      status: isOpen,
      updatedBy,
      timestamp: new Date().toISOString()
    };

    const newState = {
      ...state,
      status: newStatus,
      history: [newLog, ...state.history].slice(0, 50)
    };
    StorageService.saveState(newState);
    return newState;
  },

  addUser: (name: string, phone: string, password: string): AppState => {
    const state = StorageService.getState();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      phone,
      password,
      role: UserRole.STAFF
    };
    const newState = { ...state, users: [...state.users, newUser] };
    StorageService.saveState(newState);
    return newState;
  },

  removeUser: (userId: string): AppState => {
    const state = StorageService.getState();
    const newState = { ...state, users: state.users.filter(u => u.id !== userId) };
    StorageService.saveState(newState);
    return newState;
  },

  resetPassword: (userId: string, newPass: string): AppState => {
    const state = StorageService.getState();
    const newState = {
      ...state,
      users: state.users.map(u => u.id === userId ? { ...u, password: newPass } : u)
    };
    StorageService.saveState(newState);
    return newState;
  }
};
