
import React, { useState, useEffect } from 'react';
// Import GoogleGenAI for the AI Assistant feature
import { GoogleGenAI } from "@google/genai";
import { StorageService } from './services/storage';
import { AppState, User, UserRole } from './types';
import { APP_NAME, HINDI, ICONS } from './constants';

// --- Custom Router Implementation (Fixes react-router-dom missing member errors) ---

const Link: React.FC<{ to: string, children: React.ReactNode, className?: string }> = ({ to, children, className }) => (
  <a href={`#${to}`} className={className}>{children}</a>
);

const Navigate: React.FC<{ to: string }> = ({ to }) => {
  useEffect(() => {
    window.location.hash = to;
  }, [to]);
  return null;
};

const useNavigate = () => {
  return (to: string) => {
    window.location.hash = to;
  };
};

const HashRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

const Route: React.FC<{ path: string, element: React.ReactNode }> = ({ element }) => <>{element}</>;

const Routes: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handleHashChange = () => setPath(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Filter and cast children to ReactElement with expected props to fix 'unknown' type errors (Lines 44, 50, 53)
  const childrenArray = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<{ path: string, element: React.ReactNode }>[];
  
  let match = childrenArray.find(child => {
    // Access 'path' property from typed props (Fixes Line 44)
    const routePath = child.props.path;
    if (routePath === '*') return false;
    return routePath === path;
  });

  if (!match) {
    // Access 'path' property from typed props (Fixes Line 50)
    match = childrenArray.find(child => child.props.path === '*');
  }

  // Access 'element' property from typed props and return as ReactElement (Fixes Line 53)
  return match ? (match.props.element as React.ReactElement) : null;
};

// --- AI Components ---

const GeminiAssistant: React.FC<{ status: AppState['status'] }> = ({ status }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAssistant = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are a helpful assistant for "Saanchi Dugdh Dairy". 
      Current status: ${status.isOpen ? 'Open' : 'Closed'}. 
      Custom Message: ${status.message}. 
      Last updated at: ${new Date(status.lastUpdated).toLocaleString('hi-IN')}.
      Answer questions concisely in Hindi or English. If the shop is closed, apologize and suggest calling.`;
      
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: { systemInstruction }
      });
      
      setResponse(result.text || 'क्षमा करें, मैं अभी जवाब नहीं दे पा रहा हूँ।');
    } catch (error) {
      console.error('Gemini API Error:', error);
      setResponse('सेवा अस्थायी रूप से अनुपलब्ध है। कृपया बाद में प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mt-10 p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-green-100 dark:border-green-900/30 transition-all duration-300">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
        ✨ AI डेयरी सहायक
      </h3>
      <div className="flex gap-2 mb-4">
        <input 
          className="flex-1 p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-green-500 text-sm transition-all" 
          placeholder="मुझसे कुछ पूछें..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && askAssistant()}
        />
        <button 
          onClick={askAssistant}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-600 disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? '...' : 'पूछें'}
        </button>
      </div>
      {response && (
        <div className="p-4 bg-green-50 dark:bg-slate-900/50 rounded-2xl text-sm leading-relaxed border border-green-100 dark:border-green-900/20 animate-in fade-in slide-in-from-top-2">
          <strong className="text-green-700 dark:text-green-400">Assistant:</strong> {response}
        </div>
      )}
    </div>
  );
};

// --- App Layout & Views ---

const Layout: React.FC<{ children: React.ReactNode, theme: 'light' | 'dark', toggleTheme: () => void }> = ({ children, theme, toggleTheme }) => (
  <div className={`${theme === 'dark' ? 'dark' : ''}`}>
    <div className="bg-dairy-gradient min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-12">
      <nav className="flex justify-between items-center px-6 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b dark:border-slate-800">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-green-600 dark:text-green-400">
          {ICONS.Milk}
          <span>{APP_NAME}</span>
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            {theme === 'light' ? ICONS.Moon : ICONS.Sun}
          </button>
          <Link to="/login" className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all shadow-md active:scale-95">
            {ICONS.LogIn} <span className="hidden sm:inline">{HINDI.LOGIN}</span>
          </Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-10">
        {children}
      </main>
      <footer className="fixed bottom-0 w-full text-center py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-sm border-t dark:border-slate-800 z-40">
        © 2024 {APP_NAME} | <span className="text-green-600 dark:text-green-400 font-semibold">शुद्धता हमारी पहचान</span>
      </footer>
    </div>
  </div>
);

const Home: React.FC<{ state: AppState }> = ({ state }) => {
  const { status } = state;
  const isOnline = navigator.onLine;

  return (
    <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {!isOnline && (
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-4 animate-pulse">
          ⚠️ इंटरनेट उपलब्ध नहीं है
        </div>
      )}
      
      <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl transition-all transform hover:scale-[1.02] ${
        status.isOpen 
          ? 'bg-white dark:bg-slate-800 border-b-8 border-green-500' 
          : 'bg-white dark:bg-slate-800 border-b-8 border-red-500'
      }`}>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center p-4 rounded-full mb-6 ${
            status.isOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {status.isOpen ? ICONS.Shield : ICONS.LogIn}
          </div>
          <h2 className={`text-5xl font-bold mb-4 ${status.isOpen ? 'text-green-600' : 'text-red-600'}`}>
            {status.isOpen ? HINDI.OPEN : HINDI.CLOSED}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-6 font-medium">
            {status.message}
          </p>
          <div className="flex flex-col gap-1 text-slate-400 text-sm border-t dark:border-slate-700 pt-6">
            <span className="flex items-center justify-center gap-1">
              {ICONS.History} {HINDI.LAST_UPDATED}: {new Date(status.lastUpdated).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>{HINDI.BY}: {status.updatedBy}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <a 
          href="https://wa.me/911234567890" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-2xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-all shadow-sm"
        >
          {ICONS.Phone} {HINDI.WHATSAPP}
        </a>
        <div className="flex items-center justify-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-4 rounded-2xl shadow-sm">
          {ICONS.Milk} ताजगी का भरोसा
        </div>
      </div>

      <GeminiAssistant status={status} />
    </div>
  );
};

const Login: React.FC<{ onLogin: (user: User) => void, users: User[] }> = ({ onLogin, users }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.phone === phone && u.password === password);
    if (user) {
      onLogin(user);
      navigate(user.role === UserRole.ADMIN ? '/admin' : '/staff');
    } else {
      setError(HINDI.ERR_AUTH);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800 dark:text-white flex items-center justify-center gap-2">
        {ICONS.Shield} {HINDI.LOGIN}
      </h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{HINDI.PHONE}</label>
          <input 
            type="tel" 
            className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-green-500" 
            value={phone} 
            onChange={e => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{HINDI.PASSWORD}</label>
          <input 
            type="password" 
            className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-green-500" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg">
          {HINDI.LOGIN}
        </button>
      </form>
    </div>
  );
};

const AdminDashboard: React.FC<{ state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>>, user: User, onLogout: () => void }> = ({ state, setState, user, onLogout }) => {
  const [newMsg, setNewMsg] = useState(state.status.message);
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPass, setStaffPass] = useState('');

  const toggleStatus = (isOpen: boolean) => {
    const defaultMsg = isOpen ? HINDI.OPEN_MSG : HINDI.CLOSED_MSG;
    const newState = StorageService.updateStatus(isOpen, defaultMsg, user.name);
    setState(newState);
    setNewMsg(defaultMsg);
  };

  const updateMessage = () => {
    const newState = StorageService.updateStatus(state.status.isOpen, newMsg, user.name);
    setState(newState);
    alert(HINDI.SUCCESS);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const newState = StorageService.addUser(staffName, staffPhone, staffPass);
    setState(newState);
    setStaffName(''); setStaffPhone(''); setStaffPass('');
  };

  const handleDeleteStaff = (id: string) => {
    if(confirm('हटाना चाहते हैं?')) {
      setState(StorageService.removeUser(id));
    }
  };

  const resetPass = (id: string) => {
    const pass = prompt('नया पासवर्ड दर्ज करें:');
    if(pass) setState(StorageService.resetPassword(id, pass));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <p className="text-sm text-slate-500">{HINDI.WELCOME}</p>
          <h1 className="text-xl font-bold">{user.name} ({HINDI.ADMIN_PANEL})</h1>
        </div>
        <button onClick={onLogout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">{HINDI.LOGOUT}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2">{ICONS.Settings} {HINDI.CHANGE_STATUS}</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleStatus(true)}
              className={`flex-1 py-4 rounded-xl font-bold transition-all shadow-md ${state.status.isOpen ? 'bg-green-500 text-white scale-105' : 'bg-slate-100 dark:bg-slate-700'}`}
            >
              {HINDI.OPEN}
            </button>
            <button 
              onClick={() => toggleStatus(false)}
              className={`flex-1 py-4 rounded-xl font-bold transition-all shadow-md ${!state.status.isOpen ? 'bg-red-500 text-white scale-105' : 'bg-slate-100 dark:bg-slate-700'}`}
            >
              {HINDI.CLOSED}
            </button>
          </div>
          <div>
            <label className="block text-sm mb-1">वेलकम मैसेज</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 p-2 border rounded-lg dark:bg-slate-700" 
                value={newMsg} 
                onChange={e => setNewMsg(e.target.value)} 
              />
              <button onClick={updateMessage} className="bg-blue-500 text-white px-4 rounded-lg">{HINDI.SAVE}</button>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2">{ICONS.User} {HINDI.ADD_STAFF}</h2>
          <form onSubmit={handleAddStaff} className="space-y-2">
            <input placeholder={HINDI.NAME} className="w-full p-2 border rounded-lg dark:bg-slate-700" value={staffName} onChange={e => setStaffName(e.target.value)} required />
            <input placeholder={HINDI.PHONE} className="w-full p-2 border rounded-lg dark:bg-slate-700" value={staffPhone} onChange={e => setStaffPhone(e.target.value)} required />
            <input placeholder={HINDI.PASSWORD} type="password" className="w-full p-2 border rounded-lg dark:bg-slate-700" value={staffPass} onChange={e => setStaffPass(e.target.value)} required />
            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded-lg font-bold">शामिल करें</button>
          </form>
          <div className="max-h-40 overflow-y-auto space-y-2 mt-4">
            {state.users.filter(u => u.role === UserRole.STAFF).map(s => (
              <div key={s.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-sm font-medium">{s.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => resetPass(s.id)} className="text-blue-500 text-xs p-1">Pass</button>
                  <button onClick={() => handleDeleteStaff(s.id)} className="text-red-500 text-xs p-1">{HINDI.DELETE}</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm space-y-4 md:col-span-2">
          <h2 className="font-bold text-lg flex items-center gap-2">{ICONS.History} {HINDI.HISTORY}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-sm">
                  <th className="pb-2">स्थिति</th>
                  <th className="pb-2">समय</th>
                  <th className="pb-2">द्वारा</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-700">
                {state.history.map(log => (
                  <tr key={log.id} className="text-sm">
                    <td className={`py-2 font-bold ${log.status ? 'text-green-500' : 'text-red-500'}`}>{log.status ? 'खुला' : 'बंद'}</td>
                    <td className="py-2 text-slate-500">{new Date(log.timestamp).toLocaleString('hi-IN')}</td>
                    <td className="py-2">{log.updatedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

const StaffDashboard: React.FC<{ state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>>, user: User, onLogout: () => void }> = ({ state, setState, user, onLogout }) => {
  const toggleStatus = (isOpen: boolean) => {
    const defaultMsg = isOpen ? HINDI.OPEN_MSG : HINDI.CLOSED_MSG;
    const newState = StorageService.updateStatus(isOpen, defaultMsg, user.name);
    setState(newState);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <p className="text-sm text-slate-500">{HINDI.WELCOME}</p>
          <h1 className="text-xl font-bold">{user.name} ({HINDI.STAFF_PANEL})</h1>
        </div>
        <button onClick={onLogout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">{HINDI.LOGOUT}</button>
      </div>

      <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
        <h2 className="font-bold text-2xl text-center">{HINDI.CHANGE_STATUS}</h2>
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => toggleStatus(true)}
            className={`py-8 rounded-2xl text-2xl font-bold transition-all shadow-lg ${state.status.isOpen ? 'bg-green-500 text-white scale-[1.02]' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
          >
            {HINDI.OPEN}
          </button>
          <button 
            onClick={() => toggleStatus(false)}
            className={`py-8 rounded-2xl text-2xl font-bold transition-all shadow-lg ${!state.status.isOpen ? 'bg-red-500 text-white scale-[1.02]' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
          >
            {HINDI.CLOSED}
          </button>
        </div>
      </section>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(StorageService.getState());
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    StorageService.saveState(state);
  }, [state]);

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const handleLogout = () => setCurrentUser(null);

  return (
    <HashRouter>
      <Layout theme={state.theme} toggleTheme={toggleTheme}>
        <Routes>
          <Route path="/" element={<Home state={state} />} />
          <Route path="/login" element={
            currentUser ? (
              <Navigate to={currentUser.role === UserRole.ADMIN ? "/admin" : "/staff"} />
            ) : (
              <Login onLogin={setCurrentUser} users={state.users} />
            )
          } />
          <Route path="/admin" element={
            currentUser?.role === UserRole.ADMIN 
              ? <AdminDashboard state={state} setState={setState} user={currentUser} onLogout={handleLogout} /> 
              : <Navigate to="/login" />
          } />
          <Route path="/staff" element={
            currentUser?.role === UserRole.STAFF 
              ? <StaffDashboard state={state} setState={setState} user={currentUser} onLogout={handleLogout} /> 
              : <Navigate to="/login" />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
