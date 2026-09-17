import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Calendar, Layers, CheckCircle2, Clock } from 'lucide-react';
import { Appointment } from '../types';

interface AnalyticsProps {
  appointments: Appointment[];
}

const SERVICE_COLORS = [
  '#2563eb', // Blue
  '#4f46e5', // Indigo
  '#0d9488', // Teal
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4'  // Cyan
];

export default function AppointmentsAnalytics({ appointments }: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'service' | 'timeline'>('service');

  // Service distribution aggregation
  const serviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((appt) => {
      const service = appt.test?.trim() || 'General Consultation';
      counts[service] = (counts[service] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count], index) => ({
      name,
      count,
      color: SERVICE_COLORS[index % SERVICE_COLORS.length]
    })).sort((a, b) => b.count - a.count);
  }, [appointments]);

  // Daily timeline aggregation
  const dailyData = useMemo(() => {
    const map: Record<string, { date: string; total: number; pending: number; completed: number }> = {};

    appointments.forEach((appt) => {
      const d = appt.date || 'Unspecified Date';
      if (!map[d]) {
        map[d] = { date: d, total: 0, pending: 0, completed: 0 };
      }
      map[d].total += 1;
      if (appt.status === 'Pending') map[d].pending += 1;
      if (appt.status === 'Completed') map[d].completed += 1;
    });

    return Object.values(map).sort((a, b) => {
      if (a.date === 'Unspecified Date') return 1;
      if (b.date === 'Unspecified Date') return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [appointments]);

  if (appointments.length === 0) {
    return null;
  }

  return (
    <div className="glass rounded-3xl p-4 sm:p-8 mb-8 border border-white/60 dark:border-slate-800/80 shadow-xl bg-white/70 dark:bg-slate-900/80 backdrop-blur-md">
      {/* Widget Header & Toggle Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BarChart3 size={18} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Appointments Analytics</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual breakdown of appointments by medical service and schedule timeline
          </p>
        </div>

        <div className="grid grid-cols-2 sm:inline-flex rounded-xl p-1 bg-slate-100/90 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('service')}
            className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'service'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers size={14} /> <span>By Service</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar size={14} /> <span>By Date / Day</span>
          </button>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="pt-6">
        {activeTab === 'service' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Bar Chart View */}
            <div className="lg:col-span-7 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={serviceData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    tick={({ x, y, payload }) => {
                      const words = payload.value.split(' ');
                      const short = words.length > 2 ? `${words[0]} ${words[1]}...` : payload.value;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text
                            x={0}
                            y={0}
                            dy={12}
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize={10}
                            fontWeight={600}
                          >
                            {short}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700 space-y-1">
                            <p className="font-bold text-slate-100">{data.name}</p>
                            <div className="flex items-center justify-between gap-4 text-slate-300">
                              <span>Appointments:</span>
                              <span className="font-bold text-blue-400">{data.count}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {((data.count / appointments.length) * 100).toFixed(0)}% of total volume
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart / Service Legend Breakdown */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white text-xs rounded-xl p-2.5 shadow-xl border border-slate-700">
                              <p className="font-bold">{data.name}</p>
                              <p className="text-blue-400 font-semibold">{data.count} bookings</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Service item legend list */}
              <div className="max-h-36 overflow-y-auto space-y-2 pr-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                {serviceData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between pt-1.5 first:pt-0">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{item.count}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        ({((item.count / appointments.length) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Timeline by Date View */
          <div className="space-y-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.4} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tick={({ x, y, payload }) => (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={14}
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize={10}
                          fontWeight={600}
                        >
                          {payload.value}
                        </text>
                      </g>
                    )}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700 space-y-1.5">
                            <p className="font-bold text-slate-100 flex items-center gap-1.5">
                              <Calendar size={13} className="text-blue-400" /> {data.date}
                            </p>
                            <div className="flex justify-between gap-4 text-slate-300">
                              <span>Total Scheduled:</span>
                              <strong className="text-white">{data.total}</strong>
                            </div>
                            <div className="flex justify-between gap-4 text-emerald-400">
                              <span>Completed:</span>
                              <strong>{data.completed}</strong>
                            </div>
                            <div className="flex justify-between gap-4 text-amber-400">
                              <span>Pending Action:</span>
                              <strong>{data.pending}</strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                  />
                  <Bar name="Completed" dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} stackId="a" />
                  <Bar name="Pending" dataKey="pending" fill="#f59e0b" radius={[6, 6, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-amber-500" /> Stacked bars show completed vs pending visits per date
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {dailyData.length} scheduled {dailyData.length === 1 ? 'date' : 'dates'} recorded
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
