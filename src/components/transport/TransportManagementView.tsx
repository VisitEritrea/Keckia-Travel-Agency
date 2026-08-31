import React, { useState, useMemo } from 'react';
import {
  Truck,
  Car,
  Bus,
  Ship,
  Train,
  Plus,
  Search,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Gauge,
  Fuel,
  MapPin,
  User,
  Phone,
  Calendar,
  ShieldCheck,
  Eye,
  Edit3,
  Wrench,
  DollarSign,
  Building2,
  Anchor,
  FileText,
  Printer,
  Download,
  CreditCard,
  Layers,
  ArrowRight,
  Filter,
  Sparkles,
  Compass,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Radio,
} from 'lucide-react';
import {
  Vehicle,
  VehicleType,
  VehicleStatus,
  FleetCategory,
  OwnershipType,
  RentalLetterDoc,
  FinancialTransaction,
} from '../../types';
import { AddEditVehicleModal } from './AddEditVehicleModal';
import { VehicleDetailsModal } from './VehicleDetailsModal';
import { RentalLetterModal } from './RentalLetterModal';
import { exportToCSV } from '../../utils/exportUtils';

interface TransportManagementViewProps {
  vehicles: Vehicle[];
  rentalLetters?: RentalLetterDoc[];
  /** Only the administrator may change a fleet asset that is already saved. */
  canEdit?: boolean;
  onAddVehicle: (vehicle: Vehicle) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onUpdateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void;
  onSaveRentalLetter?: (letter: RentalLetterDoc) => void;
  onAddFinancialTransaction?: (txn: FinancialTransaction) => void;
}

export const TransportManagementView: React.FC<TransportManagementViewProps> = ({
  vehicles = [],
  rentalLetters = [],
  canEdit = false,
  onAddVehicle,
  onUpdateVehicle,
  onUpdateVehicleStatus,
  onSaveRentalLetter,
  onAddFinancialTransaction,
}) => {
  // Navigation Subtabs
  const [activeMainTab, setActiveMainTab] = useState<
    'all_assets' | 'rented_vehicles' | 'boat_rentals' | 'expense_tracker' | 'rental_letters'
  >('all_assets');

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('all');
  const [selectedRentalCompany, setSelectedRentalCompany] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [inspectingVehicle, setInspectingVehicle] = useState<Vehicle | null>(null);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [selectedLetterForView, setSelectedLetterForView] = useState<RentalLetterDoc | null>(null);
  const [vehicleForLetter, setVehicleForLetter] = useState<Vehicle | null>(null);
  const [showOnTourDrawer, setShowOnTourDrawer] = useState(false);

  // Quick Payment Modal State
  const [paymentModalVehicle, setPaymentModalVehicle] = useState<Vehicle | null>(null);
  const [paymentAmountUSD, setPaymentAmountUSD] = useState<number>(0);
  const [paymentNote, setPaymentNote] = useState<string>('Final balance settlement via bank wire');

  // Filtered vehicles list based on active tab & filters
  const filteredVehicles = useMemo(() => {
    return (vehicles || []).filter((veh) => {
      // Tab constraint
      if (activeMainTab === 'rented_vehicles') {
        if (veh.ownershipType !== 'Rented / Third-Party') return false;
        if (veh.category === 'Boat / Marine Vessel' || veh.type === 'Marine Speedboat' || veh.type === 'Traditional Motorized Dhow') {
          return false;
        }
      } else if (activeMainTab === 'boat_rentals') {
        if (veh.category !== 'Boat / Marine Vessel' && veh.type !== 'Marine Speedboat' && veh.type !== 'Traditional Motorized Dhow') {
          return false;
        }
      } else if (activeMainTab === 'expense_tracker') {
        if (veh.ownershipType !== 'Rented / Third-Party') return false;
      }

      const matchesType = selectedType === 'all' || veh.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || veh.status === selectedStatus;
      const matchesOwnership = selectedOwnership === 'all' || veh.ownershipType === selectedOwnership;
      const matchesCompany =
        selectedRentalCompany === 'all' || (veh.rentalCompany && veh.rentalCompany === selectedRentalCompany);

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        veh.name.toLowerCase().includes(q) ||
        veh.model.toLowerCase().includes(q) ||
        veh.plateNumber.toLowerCase().includes(q) ||
        (veh.assignedDriverName || '').toLowerCase().includes(q) ||
        (veh.rentalCompany || '').toLowerCase().includes(q) ||
        (veh.marinePort || '').toLowerCase().includes(q) ||
        (veh.currentLocation || '').toLowerCase().includes(q);

      return matchesType && matchesStatus && matchesOwnership && matchesCompany && matchesSearch;
    });
  }, [
    vehicles,
    activeMainTab,
    selectedType,
    selectedStatus,
    selectedOwnership,
    selectedRentalCompany,
    searchQuery,
  ]);

  // Distinct Rental Companies list
  const distinctRentalCompanies = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => {
      if (v.rentalCompany) set.add(v.rentalCompany);
    });
    return Array.from(set);
  }, [vehicles]);

  // Operational Fleet Status KPIs
  const totalFleet = (vehicles || []).length;

  const companyOwnedVehicles = useMemo(
    () => (vehicles || []).filter((v) => v.ownershipType === 'Company Owned'),
    [vehicles]
  );
  const availableCompanyCars = useMemo(
    () => companyOwnedVehicles.filter((v) => v.status === 'Available'),
    [companyOwnedVehicles]
  );

  const rentedCars = useMemo(
    () =>
      (vehicles || []).filter(
        (v) =>
          v.ownershipType === 'Rented / Third-Party' &&
          v.category !== 'Boat / Marine Vessel' &&
          v.type !== 'Marine Speedboat' &&
          v.type !== 'Traditional Motorized Dhow'
      ),
    [vehicles]
  );
  const availableRentedCars = useMemo(
    () => rentedCars.filter((v) => v.status === 'Available'),
    [rentedCars]
  );

  const rentedBoats = useMemo(
    () =>
      (vehicles || []).filter(
        (v) =>
          v.category === 'Boat / Marine Vessel' ||
          v.type === 'Marine Speedboat' ||
          v.type === 'Traditional Motorized Dhow'
      ),
    [vehicles]
  );
  const availableRentedBoats = useMemo(
    () => rentedBoats.filter((v) => v.status === 'Available'),
    [rentedBoats]
  );

  const vehiclesOnTour = useMemo(
    () => (vehicles || []).filter((v) => v.status === 'On Tour'),
    [vehicles]
  );

  const rentedCarsCount = rentedCars.length;
  const rentedBoatsCount = rentedBoats.length;

  // Rental Financial Analytics (for Expense Ledger)
  const rentedAssets = useMemo(
    () => (vehicles || []).filter((v) => v.ownershipType === 'Rented / Third-Party'),
    [vehicles]
  );
  const totalRentalCommitmentUSD = rentedAssets.reduce((sum, v) => sum + (v.totalRentCostUSD || 0), 0);
  const totalRentalPaidUSD = rentedAssets.reduce((sum, v) => sum + (v.totalRentPaidUSD || 0), 0);
  const totalRentalPendingUSD = rentedAssets.reduce((sum, v) => sum + (v.totalRentPendingUSD || 0), 0);
  const fullySettledCount = rentedAssets.filter((v) => v.rentalPaymentStatus === 'Paid').length;
  const pendingSettlementCount = rentedAssets.filter((v) => v.rentalPaymentStatus !== 'Paid').length;

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case '4WD SUV Convoy':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'Luxury Coaster Bus':
        return <Bus className="w-4 h-4 text-amber-600" />;
      case 'VIP HiAce Minivan':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'Marine Speedboat':
      case 'Traditional Motorized Dhow':
        return <Ship className="w-4 h-4 text-cyan-600" />;
      case 'Historic Steam Railway':
        return <Train className="w-4 h-4 text-purple-600" />;
      default:
        return <Truck className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Plate / Reg Number (ሰሌዳ)',
      'Vehicle / Vessel Name',
      'Model & Spec',
      'Type',
      'Category',
      'Ownership',
      'Rental Company',
      'Daily Rate (USD)',
      'Rental Days',
      'Total Cost (USD)',
      'Paid (USD)',
      'Pending Balance (USD)',
      'Payment Status',
      'Capacity (Pax)',
      'Assigned Driver / Captain',
      'Contact Phone',
      'Commercial License / Reg',
      'Status',
      'Location / Port',
      'Fuel Level (%)',
      'Odometer / Hours',
      'Insurance Expiry',
      'Inspection Expiry',
    ];

    const rows = filteredVehicles.map((v) => [
      v.plateNumber || '',
      v.name || '',
      v.model || '',
      v.type || '',
      v.category || 'Vehicle / 4WD / Bus',
      v.ownershipType || 'Company Owned',
      v.rentalCompany || 'N/A',
      v.rentalDailyRateUSD || '',
      v.rentalDaysCount || '',
      v.totalRentCostUSD || '',
      v.totalRentPaidUSD || '',
      v.totalRentPendingUSD || '',
      v.rentalPaymentStatus || '',
      v.capacity ?? 0,
      v.assignedDriverName || v.captainName || 'Unassigned',
      v.assignedDriverPhone || v.captainPhone || '',
      v.driverLicenseNo || '',
      v.status || '',
      v.marinePort || v.currentLocation || '',
      v.fuelLevel ?? 0,
      v.mileageKm ?? 0,
      v.insuranceExpiry || '',
      v.technicalInspectionExpiry || '',
    ]);

    exportToCSV(
      `EritreaVisit_Transport_Fleet_${activeMainTab}_${new Date().toISOString().split('T')[0]}`,
      headers,
      rows
    );
  };

  // Quick Payment Execution
  const handleOpenPaymentModal = (veh: Vehicle) => {
    setPaymentModalVehicle(veh);
    setPaymentAmountUSD(veh.totalRentPendingUSD || Math.max(0, (veh.totalRentCostUSD || 0) - (veh.totalRentPaidUSD || 0)));
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalVehicle) return;

    const currentPaid = paymentModalVehicle.totalRentPaidUSD || 0;
    const newPaid = currentPaid + paymentAmountUSD;
    const totalCost = paymentModalVehicle.totalRentCostUSD || 0;
    const newPending = Math.max(0, totalCost - newPaid);
    const newStatus: Vehicle['rentalPaymentStatus'] = newPending === 0 ? 'Paid' : 'Partial';

    const updatedVehicle: Vehicle = {
      ...paymentModalVehicle,
      totalRentPaidUSD: newPaid,
      totalRentPendingUSD: newPending,
      rentalPaymentStatus: newStatus,
    };

    onUpdateVehicle(updatedVehicle);

    // Record Financial Transaction if handler passed
    if (onAddFinancialTransaction) {
      const txn: FinancialTransaction = {
        id: `txn-rent-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        referenceCode: `TXN-RNT-${paymentModalVehicle.rentalAgreementRef || paymentModalVehicle.plateNumber}`,
        category: 'Transport & Fleet',
        type: 'Expense',
        description: `Rental fee payment to ${paymentModalVehicle.rentalCompany} for ${paymentModalVehicle.name} (${paymentModalVehicle.plateNumber}) - ${paymentNote}`,
        amountUSD: paymentAmountUSD,
        amountNFA: paymentAmountUSD * 15,
        payerOrPayee: paymentModalVehicle.rentalCompany || 'Rental Provider',
        paymentMethod: 'Bank Wire',
        status: 'Completed',
        receiptNumber: `REC-${paymentModalVehicle.rentalAgreementRef || Date.now()}`,
        recordedBy: 'Fleet Logistics Officer',
      };
      onAddFinancialTransaction(txn);
    }

    setPaymentModalVehicle(null);
  };

  return (
    <div id="transport-management-container" className="space-y-6 pb-12 text-slate-900">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-serif italic text-slate-900">
                  Transport Fleet, Boat Charters &amp; Rental Expense Hub
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                  ትራንስፖርትን ናይ ባሕሪ ጃላውን
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage company-owned 4WDs, external rental car leases, Dahlak marine speedboats, fee settlement ledgers, and official requisition letters
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setSelectedLetterForView(null);
              setVehicleForLetter(null);
              setIsLetterModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <FileText className="w-4 h-4 text-amber-700" />
            <span>New Rental Requisition Letter</span>
          </button>

          <button
            onClick={() => {
              setEditingVehicle(null);
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Register New Asset / Boat</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveMainTab('all_assets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            activeMainTab === 'all_assets'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Fleet &amp; Marine Assets ({totalFleet})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('rented_vehicles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            activeMainTab === 'rented_vehicles'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Rented Cars &amp; 4WDs ({rentedCarsCount})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('boat_rentals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            activeMainTab === 'boat_rentals'
              ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Ship className="w-4 h-4" />
          <span>Boat &amp; Marine Rentals ({rentedBoatsCount})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('expense_tracker')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            activeMainTab === 'expense_tracker'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Rental Expense &amp; Fee Ledger</span>
          {totalRentalPendingUSD > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[10px]">
              ${totalRentalPendingUSD.toLocaleString()} due
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveMainTab('rental_letters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            activeMainTab === 'rental_letters'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Official Written Rental Letters ({rentalLetters.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. OPERATIONAL FLEET STATUS & AVAILABILITY KPI CARDS                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Available Company Cars */}
        <button
          type="button"
          onClick={() => {
            setActiveMainTab('all_assets');
            setSelectedOwnership('Company Owned');
            setSelectedStatus('Available');
          }}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition shadow-2xs text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-800">
              Available Company Cars
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono flex items-baseline gap-1.5">
            <span>{availableCompanyCars.length}</span>
            <span className="text-xs font-normal text-slate-500 font-sans">
              / {companyOwnedVehicles.length} Owned
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <span className="text-emerald-700 font-bold">Ready for dispatch</span>
            <span>•</span>
            <span>4WDs &amp; Buses</span>
          </div>
        </button>

        {/* Metric 2: Rented Cars & 4WDs */}
        <button
          type="button"
          onClick={() => {
            setActiveMainTab('rented_vehicles');
            setSelectedStatus('all');
          }}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition shadow-2xs text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-blue-800">
              Rented Cars &amp; 4WDs
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            {rentedCars.length} <span className="text-xs font-normal text-slate-500 font-sans">Units Leased</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <span className="text-emerald-600 font-bold">{availableRentedCars.length} Ready</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{rentedCars.length - availableRentedCars.length} In Field</span>
          </div>
        </button>

        {/* Metric 3: Rented Boats & Marine Charters */}
        <button
          type="button"
          onClick={() => {
            setActiveMainTab('boat_rentals');
            setSelectedStatus('all');
          }}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/30 transition shadow-2xs text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-cyan-800">
              Rented Boats &amp; Vessels
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 group-hover:scale-110 transition flex items-center justify-center">
              <Anchor className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            {rentedBoats.length} <span className="text-xs font-normal text-slate-500 font-sans">Charters</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <span className="text-cyan-700 font-bold">{availableRentedBoats.length} Ready</span>
            <span>•</span>
            <span className="text-slate-500">Massawa &amp; Dahlak</span>
          </div>
        </button>

        {/* Metric 4: Cars & Boats On Tour / In Use */}
        <button
          type="button"
          onClick={() => {
            setShowOnTourDrawer(!showOnTourDrawer);
          }}
          className={`p-5 rounded-2xl border transition shadow-2xs text-left cursor-pointer group ${
            showOnTourDrawer
              ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-amber-800">
              Cars &amp; Boats On Tour
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 group-hover:scale-110 transition flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-800 font-mono flex items-baseline justify-between">
            <span>{vehiclesOnTour.length} <span className="text-xs font-normal text-slate-500 font-sans">In Field</span></span>
            <span className="text-xs text-amber-700 font-bold flex items-center gap-0.5">
              {showOnTourDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </div>
          <div className="text-[11px] text-amber-800 mt-1 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Active tour convoys &amp; marine expeditions</span>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* LIVE ON-TOUR FLEET TRACKER DRAWER / ACCORDION                             */}
      {/* ========================================================================= */}
      {showOnTourDrawer && (
        <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Active On-Tour Convoy &amp; Marine Vessel Live Tracker
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                    {vehiclesOnTour.length} Active
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time status of vehicles and boats deployed on active tourist itineraries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedStatus('On Tour');
                  setActiveMainTab('all_assets');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                Filter Full Grid to On-Tour
              </button>
              <button
                onClick={() => setShowOnTourDrawer(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {vehiclesOnTour.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No vehicles are currently deployed on tour. All fleet assets are ready at headquarters and marina depots.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {vehiclesOnTour.map((veh) => {
                const isBoat =
                  veh.category === 'Boat / Marine Vessel' ||
                  veh.type === 'Marine Speedboat' ||
                  veh.type === 'Traditional Motorized Dhow';
                return (
                  <div
                    key={veh.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-amber-500/50 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                          {isBoat ? <Ship className="w-4 h-4 text-cyan-400" /> : <Car className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{veh.name}</h4>
                          <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800/60">
                            {veh.plateNumber}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                        {veh.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Driver/Captain: <strong className="text-white">{veh.assignedDriverName || 'Field Guide'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>Route/Location: <strong className="text-white">{veh.currentLocation || veh.marinePort || 'In Transit'}</strong></span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Fuel className="w-3 h-3 text-amber-400" /> Fuel: {veh.fuelLevel || 85}%
                        </span>
                        <span className="text-slate-400 font-mono">
                          {veh.ownershipType === 'Company Owned' ? 'Company Owned' : `Rented (${veh.rentalCompany})`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: RENTAL EXPENSE & FEE LEDGER TRACKER                               */}
      {/* ========================================================================= */}
      {activeMainTab === 'expense_tracker' && (
        <div className="space-y-6">
          {/* RENTAL EXPENSE & FINANCIAL KPI METRIC CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Expense Metric 1: Total Rented Assets */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                  Total Rented Assets
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                {rentedAssets.length} <span className="text-xs font-normal text-slate-500">Units</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 font-medium">
                <span>🚗 {rentedCarsCount} Cars/4WDs</span>
                <span>•</span>
                <span>⚓ {rentedBoatsCount} Boats</span>
              </div>
            </div>

            {/* Expense Metric 2: Total Rental Commitment */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                  Total Rental Commitment
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
                ${totalRentalCommitmentUSD.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">USD</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                Cumulative external lease obligations
              </div>
            </div>

            {/* Expense Metric 3: Paid to Rental Companies */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-600">
                  Paid to Rental Companies
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono">
                ${totalRentalPaidUSD.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">USD</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                {fullySettledCount} asset(s) fully paid
              </div>
            </div>

            {/* Expense Metric 4: Pending Fees to Pay */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-rose-600">
                  Pending Fees to Pay
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-rose-700 font-mono">
                ${totalRentalPendingUSD.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">USD</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                {pendingSettlementCount} asset(s) awaiting fee settlement
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif italic flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  Car &amp; Boat Rental Fee Expense Settlement Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed cost breakdown for third-party vehicles and chartered vessels hired from Eritrean rental partners
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export Expense CSV</span>
                </button>
              </div>
            </div>

            {/* Expense Filter Toolbar */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600">Filter by Rental Provider:</span>
                <select
                  value={selectedRentalCompany}
                  onChange={(e) => setSelectedRentalCompany(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  <option value="all">All Rental Companies</option>
                  {distinctRentalCompanies.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expense Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-mono text-[11px]">
                    <th className="py-3 px-3.5">Asset / Reg No.</th>
                    <th className="py-3 px-3.5">Rental Provider</th>
                    <th className="py-3 px-3.5">Lease Period</th>
                    <th className="py-3 px-3.5 text-center">Days</th>
                    <th className="py-3 px-3.5 text-right">Daily Rate</th>
                    <th className="py-3 px-3.5 text-right">Total Cost</th>
                    <th className="py-3 px-3.5 text-right">Paid</th>
                    <th className="py-3 px-3.5 text-right">Pending Balance</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rentedAssets.map((v) => {
                    const isBoat =
                      v.category === 'Boat / Marine Vessel' ||
                      v.type === 'Marine Speedboat' ||
                      v.type === 'Traditional Motorized Dhow';
                    return (
                      <tr key={v.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                              {isBoat ? <Ship className="w-4 h-4 text-cyan-600" /> : <Car className="w-4 h-4 text-blue-600" />}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{v.name}</span>
                              <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                {v.plateNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3.5">
                          <span className="font-semibold text-slate-800 block">{v.rentalCompany}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Ref: {v.rentalAgreementRef || 'RNT-2026'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3.5 font-mono text-[11px]">
                          <div>{v.rentalStartDate || '—'}</div>
                          <div className="text-slate-400 text-[10px]">to {v.rentalEndDate || '—'}</div>
                        </td>

                        <td className="py-3.5 px-3.5 font-mono text-center font-bold">
                          {v.rentalDaysCount ?? '—'}
                        </td>

                        <td className="py-3.5 px-3.5 font-mono text-right font-bold text-emerald-700">
                          {v.rentalDailyRateUSD != null ? `$${v.rentalDailyRateUSD} USD` : '—'}
                        </td>

                        <td className="py-3.5 px-3.5 font-mono text-right font-bold text-slate-900">
                          {v.totalRentCostUSD != null ? `$${v.totalRentCostUSD.toLocaleString()} USD` : '—'}
                        </td>

                        <td className="py-3.5 px-3.5 font-mono text-right font-bold text-emerald-800">
                          ${(v.totalRentPaidUSD || 0).toLocaleString()} USD
                        </td>

                        <td className="py-3.5 px-3.5 font-mono text-right font-bold text-rose-700">
                          ${(v.totalRentPendingUSD || 0).toLocaleString()} USD
                        </td>

                        <td className="py-3.5 px-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                              v.rentalPaymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : v.rentalPaymentStatus === 'Partial'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {v.rentalPaymentStatus || 'Pending'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {canEdit && (v.totalRentPendingUSD || 0) > 0 ? (
                            <button
                              onClick={() => handleOpenPaymentModal(v)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <CreditCard className="w-3 h-3" /> Pay Fee
                            </button>
                          ) : (v.totalRentPendingUSD || 0) > 0 ? (
                            <span className="text-[11px] font-semibold text-slate-500 inline-flex items-center gap-1">
                              ${(v.totalRentPendingUSD || 0).toLocaleString()} due
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Settled
                            </span>
                          )}

                          <button
                            onClick={() => setInspectingVehicle(v)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td colSpan={5} className="py-3 px-3.5 text-right uppercase font-mono text-[11px] text-slate-700">
                      Total Rental Ledger Summary:
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-900 text-xs">
                      ${totalRentalCommitmentUSD.toLocaleString()} USD
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-emerald-800 text-xs">
                      ${totalRentalPaidUSD.toLocaleString()} USD
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-rose-700 text-xs">
                      ${totalRentalPendingUSD.toLocaleString()} USD
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: WRITTEN LETTERS FOR CAR & BOAT RENTAL COMPANIES                  */}
      {/* ========================================================================= */}
      {activeMainTab === 'rental_letters' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif italic flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  Official Requisition Letters Dispatched to Rental Partners
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bilingual Tigrinya &amp; English formal requisitions for 4WD convoys, desert logistics &amp; Dahlak marine charters
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedLetterForView(null);
                  setIsLetterModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Create New Written Letter
              </button>
            </div>

            {/* Letter Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rentalLetters.map((ltr) => {
                const isBoat = ltr.rentalCompanyType === 'Boat & Marine Rental Company';
                return (
                  <div
                    key={ltr.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {ltr.refNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            ltr.status === 'Confirmed by Rental Agency'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ltr.status}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                          {isBoat ? <Ship className="w-3.5 h-3.5 text-cyan-600" /> : <Car className="w-3.5 h-3.5 text-blue-600" />}
                          <span>{ltr.rentalCompanyType}</span>
                        </div>
                        <h4 className="font-serif font-bold text-slate-900 text-sm">{ltr.rentalCompanyName}</h4>
                        <p className="text-xs text-slate-600 font-serif">{ltr.rentalCompanyNameTigrinya}</p>
                      </div>

                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <div className="text-[11px] text-slate-600 truncate">
                          <strong>Subject:</strong> {ltr.subjectTigrinya}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Items: {ltr.items.length} Asset(s)</span>
                          <span className="font-mono font-bold text-emerald-700">
                            ${ltr.totalEstimatedCostUSD.toLocaleString()} USD
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-400 font-mono text-[10px]">Date: {ltr.date}</span>
                      <button
                        onClick={() => {
                          setSelectedLetterForView(ltr);
                          setIsLetterModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View / Print Letter
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TABS: ALL ASSETS / RENTED CARS / BOAT RENTALS (Asset Inventory)         */}
      {/* ========================================================================= */}
      {(activeMainTab === 'all_assets' ||
        activeMainTab === 'rented_vehicles' ||
        activeMainTab === 'boat_rentals') && (
        <div className="space-y-5">
          {/* Filter & View Toolbar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by plate, name, driver, rental company, port..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Ownership Filter */}
                <select
                  value={selectedOwnership}
                  onChange={(e) => setSelectedOwnership(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="all">All Ownerships</option>
                  <option value="Company Owned">🏢 Company Owned</option>
                  <option value="Rented / Third-Party">🤝 Rented / 3rd Party</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Available">Available (In Depot/Port)</option>
                  <option value="On Tour">On Tour</option>
                  <option value="In Maintenance">In Maintenance</option>
                  <option value="Reserved">Reserved</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Export CSV */}
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVehicles.map((v) => {
                const isBoat =
                  v.category === 'Boat / Marine Vessel' ||
                  v.type === 'Marine Speedboat' ||
                  v.type === 'Traditional Motorized Dhow';
                const isRented = v.ownershipType === 'Rented / Third-Party';

                return (
                  <div
                    key={v.id}
                    className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Top Image Banner with Badges */}
                    <div className="relative h-44 w-full bg-slate-100">
                      {v.image && v.image.trim() !== '' ? (
                        <img
                          src={v.image}
                          alt={v.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          {isBoat ? <Ship className="w-10 h-10" /> : <Truck className="w-10 h-10" />}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                      {/* Plate & Ownership Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-white font-mono font-bold text-xs border border-white/20 shadow-xs">
                          {v.plateNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase ${
                            isRented
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-emerald-600 text-white shadow-2xs'
                          }`}
                        >
                          {isRented ? 'Rented' : 'Company'}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            v.status === 'Available'
                              ? 'bg-emerald-500 text-white'
                              : v.status === 'On Tour'
                              ? 'bg-sky-500 text-white'
                              : v.status === 'In Maintenance'
                              ? 'bg-amber-500 text-white'
                              : 'bg-purple-500 text-white'
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>

                      {/* Title & Model at Bottom of Image */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-bold text-sm truncate font-serif italic text-white drop-shadow-xs">
                          {v.name}
                        </h3>
                        <p className="text-[11px] text-slate-200 truncate font-mono">
                          {v.model}
                        </p>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 space-y-3 flex-1 text-xs">
                      {/* Rental Company / Harbor Box */}
                      {isRented ? (
                        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-amber-900 font-bold block flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-amber-700" /> {v.rentalCompany}
                            </span>
                            <span className="text-[10px] text-slate-600 font-mono">
                              Daily Rate: ${v.rentalDailyRateUSD || 120} USD | {v.rentalDaysCount || 7} Days
                            </span>
                          </div>

                          <div className="text-right">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                v.rentalPaymentStatus === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {v.rentalPaymentStatus || 'Pending'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-slate-600 text-[11px]">
                          <span>🏢 EritreaVisit Fleet Asset</span>
                          <span className="font-mono text-emerald-700 font-bold">Internal Asset</span>
                        </div>
                      )}

                      {/* Driver / Captain & Location Info */}
                      <div className="grid grid-cols-2 gap-2 text-slate-600">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {isBoat ? 'Captain:' : 'Driver:'}
                          </span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {v.captainName || v.assignedDriverName || 'Unassigned'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {isBoat ? 'Mooring Port:' : 'Depot / Location:'}
                          </span>
                          <span className="font-semibold text-slate-800 truncate block flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                            {v.marinePort || v.currentLocation}
                          </span>
                        </div>
                      </div>

                      {/* Fuel & Capacity */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-600">
                        <span className="font-mono text-[11px] font-medium flex items-center gap-1">
                          <Fuel className="w-3 h-3 text-amber-500" />
                          {v.fuelLevel}% ({v.fuelType})
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-800">
                          {v.capacity} Pax
                        </span>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setInspectingVehicle(v)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>

                      <div className="flex items-center gap-1.5">
                        {canEdit && isRented && (v.totalRentPendingUSD || 0) > 0 && (
                          <button
                            onClick={() => handleOpenPaymentModal(v)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Pay
                          </button>
                        )}

                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingVehicle(v);
                              setIsAddModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-mono text-[11px]">
                      <th className="py-3 px-3.5">Plate / Unit Name</th>
                      <th className="py-3 px-3.5">Category &amp; Ownership</th>
                      <th className="py-3 px-3.5">Rental Provider / Port</th>
                      <th className="py-3 px-3.5">Assigned Driver / Captain</th>
                      <th className="py-3 px-3.5 text-center">Status</th>
                      <th className="py-3 px-3.5 text-center">Capacity</th>
                      <th className="py-3 px-3.5 text-right">Rent Cost (USD)</th>
                      <th className="py-3 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredVehicles.map((v) => {
                      const isBoat =
                        v.category === 'Boat / Marine Vessel' ||
                        v.type === 'Marine Speedboat' ||
                        v.type === 'Traditional Motorized Dhow';
                      const isRented = v.ownershipType === 'Rented / Third-Party';

                      return (
                        <tr key={v.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {v.plateNumber}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 block">{v.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{v.model}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-1.5">
                              {getVehicleIcon(v.type)}
                              <span className="font-medium text-slate-800">{v.type}</span>
                            </div>
                            <span
                              className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                                isRented
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              {v.ownershipType}
                            </span>
                          </td>

                          <td className="py-3 px-3.5">
                            {isRented ? (
                              <div>
                                <span className="font-bold text-slate-800 block">{v.rentalCompany}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ${v.rentalDailyRateUSD}/day
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-slate-700 block">
                                  {v.marinePort || v.currentLocation}
                                </span>
                                <span className="text-[10px] text-emerald-700 font-mono font-bold">
                                  Asmara Depot
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3.5">
                            <span className="font-semibold text-slate-800 block">
                              {v.captainName || v.assignedDriverName || 'Unassigned'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {v.captainPhone || v.assignedDriverPhone || 'N/A'}
                            </span>
                          </td>

                          <td className="py-3 px-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                v.status === 'Available'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : v.status === 'On Tour'
                                  ? 'bg-sky-100 text-sky-800'
                                  : v.status === 'In Maintenance'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {v.status}
                            </span>
                          </td>

                          <td className="py-3 px-3.5 font-mono text-center font-bold">
                            {v.capacity}
                          </td>

                          <td className="py-3 px-3.5 font-mono text-right font-bold text-slate-900">
                            {isRented ? `$${(v.totalRentCostUSD || 0).toLocaleString()}` : '—'}
                          </td>

                          <td className="py-3 px-3.5 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => setInspectingVehicle(v)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                              title="Inspect Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setEditingVehicle(v);
                                  setIsAddModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-black text-white transition cursor-pointer"
                                title="Edit Asset"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALS                                                                */}
      {/* ========================================================================= */}

      {/* Add / Edit Vehicle Modal */}
      {isAddModalOpen && (
        <AddEditVehicleModal
          vehicle={editingVehicle}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingVehicle(null);
          }}
          onSave={(saved) => {
            if (editingVehicle) {
              onUpdateVehicle(saved);
            } else {
              onAddVehicle(saved);
            }
          }}
        />
      )}

      {/* Vehicle Details Modal */}
      {inspectingVehicle && (
        <VehicleDetailsModal
          vehicle={inspectingVehicle}
          onClose={() => setInspectingVehicle(null)}
          onEdit={
            canEdit
              ? (veh) => {
                  setInspectingVehicle(null);
                  setEditingVehicle(veh);
                  setIsAddModalOpen(true);
                }
              : undefined
          }
          onOpenRentalLetter={(veh) => {
            setInspectingVehicle(null);
            setSelectedLetterForView(null);
            setVehicleForLetter(veh);
            setIsLetterModalOpen(true);
          }}
        />
      )}

      {/* Written Rental Letter Modal */}
      {isLetterModalOpen && (
        <RentalLetterModal
          initialLetter={selectedLetterForView}
          initialVehicle={vehicleForLetter}
          vehicles={vehicles}
          onClose={() => {
            setIsLetterModalOpen(false);
            setSelectedLetterForView(null);
            setVehicleForLetter(null);
          }}
          onSaveLetter={(letter) => {
            if (onSaveRentalLetter) {
              onSaveRentalLetter(letter);
            }
          }}
        />
      )}

      {/* Quick Payment Settlement Modal */}
      {paymentModalVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold font-serif italic text-base">Record Rental Fee Payment</h3>
              </div>
              <button
                onClick={() => setPaymentModalVehicle(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecutePayment} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-800 font-mono uppercase block">Payee Rental Provider</span>
                <p className="font-bold text-slate-900 text-sm">{paymentModalVehicle.rentalCompany}</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Asset: {paymentModalVehicle.name} ({paymentModalVehicle.plateNumber})
                </p>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-amber-200 font-mono">
                  <span>Total Cost: ${paymentModalVehicle.totalRentCostUSD} USD</span>
                  <span className="font-bold text-rose-700">
                    Pending: ${paymentModalVehicle.totalRentPendingUSD} USD
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Amount to Settle (USD) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={paymentModalVehicle.totalRentPendingUSD || 10000}
                  value={paymentAmountUSD}
                  onChange={(e) => setPaymentAmountUSD(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-emerald-700 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Notes / Reference</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Bank wire receipt # / Cash on return"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPaymentModalVehicle(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm &amp; Settle Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
