import React, { useState, useEffect } from 'react';
import { Activity, Heart, Radio } from 'lucide-react';

interface HeartbeatPulseProps {
  className?: string;
}

/**
 * Continuous, dynamic, realistic cardiac cycle coordinates (100px wide, Y-baseline at 24)
 * P-wave (4-19, peak at 19), Q-dip (26, dip to 27.5), R-spike (31, sharp peak at 3.5),
 * S-dip (36, sharp drop to 43.5), T-wave (44-71, smooth rounded peak at 14),
 * U-wave / diastolic wave (71-88, gentle wave at 21.5), and short 12px recovery (88-100).
 * Minimal flat pause to maintain active, dynamic, continuous pulse flow.
 */
export const ECG_SINGLE_CYCLE = 
  'M 0 24 L 4 24 C 7 24 9 19 12 19 C 15 19 16 24 19 24 L 23 24 L 26 27.5 L 31 3.5 L 36 43.5 L 40 24 L 44 24 C 49 24 53 14 58 14 C 63 14 66 24 71 24 C 74 24 77 21.5 80 21.5 C 83 21.5 86 24 88 24 L 100 24';

// 8 continuously looping cardiac cycles across 800px width with no dead flat stretches
const generateContinuousEkgPath = (cycles = 8, cycleWidth = 100): string => {
  let path = 'M 0 24';
  for (let i = 0; i < cycles; i++) {
    const k = i * cycleWidth;
    path += ` L ${k + 4} 24` +
      ` C ${k + 7} 24 ${k + 9} 19 ${k + 12} 19` +
      ` C ${k + 15} 19 ${k + 16} 24 ${k + 19} 24` +
      ` L ${k + 23} 24` +
      ` L ${k + 26} 27.5` +
      ` L ${k + 31} 3.5` +
      ` L ${k + 36} 43.5` +
      ` L ${k + 40} 24` +
      ` L ${k + 44} 24` +
      ` C ${k + 49} 24 ${k + 53} 14 ${k + 58} 14` +
      ` C ${k + 63} 14 ${k + 66} 24 ${k + 71} 24` +
      ` C ${k + 74} 24 ${k + 77} 21.5 ${k + 80} 21.5` +
      ` C ${k + 83} 21.5 ${k + 86} 24 ${k + 88} 24` +
      ` L ${k + 100} 24`;
  }
  return path;
};

export const ECG_FULL_PATH = generateContinuousEkgPath(8, 100);

/**
 * Header EKG Pulse Line
 * Sits along the bottom border of the navbar with a continuous, seamless bright red glowing heartbeat wave & traveling scanner
 */
export function HeaderHeartbeatLine({ className = '' }: HeartbeatPulseProps) {
  return (
    <div className={`relative w-full h-[18px] sm:h-[22px] overflow-hidden bg-gradient-to-r from-red-950/20 via-slate-900/10 to-red-950/20 border-t border-b border-red-500/20 ${className}`}>
      {/* Background static faint red baseline */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-[1px] bg-red-500/20" />
      </div>

      {/* Seamless scrolling dual-waveform in bright red with relaxed speed */}
      <div className="absolute inset-0 flex w-[200%] animate-ekg-flow pointer-events-none">
        <div className="w-1/2 h-full">
          <svg viewBox="0 0 800 48" preserveAspectRatio="none" className="w-full h-full neon-pulse-glow">
            <defs>
              <linearGradient id="headerEkgRedGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f87171" stopOpacity="0.5" />
                <stop offset="35%" stopColor="#ef4444" stopOpacity="0.95" />
                <stop offset="65%" stopColor="#ff1744" stopOpacity="1" />
                <stop offset="85%" stopColor="#ef4444" stopOpacity="1" />
                <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <path
              d={ECG_FULL_PATH}
              fill="none"
              stroke="url(#headerEkgRedGrad1)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="w-1/2 h-full">
          <svg viewBox="0 0 800 48" preserveAspectRatio="none" className="w-full h-full neon-pulse-glow">
            <path
              d={ECG_FULL_PATH}
              fill="none"
              stroke="url(#headerEkgRedGrad1)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Sweeping Laser Scanner Beam (Red) */}
      <div className="absolute inset-y-0 w-24 sm:w-36 pointer-events-none animate-scan-line bg-gradient-to-r from-transparent via-red-500/35 to-transparent blur-xs" />
    </div>
  );
}

/**
 * Hero EKG Monitor Widget
 * High-tech hospital telemetry display with real-time waveform, relaxed bright red heartbeat pulse, and diagnostic metrics
 */
export function HeroEkgMonitor({ className = '' }: HeartbeatPulseProps) {
  const [bpm, setBpm] = useState(72);

  // Subtle real-time heart rate variation (71 - 74 BPM)
  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return Math.min(Math.max(next, 70), 75);
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative rounded-3xl overflow-hidden bg-slate-950/95 text-slate-100 border border-red-500/30 shadow-2xl shadow-red-950/50 backdrop-blur-xl ${className}`}>
      {/* Top Telemetry Status Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-red-500/20 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-red-500 relative" />
          </div>
          <span className="font-mono text-[11px] font-bold tracking-widest text-red-400 uppercase">
            CARDIAC TELEMETRY
          </span>
          <span className="hidden sm:inline-block text-slate-500 text-[10px] font-mono">|</span>
          <span className="hidden sm:inline-block text-slate-400 text-[11px] font-mono">LEAD II • CONTINUOUS</span>
        </div>

        {/* BPM & Heart Rate Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300">
            <Heart size={14} className="text-red-500 fill-red-500 animate-heart-thump shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-black tracking-tight text-white">{bpm}</span>
            <span className="text-[10px] font-mono text-red-400 uppercase">BPM</span>
          </div>
          <div className="hidden xs:flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <span className="text-emerald-400 font-bold">NORMAL SINUS</span>
          </div>
        </div>
      </div>

      {/* Main EKG Oscilloscope Screen */}
      <div className="relative h-28 sm:h-36 w-full ekg-grid overflow-hidden flex items-center">
        {/* Glow ambient background aura (Bright Red) */}
        <div className="absolute inset-0 bg-radial from-red-950/35 via-transparent to-transparent pointer-events-none" />

        {/* Sweep scanner beam line */}
        <div className="absolute inset-y-0 w-28 sm:w-40 pointer-events-none animate-scan-line bg-gradient-to-r from-transparent via-red-500/25 to-red-400/45 blur-[2px] z-10" />

        {/* Animated Moving Waveform in Bright Red */}
        <div className="w-[200%] h-full flex animate-ekg-flow">
          <div className="w-1/2 h-full relative">
            <svg viewBox="0 0 800 48" preserveAspectRatio="none" className="w-full h-full neon-pulse-glow">
              <defs>
                <linearGradient id="ekgRedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                  <stop offset="25%" stopColor="#ff1744" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#ff003b" stopOpacity="1" />
                  <stop offset="80%" stopColor="#ff1744" stopOpacity="1" />
                  <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.7" />
                </linearGradient>
                <filter id="heroEkgRedGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d={ECG_FULL_PATH}
                fill="none"
                stroke="url(#ekgRedGrad)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#heroEkgRedGlow)"
              />
            </svg>
          </div>
          <div className="w-1/2 h-full relative">
            <svg viewBox="0 0 800 48" preserveAspectRatio="none" className="w-full h-full neon-pulse-glow">
              <path
                d={ECG_FULL_PATH}
                fill="none"
                stroke="url(#ekgRedGrad)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#heroEkgRedGlow)"
              />
            </svg>
          </div>
        </div>

        {/* Oscilloscope Center Grid Baseline */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-red-500/20 pointer-events-none" />

        {/* Live Pulse Point Indicator */}
        <div className="absolute right-4 top-3 hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-[10px] font-mono text-slate-300">
          <Radio size={10} className="text-red-400 animate-pulse" />
          <span>ACTIVE PULSE</span>
        </div>
      </div>

      {/* Bottom Diagnostic Metrics strip */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-t border-red-500/20 grid grid-cols-3 sm:grid-cols-4 gap-2 text-center text-[11px] font-mono">
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-400 uppercase">SpO2 Oxygen</span>
          <span className="font-bold text-emerald-400">99%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-400 uppercase">Respiration</span>
          <span className="font-bold text-rose-400">16 rpm</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-400 uppercase">Cardiac Rhythm</span>
          <span className="font-bold text-red-400">Dynamic</span>
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-[9px] text-slate-400 uppercase">Scan Rate</span>
          <span className="font-bold text-amber-300">60 fps</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact EKG Pill for Badges and Hero headers
 */
export function PulseBadgeWave({ className = '' }: HeartbeatPulseProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50/90 dark:bg-red-950/40 border border-red-200/80 dark:border-red-800/60 shadow-xs ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
      </span>
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-800 dark:text-red-300">
        Live Cardiac Care
      </span>
      <div className="w-20 h-4 overflow-hidden relative">
        <svg viewBox="0 0 200 48" preserveAspectRatio="none" className="w-full h-full">
          <path
            d={ECG_SINGLE_CYCLE + ' ' + ECG_SINGLE_CYCLE.replace(/M 0 24/, '').replace(/L (\d+)/g, (match, p1) => `L ${Number(p1) + 100}`).replace(/C (\d+) (\d+) (\d+) (\d+) (\d+) (\d+)/g, (match, p1, p2, p3, p4, p5, p6) => `C ${Number(p1) + 100} ${p2} ${Number(p3) + 100} ${p4} ${Number(p5) + 100} ${p6}`)}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

