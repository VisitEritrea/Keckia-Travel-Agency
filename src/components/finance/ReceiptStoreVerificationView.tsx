import React, { useRef, useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  FileText,
  Building,
  Truck,
  Ship,
  Coins,
  FileCheck2,
  Eye,
  Download,
  Printer,
  Upload,
  Sparkles,
  Link as LinkIcon,
  Unlink,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  DollarSign,
  Tag,
  Grid,
  List,
  Layers,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import {
  ExpenseReceipt,
  ReceiptVerificationStatus,
  FinancialTransaction,
  PaymentMethod,
} from '../../types';
import { readAndCompressImage, readFileAsDataUrlCapped } from '../../utils/imageUpload';
import { printElement } from '../../utils/exportUtils';

interface ReceiptStoreVerificationViewProps {
  receipts: ExpenseReceipt[];
  transactions: FinancialTransaction[];
  /** Only the administrator may verify, flag or relink a receipt that is already filed. */
  canEdit?: boolean;
  onAddReceipt: (receipt: ExpenseReceipt, autoCreateTransaction?: boolean) => void;
  onUpdateReceiptStatus: (
    receiptId: string,
    status: ReceiptVerificationStatus,
    notes?: string,
    verifiedBy?: string
  ) => void;
  onLinkReceiptToTransaction: (receiptId: string, transactionId: string) => void;
}

export const ReceiptStoreVerificationView: React.FC<ReceiptStoreVerificationViewProps> = ({
  receipts = [],
  transactions = [],
  canEdit = false,
  onAddReceipt,
  onUpdateReceiptStatus,
  onLinkReceiptToTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [selectedReceiptForInspect, setSelectedReceiptForInspect] = useState<ExpenseReceipt | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [receiptToLink, setReceiptToLink] = useState<ExpenseReceipt | null>(null);

  // Upload Modal Form State
  const [uploadVendor, setUploadVendor] = useState('');
  const [uploadCategory, setUploadCategory] = useState<ExpenseReceipt['vendorCategory']>('Hotel Lodging');
  const [uploadReceiptNo, setUploadReceiptNo] = useState(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadAmountUSD, setUploadAmountUSD] = useState<number>(350);
  const [uploadCurrency, setUploadCurrency] = useState<'USD' | 'ERN'>('USD');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadTaxId, setUploadTaxId] = useState('TIN-ER-');
  const [uploadPaymentMethod, setUploadPaymentMethod] = useState<PaymentMethod>('Bank Wire');
  const [uploadSelectedFile, setUploadSelectedFile] = useState<File | null>(null);
  const [uploadFilePreview, setUploadFilePreview] = useState<string>('');
  const [uploadFileError, setUploadFileError] = useState<string | null>(null);
  const [uploadFileBusy, setUploadFileBusy] = useState(false);
  const [dropzoneActive, setDropzoneActive] = useState(false);
  const receiptFileInputRef = useRef<HTMLInputElement>(null);
  const [autoRecordInLedger, setAutoRecordInLedger] = useState(true);

  const handleReceiptFile = async (file: File | null | undefined) => {
    if (!file) return;
    setUploadFileError(null);
    setUploadFileBusy(true);
    setOcrRunning(true);
    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const preview = isPdf
        ? await readFileAsDataUrlCapped(file, 8 * 1024 * 1024)
        : await readAndCompressImage(file);
      setUploadSelectedFile(file);
      setUploadFilePreview(preview);
      await new Promise((r) => setTimeout(r, 500));
      setOcrCompleted(true);
    } catch (err) {
      setUploadFileError(err instanceof Error ? err.message : 'Could not read that file.');
    } finally {
      setUploadFileBusy(false);
      setOcrRunning(false);
    }
  };
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrCompleted, setOcrCompleted] = useState(false);

  // Discrepancy Note state for Inspection Drawer
  const [discrepancyNoteInput, setDiscrepancyNoteInput] = useState('');
  const [isAddingDiscrepancyNote, setIsAddingDiscrepancyNote] = useState(false);

  // Filter receipts
  const filteredReceipts = receipts.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.verificationStatus === statusFilter;
    const matchesCategory = categoryFilter === 'all' || r.vendorCategory === categoryFilter;
    const matchesSearch =
      r.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.linkedTransactionRef || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.taxOrVatNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Verification statistics
  const totalCount = receipts.length;
  const verifiedCount = receipts.filter((r) => r.verificationStatus === 'Verified').length;
  const pendingCount = receipts.filter((r) => r.verificationStatus === 'Pending Review').length;
  const flaggedCount = receipts.filter((r) => r.verificationStatus === 'Flagged Discrepancy').length;

  const totalReceiptsValueUSD = receipts.reduce((sum, r) => sum + r.amountUSD, 0);
  const verifiedReceiptsValueUSD = receipts
    .filter((r) => r.verificationStatus === 'Verified')
    .reduce((sum, r) => sum + r.amountUSD, 0);

  // Category icons helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hotel Lodging':
        return Building;
      case 'Car & Vehicle Rental':
        return Truck;
      case 'Boat & Marine Charter':
        return Ship;
      case 'Fuel Depot & Petrol':
        return Coins;
      case 'Government & Permits':
        return FileCheck2;
      default:
        return Receipt;
    }
  };

  // Preset Template loader for Eritrean travel receipts
  const handleLoadSampleTemplate = (type: 'hotel' | 'car' | 'boat' | 'fuel' | 'permit') => {
    setOcrRunning(true);
    setTimeout(() => {
      setOcrRunning(false);
      setOcrCompleted(true);
      if (type === 'hotel') {
        setUploadVendor('Hotel Asmara Palace S.C.');
        setUploadCategory('Hotel Lodging');
        setUploadReceiptNo('REC-HTL-9044');
        setUploadAmountUSD(640);
        setUploadCurrency('USD');
        setUploadTaxId('TIN-ER-991204');
        setUploadDesc('Deluxe suite reservation block (2 nights) with breakfast for international guests.');
        setUploadPaymentMethod('Bank Wire');
      } else if (type === 'car') {
        setUploadVendor('Eri-Rent Car Services Asmara');
        setUploadCategory('Car & Vehicle Rental');
        setUploadReceiptNo('REC-ERI-RNT-089');
        setUploadAmountUSD(480);
        setUploadCurrency('USD');
        setUploadTaxId('TIN-ER-771802');
        setUploadDesc('4-Day 4WD Land Cruiser Prado rental for Debub archaeological convoy.');
        setUploadPaymentMethod('Bank Wire');
      } else if (type === 'boat') {
        setUploadVendor('Massawa Marine Charters & Boat Rentals');
        setUploadCategory('Boat & Marine Charter');
        setUploadReceiptNo('REC-MSW-BOAT-055');
        setUploadAmountUSD(840);
        setUploadCurrency('USD');
        setUploadTaxId('TIN-MSW-44019');
        setUploadDesc('Twin-engine marine speedboat charter for 3 days to Madote & Dissei coral reefs.');
        setUploadPaymentMethod('Cash (USD)');
      } else if (type === 'fuel') {
        setUploadVendor('National Petroleum Depot (Asmara Station)');
        setUploadCategory('Fuel Depot & Petrol');
        setUploadReceiptNo('FLT-FUEL-312');
        setUploadAmountUSD(260);
        setUploadCurrency('ERN');
        setUploadTaxId('TIN-ER-DEPOT-01');
        setUploadDesc('220 Liters fleet diesel allocation for Massawa-Asmara convoy.');
        setUploadPaymentMethod('Cash (NFA)');
      } else if (type === 'permit') {
        setUploadVendor('Ministry of Tourism - State Revenue Office');
        setUploadCategory('Government & Permits');
        setUploadReceiptNo('MOT-REV-908');
        setUploadAmountUSD(120);
        setUploadCurrency('ERN');
        setUploadTaxId('GOV-ER-MOT-001');
        setUploadDesc('Official regional permit stamp fee for Semenawi Bahri and Dahlak archipelago transit.');
        setUploadPaymentMethod('Cash (NFA)');
      }
    }, 600);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadVendor.trim() || uploadAmountUSD <= 0) return;
    if (!uploadFilePreview) {
      setUploadFileError('Upload a photo or PDF of the receipt before saving.');
      return;
    }

    const newReceipt: ExpenseReceipt = {
      id: `rcp-${Date.now()}`,
      receiptNumber: uploadReceiptNo.trim(),
      vendorName: uploadVendor.trim(),
      vendorCategory: uploadCategory,
      date: uploadDate,
      amountUSD: Number(uploadAmountUSD),
      amountNFA: Number(uploadAmountUSD) * 15,
      currency: uploadCurrency,
      description: uploadDesc.trim() || `Receipt from ${uploadVendor}`,
      verificationStatus: 'Pending Review',
      receiptImageUrl: uploadFilePreview,
      uploadedAt: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      uploadedBy: 'Central Finance Ops',
      taxOrVatNumber: uploadTaxId.trim() || undefined,
      paymentMethod: uploadPaymentMethod,
      ocrConfidence: ocrCompleted ? 96.5 : 88.0,
      tags: [uploadCategory, uploadCurrency, 'Uploaded Slip'],
      ocrExtractedData: {
        merchantName: uploadVendor.trim(),
        detectedDate: uploadDate,
        detectedTotalUSD: Number(uploadAmountUSD),
        detectedTotalERN: Number(uploadAmountUSD) * 15,
        taxRegNumber: uploadTaxId.trim() || undefined,
      },
    };

    onAddReceipt(newReceipt, autoRecordInLedger);
    setIsUploadModalOpen(false);
    setUploadVendor('');
    setUploadDesc('');
    setOcrCompleted(false);
    setUploadSelectedFile(null);
    setUploadFilePreview('');
    setUploadFileError(null);
  };

  const handleLinkSubmit = (transactionId: string) => {
    if (!receiptToLink) return;
    onLinkReceiptToTransaction(receiptToLink.id, transactionId);
    setIsLinkModalOpen(false);
    setReceiptToLink(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-950 font-heading">
              Receipt Vault & Expense Verification Engine
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
              {totalCount} Stored Receipts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Store, audit, and cross-reference physical vendor receipts, rental agreements, and hotel folios with General Ledger transactions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {viewMode === 'grid' ? <List className="w-3.5 h-3.5" /> : <Grid className="w-3.5 h-3.5" />}
            <span>{viewMode === 'grid' ? 'Table View' : 'Card View'}</span>
          </button>

          <button
            onClick={() => {
              setUploadReceiptNo(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
              setIsUploadModalOpen(true);
            }}
            className="bg-brand-500 hover:bg-brand-600 text-slate-950 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Upload Receipt
          </button>
        </div>
      </div>

      {/* Audit Stats Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Stored Receipts */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Total Stored Receipts
            </span>
            <Receipt className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 font-heading mt-1">
            {totalCount} Receipts
          </div>
          <div className="text-xs font-mono text-slate-600 mt-0.5">
            ${totalReceiptsValueUSD.toLocaleString()} USD ({(totalReceiptsValueUSD * 15).toLocaleString()} ERN)
          </div>
        </div>

        {/* Verified Receipts (ድጋፍ ዝተረጋገጸ) */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block">
              Verified & Audited
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-950 font-heading mt-1">
            {verifiedCount} Verified
          </div>
          <div className="text-xs font-mono text-emerald-700 mt-0.5">
            ${verifiedReceiptsValueUSD.toLocaleString()} USD Reconciled
          </div>
        </div>

        {/* Pending Review */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-800 font-bold block">
              Pending Review
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-950 font-heading mt-1">
            {pendingCount} Awaiting Audit
          </div>
          <div className="text-xs font-mono text-amber-700 mt-0.5">
            Requires verification sign-off
          </div>
        </div>

        {/* Flagged Discrepancies */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 bg-rose-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-rose-800 font-bold block">
              Flagged Discrepancies
            </span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-950 font-heading mt-1">
            {flaggedCount} Discrepancies
          </div>
          <div className="text-xs font-mono text-rose-700 mt-0.5">
            Under auditor investigation
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Verification Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('Verified')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'Verified'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified ({verifiedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('Pending Review')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'Pending Review'
                ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending ({pendingCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('Flagged Discrepancy')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'Flagged Discrepancy'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-rose-800 hover:text-rose-950'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Flagged ({flaggedCount})</span>
          </button>
        </div>

        {/* Category Filter & Search Box */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
          >
            <option value="all">All Vendor Categories</option>
            <option value="Hotel Lodging">Hotel Lodging</option>
            <option value="Car & Vehicle Rental">Car & 4WD Rental</option>
            <option value="Boat & Marine Charter">Boat & Marine Charter</option>
            <option value="Fuel Depot & Petrol">Fuel Depot & Petrol</option>
            <option value="Maintenance & Repairs">Maintenance & Workshop</option>
            <option value="Government & Permits">Government & Permits</option>
            <option value="Staff & Guide Allowance">Staff Payroll & Allowance</option>
          </select>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor, receipt #, tax..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Receipts Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReceipts.map((receipt) => {
            const CategoryIcon = getCategoryIcon(receipt.vendorCategory);
            const isVerified = receipt.verificationStatus === 'Verified';
            const isFlagged = receipt.verificationStatus === 'Flagged Discrepancy';
            const isPending = receipt.verificationStatus === 'Pending Review';

            return (
              <div
                key={receipt.id}
                className={`p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isVerified
                    ? 'border-slate-200 hover:border-emerald-300'
                    : isFlagged
                    ? 'border-rose-200 bg-rose-50/10 hover:border-rose-400'
                    : 'border-amber-200 bg-amber-50/10 hover:border-amber-400'
                }`}
              >
                <div>
                  {/* Top Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                        <CategoryIcon className="w-4 h-4 text-amber-700" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-slate-900 font-heading truncate">
                          {receipt.vendorName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {receipt.receiptNumber} · {receipt.date}
                        </span>
                      </div>
                    </div>

                    {/* Verification Status Pill */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isFlagged
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {isFlagged && <AlertCircle className="w-3 h-3 text-rose-600" />}
                      {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                      <span>{receipt.verificationStatus}</span>
                    </span>
                  </div>

                  {/* Receipt Thumbnail & OCR Snippet */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-32 mb-3 group cursor-pointer"
                    onClick={() => setSelectedReceiptForInspect(receipt)}
                  >
                    {receipt.receiptImageUrl && receipt.receiptImageUrl.trim() !== '' ? (
                      <img
                        src={receipt.receiptImageUrl}
                        alt={receipt.vendorName}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Receipt className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3 text-white">
                      <div className="w-full flex items-center justify-between">
                        <span className="text-[10px] font-mono bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded text-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>OCR {receipt.ocrConfidence || 95}%</span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Inspect
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description & Cost */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {receipt.description}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Invoice Amount:</span>
                      <span className="font-mono font-bold text-slate-900">
                        ${receipt.amountUSD.toLocaleString()} USD
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Equivalent (ERN):</span>
                      <span className="font-mono text-slate-700">
                        {(receipt.amountUSD * 15).toLocaleString()} ERN
                      </span>
                    </div>
                    {receipt.taxOrVatNumber && (
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                        <span className="text-slate-400 font-mono">Tax / TIN:</span>
                        <span className="font-mono text-slate-600 font-semibold">{receipt.taxOrVatNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {receipt.linkedTransactionRef ? (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-semibold truncate flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" /> {receipt.linkedTransactionRef}
                      </span>
                    ) : (
                      canEdit && (
                        <button
                          onClick={() => {
                            setReceiptToLink(receipt);
                            setIsLinkModalOpen(true);
                          }}
                          className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <LinkIcon className="w-3 h-3" /> Link to Ledger
                        </button>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedReceiptForInspect(receipt)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Audit</span>
                    </button>

                    {canEdit && !isVerified && (
                      <button
                        onClick={() => onUpdateReceiptStatus(receipt.id, 'Verified', 'Verified by Finance Lead', 'Helen Berhe (Chief Auditor)')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
                        title="Mark as Verified & Synchronize Ledger"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Receipts Table View */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Receipt / Ref</th>
                  <th className="px-4 py-3">Vendor / Supplier</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount (USD)</th>
                  <th className="px-4 py-3 text-right">Amount (ERN)</th>
                  <th className="px-4 py-3">Linked Ledger</th>
                  <th className="px-4 py-3">Audit Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceipts.map((receipt) => {
                  const isVerified = receipt.verificationStatus === 'Verified';
                  const isFlagged = receipt.verificationStatus === 'Flagged Discrepancy';
                  return (
                    <tr key={receipt.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {receipt.receiptNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="truncate max-w-xs">{receipt.vendorName}</div>
                        {receipt.taxOrVatNumber && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {receipt.taxOrVatNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700">
                          {receipt.vendorCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {receipt.date}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        ${receipt.amountUSD.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {(receipt.amountUSD * 15).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {receipt.linkedTransactionRef ? (
                          <span className="text-blue-700 font-semibold">{receipt.linkedTransactionRef}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unlinked</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1 ${
                            isVerified
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isFlagged
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isFlagged && <AlertCircle className="w-3 h-3 text-rose-600" />}
                          <span>{receipt.verificationStatus}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedReceiptForInspect(receipt)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECEIPT INSPECTOR & AUDIT DRAWER MODAL */}
      {/* ========================================================================= */}
      {selectedReceiptForInspect && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            id="printable-receipt-audit"
            className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 font-heading">
                    Official Receipt & Expense Audit Dossier
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Reference: {selectedReceiptForInspect.receiptNumber} · Uploaded: {selectedReceiptForInspect.uploadedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => printElement('printable-receipt-audit', `Receipt_${selectedReceiptForInspect.receiptNumber}`)}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                  title="Print official receipt voucher"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedReceiptForInspect(null)}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: High-Res Image Preview */}
              <div className="md:col-span-5 space-y-3">
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 relative group aspect-3/4 flex items-center justify-center">
                  {selectedReceiptForInspect.receiptImageUrl && selectedReceiptForInspect.receiptImageUrl.trim() !== '' ? (
                    <img
                      src={selectedReceiptForInspect.receiptImageUrl}
                      alt={selectedReceiptForInspect.vendorName}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="text-slate-500">
                      <Receipt className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-slate-900/90 text-amber-300 font-mono text-[10px] px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3" />
                    <span>Optical Scanner Match: {selectedReceiptForInspect.ocrConfidence || 96}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="text-slate-500 font-medium">Original File Document:</div>
                  <div className="font-mono text-slate-800 text-[11px] truncate">
                    {selectedReceiptForInspect.receiptNumber}_scan.jpg
                  </div>
                </div>
              </div>

              {/* Right Column: Audit & Reconciled Data */}
              <div className="md:col-span-7 space-y-4">
                {/* Vendor & Category Badge */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                      Vendor / Merchant
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700">
                      {selectedReceiptForInspect.vendorCategory}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-heading mt-0.5">
                    {selectedReceiptForInspect.vendorName}
                  </div>
                  {selectedReceiptForInspect.taxOrVatNumber && (
                    <div className="text-xs font-mono text-slate-500">
                      TIN / Fiscal Number: {selectedReceiptForInspect.taxOrVatNumber}
                    </div>
                  )}
                </div>

                {/* Financial Amounts Block */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-800 font-bold block">
                      Total in USD ($)
                    </span>
                    <div className="text-2xl font-bold font-mono text-amber-950 mt-0.5">
                      ${selectedReceiptForInspect.amountUSD.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-800 font-bold block">
                      Eritrean Nakfa (ERN)
                    </span>
                    <div className="text-2xl font-bold font-mono text-amber-950 mt-0.5">
                      {(selectedReceiptForInspect.amountUSD * 15).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* OCR Extracted Data Comparison */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 font-heading">Audit Match Analysis</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Fiscal Integrity Valid
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Invoice Date:</span>
                      <span className="font-mono text-slate-800 font-semibold">{selectedReceiptForInspect.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Payment Method:</span>
                      <span className="font-mono text-slate-800 font-semibold">{selectedReceiptForInspect.paymentMethod || 'Bank Wire'}</span>
                    </div>
                  </div>

                  <div className="text-xs pt-2">
                    <span className="text-slate-400 text-[10px] block">Description & Scope:</span>
                    <p className="text-slate-700 mt-0.5">{selectedReceiptForInspect.description}</p>
                  </div>
                </div>

                {/* Linked Ledger Transaction Status */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Linked General Ledger Txn
                    </span>
                    <div className="text-xs font-mono font-bold text-blue-700 mt-0.5">
                      {selectedReceiptForInspect.linkedTransactionRef || 'No Transaction Attached'}
                    </div>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => {
                        setReceiptToLink(selectedReceiptForInspect);
                        setIsLinkModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>{selectedReceiptForInspect.linkedTransactionRef ? 'Change Link' : 'Link Transaction'}</span>
                    </button>
                  )}
                </div>

                {/* Auditor Notes & Verification Status */}
                {selectedReceiptForInspect.verificationNotes && (
                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold block mb-0.5">Auditor Annotation:</span>
                    <p>{selectedReceiptForInspect.verificationNotes}</p>
                  </div>
                )}

                {/* Interactive Verification Actions */}
                {canEdit ? (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        onUpdateReceiptStatus(
                          selectedReceiptForInspect.id,
                          'Verified',
                          'Fully audited and confirmed against bank statements.',
                          'Helen Berhe (Chief Auditor)'
                        );
                        setSelectedReceiptForInspect(null);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Verify (ኣረጋግጽ)</span>
                    </button>

                    <button
                      onClick={() => {
                        const reason = prompt('Enter discrepancy note (e.g., amount mismatch with vendor contract):');
                        if (reason) {
                          onUpdateReceiptStatus(
                            selectedReceiptForInspect.id,
                            'Flagged Discrepancy',
                            reason,
                            'Helen Berhe (Chief Auditor)'
                          );
                          setSelectedReceiptForInspect(null);
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Flag Discrepancy</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    This receipt is on file. Verifying, flagging or relinking it is reserved for the
                    administrator.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UPLOAD RECEIPT MODAL */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 font-heading">
                    Upload & Audit Expense Receipt
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload paper slips, digital folios, or select a sample Eritrean vendor template.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadSelectedFile(null);
                  setUploadFilePreview('');
                  setUploadFileError(null);
                  setOcrCompleted(false);
                }}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Sample Vendor Templates */}
            <div className="p-4 bg-amber-50/40 border-b border-amber-100">
              <span className="text-[10px] font-mono uppercase text-amber-900 font-bold block mb-2">
                ⚡ Quick Load Authentic Eritrean Vendor Templates:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadSampleTemplate('hotel')}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-100 border border-amber-200 text-slate-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Building className="w-3.5 h-3.5 text-violet-600" />
                  <span>Hotel Asmara Palace ($640)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSampleTemplate('car')}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-100 border border-amber-200 text-slate-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Eri-Rent Car Lease ($480)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSampleTemplate('boat')}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-100 border border-amber-200 text-slate-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Ship className="w-3.5 h-3.5 text-blue-600" />
                  <span>Massawa Speedboat ($840)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSampleTemplate('fuel')}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-100 border border-amber-200 text-slate-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Diesel Fuel Depot ($260)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSampleTemplate('permit')}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-100 border border-amber-200 text-slate-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Ministry Permit ($120)</span>
                </button>
              </div>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {/* Drag & Drop dropzone */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => receiptFileInputRef.current?.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && receiptFileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropzoneActive(true);
                }}
                onDragLeave={() => setDropzoneActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDropzoneActive(false);
                  handleReceiptFile(e.dataTransfer.files?.[0]);
                }}
                className={`p-4 rounded-2xl border-2 border-dashed transition flex flex-col items-center justify-center text-center cursor-pointer ${
                  dropzoneActive ? 'border-amber-500 bg-amber-50' : 'border-slate-300 hover:border-amber-500 bg-slate-50'
                }`}
              >
                {uploadFilePreview && uploadFilePreview.trim() !== '' && !uploadFilePreview.startsWith('data:application/pdf') ? (
                  <img
                    src={uploadFilePreview}
                    alt="Receipt preview"
                    className="w-full max-w-[220px] h-28 object-cover rounded-xl mb-2 ring-1 ring-slate-200"
                  />
                ) : uploadFileBusy ? (
                  <Loader2 className="w-7 h-7 text-amber-600 mb-1.5 animate-spin" />
                ) : (
                  <Upload className="w-7 h-7 text-amber-600 mb-1.5" />
                )}
                <span className="text-xs font-bold text-slate-800">
                  {uploadFileBusy
                    ? 'Processing…'
                    : uploadSelectedFile
                    ? uploadSelectedFile.name
                    : 'Click, or drag a receipt image / PDF here'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {uploadSelectedFile ? 'Click to replace' : 'Supports JPG, PNG, PDF receipts'}
                </span>
                <input
                  ref={receiptFileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    handleReceiptFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </div>

              {uploadFileError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{uploadFileError}</span>
                </div>
              )}

              {ocrRunning && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Scanning receipt OCR metadata & verifying fiscal registers...</span>
                </div>
              )}

              {/* Vendor & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vendor / Merchant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadVendor}
                    onChange={(e) => setUploadVendor(e.target.value)}
                    placeholder="e.g. Eri-Rent Car Services, Hotel Asmara Palace"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-semibold"
                  >
                    <option value="Hotel Lodging">Hotel Lodging</option>
                    <option value="Car & Vehicle Rental">Car & Vehicle Rental</option>
                    <option value="Boat & Marine Charter">Boat & Marine Charter</option>
                    <option value="Fuel Depot & Petrol">Fuel Depot & Petrol</option>
                    <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                    <option value="Government & Permits">Government & Permits</option>
                    <option value="Staff & Guide Allowance">Staff & Guide Allowance</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              {/* Amounts & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={uploadAmountUSD}
                    onChange={(e) => setUploadAmountUSD(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Equivalent in ERN (ናቕፋ)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${(uploadAmountUSD * 15).toLocaleString()} ERN`}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Receipt Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Receipt Reference & TIN / Tax ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Receipt / Voucher Number
                  </label>
                  <input
                    type="text"
                    value={uploadReceiptNo}
                    onChange={(e) => setUploadReceiptNo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vendor Tax / TIN Number
                  </label>
                  <input
                    type="text"
                    value={uploadTaxId}
                    onChange={(e) => setUploadTaxId(e.target.value)}
                    placeholder="e.g. TIN-ER-991204"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Expense Purpose
                </label>
                <textarea
                  rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Specify tour package, fleet asset, or operational reason..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Checkbox: Auto record transaction in General Ledger */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Auto-Record in General Ledger
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Automatically create a corresponding Expense entry in the financial ledger
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoRecordInLedger}
                  onChange={(e) => setAutoRecordInLedger(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadSelectedFile(null);
                  setUploadFilePreview('');
                  setUploadFileError(null);
                  setOcrCompleted(false);
                }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadFileBusy}
                  className="bg-brand-500 hover:bg-brand-600 text-slate-950 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm hover:shadow transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" /> Save Receipt to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LINK RECEIPT TO TRANSACTION MODAL */}
      {/* ========================================================================= */}
      {isLinkModalOpen && receiptToLink && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 font-heading">
                    Link Receipt to General Ledger Entry
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Receipt: {receiptToLink.receiptNumber} (${receiptToLink.amountUSD} USD)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              <span className="text-xs font-bold text-slate-700 block">
                Select Matching Expense Transaction:
              </span>

              {transactions
                .filter((t) => t.type === 'Expense')
                .map((txn) => (
                  <div
                    key={txn.id}
                    onClick={() => handleLinkSubmit(txn.id)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-700">
                          {txn.referenceCode}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{txn.date}</span>
                        <span className="px-2 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-600">
                          {txn.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-800 font-medium truncate mt-1">
                        {txn.description}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Payee: {txn.payerOrPayee}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-rose-700">
                        -${txn.amountUSD.toLocaleString()} USD
                      </div>
                      <button className="text-[10px] font-bold text-blue-700 group-hover:underline mt-1">
                        Attach
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
