import React, { useState, useMemo } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  Compass,
  Truck,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Eye,
  Edit3,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Building,
  Coins,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Plus,
  Trash2,
  Wallet,
  Clock,
  Landmark,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import {
  Employee,
  TourSchedule,
  Booking,
  Ticket,
  FinancialTransaction,
  CompensationModel,
  EmployeePayrollRecord,
  ExpeditionWorkDetail,
} from '../../types';
import { exportToCSV, printElement } from '../../utils/exportUtils';

interface PayrollManagementViewProps {
  employees: Employee[];
  schedules?: TourSchedule[];
  bookings?: Booking[];
  tickets?: Ticket[];
  canEdit?: boolean;
  onAddTransaction: (txn: FinancialTransaction) => void;
}

export const PayrollManagementView: React.FC<PayrollManagementViewProps> = ({
  employees = [],
  schedules = [],
  bookings = [],
  tickets = [],
  canEdit = true,
  onAddTransaction,
}) => {
  // Period Selection: Monthly or Weekly
  const [periodType, setPeriodType] = useState<'monthly' | 'weekly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<'2026-08' | '2026-07' | '2026-09'>('2026-08');
  const [selectedWeek, setSelectedWeek] = useState<string>('2026-W34'); // Week 34: Aug 17 - Aug 23, 2026
  
  // Currency display toggle: USD or Nakfa (ERN)
  const [currencyUnit, setCurrencyUnit] = useState<'USD' | 'ERN'>('USD');
  const exchangeRate = 15.0; // 1 USD = 15 ERN

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Expanded records for detailed line-item breakdown
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);

  // Active Payslip Modal State
  const [activePayslipRecord, setActivePayslipRecord] = useState<EmployeePayrollRecord | null>(null);

  // Edit Staff Compensation Modal State
  const [editingRecord, setEditingRecord] = useState<EmployeePayrollRecord | null>(null);

  // Custom adjustments override map: employeeId -> partial record
  const [customAdjustments, setCustomAdjustments] = useState<Record<string, Partial<EmployeePayrollRecord>>>({});

  // Disbursed records status
  const [disbursedPeriodIds, setDisbursedPeriodIds] = useState<Set<string>>(new Set());
  const [disburseSuccessMessage, setDisburseSuccessMessage] = useState<string | null>(null);

  // Date ranges based on period
  const periodInfo = useMemo(() => {
    if (periodType === 'monthly') {
      if (selectedMonth === '2026-08') {
        return {
          id: 'pay-run-2026-08',
          label: 'August 2026 (Monthly Pay Cycle)',
          startDate: '2026-08-01',
          endDate: '2026-08-31',
          standardWorkingDays: 22,
        };
      } else if (selectedMonth === '2026-07') {
        return {
          id: 'pay-run-2026-07',
          label: 'July 2026 (Monthly Pay Cycle)',
          startDate: '2026-07-01',
          endDate: '2026-07-31',
          standardWorkingDays: 23,
        };
      } else {
        return {
          id: 'pay-run-2026-09',
          label: 'September 2026 (Monthly Pay Cycle)',
          startDate: '2026-09-01',
          endDate: '2026-09-30',
          standardWorkingDays: 22,
        };
      }
    } else {
      return {
        id: `pay-run-${selectedWeek}`,
        label: `${selectedWeek === '2026-W34' ? 'Week 34 (Aug 17 – Aug 23, 2026)' : 'Week 33 (Aug 10 – Aug 16, 2026)'}`,
        startDate: selectedWeek === '2026-W34' ? '2026-08-17' : '2026-08-10',
        endDate: selectedWeek === '2026-W34' ? '2026-08-23' : '2026-08-16',
        standardWorkingDays: 6,
      };
    }
  }, [periodType, selectedMonth, selectedWeek]);

  // Determine compensation model for each staff based on role & department
  const resolveCompensationModel = (emp: Employee): CompensationModel => {
    const roleLower = (emp.role || '').toLowerCase();
    const deptLower = (emp.departmentName || '').toLowerCase();

    if (roleLower.includes('tour guide') || deptLower.includes('guide')) {
      return 'tour_guide_daily';
    }
    if (roleLower.includes('driver') || roleLower.includes('logistics') || deptLower.includes('fleet')) {
      return 'driver_daily';
    }
    if (roleLower.includes('agent') || roleLower.includes('sales') || roleLower.includes('ticketing')) {
      return 'sales_agent_hybrid';
    }
    return 'permanent_salaried';
  };

  // Compute payroll records for all employees
  const payrollRecords: EmployeePayrollRecord[] = useMemo(() => {
    return employees.map((emp) => {
      const model = resolveCompensationModel(emp);
      const standardDays = periodInfo.standardWorkingDays;
      const baseSalaryUSD = emp.salaryAmount || (model === 'permanent_salaried' ? 3200 : model === 'sales_agent_hybrid' ? 1800 : 2500);

      // Default daily working rate
      const dailyWorkingRate = Math.round((baseSalaryUSD / standardDays) * 100) / 100;
      const defaultActualWorkingDays = standardDays; // full attendance by default

      // Scan Tour Schedules for Tour Guides & Drivers
      const matchingSchedules = schedules.filter((s) => {
        const isLeadGuide = s.leadGuideId === emp.id || (s.leadGuideName && s.leadGuideName.toLowerCase().includes(emp.name.toLowerCase()));
        const isSupport = (s.supportStaffIds || []).includes(emp.id) || (s.supportStaffNames || []).some((n) => n.toLowerCase().includes(emp.name.toLowerCase()));
        return isLeadGuide || isSupport;
      });

      // Daily Tour Rates
      const dailyTourRate = model === 'tour_guide_daily' ? 45 : model === 'driver_daily' ? 35 : 40;
      const fieldPerDiem = 15; // USD/day out-of-town allowance

      // Compute total tour days from matched schedules
      let totalTourDays = 0;
      const expeditions: ExpeditionWorkDetail[] = [];

      matchingSchedules.forEach((sch) => {
        const start = new Date(sch.startDate);
        const end = new Date(sch.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
        totalTourDays += days;

        expeditions.push({
          tourScheduleId: sch.id,
          tourTitle: sch.tourTitle || 'Highland & Coastal Expedition',
          destination: sch.destination || 'Asmara - Massawa - Qohaito',
          startDate: sch.startDate,
          endDate: sch.endDate,
          days,
          roleOnTour: sch.leadGuideId === emp.id ? 'Lead Expedition Guide' : 'Support Specialist / Driver',
          dailyRateUSD: dailyTourRate,
          perDiemUSD: fieldPerDiem,
          totalEarningsUSD: days * (dailyTourRate + fieldPerDiem),
        });
      });

      // If no schedules matched but employee is Tour Guide/Driver, provide baseline expedition days based on assignedToursCount
      if (totalTourDays === 0 && (model === 'tour_guide_daily' || model === 'driver_daily')) {
        const fallbackDays = periodType === 'monthly' ? (model === 'tour_guide_daily' ? 14 : 16) : 4;
        totalTourDays = fallbackDays;
        expeditions.push({
          tourTitle: model === 'tour_guide_daily' ? 'Asmara UNESCO & Qohaito Canyon Circuit' : '4WD Southern Desert Convoy Dispatch',
          destination: 'Maekel & Debub Archeological Circuit',
          startDate: periodInfo.startDate,
          endDate: periodInfo.endDate,
          days: fallbackDays,
          roleOnTour: model === 'tour_guide_daily' ? 'Certified Tour Guide' : 'Expedition 4WD Driver',
          dailyRateUSD: dailyTourRate,
          perDiemUSD: fieldPerDiem,
          totalEarningsUSD: fallbackDays * (dailyTourRate + fieldPerDiem),
        });
      }

      // Sales Agent Commission Calculations
      const salesTicketsCount = tickets.length > 0 ? Math.min(tickets.length, 12) : 8;
      const salesTicketCommissionPerTicketUSD = 15; // $15 per flight ticket
      const salesTicketsCommissionUSD = salesTicketsCount * salesTicketCommissionPerTicketUSD;

      const salesToursRevenueUSD = 18500;
      const salesToursCommissionRatePercent = 4.0; // 4% commission on tour package sales
      const salesToursCommissionUSD = Math.round(salesToursRevenueUSD * (salesToursCommissionRatePercent / 100));
      const totalCommissionEarned = salesTicketsCommissionUSD + salesToursCommissionUSD;

      // Base Gross Calculations per model
      let workingDaysPay = 0;
      let tourDaysPay = 0;
      let fieldAllowanceTotal = 0;
      let calculatedGross = 0;

      if (model === 'permanent_salaried') {
        workingDaysPay = baseSalaryUSD;
        calculatedGross = workingDaysPay;
      } else if (model === 'tour_guide_daily' || model === 'driver_daily') {
        tourDaysPay = totalTourDays * dailyTourRate;
        fieldAllowanceTotal = totalTourDays * fieldPerDiem;
        calculatedGross = tourDaysPay + fieldAllowanceTotal;
      } else if (model === 'sales_agent_commission') {
        calculatedGross = totalCommissionEarned;
      } else if (model === 'sales_agent_hybrid') {
        workingDaysPay = 1400; // base agent retainer
        calculatedGross = workingDaysPay + totalCommissionEarned;
      } else if (model === 'sales_agent_monthly') {
        workingDaysPay = baseSalaryUSD;
        calculatedGross = workingDaysPay;
      }

      // Allowances & Bonuses
      const allowancesUSD = model === 'permanent_salaried' ? 180 : 80; // Housing & phone
      const bonusUSD = (emp.rating >= 4.9) ? 150 : 0; // Excellence bonus
      const overtimeHours = 0;
      const overtimePayUSD = 0;

      const totalGross = calculatedGross + allowancesUSD + bonusUSD;

      // Deductions: 5% Social Security Pension + 7% Income Tax
      const socialSecurityPensionUSD = Math.round(totalGross * 0.05);
      const taxDeductionUSD = Math.round(totalGross * 0.07);
      const advanceOrLoanDeductionUSD = 0;
      const otherDeductionsUSD = 0;
      const totalDeductions = socialSecurityPensionUSD + taxDeductionUSD + advanceOrLoanDeductionUSD;

      const netPayUSD = Math.max(0, totalGross - totalDeductions);
      const netPayERN = netPayUSD * exchangeRate;

      // Initial record
      const defaultRecord: EmployeePayrollRecord = {
        id: `pay-${emp.id}-${periodInfo.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeRole: emp.role,
        avatar: emp.avatar,
        departmentName: emp.departmentName,
        compensationModel: model,
        bankName: emp.onboardingData?.bank?.bankName || 'Commercial Bank of Eritrea (CBE)',
        bankAccountNumber: emp.onboardingData?.bank?.accountNumber || `ER-${Math.floor(10000000 + Math.random() * 90000000)}`,
        tinNumber: emp.onboardingData?.taxSocialSecurity?.tin || `TIN-ER-${Math.floor(100000 + Math.random() * 900000)}`,
        
        standardWorkingDays: standardDays,
        actualWorkingDays: defaultActualWorkingDays,
        baseMonthlySalaryUSD: baseSalaryUSD,
        dailyWorkingRateUSD: dailyWorkingRate,
        workingDaysPayUSD: workingDaysPay,

        tourDaysCount: totalTourDays,
        dailyTourRateUSD: dailyTourRate,
        tourDaysPayUSD: tourDaysPay,
        fieldPerDiemUSD: fieldPerDiem,
        fieldAllowanceTotalUSD: fieldAllowanceTotal,
        expeditions,

        salesToursRevenueUSD,
        salesToursCommissionRatePercent,
        salesToursCommissionUSD,
        salesTicketsCount,
        salesTicketCommissionPerTicketUSD,
        salesTicketsCommissionUSD,
        totalCommissionEarnedUSD: totalCommissionEarned,

        allowancesUSD,
        bonusUSD,
        overtimeHours,
        overtimePayUSD,
        grossPayUSD: totalGross,

        taxDeductionUSD,
        socialSecurityPensionUSD,
        advanceOrLoanDeductionUSD,
        otherDeductionsUSD,
        totalDeductionsUSD: totalDeductions,

        netPayUSD,
        netPayERN,
        disbursementMethod: 'Bank Transfer',
        disbursementStatus: disbursedPeriodIds.has(periodInfo.id) ? 'Disbursed' : 'Approved',
        notes: `Regular ${periodInfo.label}`,
      };

      // Apply any user overrides for this employee
      const overrides = customAdjustments[emp.id] || {};
      const merged: EmployeePayrollRecord = { ...defaultRecord, ...overrides };

      // Recalculate based on overrides if needed
      if (overrides.actualWorkingDays !== undefined || overrides.tourDaysCount !== undefined || overrides.bonusUSD !== undefined || overrides.allowancesUSD !== undefined || overrides.advanceOrLoanDeductionUSD !== undefined) {
        let gross = 0;
        if (merged.compensationModel === 'permanent_salaried') {
          merged.workingDaysPayUSD = Math.round(merged.dailyWorkingRateUSD * merged.actualWorkingDays);
          gross = merged.workingDaysPayUSD;
        } else if (merged.compensationModel === 'tour_guide_daily' || merged.compensationModel === 'driver_daily') {
          merged.tourDaysPayUSD = merged.tourDaysCount * merged.dailyTourRateUSD;
          merged.fieldAllowanceTotalUSD = merged.tourDaysCount * merged.fieldPerDiemUSD;
          gross = merged.tourDaysPayUSD + merged.fieldAllowanceTotalUSD;
        } else if (merged.compensationModel === 'sales_agent_hybrid') {
          gross = (merged.workingDaysPayUSD || 1400) + merged.totalCommissionEarnedUSD;
        } else {
          gross = merged.totalCommissionEarnedUSD || merged.baseMonthlySalaryUSD;
        }

        gross += (merged.allowancesUSD || 0) + (merged.bonusUSD || 0) + (merged.overtimePayUSD || 0);
        merged.grossPayUSD = gross;

        merged.socialSecurityPensionUSD = Math.round(gross * 0.05);
        merged.taxDeductionUSD = Math.round(gross * 0.07);
        merged.totalDeductionsUSD = merged.socialSecurityPensionUSD + merged.taxDeductionUSD + (merged.advanceOrLoanDeductionUSD || 0);
        merged.netPayUSD = Math.max(0, gross - merged.totalDeductionsUSD);
        merged.netPayERN = merged.netPayUSD * exchangeRate;
      }

      return merged;
    });
  }, [employees, schedules, tickets, periodInfo, customAdjustments, disbursedPeriodIds, periodType]);

  // Aggregate Payroll Summary Stats
  const totals = useMemo(() => {
    let grossUSD = 0;
    let netUSD = 0;
    let deductionsUSD = 0;
    let totalWorkingDays = 0;
    let totalTourDays = 0;
    let totalCommissionsUSD = 0;
    let permanentStaffCount = 0;
    let fieldCrewCount = 0;
    let salesAgentCount = 0;

    payrollRecords.forEach((r) => {
      grossUSD += r.grossPayUSD;
      netUSD += r.netPayUSD;
      deductionsUSD += r.totalDeductionsUSD;

      if (r.compensationModel === 'permanent_salaried') {
        totalWorkingDays += r.actualWorkingDays;
        permanentStaffCount++;
      } else if (r.compensationModel === 'tour_guide_daily' || r.compensationModel === 'driver_daily') {
        totalTourDays += r.tourDaysCount;
        fieldCrewCount++;
      } else {
        totalCommissionsUSD += r.totalCommissionEarnedUSD;
        salesAgentCount++;
      }
    });

    return {
      grossUSD,
      netUSD,
      deductionsUSD,
      netERN: netUSD * exchangeRate,
      totalWorkingDays,
      totalTourDays,
      totalCommissionsUSD,
      permanentStaffCount,
      fieldCrewCount,
      salesAgentCount,
      employeeCount: payrollRecords.length,
    };
  }, [payrollRecords]);

  // Filtered list
  const filteredRecords = useMemo(() => {
    return payrollRecords.filter((r) => {
      const matchesSearch =
        r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.employeeRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.departmentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModel =
        modelFilter === 'all' ||
        (modelFilter === 'permanent' && r.compensationModel === 'permanent_salaried') ||
        (modelFilter === 'field' && (r.compensationModel === 'tour_guide_daily' || r.compensationModel === 'driver_daily')) ||
        (modelFilter === 'sales' && (r.compensationModel === 'sales_agent_commission' || r.compensationModel === 'sales_agent_hybrid' || r.compensationModel === 'sales_agent_monthly'));

      const matchesDept = departmentFilter === 'all' || r.departmentName === departmentFilter;

      return matchesSearch && matchesModel && matchesDept;
    });
  }, [payrollRecords, searchQuery, modelFilter, departmentFilter]);

  // Handle Export CSV
  const handleExportPayrollCSV = () => {
    const headers = [
      'Period',
      'Employee ID',
      'Employee Name',
      'Role',
      'Department',
      'Compensation Model',
      'Working Days (Perm)',
      'Tour Days (Field)',
      'Daily Tour Rate ($)',
      'Sales Commission ($)',
      'Base / Days Pay ($)',
      'Field Per Diem ($)',
      'Allowances ($)',
      'Bonuses ($)',
      'Gross Pay ($)',
      'Pension 5% ($)',
      'Tax 7% ($)',
      'Total Deductions ($)',
      'Net Pay (USD)',
      'Net Pay (ERN)',
      'Bank Account',
      'Status',
    ];

    const rows = filteredRecords.map((r) => [
      periodInfo.label,
      r.employeeId,
      r.employeeName,
      r.employeeRole,
      r.departmentName,
      r.compensationModel,
      r.compensationModel === 'permanent_salaried' ? r.actualWorkingDays : '-',
      (r.compensationModel === 'tour_guide_daily' || r.compensationModel === 'driver_daily') ? r.tourDaysCount : '-',
      (r.compensationModel === 'tour_guide_daily' || r.compensationModel === 'driver_daily') ? `$${r.dailyTourRateUSD}` : '-',
      r.totalCommissionEarnedUSD ? `$${r.totalCommissionEarnedUSD}` : '$0',
      `$${r.workingDaysPayUSD || r.tourDaysPayUSD}`,
      `$${r.fieldAllowanceTotalUSD}`,
      `$${r.allowancesUSD}`,
      `$${r.bonusUSD}`,
      `$${r.grossPayUSD}`,
      `$${r.socialSecurityPensionUSD}`,
      `$${r.taxDeductionUSD}`,
      `$${r.totalDeductionsUSD}`,
      `$${r.netPayUSD}`,
      `${r.netPayERN.toLocaleString()} ERN`,
      `${r.bankName} (${r.bankAccountNumber})`,
      r.disbursementStatus,
    ]);

    exportToCSV(`EritreaVisit_Payroll_Register_${periodInfo.id}`, headers, rows);
  };

  // Handle Print Register
  const handlePrintPayrollRegister = () => {
    printElement('printable-payroll-register', `Payroll_Register_${periodInfo.id}`);
  };

  // Handle Disburse and Post to Ledger
  const handleDisbursePayroll = () => {
    if (disbursedPeriodIds.has(periodInfo.id)) {
      alert('This payroll cycle has already been posted to the General Ledger.');
      return;
    }

    // Create a master general ledger transaction entry
    const payrollTxn: FinancialTransaction = {
      id: `txn-payroll-${periodInfo.id}-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      clearingDate: new Date().toISOString().split('T')[0],
      referenceCode: `PAY-DISB-${periodInfo.id.toUpperCase()}`,
      category: 'Staff Payroll',
      subCategory: periodType === 'monthly' ? 'Monthly Staff Salary & Expedition Wages' : 'Weekly Field Crew & Staff Disbursal',
      type: 'Expense',
      description: `${periodInfo.label} — Full Staff Compensation & Tour Field Allowances (${totals.employeeCount} Staff: ${totals.permanentStaffCount} Salaried, ${totals.fieldCrewCount} Guides/Drivers, ${totals.salesAgentCount} Sales Agents)`,
      amountUSD: totals.netUSD,
      amountNFA: totals.netERN,
      currency: 'USD',
      exchangeRate: 15.0,
      payerOrPayee: 'All EritreaVisit Staff & Expedition Guides',
      payerPayeeType: 'Driver / Guide / Staff',
      paymentMethod: 'Commercial Bank of Eritrea (CBE)',
      bankAccount: 'CBE Main Operating Account #01-20944-12 (Asmara Central)',
      status: 'Completed',
      linkedEntityType: 'payroll',
      linkedEntityName: periodInfo.label,
      receiptNumber: `PAY-VOUCH-${periodInfo.id.toUpperCase()}`,
      recordedBy: 'Finance & Payroll Treasury',
      authorizedBy: 'Operations & Finance Director',
      notes: `Net payroll disbursed via CBE Direct Bank Transfer & Cash Float. Gross: $${totals.grossUSD.toLocaleString()} USD | Pension 5% + Tax: $${totals.deductionsUSD.toLocaleString()} USD | Net Paid: $${totals.netUSD.toLocaleString()} USD (${totals.netERN.toLocaleString()} ERN).`,
    };

    onAddTransaction(payrollTxn);

    // Also optionally record individual transactions or update state
    setDisbursedPeriodIds((prev) => new Set([...prev, periodInfo.id]));
    setDisburseSuccessMessage(`Payroll for ${periodInfo.label} successfully disbursed and posted as Expense in the General Ledger (Ref: ${payrollTxn.referenceCode})!`);
    setTimeout(() => setDisburseSuccessMessage(null), 6000);
  };

  // Helper to format currency
  const fmt = (amountUSD: number) => {
    if (currencyUnit === 'USD') {
      return `$${amountUSD.toLocaleString()} USD`;
    }
    return `${(amountUSD * exchangeRate).toLocaleString()} ERN`;
  };

  return (
    <div id="payroll-workspace-container" className="space-y-6 text-slate-900">
      {/* Top Banner & Payroll Period Controls */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 italic font-bold">
              Staff Payroll, Working Days & Tour Expedition Wages
            </h2>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Automated Pay Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl font-medium leading-relaxed">
            Tracks working days for permanent salaried staff, logs field tour expedition days and per-diem allowances for tour guides & 4WD drivers, and calculates commission and monthly salaries for sales agents with automatic General Ledger disbursement.
          </p>
        </div>

        {/* Right side controls: Period Toggle & Export/Disburse */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setCurrencyUnit('USD')}
              className={`px-3 py-1.5 rounded-full transition cursor-pointer ${
                currencyUnit === 'USD' ? 'bg-white text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              $ USD
            </button>
            <button
              onClick={() => setCurrencyUnit('ERN')}
              className={`px-3 py-1.5 rounded-full transition cursor-pointer ${
                currencyUnit === 'ERN' ? 'bg-white text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ERN (15:1)
            </button>
          </div>

          <button
            onClick={handleExportPayrollCSV}
            className="px-4 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Export full payroll breakdown to CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> CSV
          </button>

          <button
            onClick={handlePrintPayrollRegister}
            className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Print Official Payroll Register"
          >
            <Printer className="w-4 h-4" /> Print
          </button>

          <button
            onClick={handleDisbursePayroll}
            disabled={disbursedPeriodIds.has(periodInfo.id) || !canEdit}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0 ${
              disbursedPeriodIds.has(periodInfo.id)
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-brand-500 hover:bg-brand-600 text-slate-950 hover:shadow'
            }`}
          >
            {disbursedPeriodIds.has(periodInfo.id) ? (
              <>
                <BadgeCheck className="w-4 h-4" /> Disbursed to Ledger
              </>
            ) : (
              <>
                <Coins className="w-4 h-4" /> Approve & Disburse
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {disburseSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{disburseSuccessMessage}</span>
          </div>
          <button
            onClick={() => setDisburseSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 text-sm font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Period Selection & Frequency Switcher Bar */}
      <div className="p-4 sm:p-5 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Frequency & Cycle Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setPeriodType('monthly')}
              className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
                periodType === 'monthly' ? 'bg-white text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Payroll
            </button>
            <button
              onClick={() => setPeriodType('weekly')}
              className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
                periodType === 'weekly' ? 'bg-white text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Field Cycle
            </button>
          </div>

          {periodType === 'monthly' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Pay Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value as any)}
                className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                <option value="2026-08">August 2026 (Current)</option>
                <option value="2026-07">July 2026 (Archived)</option>
                <option value="2026-09">September 2026 (Upcoming)</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Cycle Week:</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                <option value="2026-W34">Week 34 (Aug 17 – Aug 23, 2026)</option>
                <option value="2026-W33">Week 33 (Aug 10 – Aug 16, 2026)</option>
              </select>
            </div>
          )}

          <div className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            Dates: {periodInfo.startDate} to {periodInfo.endDate} ({periodInfo.standardWorkingDays} Standard Working Days)
          </div>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff, role, guide..."
            className="w-full pl-8 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-xs"
          />
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Net Payroll */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
              Total Net Disbursable
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-950 mt-1">
            {fmt(totals.netUSD)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {totals.employeeCount} Employees total
          </span>
        </div>

        {/* Total Gross Payroll */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-600 font-bold block">
              Gross Staff Payroll
            </span>
            <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Landmark className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {fmt(totals.grossUSD)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Before taxes & pension
          </span>
        </div>

        {/* Permanent Working Days */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-blue-700 font-bold block">
              Permanent Staff Days
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-blue-950 mt-1">
            {totals.totalWorkingDays} Days
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {totals.permanentStaffCount} Salaried Employees
          </span>
        </div>

        {/* Tour Guides & Drivers Tour Days */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-800 font-bold block">
              Field Tour Days
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-amber-950 mt-1">
            {totals.totalTourDays} Expedition Days
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {totals.fieldCrewCount} Guides & Drivers
          </span>
        </div>

        {/* Sales Commissions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-purple-700 font-bold block">
              Sales Commissions
            </span>
            <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-purple-950 mt-1">
            {fmt(totals.totalCommissionsUSD)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Tours & Flight tickets
          </span>
        </div>

        {/* Taxes & Pension Deductions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-rose-700 font-bold block">
              Deductions & Taxes
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-rose-950 mt-1">
            -{fmt(totals.deductionsUSD)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            5% Pension + 7% Income Tax
          </span>
        </div>
      </div>

      {/* Compensation Model Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModelFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              modelFilter === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Staff ({payrollRecords.length})
          </button>
          <button
            onClick={() => setModelFilter('permanent')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              modelFilter === 'permanent'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Briefcase className="w-3 h-3" /> Permanent Salaried ({totals.permanentStaffCount})
          </button>
          <button
            onClick={() => setModelFilter('field')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              modelFilter === 'field'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Compass className="w-3 h-3" /> Tour Guides & Drivers ({totals.fieldCrewCount})
          </button>
          <button
            onClick={() => setModelFilter('sales')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              modelFilter === 'sales'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Percent className="w-3 h-3" /> Sales & Ticketing Agents ({totals.salesAgentCount})
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredRecords.length} of {payrollRecords.length} records
        </div>
      </div>

      {/* Main Payroll Table */}
      <div id="printable-payroll-register" className="bg-white rounded-[2rem] border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-mono uppercase text-[10px]">
                <th className="py-3.5 px-4 font-bold">Staff Member</th>
                <th className="py-3.5 px-4 font-bold">Pay Structure</th>
                <th className="py-3.5 px-4 font-bold text-center">Working / Tour Days</th>
                <th className="py-3.5 px-4 font-bold text-right">Daily / Base Rate</th>
                <th className="py-3.5 px-4 font-bold text-right">Earned Pay</th>
                <th className="py-3.5 px-4 font-bold text-right">Allowances & Bonus</th>
                <th className="py-3.5 px-4 font-bold text-right">Deductions</th>
                <th className="py-3.5 px-4 font-bold text-right">Net Payable</th>
                <th className="py-3.5 px-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => {
                const isExpanded = expandedEmployeeId === r.employeeId;
                const isTourCrew = r.compensationModel === 'tour_guide_daily' || r.compensationModel === 'driver_daily';
                const isPermanent = r.compensationModel === 'permanent_salaried';
                const isSales = r.compensationModel === 'sales_agent_hybrid' || r.compensationModel === 'sales_agent_commission' || r.compensationModel === 'sales_agent_monthly';

                return (
                  <React.Fragment key={r.employeeId}>
                    <tr className={`hover:bg-slate-50/70 transition ${isExpanded ? 'bg-amber-50/30' : ''}`}>
                      {/* Staff Member Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={r.avatar?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={r.employeeName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{r.employeeName}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {r.employeeRole} · <span className="font-mono text-slate-400">{r.departmentName}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Pay Structure Badge */}
                      <td className="py-3 px-4">
                        {isPermanent && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-900 border border-blue-200 inline-flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-blue-600" /> Permanent (Working Days)
                          </span>
                        )}
                        {r.compensationModel === 'tour_guide_daily' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 inline-flex items-center gap-1">
                            <Compass className="w-3 h-3 text-amber-600" /> Tour Guide (Per Tour Day)
                          </span>
                        )}
                        {r.compensationModel === 'driver_daily' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-900 border border-orange-200 inline-flex items-center gap-1">
                            <Truck className="w-3 h-3 text-orange-600" /> Driver (Per Tour Day)
                          </span>
                        )}
                        {isSales && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-900 border border-purple-200 inline-flex items-center gap-1">
                            <Percent className="w-3 h-3 text-purple-600" /> Sales Agent (Commission/Base)
                          </span>
                        )}
                      </td>

                      {/* Working / Tour Days tracking */}
                      <td className="py-3 px-4 text-center font-mono">
                        {isPermanent && (
                          <div>
                            <span className="font-bold text-slate-900">{r.actualWorkingDays}</span>
                            <span className="text-slate-400 text-[10px]"> / {r.standardWorkingDays} days</span>
                          </div>
                        )}
                        {isTourCrew && (
                          <div>
                            <span className="font-bold text-amber-950 bg-amber-100/80 px-2 py-0.5 rounded-full text-xs">
                              {r.tourDaysCount} Days on Tour
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
                              {r.expeditions.length} expedition{r.expeditions.length === 1 ? '' : 's'}
                            </span>
                          </div>
                        )}
                        {isSales && (
                          <div>
                            <span className="font-bold text-purple-950 bg-purple-50 px-2 py-0.5 rounded-full text-xs">
                              {r.salesTicketsCount} Tkts · 4% Tours
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Daily Rate or Base Rate */}
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {isPermanent && (
                          <div>
                            <span className="font-bold">${r.dailyWorkingRateUSD}/day</span>
                            <span className="text-[10px] text-slate-400 block">(${r.baseMonthlySalaryUSD}/mo)</span>
                          </div>
                        )}
                        {isTourCrew && (
                          <div>
                            <span className="font-bold text-amber-900">${r.dailyTourRateUSD}/day</span>
                            <span className="text-[10px] text-slate-400 block">+${r.fieldPerDiemUSD}/day per-diem</span>
                          </div>
                        )}
                        {isSales && (
                          <div>
                            <span className="font-bold text-purple-900">$1,400 Base</span>
                            <span className="text-[10px] text-slate-400 block">+$15/tkt commission</span>
                          </div>
                        )}
                      </td>

                      {/* Earned Pay */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                        {isPermanent && `$${r.workingDaysPayUSD.toLocaleString()}`}
                        {isTourCrew && `$${(r.tourDaysPayUSD + r.fieldAllowanceTotalUSD).toLocaleString()}`}
                        {isSales && `$${(r.workingDaysPayUSD + r.totalCommissionEarnedUSD).toLocaleString()}`}
                      </td>

                      {/* Allowances & Bonus */}
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">
                        +${(r.allowancesUSD + r.bonusUSD).toLocaleString()}
                        {r.bonusUSD > 0 && (
                          <span className="text-[9px] text-emerald-600 block">Rating bonus</span>
                        )}
                      </td>

                      {/* Deductions */}
                      <td className="py-3 px-4 text-right font-mono text-rose-700">
                        -${r.totalDeductionsUSD.toLocaleString()}
                        <span className="text-[9px] text-slate-400 block">5% Pen + 7% Tax</span>
                      </td>

                      {/* Net Payable */}
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <div className="text-sm text-emerald-950">
                          {fmt(r.netPayUSD)}
                        </div>
                        {currencyUnit === 'USD' && (
                          <div className="text-[10px] text-emerald-700 font-medium">
                            {r.netPayERN.toLocaleString()} ERN
                          </div>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setExpandedEmployeeId(isExpanded ? null : r.employeeId)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Expand calculation details"
                          >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          <button
                            onClick={() => setActivePayslipRecord(r)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                            title="View / Print Official Payslip"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Slip</span>
                          </button>

                          {canEdit && (
                            <button
                              onClick={() => setEditingRecord(r)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 transition cursor-pointer"
                              title="Adjust working days, tour days, or bonuses"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-slate-200">
                        <td colSpan={9} className="p-4 sm:p-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            {/* Panel 1: Compensation Formula Breakdown */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                                <Coins className="w-4 h-4 text-amber-600" /> Compensation Formula
                              </h4>
                              {isPermanent && (
                                <div className="space-y-1 text-slate-600">
                                  <div className="flex justify-between">
                                    <span>Base Monthly Salary:</span>
                                    <span className="font-mono font-bold text-slate-900">${r.baseMonthlySalaryUSD} USD</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Standard Cycle Days:</span>
                                    <span className="font-mono">{r.standardWorkingDays} days</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Daily Working Rate:</span>
                                    <span className="font-mono">${r.dailyWorkingRateUSD} USD/day</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                                    <span>Working Days Pay ({r.actualWorkingDays} days):</span>
                                    <span className="font-mono text-emerald-700">${r.workingDaysPayUSD} USD</span>
                                  </div>
                                </div>
                              )}

                              {isTourCrew && (
                                <div className="space-y-1 text-slate-600">
                                  <div className="flex justify-between">
                                    <span>Days on Field Tour:</span>
                                    <span className="font-mono font-bold text-amber-900">{r.tourDaysCount} days</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Daily Tour Rate:</span>
                                    <span className="font-mono">${r.dailyTourRateUSD} USD/day</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Tour Days Wages:</span>
                                    <span className="font-mono font-bold">${r.tourDaysPayUSD} USD</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Out-of-Town Per Diem (${r.fieldPerDiemUSD}/day):</span>
                                    <span className="font-mono text-emerald-700">+${r.fieldAllowanceTotalUSD} USD</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                                    <span>Total Field Compensation:</span>
                                    <span className="font-mono text-emerald-800">${r.tourDaysPayUSD + r.fieldAllowanceTotalUSD} USD</span>
                                  </div>
                                </div>
                              )}

                              {isSales && (
                                <div className="space-y-1 text-slate-600">
                                  <div className="flex justify-between">
                                    <span>Monthly Base Retainer:</span>
                                    <span className="font-mono">${r.workingDaysPayUSD} USD</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Flight Tickets Sold ({r.salesTicketsCount} × ${r.salesTicketCommissionPerTicketUSD}):</span>
                                    <span className="font-mono">+${r.salesTicketsCommissionUSD} USD</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Tour Packages Sold (${r.salesToursRevenueUSD} @ {r.salesToursCommissionRatePercent}%):</span>
                                    <span className="font-mono">+${r.salesToursCommissionUSD} USD</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                                    <span>Total Commission & Base:</span>
                                    <span className="font-mono text-purple-900">${r.workingDaysPayUSD + r.totalCommissionEarnedUSD} USD</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Panel 2: Expeditions / Tours Detail */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                                <Compass className="w-4 h-4 text-emerald-600" /> Logged Field Tours & Schedules
                              </h4>
                              {r.expeditions.length === 0 ? (
                                <p className="text-slate-400 italic">No field expeditions logged in this pay cycle (Office/HQ Base).</p>
                              ) : (
                                <div className="space-y-2">
                                  {r.expeditions.map((exp, idx) => (
                                    <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                                      <div className="flex justify-between items-start font-semibold text-slate-900">
                                        <span className="truncate pr-2">{exp.tourTitle}</span>
                                        <span className="font-mono font-bold text-amber-900">{exp.days} Days</span>
                                      </div>
                                      <div className="flex justify-between text-[11px] text-slate-500">
                                        <span>{exp.destination}</span>
                                        <span>${exp.dailyRateUSD}/day + ${exp.perDiemUSD} per-diem</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Panel 3: Deductions, Bank & Net */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                                <Landmark className="w-4 h-4 text-blue-600" /> Deductions & Bank Settlement
                              </h4>
                              <div className="space-y-1 text-slate-600">
                                <div className="flex justify-between">
                                  <span>Social Security Pension (5%):</span>
                                  <span className="font-mono text-rose-700">-${r.socialSecurityPensionUSD} USD</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Income Tax Withholding (7%):</span>
                                  <span className="font-mono text-rose-700">-${r.taxDeductionUSD} USD</span>
                                </div>
                                {r.advanceOrLoanDeductionUSD > 0 && (
                                  <div className="flex justify-between">
                                    <span>Cash Advance / Loan Repayment:</span>
                                    <span className="font-mono text-rose-700">-${r.advanceOrLoanDeductionUSD} USD</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                                  <span>Net Bank Payout:</span>
                                  <span className="font-mono text-emerald-800">${r.netPayUSD} USD ({r.netPayERN.toLocaleString()} ERN)</span>
                                </div>
                                <div className="text-[11px] text-slate-500 pt-1 font-mono">
                                  Bank: {r.bankName} | Acc: {r.bankAccountNumber}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Payslip Modal */}
      {activePayslipRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in duration-200">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif italic font-bold text-slate-900 text-base">
                  Official Staff Payslip & Compensation Certificate
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printElement(`payslip-${activePayslipRecord.employeeId}`, `Payslip_${activePayslipRecord.employeeName}_${periodInfo.id}`)}
                  className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Payslip
                </button>
                <button
                  onClick={() => setActivePayslipRecord(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div id={`payslip-${activePayslipRecord.employeeId}`} className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white">
              {/* Company Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-bold font-serif italic text-slate-950">
                    EritreaVisit Tours & Travel
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    BDHO Avenue, Central Business District, Asmara, Eritrea
                  </p>
                  <p className="text-xs text-slate-500">
                    License No: ER-TOUR-0914 · TIN: 100-294-881 · info@eritreavisit.er
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-900 font-mono font-bold text-xs">
                    PAYSLIP VOUCHER
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-800 mt-2">
                    Ref: {activePayslipRecord.id}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Pay Period: {periodInfo.label}
                  </div>
                </div>
              </div>

              {/* Employee & Bank Details Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Employee Name</span>
                  <span className="text-sm font-bold text-slate-900">{activePayslipRecord.employeeName}</span>
                  <div className="text-slate-600 mt-0.5">Role: {activePayslipRecord.employeeRole}</div>
                  <div className="text-slate-500">Department: {activePayslipRecord.departmentName}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Payment Destination</span>
                  <span className="font-bold text-slate-900">{activePayslipRecord.bankName}</span>
                  <div className="font-mono text-slate-600 mt-0.5">Acc: {activePayslipRecord.bankAccountNumber}</div>
                  <div className="font-mono text-slate-500">Tax TIN: {activePayslipRecord.tinNumber}</div>
                </div>
              </div>

              {/* Working Days & Tour Breakdown Summary */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span className="font-semibold text-amber-950">Logged Attendance & Tour Expeditions:</span>
                </div>
                <div className="font-mono font-bold text-amber-950">
                  {activePayslipRecord.compensationModel === 'permanent_salaried' && (
                    <span>{activePayslipRecord.actualWorkingDays} Working Days logged @ ${activePayslipRecord.dailyWorkingRateUSD}/day</span>
                  )}
                  {(activePayslipRecord.compensationModel === 'tour_guide_daily' || activePayslipRecord.compensationModel === 'driver_daily') && (
                    <span>{activePayslipRecord.tourDaysCount} Days on Tour @ ${activePayslipRecord.dailyTourRateUSD}/day + ${activePayslipRecord.fieldPerDiemUSD}/day per-diem</span>
                  )}
                  {activePayslipRecord.compensationModel.includes('sales') && (
                    <span>{activePayslipRecord.salesTicketsCount} Tickets Sold + ${activePayslipRecord.salesToursRevenueUSD} Tour Sales Commission</span>
                  )}
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                {/* Earnings Schedule */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 pb-1">
                    Earnings & Allowances
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Base / Working / Tour Days Pay:</span>
                      <span className="font-mono font-semibold">${activePayslipRecord.workingDaysPayUSD || activePayslipRecord.tourDaysPayUSD} USD</span>
                    </div>
                    {activePayslipRecord.fieldAllowanceTotalUSD > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Out-of-Town Field Per Diem:</span>
                        <span className="font-mono font-semibold">${activePayslipRecord.fieldAllowanceTotalUSD} USD</span>
                      </div>
                    )}
                    {activePayslipRecord.totalCommissionEarnedUSD > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Sales & Ticketing Commission:</span>
                        <span className="font-mono font-semibold">${activePayslipRecord.totalCommissionEarnedUSD} USD</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Housing & Transport Allowance:</span>
                      <span className="font-mono font-semibold">${activePayslipRecord.allowancesUSD} USD</span>
                    </div>
                    {activePayslipRecord.bonusUSD > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Excellence Rating Bonus:</span>
                        <span className="font-mono font-semibold text-emerald-700">+${activePayslipRecord.bonusUSD} USD</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-950 pt-2 border-t border-slate-200">
                      <span>Total Gross Pay:</span>
                      <span className="font-mono">${activePayslipRecord.grossPayUSD.toLocaleString()} USD</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Schedule */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200 pb-1">
                    Tax & Statutory Deductions
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Social Security Pension (5%):</span>
                      <span className="font-mono font-semibold text-rose-700">-${activePayslipRecord.socialSecurityPensionUSD} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">State Income Tax (7%):</span>
                      <span className="font-mono font-semibold text-rose-700">-${activePayslipRecord.taxDeductionUSD} USD</span>
                    </div>
                    {activePayslipRecord.advanceOrLoanDeductionUSD > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Advance / Loan Recovery:</span>
                        <span className="font-mono font-semibold text-rose-700">-${activePayslipRecord.advanceOrLoanDeductionUSD} USD</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-950 pt-2 border-t border-slate-200">
                      <span>Total Deductions:</span>
                      <span className="font-mono text-rose-800">-${activePayslipRecord.totalDeductionsUSD.toLocaleString()} USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase font-bold text-emerald-800 font-mono block">
                    Total Net Salary Payable
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Disbursement Method: {activePayslipRecord.disbursementMethod}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-emerald-950">
                    ${activePayslipRecord.netPayUSD.toLocaleString()} USD
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-800">
                    {activePayslipRecord.netPayERN.toLocaleString()} ERN (Nakfa @ 15:1)
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-xs text-slate-600">
                <div>
                  <div className="border-b border-slate-400 pb-8 mb-1">
                    <span className="font-serif italic font-bold text-slate-800">Mebrahtu Kifleyesus</span>
                  </div>
                  <div className="font-bold text-slate-800">Prepared by: Finance & Payroll Lead</div>
                  <div className="text-[10px] text-slate-400">EritreaVisit Operations Dept.</div>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-8 mb-1">
                    <span className="font-serif italic font-bold text-slate-800">{activePayslipRecord.employeeName}</span>
                  </div>
                  <div className="font-bold text-slate-800">Employee Acknowledgment Signature</div>
                  <div className="text-[10px] text-slate-400">Date: {new Date().toISOString().split('T')[0]}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Compensation Parameters Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden my-8 animate-in fade-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-serif italic font-bold text-slate-900 text-base">
                  Adjust Compensation & Days for {editingRecord.employeeName}
                </h3>
                <p className="text-xs text-slate-500">{editingRecord.employeeRole} · {periodInfo.label}</p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEditingRecord(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              {/* Compensation Model Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Compensation Structure</label>
                <select
                  value={editingRecord.compensationModel}
                  onChange={(e) => {
                    const newModel = e.target.value as CompensationModel;
                    setCustomAdjustments((prev) => ({
                      ...prev,
                      [editingRecord.employeeId]: {
                        ...(prev[editingRecord.employeeId] || {}),
                        compensationModel: newModel,
                      },
                    }));
                    setEditingRecord((prev) => prev ? { ...prev, compensationModel: newModel } : null);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
                >
                  <option value="permanent_salaried">Permanent Salaried (Working Days Based)</option>
                  <option value="tour_guide_daily">Tour Guide (Daily Rate per Tour Day + Per Diem)</option>
                  <option value="driver_daily">Expedition Driver (Daily Rate per Tour Day + Per Diem)</option>
                  <option value="sales_agent_hybrid">Sales Agent (Base Salary + Sales Commission)</option>
                  <option value="sales_agent_commission">Sales Agent (Commission Only)</option>
                  <option value="sales_agent_monthly">Sales Agent (Fixed Monthly Salary)</option>
                </select>
              </div>

              {/* Permanent Working Days input */}
              {editingRecord.compensationModel === 'permanent_salaried' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Standard Days</label>
                    <input
                      type="number"
                      value={editingRecord.standardWorkingDays}
                      disabled
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 font-mono text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Actual Days Worked</label>
                    <input
                      type="number"
                      min="0"
                      max="31"
                      value={editingRecord.actualWorkingDays}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCustomAdjustments((prev) => ({
                          ...prev,
                          [editingRecord.employeeId]: {
                            ...(prev[editingRecord.employeeId] || {}),
                            actualWorkingDays: val,
                          },
                        }));
                        setEditingRecord((prev) => prev ? { ...prev, actualWorkingDays: val } : null);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Tour Guides & Drivers Tour Days */}
              {(editingRecord.compensationModel === 'tour_guide_daily' || editingRecord.compensationModel === 'driver_daily') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Days on Tour / Expedition</label>
                    <input
                      type="number"
                      min="0"
                      max="31"
                      value={editingRecord.tourDaysCount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCustomAdjustments((prev) => ({
                          ...prev,
                          [editingRecord.employeeId]: {
                            ...(prev[editingRecord.employeeId] || {}),
                            tourDaysCount: val,
                          },
                        }));
                        setEditingRecord((prev) => prev ? { ...prev, tourDaysCount: val } : null);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Daily Tour Rate (USD)</label>
                    <input
                      type="number"
                      min="1"
                      value={editingRecord.dailyTourRateUSD}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCustomAdjustments((prev) => ({
                          ...prev,
                          [editingRecord.employeeId]: {
                            ...(prev[editingRecord.employeeId] || {}),
                            dailyTourRateUSD: val,
                          },
                        }));
                        setEditingRecord((prev) => prev ? { ...prev, dailyTourRateUSD: val } : null);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Allowances & Bonuses */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Allowances ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingRecord.allowancesUSD}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCustomAdjustments((prev) => ({
                        ...prev,
                        [editingRecord.employeeId]: {
                          ...(prev[editingRecord.employeeId] || {}),
                          allowancesUSD: val,
                        },
                      }));
                      setEditingRecord((prev) => prev ? { ...prev, allowancesUSD: val } : null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Performance Bonus ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingRecord.bonusUSD}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCustomAdjustments((prev) => ({
                        ...prev,
                        [editingRecord.employeeId]: {
                          ...(prev[editingRecord.employeeId] || {}),
                          bonusUSD: val,
                        },
                      }));
                      setEditingRecord((prev) => prev ? { ...prev, bonusUSD: val } : null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Loan Advance Deduction */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Loan / Advance Deduction ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  value={editingRecord.advanceOrLoanDeductionUSD || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCustomAdjustments((prev) => ({
                      ...prev,
                      [editingRecord.employeeId]: {
                        ...(prev[editingRecord.employeeId] || {}),
                        advanceOrLoanDeductionUSD: val,
                      },
                    }));
                    setEditingRecord((prev) => prev ? { ...prev, advanceOrLoanDeductionUSD: val } : null);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-slate-900 text-white font-bold cursor-pointer"
                >
                  Apply & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
