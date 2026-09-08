/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Activity, Phone, MapPin, Clock, ChevronRight, Menu, X, CheckCircle2, Stethoscope, Microscope, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitted'>('idle');

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitted');
    setTimeout(() => setFormStatus('idle'), 5000);
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className="min-h-screen relative text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      <div className="fixed inset-0 mesh-bg -z-10"></div>
      
      {/* Header & Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo area */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <span className="font-bold">F</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-blue-900 leading-tight">Focus <span className="font-light">Imagine & Diagnosis Centre</span></h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#book"
                className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-md shadow-blue-200 transition-colors"
              >
                Book Now
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200/50 glass overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 text-base font-medium text-slate-600 hover:text-blue-600 hover:bg-white/50 rounded-md"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-2">
                  <a
                    href="#book"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center px-5 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-md shadow-blue-200"
                  >
                    Book Now
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="glass p-8 md:p-12 rounded-3xl flex-1 flex flex-col justify-center">
              <span className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-3 block">Trusted Healthcare Diagnostics</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.15]">
                Precision Care <br/>Starts With <span className="text-blue-600">Accurate Views.</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-lg mb-8 leading-relaxed">
                State-of-the-art ultrasound and imaging technology paired with expert radiologists to ensure your health is always in focus.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Same Day Results
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Certified Experts
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <a
                  href="#book"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-xl transition-all"
                >
                  Schedule Appointment
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-slate-700 bg-white/50 border border-slate-200 hover:bg-white/80 rounded-xl transition-all"
                >
                  Explore Services
                </a>
              </div>
            </div>
            
            {/* Hero Image / Vibe Placeholder */}
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl glass">
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop" 
                alt="Medical professional hallway"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply pointer-events-none"></div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 md:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 glass p-8 rounded-3xl inline-block w-full">
              <h3 className="text-3xl font-extrabold text-slate-900 mb-4">Our Core Services</h3>
              <p className="text-lg text-slate-600">We utilize the latest technology to provide highly accurate scans and reports to help you and your doctor make informed decisions.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'General Scans', icon: <Activity className="w-6 h-6" />, color: 'blue', desc: 'Abdominal, pelvic & musculoskeletal high-resolution scans.' },
                { title: 'Digital X-Ray', icon: <Stethoscope className="w-6 h-6" />, color: 'indigo', desc: 'Fast and detailed radiographic imaging with minimal radiation exposure.' },
                { title: 'Laboratory Tests', icon: <Microscope className="w-6 h-6" />, color: 'cyan', desc: 'Comprehensive blood and fluid analysis providing rapid, precise results.' },
                { title: 'MRI & CT Scans', icon: <Activity className="w-6 h-6" />, color: 'blue', desc: 'Advanced cross-sectional imaging for deep tissue and neurological evaluation.' },
                { title: 'Cardiac Imaging', icon: <Activity className="w-6 h-6" />, color: 'indigo', desc: 'Detailed echocardiography and doppler to evaluate heart health.' },
                { title: 'Specialized Care', icon: <Droplets className="w-6 h-6" />, color: 'cyan', desc: 'Pediatric and geriatric diagnostic focus with gentle, precise care.' },
              ].map((service, i) => (
                <div key={i} className="glass p-6 rounded-2xl hover:shadow-lg transition-all group flex flex-col items-start">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                    service.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    service.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                    'bg-cyan-100 text-cyan-600'
                  }`}>
                    {service.icon}
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-1">{service.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-20 md:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass rounded-3xl p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border border-white/40">
                     <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop" alt="Doctor consulting" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border border-white/40 mt-12">
                     <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop" alt="Laboratory" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <span className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-3 block">About Us</span>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">Committed to Accuracy, Devoted to Care</h3>
                  <div className="space-y-5 text-lg text-slate-600">
                    <p>
                      At <strong>Focus Imagine and Diagnosis Centre</strong>, we bridge the gap between advanced medical technology and compassionate patient care. Since our founding, we have been a trusted partner for both patients and healthcare providers in delivering reliable diagnostic insights.
                    </p>
                    <p>
                      Our facility is equipped with state-of-the-art machinery operated by highly trained technicians and reviewed by expert radiologists. We understand that medical tests can be stressful, which is why we prioritize a calm, efficient, and supportive environment.
                    </p>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 gap-6 pt-8 border-t border-slate-300/50">
                    <div>
                      <div className="text-4xl font-extrabold text-blue-600 mb-1">15+</div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Years Experience</div>
                    </div>
                    <div>
                      <div className="text-4xl font-extrabold text-blue-600 mb-1">50k+</div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Patients Served</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Appointment Booking & Contact Section */}
        <section id="book" className="py-20 md:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Form Column */}
              <div className="lg:col-span-3 glass p-8 md:p-10 rounded-3xl">
                <h3 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-600" /> 
                  Schedule Appointment
                </h3>
                
                {formStatus === 'submitted' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <CheckCircle2 size={40} />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900 mb-3">Request Received</h4>
                    <p className="text-slate-600 max-w-sm mx-auto">Thank you. Our front desk team will contact you shortly to confirm your exact appointment time.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleBookSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Patient Name</label>
                      <input required type="text" id="name" className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow" placeholder="Full Name" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                        <input required type="tel" id="phone" className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow" placeholder="(555) 000-0000" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="date" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Preferred Date</label>
                        <input required type="date" id="date" className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow text-slate-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="service" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Test</label>
                      <select required id="service" className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow text-slate-600">
                        <option value="">Choose a service...</option>
                        <option value="ultrasound">Pelvic / Abdominal Ultrasound</option>
                        <option value="xray">Digital X-Ray</option>
                        <option value="mri">MRI / CT Scan</option>
                        <option value="blood">Laboratory Blood Test</option>
                        <option value="cardio">Cardiac Doppler / ECG</option>
                        <option value="other">Other / Not Sure</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="w-full flex justify-center items-center py-4 rounded-xl shadow-lg shadow-blue-100 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all">
                        Confirm Booking
                      </button>
                    </div>
                  </form>
                )}
              </div>
              
              {/* Info Column */}
              <div id="contact" className="lg:col-span-2 flex flex-col gap-8">
                <div className="glass p-8 rounded-3xl flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Find Us</h3>
                  <div className="flex flex-col gap-6 text-sm text-slate-600 flex-1">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100/80 flex-shrink-0 flex items-center justify-center text-blue-600 shadow-sm">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <strong className="text-slate-800 block mb-1">Address</strong>
                        <p>123 Medical Avenue, Diagnostic Sq.<br/>Health District, City 450012</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100/80 flex-shrink-0 flex items-center justify-center text-blue-600 shadow-sm">
                        <Phone size={20} />
                      </div>
                      <div>
                        <strong className="text-slate-800 block mb-1">Contact</strong>
                        <p>+1 (555) 000-Diagnostic<br/>info@focusimagine.com</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100/80 flex-shrink-0 flex items-center justify-center text-blue-600 shadow-sm">
                        <Clock size={20} />
                      </div>
                      <div>
                        <strong className="text-slate-800 block mb-1">Hours</strong>
                        <p>Mon - Sat: 8:00 AM - 8:00 PM<br/>Sun: Emergency Only</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Map Placeholder */}
                <div className="glass rounded-3xl overflow-hidden min-h-[200px] relative border border-white/50 flex-shrink-0">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <MapPin size={32} className="text-slate-500 mb-2" />
                    <p className="text-slate-700 font-bold text-sm">Interactive Map Location</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="glass border-b-0 border-x-0 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-16 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 text-xs font-medium text-slate-500">
          <div>&copy; {new Date().getFullYear()} Focus Imagine & Diagnosis Centre. All rights reserved.</div>
          <div className="flex gap-6 uppercase tracking-widest text-[10px]">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Patient Rights</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
