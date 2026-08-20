import React, { useState } from 'react';
import {
  X,
  Compass,
  MapPin,
  Clock,
  Mountain,
  Utensils,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { TourActivity } from '../../types';
import { ImageUploadField } from '../ui/Kit';

interface ActivityCatalogModalProps {
  activities: TourActivity[];
  onClose: () => void;
  onSelectActivity?: (activity: TourActivity) => void;
  onAddActivity: (activity: TourActivity) => void;
}

export const ActivityCatalogModal: React.FC<ActivityCatalogModalProps> = ({
  activities = [],
  onClose,
  onSelectActivity,
  onAddActivity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);

  // New activity form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TourActivity['category']>('Architecture & History');
  const [newRegion, setNewRegion] = useState<TourActivity['region']>('Central (Maekel / Asmara)');
  const [newLocation, setNewLocation] = useState('');
  const [newDuration, setNewDuration] = useState(4);
  const [newDifficulty, setNewDifficulty] = useState<TourActivity['difficulty']>('Easy');
  const [newDescription, setNewDescription] = useState('');
  const [newAltitude, setNewAltitude] = useState(2325);
  const [newMeal, setNewMeal] = useState('Traditional Eritrean Injera / Coffee Ceremony');
  const [newCover, setNewCover] = useState('');

  const categories = Array.from(new Set(activities.map((a) => a.category)));

  const filteredActivities = activities.filter((a) => {
    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      a.title.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.region.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocation.trim()) return;

    const created: TourActivity = {
      id: `act-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      region: newRegion,
      location: newLocation,
      durationHours: Number(newDuration),
      difficulty: newDifficulty,
      description: newDescription,
      highlights: ['Authentic Eritrean cultural and geographic exploration'],
      includedGear: ['Comfortable footwear', 'Camera'],
      recommendedMeal: newMeal,
      coverImage: newCover,
      altitudeMeters: Number(newAltitude),
    };

    onAddActivity(created);
    setIsCreatingActivity(false);
    // Reset
    setNewTitle('');
    setNewLocation('');
    setNewDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif italic">
                Eritrea Tour Activities Catalog
              </h2>
              <p className="text-xs text-slate-300 font-mono">
                Curated Eritrean excursions, UNESCO walks, marine dives, and canyon treks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreatingActivity && (
              <button
                onClick={() => setIsCreatingActivity(true)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> New Activity
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* Create Activity Sub-Form */}
          {isCreatingActivity ? (
            <form onSubmit={handleCreateSubmit} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="font-bold text-slate-900 text-sm font-serif italic">
                  Define New Eritrean Tour Activity
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreatingActivity(false)}
                  className="text-xs text-slate-500 hover:underline cursor-pointer"
                >
                  Back to Catalog
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Activity Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Asmara Central Market & Medebar Metal Artistry Tour"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Location & Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Medebar Market, Asmara"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Architecture & History">Architecture & History</option>
                    <option value="Marine & Islands">Marine & Islands</option>
                    <option value="Mountain Trekking">Mountain Trekking</option>
                    <option value="Archaeology & Ruins">Archaeology & Ruins</option>
                    <option value="Cultural & Markets">Cultural & Markets</option>
                    <option value="Wildlife & Nature">Wildlife & Nature</option>
                    <option value="Culinary & Coffee Ceremony">Culinary & Coffee Ceremony</option>
                    <option value="Scenic Railway">Scenic Railway</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Region</label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Central (Maekel / Asmara)">Central (Maekel / Asmara)</option>
                    <option value="Northern Red Sea (Massawa & Dahlak)">Northern Red Sea (Massawa & Dahlak)</option>
                    <option value="Southern (Debub / Qohaito)">Southern (Debub / Qohaito)</option>
                    <option value="Anseba (Keren)">Anseba (Keren)</option>
                    <option value="Gash-Barka">Gash-Barka</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Altitude (Meters)</label>
                  <input
                    type="number"
                    value={newAltitude}
                    onChange={(e) => setNewAltitude(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the activity, historical context, what travelers will experience..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>

              <ImageUploadField
                label="Cover Photo"
                value={newCover}
                onChange={setNewCover}
                hint="Uploaded from your device — resized automatically."
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingActivity(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Save Activity to Catalog
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search activities by title, location, description..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-200 text-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Activity Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {act.category}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm font-serif mt-1.5 group-hover:text-blue-900 transition">
                            {act.title}
                          </h3>
                        </div>

                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold shrink-0">
                          {act.difficulty}
                        </span>
                      </div>

                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                        {act.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="line-clamp-1">{act.location}</span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{act.durationHours} Hours duration</span>
                        </div>

                        {act.altitudeMeters !== undefined && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Mountain className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-mono">{act.altitudeMeters}m altitude</span>
                          </div>
                        )}

                        {act.recommendedMeal && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Utensils className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="line-clamp-1">{act.recommendedMeal}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">{act.region}</span>
                      {onSelectActivity && (
                        <button
                          onClick={() => onSelectActivity(act)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Insert into Itinerary
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Close Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
