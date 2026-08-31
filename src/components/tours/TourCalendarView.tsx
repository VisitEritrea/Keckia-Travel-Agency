import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
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
  Car,
  Eye,
  Radio,
  Mountain,
  Filter,
  Check,
  UserCheck,
  BedDouble,
  Layers,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { Employee, TourPackage, TourSchedule, ItineraryItem, ScheduleStatus } from '../../types';
import { ItineraryBuilderModal } from './ItineraryBuilderModal';
import { exportToCSV } from '../../utils/exportUtils';

interface TourCalendarViewProps {
  schedules: TourSchedule[];
  packages: TourPackage[];
  employees: Employee[];
  /** Only the administrator may change a departure or itinerary already saved. */
  canEdit?: boolean;
  onAddSchedule?: (schedule: TourSchedule) => void;
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
  // Current calendar view date state (Default to August 2026 or current active schedule)
  const initialDate = useMemo(() => {
    if (schedules.length > 0 && schedules[0].startDate) {
      const parts = schedules[0].startDate.split('-');
      if (parts.length === 3) {
        return {
          month: parseInt(parts[1], 10) - 1,
          year: parseInt(parts[0], 10),
        };
      }
    }
    return { month: 7, year: 2026 }; // August 2026
  }, [schedules]);

  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.month);
  const [currentYear, setCurrentYear] = useState<number>(initialDate.year);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGuideId, setSelectedGuideId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewFormat, setViewFormat] = useState<'calendar' | 'week' | 'timeline' | 'waypoints'>('calendar');

  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [selectedScheduleDetail, setSelectedScheduleDetail] = useState<TourSchedule | null>(null);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Dynamic days calculation for the currently selected month and year
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const startDayOffset = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  const guides = useMemo(() => {
    return (employees || []).filter(
      (e) =>
        e.role === 'Tour Guide' ||
        e.role === 'Operations Manager' ||
        e.role === 'Logistics Lead' ||
        e.departmentName?.toLowerCase().includes('tour') ||
        e.departmentName?.toLowerCase().includes('operation')
    );
  }, [employees]);

  // Identify months with active tour schedules for quick navigation pills
  const monthsWithTours = useMemo(() => {
    const map = new Map<string, { year: number; month: number; label: string; count: number }>();
    (schedules || []).forEach((sch) => {
      if (!sch.startDate) return;
      const parts = sch.startDate.split('-');
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const key = `${y}-${m}`;
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(key, {
            year: y,
            month: m,
            label: `${monthNames[m]} ${y}`,
            count: 1,
          });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
  }, [schedules, monthNames]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    // Default to August 2026 or current active demo year
    setCurrentMonth(7);
    setCurrentYear(2026);
  };

  // Filtering schedules
  const filteredSchedules = useMemo(() => {
    return (schedules || []).filter((s) => {
      if (!s) return false;
      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
      const matchesGuide = selectedGuideId === 'all' || s.leadGuideId === selectedGuideId;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (s.tourTitle || '').toLowerCase().includes(q) ||
        (s.destination || '').toLowerCase().includes(q) ||
        (s.leadGuideName || '').toLowerCase().includes(q) ||
        (s.permitReference || '').toLowerCase().includes(q) ||
        (s.notes || '').toLowerCase().includes(q);

      return matchesStatus && matchesGuide && matchesSearch;
    });
  }, [schedules, selectedStatus, selectedGuideId, searchQuery]);

  // Filtered schedules that fall within the currently viewed month
  const currentMonthSchedules = useMemo(() => {
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    return filteredSchedules.filter((sch) => {
      if (!sch.startDate) return false;
      const startMonth = sch.startDate.substring(0, 7);
      const endMonth = (sch.endDate || sch.startDate).substring(0, 7);
      return startMonth <= monthStr && endMonth >= monthStr;
    });
  }, [filteredSchedules, currentYear, currentMonth]);

  // Operational KPIs
  const totalConvoys = schedules.length;
  const activeConvoys = schedules.filter((s) => s.status === 'Active').length;
  const upcomingConvoys = schedules.filter((s) => s.status === 'Upcoming').length;
  const totalBookedSeats = schedules.reduce((sum, s) => sum + (s.bookedSeats || 0), 0);
  const totalSeatCapacity = schedules.reduce((sum, s) => sum + (s.totalSeats || 0), 0);
  const overallOccupancy = totalSeatCapacity > 0 ? Math.round((totalBookedSeats / totalSeatCapacity) * 100) : 0;
  const deployedGuidesCount = new Set(
    schedules.filter((s) => s.status === 'Active' || s.status === 'Upcoming').map((s) => s.leadGuideId).filter(Boolean)
  ).size;

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
      `EritreaVisit_Tour_Operations_Schedule_${monthNames[currentMonth]}_${currentYear}`,
      headers,
      rows
    );
  };

  return (
    <div id="tour-operations-container" className="space-y-6 pb-12 text-slate-900">
      {/* 1. Executive Operations Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 italic font-bold">
              Tour Schedules &amp; Expedition Dispatch
            </h2>
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold">
              Live Logistics Operations · {monthNames[currentMonth]} {currentYear}
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Interactive multi-month expedition dispatcher, convoy tracking, real-time client sync, guide assignments, and Ministry of Tourism permit verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Download Schedule Report"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive KPI Operations Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-bold">
              Total Convoys
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">{totalConvoys} Tours</div>
          <p className="text-xs text-slate-500 font-medium">
            {currentMonthSchedules.length} active in {monthNames[currentMonth]}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-700 uppercase tracking-wider font-bold">
              Active in Field
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-700">{activeConvoys} Convoys</div>
          <p className="text-xs text-slate-500 font-medium">{upcomingConvoys} upcoming departures</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-blue-700 uppercase tracking-wider font-bold">
              Seat Occupancy
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">{overallOccupancy}%</div>
          <p className="text-xs text-slate-500 font-medium">
            {totalBookedSeats} of {totalSeatCapacity} seats booked
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-amber-700 uppercase tracking-wider font-bold">
              Deployed Guides
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-slate-900">{deployedGuidesCount} Guides</div>
          <p className="text-xs text-slate-500 font-medium">Ministry licensed personnel</p>
        </div>
      </div>

      {/* 3. Quick Navigation Bar for Months with Active Tours */}
      {monthsWithTours.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-slate-800">Quick Month Jump:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {monthsWithTours.map((m) => {
              const isSelected = m.year === currentYear && m.month === currentMonth;
              return (
                <button
                  key={`${m.year}-${m.month}`}
                  onClick={() => {
                    setCurrentYear(m.year);
                    setCurrentMonth(m.month);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span>{m.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>
                    {m.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Controls, Month Navigator, Search, Filter & View Switcher Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left: View Switcher & Month Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Switcher */}
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
              onClick={() => setViewFormat('week')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewFormat === 'week'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Week Agenda
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
              Waypoints &amp; Routes
            </button>
          </div>

          {/* Dynamic Month/Year Stepper & Dropdowns */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
              className="bg-transparent font-bold text-xs text-slate-900 px-1 py-1 focus:outline-hidden cursor-pointer"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
              className="bg-transparent font-bold text-xs text-slate-900 px-1 py-1 focus:outline-hidden cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleJumpToToday}
              className="ml-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
            >
              Today
            </button>
          </div>
        </div>

        {/* Right: Search, Guide Filter & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Guide filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedGuideId}
              onChange={(e) => setSelectedGuideId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Guides</option>
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tour, client, permit..."
              className="w-44 sm:w-56 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-hidden focus:border-amber-500 focus:bg-white shadow-2xs"
            />
          </div>

          {/* Status buttons */}
          <div className="flex items-center gap-1">
            {(['all', 'Active', 'Upcoming', 'Completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Calendar Header with Selected Day Summary */}
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold italic text-slate-900 text-base">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({currentMonthSchedules.length} total tours scheduled this month)
              </span>
            </div>
            {selectedDayDate && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-xs text-amber-900 font-medium">
                <span>Selected Date: <strong>{selectedDayDate}</strong></span>
                <button
                  onClick={() => setSelectedDayDate(null)}
                  className="text-amber-700 hover:text-amber-950 font-bold ml-1 cursor-pointer"
                >
                  ✕ Clear
                </button>
              </div>
            )}
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/70 text-center text-xs font-mono uppercase tracking-widest text-slate-600 font-bold py-3">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-[145px] divide-x divide-y divide-slate-100">
            {/* Blank leading days */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`blank-${i}`} className="bg-slate-50/50 p-2" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
              const isSelected = selectedDayDate === dateStr;

              // Compare date with tour schedule ranges
              const daySchedules = filteredSchedules.filter((sch) => {
                if (!sch || !sch.startDate) return false;
                const end = sch.endDate || sch.startDate;
                return dateStr >= sch.startDate && dateStr <= end;
              });

              return (
                <div
                  key={`day-${dayNumber}`}
                  onClick={() => setSelectedDayDate(dateStr)}
                  className={`p-2 transition flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-amber-50/90 ring-2 ring-amber-400 ring-inset'
                      : daySchedules.length > 0
                      ? 'hover:bg-slate-50/90 bg-white'
                      : 'hover:bg-slate-50/60 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-2xs'
                          : daySchedules.length > 0
                          ? 'text-slate-900 font-black'
                          : 'text-slate-600 group-hover:text-slate-900'
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {daySchedules.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {daySchedules.length} tour{daySchedules.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Scheduled Departures Badges inside Day Cell */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[96px] pr-0.5 scrollbar-thin">
                    {daySchedules.map((sch) => {
                      const isStart = sch.startDate === dateStr;
                      const isEnd = (sch.endDate || sch.startDate) === dateStr;

                      return (
                        <div
                          key={sch.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScheduleDetail(sch);
                          }}
                          className={`p-1.5 rounded-lg text-[10px] cursor-pointer transition shadow-2xs border ${
                            sch.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                              : sch.status === 'Upcoming'
                              ? 'bg-sky-50 text-sky-950 border-sky-300 hover:bg-sky-100'
                              : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <div className="font-bold truncate flex items-center justify-between gap-1">
                            <span className="truncate">
                              {isStart ? '🚀 ' : isEnd ? '🏁 ' : '📍 '}
                              {sch.tourTitle || sch.destination}
                            </span>
                            <span className="text-[9px] font-mono shrink-0">
                              {sch.bookedSeats || 1}pax
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-600 font-mono truncate flex items-center justify-between mt-0.5">
                            <span className="truncate">👤 {sch.leadGuideName ? sch.leadGuideName.split(' ')[0] : 'Guide'}</span>
                            <span className="font-bold text-[8px] uppercase">{sch.status}</span>
                          </div>
                        </div>
                      );
                    })}

                    {daySchedules.length === 0 && (
                      <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px] text-slate-400 font-medium">
                        + Click to inspect
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. View Format 2: Week Agenda View */}
      {viewFormat === 'week' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <h3 className="font-serif italic font-bold text-slate-900 text-base">
              Week Operations Agenda &amp; Convoy Schedule
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Showing active &amp; upcoming departures
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchedules.map((sch) => {
              const occupancy = sch.totalSeats
                ? Math.min(100, Math.round(((sch.bookedSeats || 0) / sch.totalSeats) * 100))
                : 100;

              return (
                <div
                  key={sch.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        sch.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sch.status === 'Upcoming'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {sch.status}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1.5">{sch.tourTitle}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-500" /> {sch.destination}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedScheduleDetail(sch)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="Inspect Dossier"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Departure</span>
                      <span className="font-bold text-slate-800">{sch.startDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Return</span>
                      <span className="font-bold text-slate-800">{sch.endDate || sch.startDate}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Lead Guide:
                      </span>
                      <span className="font-bold text-slate-900">{sch.leadGuideName || 'Unassigned'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-600" /> Travelers:
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {sch.bookedSeats} / {sch.totalSeats} Pax ({occupancy}%)
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-purple-700 font-bold">
                      Permit: {sch.permitReference || 'MOT-2026-REG'}
                    </span>
                    <button
                      onClick={() => setSelectedScheduleDetail(sch)}
                      className="text-xs font-bold text-slate-900 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
                    >
                      View Details <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. View Format 3: Timeline & Departures Roster */}
      {viewFormat === 'timeline' && (
        <div className="space-y-4">
          {filteredSchedules.map((sch) => {
            const occupancy = sch.totalSeats
              ? Math.min(100, Math.round(((sch.bookedSeats || 0) / sch.totalSeats) * 100))
              : 100;
            const matchingPkg = packages.find((p) => p.id === sch.tourPackageId);

            return (
              <div
                key={sch.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition"
              >
                {/* Header line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                          sch.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sch.status === 'Upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {sch.status}
                      </span>
                      <span className="text-xs font-mono text-slate-400">ID: {sch.id}</span>
                    </div>
                    <h3 className="font-serif italic font-bold text-slate-900 text-lg mt-1">
                      {sch.tourTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        {sch.destination}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        {sch.startDate} → {sch.endDate || sch.startDate}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-purple-700 font-semibold">
                        Permit: {sch.permitReference || 'MOT-2026-CLR'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedScheduleDetail(sch)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      View Dossier
                    </button>

                    {canEdit && matchingPkg && (
                      <button
                        onClick={() => setEditingPackage(matchingPkg)}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition flex items-center gap-1.5 border border-amber-200 cursor-pointer shadow-2xs"
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
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
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
                        className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer"
                      >
                        {guides.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.role})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs">
                        {sch.leadGuideName || 'Unassigned'}
                      </div>
                    )}
                  </div>

                  {/* Seat Occupancy Meter */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
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
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
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
            <div className="p-12 text-center text-xs text-slate-500 rounded-2xl bg-white border border-slate-200">
              No expeditions match the current filter criteria.
            </div>
          )}
        </div>
      )}

      {/* 8. View Format 4: Waypoints & Field Scout Dispatch */}
      {viewFormat === 'waypoints' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchedules.map((sch) => {
            const matchingPkg = packages.find((p) => p.id === sch.tourPackageId);
            const itinerary = matchingPkg?.itinerary || [];

            return (
              <div
                key={sch.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4"
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
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
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
                  <span className="font-bold text-slate-900">{selectedScheduleDetail.endDate || selectedScheduleDetail.startDate}</span>
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

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedScheduleDetail(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer hover:bg-slate-800 transition"
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
    </div>
  );
};
