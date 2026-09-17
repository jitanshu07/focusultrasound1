import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, CheckCircle2, Quote, ShieldCheck, Heart, Sparkles, Pause, Play } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  initials: string;
  avatarBg: string;
  rating: number;
  service: string;
  date: string;
  quote: string;
  verified: boolean;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Obstetric 3D Ultrasound Patient',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    initials: 'SJ',
    avatarBg: 'bg-rose-500',
    rating: 5,
    service: 'Ultrasound Scan',
    date: 'Verified visit • 2 days ago',
    quote: 'The sonologist was exceptionally gentle and explained every detail of our baby\'s 3D ultrasound on screen. The imaging resolution was crystal clear, and receiving the digital report on my phone within the hour gave us total peace of mind.',
    verified: true,
  },
  {
    id: 2,
    name: 'David Miller',
    role: 'Comprehensive Blood Panel Patient',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    initials: 'DM',
    avatarBg: 'bg-blue-600',
    rating: 5,
    service: 'Laboratory Test (Blood Test)',
    date: 'Verified visit • 1 week ago',
    quote: 'I have always had severe anxiety with blood draws, but the phlebotomist here was so skilled I barely felt a prick. The facility is clinically pristine, staff are respectful, and my CBC & metabolic results were verified that same evening.',
    verified: true,
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'Abdominal Diagnostic Scan Patient',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    initials: 'ER',
    avatarBg: 'bg-emerald-600',
    rating: 5,
    service: 'Ultrasound Scan',
    date: 'Verified visit • 2 weeks ago',
    quote: 'My doctor recommended an urgent abdominal ultrasound. Booking an appointment was effortless, the $120 transparent flat pricing meant zero unexpected bills, and the radiologist\'s report was thorough and immediately accepted by my specialist.',
    verified: true,
  },
  {
    id: 4,
    name: 'Robert Chen',
    role: 'Annual Wellness & Lipid Profile Patient',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    initials: 'RC',
    avatarBg: 'bg-indigo-600',
    rating: 5,
    service: 'Laboratory Test (Blood Test)',
    date: 'Verified visit • 3 weeks ago',
    quote: 'First-class medical diagnostics. From the digital SMS reminder to instant online checkout and minimal wait time in the lounge, the entire experience felt respectful, organized, and modern. Focus Imaging sets the standard.',
    verified: true,
  },
  {
    id: 5,
    name: 'Dr. Marcus Vance',
    role: 'Referring Physician & Patient',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop',
    initials: 'MV',
    avatarBg: 'bg-teal-600',
    rating: 5,
    service: 'Ultrasound & Pathology',
    date: 'Verified referral & patient • 1 month ago',
    quote: 'As a local family physician, I consistently refer patients to Focus Imaging because their diagnostic scans and laboratory calibrations are hospital-grade. When I needed imaging myself, this is the only center I trusted.',
    verified: true,
  }
];

export default function PatientTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);

  const nextTestimonial = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  // Automatic rotation timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextTestimonial();
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused, nextTestimonial]);

  const current = TESTIMONIALS[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 32 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 32 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <section id="testimonials" className="py-20 md:py-28 relative overflow-hidden">
      {/* Subtle background glow element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/5 dark:bg-blue-400/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Heart size={13} className="text-red-500 fill-red-500" />
            <span>Patient Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Trusted by Thousands of Patients & Families
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Real feedback from patients who experienced our gentle care, certified radiologists, and rapid diagnostic turnaround.
          </p>

          {/* Aggregate Trust Metrics Strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-slate-800 dark:text-white ml-1">4.9 / 5.0</span>
              <span className="text-slate-400 dark:text-slate-500">(1,240+ Reviews)</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>100% Verified Diagnostic Reports</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
              <Sparkles size={16} className="text-blue-500" />
              <span>Certified Radiologists & Lab</span>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          className="max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative glass rounded-3xl p-6 sm:p-10 md:p-12 border border-white/60 dark:border-slate-800 shadow-xl bg-white/75 dark:bg-slate-900/80 backdrop-blur-md">
            
            {/* Top decorative quotation & service badge */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
                <Quote size={24} className="rotate-180 opacity-80" />
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100/80 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <CheckCircle2 size={13} className="text-blue-600 dark:text-blue-400" />
                  {current.service}
                </span>
                <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800">
                  {current.date}
                </span>
              </div>
            </div>

            {/* Testimonial Content Animated Slider */}
            <div className="min-h-[160px] sm:min-h-[140px] flex items-center">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full"
                >
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400 mb-4" aria-label={`${current.rating} out of 5 stars`}>
                    {[...Array(current.rating)].map((_, i) => (
                      <Star key={i} size={18} className="fill-amber-400 text-amber-400 drop-shadow-2xs" />
                    ))}
                  </div>

                  {/* Quote Text */}
                  <blockquote className="text-lg sm:text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed sm:leading-snug">
                    "{current.quote}"
                  </blockquote>

                  {/* Patient Profile */}
                  <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={current.avatar}
                          alt={current.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                          onError={(e) => {
                            // Fallback to initials avatar if image loading fails
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                        <div
                          style={{ display: 'none' }}
                          className={`w-12 h-12 rounded-full text-white font-bold text-sm items-center justify-center ${current.avatarBg} shadow-sm`}
                        >
                          {current.initials}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900" title="Verified Patient">
                          <CheckCircle2 size={12} strokeWidth={3} />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                          {current.name}
                          <span className="inline-block sm:hidden text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded">
                            Verified
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {current.role}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:block hidden">
                      <span className="text-xs text-slate-400 dark:text-slate-500 block">Experience Rating</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        100% Recommended
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls Bar: Navigation Arrows, Dots, Pause Indicator */}
            <div className="mt-8 pt-4 flex items-center justify-between gap-4">
              {/* Pagination Dots */}
              <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial slides">
                {TESTIMONIALS.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setDirection(idx > currentIndex ? 1 : -1);
                      setCurrentIndex(idx);
                    }}
                    role="tab"
                    aria-selected={currentIndex === idx}
                    aria-label={`Go to testimonial ${idx + 1} from ${item.name}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      currentIndex === idx
                        ? 'w-8 h-2.5 bg-blue-600 dark:bg-blue-400'
                        : 'w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons: Prev, Play/Pause Toggle, Next */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  title={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
                >
                  {isPaused ? <Play size={15} /> : <Pause size={15} />}
                </button>

                <button
                  type="button"
                  onClick={prevTestimonial}
                  aria-label="Previous testimonial"
                  className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-200 dark:hover:border-blue-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={nextTestimonial}
                  aria-label="Next testimonial"
                  className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-200 dark:hover:border-blue-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Social Proof Footer Callout */}
          <div className="mt-8 text-center">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Need personalized diagnostic assistance?{' '}
              <a
                href="#book"
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Schedule your appointment now <ChevronRight size={14} />
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
