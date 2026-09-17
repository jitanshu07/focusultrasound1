import React, { useState, useEffect } from 'react';
import { Activity, Phone, MapPin, Clock, ChevronRight, Menu, X, CheckCircle2, Microscope, ShieldAlert, AlertCircle, QrCode, Smartphone, AlertTriangle, Tag, DollarSign, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { HeaderHeartbeatLine, HeroEkgMonitor, PulseBadgeWave } from '../components/HeartbeatPulseLine';
import ThemeToggle from '../components/ThemeToggle';
import PatientTestimonials from '../components/PatientTestimonials';
import { getServicePrice, getServiceInfo } from '../types';

interface PublicAlertData {
  message: string;
  type?: 'emergency' | 'closure' | 'general';
  publishedAt?: string;
}

export default function PublicPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [publicAlert, setPublicAlert] = useState<PublicAlertData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    service: '',
    paymentMode: ''
  });

  // Listen to Admin alert notifications
  useEffect(() => {
    const checkAlert = () => {
      try {
        const stored = localStorage.getItem('focus_public_alert');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.message && parsed.message.trim()) {
            setPublicAlert(parsed);
            return;
          }
        }
        setPublicAlert(null);
      } catch (e) {
        setPublicAlert(null);
      }
    };

    checkAlert();
    window.addEventListener('storage', checkAlert);
    window.addEventListener('focus_alert_updated', checkAlert);
    const interval = setInterval(checkAlert, 1500);

    return () => {
      window.removeEventListener('storage', checkAlert);
      window.removeEventListener('focus_alert_updated', checkAlert);
      clearInterval(interval);
    };
  }, []);

  const validatePhoneNumber = (value: string): boolean => {
    const trimmed = value.trim();
    // Strictly must be exactly 10 digits
    const isValid = /^[0-9]{10}$/.test(trimmed);
    if (!isValid) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    if (id === 'phone' && phoneError) {
      // Clear or resolve error dynamically as user enters a valid 10-digit number
      if (/^[0-9]{10}$/.test(value.trim())) {
        setPhoneError(null);
      }
    }
  };

  const handlePhoneBlur = () => {
    if (formData.phone.trim()) {
      validatePhoneNumber(formData.phone);
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict JavaScript validation: must be exactly 10 digits
    if (!validatePhoneNumber(formData.phone)) {
      const phoneInput = document.getElementById('phone');
      if (phoneInput) {
        phoneInput.focus();
      }
      return;
    }

    setFormStatus('submitting');
    try {
      const newAppt = {
        id: Date.now().toString(),
        patientName: formData.name.trim(),
        phone: formData.phone.trim(),
        date: formData.date,
        test: formData.service,
        price: getServicePrice(formData.service),
        paymentMode: formData.paymentMode,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      
      const existing = JSON.parse(localStorage.getItem('focus_appointments') || '[]');
      localStorage.setItem('focus_appointments', JSON.stringify([newAppt, ...existing]));

      setFormStatus('submitted');
      setFormData({ name: '', phone: '', date: '', service: '', paymentMode: '' });
      setPhoneError(null);
      setTimeout(() => setFormStatus('idle'), 5000);
    } catch (error) {
      console.error('Error submitting appointment: ', error);
      setFormStatus('error');
    }
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#about' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className="min-h-screen relative text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100 overflow-x-hidden transition-colors duration-200">
      <div className="fixed inset-0 mesh-bg -z-10"></div>
      
      {/* Header & Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass shadow-sm">
        {/* Topmost Admin-Broadcasted Dynamic Alert Banner */}
        <AnimatePresence>
          {publicAlert && (
            <motion.div
              id="public-alert-banner"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`w-full overflow-hidden text-white shadow-md border-b ${
                publicAlert.type === 'emergency'
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 border-red-500'
                  : publicAlert.type === 'closure'
                  ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 border-amber-500'
                  : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 border-blue-600'
              }`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/25 text-white border border-white/30 shrink-0 shadow-2xs">
                    <AlertTriangle size={12} className="animate-pulse" />
                    <span>
                      {publicAlert.type === 'emergency'
                        ? 'Emergency Alert'
                        : publicAlert.type === 'closure'
                        ? 'Clinic Notice'
                        : 'Announcement'}
                    </span>
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-white tracking-wide break-words drop-shadow-xs">
                    {publicAlert.message}
                  </p>
                </div>
                {publicAlert.publishedAt && (
                  <span className="hidden md:inline-block text-[11px] text-white/80 shrink-0 font-medium whitespace-nowrap">
                    Updated: {new Date(publicAlert.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo area */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-sm">
                F
              </div>
              <h1 className="text-sm sm:text-xl font-bold tracking-tight text-blue-900 dark:text-blue-200 leading-tight truncate">
                Focus <span className="font-light hidden xs:inline text-slate-700 dark:text-slate-300">Imagine & Diagnosis Centre</span>
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#book"
                id="desktop-book-now-btn"
                className="book-now-glow inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all cursor-pointer"
              >
                Book Now
              </a>

              {/* Theme Mode Toggle Button */}
              <ThemeToggle />

              <Link to="/admin" className="text-sm font-medium text-slate-400 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
                Admin
              </Link>
            </nav>

            {/* Mobile Actions: Theme Toggle + Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                className="p-2 text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200/50 dark:border-slate-800 glass overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 text-base font-medium text-slate-600 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-2 space-y-2">
                  <a
                    href="#book"
                    id="mobile-book-now-btn"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="book-now-glow flex w-full items-center justify-center px-5 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all cursor-pointer"
                  >
                    Book Now
                  </a>
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center px-5 py-3 text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                  >
                    Admin Login
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Glowing EKG / Heartbeat Live Pulse Line across bottom of header */}
        <HeaderHeartbeatLine />
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className={`pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all ${publicAlert ? 'pt-40 md:pt-48' : 'pt-32 md:pt-40'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="glass p-8 md:p-12 rounded-3xl flex-1 flex flex-col justify-center border border-white/60 dark:border-slate-800 shadow-lg">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <PulseBadgeWave />
                <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs hidden sm:inline-block">Trusted Healthcare Diagnostics</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.15]">
                Precision Care <br/>Starts With <span className="text-blue-600 dark:text-blue-400">Accurate Views.</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg mb-8 leading-relaxed">
                State-of-the-art ultrasound and imaging technology paired with expert radiologists to ensure your health is always in focus.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" /> Same Day Results
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" /> Certified Experts
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <a
                  href="#book"
                  id="hero-book-now-btn"
                  className="book-now-glow inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer"
                >
                  Book Now
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Explore Services
                </a>
              </div>
            </div>
            
            {/* Hero Image & Live EKG Pulse Telemetry Suite */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-16/10 sm:aspect-4/3 rounded-3xl overflow-hidden shadow-xl glass border border-white/60 dark:border-slate-800">
                <img 
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop" 
                  alt="Medical professional hallway"
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent pointer-events-none"></div>

                {/* Live Diagnostic Telemetry Overlay Pill */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between text-white text-xs px-3.5 py-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-400/20 shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-mono font-bold tracking-wider text-[11px] sm:text-xs">HIGH-PRECISION IMAGING ACTIVE</span>
                  </div>
                  <span className="font-mono text-cyan-300 font-bold text-[10px] sm:text-xs">CONTINUOUS TRACE</span>
                </div>
              </div>

              {/* Unique High-Tech Animated EKG / Heartbeat Monitor */}
              <HeroEkgMonitor />
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 md:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 glass p-8 rounded-3xl inline-block w-full border border-white/60 dark:border-slate-800">
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Our Core Services</h3>
              <p className="text-lg text-slate-600 dark:text-slate-300">We specialize in precise diagnostic imaging and comprehensive laboratory blood tests to deliver fast, dependable clinical insights.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: 'Ultrasound',
                  price: '$120',
                  icon: <Activity className="w-7 h-7" />,
                  color: 'blue',
                  desc: 'High-resolution abdominal, pelvic, obstetric, and vascular ultrasound scans performed with advanced equipment by certified sonologists.'
                },
                {
                  title: 'Laboratory Test (Blood Test)',
                  price: '$45',
                  icon: <Microscope className="w-7 h-7" />,
                  color: 'cyan',
                  desc: 'Comprehensive blood profiles, hematology, biochemistry, and clinical pathology testing with rapid, certified laboratory reporting.'
                },
              ].map((service, i) => (
                <div key={i} className="glass p-8 rounded-3xl hover:shadow-xl transition-all group flex flex-col items-start border border-white/60 dark:border-slate-800">
                  <div className="w-full flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${
                      service.color === 'blue' 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400' 
                        : 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/80 dark:text-cyan-400'
                    }`}>
                      {service.icon}
                    </div>
                    <span className="font-mono text-base font-black px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-2xs">
                      {service.price}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{service.title}</h4>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">{service.desc}</p>
                  <a
                    href="#book"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <span>Book this service</span>
                    <ChevronRight size={16} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-20 md:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass rounded-3xl p-8 md:p-12 border border-white/60 dark:border-slate-800">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border border-white/40 dark:border-slate-700">
                     <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop" alt="Doctor consulting" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border border-white/40 dark:border-slate-700 mt-12">
                     <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop" alt="Laboratory" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs mb-3 block">About Us</span>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Committed to Accuracy, Devoted to Care</h3>
                  <div className="space-y-5 text-lg text-slate-600 dark:text-slate-300">
                    <p>
                      At <strong>Focus Imagine and Diagnosis Centre</strong>, we bridge the gap between advanced medical technology and compassionate patient care. Since our founding, we have been a trusted partner for both patients and healthcare providers in delivering reliable diagnostic insights.
                    </p>
                    <p>
                      Our facility is equipped with state-of-the-art machinery operated by highly trained technicians and reviewed by expert radiologists. We understand that medical tests can be stressful, which is why we prioritize a calm, efficient, and supportive environment.
                    </p>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 gap-6 pt-8 border-t border-slate-300/50 dark:border-slate-700/60">
                    <div>
                      <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-1">15+</div>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Years Experience</div>
                    </div>
                    <div>
                      <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-1">50k+</div>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Patients Served</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Patient Testimonials Carousel Section */}
        <PatientTestimonials />

        {/* Appointment Booking & Contact Section */}
        <section id="book" className="py-20 md:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Form Column */}
              <div className="lg:col-span-3 glass p-8 md:p-10 rounded-3xl border border-white/60 dark:border-slate-800">
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" /> 
                  Schedule Appointment
                </h3>
                
                {formStatus === 'submitted' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <CheckCircle2 size={40} />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Request Received</h4>
                    <p className="text-slate-600 dark:text-slate-300 max-w-sm mx-auto">Thank you. Your request has been securely saved. Our front desk team will contact you shortly.</p>
                  </motion.div>
                ) : formStatus === 'error' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <ShieldAlert size={40} />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Connection Error</h4>
                    <p className="text-slate-600 dark:text-slate-300 max-w-sm mx-auto mb-6">There was an issue saving your request to the database. Please try again.</p>
                    <button onClick={() => setFormStatus('idle')} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-medium text-slate-800 dark:text-slate-100 transition-colors cursor-pointer">
                      Try Again
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleBookSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Patient Name</label>
                      <input required type="text" id="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Full Name" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="phone" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <span className="text-[11px] font-semibold text-slate-400">10-digit mobile</span>
                        </div>
                        <input
                          required
                          type="tel"
                          id="phone"
                          inputMode="numeric"
                          value={formData.phone}
                          onChange={handleInputChange}
                          onBlur={handlePhoneBlur}
                          aria-invalid={!!phoneError}
                          aria-describedby={phoneError ? 'phone-error' : undefined}
                          className={`w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/80 border transition-all text-sm focus:outline-none focus:ring-2 ${
                            phoneError
                              ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-950 focus:ring-red-400 text-red-900 dark:text-red-300 bg-red-50/30 dark:bg-red-950/30'
                              : 'border-slate-200 dark:border-slate-700 focus:ring-blue-400 text-slate-800 dark:text-slate-100'
                          }`}
                          placeholder="e.g. 9876543210"
                        />
                        {phoneError && (
                          <p
                            id="phone-error"
                            role="alert"
                            className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-1.5 animate-in fade-in duration-200"
                          >
                            <AlertCircle size={14} className="shrink-0 text-red-500 dark:text-red-400" />
                            <span>{phoneError}</span>
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="date" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Preferred Date</label>
                        <input required type="date" id="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow text-slate-700 dark:text-slate-200" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label htmlFor="service" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Select Test</label>
                        <select required id="service" value={formData.service} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow text-slate-700 dark:text-slate-200">
                          <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Choose a service / test...</option>
                          <option value="Ultrasound" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Ultrasound ($120)</option>
                          <option value="Laboratory Test (Blood Test)" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Laboratory Test ($45)</option>
                        </select>

                        {/* Dynamic Price Display below the Service Field */}
                        <AnimatePresence>
                          {formData.service && (
                            <motion.div
                              id="service-price-display"
                              initial={{ opacity: 0, height: 0, y: -4 }}
                              animate={{ opacity: 1, height: 'auto', y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -4 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden pt-1.5"
                            >
                              <div className="p-3.5 rounded-2xl bg-blue-50/90 dark:bg-slate-800/90 border border-blue-200/80 dark:border-blue-900/60 shadow-xs">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                      <Tag size={15} />
                                    </div>
                                    <div>
                                      <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                                        {formData.service.includes('Ultrasound') ? 'Ultrasound Scan Fee' : 'Laboratory Test Fee'}
                                      </span>
                                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Estimated diagnostic fee
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="font-mono text-base font-black text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800 shadow-2xs">
                                      {getServicePrice(formData.service)}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-2.5 pt-2 border-t border-blue-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                                  <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                    <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                    <span>
                                      {formData.service.includes('Ultrasound')
                                        ? 'Includes 2D/3D scan & certified report'
                                        : 'Includes blood work & certified pathology report'}
                                    </span>
                                  </span>
                                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                                    Fixed Rate
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label htmlFor="paymentMode" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Payment Mode</label>
                        <select required id="paymentMode" value={formData.paymentMode} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow text-slate-700 dark:text-slate-200">
                          <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Choose payment method...</option>
                          <option value="Cash at Center" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Cash at Center</option>
                          <option value="Online / Card" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Online / Card</option>
                        </select>

                        {/* Dynamic QR Code Box - strictly hidden by default and when 'Cash at Center' is selected; appears immediately when 'Online / Card' is selected */}
                        <AnimatePresence>
                          {(formData.paymentMode === 'Online / Card' || formData.paymentMode === 'Online') && (
                            <motion.div
                              id="qr-code-placeholder-box"
                              initial={{ opacity: 0, height: 0, scale: 0.95 }}
                              animate={{ opacity: 1, height: 'auto', scale: 1 }}
                              exit={{ opacity: 0, height: 0, scale: 0.95 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden pt-2"
                            >
                              <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-dashed border-blue-300 dark:border-blue-700 shadow-sm flex flex-col items-center justify-center text-center">
                                {formData.service && (
                                  <div className="mb-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/80 rounded-lg text-xs font-mono font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                    Amount Payable: {getServicePrice(formData.service)}
                                  </div>
                                )}
                                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-inner relative group mb-2">
                                  <QrCode size={86} className="text-slate-900" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
                                    <Smartphone size={13} className="text-blue-600 dark:text-blue-400" />
                                    <span>Scan QR Code to Pay</span>
                                  </p>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Supports UPI, Google Pay, PhonePe & Cards</p>
                                  <span className="inline-block mt-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                    Instant Verification
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button disabled={formStatus === 'submitting'} type="submit" className="w-full flex justify-center items-center py-4 rounded-xl shadow-lg shadow-blue-100 dark:shadow-none text-base font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-all cursor-pointer">
                        {formStatus === 'submitting' ? 'Submitting...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
              
              {/* Info Column */}
              <div id="contact" className="lg:col-span-2 flex flex-col gap-8">
                <div className="glass p-8 rounded-3xl flex-1 flex flex-col border border-white/60 dark:border-slate-800">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Find Us</h3>
                  <div className="flex flex-col gap-6 text-sm text-slate-600 dark:text-slate-300 flex-1">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100/80 dark:bg-blue-950/80 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200 block mb-1">Address</strong>
                        <p>123 Medical Avenue, Diagnostic Sq.<br/>Health District, City 450012</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100/80 dark:bg-blue-950/80 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                        <Phone size={20} />
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200 block mb-1">Contact</strong>
                        <p>+1 (555) 000-Diagnostic<br/>info@focusimagine.com</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100/80 dark:bg-blue-950/80 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                        <Clock size={20} />
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200 block mb-1">Hours</strong>
                        <p>Mon - Sat: 8:00 AM - 8:00 PM<br/>Sun: Emergency Only</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Map Placeholder */}
                <div className="glass rounded-3xl overflow-hidden min-h-[200px] relative border border-white/50 dark:border-slate-800 flex-shrink-0">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <MapPin size={32} className="text-slate-500 dark:text-slate-400 mb-2" />
                    <p className="text-slate-700 dark:text-slate-300 font-bold text-sm">Interactive Map Location</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="glass border-b-0 border-x-0 dark:border-slate-800 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-16 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div>&copy; {new Date().getFullYear()} Focus Imagine & Diagnosis Centre. All rights reserved.</div>
          <div className="flex gap-6 uppercase tracking-widest text-[10px]">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Patient Rights</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
