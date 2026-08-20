import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Building,
  Truck,
  Ship,
  FileCheck2,
  Users,
  Coins,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  Sparkles,
} from 'lucide-react';
import { FinancialTransaction, FinancialCategory, ExpenseReceipt } from '../../types';

interface ExpenseChartsAnalyticsProps {
  transactions: FinancialTransaction[];
  receipts?: ExpenseReceipt[];
  onSelectCategory?: (category: FinancialCategory | 'all') => void;
  selectedCategory?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Hotel Lodging': '#825DF5', // Violet
  'Transport & Fleet': '#F47C53', // Amber
  'Staff Payroll': '#2799DD', // Blue
  'Government Fees': '#0FB287', // Emerald
  'Flight Tickets': '#DB1F36', // Pink
  'Tour Packages': '#12AEEB', // Cyan
  'Miscellaneous': '#67798A', // Slate
  'Other': '#93A5B4',
};

const EXPENSE_SUB_COLORS = ['#DC4116', '#068CC8', '#713BEC', '#059070', '#B8162B', '#B8162B', '#4E6070'];

export const ExpenseChartsAnalytics: React.FC<ExpenseChartsAnalyticsProps> = ({
  transactions,
  receipts = [],
  onSelectCategory,
  selectedCategory = 'all',
}) => {
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'ERN'>('USD');
  const [chartView, setChartView] = useState<'distribution' | 'comparison' | 'timeline'>('distribution');

  const exchangeRate = 15; // 1 USD = 15 ERN
  const formatAmount = (valUSD: number) => {
    if (currencyMode === 'ERN') {
      return `${(valUSD * exchangeRate).toLocaleString()} ERN`;
    }
    return `$${valUSD.toLocaleString()} USD`;
  };

  // Filter completed transactions
  const completedTxns = transactions.filter((t) => t.status === 'Completed');
  const expenseTxns = completedTxns.filter((t) => t.type === 'Expense');
  const incomeTxns = completedTxns.filter((t) => t.type === 'Income');

  const totalExpenseUSD = expenseTxns.reduce((sum, t) => sum + t.amountUSD, 0);
  const totalIncomeUSD = incomeTxns.reduce((sum, t) => sum + t.amountUSD, 0);

  // Category breakdown for expenses
  const categoryMap: Record<string, { count: number; totalUSD: number; verifiedUSD: number }> = {};

  expenseTxns.forEach((t) => {
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = { count: 0, totalUSD: 0, verifiedUSD: 0 };
    }
    categoryMap[t.category].count += 1;
    categoryMap[t.category].totalUSD += t.amountUSD;
    if (t.isVerified || t.receiptNumber) {
      categoryMap[t.category].verifiedUSD += t.amountUSD;
    }
  });

  const categoryPieData = Object.keys(categoryMap).map((cat) => {
    const totalUSD = categoryMap[cat].totalUSD;
    const value = currencyMode === 'ERN' ? totalUSD * exchangeRate : totalUSD;
    const percentage = totalExpenseUSD > 0 ? ((totalUSD / totalExpenseUSD) * 100).toFixed(1) : '0';
    return {
      name: cat,
      value,
      totalUSD,
      count: categoryMap[cat].count,
      percentage: Number(percentage),
      color: CATEGORY_COLORS[cat] || '#67798A',
    };
  }).sort((a, b) => b.totalUSD - a.totalUSD);

  // Sub-breakdown: Transport & Fleet sub-categories (Car rental vs Boat Charter vs Fuel vs Workshop)
  const vehicleRentalUSD = expenseTxns
    .filter((t) => t.description.toLowerCase().includes('rental') || t.description.toLowerCase().includes('lease') || t.referenceCode.includes('RNT-CAR'))
    .reduce((sum, t) => sum + t.amountUSD, 0);

  const boatCharterUSD = expenseTxns
    .filter((t) => t.description.toLowerCase().includes('boat') || t.description.toLowerCase().includes('dhow') || t.description.toLowerCase().includes('marine') || t.referenceCode.includes('RNT-BOAT'))
    .reduce((sum, t) => sum + t.amountUSD, 0);

  const fuelDepotUSD = expenseTxns
    .filter((t) => t.description.toLowerCase().includes('fuel') || t.description.toLowerCase().includes('diesel'))
    .reduce((sum, t) => sum + t.amountUSD, 0);

  const maintenanceUSD = expenseTxns
    .filter((t) => t.description.toLowerCase().includes('maintenance') || t.description.toLowerCase().includes('workshop') || t.description.toLowerCase().includes('repair') || t.description.toLowerCase().includes('suspension'))
    .reduce((sum, t) => sum + t.amountUSD, 0);

  const hotelLodgingUSD = expenseTxns
    .filter((t) => t.category === 'Hotel Lodging')
    .reduce((sum, t) => sum + t.amountUSD, 0);

  const governmentPermitsUSD = expenseTxns
    .filter((t) => t.category === 'Government Fees')
    .reduce((sum, t) => sum + t.amountUSD, 0);

  const staffPayrollUSD = expenseTxns
    .filter((t) => t.category === 'Staff Payroll')
    .reduce((sum, t) => sum + t.amountUSD, 0);

  const detailedStreamsData = [
    {
      stream: 'Staff Salaries & Field Per-Diem',
      category: 'Staff Payroll',
      amountUSD: staffPayrollUSD,
      value: currencyMode === 'ERN' ? staffPayrollUSD * exchangeRate : staffPayrollUSD,
      color: '#2799DD',
      icon: Users,
    },
    {
      stream: 'Partner Hotel & Eco-Lodge Folios',
      category: 'Hotel Lodging',
      amountUSD: hotelLodgingUSD,
      value: currencyMode === 'ERN' ? hotelLodgingUSD * exchangeRate : hotelLodgingUSD,
      color: '#825DF5',
      icon: Building,
    },
    {
      stream: 'Third-Party Car & 4WD Rentals',
      category: 'Transport & Fleet',
      amountUSD: vehicleRentalUSD,
      value: currencyMode === 'ERN' ? vehicleRentalUSD * exchangeRate : vehicleRentalUSD,
      color: '#DC4116',
      icon: Truck,
    },
    {
      stream: 'Marine Boat & Speedboat Charters',
      category: 'Transport & Fleet',
      amountUSD: boatCharterUSD,
      value: currencyMode === 'ERN' ? boatCharterUSD * exchangeRate : boatCharterUSD,
      color: '#068CC8',
      icon: Ship,
    },
    {
      stream: 'Depot Fleet Diesel & Fuel',
      category: 'Transport & Fleet',
      amountUSD: fuelDepotUSD,
      value: currencyMode === 'ERN' ? fuelDepotUSD * exchangeRate : fuelDepotUSD,
      color: '#F47C53',
      icon: Coins,
    },
    {
      stream: 'Automotive Workshop Repairs',
      category: 'Transport & Fleet',
      amountUSD: maintenanceUSD,
      value: currencyMode === 'ERN' ? maintenanceUSD * exchangeRate : maintenanceUSD,
      color: '#67798A',
      icon: Layers,
    },
    {
      stream: 'Ministry of Tourism Travel Permits',
      category: 'Government Fees',
      amountUSD: governmentPermitsUSD,
      value: currencyMode === 'ERN' ? governmentPermitsUSD * exchangeRate : governmentPermitsUSD,
      color: '#0FB287',
      icon: FileCheck2,
    },
  ].sort((a, b) => b.amountUSD - a.amountUSD);

  // Income vs Expense Comparison by Category
  const comparisonCategories: FinancialCategory[] = [
    'Tour Packages',
    'Flight Tickets',
    'Hotel Lodging',
    'Transport & Fleet',
    'Staff Payroll',
    'Government Fees',
  ];

  const comparisonData = comparisonCategories.map((cat) => {
    const inc = incomeTxns.filter((t) => t.category === cat).reduce((s, t) => s + t.amountUSD, 0);
    const exp = expenseTxns.filter((t) => t.category === cat).reduce((s, t) => s + t.amountUSD, 0);
    return {
      category: cat,
      Income: currencyMode === 'ERN' ? inc * exchangeRate : inc,
      Expense: currencyMode === 'ERN' ? exp * exchangeRate : exp,
      netUSD: inc - exp,
      rawIncomeUSD: inc,
      rawExpenseUSD: exp,
    };
  });

  // Timeline / Cashflow Accumulation by Date
  const dateMap: Record<string, { incomeUSD: number; expenseUSD: number }> = {};
  completedTxns.forEach((t) => {
    if (!dateMap[t.date]) {
      dateMap[t.date] = { incomeUSD: 0, expenseUSD: 0 };
    }
    if (t.type === 'Income') dateMap[t.date].incomeUSD += t.amountUSD;
    if (t.type === 'Expense') dateMap[t.date].expenseUSD += t.amountUSD;
  });

  const sortedDates = Object.keys(dateMap).sort();
  let cumulativeExpenseUSD = 0;
  let cumulativeIncomeUSD = 0;

  const timelineData = sortedDates.map((date) => {
    cumulativeIncomeUSD += dateMap[date].incomeUSD;
    cumulativeExpenseUSD += dateMap[date].expenseUSD;
    return {
      date: date.replace('2026-', ''),
      fullDate: date,
      dailyExpense: currencyMode === 'ERN' ? dateMap[date].expenseUSD * exchangeRate : dateMap[date].expenseUSD,
      dailyIncome: currencyMode === 'ERN' ? dateMap[date].incomeUSD * exchangeRate : dateMap[date].incomeUSD,
      cumulativeExpense: currencyMode === 'ERN' ? cumulativeExpenseUSD * exchangeRate : cumulativeExpenseUSD,
      cumulativeIncome: currencyMode === 'ERN' ? cumulativeIncomeUSD * exchangeRate : cumulativeIncomeUSD,
      netDaily: dateMap[date].incomeUSD - dateMap[date].expenseUSD,
    };
  });

  // Receipt verification ratio calculation
  const verifiedReceiptsCount = receipts.filter((r) => r.verificationStatus === 'Verified').length;
  const verifiedExpenseTotalUSD = receipts
    .filter((r) => r.verificationStatus === 'Verified')
    .reduce((sum, r) => sum + r.amountUSD, 0);
  const verificationCoveragePercent = totalExpenseUSD > 0
    ? Math.min(100, Math.round((verifiedExpenseTotalUSD / totalExpenseUSD) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Visual Analytics Header & Controls */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-950 font-heading">
              Visual Expense Analytics & Category Breakdown
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
              Direct Costs: {formatAmount(totalExpenseUSD)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time visualization of operating expenditures across hotels, car & boat rentals, diesel fuel depot allocations, and government permit stamps.
          </p>
        </div>

        {/* View Switcher & Currency Toggle */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Chart View Selector */}
          <div className="p-1 bg-slate-100 rounded-full border border-slate-200 flex items-center text-xs font-semibold">
            <button
              onClick={() => setChartView('distribution')}
              className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                chartView === 'distribution'
                  ? 'bg-white text-slate-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5 text-violet-600" />
              <span>Category Share</span>
            </button>

            <button
              onClick={() => setChartView('comparison')}
              className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                chartView === 'comparison'
                  ? 'bg-white text-slate-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Income vs Expense</span>
            </button>

            <button
              onClick={() => setChartView('timeline')}
              className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 cursor-pointer ${
                chartView === 'timeline'
                  ? 'bg-white text-slate-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cashflow Trend</span>
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="p-1 bg-amber-50/70 border border-amber-200 rounded-full flex items-center text-xs font-mono font-bold">
            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                currencyMode === 'USD' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-amber-900 hover:text-amber-950'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrencyMode('ERN')}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                currencyMode === 'ERN' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-amber-900 hover:text-amber-950'
              }`}
            >
              ERN (ናቕፋ)
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Highest Expense Stream */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
            Top Cost Center
          </span>
          <div className="text-lg font-bold text-slate-900 font-heading mt-1 truncate">
            {categoryPieData[0]?.name || 'N/A'}
          </div>
          <div className="text-xs font-mono font-bold text-rose-700 mt-0.5">
            {formatAmount(categoryPieData[0]?.totalUSD || 0)} ({categoryPieData[0]?.percentage || 0}%)
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {categoryPieData[0]?.count || 0} ledger transactions
          </span>
        </div>

        {/* Combined Fleet Rentals (Car + Boat) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
            Vehicle & Boat Rentals
          </span>
          <div className="text-lg font-bold text-slate-900 font-heading mt-1">
            {formatAmount(vehicleRentalUSD + boatCharterUSD)}
          </div>
          <div className="text-xs font-mono text-amber-700 font-semibold mt-0.5">
            Cars: ${vehicleRentalUSD} · Boats: ${boatCharterUSD}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Third-party charter leases
          </span>
        </div>

        {/* Hotel Lodging Total */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
            Hotels & Accommodations
          </span>
          <div className="text-lg font-bold text-slate-900 font-heading mt-1">
            {formatAmount(hotelLodgingUSD)}
          </div>
          <div className="text-xs font-mono text-violet-700 font-semibold mt-0.5">
            {Math.round((hotelLodgingUSD / (totalExpenseUSD || 1)) * 100)}% of total expenses
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Asmara Palace, Grand Dahlak & Senafe
          </span>
        </div>

        {/* Receipt Verification Rate */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Receipt Audit Coverage
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-emerald-950 font-heading mt-1">
            {verificationCoveragePercent}% Verified
          </div>
          <div className="text-xs font-mono text-emerald-700 font-semibold mt-0.5">
            {verifiedReceiptsCount} receipts audited
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Matched with fiscal vouchers
          </span>
        </div>
      </div>

      {/* Main Chart Section Depending on View */}
      {chartView === 'distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donut Pie Chart Card */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-violet-600" />
                  <span>Expense Distribution by Category</span>
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  Total: {formatAmount(totalExpenseUSD)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Click any slice or category in the legend to filter the ledger table below.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    onClick={(data) => {
                      if (onSelectCategory) {
                        onSelectCategory(data.name as FinancialCategory);
                      }
                    }}
                    cursor="pointer"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={selectedCategory === entry.name ? '#17242E' : '#ffffff'}
                        strokeWidth={selectedCategory === entry.name ? 3 : 1.5}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [
                      currencyMode === 'ERN'
                        ? `${Number(val).toLocaleString()} ERN ($${Math.round(Number(val) / exchangeRate).toLocaleString()} USD)`
                        : `$${Number(val).toLocaleString()} USD (${(Number(val) * exchangeRate).toLocaleString()} ERN)`,
                      'Total Expense',
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #E1E8EE',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs text-slate-700 font-medium">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Quick interactive category chips */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => onSelectCategory && onSelectCategory('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Categories ({categoryPieData.length})
              </button>
              {categoryPieData.map((item) => (
                <button
                  key={item.name}
                  onClick={() => onSelectCategory && onSelectCategory(item.name as FinancialCategory)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === item.name
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                  <span className="font-mono text-[10px] opacity-75">
                    ({item.percentage}%)
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Granular Operational Streams Breakdown */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>Cost Centers & Supplier Streams</span>
                </h4>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Detailed breakdown of vendor disbursements and operations in Eritrea.
              </p>
            </div>

            <div className="space-y-3">
              {detailedStreamsData.map((stream, idx) => {
                const Icon = stream.icon;
                const percent = totalExpenseUSD > 0 ? Math.round((stream.amountUSD / totalExpenseUSD) * 100) : 0;
                return (
                  <div
                    key={stream.stream}
                    onClick={() => onSelectCategory && onSelectCategory(stream.category as FinancialCategory)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-300 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: stream.color }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-950">
                            {stream.stream}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {stream.category}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-slate-900">
                          {formatAmount(stream.amountUSD)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {percent}% share
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(4, percent)}%`,
                          backgroundColor: stream.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>All expenditures synchronized with general ledger</span>
              <span className="font-mono font-bold text-slate-900">{formatAmount(totalExpenseUSD)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Income vs Expense Comparison View */}
      {chartView === 'comparison' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Revenue vs Direct Costs by Stream</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison of inbound client payments vs operating costs across departments.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                <span className="text-slate-700 font-medium">Income (+)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-600 inline-block" />
                <span className="text-slate-700 font-medium">Expense (-)</span>
              </div>
            </div>
          </div>

          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#4E6070' }}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#4E6070' }}
                  tickFormatter={(v) => (currencyMode === 'ERN' ? `${v / 1000}k` : `$${v}`)}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    currencyMode === 'ERN'
                      ? `${Number(value).toLocaleString()} ERN`
                      : `$${Number(value).toLocaleString()} USD`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #E1E8EE',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Income" fill="#059070" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Expense" fill="#DB1F36" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick summary grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-4 border-t border-slate-100">
            {comparisonData.map((item) => (
              <div
                key={item.category}
                onClick={() => onSelectCategory && onSelectCategory(item.category as FinancialCategory)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
              >
                <span className="text-[10px] font-bold text-slate-500 block truncate uppercase">
                  {item.category}
                </span>
                <div className="text-xs font-mono font-bold text-emerald-700 mt-1">
                  +${item.rawIncomeUSD.toLocaleString()}
                </div>
                <div className="text-xs font-mono font-bold text-rose-700">
                  -${item.rawExpenseUSD.toLocaleString()}
                </div>
                <div className={`text-[10px] font-mono font-bold mt-1 ${item.netUSD >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
                  Net: {item.netUSD >= 0 ? `+$${item.netUSD.toLocaleString()}` : `-$${Math.abs(item.netUSD).toLocaleString()}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cashflow Velocity & Timeline View */}
      {chartView === 'timeline' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Cumulative Spending Velocity & Cashflow Timeline</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily expenditure accumulation vs revenue inflows over the operations period.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 bg-emerald-600 inline-block rounded-full" />
                <span className="text-slate-700 font-medium">Cumulative Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 bg-rose-500 inline-block rounded-full" />
                <span className="text-slate-700 font-medium">Cumulative Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineData}
                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059070" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059070" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DB1F36" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#DB1F36" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4E6070' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#4E6070' }}
                  tickFormatter={(v) => (currencyMode === 'ERN' ? `${v / 1000}k` : `$${v}`)}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    currencyMode === 'ERN'
                      ? `${Number(val).toLocaleString()} ERN`
                      : `$${Number(val).toLocaleString()} USD`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #E1E8EE',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeIncome"
                  name="Cumulative Revenue"
                  stroke="#059070"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeExpense"
                  name="Cumulative Expenses"
                  stroke="#DB1F36"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
