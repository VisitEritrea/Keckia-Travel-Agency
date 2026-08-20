import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Mountain,
  Utensils,
  User,
  CheckCircle2,
  Sparkles,
  Compass,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TourPackage, ItineraryItem, TourActivity, ActivityType } from '../../types';
import { ActivityCatalogModal } from './ActivityCatalogModal';

interface DayItineraryBuilderModalProps {
  pkg: TourPackage;
  activities: TourActivity[];
  onClose: () => void;
  onSaveItinerary: (packageId: string, updatedItinerary: ItineraryItem[]) => void;
  onAddActivity: (activity: TourActivity) => void;
}

const ACTIVITY_TYPES: ActivityType[] = [
  'Transfer',
  'Sightseeing',
  'Trek',
  'Cultural',
  'Meal',
  'Rest',
  'Briefing',
  'Safari',
];

const MEAL_PLANS = ['Breakfast', 'Lunch', 'Dinner', 'Full Board', 'None'];

export const DayItineraryBuilderModal: React.FC<DayItineraryBuilderModalProps> = ({
  pkg,
  activities,
  onClose,
  onSaveItinerary,
  onAddActivity,
}) => {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(
    pkg.itinerary && (pkg.itinerary ?? []).length > 0
      ? pkg.itinerary
      : [
          {
            id: `itin-${Date.now()}-1`,
            dayNumber: 1,
            timeSlot: '08:30 AM - 05:00 PM',
            title: `Day 1: Arrival & ${pkg.destination} Introduction`,
            location: pkg.destination,
            description: `Welcome briefing, orientation, and initial excursion in ${pkg.destination}.`,
            activityType: 'Transfer',
            mealPlan: 'Dinner',
            altitudeMeters: 2325,
          },
        ]
  );

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const handleAddDay = () => {
    const nextDayNum = itinerary.length + 1;
    const newDay: ItineraryItem = {
      id: `itin-${Date.now()}-${nextDayNum}`,
      dayNumber: nextDayNum,
      timeSlot: '08:00 AM - 05:00 PM',
      title: `Day ${nextDayNum}: ${pkg.destination} Expedition`,
      location: pkg.destination,
      description: `Comprehensive guided activities for Day ${nextDayNum}.`,
      activityType: 'Sightseeing',
      mealPlan: 'Full Board',
      altitudeMeters: 2325,
    };
    const updated = [...itinerary, newDay];
    setItinerary(updated);
    setActiveDayIndex(updated.length - 1);
  };

  const handleRemoveDay = (index: number) => {
    if (itinerary.length <= 1) return;
    const filtered = itinerary.filter((_, i) => i !== index);
    const reindexed = filtered.map((item, i) => ({
      ...item,
      dayNumber: i + 1,
    }));
    setItinerary(reindexed);
    setActiveDayIndex(Math.max(0, index - 1));
  };

  const handleUpdateCurrentDay = (field: keyof ItineraryItem, value: any) => {
    const updated = [...itinerary];
    updated[activeDayIndex] = {
      ...updated[activeDayIndex],
      [field]: value,
    };
    setItinerary(updated);
  };

  const handleInsertActivityFromCatalog = (activity: TourActivity) => {
    const updated = [...itinerary];
    updated[activeDayIndex] = {
      ...updated[activeDayIndex],
      title: activity.title,
      location: activity.location,
      description: activity.description,
      activityType:
        activity.category === 'Architecture & History' || activity.category === 'Archaeology & Ruins'
          ? 'Cultural'
          : activity.category === 'Mountain Trekking'
          ? 'Trek'
          : 'Sightseeing',
      mealPlan: 'Full Board',
      altitudeMeters: activity.altitudeMeters || updated[activeDayIndex].altitudeMeters,
    };
    setItinerary(updated);
    setIsCatalogOpen(false);
  };

  const handleSave = () => {
    onSaveItinerary(pkg.id, itinerary);
    onClose();
  };

  const currentItem = itinerary[activeDayIndex] || itinerary[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif italic">
                  Day-by-Day Itinerary Architect
                </h2>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-xs font-bold border border-blue-400/30">
                  {pkg.durationDays} Days / {pkg.region}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">{pkg.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCatalogOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4" /> Pick from Activities Catalog
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Builder Workspace Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Days Sidebar / Selector */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-2 overflow-y-auto shrink-0">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                Itinerary Days ({itinerary.length})
              </span>
              <button
                onClick={handleAddDay}
                className="px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Day
              </button>
            </div>

            <div className="space-y-1.5 flex-1">
              {itinerary.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl transition cursor-pointer flex items-center justify-between gap-2 border ${
                    activeDayIndex === idx
                      ? 'bg-white border-blue-400 text-blue-900 shadow-xs font-bold'
                      : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono uppercase block text-blue-600 font-bold">
                      Day {item.dayNumber}
                    </span>
                    <span className="text-xs truncate block font-medium">{item.title}</span>
                  </div>
                  {itinerary.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDay(idx);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-sm cursor-pointer"
                      title="Delete Day"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Active Day Editor */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  Editing Day {currentItem.dayNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 font-serif mt-1">
                  {currentItem.title}
                </h3>
              </div>

              <span className="text-xs text-slate-500 font-mono">
                {currentItem.timeSlot}
              </span>
            </div>

            <div className="space-y-4">
              {/* Day Title & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Day Headline & Excursion Name *
                  </label>
                  <input
                    type="text"
                    value={currentItem.title}
                    onChange={(e) => handleUpdateCurrentDay('title', e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Time Slot / Schedule
                  </label>
                  <input
                    type="text"
                    value={currentItem.timeSlot}
                    onChange={(e) => handleUpdateCurrentDay('timeSlot', e.target.value)}
                    placeholder="08:30 AM - 05:00 PM"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Location & Activity Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Location & Landmark
                  </label>
                  <input
                    type="text"
                    value={currentItem.location}
                    onChange={(e) => handleUpdateCurrentDay('location', e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={currentItem.activityType}
                    onChange={(e) =>
                      handleUpdateCurrentDay('activityType', e.target.value as ActivityType)
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold cursor-pointer"
                  >
                    {ACTIVITY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Meal Plan
                  </label>
                  <select
                    value={currentItem.mealPlan || 'Full Board'}
                    onChange={(e) => handleUpdateCurrentDay('mealPlan', e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold cursor-pointer"
                  >
                    {MEAL_PLANS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Altitude & Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Altitude (Meters)
                  </label>
                  <input
                    type="number"
                    value={currentItem.altitudeMeters || 2325}
                    onChange={(e) =>
                      handleUpdateCurrentDay('altitudeMeters', Number(e.target.value))
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned Guide / Specialist
                  </label>
                  <input
                    type="text"
                    value={currentItem.guideName || 'Lead Certified Guide'}
                    onChange={(e) => handleUpdateCurrentDay('guideName', e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Day Narrative & Step-by-Step Experience
                </label>
                <textarea
                  rows={4}
                  value={currentItem.description}
                  onChange={(e) => handleUpdateCurrentDay('description', e.target.value)}
                  placeholder="Detailed breakdown of morning stops, cultural interactions, scenic vistas, and evening meals..."
                  className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Save Itinerary Structure
          </button>
        </div>
      </div>

      {/* Catalog Selector Modal */}
      {isCatalogOpen && (
        <ActivityCatalogModal
          activities={activities}
          onClose={() => setIsCatalogOpen(false)}
          onSelectActivity={handleInsertActivityFromCatalog}
          onAddActivity={onAddActivity}
        />
      )}
    </div>
  );
};
