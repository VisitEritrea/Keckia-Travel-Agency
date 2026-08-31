import React, { useState, useRef } from 'react';
import {
  Camera,
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  Sparkles,
  MapPin,
  Mountain,
  Eye,
  RotateCcw,
  X,
  Compass,
  Sliders,
  Layers,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { DestinationSlide, DESTINATIONS_DATA } from '../dashboard/TouristDestinationSlideshow';
import { Button, Card, TextInput, Badge, Toggle, Field } from '../ui/Kit';

interface DashboardShowcaseSettingsEditorProps {
  customJson: string;
  onUpdateCustomJson: (json: string) => void;
  slideDuration: number;
  onUpdateSlideDuration: (duration: number) => void;
  autoPlay: boolean;
  onUpdateAutoPlay: (enabled: boolean) => void;
  showTigrinya: boolean;
  onUpdateShowTigrinya: (enabled: boolean) => void;
  showThumbnails: boolean;
  onUpdateShowThumbnails: (enabled: boolean) => void;
}

const SAMPLE_PRESET_IMAGES = [
  { label: 'Asmara Art Deco / Cinema', url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&auto=format&fit=crop&q=85' },
  { label: 'Red Sea Port & Coral Sea', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&auto=format&fit=crop&q=85' },
  { label: 'Dahlak White Sand Island', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=85' },
  { label: 'Qohaito Highlands Canyon', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&auto=format&fit=crop&q=85' },
  { label: 'Keren Baobab & Marketplace', url: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1600&auto=format&fit=crop&q=85' },
  { label: 'Debre Bizen Mountain Peak', url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&auto=format&fit=crop&q=85' },
  { label: 'Filfil Evergreen Cloud Forest', url: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1600&auto=format&fit=crop&q=85' },
  { label: 'Metera Ancient Stele & Granite Spire', url: 'https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=1600&auto=format&fit=crop&q=85' },
];

export const DashboardShowcaseSettingsEditor: React.FC<DashboardShowcaseSettingsEditorProps> = ({
  customJson,
  onUpdateCustomJson,
  slideDuration,
  onUpdateSlideDuration,
  autoPlay,
  onUpdateAutoPlay,
  showTigrinya,
  onUpdateShowTigrinya,
  showThumbnails,
  onUpdateShowThumbnails,
}) => {
  // Parse destinations from JSON or fallback to default
  const destinations: DestinationSlide[] = React.useMemo(() => {
    try {
      if (customJson && customJson.trim().length > 0) {
        const parsed = JSON.parse(customJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse custom destinations JSON', e);
    }
    return DESTINATIONS_DATA;
  }, [customJson]);

  const [editingSlide, setEditingSlide] = useState<DestinationSlide | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeHighlightDraft, setActiveHighlightDraft] = useState('');
  const [activeGalleryUrlDraft, setActiveGalleryUrlDraft] = useState('');
  const [previewSlide, setPreviewSlide] = useState<DestinationSlide | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const saveDestinationsList = (list: DestinationSlide[]) => {
    onUpdateCustomJson(JSON.stringify(list, null, 2));
  };

  const handleOpenAddModal = () => {
    const newSlide: DestinationSlide = {
      id: `dest-${Date.now()}`,
      name: '',
      tigrinyaName: '',
      region: 'Central Region (Maekel)',
      category: 'UNESCO & Architecture',
      tagline: '',
      description: '',
      imageUrl: SAMPLE_PRESET_IMAGES[0].url,
      galleryImages: [],
      altitude: '2,325 m / 7,628 ft',
      bestTime: 'October – May',
      highlights: ['Historic Landmark', 'Guided Excursions', 'Photographic Vistas'],
      climate: 'Temperate highland mountain climate (18°C – 25°C)',
      featuredTourTitle: 'Cultural Tour of Eritrea',
    };
    setEditingSlide(newSlide);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slide: DestinationSlide) => {
    setEditingSlide({ ...slide });
    setIsModalOpen(true);
  };

  const handleDeleteSlide = (id: string) => {
    if (destinations.length <= 1) {
      alert('You must have at least one destination slide in the showcase.');
      return;
    }
    const updated = destinations.filter((d) => d.id !== id);
    saveDestinationsList(updated);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    if (!editingSlide.name.trim()) {
      alert('Please enter a destination name.');
      return;
    }
    if (!editingSlide.imageUrl.trim()) {
      alert('Please provide a cover image URL or upload a picture.');
      return;
    }

    const index = destinations.findIndex((d) => d.id === editingSlide.id);
    let updated: DestinationSlide[];
    if (index >= 0) {
      updated = [...destinations];
      updated[index] = editingSlide;
    } else {
      updated = [editingSlide, ...destinations];
    }
    saveDestinationsList(updated);
    setIsModalOpen(false);
    setEditingSlide(null);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all destination slides to system default showcase? Custom added slides will be restored.')) {
      saveDestinationsList(DESTINATIONS_DATA);
    }
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && editingSlide) {
        setEditingSlide({ ...editingSlide, imageUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingSlide) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditingSlide((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              galleryImages: [...prev.galleryImages, reader.result as string],
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddHighlight = () => {
    if (!activeHighlightDraft.trim() || !editingSlide) return;
    setEditingSlide({
      ...editingSlide,
      highlights: [...(editingSlide.highlights || []), activeHighlightDraft.trim()],
    });
    setActiveHighlightDraft('');
  };

  const handleRemoveHighlight = (idx: number) => {
    if (!editingSlide) return;
    setEditingSlide({
      ...editingSlide,
      highlights: (editingSlide.highlights || []).filter((_, i) => i !== idx),
    });
  };

  const handleAddGalleryUrl = () => {
    if (!activeGalleryUrlDraft.trim() || !editingSlide) return;
    setEditingSlide({
      ...editingSlide,
      galleryImages: [...(editingSlide.galleryImages || []), activeGalleryUrlDraft.trim()],
    });
    setActiveGalleryUrlDraft('');
  };

  const handleRemoveGalleryUrl = (idx: number) => {
    if (!editingSlide) return;
    setEditingSlide({
      ...editingSlide,
      galleryImages: (editingSlide.galleryImages || []).filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Dashboard Pictorial Showcase Manager
                <Badge tone="brand">{destinations.length} Destination Slides</Badge>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Add, customize, and manage photos, Tigrinya titles, taglines, and descriptions displayed in the main dashboard slideshow.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            tone="ghost"
            icon={RotateCcw}
            onClick={handleResetToDefaults}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Reset to Defaults
          </Button>
          <Button
            size="md"
            tone="primary"
            icon={Plus}
            onClick={handleOpenAddModal}
            className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold border-none"
          >
            Add Tourist Destination Slide
          </Button>
        </div>
      </div>

      {/* 2. Slideshow Playback & Presentation Rules */}
      <Card
        title="Slideshow Playback & Display Controls"
        description="Configure timing, animation speed, and layout controls for the dashboard pictorial showcase."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Slide Duration (Seconds)" help="Time each picture stays on screen">
            <div className="flex items-center gap-2">
              <TextInput
                type="number"
                min={3}
                max={30}
                value={String(slideDuration)}
                onChange={(e) => onUpdateSlideDuration(Math.max(3, Number(e.target.value) || 6))}
              />
              <span className="text-xs text-slate-500 font-medium">sec</span>
            </div>
          </Field>

          <div className="flex flex-col justify-center">
            <Toggle
              label="Auto-Play Slideshow"
              help="Cycle pictures automatically on page load"
              checked={autoPlay}
              onChange={onUpdateAutoPlay}
            />
          </div>

          <div className="flex flex-col justify-center">
            <Toggle
              label="Display Tigrinya Script Titles"
              help="Show authentic Ge'ez/Tigrinya names (e.g. ኣስመራ)"
              checked={showTigrinya}
              onChange={onUpdateShowTigrinya}
            />
          </div>

          <div className="flex flex-col justify-center">
            <Toggle
              label="Show Thumbnail Carousel"
              help="Display bottom preview strip of all locations"
              checked={showThumbnails}
              onChange={onUpdateShowThumbnails}
            />
          </div>
        </div>
      </Card>

      {/* 3. Destination Slides Gallery Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            Configured Tourist Destination Slides ({destinations.length})
          </h3>
          <span className="text-xs text-slate-500">
            Changes saved here are instantly reflected on the live dashboard.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {destinations.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Image Preview Container */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                <img
                  src={slide.imageUrl}
                  alt={slide.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500 text-slate-950 shadow-xs">
                    {slide.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900/80 text-white backdrop-blur-xs border border-white/10 font-mono">
                    #{idx + 1}
                  </span>
                </div>

                {/* Bottom Overlay Title on Image */}
                <div className="absolute bottom-2.5 left-3 right-3">
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-base font-bold text-white truncate drop-shadow-sm">
                      {slide.name}
                    </h4>
                    {slide.tigrinyaName && (
                      <span className="text-sm font-semibold text-teal-300 font-serif shrink-0">
                        {slide.tigrinyaName}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-teal-200 truncate font-medium">
                    {slide.tagline || slide.region}
                  </p>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-teal-600" />
                      {slide.region}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Mountain className="w-3 h-3 text-amber-600" />
                      {slide.altitude}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {slide.description}
                  </p>

                  {/* Highlight Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(slide.highlights || []).slice(0, 2).map((h, hIdx) => (
                      <span
                        key={hIdx}
                        className="inline-flex items-center gap-1 text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-full"
                      >
                        <Check className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                        {h}
                      </span>
                    ))}
                    {(slide.highlights || []).length > 2 && (
                      <span className="text-[10px] text-slate-400 font-semibold self-center">
                        +{(slide.highlights || []).length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {slide.galleryImages?.length || 0} gallery photo(s)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(slide)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Slide
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete destination slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Add / Edit Destination Modal */}
      {isModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingSlide.name ? `Edit: ${editingSlide.name}` : 'Add New Tourist Destination'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Provide photography, Tigrinya names, regional details, and descriptions for the showcase
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSlide(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Basic Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Destination Name (English) *">
                  <TextInput
                    value={editingSlide.name}
                    onChange={(e) => setEditingSlide({ ...editingSlide, name: e.target.value })}
                    placeholder="e.g. Asmara Modernist City"
                    required
                  />
                </Field>

                <Field label="Tigrinya Name (ትግርኛ)" help="Optional Ge'ez script title">
                  <TextInput
                    value={editingSlide.tigrinyaName || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, tigrinyaName: e.target.value })}
                    placeholder="e.g. ኣስመራ, ምጽዋዕ, ደሴታት ዳህላክ"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Showcase Category *">
                  <select
                    value={editingSlide.category}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="UNESCO & Architecture">UNESCO & Architecture</option>
                    <option value="Red Sea & Islands">Red Sea & Islands</option>
                    <option value="Archaeology & Ruins">Archaeology & Ruins</option>
                    <option value="Highlands & Escarpment">Highlands & Escarpment</option>
                    <option value="Nature & Wildlife">Nature & Wildlife</option>
                    <option value="Cultural & Historical">Cultural & Historical</option>
                  </select>
                </Field>

                <Field label="Region (Zoba / Location) *">
                  <TextInput
                    value={editingSlide.region}
                    onChange={(e) => setEditingSlide({ ...editingSlide, region: e.target.value })}
                    placeholder="e.g. Central Region (Maekel)"
                    required
                  />
                </Field>
              </div>

              {/* Tagline & Description */}
              <Field label="Tagline / Subtitle *" help="One punchy phrase summarizing the destination">
                <TextInput
                  value={editingSlide.tagline}
                  onChange={(e) => setEditingSlide({ ...editingSlide, tagline: e.target.value })}
                  placeholder="e.g. UNESCO World Heritage Site · Africa's Modernist Jewel"
                  required
                />
              </Field>

              <Field label="Detailed Description & Tourist Information *">
                <textarea
                  rows={3}
                  value={editingSlide.description}
                  onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                  placeholder="Describe the historical background, key sights, architectural styles, or diving reefs..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 leading-relaxed"
                  required
                />
              </Field>

              {/* Cover Picture & Image Controls */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-teal-600" />
                    Cover Picture (Main Showcase Image)
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileUpload}
                    className="hidden"
                  />
                </div>

                <Field label="Cover Image URL" help="Direct image link or use the upload button above">
                  <TextInput
                    value={editingSlide.imageUrl}
                    onChange={(e) => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    required
                  />
                </Field>

                {/* Preset Suggestions */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Quick Sample Photo Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_PRESET_IMAGES.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setEditingSlide({ ...editingSlide, imageUrl: preset.url })}
                        className="text-[10px] px-2 py-1 rounded-md bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 transition cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Image Preview */}
                {editingSlide.imageUrl && (
                  <div className="relative h-40 rounded-xl overflow-hidden border border-slate-300 bg-slate-900">
                    <img
                      src={editingSlide.imageUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-mono">
                      Cover Picture Preview
                    </span>
                  </div>
                )}
              </div>

              {/* Geographic & Seasonal Metadata */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Altitude / Elevation">
                  <TextInput
                    value={editingSlide.altitude}
                    onChange={(e) => setEditingSlide({ ...editingSlide, altitude: e.target.value })}
                    placeholder="e.g. 2,325 m / 7,628 ft"
                  />
                </Field>

                <Field label="Best Visiting Season">
                  <TextInput
                    value={editingSlide.bestTime}
                    onChange={(e) => setEditingSlide({ ...editingSlide, bestTime: e.target.value })}
                    placeholder="e.g. October – May"
                  />
                </Field>

                <Field label="Featured Tour Package">
                  <TextInput
                    value={editingSlide.featuredTourTitle || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, featuredTourTitle: e.target.value })}
                    placeholder="e.g. Cultural Tour of Eritrea"
                  />
                </Field>
              </div>

              <Field label="Climate & Weather">
                <TextInput
                  value={editingSlide.climate}
                  onChange={(e) => setEditingSlide({ ...editingSlide, climate: e.target.value })}
                  placeholder="e.g. Temperate highland mountain climate (18°C – 25°C)"
                />
              </Field>

              {/* Key Highlights Bullet Chips */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Highlights & Sights ({editingSlide.highlights?.length || 0})
                  </span>
                </div>

                <div className="flex gap-2">
                  <TextInput
                    value={activeHighlightDraft}
                    onChange={(e) => setActiveHighlightDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    placeholder="Add a key sight (e.g. Fiat Tagliero Futurist Station)..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    tone="primary"
                    icon={Plus}
                    onClick={handleAddHighlight}
                    disabled={!activeHighlightDraft.trim()}
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(editingSlide.highlights || []).map((h, hIdx) => (
                    <span
                      key={hIdx}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-800 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{h}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(hIdx)}
                        className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {(editingSlide.highlights || []).length === 0 && (
                    <span className="text-xs text-slate-400 italic">No highlights added yet.</span>
                  )}
                </div>
              </div>

              {/* Additional Photo Gallery Images */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-teal-600" />
                    Additional Gallery Photography ({editingSlide.galleryImages?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Gallery Photos
                  </button>
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex gap-2">
                  <TextInput
                    value={activeGalleryUrlDraft}
                    onChange={(e) => setActiveGalleryUrlDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGalleryUrl();
                      }
                    }}
                    placeholder="Paste additional high-res photo URL..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    tone="primary"
                    icon={Plus}
                    onClick={handleAddGalleryUrl}
                    disabled={!activeGalleryUrlDraft.trim()}
                  >
                    Add URL
                  </Button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                  {(editingSlide.galleryImages || []).map((img, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="relative h-20 rounded-lg overflow-hidden border border-slate-200 group bg-slate-900"
                    >
                      <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryUrl(imgIdx)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingSlide(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  tone="primary"
                  icon={CheckCircle2}
                  className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold border-none"
                >
                  Save Tourist Destination Slide
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
