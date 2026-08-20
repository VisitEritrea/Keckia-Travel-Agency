import { useOptions } from '../../lib/settings';
import React, { useState } from 'react';
import {
  X,
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  FileText,
  Mountain,
  ShieldCheck,
} from 'lucide-react';
import { TourPackage, TourDifficulty } from '../../types';
import { ImageUploadField } from '../ui/Kit';

interface AddEditPackageModalProps {
  pkg?: TourPackage | null;
  onClose: () => void;
  onSave: (pkg: TourPackage) => void;
}

/**
 * The regions and difficulty levels are no longer fixed in this file — the
 * administrator maintains them in the Admin Control Centre, and they arrive
 * here through `useOptions`. The lists below are only the fallback used before
 * any settings have been saved.
 */
const REGIONS_FALLBACK = [
  'Central (Maekel)',
  'Northern Red Sea (Massawa & Dahlak)',
  'Southern (Debub / Qohaito)',
  'Anseba (Keren)',
  'Gash-Barka',
  'Southern Red Sea (Assab)',
];

const DIFFICULTIES_FALLBACK: TourDifficulty[] = ['Easy', 'Moderate', 'Challenging', 'Extreme'];

export const AddEditPackageModal: React.FC<AddEditPackageModalProps> = ({
  pkg,
  onClose,
  onSave,
}) => {
  // Maintained by the administrator in the Admin Control Centre; the module
  // never decides for itself what the choices are.
  const configuredRegions = useOptions('packages', 'regions');
  const configuredDifficulties = useOptions('packages', 'difficulties');
  const REGIONS = configuredRegions.length > 0 ? configuredRegions : REGIONS_FALLBACK;
  const DIFFICULTIES = (
    configuredDifficulties.length > 0 ? configuredDifficulties : DIFFICULTIES_FALLBACK
  ) as TourDifficulty[];

  const [title, setTitle] = useState(pkg?.title || '');
  const [destination, setDestination] = useState(pkg?.destination || '');
  const [region, setRegion] = useState(pkg?.region || 'Central (Maekel)');
  const [durationDays, setDurationDays] = useState(pkg?.durationDays || 4);
  const [difficulty, setDifficulty] = useState<TourDifficulty>(pkg?.difficulty || 'Moderate');
  const [maxCapacity, setMaxCapacity] = useState(pkg?.maxCapacity || 14);
  const [basePrice, setBasePrice] = useState(pkg?.basePrice || 750);
  const [description, setDescription] = useState(pkg?.description || '');
  const [coverImage, setCoverImage] = useState(pkg?.coverImage || '');
  const [tags, setTags] = useState<string[]>(
    pkg?.tags || ['UNESCO', 'History', 'Culture', 'Eritrea']
  );
  const [tagInput, setTagInput] = useState('');
  const [highlightPoints, setHighlightPoints] = useState<string[]>(
    pkg?.highlightPoints || [
      'Expert certified guide with cultural expertise',
      'Private 4WD Land Cruiser convoy',
      'All regional permits and park entries included',
    ]
  );
  const [newHighlight, setNewHighlight] = useState('');
  const [includedServices, setIncludedServices] = useState<string[]>(
    pkg?.includedServices || [
      'Boutique hotel & expedition camp accommodation',
      'Full board meals and traditional coffee ceremonies',
      'Ministry of Tourism permits and clearances',
    ]
  );
  const [newService, setNewService] = useState('');
  const [gearChecklist, setGearChecklist] = useState<string[]>(
    pkg?.gearChecklist || ['Comfortable trekking boots', 'Wide-angle camera', 'Sun hat & sunscreen']
  );
  const [newGear, setNewGear] = useState('');
  const [visaRequired, setVisaRequired] = useState(pkg?.visaRequired ?? true);
  const [permitRequired, setPermitRequired] = useState(pkg?.permitRequired ?? true);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setHighlightPoints([...highlightPoints, newHighlight.trim()]);
      setNewHighlight('');
    }
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlightPoints(highlightPoints.filter((_, i) => i !== idx));
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setIncludedServices([...includedServices, newService.trim()]);
      setNewService('');
    }
  };

  const handleRemoveService = (idx: number) => {
    setIncludedServices(includedServices.filter((_, i) => i !== idx));
  };

  const handleAddGear = () => {
    if (newGear.trim()) {
      setGearChecklist([...gearChecklist, newGear.trim()]);
      setNewGear('');
    }
  };

  const handleRemoveGear = (idx: number) => {
    setGearChecklist(gearChecklist.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim()) return;

    // Generate starter itinerary days if creating new package
    const initialItinerary =
      pkg?.itinerary && (pkg.itinerary ?? []).length > 0
        ? pkg.itinerary
        : Array.from({ length: Number(durationDays) }).map((_, i) => ({
            id: `itin-${Date.now()}-${i + 1}`,
            dayNumber: i + 1,
            timeSlot: '09:00 AM - 05:00 PM',
            title: `Day ${i + 1}: ${destination} Exploration`,
            location: destination,
            description: `Activities and excursions for Day ${i + 1}.`,
            activityType: (i === 0 ? 'Transfer' : i === durationDays - 1 ? 'Sightseeing' : 'Cultural') as any,
            mealPlan: 'Full Board' as any,
            altitudeMeters: 2325,
          }));

    const savedPackage: TourPackage = {
      id: pkg?.id || `pkg-${Date.now()}`,
      title,
      destination,
      region,
      country: 'Eritrea',
      durationDays: Number(durationDays),
      difficulty,
      maxCapacity: Number(maxCapacity),
      basePrice: Number(basePrice),
      description,
      coverImage,
      tags,
      highlightPoints,
      includedServices,
      gearChecklist,
      visaRequired,
      permitRequired,
      itinerary: initialItinerary,
    };

    onSave(savedPackage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif italic">
                {pkg ? 'Edit Eritrean Tour Package' : 'Create New Eritrean Tour Package'}
              </h2>
              <p className="text-xs text-slate-300 font-mono">
                Tour Package Architecture & Itinerary Configuration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* 1. Basic Package Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] font-mono border-b border-slate-100 pb-1">
              Package Title & Eritrean Destination
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tour Package Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Asmara UNESCO Modernist Architecture & Cultural Heritage"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-medium text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Specific Destination *
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Senafe, Qohaito & Golba Canyon"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Eritrean Region / Zoba
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold cursor-pointer"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as TourDifficulty)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold cursor-pointer"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Base Price (USD)
                </label>
                <input
                  type="number"
                  min={50}
                  max={10000}
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Max Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* 2. Description & Image */}
          <div className="space-y-3 pt-1">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] font-mono border-b border-slate-100 pb-1">
              Description & Cover Visual
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Overview & Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive overview of the expedition, historical context, landscapes, and cultural encounters..."
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs leading-relaxed"
              />
            </div>

            <ImageUploadField
              label="Cover Photo"
              value={coverImage}
              onChange={setCoverImage}
              hint="Uploaded from your device — resized automatically."
            />

            {/* Tags */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tags & Categories
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-semibold text-[11px] flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-500 hover:text-blue-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag (e.g. Scuba, UNESCO, 4WD)..."
                  className="flex-1 p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  + Add Tag
                </button>
              </div>
            </div>
          </div>

          {/* 3. Highlights & Inclusions */}
          <div className="space-y-4 pt-1">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] font-mono border-b border-slate-100 pb-1">
              Tour Highlights & Inclusions
            </h3>

            {/* Highlights list */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Expedition Highlights
              </label>
              <div className="space-y-1.5 mb-2">
                {highlightPoints.map((hl, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <span className="text-slate-800 font-medium">· {hl}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  placeholder="Add highlight (e.g. Fiat Tagliero iconic modernist architecture)..."
                  className="flex-1 p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  + Add Highlight
                </button>
              </div>
            </div>

            {/* Included Services */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Included Services
              </label>
              <div className="space-y-1.5 mb-2">
                {includedServices.map((srv, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <span className="text-slate-800 font-medium">✓ {srv}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Add inclusion (e.g. 4WD Land Cruiser convoy with fuel & driver)..."
                  className="flex-1 p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  + Add Inclusion
                </button>
              </div>
            </div>

            {/* Permit & Visa Toggles */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-around gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visaRequired}
                  onChange={(e) => setVisaRequired(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span>Requires Visa on Arrival (VoA)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permitRequired}
                  onChange={(e) => setPermitRequired(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span>Requires Ministry Regional Travel Permit</span>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {pkg ? 'Update Package' : 'Save Package & Setup Itinerary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
