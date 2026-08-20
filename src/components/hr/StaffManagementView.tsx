import React, { useState } from 'react';
import {
  Users2,
  UserPlus,
  Shield,
  Search,
  Award,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { Department, Employee, StaffStatus, TourSchedule } from '../../types';
import { Avatar } from '../ui/Kit';
import { EmployeeModal } from './EmployeeModal';
import { AddEmployeeModal } from './AddEmployeeModal';
import { exportToCSV } from '../../utils/exportUtils';

interface StaffManagementViewProps {
  employees: Employee[];
  departments?: Department[];
  schedules?: TourSchedule[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee?: (emp: Employee) => void;
  onDeleteEmployee?: (empId: string) => void;
  onUpdateEmployeeStatus?: (empId: string, status: StaffStatus) => void;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  employees = [],
  departments = [],
  schedules = [],
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onUpdateEmployeeStatus,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  // Holds the id, not a snapshot of the record -- so an edit made while the
  // dossier is open shows up immediately instead of the modal displaying
  // whatever the employee looked like at the moment it was opened.
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const activeEmployee = (employees || []).find((e) => e.id === activeEmployeeId) || null;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const deptList = departments ?? [];

  const filteredEmployees = (employees || []).filter((emp) => {
    const matchesRole = selectedRole === 'all' || emp.role === selectedRole;
    const matchesDept = selectedDept === 'all' || emp.departmentId === selectedDept;
    const matchesSearch =
      (emp.name || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (emp.languages || []).some((l) => l.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (emp.specialties || []).some((s) => s.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesRole && matchesDept && matchesSearch;
  });

  const totalPayroll = (employees || []).reduce((acc, e) => acc + (e.salaryAmount || 0), 0);

  const handleExportStaffCSV = () => {
    const headers = [
      'Staff ID',
      'Full Name',
      'Role',
      'Department',
      'Status',
      'Email',
      'Phone',
      'Base Location',
      'Hire Date',
      'Salary (USD)',
      'Salary Tier',
      'Languages',
      'Specialties / Certifications',
    ];

    const rows = filteredEmployees.map((emp) => [
      emp.id || '',
      emp.name || '',
      emp.role || '',
      emp.departmentName || '',
      emp.status || '',
      emp.email || '',
      emp.phone || '',
      emp.departmentName || '',
      emp.hireDate || '',
      emp.salaryAmount ?? 0,
      emp.salaryTier || '',
      (emp.languages || []).join('; '),
      (emp.specialties || []).join('; '),
    ]);

    exportToCSV(
      `EritreaVisit_Staff_Roster_${new Date().toISOString().split('T')[0]}`,
      headers,
      rows
    );
  };

  return (
    <div id="staff-management-container" className="space-y-6 pb-12 text-slate-800">
      {/* Top Banner with Stats */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 italic font-bold">
              HR & Staff Operations Roster
            </h2>
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold">
              {employees.length} Personnel
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Certified alpine tour guides, consular immigration liaisons, and field logistics fleet leaders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:block text-right pr-4 border-r border-slate-200">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono font-semibold">
              Monthly Payroll
            </span>
            <p className="text-base font-bold text-slate-900 font-mono">
              ${totalPayroll.toLocaleString()} USD
            </p>
          </div>
          <button
            onClick={handleExportStaffCSV}
            className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Export staff roster to CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-brand-500 hover:bg-brand-600 text-slate-950 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Onboard Employee
          </button>
        </div>
      </div>

      {/* Department Hierarchy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {deptList.map((dept) => {
          const count = (employees || []).filter((e) => e.departmentId === dept.id).length;
          const isSelected = selectedDept === dept.id;

          return (
            <div
              key={dept.id}
              onClick={() => setSelectedDept(isSelected ? 'all' : dept.id)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">
                  {dept.code}
                </span>
                <span className="text-xs font-mono text-slate-600 font-semibold">{count} Staff</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1 font-serif">
                {dept.name}
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 truncate">Lead: {dept.leadName}</p>
              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                Budget: ${(dept.budget / 1000).toFixed(0)}k/yr
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 sm:p-5 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Role Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Tour Guide', 'Operations Manager', 'Agent', 'HR', 'Logistics Lead', 'Admin'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                selectedRole === role
                  ? 'bg-amber-100 border border-amber-300 text-amber-900 font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {role === 'all' ? 'All Roles' : role}
            </button>
          ))}
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by name, language..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500 focus:bg-white"
            />
          </div>
          <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Table Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="p-5 rounded-[2rem] bg-white border border-slate-200 shadow-xs hover:border-amber-400 transition group flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={emp.avatar}
                      name={emp.name}
                      className="w-12 h-12 rounded-2xl ring-1 ring-slate-200 shrink-0 text-xs"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition font-serif">
                        {emp.name}
                      </h4>
                      <p className="text-xs text-slate-500">{emp.role}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                      emp.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : emp.status === 'On Tour'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                {/* Info Rows */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-medium text-slate-900 truncate max-w-[170px]">
                      {emp.departmentName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Salary Tier:</span>
                    <span className="font-mono text-slate-700 font-medium">
                      {emp.salaryTier.split(' - ')[0]} (${emp.salaryAmount})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Expeditions Lead:</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {emp.assignedToursCount} Tours
                    </span>
                  </div>
                </div>

                {/* Tags / Specialties */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1">
                  {(emp.languages || []).slice(0, 3).map((l) => (
                    <span
                      key={l}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                    >
                      {l}
                    </span>
                  ))}
                  {(emp.specialties || []).slice(0, 1).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-amber-800 font-bold flex items-center gap-1">
                  ⭐ {emp.rating}
                </span>
                <button
                  onClick={() => setActiveEmployeeId(emp.id)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-brand-500 hover:text-slate-950 text-slate-800 text-xs font-semibold transition flex items-center gap-1 cursor-pointer border border-slate-200"
                >
                  View Dossier <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                <tr>
                  <th className="py-4 px-5">Staff Member</th>
                  <th className="py-4 px-5">Role & Dept</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Salary Tier</th>
                  <th className="py-4 px-5">Rating</th>
                  <th className="py-4 px-5">Documents</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={emp.avatar}
                          name={emp.name}
                          className="w-9 h-9 rounded-xl ring-1 ring-slate-200 text-[10px]"
                        />
                        <div>
                          <div className="font-serif font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{emp.role}</div>
                      <div className="text-[11px] text-slate-500">{emp.departmentName}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : emp.status === 'On Tour'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-700 font-medium">
                      {emp.salaryTier.split(' - ')[0]} (${emp.salaryAmount})
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-amber-800">
                      ⭐ {emp.rating}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px]">
                        <Award className="w-3 h-3 text-amber-700" /> {(emp.documents || []).length} Files
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setActiveEmployeeId(emp.id)}
                        className="px-3 py-1 rounded-full bg-slate-100 hover:bg-brand-500 hover:text-slate-950 font-medium text-slate-800 transition cursor-pointer border border-slate-200 shadow-xs"
                      >
                        Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {activeEmployee && (
        <EmployeeModal
          employee={activeEmployee}
          onClose={() => setActiveEmployeeId(null)}
          schedules={schedules}
          departments={deptList}
          onUpdateStatus={onUpdateEmployeeStatus}
          onUpdateEmployee={onUpdateEmployee}
          onDeleteEmployee={onDeleteEmployee}
        />
      )}

      {isAddModalOpen && (
        <AddEmployeeModal
          departments={deptList}
          onClose={() => setIsAddModalOpen(false)}
          onAddEmployee={onAddEmployee}
        />
      )}
    </div>
  );
};
