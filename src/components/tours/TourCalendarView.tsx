import React, { useState } from 'react';
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
} from 'lucide-react';
import { Employee, TourPackage, TourSchedule, ItineraryItem } from '../../types';
import { ItineraryBuilderModal } from './ItineraryBuilderModal';
import { NewDepartureModal } from './NewDepartureModal';

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
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [isNewDepartureOpen, setIsNewDepartureOpen] = useState(false);
  const [viewFormat, setViewFormat] = useState<'calendar' | 'timeline'>('calendar');

  const guides = (employees || []).filter((e) => e.role === 'Tour Guide' || e.role === 'Operations Manager');

  // Days in August 2026: 31 days. Aug 1, 2026 starts on Saturday (index 6).
  const daysInMonth = 31;
  const startDayOffset = 6; // Saturday

  const filteredSchedules = (schedules || []).filter(
    (s) => selectedStatus === 'all' || s.status === selectedStatus
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div id="tour-calendar-container" className="space-y-6 pb-12 text-slate-900">
      {/* Top Banner & Control Bar */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 italic font-bold">
              Expedition Schedules & Calendar
            </h2>
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold">
              August 2026 High Season
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time convoy departure tracking, guide assignments, and multi-day waypoint architect.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setViewFormat('calendar')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
                viewFormat === 'calendar' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewFormat('timeline')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
                viewFormat === 'timeline' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Timeline List
            </button>
          </div>

          <button
            onClick={() => setIsNewDepartureOpen(true)}
            className="bg-brand-500 hover:bg-brand-600 text-slate-950 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Schedule Departure
          </button>
        </div>
      </div>

      {/* Package Itinerary Architect Bar */}
      {canEdit && (
      <div className="p-5 sm:p-6 rounded-[2rem] bg-gradient-to-r from-amber-50/80 via-sky-50/60 to-orange-50/80 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-white text-amber-700 border border-amber-200 shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-serif italic text-slate-900 font-bold">
              Master Tour Packages & Multi-Day Itinerary Architect
            </h4>
            <p className="text-xs text-slate-600 font-medium">
              Customize daily schedules, waypoints, and accommodation tags for EritreaVisit departures
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setEditingPackage(pkg)}
              className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Compass className="w-3.5 h-3.5 text-amber-700" />
              <span>{pkg.title.split(' ')[0]} {pkg.title.split(' ')[1]} ({pkg.durationDays}D)</span>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Month Navigation & Status Filter Bar */}
      <div className="p-4 sm:p-5 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Month Picker */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1))}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-serif italic text-slate-900 font-bold">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={() => setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1))}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5">
          {['all', 'Active', 'Upcoming', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                selectedStatus === status
                  ? 'bg-amber-100 border border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-transparent'
              }`}
            >
              {status === 'all' ? 'All Departures' : status}
            </button>
          ))}
        </div>
      </div>

      {/* View 1: Calendar Grid */}
      {viewFormat === 'calendar' ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xs overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-mono uppercase tracking-widest text-slate-500 font-bold py-3.5">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Date Cells */}
          <div className="grid grid-cols-7 auto-rows-[135px] divide-x divide-y divide-slate-100">
            {/* Blank leading days */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`blank-${i}`} className="bg-slate-50/50 p-2" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateStr = `2026-08-${dayNumber < 10 ? '0' + dayNumber : dayNumber}`;
              const isToday = dayNumber === 14;

              // Find schedules active on this day
              const daySchedules = (schedules || []).filter((sch) => {
                return sch && dateStr >= sch.startDate && dateStr <= sch.endDate;
              });

              return (
                <div
                  key={`day-${dayNumber}`}
                  className={`p-2.5 transition group flex flex-col justify-between ${
                    isToday ? 'bg-amber-50/60 ring-1 ring-amber-400' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-brand-500 text-slate-950 flex items-center justify-center font-black shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      {dayNumber}
                    </span>
                    {daySchedules.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-500 font-medium">
                        {daySchedules.length} convoy{daySchedules.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Scheduled Tour Badges in Date Cell */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[85px]">
                    {daySchedules.map((sch) => {
                      const isStart = sch.startDate === dateStr;
                      const isEnd = sch.endDate === dateStr;

                      return (
                        <div
                          key={sch.id}
                          className={`p-1.5 rounded-lg text-[10px] font-medium leading-tight shadow-xs ${
                            sch.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : sch.status === 'Upcoming'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <div className="truncate font-bold font-serif">
                            {isStart ? '🚀 ' : isEnd ? '🏁 ' : '● '}
                            {sch.destination.split(' ')[0]}
                          </div>
                          <div className="truncate text-[9px] text-slate-600 font-mono font-medium">
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
      ) : (
        /* View 2: Detailed Timeline / Departures List */
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
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-serif italic text-slate-900 font-bold">
                        {sch.tourTitle}
                      </h3>
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold ${
                          sch.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse'
                            : sch.status === 'Upcoming'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {sch.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1 font-medium">
                      <span className="flex items-center gap-1 font-mono text-amber-800 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        {sch.startDate} → {sch.endDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {sch.destination}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-purple-700 font-semibold">
                        Permit: {sch.permitReference}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {canEdit && matchingPkg && (
                      <button
                        onClick={() => setEditingPackage(matchingPkg)}
                        className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-xs"
                      >
                        <Compass className="w-3.5 h-3.5 text-amber-700" />
                        Edit Itinerary
                      </button>
                    )}
                  </div>
                </div>

                {/* Logistics & Guide Assignment Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                  {/* Lead Guide Selector */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5 font-semibold">
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
                        className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-xs"
                      >
                        {guides.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} (⭐ {g.rating} · {g.status})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
                        {sch.leadGuideName || guides.find((g) => g.id === sch.leadGuideId)?.name || 'Unassigned'}
                      </div>
                    )}
                  </div>

                  {/* Seat Occupancy */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
                        Seat Occupancy
                      </span>
                      <span className="font-mono text-slate-900 font-bold">
                        {sch.bookedSeats} / {sch.totalSeats} ({occupancy}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div
                        style={{ width: `${occupancy}%` }}
                        className={`h-full rounded-full ${
                          occupancy >= 90 ? 'bg-rose-500' : occupancy >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Field Weather / Radio Notes */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-mono text-amber-800 uppercase tracking-widest mb-1 flex items-center gap-1 font-bold">
                      <CloudSun className="w-3 h-3 text-amber-600" /> Weather & Scouts
                    </div>
                    <p className="text-xs text-slate-900 truncate font-semibold">{sch.weatherForecast}</p>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">{sch.notes}</p>
                  </div>
                </div>
              </div>
            );
          })}
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
