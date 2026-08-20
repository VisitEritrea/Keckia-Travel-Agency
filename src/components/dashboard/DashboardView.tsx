import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Compass,
  FileCheck,
  Ticket,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Radio,
  FileText,
  Sparkles,
  Mountain,
} from 'lucide-react';
import {
  Employee,
  TourSchedule,
  TourPackage,
  TouristProfile,
  Booking,
  Ticket as TicketRecord,
  VisaOnArrivalDoc,
  ActiveTab,
} from '../../types';

interface DashboardViewProps {
  employees?: Employee[];
  schedules?: TourSchedule[];
  packages?: TourPackage[];
  tourists?: TouristProfile[];
  bookings?: Booking[];
  tickets?: TicketRecord[];
  visaDocs?: VisaOnArrivalDoc[];
  permits?: any[];
  setActiveTab?: (tab: ActiveTab) => void;
  onNavigate?: (tab: ActiveTab) => void;
  onOpenQuickAction?: () => void;
  onSelectSchedule?: (schedule: TourSchedule) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees = [],
  schedules = [],
  packages = [],
  tourists = [],
  bookings = [],
  tickets = [],
  visaDocs = [],
  permits = [],
  setActiveTab,
  onNavigate,
  onOpenQuickAction,
  onSelectSchedule,
}) => {
  const [chartView, setChartView] = useState<'revenue' | 'occupancy'>('revenue');

  const handleNavigate = (tab: ActiveTab) => {
    if (onNavigate) {
      onNavigate(tab);
    } else if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  // Computed metrics -- combines tour bookings and ticketing so this reflects
  // the whole company's revenue, not just one module's.
  const liveTickets = (tickets || []).filter((t) => t && t.status !== 'Cancelled');
  const totalTicketRevenue = liveTickets.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
  const totalRevenue =
    (bookings || []).reduce(
      (sum, b) => sum + (b && b.paymentStatus === 'Paid' ? (b.totalPrice || 0) : 0),
      0
    ) + totalTicketRevenue;
  const activeTours = (schedules || []).filter((s) => s && s.status === 'Active');
  const upcomingTours = (schedules || []).filter((s) => s && s.status === 'Upcoming');
  const guidesOnTour = (employees || []).filter((e) => e && e.status === 'On Tour').length;
  const pendingVoaCount = (visaDocs || []).filter(
    (v) => v && (v.issuanceStatus === 'Draft' || v.issuanceStatus === 'Approved')
  ).length;
  const draftVoaCount = (visaDocs || []).filter((v) => v && v.issuanceStatus === 'Draft').length;

  // Last 6 months (current month last), built from real bookings rather than fixed sample figures.
  const monthWindow = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return d;
  });
  const monthlyRevenueData = monthWindow.map((d, i) => {
    const monthBookings = (bookings || []).filter((b) => {
      if (!b || !b.bookingDate) return false;
      const bd = new Date(b.bookingDate);
      return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
    });
    const monthTickets = liveTickets.filter((t) => {
      const dateStr = t.paymentDate || t.bookingDate;
      if (!dateStr) return false;
      const td = new Date(dateStr);
      return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
    });
    const revenue =
      monthBookings.reduce((sum, b) => sum + (b.paymentStatus === 'Paid' ? b.totalPrice || 0 : 0), 0) +
      monthTickets.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
    return {
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      revenue,
      bookings: monthBookings.length + monthTickets.length,
      isHighlight: i === monthWindow.length - 1,
    };
  });
  const maxRevenue = Math.max(...monthlyRevenueData.map((m) => m.revenue), 1);
  const maxBookingsCount = Math.max(...monthlyRevenueData.map((m) => m.bookings), 1);
  const chartBars = monthlyRevenueData.map((m) => ({
    ...m,
    height:
      chartView === 'revenue'
        ? Math.max(Math.round((m.revenue / maxRevenue) * 100), m.revenue > 0 ? 8 : 4)
        : Math.max(Math.round((m.bookings / maxBookingsCount) * 100), m.bookings > 0 ? 8 : 4),
  }));

  const thisMonthRevenue = monthlyRevenueData[monthlyRevenueData.length - 1]?.revenue || 0;
  const lastMonthRevenue = monthlyRevenueData[monthlyRevenueData.length - 2]?.revenue || 0;
  const growthPct =
    lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 1000) / 10 : null;

  const convoysWithSeats = [...activeTours, ...upcomingTours].filter((s) => (s.totalSeats || 0) > 0);
  const averageConvoySize = convoysWithSeats.length
    ? Math.round(
        convoysWithSeats.reduce((sum, s) => sum + (s.bookedSeats || 0), 0) / convoysWithSeats.length
      )
    : 0;

  const formatRelativeTime = (iso?: string): string => {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const diffMs = Date.now() - then;
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  type FeedItem = { id: string; badge: string; badgeClass: string; title: string; subtitle: string; timestamp: string };
  const feedItems: FeedItem[] = [
    ...(visaDocs || [])
      .filter((v) => v && v.generatedAt)
      .map((v) => ({
        id: `voa-${v.id}`,
        badge: 'VoA',
        badgeClass: 'bg-orange-100 border-orange-200 text-orange-700',
        title: `Letter #${v.docNumber} ${v.issuanceStatus}`,
        subtitle: v.tourPackageTitle || v.touristName,
        timestamp: v.generatedAt,
      })),
    ...(bookings || [])
      .filter((b) => b && b.bookingDate)
      .map((b) => ({
        id: `bk-${b.id}`,
        badge: 'TK',
        badgeClass: 'bg-blue-100 border-blue-200 text-blue-700',
        title: `Booking ${b.bookingRef} ${b.paymentStatus}`,
        subtitle: `${b.numberOfSeats} pax · ${b.tourTitle}`,
        timestamp: b.bookingDate,
      })),
    ...(schedules || [])
      .filter((s) => s && s.leadGuideName && s.startDate)
      .map((s) => ({
        id: `sched-${s.id}`,
        badge: 'ST',
        badgeClass: 'bg-emerald-100 border-emerald-200 text-emerald-700',
        title: 'Lead Guide Assigned',
        subtitle: `${s.leadGuideName} assigned to ${s.tourTitle}`,
        timestamp: s.startDate,
      })),
    ...liveTickets
      .filter((t) => t && (t.paymentDate || t.bookingDate))
      .map((t) => ({
        id: `tkt-${t.id}`,
        badge: 'AIR',
        badgeClass: 'bg-sky-100 border-sky-200 text-sky-700',
        title: `Ticket ${t.pnr || t.bookingRef} ${t.paymentStatus || 'Pending'}`,
        subtitle: `${t.airline || 'Flight'} · ${t.touristName}`,
        timestamp: (t.paymentDate || t.bookingDate) as string,
      })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  return (
    <div id="dashboard-overview-container" className="space-y-6 pb-12">
      {/* Header Banner */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 italic leading-tight font-bold">
            Agency Intelligence
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-semibold">
            Real-time Field Operations · High Season 2026
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] uppercase tracking-widest flex items-center space-x-2 text-emerald-800 font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(15,178,135,0.55)]" />
            <span>HQ Dispatch Online</span>
          </div>
          <button
            onClick={() => handleNavigate('tours')}
            className="brand-gradient hover:brightness-105 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-brand transition transform active:scale-98 cursor-pointer"
          >
            Deploy Tour
          </button>
        </div>
      </header>

      {/* 4 Core KPI Stat Cards in Elegant Light */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Annual Yield */}
        <div className="bg-white border border-slate-200 p-5 rounded-[2rem] relative overflow-hidden shadow-xs hover:border-brand-300 hover:shadow-md transition group">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-500" />
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl font-serif italic text-brand-600 pointer-events-none select-none">
            $
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-semibold">
            Expedition Revenue MTD
          </p>
          <p className="text-2xl font-serif text-slate-900 tracking-tight font-bold">
            ${totalRevenue.toLocaleString()}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p
              className={`text-[10px] font-mono tracking-tighter flex items-center font-bold ${
                growthPct === null ? 'text-slate-400' : growthPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {growthPct === null ? (
                'No prior month to compare'
              ) : (
                <>
                  <ArrowUpRight className={`w-3 h-3 mr-0.5 ${growthPct < 0 ? 'rotate-90' : ''}`} />
                  {growthPct >= 0 ? '+' : ''}
                  {growthPct}% vs last month
                </>
              )}
            </p>
            <button
              onClick={() => handleNavigate('tickets')}
              className="text-[10px] text-amber-800 hover:text-amber-950 hover:underline font-mono uppercase tracking-wider font-semibold cursor-pointer"
            >
              Ledger →
            </button>
          </div>
        </div>

        {/* Card 2: Active Expeditions */}
        <div className="bg-white border border-slate-200 p-5 rounded-[2rem] relative overflow-hidden shadow-xs hover:border-lagoon-300 hover:shadow-md transition">
          <div className="absolute inset-x-0 top-0 h-1 bg-lagoon-500" />
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-semibold">
            Active Expeditions
          </p>
          <p className="text-2xl font-serif text-slate-900 tracking-tight font-bold">
            {activeTours.length} Convoys Live
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-orange-700 font-mono tracking-tighter font-semibold">
              {upcomingTours.length} Departures Scheduled
            </p>
            <button
              onClick={() => handleNavigate('tours')}
              className="text-[10px] text-amber-800 hover:text-amber-950 hover:underline font-mono uppercase tracking-wider font-semibold cursor-pointer"
            >
              Calendar →
            </button>
          </div>
        </div>

        {/* Card 3: Immigration Desk */}
        <div className="bg-white border border-slate-200 p-5 rounded-[2rem] relative overflow-hidden shadow-xs hover:border-brand-300 hover:shadow-md transition">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-500" />
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-semibold">
            Immigration Desk
          </p>
          <p className="text-2xl font-serif text-slate-900 tracking-tight font-bold">
            {pendingVoaCount} Active VoA
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-sky-700 font-mono tracking-tighter font-semibold">
              {draftVoaCount} Pending Clearance
            </p>
            <button
              onClick={() => handleNavigate('documents')}
              className="text-[10px] text-amber-800 hover:text-amber-950 hover:underline font-mono uppercase tracking-wider font-semibold cursor-pointer"
            >
              VoA Hub →
            </button>
          </div>
        </div>

        {/* Card 4: Staff Readiness */}
        <div className="bg-white border border-slate-200 p-5 rounded-[2rem] relative overflow-hidden shadow-xs hover:border-lagoon-300 hover:shadow-md transition">
          <div className="absolute inset-x-0 top-0 h-1 bg-lagoon-500" />
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-semibold">
            Staff Readiness
          </p>
          <p className="text-2xl font-serif text-slate-900 tracking-tight font-bold">
            {guidesOnTour} / {employees.length} on Duty
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full brand-hairline"
              style={{
                width: `${Math.round((guidesOnTour / Math.max(employees.length, 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Inventory Flow & Live Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Spans: Inventory Flow Chart & Packages */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inventory Flow Box */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 flex flex-col shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-serif italic text-slate-900 font-bold">
                  Inventory Flow & Revenue Trajectory
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5 font-semibold">
                  Passenger manifests vs Capacity (USD)
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-200">
                  <button
                    onClick={() => setChartView('revenue')}
                    className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider transition ${
                      chartView === 'revenue'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Revenue ($)
                  </button>
                  <button
                    onClick={() => setChartView('occupancy')}
                    className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider transition ${
                      chartView === 'occupancy'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Bookings
                  </button>
                </div>
              </div>
            </div>

            {/* Cylinder Bar Chart */}
            <div className="h-52 flex items-end justify-between space-x-4 px-2 pt-4 border-b border-slate-100 pb-2">
              {chartBars.map((item) => (
                <div
                  key={item.month}
                  className="h-full w-full flex flex-col items-center justify-end space-y-3 group"
                >
                  <div
                    title={
                      chartView === 'revenue'
                        ? `$${item.revenue.toLocaleString()}`
                        : `${item.bookings} booking${item.bookings === 1 ? '' : 's'}`
                    }
                    className={`w-10 rounded-full relative transition-all duration-300 ${
                      item.isHighlight ? 'bg-[#B73114] shadow-sm' : 'bg-[#134E6F]'
                    }`}
                    style={{ height: `${item.height}%` }}
                  />
                  <span
                    className={`text-[10px] font-mono ${
                      item.isHighlight
                        ? 'text-orange-700 font-bold'
                        : 'text-slate-500 font-medium'
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 font-medium">
              <span>This month: ${thisMonthRevenue.toLocaleString()}</span>
              <span className="text-amber-800 font-mono font-bold">
                Average Convoy Size: {averageConvoySize} Travelers
              </span>
            </div>
          </div>

          {/* Top Selling Packages in Light Theme */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 flex flex-col shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-serif italic text-slate-900 font-bold">
                  Expedition Packages & Occupancy
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                  Ranked by popularity & logistics readiness
                </p>
              </div>
              <button
                onClick={() => handleNavigate('packages')}
                className="text-[10px] text-amber-800 hover:text-amber-950 hover:underline font-mono uppercase tracking-wider flex items-center gap-1 font-bold cursor-pointer"
              >
                All Packages <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {(packages || []).map((pkg) => {
                const totalSeats = pkg.maxCapacity;
                const relatedSchedules = (schedules || []).filter((s) => s && s.tourPackageId === pkg.id);
                const booked = relatedSchedules.reduce((acc, s) => acc + (s.bookedSeats || 0), 0);
                const occupancyRate = Math.min(
                  Math.round((booked / (totalSeats * 2)) * 100),
                  100
                );

                return (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {pkg.coverImage ? (
                        <img
                          src={pkg.coverImage}
                          alt={pkg.title}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 ring-1 ring-slate-200 shrink-0 flex items-center justify-center text-slate-300">
                          <Mountain className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate font-serif">
                            {pkg.title}
                          </h4>
                          <span
                            className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold tracking-wider ${
                              pkg.difficulty === 'Extreme'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : pkg.difficulty === 'Challenging'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {pkg.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">
                          {pkg.durationDays} Days · {pkg.region} · Tariff: ${pkg.basePrice}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 shrink-0 justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-xs font-mono text-slate-700 font-semibold">
                          {booked} / {totalSeats * 2} Booked
                        </div>
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                          <div
                            style={{ width: `${occupancyRate}%` }}
                            className="h-full bg-amber-500 rounded-full"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleNavigate('packages')}
                        className="p-2 rounded-xl bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition border border-slate-200 shadow-xs"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Span: Live Ledger & Field Radar */}
        <div className="space-y-6">
          {/* Live Ledger (matches Design HTML) */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 flex flex-col overflow-hidden shadow-xs">
            <h3 className="text-xl font-serif italic text-slate-900 font-bold mb-6">
              Live Ledger & Feed
            </h3>
            <div className="space-y-5 flex-1">
              {feedItems.length === 0 && (
                <p className="text-xs text-slate-400 font-medium">No recent activity yet.</p>
              )}
              {feedItems.map((item) => (
                <div key={item.id} className="flex space-x-3.5 items-start">
                  <div
                    className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-[10px] font-bold shrink-0 ${item.badgeClass}`}
                  >
                    {item.badge}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-500 truncate font-medium">{item.subtitle}</p>
                    <p className="text-[9px] mt-1 text-amber-800 font-mono font-bold">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Field Operations Radar */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 flex flex-col shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <h3 className="text-base font-serif italic text-slate-900 font-bold">Live Field Radios</h3>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                HF Channel 4
              </span>
            </div>

            <div className="space-y-3">
              {(schedules || [])
                .filter((s) => s && (s.status === 'Active' || s.status === 'Upcoming'))
                .slice(0, 3)
                .map((schedule) => (
                  <div
                    key={schedule.id}
                    onClick={() => onSelectSchedule ? onSelectSchedule(schedule) : handleNavigate('tours')}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 cursor-pointer transition shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 font-serif">
                        {schedule.destination}
                      </span>
                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
                          schedule.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {schedule.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-900 font-semibold mt-1 truncate">
                      {schedule.tourTitle}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Guide: {schedule.leadGuideName}</span>
                      <span>
                        {schedule.bookedSeats}/{schedule.totalSeats} Pax
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2 Quick Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div
          onClick={() => handleNavigate('documents')}
          className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-[1.5rem] flex items-center p-6 space-x-5 cursor-pointer hover:border-orange-300 transition group shadow-xs"
        >
          <div className="w-12 h-12 bg-[#B73114] rounded-2xl flex items-center justify-center transform -rotate-6 shadow-md shrink-0 group-hover:rotate-0 transition">
            <span className="text-white font-black text-xs uppercase font-mono">Docs</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 font-serif">Visa & Regional Permit Hub</p>
            <p className="text-[11px] text-slate-600 truncate font-medium">
              Auto-generate official Ministry of Tourism VoA letters & Zoba travel clearances.
            </p>
          </div>
        </div>

        <div
          onClick={() => handleNavigate('tickets')}
          className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-[1.5rem] flex items-center p-6 space-x-5 cursor-pointer hover:border-blue-300 transition group shadow-xs"
        >
          <div className="w-12 h-12 bg-[#134E6F] rounded-2xl flex items-center justify-center transform rotate-6 shadow-md shrink-0 group-hover:rotate-0 transition">
            <span className="text-white font-black text-xs uppercase font-mono">Q-Iss</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 font-serif">Digital Ticket Terminal</p>
            <p className="text-[11px] text-slate-600 truncate font-medium">
              Real-time inventory mapping and luxury QR boarding pass issuance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
