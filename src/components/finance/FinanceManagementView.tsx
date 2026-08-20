import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  FinancialTransaction,
  FinancialInvoice,
  FinancialCategory,
  TouristProfile,
  TourPackage,
  Hotel,
  TicketRecord,
} from '../../types';
import { exportToCSV, printElement, exportElementAsHTML } from '../../utils/exportUtils';

interface FinanceManagementViewProps {
  transactions: FinancialTransaction[];
  invoices: FinancialInvoice[];
  tourists?: TouristProfile[];
  packages?: TourPackage[];
  hotels?: Hotel[];
  tickets?: TicketRecord[];
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
  onAddTransaction,
  onAddInvoice,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'invoices' | 'breakdown'>('ledger');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isAddTxnModalOpen, setIsAddTxnModalOpen] = useState(false);
  const [activeInvoiceForView, setActiveInvoiceForView] = useState<FinancialInvoice | null>(null);

  // New Transaction Form State
  const [txnCategory, setTxnCategory] = useState<FinancialCategory>('Tour Packages');
  const [txnType, setTxnType] = useState<'Income' | 'Expense'>('Income');
  const [txnDesc, setTxnDesc] = useState('');
  const [txnAmountUSD, setTxnAmountUSD] = useState<number>(500);
  const [txnPayerPayee, setTxnPayerPayee] = useState('');
  const [txnPaymentMethod, setTxnPaymentMethod] = useState<'Bank Wire' | 'Cash (USD)' | 'Cash (NFA)' | 'Credit Card' | 'Agent Ledger'>('Bank Wire');
  const [txnStatus, setTxnStatus] = useState<'Completed' | 'Pending'>('Completed');
  const [txnReceiptNo, setTxnReceiptNo] = useState(`REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [txnRecordedBy, setTxnRecordedBy] = useState('Central Finance Ops');
  const [txnNotes, setTxnNotes] = useState('');

  // Financial Calculations
  const totalIncomeUSD = transactions
    .filter((t) => t.type === 'Income' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amountUSD, 0);

  const totalExpenseUSD = transactions
    .filter((t) => t.type === 'Expense' && t.status === 'Completed')
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
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesType && matchesStatus && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Ref Code',
      'Category',
      'Type',
      'Description',
      'Amount (USD)',
      'Amount (NFA)',
      'Payer / Payee',
      'Payment Method',
      'Status',
      'Receipt No',
      'Recorded By',
      'Notes',
    ];

    const rows = filteredTransactions.map((t) => [
      t.date,
      t.referenceCode,
      t.category,
      t.type,
      t.description,
      t.amountUSD,
      t.amountNFA,
      t.payerOrPayee,
      t.paymentMethod,
      t.status,
      t.receiptNumber || '',
      t.recordedBy,
      t.notes || '',
    ]);

    exportToCSV(`EritreaVisit_Financial_Ledger_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handlePrintLedger = () => {
    printElement('printable-finance-ledger', `Financial_General_Ledger_${new Date().toISOString().split('T')[0]}`);
  };

  const handleCreateTxnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnDesc.trim() || txnAmountUSD <= 0) return;

    const newTxn: FinancialTransaction = {
      id: `txn-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      referenceCode: `TXN-${txnCategory.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      category: txnCategory,
      type: txnType,
      description: txnDesc.trim(),
      amountUSD: Number(txnAmountUSD),
      amountNFA: Number(txnAmountUSD) * 15,
      payerOrPayee: txnPayerPayee.trim() || 'Internal Cash Office',
      paymentMethod: txnPaymentMethod,
      status: txnStatus,
      receiptNumber: txnReceiptNo.trim(),
      recordedBy: txnRecordedBy.trim() || 'Central Finance Ops',
      notes: txnNotes.trim(),
    };

    onAddTransaction(newTxn);
    setIsAddTxnModalOpen(false);
    setTxnDesc('');
    setTxnAmountUSD(500);
    setTxnPayerPayee('');
    setTxnNotes('');
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

          <button
            onClick={() => setIsAddTxnModalOpen(true)}
            className="bg-brand-500 hover:bg-brand-600 text-slate-950 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Record Transaction
          </button>
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
        {categoryBreakdown.map((item) => (
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
            <span>Invoices & Receipts ({invoices.length})</span>
          </button>
        </div>

        {/* Category & Type Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
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
            className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
          >
            <option value="all">All Flows (In/Out)</option>
            <option value="Income">Income (+)</option>
            <option value="Expense">Expense (-)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending / Loan</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, receipt..."
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
                      <th className="py-3 px-4 font-bold">Date & Ref</th>
                      <th className="py-3 px-4 font-bold">Activity / Category</th>
                      <th className="py-3 px-4 font-bold">Description & Link</th>
                      <th className="py-3 px-4 font-bold">Payer / Payee</th>
                      <th className="py-3 px-4 font-bold">Method</th>
                      <th className="py-3 px-4 font-bold text-right">Amount (USD)</th>
                      <th className="py-3 px-4 font-bold text-right">Nakfa (ERN)</th>
                      <th className="py-3 px-4 font-bold text-center">Status</th>
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
                          </td>

                          {/* Description */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-slate-900 line-clamp-2">
                              {txn.description}
                            </div>
                            {txn.receiptNumber && (
                              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                                Receipt: {txn.receiptNumber}
                              </span>
                            )}
                          </td>

                          {/* Payer / Payee */}
                          <td className="py-3.5 px-4 text-slate-700">
                            <span className="font-medium">{txn.payerOrPayee}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              By: {txn.recordedBy}
                            </span>
                          </td>

                          {/* Method */}
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            {txn.paymentMethod}
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
                            {(txn.amountUSD * 15).toLocaleString()} ERN
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                txn.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {txn.status}
                            </span>
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
                  .map((c) => {
                    const percentage = totalIncomeUSD > 0 ? Math.round((c.income / totalIncomeUSD) * 100) : 0;

                    return (
                      <div key={c.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{c.category}</span>
                          <span className="font-mono font-bold text-slate-900">
                            ${c.income.toLocaleString()} USD ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${percentage}%` }}
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
                  <ArrowDownRight className="w-5 h-5 text-rose-600" /> Cost Distribution by Operational Activity
                </h3>
                <span className="font-mono text-rose-800 font-bold text-sm">
                  ${totalExpenseUSD.toLocaleString()} USD Total
                </span>
              </div>

              <div className="space-y-3">
                {categoryBreakdown
                  .filter((c) => c.expense > 0)
                  .map((c) => {
                    const percentage = totalExpenseUSD > 0 ? Math.round((c.expense / totalExpenseUSD) * 100) : 0;

                    return (
                      <div key={c.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{c.category}</span>
                          <span className="font-mono font-bold text-slate-900">
                            ${c.expense.toLocaleString()} USD ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full"
                            style={{ width: `${percentage}%` }}
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

      {/* Add Transaction Modal */}
      {isAddTxnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden my-8 animate-in fade-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-serif font-bold text-slate-900 italic">
                Record Financial Transaction
              </h2>
              <button
                onClick={() => setIsAddTxnModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTxnSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Flow Type</label>
                  <select
                    value={txnType}
                    onChange={(e) => setTxnType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
                  >
                    <option value="Income">Income (+ Revenue)</option>
                    <option value="Expense">Expense (- Direct Cost)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Activity Category</label>
                  <select
                    value={txnCategory}
                    onChange={(e) => setTxnCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Activity Link</label>
                <input
                  type="text"
                  required
                  value={txnDesc}
                  onChange={(e) => setTxnDesc(e.target.value)}
                  placeholder="e.g. Asmara UNESCO Tour Booking Deposit"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (USD $)</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={txnAmountUSD}
                    onChange={(e) => setTxnAmountUSD(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Converted (ERN @ 15:1)
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold">
                    {(txnAmountUSD * 15).toLocaleString()} ERN
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payer / Payee</label>
                  <input
                    type="text"
                    value={txnPayerPayee}
                    onChange={(e) => setTxnPayerPayee(e.target.value)}
                    placeholder="e.g. Jean-Luc Dupont"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={txnPaymentMethod}
                    onChange={(e) => setTxnPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    <option value="Bank Wire">Bank Wire / Swift</option>
                    <option value="Cash (USD)">Cash (USD)</option>
                    <option value="Cash (NFA)">Cash (NFA / Nakfa)</option>
                    <option value="Credit Card">Credit Card (POS)</option>
                    <option value="Agent Ledger">Agent Ledger Credit</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTxnModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-slate-900 text-white font-bold cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
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

