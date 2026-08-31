import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Maximize2,
  Minimize2,
  MapPin,
  Mountain,
  Compass,
  Calendar,
  Sparkles,
  Layers,
  Camera,
  Info,
  ExternalLink,
  ChevronDown,
  X,
  Eye,
  Sun,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { useSystemSettings } from '../../lib/settings';

export interface DestinationSlide {
  id: string;
  name: string;
  tigrinyaName?: string;
  region: string;
  category: 'UNESCO & Architecture' | 'Red Sea & Islands' | 'Archaeology & Ruins' | 'Highlands & Escarpment' | 'Nature & Wildlife' | string;
  tagline: string;
  description: string;
  imageUrl: string;
  galleryImages: string[];
  altitude: string;
  bestTime: string;
  highlights: string[];
  climate: string;
  featuredTourTitle?: string;
}

export const DESTINATIONS_DATA: DestinationSlide[] = [
  {
    id: 'asmara-unesco',
    name: 'Asmara Modernist City',
    tigrinyaName: 'ኣስመራ',
    region: 'Central Region (Maekel)',
    category: 'UNESCO & Architecture',
    tagline: "UNESCO World Heritage Site · Africa's Modernist Jewel",
    description:
      'Perched at 2,325 meters above sea level, Asmara is a pristine open-air museum of 1930s Italian futurist, art deco, and rationalist architecture. Famed for palm-lined Harnet Avenue, historic espresso cafés, Cinema Impero, and the iconic airplane-winged Fiat Tagliero building.',
    imageUrl:
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&auto=format&fit=crop&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&auto=format&fit=crop&q=80',
    ],
    altitude: '2,325 m / 7,628 ft',
    bestTime: 'October – May (Mild Highlands Spring)',
    highlights: [
      'Fiat Tagliero Service Station (1938 Futurist Masterpiece)',
      'Cinema Impero & Cinema Roma Historic Theatres',
      'Harnet Avenue Café Society & Italian Espresso Culture',
      'Enda Mariam Coptic Cathedral & Grand Mosque of Al-Khulafa',
    ],
    climate: 'Temperate highland mountain climate (18°C – 25°C)',
    featuredTourTitle: 'Cultural Tour of Eritrea — Asmara, Keren & Massawa',
  },
  {
    id: 'massawa-red-sea',
    name: 'Massawa & Old Coral City',
    tigrinyaName: 'ምጽዋዕ',
    region: 'Semenawi Keyih Bahri (Northern Red Sea)',
    category: 'Red Sea & Islands',
    tagline: 'Pearl of the Red Sea · Ottoman & Venetian Coral Heritage',
    description:
      'A historic port crossroads where Ottoman, Egyptian, and Italian architectural layers meet the turquoise Red Sea waters. Walk through coral-stone alleyways, visit the Sheikh Hanafi Mosque, and dine on fresh grilled red snapper by the active harbour docks.',
    imageUrl:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&auto=format&fit=crop&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&auto=format&fit=crop&q=80',
    ],
    altitude: '10 m / 33 ft (Coastline)',
    bestTime: 'November – April (Cool Sea Breeze)',
    highlights: [
      '16th-Century Ottoman Coral-Stone Quarters & Carved Wooden Balconies',
      'Imperial Palace Waterfront Ruins & Historic Customs Port',
      'Gurgusum Golden Sand Beach & Marine Diving Outpost',
      'Traditional Red Sea Catch-of-the-Day Waterfront Dining',
    ],
    climate: 'Tropical coastal desert climate (28°C – 34°C)',
    featuredTourTitle: 'Red Sea Coastline & Dahlak Marine Expedition',
  },
  {
    id: 'dahlak-archipelago',
    name: 'Dahlak Archipelago Marine Reserve',
    tigrinyaName: 'ደሴታት ዳህላክ',
    region: 'Red Sea Coral Reefs',
    category: 'Red Sea & Islands',
    tagline: 'Untouched Island Wilderness · 350+ Marine Coral Species',
    description:
      'Over 200 uninhabited coral atolls and islands offering some of the purest, least-disturbed scuba diving on planet Earth. Swim with manta rays, sea turtles, and bottlenose dolphins among pristine coral gardens, with desert island camping under crystal Milky Way night skies.',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520255870062-bd79d3865de7?w=1200&auto=format&fit=crop&q=80',
    ],
    altitude: '0 m / Sea Level',
    bestTime: 'October – April (Calm Diving Waters)',
    highlights: [
      'Dissei & Madote Island Coral Drop-offs & White Sand Bars',
      'Dolphin Pods, Whale Sharks (Seasonal) & Dugong Sanctuaries',
      'Desert Island Beach Camping with Fresh Grilled Seafood',
      'Ancient Kufic Inscriptions & Ancient Red Sea Trade Cisterns',
    ],
    climate: 'Warm marine environment with crystal visibility up to 30m',
    featuredTourTitle: 'Diving & Camping Tour — Dahlak Archipelago',
  },
  {
    id: 'qohaito-ruins',
    name: 'Qohaito Plateau & Ancient Ruins',
    tigrinyaName: 'ቆሓይቶ',
    region: 'Southern Region (Debub)',
    category: 'Archaeology & Ruins',
    tagline: 'Axumite Antiquity · 1,000-Meter Canyon Precipice',
    description:
      'An expansive highland plateau hosting over 2,500 years of Axumite archaeological heritage. Stand before the megalithic Temple of Mariam Wakiro, the ancient Safra Dam, and peer down the staggering 1,000-meter drop into the Great Rift Valley canyon.',
    imageUrl:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&auto=format&fit=crop&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    ],
    altitude: '2,600 m / 8,530 ft',
    bestTime: 'September – April (Crisp Highland Vistas)',
    highlights: [
      'Temple of Mariam Wakiro (Axumite Monolithic Pillars)',
      'Ancient Safra Dam with Ge’ez Inscriptions',
      'Egyptian Tomb & Prehistoric Rock Art at Adi Alauti',
      'Breathtaking Escarpment View overlooking the Red Sea Plains',
    ],
    climate: 'Crisp mountain plateau with fresh highland winds',
    featuredTourTitle: 'Archaeological Highlands & Ancient Qohaito',
  },
  {
    id: 'keren-market',
    name: 'Keren & Mariam Dearit Baobab',
    tigrinyaName: 'ከረን',
    region: 'Anseba Region',
    category: 'UNESCO & Architecture',
    tagline: 'Cultural Crossroads · Historic Camel Market & Baobab Shrine',
    description:
      'Set in a lush mountain valley, Keren is the second-largest city and the cultural heart of the Bilen and Tigre peoples. Renowned worldwide for its bustling Monday camel and cattle market, Italian-era railway structures, and the sacred Mariam Dearit shrine housed in a hollow 500-year-old baobab tree.',
    imageUrl:
      'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1600&auto=format&fit=crop&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&auto=format&fit=crop&q=80',
    ],
    altitude: '1,390 m / 4,560 ft',
    bestTime: 'All Year Round (Mondays for Livestock Market)',
    highlights: [
      'Legendary Monday Camel, Cattle & Spice Marketplace',
      'Mariam Dearit Shrine (Virgin Mary Chapel inside a living Baobab)',
      'Historic 1941 Battle of Keren Memorials & War Cemeteries',
      'Tigu Egyptian Fortress perched above the city',
    ],
    climate: 'Warm sub-tropical valley climate (24°C – 30°C)',
    featuredTourTitle: 'Keren Cultural Crossroads & Highland Escarpment',
  },
  {
    id: 'debre-bizen',
    name: 'Debre Bizen Mountain Monastery',
    tigrinyaName: 'ደብረ ቢዘን',
    region: 'Mount Bizen Escarpment (Maekel / NRS)',
    category: 'Highlands & Escarpment',
    tagline: '14th-Century Eagle’s Nest · Sacred Monastic Fortress (Est. 1350)',
    description:
      'Perched on the summit of a steep 2,450-meter granite ridge overlooking the clouds, Debre Bizen is the spiritual citadel of the Eritrean Orthodox Church. Founded in 1350 AD by Abba Filipos, it preserves priceless illuminated Ge’ez manuscripts and affords panoramic vistas to the Red Sea.',
    imageUrl:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&auto=format&fit=crop&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    ],
    altitude: '2,450 m / 8,038 ft',
    bestTime: 'October – May (Clear Hiking Skies)',
    highlights: [
      'Medieval Monastic Complex founded in 1350 AD',
      'Ancient Illuminated Parchments & Sacred Ge’ez Texts',
      'Challenging 3-hour pilgrim trek through cloud-forest ridges',
      'Spectacular 360-degree panorama above the cloud sea',
    ],
    climate: 'Alpine highland mountain air with morning mist',
    featuredTourTitle: 'Highland Pilgrimage & Debre Bizen Trek',
  },
  {
    id: 'filfil-green-belt',
    name: 'Filfil Solomuna & Semenawi Bahri',
    tigrinyaName: 'ፊልፊል ሰለሙና',
    region: 'Northern Red Sea Escarpment',
    category: 'Nature & Wildlife',
    tagline: 'The Green Belt · Tropical Cloud Rainforest of the Horn',
    description:
      'Known as the "Green Belt" of Eritrea, this lush evergreen cloud forest cascades down the eastern escarpment toward the Red Sea. Characterized by hairpin switchbacks, dense wild olive and cedar canopies, coffee farms, and hundreds of rare Horn of Africa bird species.',
    imageUrl:
      'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1600&auto=format&fit=crop&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1200&auto=format&fit=crop&q=80',
    ],
    altitude: '1,800 m – 900 m (Descending Rainforest)',
    bestTime: 'October – March (Peak Lush Foliage)',
    highlights: [
      'Semenawi Bahri National Park Evergreen Escarpment Drive',
      'Rare Birding (African Citril, Hemprich’s Hornbill, Abyssinian Woodpecker)',
      'Scenic Lookout Points at Sabur and Medhanit over Sea of Clouds',
      'Local Coffee & Honey Tasting in Mountain Eco-Villages',
    ],
    climate: 'Moist sub-tropical mountain cloud forest (18°C – 26°C)',
    featuredTourTitle: 'Green Belt Nature Safari & Birding Expedition',
  },
  {
    id: 'senafe-metera',
    name: 'Metera Stele & Senafe Granite Peaks',
    tigrinyaName: 'መተራን ሰንዓፈን',
    region: 'Southern Region (Debub)',
    category: 'Archaeology & Ruins',
    tagline: 'The Great Hawulti Stele · Granite Monoliths & Mount Emba Soira',
    description:
      'Guarded by dramatic granite monolithic pinnacles, Metera is home to the famous 5-meter tall 3rd-century BC Hawulti Stele, inscribed with the oldest known royal Ge’ez text. Situated near Mount Emba Soira (3,018m), Eritrea’s highest peak.',
    imageUrl:
      'https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=1600&auto=format&fit=crop&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80',
    ],
    altitude: '2,200 m / 7,217 ft',
    bestTime: 'October – April',
    highlights: [
      'Ancient 5-meter Inscribed Hawulti Stele (Pre-Christian Era)',
      'Ruins of Royal Axumite Palaces and Residential Complexes',
      'Granite Rock Formations of Metera and Senafe Spires',
      'Gateway to Mount Emba Soira (3,018m) Summit Treks',
    ],
    climate: 'Cool, invigorating highland mountain climate',
    featuredTourTitle: 'Southern Antiquities & Metera Archaeological Trail',
  },
];

const CATEGORIES = [
  'All Destinations',
  'UNESCO & Architecture',
  'Red Sea & Islands',
  'Archaeology & Ruins',
  'Highlands & Escarpment',
  'Nature & Wildlife',
] as const;

interface TouristDestinationSlideshowProps {
  onNavigate?: (tab: ActiveTab) => void;
}

export const TouristDestinationSlideshow: React.FC<TouristDestinationSlideshowProps> = ({
  onNavigate,
}) => {
  const { settings } = useSystemSettings();
  const dashboardSettings = settings.dashboard;

  // Custom destinations parsed from settings
  const allDestinations: DestinationSlide[] = React.useMemo(() => {
    const raw = dashboardSettings?.texts?.customDestinationsJson;
    if (raw && raw.trim().length > 0) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing customDestinationsJson', e);
      }
    }
    return DESTINATIONS_DATA;
  }, [dashboardSettings?.texts?.customDestinationsJson]);

  // Categories list from settings or defaults
  const categoriesList = React.useMemo(() => {
    const fromSettings = dashboardSettings?.lists?.showcaseCategories ?? [];
    if (fromSettings.length > 0) {
      return ['All Destinations', ...fromSettings];
    }
    return CATEGORIES;
  }, [dashboardSettings?.lists?.showcaseCategories]);

  const slideDurationSeconds = dashboardSettings?.numbers?.slideDurationSeconds ?? 6;
  const SLIDE_DURATION = Math.max(3, slideDurationSeconds) * 1000;
  const initialAutoPlay = dashboardSettings?.toggles?.autoPlaySlideshow ?? true;
  const showTigrinya = dashboardSettings?.toggles?.showTigrinyaTitles ?? true;
  const showThumbnails = dashboardSettings?.toggles?.showThumbnailCarousel ?? true;
  const headerTitle = dashboardSettings?.texts?.showcaseHeaderTitle || 'Eritrea Tourist Destinations';
  const badgeText = dashboardSettings?.texts?.showcaseBadgeText || 'Pictorial Showcase';

  const [selectedCategory, setSelectedCategory] = useState<string>('All Destinations');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(initialAutoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filtered slides based on selected category
  const filteredSlides = React.useMemo(() => {
    if (selectedCategory === 'All Destinations') {
      return allDestinations;
    }
    return allDestinations.filter((d) => d.category === selectedCategory);
  }, [selectedCategory, allDestinations]);

  // Ensure currentIndex stays within bounds when category changes
  useEffect(() => {
    setCurrentIndex(0);
    setProgress(0);
  }, [selectedCategory, allDestinations]);

  const currentSlide = filteredSlides[currentIndex] || filteredSlides[0] || allDestinations[0] || DESTINATIONS_DATA[0];

  // Auto-play timer with progress ticker
  useEffect(() => {
    if (!isPlaying || filteredSlides.length <= 1) {
      setProgress(0);
      return;
    }

    const intervalTime = 50; // update progress every 50ms
    const step = (intervalTime / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((curr) => (curr + 1) % filteredSlides.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, filteredSlides.length, currentIndex, SLIDE_DURATION]);

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % filteredSlides.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + filteredSlides.length) % filteredSlides.length);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      id="tourist-destination-slideshow"
      className={`relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'w-full'
      }`}
    >
      {/* 1. Top Bar: Category Pill Filters & Controls */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              {headerTitle}
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                {badgeText}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Explore iconic UNESCO landmarks, Red Sea islands, ancient Axumite ruins & highland passes
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Slideshow Viewport */}
      <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[540px] overflow-hidden group">
        {/* Background Image with Smooth Fade */}
        <img
          key={currentSlide.id}
          src={currentSlide.imageUrl}
          alt={currentSlide.name}
          className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-1000 scale-105 group-hover:scale-100 animate-in fade-in duration-500"
        />

        {/* Multi-layered Vignettes for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent max-w-2xl" />

        {/* Slide Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800/60 z-30 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Left / Right Nav Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous Destination"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-950/60 hover:bg-teal-600/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-lg hover:scale-110 cursor-pointer opacity-80 group-hover:opacity-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Destination"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-950/60 hover:bg-teal-600/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-lg hover:scale-110 cursor-pointer opacity-80 group-hover:opacity-100"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Bottom Overlay: Destination Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500 text-slate-950 font-sans shadow-xs">
                {currentSlide.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-300 font-medium bg-slate-900/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-700/60">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                {currentSlide.region}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-300 font-medium bg-slate-900/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-700/60 font-mono">
                <Mountain className="w-3.5 h-3.5 text-amber-400" />
                {currentSlide.altitude}
              </span>
            </div>

            {/* Destination Titles */}
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {currentSlide.name}
                </h1>
                {showTigrinya && currentSlide.tigrinyaName && (
                  <span className="text-xl sm:text-2xl font-bold text-teal-300 font-serif opacity-90 drop-shadow-sm">
                    {currentSlide.tigrinyaName}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-teal-200 mt-1 drop-shadow-sm">
                {currentSlide.tagline}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-2xl text-shadow">
              {currentSlide.description}
            </p>

            {/* Key Highlight Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {currentSlide.highlights.slice(0, 3).map((h, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-200 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/50"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Quick CTA Actions & Control Buttons */}
          <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-teal-400" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => setGalleryModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                title="View Photo Gallery"
              >
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Gallery ({currentSlide.galleryImages.length})</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md border border-slate-700 text-xs font-bold transition flex items-center justify-center cursor-pointer shadow-md"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Slideshow'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('packages')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-105"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Tour Packages</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Interactive Thumbnail Carousel Bar */}
      {showThumbnails && (
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Destination Gallery ({currentIndex + 1} of {filteredSlides.length})
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Best Visiting Season: <span className="text-teal-300 font-bold">{currentSlide.bestTime}</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {filteredSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setProgress(0);
                }}
                className={`relative shrink-0 w-28 sm:w-36 h-18 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer group/thumb ${
                  currentIndex === idx
                    ? 'border-teal-400 ring-2 ring-teal-400/40 scale-105 z-10 shadow-lg'
                    : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                }`}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.name}
                  className="w-full h-full object-cover group-hover/thumb:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                <span className="absolute bottom-1 left-1.5 right-1.5 text-[10px] font-bold text-white truncate text-left">
                  {slide.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Full Photo Gallery Lightbox Modal */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {currentSlide.name} · High Resolution Photography
              </h3>
              <p className="text-xs text-slate-400">{currentSlide.tagline}</p>
            </div>
            <button
              onClick={() => setGalleryModalOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-hidden rounded-2xl bg-black border border-slate-800">
            <img
              src={currentSlide.galleryImages[activeGalleryIndex] || currentSlide.imageUrl}
              alt={currentSlide.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="flex items-center justify-center gap-3 mt-4">
            {currentSlide.galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveGalleryIndex(i)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                  activeGalleryIndex === i ? 'border-teal-400 scale-105' : 'border-slate-700 opacity-60'
                }`}
              >
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
