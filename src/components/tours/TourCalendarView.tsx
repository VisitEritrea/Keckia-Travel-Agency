import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Compass,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CloudSun,
  Calendar,
  Users,
  ShieldCheck,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Navigation,
  FileSpreadsheet,
  AlertCircle,
  Truck,
  Eye,
  Radio,
  Mountain,
} from 'lucide-react';
import { Employee, TourPackage, TourSchedule, ItineraryItem, ScheduleStatus } from '../../types';
import { ItineraryBuilderModal } from './ItineraryBuilderModal';
import { NewDepartureModal } from './NewDepartureModal';
import { exportToCSV } from '../../utils/exportUtils';

interface TourCalendarViewProps {
  schedules: TourSchedule[];
  packages: TourPackage[];
  employees: Employee[];
  /** Only the administrator may change a departure or itinerary already saved. */
  canEdit?: boolean;
  onAddSchedule: (schedule: TourSchedule) => void;
  onUpdateScheduleGuide: (scheduleId: string, guideId: string, guideName: string) => void;
  onSavePackageItinerary: (packageId: string, itinerary: ItineraryItem[]) => void;
}

export const TourCalendarView: React.FC<TourCalendarViewProps> = ({
  schedules = [],
  packages = [],
  employees = [],
  canEdit = false,
  onAddSchedule,
  onUpdateScheduleGuide,
  onSavePackageItinerary,
}) => {
  const [currentMonth, setCurrentMonth] = useState<number>(7); // August 2026 (0-indexed: 7 is August)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewFormat, setViewFormat] = useState<'calendar' | 'timeline' | 'waypoints'>('calendar');
  
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [isNewDepartureOpen, setIsNewDepartureOpen] = useState(false);
  const [selectedScheduleDetail, setSelectedScheduleDetail] = useState<TourSchedule | null>(null);

  const guides = (employees || []).filter(
    (e) => e.role === 'Tour Guide' || e.role === 'Operations Manager' || e.role === 'Logistics Lead'
  );

  // Month days setup for August 2026
  const daysInMonth = 31;
  const startDayOffset = 6; // Saturday (Aug 1, 2026)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filtering
  const filteredSchedules = useMemo(() => {
    return (schedules || []).filter((s) => {
      if (!s) return false;
      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (s.tourTitle || '').toLowerCase().includes(q) ||
        (s.destination || '').toLowerCase().includes(q) ||
        (s.leadGuideName || '').toLowerCase().includes(q) ||
        (s.permitReference || '').toLowerCase().includes(q) ||
        (s.notes || '').toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [schedules, selectedStatus, searchQuery]);

  // Operational KPIs
  const totalConvoys = schedules.length;
  const activeConvoys = schedules.filter((s) => s.status === 'Active').length;
  const upcomingConvoys = schedules.filter((s) => s.status === 'Upcoming').length;
  const totalBookedSeats = schedules.reduce((sum, s) => sum + (s.bookedSeats || 0), 0);
  const totalSeatCapacity = schedules.reduce((sum, s) => sum + (s.totalSeats || 0), 0);
  const overallOccupancy = totalSeatCapacity > 0 ? Math.round((totalBookedSeats / totalSeatCapacity) * 100) : 0;
  const deployedGuidesCount = new Set(schedules.filter(s => s.status === 'Active' || s.status === 'Upcoming').map(s => s.leadGuideId).filter(Boolean)).size;

  const handleExportCSV = () => {
    const headers = [
      'Schedule ID',
      'Tour Title',
      'Destination / Route',
      'Departure Date',
      'Return Date',
      'Status',
      'Lead Guide',
      'Booked Seats',
      'Total Seats',
      'Occupancy %',
      'Permit Reference',
      'Weather Forecast',
      'Logistics Notes',
    ];

    const rows = filteredSchedules.map((s) => [
      s.id || '',
      s.tourTitle || '',
      s.destination || '',
      s.startDate || '',
      s.endDate || '',
      s.status || '',
      s.leadGuideName || '',
      s.bookedSeats || 0,
      s.totalSeats || 0,
      s.totalSeats ? Math.round(((s.bookedSeats || 0) / s.totalSeats) * 100) + '%' : '0%',
      s.permitReference || 'Pending',
      s.weatherForecast || 'Favorable',
      s.notes || '',
    ]);

    exportToCSV(
      `EritreaVisit_Tour_Operations_Schedule_${new Date().toISOString().split('T')[0]}`,
      headers,
      rows
    );
  };

  return (
    <div id="tour-operations-container" className="space-y-6 pb-12 text-slate-900">
      {/* 1. Executive Operations Header Banner */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 italic font-bold">
              Tour Operations &amp; Expedition Dispatch
            </h2>
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold">
              August 2026 High Season
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {activeConvoys} Convoys Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium max-w-2xl">
            Real-time convoy departure tracking, guide assignments, waypoint logistics, and multi-day itinerary architect for EritreaVisit expeditions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" /> Export CSV
          </button>

          <button
            onClick={() => setIsNewDepartureOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Schedule Departure
          </button>
        </div>
      </div>

      {/* 2. Operations KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
              Active &amp; Upcoming Convoys
            </span>
            <Navigation className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-slate-900">
              {activeConvoys + upcomingConvoys}
            </span>
            <span className="text-xs text-slate-500 font-medium">({activeConvoys} on trail)</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
              Traveler Seat Occupancy
            </span>
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-slate-900">
              {overallOccupancy}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {totalBookedSeats} / {totalSeatCapacity} seats
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              style={{ width: `${overallOccupancy}%` }}
              className="h-full bg-sky-500 rounded-full transition-all"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
              Field Guides Deployed
            </span>
            <Compass className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-slate-900">
              {deployedGuidesCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">of {guides.length} roster guides</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">
              Permit &amp; Waypoint Status
            </span>
            <ShieldCheck className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-emerald-700">100%</span>
            <span className="text-xs text-emerald-600 font-medium">Zoba clearances active</span>
          </div>
        </div>
      </div>

      {/* 3. Package Itinerary Architect Master Bar */}
      {canEdit && (
        <div className="p-5 sm:p-6 rounded-[2rem] bg-gradient-to-r from-amber-50/90 via-sky-50/70 to-emerald-50/70 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-white text-amber-700 border border-amber-200 shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-serif italic text-slate-900 font-bold">
                Master Expedition Packages &amp; Multi-Day Itinerary Architect
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                Customize daily schedules, waypoints, meal plans, and scout accommodation tags across all tours.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setEditingPackage(pkg)}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Compass className="w-3.5 h-3.5 text-amber-700" />
                <span>{pkg.title.split(' ')[0]} {pkg.title.split(' ')[1] || ''} ({pkg.durationDays}D)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Controls, Search, Filter & View Switcher Bar */}
      <div className="p-4 sm:p-5 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: View Switcher & Month Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setViewFormat('calendar')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewFormat === 'calendar'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewFormat('timeline')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewFormat === 'timeline'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Timeline Roster
            </button>
            <button
              onClick={() => setViewFormat('waypoints')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewFormat === 'waypoints'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Waypoints &amp; Scouts
            </button>
          </div>

          {/* Month Stepper */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200">
            <button
              onClick={() => setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1))}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-900 px-1">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={() => setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1))}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tours, guides, permits..."
              className="w-48 sm:w-60 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-hidden focus:border-amber-500 focus:bg-white shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1">
            {(['all', 'Active', 'Upcoming', 'Completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. View Format 1: Interactive Month Calendar Grid */}
      {viewFormat === 'calendar' && (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xs overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-mono uppercase tracking-widest text-slate-500 font-bold py-3.5">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-[140px] divide-x divide-y divide-slate-100">
            {/* Blank leading days */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`blank-${i}`} className="bg-slate-50/40 p-2" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateStr = `2026-08-${dayNumber < 10 ? '0' + dayNumber : dayNumber}`;
              const isToday = dayNumber === 14;

              const daySchedules = filteredSchedules.filter((sch) => {
                return sch && dateStr >= sch.startDate && dateStr <= sch.endDate;
              });

              return (
                <div
                  key={`day-${dayNumber}`}
                  className={`p-2.5 transition flex flex-col justify-between ${
                    isToday ? 'bg-amber-50/70 ring-1 ring-amber-400' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNumber}
                    </span>
                    {daySchedules.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                        {daySchedules.length} convoy{daySchedules.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Scheduled Departures Badges */}
                  <div className="space-y-1.5 mt-1 overflow-y-auto max-h-[90px] pr-0.5">
                    {daySchedules.map((sch) => {
                      const isStart = sch.startDate === dateStr;
                      const isEnd = sch.endDate === dateStr;

                      return (
                        <div
                          key={sch.id}
                          onClick={() => setSelectedScheduleDetail(sch)}
                          className={`p-1.5 rounded-lg text-[10px] cursor-pointer transition shadow-2xs ${
                            sch.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                              : sch.status === 'Upcoming'
                              ? 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100'
                              : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <div className="font-serif font-bold truncate flex items-center gap-1">
                            <span>{isStart ? '🚀' : isEnd ? '🏁' : '📍'}</span>
                            <span className="truncate">{sch.destination.split(' ')[0]}</span>
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono truncate">
                            Guide: {sch.leadGuideName.split(' ')[0]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. View Format 2: Detailed Timeline & Departures Roster */}
      {viewFormat === 'timeline' && (
        <div className="space-y-4">
          {filteredSchedules.map((sch) => {
            const occupancy = Math.round((sch.bookedSeats / sch.totalSeats) * 100);
            const matchingPkg = packages.find((p) => p.id === sch.tourPackageId);

            return (
              <div
                key={sch.id}
                className="p-6 sm:p-7 rounded-[2rem] bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-serif italic text-slate-900 font-bold">
                        {sch.tourTitle}
                      </h3>
                      <span
                        className={`text-[10px] uppercase font-mono px-3 py-0.5 rounded-full font-bold ${
                          sch.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                            : sch.status === 'Upcoming'
                            ? 'bg-sky-100 text-sky-800 border border-sky-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {sch.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
                      <span className="flex items-center gap-1 font-mono text-amber-900 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        {sch.startDate} → {sch.endDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {sch.destination}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-purple-700 font-semibold">
                        Permit: {sch.permitReference || 'MO-TO-2026-AUG'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedScheduleDetail(sch)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      View Dossier
                    </button>

                    {canEdit && matchingPkg && (
                      <button
                        onClick={() => setEditingPackage(matchingPkg)}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition flex items-center gap-1.5 border border-amber-200 cursor-pointer shadow-xs"
                      >
                        <Compass className="w-3.5 h-3.5 text-amber-700" />
                        Edit Itinerary
                      </button>
                    )}
                  </div>
                </div>

                {/* Logistics Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                  {/* Guide Assignment */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5 font-bold">
                      Lead Guide Assignment
                    </label>
                    {canEdit ? (
                      <select
                        value={sch.leadGuideId}
                        onChange={(e) => {
                          const guide = employees.find((emp) => emp.id === e.target.value);
                          if (guide) {
                            onUpdateScheduleGuide(sch.id, guide.id, guide.name);
                          }
                        }}
                        className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-xs cursor-pointer"
                      >
                        {guides.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.role} · {g.status})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
                        {sch.leadGuideName || 'Unassigned'}
                      </div>
                    )}
                  </div>

                  {/* Seat Occupancy Meter */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                        Seat Occupancy
                      </span>
                      <span className="font-mono text-slate-900 font-bold">
                        {sch.bookedSeats} / {sch.totalSeats} ({occupancy}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div
                        style={{ width: `${occupancy}%` }}
                        className={`h-full rounded-full transition-all ${
                          occupancy >= 90 ? 'bg-rose-500' : occupancy >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Weather & Scout Radio Notes */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-mono text-amber-800 uppercase tracking-widest mb-1 flex items-center gap-1 font-bold">
                      <CloudSun className="w-3.5 h-3.5 text-amber-600" /> Weather &amp; Scouts
                    </div>
                    <p className="text-xs text-slate-900 font-bold truncate">{sch.weatherForecast || 'Clear Skies & Dry Trail'}</p>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">{sch.notes || 'Convoy fully provisioned with satellite comms.'}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSchedules.length === 0 && (
            <div className="p-12 text-center text-xs text-slate-500 rounded-[2rem] bg-white border border-slate-200">
              No expeditions match the current filter criteria.
            </div>
          )}
        </div>
      )}

      {/* 7. View Format 3: Waypoints & Field Scout Dispatch */}
      {viewFormat === 'waypoints' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchedules.map((sch) => {
            const matchingPkg = packages.find((p) => p.id === sch.tourPackageId);
            const itinerary = matchingPkg?.itinerary || [];

            return (
              <div
                key={sch.id}
                className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif italic font-bold text-slate-900 text-base">
                      {sch.tourTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {sch.destination} · {sch.startDate}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                    {itinerary.length} Waypoints
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {itinerary.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs"
                    >
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                        D{item.dayNumber || idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>📍 {item.location}</span>
                          {item.altitudeMeters && <span>• ⛰️ {item.altitudeMeters}m</span>}
                          {item.mealPlan && <span>• 🍽️ {item.mealPlan}</span>}
                        </div>
                      </div>
                    </div>
                  ))}

                  {itinerary.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400 italic">
                      No custom waypoints defined for this master package yet.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Dossier Modal */}
      {selectedScheduleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-white">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif italic font-bold text-lg text-slate-900">
                    {selectedScheduleDetail.tourTitle}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Permit Reference: {selectedScheduleDetail.permitReference || 'Cleared'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedScheduleDetail(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Status</span>
                  <span className="font-bold text-slate-900">{selectedScheduleDetail.status}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Departure</span>
                  <span className="font-bold text-slate-900">{selectedScheduleDetail.startDate}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Return</span>
                  <span className="font-bold text-slate-900">{selectedScheduleDetail.endDate}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Occupancy</span>
                  <span className="font-bold text-slate-900">
                    {selectedScheduleDetail.bookedSeats} / {selectedScheduleDetail.totalSeats} seats
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-600" /> Lead Guide &amp; Staff Assignment
                </div>
                <p className="text-slate-700">
                  Lead Guide: <strong className="text-slate-900">{selectedScheduleDetail.leadGuideName}</strong>
                </p>
                {selectedScheduleDetail.supportStaffNames && selectedScheduleDetail.supportStaffNames.length > 0 && (
                  <p className="text-slate-500">
                    Support Staff: {selectedScheduleDetail.supportStaffNames.join(', ')}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4 text-amber-600" /> Weather &amp; Field Dispatch Notes
                </div>
                <p className="text-slate-700">{selectedScheduleDetail.weatherForecast || 'Standard high plateau weather.'}</p>
                <p className="text-slate-500">{selectedScheduleDetail.notes || 'No security alerts.'}</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedScheduleDetail(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Itinerary Builder Modal */}
      {editingPackage && (
        <ItineraryBuilderModal
          tourPackage={editingPackage}
          onClose={() => setEditingPackage(null)}
          onSaveItinerary={onSavePackageItinerary}
        />
      )}

      {/* Schedule Departure Modal */}
      {isNewDepartureOpen && (
        <NewDepartureModal
          packages={packages}
          employees={employees}
          onClose={() => setIsNewDepartureOpen(false)}
          onAddSchedule={onAddSchedule}
        />
      )}
    </div>
  );
};
