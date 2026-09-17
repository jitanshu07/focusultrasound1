import React, { useEffect, useState } from 'react';
import { LogOut, Activity, User as UserIcon, LogIn, Calendar, Phone, Activity as TestIcon, Info, CreditCard, Bell, AlertCircle, CheckCircle2, Search, X, Printer, FileText, Edit3, Trash2, Smartphone, Send, Check, AlertTriangle, Tag, UserPlus, Shield, Lock, Eye, EyeOff, Users, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppointmentsAnalytics from '../components/AppointmentsAnalytics';
import ThemeToggle from '../components/ThemeToggle';
import { Appointment, getServicePrice, AdminAccount, MAX_ADMIN_LIMIT } from '../types';

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState<{name: string, email: string; username?: string; role?: string} | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentication & Registration state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [registeredAdmins, setRegisteredAdmins] = useState<AdminAccount[]>([]);
  const [showAdminManagementModal, setShowAdminManagementModal] = useState(false);

  // Login credentials inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');

  // Register credentials inputs
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [printingAppointment, setPrintingAppointment] = useState<Appointment | null>(null);
  const [editingNoteAppt, setEditingNoteAppt] = useState<Appointment | null>(null);
  const [noteInputText, setNoteInputText] = useState('');

  // Alert Notification Broadcast states
  const [noticeText, setNoticeText] = useState('');
  const [noticeType, setNoticeType] = useState<'emergency' | 'closure' | 'general'>('closure');
  const [activeNotice, setActiveNotice] = useState<{
    message: string;
    type: 'emergency' | 'closure' | 'general';
    publishedAt: string;
  } | null>(null);
  const [noticeSuccessMsg, setNoticeSuccessMsg] = useState('');

  // Mock SMS Notification states
  const [sendingSmsId, setSendingSmsId] = useState<string | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [showBulkSmsModal, setShowBulkSmsModal] = useState(false);
  const [smsConfirmation, setSmsConfirmation] = useState<{
    id?: string;
    type: 'single' | 'bulk';
    patientName?: string;
    phone?: string;
    test?: string;
    date?: string;
    count?: number;
    messageText: string;
    timestamp: string;
  } | null>(null);
  const [viewingSmsDetails, setViewingSmsDetails] = useState<{
    patientName: string;
    phone: string;
    test: string;
    date: string;
    messageText: string;
    timestamp: string;
  } | null>(null);

  // Fallback credentials if no admins are registered yet
  const FIXED_ADMIN = {
    username: 'admin',
    email: 'admin@focusimagine.com',
    password: 'admin123',
    displayName: 'Administrator'
  };

  const loadRegisteredAdmins = () => {
    try {
      const stored = localStorage.getItem('focus_registered_admins');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRegisteredAdmins(parsed);
          return parsed;
        }
      }
      setRegisteredAdmins([]);
      return [];
    } catch {
      setRegisteredAdmins([]);
      return [];
    }
  };

  useEffect(() => {
    loadRegisteredAdmins();
    const storedSession = localStorage.getItem('focus_admin_session');
    if (storedSession) {
      setAdminUser(JSON.parse(storedSession));
    }
    setLoading(false);

    const handleAdminsChange = () => {
      loadRegisteredAdmins();
    };

    window.addEventListener('storage', handleAdminsChange);
    window.addEventListener('focus_admins_updated', handleAdminsChange);
    return () => {
      window.removeEventListener('storage', handleAdminsChange);
      window.removeEventListener('focus_admins_updated', handleAdminsChange);
    };
  }, []);

  useEffect(() => {
    if (!adminUser) {
      setAppointments([]);
      return;
    }

    const loadAppointments = () => {
      const appts = JSON.parse(localStorage.getItem('focus_appointments') || '[]');
      setAppointments(appts);
    };

    loadAppointments();
    
    // Poll for updates to simulate real-time updates without Firebase
    const interval = setInterval(loadAppointments, 2000);
    return () => clearInterval(interval);
  }, [adminUser]);

  // Alert notification loader and listener
  useEffect(() => {
    const loadNotice = () => {
      try {
        const stored = localStorage.getItem('focus_public_alert');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.message && parsed.message.trim()) {
            setActiveNotice(parsed);
            return;
          }
        }
        setActiveNotice(null);
      } catch (e) {
        setActiveNotice(null);
      }
    };

    loadNotice();
    window.addEventListener('storage', loadNotice);
    window.addEventListener('focus_alert_updated', loadNotice);
    return () => {
      window.removeEventListener('storage', loadNotice);
      window.removeEventListener('focus_alert_updated', loadNotice);
    };
  }, []);

  const handlePublishAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeText.trim()) return;

    const alertData = {
      message: noticeText.trim(),
      type: noticeType,
      publishedAt: new Date().toISOString()
    };

    localStorage.setItem('focus_public_alert', JSON.stringify(alertData));
    setActiveNotice(alertData);
    setNoticeText('');
    setNoticeSuccessMsg('Alert published successfully! It is now live on the public website.');
    window.dispatchEvent(new Event('focus_alert_updated'));
    setTimeout(() => setNoticeSuccessMsg(''), 4000);
  };

  const handleClearAlert = () => {
    localStorage.removeItem('focus_public_alert');
    setActiveNotice(null);
    setNoticeSuccessMsg('Active alert removed from the public website.');
    window.dispatchEvent(new Event('focus_alert_updated'));
    setTimeout(() => setNoticeSuccessMsg(''), 4000);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccessMsg('');
    
    const inputUser = username.trim().toLowerCase();
    const currentAdmins: AdminAccount[] = JSON.parse(localStorage.getItem('focus_registered_admins') || '[]');
    
    // Check against registered accounts in LocalStorage
    const matched = currentAdmins.find(
      (a) => (a.username.toLowerCase() === inputUser || a.email.toLowerCase() === inputUser) && a.password === password
    );

    if (matched) {
      const sessionData = { 
        name: matched.displayName || matched.username, 
        email: matched.email,
        username: matched.username,
        role: matched.role || 'Administrator'
      };
      localStorage.setItem('focus_admin_session', JSON.stringify(sessionData));
      setAdminUser(sessionData);
      return;
    }

    // Fallback for initial system admin if no registered admins exist yet
    if (
      currentAdmins.length === 0 &&
      (inputUser === FIXED_ADMIN.username || inputUser === FIXED_ADMIN.email) &&
      password === FIXED_ADMIN.password
    ) {
      const sessionData = { 
        name: FIXED_ADMIN.displayName, 
        email: FIXED_ADMIN.email,
        username: FIXED_ADMIN.username,
        role: 'Administrator'
      };
      localStorage.setItem('focus_admin_session', JSON.stringify(sessionData));
      setAdminUser(sessionData);
      return;
    }

    setLoginError('Invalid username or password. Please verify your credentials.');
  };

  const handleRegisterAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const currentAdmins: AdminAccount[] = JSON.parse(localStorage.getItem('focus_registered_admins') || '[]');
    
    // Strict enforcement of maximum 2 admin accounts limit
    if (currentAdmins.length >= MAX_ADMIN_LIMIT) {
      setRegError(`Maximum admin limit (${MAX_ADMIN_LIMIT}) reached. No further admin registrations are allowed.`);
      return;
    }

    const cleanFullName = regFullName.trim();
    const cleanUsername = regUsername.trim().toLowerCase();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanFullName || cleanFullName.length < 2) {
      setRegError('Please enter a valid full name (minimum 2 characters).');
      return;
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      setRegError('Username must be at least 3 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      setRegError('Username can only contain letters, numbers, hyphens, and underscores.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setRegError('Please enter a valid email address.');
      return;
    }

    // Check username uniqueness
    if (currentAdmins.some((a) => a.username.toLowerCase() === cleanUsername)) {
      setRegError(`The username "${cleanUsername}" is already taken. Please choose another.`);
      return;
    }

    // Check email uniqueness
    if (currentAdmins.some((a) => a.email.toLowerCase() === cleanEmail)) {
      setRegError(`The email "${cleanEmail}" is already registered. Please choose another.`);
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter.');
      return;
    }

    const newAdmin: AdminAccount = {
      id: 'admin_' + Date.now(),
      displayName: cleanFullName,
      username: cleanUsername,
      email: cleanEmail,
      password: regPassword,
      createdAt: new Date().toISOString(),
      role: currentAdmins.length === 0 ? 'Lead Administrator' : 'Secondary Administrator'
    };

    const updatedAdmins = [...currentAdmins, newAdmin];
    localStorage.setItem('focus_registered_admins', JSON.stringify(updatedAdmins));
    setRegisteredAdmins(updatedAdmins);
    window.dispatchEvent(new Event('focus_admins_updated'));

    // Clear registration fields
    setRegFullName('');
    setRegUsername('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');

    // Pre-fill login credentials for seamless, smooth login
    setUsername(newAdmin.username);
    setPassword(newAdmin.password);
    setLoginError('');
    setLoginSuccessMsg(`Admin account "${newAdmin.displayName}" registered successfully! You can now log in.`);
    setAuthMode('login');
  };

  const handleDeleteRegisteredAdmin = (adminId: string) => {
    const currentAdmins: AdminAccount[] = JSON.parse(localStorage.getItem('focus_registered_admins') || '[]');
    const target = currentAdmins.find(a => a.id === adminId);
    if (!target) return;

    if (!confirm(`Are you sure you want to remove administrator "${target.displayName}" (@${target.username})? A registration slot will become available.`)) {
      return;
    }

    const updated = currentAdmins.filter(a => a.id !== adminId);
    localStorage.setItem('focus_registered_admins', JSON.stringify(updated));
    setRegisteredAdmins(updated);
    window.dispatchEvent(new Event('focus_admins_updated'));

    // If current logged-in user removed their own account
    if (adminUser && (adminUser.email === target.email || adminUser.username === target.username)) {
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('focus_admin_session');
    setAdminUser(null);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const appts = JSON.parse(localStorage.getItem('focus_appointments') || '[]');
    const updatedAppts = appts.map((appt: any) => 
      appt.id === id ? { ...appt, status: newStatus } : appt
    );
    localStorage.setItem('focus_appointments', JSON.stringify(updatedAppts));
    setAppointments(updatedAppts);
  };

  const openNoteModal = (appt: Appointment) => {
    setEditingNoteAppt(appt);
    setNoteInputText(appt.notes || '');
  };

  const handleSaveNote = (id: string, notes: string) => {
    const appts = JSON.parse(localStorage.getItem('focus_appointments') || '[]');
    const updatedAppts = appts.map((appt: any) => 
      appt.id === id ? { ...appt, notes: notes.trim() } : appt
    );
    localStorage.setItem('focus_appointments', JSON.stringify(updatedAppts));
    setAppointments(updatedAppts);
    setEditingNoteAppt(null);
  };

  const handleDeleteNote = (id: string) => {
    const appts = JSON.parse(localStorage.getItem('focus_appointments') || '[]');
    const updatedAppts = appts.map((appt: any) => 
      appt.id === id ? { ...appt, notes: '' } : appt
    );
    localStorage.setItem('focus_appointments', JSON.stringify(updatedAppts));
    setAppointments(updatedAppts);
    setEditingNoteAppt(null);
  };

  // Mock SMS Notification Triggers
  const handleTriggerSms = (appt: Appointment) => {
    setSendingSmsId(appt.id);
    const message = `Reminder: Hello ${appt.patientName}, your appointment for ${appt.test} at Focus Imaging & Diagnosis Centre is on ${appt.date}. Please arrive 15 minutes early with past medical records. Helpline: +91 98765 43210.`;

    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString();
      const timestamp = `${dateStr} ${timeStr}`;

      const appts = JSON.parse(localStorage.getItem('focus_appointments') || '[]');
      const updatedAppts = appts.map((item: any) => 
        item.id === appt.id ? { ...item, lastSmsSentAt: timestamp } : item
      );
      localStorage.setItem('focus_appointments', JSON.stringify(updatedAppts));
      setAppointments(updatedAppts);
      setSendingSmsId(null);

      setSmsConfirmation({
        id: appt.id,
        type: 'single',
        patientName: appt.patientName,
        phone: appt.phone,
        test: appt.test,
        date: appt.date,
        messageText: message,
        timestamp: timeStr
      });
    }, 600);
  };

  const handleTriggerBulkSms = () => {
    setIsBulkSending(true);
    const activeAppts = appointments.filter((a) => a.status !== 'Cancelled');
    const count = activeAppts.length;

    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString();
      const timestamp = `${dateStr} ${timeStr}`;

      const appts = JSON.parse(localStorage.getItem('focus_appointments') || '[]');
      const updatedAppts = appts.map((item: any) => {
        if (activeAppts.some((a) => a.id === item.id)) {
          return { ...item, lastSmsSentAt: timestamp };
        }
        return item;
      });
      localStorage.setItem('focus_appointments', JSON.stringify(updatedAppts));
      setAppointments(updatedAppts);
      setIsBulkSending(false);
      setShowBulkSmsModal(false);

      setSmsConfirmation({
        type: 'bulk',
        count,
        messageText: `Appointment reminder notifications simulated & dispatched to ${count} active patient numbers with test prep and timing instructions.`,
        timestamp: timeStr
      });
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <div className="animate-spin text-blue-600 dark:text-blue-400"><Activity size={48} /></div>
      </div>
    );
  }

  if (!adminUser) {
    const isLimitReached = registeredAdmins.length >= MAX_ADMIN_LIMIT;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative transition-colors duration-200">
        <div className="fixed inset-0 mesh-bg -z-10"></div>
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeToggle />
        </div>

        <div className="glass p-6 sm:p-9 rounded-3xl w-full max-w-lg text-center shadow-xl border border-white/60 dark:border-slate-800 transition-all">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md shadow-blue-200 dark:shadow-none">
            <Shield size={32} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1.5">Admin Portal</h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mb-5">
            {authMode === 'login'
              ? 'Sign in with your authorized administrator credentials.'
              : 'Register an authorized administrator account (Strict limit: 2).'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-900 p-1.5 mb-5 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError('');
                setRegError('');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              disabled={isLimitReached}
              onClick={() => {
                if (!isLimitReached) {
                  setAuthMode('register');
                  setLoginError('');
                  setRegError('');
                  setLoginSuccessMsg('');
                }
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                isLimitReached
                  ? 'opacity-60 cursor-not-allowed text-slate-400 dark:text-slate-500 bg-transparent'
                  : authMode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs cursor-pointer'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer'
              }`}
              title={isLimitReached ? `Maximum admin limit (${MAX_ADMIN_LIMIT}) reached` : 'Register new admin account'}
            >
              {isLimitReached ? <Lock size={14} className="text-amber-500 shrink-0" /> : <UserPlus size={15} className="shrink-0" />}
              <span>Register Admin</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  isLimitReached
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                }`}
              >
                {registeredAdmins.length}/{MAX_ADMIN_LIMIT}
              </span>
            </button>
          </div>

          {/* SIGN IN VIEW */}
          {authMode === 'login' && (
            <div>
              {/* Registration Status Pill */}
              {isLimitReached ? (
                <div className="mb-4 p-3 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 rounded-2xl text-left text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2.5">
                  <Shield size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold">Maximum admin limit ({MAX_ADMIN_LIMIT}) reached.</span>
                    <span className="block text-[11px] text-amber-700 dark:text-amber-400">All administrator slots are registered. Registration is closed.</span>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-2.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl text-left text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Admin Accounts: <strong className="text-slate-900 dark:text-white font-bold">{registeredAdmins.length} of {MAX_ADMIN_LIMIT}</strong> active</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setLoginError('');
                      setLoginSuccessMsg('');
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold text-xs hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Register</span> &rarr;
                  </button>
                </div>
              )}

              {/* Login Success Notification (e.g. redirected after registration) */}
              {loginSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl mb-4 font-medium text-left flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{loginSuccessMsg}</span>
                </div>
              )}

              {/* Login Error Notification */}
              {loginError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl mb-4 font-medium text-left flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <UserIcon size={13} />
                    <span>Username or Email</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="Enter registered username or email"
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-1.5 text-left pb-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Lock size={13} />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-blue-200 dark:shadow-none transition-all cursor-pointer text-sm"
                >
                  <LogIn size={18} />
                  <span>Secure Sign In</span>
                </button>
              </form>
            </div>
          )}

          {/* REGISTER VIEW */}
          {authMode === 'register' && (
            <div>
              {isLimitReached ? (
                <div className="p-6 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center mx-auto shadow-xs">
                    <Lock size={22} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Maximum admin limit (2) reached</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                    The medical diagnostic system strictly enforces a maximum of 2 administrator accounts. Both slots are currently registered. New registrations are closed.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shadow-md shadow-blue-200 dark:shadow-none"
                    >
                      <LogIn size={15} /> Back to Sign In
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-2.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl text-left text-xs text-blue-900 dark:text-blue-300 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Shield size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>Registering Admin <strong>{registeredAdmins.length + 1}</strong> of <strong>{MAX_ADMIN_LIMIT}</strong></span>
                    </div>
                    <span className="text-[11px] font-mono bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full font-bold">
                      {MAX_ADMIN_LIMIT - registeredAdmins.length} slot left
                    </span>
                  </div>

                  {regError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl mb-4 font-medium text-left flex items-start gap-2">
                      <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterAdmin} className="space-y-3.5 text-left">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        Full Name / Title
                      </label>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                        placeholder="e.g. Dr. Priya Sharma"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                          Username
                        </label>
                        <input
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                          placeholder="e.g. psharma"
                          autoComplete="username"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                          Official Email
                        </label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                          placeholder="priya@focusimaging.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 pr-9 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                            placeholder="Min. 6 chars"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                          >
                            {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                          Confirm Password
                        </label>
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                          placeholder="Re-enter password"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none transition-all cursor-pointer text-sm"
                    >
                      <UserPlus size={18} />
                      <span>Register Admin Account</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col items-center gap-3">
            <Link to="/" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              &larr; Back to Public Diagnostic Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;

  const filteredAppointments = appointments.filter((appt) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameMatch = appt.patientName ? appt.patientName.toLowerCase().includes(query) : false;
    const phoneMatch = appt.phone ? appt.phone.toLowerCase().includes(query) : false;
    const noteMatch = appt.notes ? appt.notes.toLowerCase().includes(query) : false;
    return nameMatch || phoneMatch || noteMatch;
  });

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      <div className="fixed inset-0 mesh-bg -z-10"></div>
      
      {/* Top Navbar */}
      <header className="min-h-16 py-2.5 px-3 sm:px-6 glass shadow-sm flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sticky top-0 z-50 border-b border-white/60 dark:border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-sm">
            F
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
            {pendingCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{pendingCount} Pending</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400" />
                <span>All Checked</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white/60 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-all flex items-center gap-1"
          >
            <span>Public Site</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowAdminManagementModal(true)}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white/60 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Manage Registered Administrator Accounts"
          >
            <Shield size={13} className="text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Admins</span>
            <span className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] font-bold ${
              registeredAdmins.length >= MAX_ADMIN_LIMIT
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
            }`}>
              {registeredAdmins.length}/{MAX_ADMIN_LIMIT}
            </span>
          </button>

          {/* Theme Mode Toggle Button */}
          <ThemeToggle />

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
              {adminUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{adminUser.name}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-tight">{adminUser.role || 'Administrator'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 px-2 sm:px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              title="Sign out of admin session"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Appointments Overview</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-xs sm:text-sm">Manage and view all incoming diagnostic requests and patient records.</p>
          </div>
        </div>

        {/* Responsive KPI Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="glass p-3.5 sm:p-5 rounded-2xl border border-white/60 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">Total Requests</span>
              <span className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">{appointments.length}</span>
            </div>
          </div>

          <div className="glass p-3.5 sm:p-5 rounded-2xl border border-white/60 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">Pending Action</span>
              <span className="text-lg sm:text-2xl font-extrabold text-amber-700 dark:text-amber-400">{pendingCount}</span>
            </div>
          </div>

          <div className="glass p-3.5 sm:p-5 rounded-2xl border border-white/60 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">Completed</span>
              <span className="text-lg sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {appointments.filter((a) => a.status === 'Completed').length}
              </span>
            </div>
          </div>

          <div className="glass p-3.5 sm:p-5 rounded-2xl border border-white/60 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Smartphone size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">SMS Reminders</span>
              <span className="text-lg sm:text-2xl font-extrabold text-indigo-700 dark:text-indigo-400">
                {appointments.filter((a) => !!a.lastSmsSentAt).length}
              </span>
            </div>
          </div>
        </div>

        {/* Website Announcement & Alert Notification Broadcast Card */}
        <div className="glass rounded-3xl p-5 sm:p-6 mb-6 border border-white/60 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Website Announcement & Public Alert Broadcast</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Post announcements or emergency notices (e.g. clinic closure, holiday schedule) to the public site</p>
              </div>
            </div>
            {activeNotice ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>Active Banner Live On Website</span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 self-start sm:self-auto">No Active Banner</span>
            )}
          </div>

          {/* Active Notice Display */}
          {activeNotice && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 tracking-wide">
                      {activeNotice.type === 'emergency' ? 'Emergency Alert' : activeNotice.type === 'closure' ? 'Clinic Closure' : 'General Notice'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Published on {new Date(activeNotice.publishedAt).toLocaleDateString()} at {new Date(activeNotice.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 break-words">{activeNotice.message}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearAlert}
                className="self-start sm:self-center shrink-0 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Remove this alert banner from the public website"
              >
                <Trash2 size={13} />
                <span>Remove Alert Banner</span>
              </button>
            </div>
          )}

          {noticeSuccessMsg && (
            <div className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{noticeSuccessMsg}</span>
            </div>
          )}

          {/* Form to Publish Alert */}
          <form onSubmit={handlePublishAlert} className="mt-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="sm:w-48 shrink-0">
                <label htmlFor="notice-type" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Notice Type
                </label>
                <select
                  id="notice-type"
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl glass border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                >
                  <option value="closure" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Clinic Closure / Schedule</option>
                  <option value="emergency" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Emergency Notice</option>
                  <option value="general" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">General Announcement</option>
                </select>
              </div>

              <div className="flex-1">
                <label htmlFor="notice-input" className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Alert Message Text
                </label>
                <input
                  type="text"
                  id="notice-input"
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  placeholder="e.g. Notice: Centre will remain closed on Friday for deep sanitization. Urgent ultrasound bookings resume Saturday."
                  className="w-full px-4 py-2.5 rounded-xl glass border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={!noticeText.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <Send size={14} />
                  <span>Publish Alert</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Search Bar Controls & SMS Trigger */}
        <div className="mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, phone, or staff note..."
              className="w-full pl-10 pr-10 py-3 sm:py-2.5 rounded-2xl glass border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm text-slate-800 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowBulkSmsModal(true)}
              disabled={appointments.length === 0}
              className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Simulate broadcasting automated SMS reminders to scheduled patients"
            >
              <Smartphone size={16} />
              <span>Send SMS Reminders</span>
            </button>
          </div>
        </div>

        {searchQuery && (
          <div className="mb-4 text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2 px-1">
            <span>Found <strong className="text-slate-800 dark:text-slate-200">{filteredAppointments.length}</strong> matching {filteredAppointments.length === 1 ? 'appointment' : 'appointments'}</span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* MOBILE VIEW: Compact, Vertical, Touch-Friendly Card List (Shown on screens < lg) */}
        <div className="block lg:hidden space-y-3.5 mb-6">
          {appointments.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 shadow-sm border border-white/60 dark:border-slate-800">
              No appointments found.
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 shadow-sm border border-white/60 dark:border-slate-800 space-y-2">
              <Search size={28} className="text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No appointments matched "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredAppointments.map((appt) => (
              <div
                key={`mobile-${appt.id}`}
                className="glass rounded-2xl p-4 sm:p-5 border border-white/70 dark:border-slate-800 shadow-md space-y-3.5"
              >
                {/* Card Header: Patient Name & Status Selector */}
                <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      {appt.patientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white truncate leading-tight">{appt.patientName}</h4>
                      <a
                        href={`tel:${appt.phone}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 mt-0.5"
                        title="Tap to call patient directly"
                      >
                        <Phone size={11} />
                        <span>{appt.phone}</span>
                      </a>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={appt.status}
                    onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 shrink-0 ${
                      appt.status === 'Completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                        : appt.status === 'Pending'
                        ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                        : appt.status === 'Confirmed'
                        ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                        : 'bg-red-50 dark:bg-red-950/70 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700'
                    }`}
                  >
                    <option value="Pending" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Pending</option>
                    <option value="Confirmed" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Confirmed</option>
                    <option value="Completed" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Completed</option>
                    <option value="Cancelled" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Cancelled</option>
                  </select>
                </div>

                {/* Details Grid: Service, Date, Payment, Fee */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Prescribed Test</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{appt.test}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Pref. Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5 flex items-center gap-1">
                      <Calendar size={11} className="text-slate-400 dark:text-slate-500" />
                      <span>{appt.date}</span>
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Payment</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-[11px]">
                      {appt.paymentMode || 'Cash at Center'}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Service Fee</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 text-[11px]">
                      {appt.price || getServicePrice(appt.test)}
                    </span>
                  </div>
                </div>

                {/* Private Staff Note Section */}
                <div>
                  {appt.notes ? (
                    <div
                      onClick={() => openNoteModal(appt)}
                      className="cursor-pointer p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <FileText size={13} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <p className="line-clamp-2 font-medium break-words leading-relaxed">{appt.notes}</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded shrink-0">
                        Edit
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openNoteModal(appt)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200/80 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileText size={12} className="text-slate-400 dark:text-slate-500" />
                      <span>+ Add Staff Note</span>
                    </button>
                  )}
                </div>

                {/* Mobile Bottom Action Buttons (Touch Friendly: min 44px height) */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {/* SMS Reminder Trigger */}
                  <button
                    type="button"
                    onClick={() => handleTriggerSms(appt)}
                    disabled={sendingSmsId === appt.id}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                      appt.lastSmsSentAt
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 active:bg-emerald-100 dark:active:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-blue-50 dark:bg-blue-950/70 active:bg-blue-100 dark:active:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {sendingSmsId === appt.id ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : appt.lastSmsSentAt ? (
                      <>
                        <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Resend SMS</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Send SMS</span>
                      </>
                    )}
                  </button>

                  {/* Print Receipt Action */}
                  {appt.status === 'Completed' ? (
                    <button
                      type="button"
                      onClick={() => setPrintingAppointment(appt)}
                      className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 active:bg-blue-100 dark:active:bg-blue-900 border border-blue-200 dark:border-blue-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Printer size={14} />
                      <span>Receipt</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="min-h-[44px] px-3 py-2 rounded-xl text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center text-center leading-tight cursor-not-allowed"
                    >
                      Complete to Print
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP / PC VIEW: Full Wide-Screen Multi-Column Table (Shown on screens >= lg) */}
        <div className="hidden lg:block glass rounded-3xl overflow-hidden shadow-xl border border-white/50 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800 bg-white/30 dark:bg-slate-900/60 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4 font-bold flex items-center gap-2"><UserIcon size={14} /> Patient Name</th>
                  <th className="px-6 py-4 font-bold"><Phone size={14} className="inline mr-2" />Phone</th>
                  <th className="px-6 py-4 font-bold"><TestIcon size={14} className="inline mr-2" />Test / Service</th>
                  <th className="px-6 py-4 font-bold"><Tag size={14} className="inline mr-2" />Fee / Price</th>
                  <th className="px-6 py-4 font-bold"><CreditCard size={14} className="inline mr-2" />Payment</th>
                  <th className="px-6 py-4 font-bold"><Calendar size={14} className="inline mr-2" />Pref. Date</th>
                  <th className="px-6 py-4 font-bold"><Info size={14} className="inline mr-2" />Status</th>
                  <th className="px-6 py-4 font-bold"><FileText size={14} className="inline mr-2" />Staff Note</th>
                  <th className="px-6 py-4 font-bold"><Smartphone size={14} className="inline mr-2" />SMS Reminder</th>
                  <th className="px-6 py-4 font-bold"><Printer size={14} className="inline mr-2" />Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/60">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No appointments found.
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search size={28} className="text-slate-300 dark:text-slate-600" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300">No appointments matched "{searchQuery}"</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Try searching by another patient name or phone number.</p>
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Clear Search
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{appt.patientName}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-sm">{appt.phone}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 whitespace-nowrap">
                          {appt.test}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black font-mono bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                          {appt.price || getServicePrice(appt.test)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {appt.paymentMode ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${appt.paymentMode === 'Online' ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                            {appt.paymentMode}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">{appt.date}</td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <select 
                            value={appt.status}
                            onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                            className={`appearance-none outline-none cursor-pointer inline-flex items-center pl-3 pr-8 py-1 rounded-full text-xs font-bold transition-colors ${
                              appt.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 focus:ring-2 focus:ring-amber-400' : 
                              appt.status === 'Completed' ? 'bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900 focus:ring-2 focus:ring-green-400' : 
                              'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 focus:ring-2 focus:ring-red-400'
                            }`}
                          >
                            <option value="Pending" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Pending</option>
                            <option value="Completed" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Completed</option>
                            <option value="Cancelled" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Cancelled</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <svg className={`h-3 w-3 ${
                              appt.status === 'Pending' ? 'text-amber-800 dark:text-amber-300' : 
                              appt.status === 'Completed' ? 'text-green-800 dark:text-green-300' : 
                              'text-red-800 dark:text-red-300'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        {appt.notes ? (
                          <div 
                            onClick={() => openNoteModal(appt)}
                            className="group cursor-pointer p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 transition-all text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2 shadow-2xs"
                            title="Click to view or edit private note"
                          >
                            <FileText size={13} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="line-clamp-2 font-medium break-words leading-relaxed">{appt.notes}</p>
                              <span className="text-[10px] font-semibold text-amber-700/80 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                                <Edit3 size={10} /> Edit comment
                              </span>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openNoteModal(appt)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 bg-white/70 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200/80 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer shadow-2xs"
                            title="Add private staff comment"
                          >
                            <FileText size={12} className="text-slate-400 dark:text-slate-500" />
                            <span>+ Add Note</span>
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <button
                            type="button"
                            onClick={() => handleTriggerSms(appt)}
                            disabled={sendingSmsId === appt.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                              appt.lastSmsSentAt
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            }`}
                            title={`Send SMS reminder to ${appt.patientName} (${appt.phone})`}
                          >
                            {sendingSmsId === appt.id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                                <span>Sending...</span>
                              </>
                            ) : appt.lastSmsSentAt ? (
                              <>
                                <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Resend SMS</span>
                              </>
                            ) : (
                              <>
                                <Send size={12} />
                                <span>Send SMS</span>
                              </>
                            )}
                          </button>

                          {appt.lastSmsSentAt && (
                            <button
                              type="button"
                              onClick={() => setViewingSmsDetails({
                                patientName: appt.patientName,
                                phone: appt.phone,
                                test: appt.test,
                                date: appt.date,
                                messageText: `Reminder: Hello ${appt.patientName}, your appointment for ${appt.test} at Focus Imaging & Diagnosis Centre is on ${appt.date}. Please arrive 15 minutes early with past medical records. Helpline: +91 98765 43210.`,
                                timestamp: appt.lastSmsSentAt
                              })}
                              className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                              title="Click to view simulated SMS delivery details"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Sent ({appt.lastSmsSentAt.split(' ')[1] || 'Today'})</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {appt.status === 'Completed' ? (
                          <button
                            type="button"
                            onClick={() => setPrintingAppointment(appt)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer shadow-xs hover:shadow-sm"
                            title="Print Patient Receipt"
                          >
                            <Printer size={13} />
                            <span>Print</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs italic">
                            Mark completed to print
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Analytics Widget (Positioned Below Appointments Table) */}
        <div className="mt-8">
          <AppointmentsAnalytics appointments={appointments} />
        </div>
      </main>

      {/* Printable Receipt Modal */}
      {printingAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 relative">
            {/* Printable container */}
            <div id="printable-receipt" className="space-y-6">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                    F
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">Focus Imagine and Diagnosis Centre</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Diagnostic Ultrasound & Medical Imaging</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">124 Medical Diagnostic Way • Tel: +1 (800) 555-DIAG</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300 font-bold text-[11px] rounded-full uppercase tracking-wider">
                    Official Receipt
                  </span>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                    #{printingAppointment.id.slice(-6)}
                  </div>
                </div>
              </div>

              {/* Receipt Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Issue Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[10px] font-bold">Appointment Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{printingAppointment.date}</span>
                </div>
              </div>

              {/* Patient Details Box */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/60 dark:bg-slate-950/60">
                <div className="px-4 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Patient & Diagnostic Details
                </div>
                <div className="p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Patient Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{printingAppointment.patientName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Contact Number:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{printingAppointment.phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Prescribed Test:</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400">{printingAppointment.test}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Service Fee (Billed):</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{printingAppointment.price || getServicePrice(printingAppointment.test)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Payment Mode:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{printingAppointment.paymentMode || 'Cash at Center'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Examination Status:</span>
                    <span className="font-bold text-green-700 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Completed & Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Stamp / Signatory */}
              <div className="pt-4 flex justify-between items-end text-xs border-t border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Certified diagnostic report & payment acknowledgment.</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Retain this receipt for personal records & insurance.</p>
                </div>
                <div className="text-center shrink-0">
                  <div className="w-32 border-b border-slate-400 dark:border-slate-600 mb-1"></div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Authorized Radiologist</span>
                </div>
              </div>
            </div>

            {/* Modal Controls (Not printed) */}
            <div className="mt-8 flex gap-3 no-print">
              <button
                type="button"
                onClick={() => {
                  try {
                    window.print();
                  } catch (e) {
                    console.error('Print failed:', e);
                  }
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-200 dark:shadow-none transition-all cursor-pointer text-sm"
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setPrintingAppointment(null)}
                className="py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all cursor-pointer text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Private Note Modal */}
      {editingNoteAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative my-8">
            <button
              type="button"
              onClick={() => setEditingNoteAppt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">Private Staff Note</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Internal notes visible only to clinic staff</p>
              </div>
            </div>

            {/* Patient Context banner */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 mb-4 text-xs space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                Patient: <span className="text-blue-700 dark:text-blue-400">{editingNoteAppt.patientName}</span> ({editingNoteAppt.phone})
              </div>
              <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-[11px]">
                <span>Service: <strong className="text-slate-700 dark:text-slate-300">{editingNoteAppt.test}</strong></span>
                <span>•</span>
                <span>Pref. Date: <strong className="text-slate-700 dark:text-slate-300">{editingNoteAppt.date}</strong></span>
              </div>
            </div>

            {/* Quick Note Presets */}
            <div className="mb-3">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                Quick Insert:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Fasting required (8 hrs)',
                  'Morning slot preferred',
                  'Urgent report requested',
                  'Prescription verified',
                  'Wheelchair assistance needed',
                  'Called & patient confirmed'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setNoteInputText((prev) => prev ? `${prev.trim()}, ${preset}` : preset);
                    }}
                    className="text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/70 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Input */}
            <div className="space-y-1.5 mb-5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Comment / Clinical Note
              </label>
              <textarea
                value={noteInputText}
                onChange={(e) => setNoteInputText(e.target.value)}
                rows={4}
                autoFocus
                placeholder="Type private patient notes, fasting requirements, prep instructions, or call notes..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none leading-relaxed"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500">
                <span>Notes persist automatically across reloads</span>
                <span>{noteInputText.length} characters</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {editingNoteAppt.notes ? (
                <button
                  type="button"
                  onClick={() => handleDeleteNote(editingNoteAppt.id)}
                  className="px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Clear Note</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNoteAppt(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNote(editingNoteAppt.id, noteInputText)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-200 dark:shadow-none transition-all cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating SMS Confirmation Alert Banner */}
      {smsConfirmation && (
        <div className="fixed top-4 inset-x-3 sm:inset-x-auto sm:right-5 sm:max-w-md z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="glass bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-100 relative">
            <button
              type="button"
              onClick={() => setSmsConfirmation(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={20} />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                    SMS Reminder Dispatched
                  </span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    {smsConfirmation.timestamp}
                  </span>
                </div>
                
                {smsConfirmation.type === 'single' ? (
                  <div className="mt-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Sent to {smsConfirmation.patientName} (<span className="text-blue-600 dark:text-blue-400 font-mono">{smsConfirmation.phone}</span>)
                    </p>
                    <div className="mt-1.5 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                      "{smsConfirmation.messageText}"
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Bulk SMS reminders sent to {smsConfirmation.count} patients
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      All scheduled patients have received simulated SMS notifications with appointment date and preparation guidelines.
                    </p>
                  </div>
                )}

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Gateway: Delivered (Simulated 200 OK)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSmsConfirmation(null)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold cursor-pointer hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk SMS Reminders Confirmation Modal */}
      {showBulkSmsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative my-8">
            <button
              type="button"
              onClick={() => setShowBulkSmsModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">Send SMS Appointment Reminders</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Automated patient notification service</p>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/60 rounded-2xl border border-blue-200/80 dark:border-blue-800 mb-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>Eligible Patients:</span>
                <span className="text-blue-700 dark:text-blue-400 font-bold text-sm">
                  {appointments.filter((a) => a.status !== 'Cancelled').length} scheduled
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                This simulated service will send SMS reminders to patient phone numbers with their diagnostic test date, reporting time, and preparation checklist.
              </p>
            </div>

            {/* Simulated SMS Message Preview */}
            <div className="space-y-1.5 mb-5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Simulated SMS Template
              </label>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed">
                "Reminder: Hello [Patient Name], your appointment for [Diagnostic Service] at Focus Imaging & Diagnosis Centre is on [Scheduled Date]. Please arrive 15 minutes early with past medical records. Helpline: +91 98765 43210."
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                <span>Sender ID: FOCUS-DX</span>
                <span>Telecommunications Gateway: Active</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowBulkSmsModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerBulkSms}
                disabled={isBulkSending || appointments.length === 0}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-200 dark:shadow-none transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isBulkSending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending SMS Messages...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Confirm & Send Reminders</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated SMS Details Modal */}
      {viewingSmsDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative my-8">
            <button
              type="button"
              onClick={() => setViewingSmsDetails(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">Simulated SMS Delivery Report</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Patient phone notification record</p>
              </div>
            </div>

            {/* Recipient summary */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 mb-4 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Patient:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingSmsDetails.patientName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Recipient Phone:</span>
                <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{viewingSmsDetails.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Dispatched At:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{viewingSmsDetails.timestamp}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Gateway Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={12} /> Delivered (HTTP 200 OK)
                </span>
              </div>
            </div>

            {/* Phone Message Simulation Bubble */}
            <div className="mb-5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Delivered SMS Text:
              </label>
              <div className="p-4 bg-blue-50/80 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans shadow-xs">
                <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">
                  FOCUS-DIAGNOSTIC-CENTER
                </div>
                <p className="text-slate-800 dark:text-slate-200">
                  {viewingSmsDetails.messageText}
                </p>
                <div className="text-right text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                  Delivered • {viewingSmsDetails.timestamp.split(' ')[1] || viewingSmsDetails.timestamp}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewingSmsDetails(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Administrator Accounts Management Modal */}
      {showAdminManagementModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="glass max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-white/80 dark:border-slate-700 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Admin Accounts</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      registeredAdmins.length >= MAX_ADMIN_LIMIT
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {registeredAdmins.length} / {MAX_ADMIN_LIMIT} Registered
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Strict governance: Maximum 2 admin accounts allowed.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminManagementModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Capacity Status Banner */}
            {registeredAdmins.length >= MAX_ADMIN_LIMIT ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/70 rounded-2xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                <Lock size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Maximum admin limit ({MAX_ADMIN_LIMIT}) reached.</span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    Registration is disabled on the sign-in portal. To register a new administrator, remove an existing account below.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/70 rounded-2xl text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{MAX_ADMIN_LIMIT - registeredAdmins.length} registration slot available.</span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    A new administrator can register via the Admin Portal sign-in screen.
                  </p>
                </div>
              </div>
            )}

            {/* Accounts List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {registeredAdmins.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No custom admins registered yet</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Currently operating on emergency default credentials. Log out and register up to 2 custom admin accounts.
                  </p>
                </div>
              ) : (
                registeredAdmins.map((admin, idx) => (
                  <div
                    key={admin.id || idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {admin.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {admin.displayName}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                            @{admin.username}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {admin.email}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                          {admin.role || 'Administrator'} • Registered {new Date(admin.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRegisteredAdmin(admin.id)}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors cursor-pointer shrink-0"
                      title={`Remove ${admin.displayName} to free an admin registration slot`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdminManagementModal(false)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
