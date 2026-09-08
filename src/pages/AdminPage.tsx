import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { LogOut, Activity, User as UserIcon, LogIn, Calendar, Phone, Activity as TestIcon, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  date: string;
  test: string;
  status: string;
  createdAt: any;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setAppointments([]);
      return;
    }

    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appts: Appointment[] = [];
      snapshot.forEach((doc) => {
        appts.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setAppointments(appts);
    });

    return unsubscribe;
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error('Auth failed', error);
      setLoginError(error.message || 'Authentication failed. Please check your details.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin text-blue-600"><Activity size={48} /></div>
      </div>
    );
  }

  if (!user) {
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
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 overflow-hidden">
              {user.photoURL ? <img src={user.photoURL} alt="Avatar" /> : <UserIcon size={16} />}
            </div>
            {user.displayName && <span className="text-sm font-bold text-slate-700 hidden sm:inline-block">{user.displayName}</span>}
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {appt.test}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{appt.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          appt.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {appt.status}
                        </span>
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
