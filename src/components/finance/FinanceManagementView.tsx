import React, { useState, useRef } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Building,
  Plane,
  Truck,
  Users,
  FileCheck2,
  Receipt,
  FileSpreadsheet,
  Printer,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Download,
  Eye,
  Sparkles,
  ShieldCheck,
  Coins,
  Upload,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  Check,
  X,
  Tag,
  User,
  Hash,
  Percent,
  ExternalLink,
  ChevronRight,
  Landmark,
} from 'lucide-react';
import {
  FinancialTransaction,
  FinancialInvoice,
  FinancialCategory,
  TouristProfile,
  TourPackage,
  Hotel,
  TicketRecord,
  PaymentMethod,
  TransactionType,
  Employee,
} from '../../types';
import { exportToCSV, printElement } from '../../utils/exportUtils';
import { useWorkspace } from '../../lib/workspace';

interface FinanceManagementViewProps {
  transactions: FinancialTransaction[];
  invoices: FinancialInvoice[];
  tourists?: TouristProfile[];
  packages?: TourPackage[];
  hotels?: Hotel[];
  tickets?: TicketRecord[];
  employees?: Employee[];
  canEdit?: boolean;
  onAddTransaction: (txn: FinancialTransaction) => void;
  onAddInvoice?: (inv: FinancialInvoice) => void;
}

export const FinanceManagementView: React.FC<FinanceManagementViewProps> = ({
  transactions = [],
  invoices = [],
  tourists = [],
  packages = [],
  hotels = [],
  tickets = [],
  employees = [],
  canEdit = true,
  onAddTransaction,
  onAddInvoice,
}) => {
  const { user } = useWorkspace();
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'invoices' | 'breakdown'>('ledger');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isAddTxnModalOpen, setIsAddTxnModalOpen] = useState(false);
  const [activeInvoiceForView, setActiveInvoiceForView] = useState<FinancialInvoice | null>(null);
  const [activeVoucherTxn, setActiveVoucherTxn] = useState<FinancialTransaction | null>(null);

  // New Transaction Form State
  const [txnCategory, setTxnCategory] = useState<FinancialCategory>('Tour Packages');
  const [txnSubCategory, setTxnSubCategory] = useState('');
  const [txnType, setTxnType] = useState<TransactionType>('Income');
  const [txnDesc, setTxnDesc] = useState('');
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split('T')[0]);
  const [txnClearingDate, setTxnClearingDate] = useState(new Date().toISOString().split('T')[0]);
  const [txnCurrency, setTxnCurrency] = useState<'USD' | 'ERN' | 'EUR' | 'GBP'>('USD');
  const [txnAmountUSD, setTxnAmountUSD] = useState<number>(500);
  const [txnExchangeRate, setTxnExchangeRate] = useState<number>(15.0);
  
  // Payer / Payee
  const [txnPayerPayee, setTxnPayerPayee] = useState('');
  const [txnPayerPayeeType, setTxnPayerPayeeType] = useState<
    'Client / Tourist' | 'Corporate Partner' | 'Hotel Vendor' | 'Airline / GDS' | 'Driver / Guide / Staff' | 'Gov Authority' | 'Fuel / Logistics Vendor' | 'Other'
  >('Client / Tourist');
  const [txnPayerPayeeContact, setTxnPayerPayeeContact] = useState('');
  const [txnTaxId, setTxnTaxId] = useState('');

  // Payment method & Bank routing
  const [txnPaymentMethod, setTxnPaymentMethod] = useState<PaymentMethod>('Bank Wire');
  const [txnBankAccount, setTxnBankAccount] = useState('Commercial Bank of Eritrea (CBE A/C # 108-0029-4112)');
  const [txnTaxRatePercent, setTxnTaxRatePercent] = useState<number>(0);
  const [txnStatus, setTxnStatus] = useState<'Completed' | 'Pending' | 'Reconciled'>('Completed');
  
  // Reference & Receipt
  const [txnRefCode, setTxnRefCode] = useState(`TXN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [txnReceiptNo, setTxnReceiptNo] = useState(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [txnRecordedBy, setTxnRecordedBy] = useState(user?.fullName || 'Finance Department');
  const [txnAuthorizedBy, setTxnAuthorizedBy] = useState('Semere Beraki (Finance Controller)');
  const [txnNotes, setTxnNotes] = useState('');

  // Entity Linkage
  const [linkedEntityType, setLinkedEntityType] = useState<'none' | 'tourist' | 'ticket' | 'booking' | 'hotel' | 'employee'>('none');
  const [linkedEntityId, setLinkedEntityId] = useState('');
  const [linkedEntityName, setLinkedEntityName] = useState('');

  // Receipt File Attachment State
  const [receiptAttachmentName, setReceiptAttachmentName] = useState<string>('');
  const [receiptAttachmentSize, setReceiptAttachmentSize] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [isReceiptDragging, setIsReceiptDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Financial Calculations
  const totalIncomeUSD = transactions
    .filter((t) => t.type === 'Income' && (t.status === 'Completed' || t.status === 'Reconciled'))
    .reduce((sum, t) => sum + t.amountUSD, 0);

  const totalExpenseUSD = transactions
    .filter((t) => t.type === 'Expense' && (t.status === 'Completed' || t.status === 'Reconciled'))
    .reduce((sum, t) => sum + t.amountUSD, 0);

  const netProfitUSD = totalIncomeUSD - totalExpenseUSD;
  const profitMarginPercent = totalIncomeUSD > 0 ? Math.round((netProfitUSD / totalIncomeUSD) * 100) : 0;

  const totalPendingReceivablesUSD = transactions
    .filter((t) => t.type === 'Income' && t.status === 'Pending')
    .reduce((sum, t) => sum + t.amountUSD, 0);

  // Category summary calculation
  const categoriesList: FinancialCategory[] = [
    'Tour Packages',
    'Flight Tickets',
    'Hotel Lodging',
    'Transport & Fleet',
    'Staff Payroll',
    'Government Fees',
    'Office & Utilities',
    'Marketing & Promotion',
    'Equipment & Supplies',
    'Taxes & Bank Charges',
    'Miscellaneous',
    'Other',
  ];

  const categoryBreakdown = categoriesList.map((cat) => {
    const income = transactions
      .filter((t) => t.category === cat && t.type === 'Income')
      .reduce((sum, t) => sum + t.amountUSD, 0);
    const expense = transactions
      .filter((t) => t.category === cat && t.type === 'Expense')
      .reduce((sum, t) => sum + t.amountUSD, 0);
    const count = transactions.filter((t) => t.category === cat).length;
    return { category: cat, income, expense, count };
  });

  // Filtered Transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.payerOrPayee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.receiptNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.receiptAttachmentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesType && matchesStatus && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Ref Code',
      'Category',
      'Sub Category',
      'Type',
      'Description',
      'Amount (USD)',
      'Amount (NFA)',
      'Payer / Payee',
      'Payer Type',
      'Payment Method',
      'Bank Account',
      'Status',
      'Receipt No',
      'Receipt Attached',
      'Recorded By',
      'Authorized By',
      'Notes',
    ];

    const rows = filteredTransactions.map((t) => [
      t.date,
      t.referenceCode,
      t.category,
      t.subCategory || '',
      t.type,
      t.description,
      t.amountUSD,
      t.amountNFA,
      t.payerOrPayee,
      t.payerPayeeType || '',
      t.paymentMethod,
      t.bankAccount || '',
      t.status,
      t.receiptNumber || '',
      t.receiptUrl ? 'Yes' : 'No',
      t.recordedBy,
      t.authorizedBy || '',
      t.notes || '',
    ]);

    exportToCSV(`EritreaVisit_Financial_Ledger_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handlePrintLedger = () => {
    printElement('printable-finance-ledger', `Financial_General_Ledger_${new Date().toISOString().split('T')[0]}`);
  };

  // Handle File Upload for Receipts
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setReceiptAttachmentName(file.name);
    const sizeInKB = Math.round(file.size / 1024);
    setReceiptAttachmentSize(sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setReceiptUrl(dataUrl);
      if (!txnReceiptNo || txnReceiptNo.includes('REC-')) {
        setTxnReceiptNo(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsReceiptDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCreateTxnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnDesc.trim() || txnAmountUSD <= 0) return;

    const taxAmountUSD = (txnAmountUSD * txnTaxRatePercent) / 100;
    const netAmountUSD = txnType === 'Income' ? txnAmountUSD - taxAmountUSD : txnAmountUSD + taxAmountUSD;

    const newTxn: FinancialTransaction = {
      id: `txn-${Date.now()}`,
      date: txnDate,
      clearingDate: txnClearingDate,
      referenceCode: txnRefCode || `TXN-${txnCategory.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      category: txnCategory,
      subCategory: txnSubCategory.trim() || undefined,
      type: txnType,
      description: txnDesc.trim(),
      amountUSD: Number(txnAmountUSD),
      amountNFA: Number(txnAmountUSD) * txnExchangeRate,
      currency: txnCurrency,
      exchangeRate: txnExchangeRate,
      payerOrPayee: txnPayerPayee.trim() || 'General Operations Cash Desk',
      payerPayeeType: txnPayerPayeeType,
      payerPayeeContact: txnPayerPayeeContact.trim() || undefined,
      taxId: txnTaxId.trim() || undefined,
      paymentMethod: txnPaymentMethod,
      bankAccount: txnBankAccount.trim() || undefined,
      taxRatePercent: txnTaxRatePercent,
      taxAmountUSD,
      netAmountUSD,
      status: txnStatus,
      receiptNumber: txnReceiptNo.trim() || undefined,
      receiptUrl: receiptUrl || undefined,
      receiptAttachmentName: receiptAttachmentName || undefined,
      receiptAttachmentSize: receiptAttachmentSize || undefined,
      linkedEntityType: linkedEntityType !== 'none' ? (linkedEntityType as any) : undefined,
      linkedEntityId: linkedEntityId || undefined,
      linkedEntityName: linkedEntityName || undefined,
      recordedBy: txnRecordedBy.trim() || user?.fullName || 'Finance Ops',
      authorizedBy: txnAuthorizedBy.trim() || undefined,
      notes: txnNotes.trim() || undefined,
      isVerified: Boolean(receiptUrl),
      verifiedAt: receiptUrl ? new Date().toISOString() : undefined,
      verifiedBy: receiptUrl ? (user?.fullName || 'Finance Ops') : undefined,
    };

    onAddTransaction(newTxn);
    setIsAddTxnModalOpen(false);

    // Reset Form
    setTxnDesc('');
    setTxnAmountUSD(500);
    setTxnPayerPayee('');
    setTxnSubCategory('');
    setTxnPayerPayeeContact('');
    setTxnTaxId('');
    setTxnNotes('');
    setReceiptUrl('');
    setReceiptAttachmentName('');
    setReceiptAttachmentSize('');
    setLinkedEntityType('none');
    setLinkedEntityId('');
    setLinkedEntityName('');
    setTxnRefCode(`TXN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setTxnReceiptNo(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <div id="finance-management-container" className="space-y-6 pb-12 text-slate-900">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 italic font-bold">
              Agency Financial Operations & General Ledger
            </h2>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-semibold">
              Multi-Currency & Nakfa Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium max-w-2xl">
            Trace, reconcile, and audit all financial activities across Eritrea travel operations: flight ticket sales & client loans, tour package bookings, partner hotel settlements, 4WD fleet fuel & maintenance, staff payroll, and government VoA permit fees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Export complete financial ledger to CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>

          <button
            onClick={handlePrintLedger}
            className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Print General Ledger summary"
          >
            <Printer className="w-4 h-4" /> Print Ledger
          </button>

          {canEdit && (
            <button
              onClick={() => {
                setTxnRefCode(`TXN-${txnCategory.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
                setTxnReceiptNo(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
                setIsAddTxnModalOpen(true);
              }}
              className="bg-brand-500 hover:bg-brand-600 text-slate-950 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Record Transaction
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
              Total Revenue (Income)
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-950 mt-1">
            ${totalIncomeUSD.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-emerald-700 font-mono font-medium mt-0.5">
            {(totalIncomeUSD * 15).toLocaleString()} ERN
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Tours, Tickets & VoA Fees</span>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-rose-700 font-bold block">
              Total Direct Costs (Expenses)
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-950 mt-1">
            ${totalExpenseUSD.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-rose-700 font-mono font-medium mt-0.5">
            {(totalExpenseUSD * 15).toLocaleString()} ERN
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Hotels, Fleet Fuel, Payroll & Govt</span>
        </div>

        {/* Net Profit */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-blue-700 font-bold block">
              Net Agency Profit
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-950 mt-1">
            ${netProfitUSD.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-blue-700 font-mono font-medium mt-0.5">
            Margin: {profitMarginPercent}% · ${(netProfitUSD).toLocaleString()} USD
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Reconciled Operating Surplus</span>
        </div>

        {/* Pending Receivables & Loans */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-800 font-bold block">
              Pending Receivables / Loans
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-950 mt-1">
            ${totalPendingReceivablesUSD.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-amber-800 font-mono font-medium mt-0.5">
            {(totalPendingReceivablesUSD * 15).toLocaleString()} ERN
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Airline ticket loans & tour balances</span>
        </div>
      </div>

      {/* Activity Summary Cards by Business Stream */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categoryBreakdown.slice(0, 6).map((item) => (
          <div
            key={item.category}
            onClick={() => {
              setCategoryFilter(item.category);
              setActiveSubTab('ledger');
            }}
            className={`p-3.5 rounded-2xl border transition cursor-pointer ${
              categoryFilter === item.category
                ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
              {item.category}
            </span>
            <div className="text-sm font-mono font-bold text-slate-900 mt-1">
              +${item.income.toLocaleString()} USD
            </div>
            <div className="text-[11px] font-mono text-rose-700">
              -${item.expense.toLocaleString()} USD
            </div>
            <span className="text-[9px] text-slate-400 font-mono block mt-1">
              {item.count} recorded entries
            </span>
          </div>
        ))}
      </div>

      {/* Tabs & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Subtabs */}
        <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-200 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 sm:px-5 py-2 rounded-full font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'ledger'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            <span>General Ledger ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('breakdown')}
            className={`px-4 sm:px-5 py-2 rounded-full font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'breakdown'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Activity Trace & Cashflow</span>
          </button>

          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`px-4 sm:px-5 py-2 rounded-full font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'invoices'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Invoices & Billing ({invoices.length})</span>
          </button>
        </div>

        {/* Category & Type Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 cursor-pointer"
          >
            <option value="all">All Activities</option>
            {categoriesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 cursor-pointer"
          >
            <option value="all">All Flows (In/Out)</option>
            <option value="Income">Income (+ Revenue)</option>
            <option value="Expense">Expense (- Direct Cost)</option>
            <option value="Transfer">Transfer</option>
            <option value="Refund">Refund</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending / Loan</option>
            <option value="Reconciled">Reconciled</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, receipt, vendor..."
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Subtab 1: General Ledger Table */}
      {activeSubTab === 'ledger' && (
        <div id="printable-finance-ledger" className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-serif italic font-bold text-slate-700">No Transactions Found</h3>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or category filter.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-mono uppercase text-[10px]">
                      <th className="py-3.5 px-4 font-bold">Date & Ref</th>
                      <th className="py-3.5 px-4 font-bold">Category</th>
                      <th className="py-3.5 px-4 font-bold">Description & Purpose</th>
                      <th className="py-3.5 px-4 font-bold">Payer / Payee</th>
                      <th className="py-3.5 px-4 font-bold">Payment Method</th>
                      <th className="py-3.5 px-4 font-bold text-right">Amount (USD)</th>
                      <th className="py-3.5 px-4 font-bold text-right">Nakfa (ERN)</th>
                      <th className="py-3.5 px-4 font-bold text-center">Receipt Doc</th>
                      <th className="py-3.5 px-4 font-bold text-center">Status</th>
                      <th className="py-3.5 px-4 font-bold text-right">Voucher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((txn) => {
                      const isIncome = txn.type === 'Income';
                      const formattedAmount = `$${txn.amountUSD.toLocaleString()} USD`;

                      return (
                        <tr key={txn.id} className="hover:bg-slate-50/60 transition">
                          {/* Date & Ref */}
                          <td className="py-3.5 px-4 font-mono text-slate-800">
                            <span className="font-bold text-slate-900 block">{txn.date}</span>
                            <span className="text-[10px] text-slate-400">{txn.referenceCode}</span>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold inline-block ${
                                txn.category === 'Tour Packages'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : txn.category === 'Flight Tickets'
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : txn.category === 'Hotel Lodging'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                  : txn.category === 'Transport & Fleet'
                                  ? 'bg-orange-100 text-orange-900 border border-orange-200'
                                  : txn.category === 'Staff Payroll'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}
                            >
                              {txn.category}
                            </span>
                            {txn.subCategory && (
                              <span className="text-[9px] text-slate-500 block font-mono mt-0.5">
                                {txn.subCategory}
                              </span>
                            )}
                          </td>

                          {/* Description */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-slate-900 line-clamp-2">
                              {txn.description}
                            </div>
                            {txn.linkedEntityName && (
                              <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                Linked: {txn.linkedEntityName}
                              </span>
                            )}
                          </td>

                          {/* Payer / Payee */}
                          <td className="py-3.5 px-4 text-slate-700">
                            <span className="font-medium text-slate-900">{txn.payerOrPayee}</span>
                            {txn.payerPayeeType && (
                              <span className="text-[10px] text-slate-500 block font-mono">
                                {txn.payerPayeeType}
                              </span>
                            )}
                          </td>

                          {/* Method & Bank */}
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            <div className="font-semibold text-slate-800">{txn.paymentMethod}</div>
                            {txn.bankAccount && (
                              <span className="text-[9px] text-slate-400 block truncate max-w-[130px]" title={txn.bankAccount}>
                                {txn.bankAccount}
                              </span>
                            )}
                          </td>

                          {/* Amount USD */}
                          <td className="py-3.5 px-4 text-right font-mono font-bold">
                            <span
                              className={`flex items-center justify-end gap-1 ${
                                isIncome ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {isIncome ? '+' : '-'}{formattedAmount}
                            </span>
                          </td>

                          {/* ERN Equivalent */}
                          <td className="py-3.5 px-4 text-right font-mono text-slate-500 text-[11px]">
                            {(txn.amountNFA || txn.amountUSD * 15).toLocaleString()} ERN
                          </td>

                          {/* Receipt Attachment Status */}
                          <td className="py-3.5 px-4 text-center">
                            {txn.receiptUrl || txn.receiptAttachmentName ? (
                              <button
                                onClick={() => setActiveVoucherTxn(txn)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold cursor-pointer transition"
                                title="View Attached Receipt Document"
                              >
                                <Paperclip className="w-3 h-3 text-emerald-600" />
                                <span>Attached</span>
                              </button>
                            ) : txn.receiptNumber ? (
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                #{txn.receiptNumber}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-300 font-mono italic">No file</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                txn.status === 'Completed' || txn.status === 'Reconciled'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {txn.status}
                            </span>
                          </td>

                          {/* Voucher Button */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setActiveVoucherTxn(txn)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200"
                              title="View Professional Payment Voucher"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-700" />
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
        </div>
      )}

      {/* Subtab 2: Activity Trace & Cashflow Breakdown */}
      {activeSubTab === 'breakdown' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Streams */}
            <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-serif italic font-bold text-slate-900 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-emerald-600" /> Revenue Trace by Category
                </h3>
                <span className="font-mono text-emerald-800 font-bold text-sm">
                  ${totalIncomeUSD.toLocaleString()} USD Total
                </span>
              </div>

              <div className="space-y-3">
                {categoryBreakdown
                  .filter((c) => c.income > 0)
                  .map((item) => {
                    const percent = totalIncomeUSD > 0 ? Math.round((item.income / totalIncomeUSD) * 100) : 0;
                    return (
                      <div key={item.category} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{item.category}</span>
                          <span className="font-mono text-slate-900 font-bold">
                            ${item.income.toLocaleString()} USD ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Expense Streams */}
            <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-serif italic font-bold text-slate-900 flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-rose-600" /> Expense Trace by Category
                </h3>
                <span className="font-mono text-rose-800 font-bold text-sm">
                  ${totalExpenseUSD.toLocaleString()} USD Total
                </span>
              </div>

              <div className="space-y-3">
                {categoryBreakdown
                  .filter((c) => c.expense > 0)
                  .map((item) => {
                    const percent = totalExpenseUSD > 0 ? Math.round((item.expense / totalExpenseUSD) * 100) : 0;
                    return (
                      <div key={item.category} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{item.category}</span>
                          <span className="font-mono text-slate-900 font-bold">
                            ${item.expense.toLocaleString()} USD ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Invoices & Receipts */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : inv.status === 'Overdue'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2">{inv.clientName}</h3>
                  <p className="text-xs text-slate-500">{inv.clientEmail}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Issue Date:</span>
                      <span className="font-mono font-semibold">{inv.date}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Due Date:</span>
                      <span className="font-mono font-semibold">{inv.dueDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-100 text-sm">
                      <span>Total Amount:</span>
                      <span className="font-mono text-emerald-800">
                        ${inv.totalAmountUSD.toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveInvoiceForView(inv)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Invoice
                  </button>
                  <button
                    onClick={() => printElement('printable-finance-ledger', `Invoice_${inv.invoiceNumber}`)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Print Invoice"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD FINANCIAL TRANSACTION MODAL WITH RECEIPT UPLOAD & COMPREHENSIVE FIELDS */}
      {/* ========================================================================= */}
      {isAddTxnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-6 animate-in fade-in duration-200 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900">
                    Record Financial Transaction
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Capture comprehensive accounting details, tax invoices, and attach supporting receipts.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTxnModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTxnSubmit} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
              {/* SECTION 1: TRANSACTION TYPE & CLASSIFICATION */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  1. Transaction Flow & Category
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Flow Type</label>
                    <select
                      value={txnType}
                      onChange={(e) => setTxnType(e.target.value as TransactionType)}
                      className={`w-full px-3 py-2 rounded-xl border font-bold text-xs cursor-pointer ${
                        txnType === 'Income'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : txnType === 'Expense'
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="Income">Income (+ Revenue Inflow)</option>
                      <option value="Expense">Expense (- Cost Outflow)</option>
                      <option value="Transfer">Internal Transfer</option>
                      <option value="Refund">Client Refund</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">General Ledger Category</label>
                    <select
                      value={txnCategory}
                      onChange={(e) => setTxnCategory(e.target.value as FinancialCategory)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 cursor-pointer"
                    >
                      {categoriesList.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sub-Category (Optional)</label>
                    <input
                      type="text"
                      value={txnSubCategory}
                      onChange={(e) => setTxnSubCategory(e.target.value)}
                      placeholder="e.g. Tour Guide Per Diem, Fuel"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Transaction Reference Code</label>
                    <input
                      type="text"
                      required
                      value={txnRefCode}
                      onChange={(e) => setTxnRefCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Transaction Date</label>
                    <input
                      type="date"
                      required
                      value={txnDate}
                      onChange={(e) => setTxnDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Clearing / Value Date</label>
                    <input
                      type="date"
                      value={txnClearingDate}
                      onChange={(e) => setTxnClearingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DESCRIPTION & BUSINESS PURPOSE */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Description & Business Purpose <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={txnDesc}
                  onChange={(e) => setTxnDesc(e.target.value)}
                  placeholder="e.g. Asmara UNESCO Historical Tour Deposit for Jean-Luc Dupont party"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* SECTION 3: AMOUNT, MULTI-CURRENCY & TAX */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-900 font-bold block">
                  2. Financial Amounts, Conversion & Tax
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Currency</label>
                    <select
                      value={txnCurrency}
                      onChange={(e) => setTxnCurrency(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="ERN">ERN (Nakfa)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Amount ($ USD)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      required
                      value={txnAmountUSD}
                      onChange={(e) => setTxnAmountUSD(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Exchange Rate (ERN)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={txnExchangeRate}
                      onChange={(e) => setTxnExchangeRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Converted (Nakfa ERN)</label>
                    <div className="px-3 py-2 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 font-mono font-bold">
                      {(txnAmountUSD * txnExchangeRate).toLocaleString()} ERN
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-amber-200/60">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tax / VAT Rate (%)</label>
                    <select
                      value={txnTaxRatePercent}
                      onChange={(e) => setTxnTaxRatePercent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 cursor-pointer"
                    >
                      <option value={0}>0% - Tax Exempt / Zero Rated</option>
                      <option value={5}>5% - Tourism & Hospitality Service Charge</option>
                      <option value={15}>15% - Standard Commercial VAT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Calculated Tax Amount</label>
                    <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-slate-800">
                      ${((txnAmountUSD * txnTaxRatePercent) / 100).toFixed(2)} USD
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Accounting Status</label>
                    <select
                      value={txnStatus}
                      onChange={(e) => setTxnStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="Completed">Completed (Cleared)</option>
                      <option value="Pending">Pending / Receivables Loan</option>
                      <option value="Reconciled">Reconciled (Audited)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 4: PAYER / PAYEE & BANK ROUTING */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  3. Payer / Payee & Payment Method
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Payer / Payee Name</label>
                    <input
                      type="text"
                      required
                      value={txnPayerPayee}
                      onChange={(e) => setTxnPayerPayee(e.target.value)}
                      placeholder="e.g. Jean-Luc Dupont or Asmara Palace Hotel"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Payer / Payee Category</label>
                    <select
                      value={txnPayerPayeeType}
                      onChange={(e) => setTxnPayerPayeeType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 cursor-pointer"
                    >
                      <option value="Client / Tourist">Client / Tourist</option>
                      <option value="Corporate Partner">Corporate Partner</option>
                      <option value="Hotel Vendor">Hotel Vendor</option>
                      <option value="Airline / GDS">Airline / GDS Carrier</option>
                      <option value="Driver / Guide / Staff">Driver / Guide / Staff</option>
                      <option value="Gov Authority">Gov Authority (Tourism / Immigration)</option>
                      <option value="Fuel / Logistics Vendor">Fuel / Logistics Vendor</option>
                      <option value="Other">Other Third Party</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tax ID / TIN (Optional)</label>
                    <input
                      type="text"
                      value={txnTaxId}
                      onChange={(e) => setTxnTaxId(e.target.value)}
                      placeholder="e.g. TIN-ER-89412"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={txnPaymentMethod}
                      onChange={(e) => setTxnPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 cursor-pointer font-bold"
                    >
                      <option value="Bank Wire">Bank Wire / Swift</option>
                      <option value="Commercial Bank of Eritrea (CBE)">Commercial Bank of Eritrea (CBE)</option>
                      <option value="Cash (USD)">Cash (USD)</option>
                      <option value="Cash (NFA)">Cash (NFA / Nakfa)</option>
                      <option value="Credit Card">Credit Card (POS Terminal)</option>
                      <option value="Telebirr / Mobile Money">Telebirr / Mobile Money</option>
                      <option value="Agent Ledger">Agent Ledger Credit</option>
                      <option value="Company Cheque">Company Cheque</option>
                      <option value="Traveler Cheque">Traveler Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bank Account / Terminal Reference</label>
                    <input
                      type="text"
                      value={txnBankAccount}
                      onChange={(e) => setTxnBankAccount(e.target.value)}
                      placeholder="e.g. CBE A/C # 108-0029-4112 / Swift ERTBAS22"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-slate-900 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: RECEIPT UPLOAD & ATTACHMENT */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-900 font-bold flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-700" />
                    4. Attach Supporting Receipt / Tax Invoice
                  </span>
                  <span className="text-[10px] text-blue-700 font-mono">PNG, JPG, PDF & scanned receipts</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Official Receipt Number</label>
                    <input
                      type="text"
                      value={txnReceiptNo}
                      onChange={(e) => setTxnReceiptNo(e.target.value)}
                      placeholder="e.g. REC-2026-8941"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold text-slate-900"
                    />
                  </div>

                  {/* Dropzone & Picker */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Upload Receipt Document</label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsReceiptDragging(true);
                      }}
                      onDragLeave={() => setIsReceiptDragging(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-3.5 rounded-xl border-2 border-dashed transition cursor-pointer flex items-center justify-between gap-3 ${
                        isReceiptDragging
                          ? 'border-blue-500 bg-blue-100/70'
                          : receiptUrl
                          ? 'border-emerald-300 bg-emerald-50/60'
                          : 'border-blue-200 bg-white hover:bg-blue-50/40'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />

                      {receiptUrl ? (
                        <div className="flex items-center gap-3 min-w-0">
                          {receiptUrl.startsWith('data:image') ? (
                            <img
                              src={receiptUrl}
                              alt="Receipt Thumbnail"
                              className="w-10 h-10 object-cover rounded-lg border border-emerald-300 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-mono font-bold text-xs">
                              PDF
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-xs truncate">
                              {receiptAttachmentName || 'Receipt_Attachment.png'}
                            </p>
                            <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                              {receiptAttachmentSize || 'Attached'} · Verified
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Upload className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="text-xs">
                            <strong className="text-blue-700">Click to browse</strong> or drag and drop receipt file
                          </span>
                        </div>
                      )}

                      {receiptUrl ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReceiptUrl('');
                            setReceiptAttachmentName('');
                            setReceiptAttachmentSize('');
                          }}
                          className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 transition"
                          title="Remove receipt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono shrink-0">
                          Browse
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: ENTITY LINKAGE & AUDIT */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  5. Optional Entity Linkage & Audit Control
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Link with Record</label>
                    <select
                      value={linkedEntityType}
                      onChange={(e) => {
                        setLinkedEntityType(e.target.value as any);
                        setLinkedEntityId('');
                        setLinkedEntityName('');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 cursor-pointer"
                    >
                      <option value="none">No Direct Link</option>
                      <option value="tourist">Link to Tourist Profile</option>
                      <option value="ticket">Link to Flight Ticket</option>
                      <option value="booking">Link to Tour Package</option>
                      <option value="hotel">Link to Hotel Vendor</option>
                      <option value="employee">Link to Staff / Employee</option>
                    </select>
                  </div>

                  {linkedEntityType === 'tourist' && (
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Select Tourist</label>
                      <select
                        value={linkedEntityId}
                        onChange={(e) => {
                          const t = tourists.find((item) => item.id === e.target.value);
                          setLinkedEntityId(e.target.value);
                          if (t) {
                            setLinkedEntityName(t.fullName);
                            if (!txnPayerPayee) setTxnPayerPayee(t.fullName);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 cursor-pointer"
                      >
                        <option value="">-- Choose Tourist Profile --</option>
                        {tourists.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.fullName} ({t.nationality} - {t.passportNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {linkedEntityType === 'ticket' && (
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Select Flight Ticket</label>
                      <select
                        value={linkedEntityId}
                        onChange={(e) => {
                          const t = tickets.find((item) => item.id === e.target.value);
                          setLinkedEntityId(e.target.value);
                          if (t) {
                            setLinkedEntityName(`PNR: ${t.pnr || t.bookingRef} (${t.clientName || t.touristName})`);
                            if (!txnPayerPayee) setTxnPayerPayee(t.clientName || t.touristName || '');
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 cursor-pointer"
                      >
                        <option value="">-- Choose Issued Ticket --</option>
                        {tickets.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.pnr || t.bookingRef} - {t.clientName || t.touristName} (${t.price} USD)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {linkedEntityType === 'employee' && (
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Select Staff Member</label>
                      <select
                        value={linkedEntityId}
                        onChange={(e) => {
                          const emp = employees.find((item) => item.id === e.target.value);
                          setLinkedEntityId(e.target.value);
                          if (emp) {
                            setLinkedEntityName(`${emp.name} (${emp.role})`);
                            if (!txnPayerPayee) setTxnPayerPayee(emp.name);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 cursor-pointer"
                      >
                        <option value="">-- Choose Employee / Guide / Driver --</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} - {emp.role} ({emp.departmentName || emp.departmentId})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {linkedEntityType === 'hotel' && (
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Select Hotel Partner</label>
                      <select
                        value={linkedEntityId}
                        onChange={(e) => {
                          const h = hotels.find((item) => item.id === e.target.value);
                          setLinkedEntityId(e.target.value);
                          if (h) {
                            setLinkedEntityName(h.name);
                            if (!txnPayerPayee) setTxnPayerPayee(h.name);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 cursor-pointer"
                      >
                        <option value="">-- Choose Hotel Partner --</option>
                        {hotels.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} ({h.city})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Recorded By</label>
                    <input
                      type="text"
                      value={txnRecordedBy}
                      onChange={(e) => setTxnRecordedBy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Authorized / Approved By</label>
                    <input
                      type="text"
                      value={txnAuthorizedBy}
                      onChange={(e) => setTxnAuthorizedBy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Internal Accounting Memo & Notes</label>
                  <textarea
                    rows={2}
                    value={txnNotes}
                    onChange={(e) => setTxnNotes(e.target.value)}
                    placeholder="e.g. Cleared via CBE Swift wire, verified against hotel invoice confirmation."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTxnModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-bold cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save Financial Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROFESSIONAL TRANSACTION VOUCHER & RECEIPT VIEWER MODAL                  */}
      {/* ========================================================================= */}
      {activeVoucherTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-6 animate-in fade-in duration-200 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-700" />
                <h2 className="text-base font-serif font-bold text-slate-900">
                  Official Accounting Voucher #{activeVoucherTxn.referenceCode}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printElement('printable-voucher-card', `Voucher_${activeVoucherTxn.referenceCode}`)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  title="Print Official Payment Voucher"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveVoucherTxn(null)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div id="printable-voucher-card" className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
              {/* Voucher Top Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-950">EritreaVisit Tours & Travel</h3>
                  <p className="text-slate-500">Accounts & Financial Control Division</p>
                  <p className="text-slate-500">BDHO Avenue, Asmara, Eritrea</p>
                  <p className="text-slate-500 font-mono text-[11px]">TIN: ER-109482 · Swift: ERTBAS22</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono inline-block ${
                    activeVoucherTxn.type === 'Income' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                  }`}>
                    {activeVoucherTxn.type === 'Income' ? 'OFFICIAL RECEIPT VOUCHER' : 'OFFICIAL PAYMENT VOUCHER'}
                  </span>
                  <div className="font-mono font-bold text-sm text-slate-900 mt-2">
                    Ref: {activeVoucherTxn.referenceCode}
                  </div>
                  <span className="text-slate-500 block font-mono">Date: {activeVoucherTxn.date}</span>
                  {activeVoucherTxn.receiptNumber && (
                    <span className="text-blue-700 font-mono font-semibold block">
                      Receipt No: #{activeVoucherTxn.receiptNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Payer / Payee and Details */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                    {activeVoucherTxn.type === 'Income' ? 'Received From (Payer)' : 'Paid To (Payee)'}
                  </span>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">{activeVoucherTxn.payerOrPayee}</p>
                  {activeVoucherTxn.payerPayeeType && (
                    <p className="text-[11px] text-slate-500">{activeVoucherTxn.payerPayeeType}</p>
                  )}
                  {activeVoucherTxn.taxId && (
                    <p className="text-[11px] font-mono text-slate-500">TIN/Tax: {activeVoucherTxn.taxId}</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                    Payment Method & Banking
                  </span>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">{activeVoucherTxn.paymentMethod}</p>
                  {activeVoucherTxn.bankAccount && (
                    <p className="text-[11px] font-mono text-slate-600">{activeVoucherTxn.bankAccount}</p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-0.5">Status: <strong className="text-emerald-700">{activeVoucherTxn.status}</strong></p>
                </div>
              </div>

              {/* Description & Linkage */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                  Transaction Purpose & Category
                </span>
                <p className="text-sm font-semibold text-slate-900">{activeVoucherTxn.description}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                    Category: {activeVoucherTxn.category}
                  </span>
                  {activeVoucherTxn.subCategory && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      Sub: {activeVoucherTxn.subCategory}
                    </span>
                  )}
                  {activeVoucherTxn.linkedEntityName && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-semibold text-[10px]">
                      Linked: {activeVoucherTxn.linkedEntityName}
                    </span>
                  )}
                </div>
                {activeVoucherTxn.notes && (
                  <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-100">
                    Memo: {activeVoucherTxn.notes}
                  </p>
                )}
              </div>

              {/* Financial Calculation Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                    Total Amount
                  </span>
                  <div className="text-2xl font-mono font-black text-amber-400">
                    ${activeVoucherTxn.amountUSD.toLocaleString()} USD
                  </div>
                  <span className="text-xs font-mono text-slate-300">
                    Official Nakfa: {(activeVoucherTxn.amountNFA || activeVoucherTxn.amountUSD * 15).toLocaleString()} ERN
                  </span>
                </div>

                <div className="text-right text-xs font-mono space-y-0.5 text-slate-300">
                  <div>Exchange Rate: 1 USD = {activeVoucherTxn.exchangeRate || 15} ERN</div>
                  {activeVoucherTxn.taxRatePercent ? (
                    <div>Tax ({activeVoucherTxn.taxRatePercent}%): ${activeVoucherTxn.taxAmountUSD?.toFixed(2)} USD</div>
                  ) : (
                    <div>Tax: 0% (Exempt)</div>
                  )}
                  <div className="text-emerald-400 font-bold">Settled in Full</div>
                </div>
              </div>

              {/* Attached Receipt File Preview */}
              {activeVoucherTxn.receiptUrl && (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-blue-900 font-bold flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-700" /> Attached Receipt Document
                    </span>
                    <span className="text-[10px] text-blue-700 font-mono">
                      {activeVoucherTxn.receiptAttachmentName || 'Receipt_Doc'}
                    </span>
                  </div>

                  {activeVoucherTxn.receiptUrl.startsWith('data:image') ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-2">
                      <img
                        src={activeVoucherTxn.receiptUrl}
                        alt="Receipt Scan"
                        className="max-h-64 mx-auto object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                      <FileText className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                      <p className="font-bold text-slate-900 text-xs">
                        {activeVoucherTxn.receiptAttachmentName || 'Attached Document'}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {activeVoucherTxn.receiptAttachmentSize || 'PDF Document'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Audit Sign-offs */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-[11px]">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-mono font-bold">Prepared & Recorded By</span>
                  <p className="font-bold text-slate-900 mt-1">{activeVoucherTxn.recordedBy}</p>
                  <span className="text-slate-500 text-[10px]">Accounts Officer</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-mono font-bold">Authorized & Approved By</span>
                  <p className="font-bold text-slate-900 mt-1">{activeVoucherTxn.authorizedBy || 'Semere Beraki (Finance Controller)'}</p>
                  <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Stamp & Certified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {activeInvoiceForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-serif font-bold text-slate-900 italic">
                Invoice {activeInvoiceForView.invoiceNumber}
              </h2>
              <button
                onClick={() => setActiveInvoiceForView(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <p className="font-bold text-slate-900 text-sm">EritreaVisit Tours & Travel</p>
                  <p className="text-slate-500">BDHO Avenue, Asmara, Eritrea</p>
                  <p className="text-slate-500">Phone: +291 1 120000 · info@eritreavisit.er</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block">
                    {activeInvoiceForView.invoiceNumber}
                  </span>
                  <span className="text-slate-500">Issued: {activeInvoiceForView.date}</span>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2 px-3 text-left">Description</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Total (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeInvoiceForView.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{item.description}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        ${item.unitPriceUSD.toLocaleString()} USD
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        ${item.totalUSD.toLocaleString()} USD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Summary */}
              <div className="border-t-2 border-slate-300 pt-3 flex justify-between items-start">
                <div className="text-xs text-slate-500 max-w-xs">
                  {activeInvoiceForView.notes}
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs text-slate-600">
                    Subtotal: <span className="font-mono">${activeInvoiceForView.subtotalUSD} USD</span>
                  </div>
                  <div className="text-base font-black text-slate-950 font-mono">
                    Total: ${activeInvoiceForView.totalAmountUSD.toLocaleString()} USD
                  </div>
                  <div className="text-xs font-mono text-emerald-700 font-bold">
                    (${activeInvoiceForView.totalAmountUSD} USD · {activeInvoiceForView.totalAmountNFA} NFA)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
