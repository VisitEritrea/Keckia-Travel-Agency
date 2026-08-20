import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  Utensils,
  Mountain,
  Save,
  Loader2,
} from 'lucide-react';
import { ActivityType, ItineraryItem, TourPackage } from '../../types';

interface ItineraryBuilderModalProps {
  tourPackage: TourPackage;
  onClose: () => void;
  onSaveItinerary: (packageId: string, updatedItinerary: ItineraryItem[]) => void;
}

export const ItineraryBuilderModal: React.FC<ItineraryBuilderModalProps> = ({
  tourPackage,
  onClose,
  onSaveItinerary,
}) => {
  const [items, setItems] = useState<ItineraryItem[]>(
    tourPackage.itinerary && tourPackage.itinerary.length > 0
      ? [...tourPackage.itinerary]
      : [
          {
            id: `itin-${Date.now()}-1`,
            dayNumber: 1,
            timeSlot: '08:00 AM - 05:00 PM',
            title: `Arrival & Basecamp Acclimatization in ${tourPackage.region}`,
            location: `${tourPackage.destination} HQ`,
            description: 'Expedition briefing with mountain scouts, gear checks, and welcome dinner.',
            activityType: 'Briefing',
            mealPlan: 'Full Board',
            gearNeeded: ['Daypack', 'Passport', 'Warm fleece'],
            altitudeMeters: 2400,
          },
        ]
  );

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTheme, setAiTheme] = useState('High Altitude Alpine & Wildlife Focus');

  const handleAddItem = () => {
    const nextDay = items.length + 1;
    const newItem: ItineraryItem = {
      id: `itin-${Date.now()}-${nextDay}`,
      dayNumber: nextDay,
      timeSlot: '07:30 AM - 04:30 PM',
      title: `Day ${nextDay}: Exploration & Trail Trek`,
      location: `${tourPackage.destination} Sector ${nextDay}`,
      description: 'Morning trail traverse followed by geological observation and scenic camp setup.',
      activityType: 'Trek',
      mealPlan: 'Full Board',
      gearNeeded: ['Trekking poles', 'Glacier glasses'],
      altitudeMeters: 3000 + nextDay * 200,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof ItineraryItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      dayNumber: idx + 1,
    }));
    setItems(updated);
  };

  const handleAiGenerate = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: tourPackage.destination,
          days: tourPackage.durationDays || 5,
          difficulty: tourPackage.difficulty,
          focusTheme: aiTheme,
        }),
      });

      const data = await response.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        setItems(
          data.items.map((it: any, idx: number) => ({
            id: `itin-ai-${Date.now()}-${idx}`,
            dayNumber: it.dayNumber || idx + 1,
            timeSlot: it.timeSlot || '08:00 AM - 05:00 PM',
            title: it.title || `Day ${idx + 1} Itinerary`,
            location: it.location || tourPackage.destination,
            description: it.description || 'Guided expedition exploration.',
            activityType: (it.activityType as ActivityType) || 'Trek',
            mealPlan: it.mealPlan || 'Full Board',
            gearNeeded: it.gearNeeded || ['Daypack'],
            altitudeMeters: it.altitudeMeters || 2500,
          }))
        );
      } else {
        const fallbackDays: ItineraryItem[] = Array.from({ length: tourPackage.durationDays || 4 }).map(
          (_, i) => ({
            id: `itin-gen-${Date.now()}-${i + 1}`,
            dayNumber: i + 1,
            timeSlot: i === 0 ? '09:00 AM - 05:00 PM' : '07:00 AM - 04:30 PM',
            title:
              i === 0
                ? `Day 1: Departure Base & Acclimatization at ${tourPackage.destination}`
                : i === (tourPackage.durationDays || 4) - 1
                ? `Day ${i + 1}: Final Summit Descent & Celebration Banquet`
                : `Day ${i + 1}: Core Traverse & Cultural Escort`,
            location: `${tourPackage.destination} - Camp Waypoint ${i + 1}`,
            description: `Scenic high-value excursion with certified lead guides and field scout safety monitoring.`,
            activityType: i === 0 ? 'Briefing' : i % 2 === 0 ? 'Trek' : 'Sightseeing',
            mealPlan: 'Full Board',
            gearNeeded: ['Trekking poles', 'UV Filter Glasses', 'Thermal Layer'],
            altitudeMeters: 2200 + i * 400,
          })
        );
        setItems(fallbackDays);
      }
    } catch {
      const fallbackDays: ItineraryItem[] = Array.from({ length: tourPackage.durationDays || 4 }).map(
        (_, i) => ({
          id: `itin-gen-${Date.now()}-${i + 1}`,
          dayNumber: i + 1,
          timeSlot: '08:00 AM - 05:00 PM',
          title: `Day ${i + 1}: Expedition Stage ${i + 1}`,
          location: `${tourPackage.destination}`,
          description: 'Expedition operations with EritreaVisit certified guide escort.',
          activityType: 'Trek',
          mealPlan: 'Full Board',
          altitudeMeters: 2800,
        })
      );
      setItems(fallbackDays);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = () => {
    onSaveItinerary(tourPackage.id, items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-slate-900">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif italic font-bold text-slate-900">{tourPackage.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold">
                  {tourPackage.durationDays} Days · {tourPackage.difficulty}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 font-semibold">
                Multi-Day Master Itinerary & Waypoint Architect
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Generator Strip */}
        <div className="px-6 sm:px-8 py-4 bg-gradient-to-r from-blue-50/70 via-slate-50 to-amber-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 max-w-md">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-bold shrink-0">
              AI Expedition Architect:
            </span>
            <input
              type="text"
              value={aiTheme}
              onChange={(e) => setAiTheme(e.target.value)}
              placeholder="e.g. Geological Lava Focus, Monastic Heritage..."
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>
          <button
            onClick={handleAiGenerate}
            disabled={isGeneratingAI}
            className="px-5 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 shadow-sm hover:shadow disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isGeneratingAI ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Synthesizing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Auto-Generate {tourPackage.durationDays} Days
              </>
            )}
          </button>
        </div>

        {/* Itinerary Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-5 rounded-[1.5rem] bg-white border border-slate-200 hover:border-slate-300 transition space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-8 h-8 rounded-xl bg-brand-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono shrink-0 shadow-xs">
                    D{item.dayNumber}
                  </span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                    placeholder="Day Title..."
                    className="font-serif italic font-bold text-base text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-hidden px-1 w-full"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={item.activityType}
                    onChange={(e) => handleUpdateItem(idx, 'activityType', e.target.value as ActivityType)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-hidden"
                  >
                    <option value="Trek">🥾 Trek</option>
                    <option value="Sightseeing">📸 Sightseeing</option>
                    <option value="Cultural">🏛️ Cultural</option>
                    <option value="Transfer">🚐 Transfer</option>
                    <option value="Briefing">📋 Briefing</option>
                    <option value="Rest">⛺ Rest</option>
                    <option value="Safari">🦁 Safari</option>
                  </select>

                  <button
                    onClick={() => handleDeleteItem(idx)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                    title="Delete Day"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: Location, Time, Meal, Altitude */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block mb-1 font-semibold">
                    Location Waypoint
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <input
                      type="text"
                      value={item.location}
                      onChange={(e) => handleUpdateItem(idx, 'location', e.target.value)}
                      placeholder="Waypoint name"
                      className="bg-transparent w-full text-slate-900 focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block mb-1 font-semibold">
                    Time Window
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={item.timeSlot}
                      onChange={(e) => handleUpdateItem(idx, 'timeSlot', e.target.value)}
                      placeholder="08:00 - 17:00"
                      className="bg-transparent w-full text-slate-900 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block mb-1 font-semibold">
                    Meal Provision
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                    <Utensils className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <select
                      value={item.mealPlan || 'Full Board'}
                      onChange={(e) => handleUpdateItem(idx, 'mealPlan', e.target.value)}
                      className="bg-transparent w-full text-slate-900 focus:outline-hidden font-medium"
                    >
                      <option value="Full Board">Full Board (3 Meals)</option>
                      <option value="Breakfast">Breakfast only</option>
                      <option value="Lunch">Lunch Picnic</option>
                      <option value="Dinner">Dinner only</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block mb-1 font-semibold">
                    Max Altitude (m)
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                    <Mountain className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <input
                      type="number"
                      value={item.altitudeMeters || 2400}
                      onChange={(e) => handleUpdateItem(idx, 'altitudeMeters', Number(e.target.value))}
                      className="bg-transparent w-full text-slate-900 focus:outline-hidden font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                  placeholder="Detailed activities, scenic waypoints, mountain scout checkpoints, and client precautions..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleAddItem}
            className="w-full py-3.5 rounded-[1.5rem] border border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50/40 text-slate-700 hover:text-slate-900 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer bg-white"
          >
            <Plus className="w-4 h-4 text-amber-700" /> Add Next Day (Day {items.length + 1})
          </button>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600 font-mono font-medium">
            {items.length} stages configured for <span className="font-serif italic text-slate-900 font-bold">{tourPackage.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-black uppercase tracking-widest shadow-sm hover:shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Master Itinerary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
