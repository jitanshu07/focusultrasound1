import React, { useEffect, useState } from 'react';
import { LogOut, Activity, User as UserIcon, LogIn, Calendar, Phone, Activity as TestIcon, Info, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  date: string;
  test: string;
  paymentMode?: string;
  status: string;
  createdAt: any;
}

export default function AdminPage() {
  const [adminUser, setAdminUser] = useState<{name: string, email: string} | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const storedSession = localStorage.getItem('focus_admin_session');
    if (storedSession) {
      setAdminUser(JSON.parse(storedSession));
    }
    setLoading(false);
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const admins = JSON.parse(localStorage.getItem('focus_admins') || '[]');
      
      if (isRegistering) {
        if (admins.some((a: any) => a.email === email)) {
          setLoginError('Email already registered.');
          return;
        }
        const newAdmin = { name: name || 'Admin', email, password };
        admins.push(newAdmin);
        localStorage.setItem('focus_admins', JSON.stringify(admins));
        
        const sessionData = { name: newAdmin.name, email };
        localStorage.setItem('focus_admin_session', JSON.stringify(sessionData));
        setAdminUser(sessionData);
      } else {
        const admin = admins.find((a: any) => a.email === email && a.password === password);
        if (!admin) {
          setLoginError('Invalid username or password.');
          return;
        }
        const sessionData = { name: admin.name, email: admin.email };
        localStorage.setItem('focus_admin_session', JSON.stringify(sessionData));
        setAdminUser(sessionData);
      }
    } catch (error: any) {
      console.error('Auth failed', error);
      setLoginError('Authentication failed. Please try again.');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin text-blue-600"><Activity size={48} /></div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="fixed inset-0 mesh-bg -z-10"></div>
        <div className="glass p-10 rounded-3xl w-full max-w-md text-center shadow-xl">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="font-bold text-2xl">F</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Portal</h1>
          <p className="text-slate-600 mb-8">{isRegistering ? 'Create a new admin account.' : 'Sign in to manage appointments.'}</p>
          <form onSubmit={handleAuth} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-100/50 border border-red-200 text-red-700 text-sm rounded-xl mb-4 font-medium">
                {loginError}
              </div>
            )}
            {isRegistering && (
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Admin Name</label>
                <input 
                  type="text" 
                  required={isRegistering}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow" 
                  placeholder="Jane Doe" 
                />
              </div>
            )}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Username (Email)</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow" 
                placeholder="admin@focusimagine.com" 
              />
            </div>
            <div className="space-y-1.5 text-left pb-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow" 
                placeholder="••••••••" 
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-200 transition-all"
            >
              <LogIn size={20} />
              {isRegistering ? 'Create Account' : 'Secure Login'}
            </button>
          </form>
          <div className="mt-6 flex flex-col gap-4">
            <button 
              type="button" 
              onClick={() => { setIsRegistering(!isRegistering); setLoginError(''); }}
              className="text-sm text-slate-600 font-medium hover:text-blue-600 transition-colors"
            >
              {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register'}
            </button>
            <Link to="/" className="text-sm text-blue-600 font-medium hover:underline">
              &larr; Back to Public Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 font-sans">
      <div className="fixed inset-0 mesh-bg -z-10"></div>
      
      {/* Top Navbar */}
      <header className="h-16 glass shadow-sm px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <span className="font-bold text-sm">F</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
            View Public Site
          </Link>
          <div className="h-6 w-px bg-slate-300"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 overflow-hidden font-bold">
              {adminUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold text-slate-700 hidden sm:inline-block">{adminUser.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Appointments Overview</h2>
            <p className="text-slate-600 mt-1">Manage and view all incoming diagnostic requests.</p>
          </div>
          <div className="glass px-4 py-2 rounded-lg border border-white/50 text-sm font-medium text-slate-600">
            Total Requests: <span className="text-blue-600 font-bold">{appointments.length}</span>
          </div>
        </div>

        <div className="glass rounded-3xl overflow-hidden shadow-xl border border-white/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 bg-white/30 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-bold flex items-center gap-2"><UserIcon size={14} /> Patient Name</th>
                  <th className="px-6 py-4 font-bold"><Phone size={14} className="inline mr-2" />Phone</th>
                  <th className="px-6 py-4 font-bold"><TestIcon size={14} className="inline mr-2" />Test / Service</th>
                  <th className="px-6 py-4 font-bold"><CreditCard size={14} className="inline mr-2" />Payment</th>
                  <th className="px-6 py-4 font-bold"><Calendar size={14} className="inline mr-2" />Pref. Date</th>
                  <th className="px-6 py-4 font-bold"><Info size={14} className="inline mr-2" />Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-white/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{appt.patientName}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-sm">{appt.phone}</td>
                      <td className="px-6 py-4 text-slate-700">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                          {appt.test}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {appt.paymentMode ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${appt.paymentMode === 'Online' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                            {appt.paymentMode}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">{appt.date}</td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <select 
                            value={appt.status}
                            onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                            className={`appearance-none outline-none cursor-pointer inline-flex items-center pl-3 pr-8 py-1 rounded-full text-xs font-bold transition-colors ${
                              appt.status === 'Pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 focus:ring-2 focus:ring-amber-400' : 
                              appt.status === 'Completed' ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-2 focus:ring-green-400' : 
                              'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-2 focus:ring-red-400'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <svg className={`h-3 w-3 ${
                              appt.status === 'Pending' ? 'text-amber-800' : 
                              appt.status === 'Completed' ? 'text-green-800' : 
                              'text-red-800'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
