
import React from 'react';
import { Milk, User, LogIn, Settings, History, Phone, ShieldCheck, Sun, Moon } from 'lucide-react';

export const APP_NAME = "Saanchi Dugdh Dairy";
export const HINDI = {
  OPEN: "खुला है",
  CLOSED: "बंद है",
  OPEN_MSG: "आज दूध उपलब्ध है",
  CLOSED_MSG: "दुकान अभी बंद है",
  LAST_UPDATED: "पिछला अपडेट",
  BY: "द्वारा",
  ADMIN_PANEL: "एडमिन पैनल",
  STAFF_PANEL: "स्टाफ पैनल",
  LOGIN: "लॉगिन करें",
  LOGOUT: "लॉग आउट",
  PHONE: "मोबाइल नंबर",
  PASSWORD: "पासवर्ड",
  ADD_STAFF: "स्टाफ जोड़ें",
  NAME: "नाम",
  HISTORY: "अपडेट हिस्ट्री",
  CHANGE_STATUS: "स्थिति बदलें",
  SAVE: "सुरक्षित करें",
  DELETE: "हटाएं",
  RESET: "रीसेट",
  WHATSAPP: "व्हाट्सएप करें",
  WELCOME: "स्वागत है",
  ERR_AUTH: "गलत विवरण। कृपया फिर से प्रयास करें।",
  SUCCESS: "सफलतापूर्वक अपडेट किया गया!"
};

export const ICONS = {
  Milk: <Milk className="w-6 h-6" />,
  User: <User className="w-6 h-6" />,
  LogIn: <LogIn className="w-6 h-6" />,
  Settings: <Settings className="w-6 h-6" />,
  History: <History className="w-6 h-6" />,
  Phone: <Phone className="w-6 h-6" />,
  Shield: <ShieldCheck className="w-6 h-6" />,
  Sun: <Sun className="w-6 h-6" />,
  Moon: <Moon className="w-6 h-6" />
};
