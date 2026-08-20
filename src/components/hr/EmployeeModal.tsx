import React, { useState } from 'react';
import {
  X,
  Award,
  FileText,
  Clock,
  Shield,
  Phone,
  Mail,
  Calendar,
  Languages,
  DollarSign,
  Pencil,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Employee, TourSchedule, Department, StaffRole, StaffStatus, SalaryTier } from '../../types';
import { Avatar } from '../ui/Kit';

interface EmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
  schedules: TourSchedule[];
  departments?: Department[];
  onUpdateStatus?: (employeeId: string, status: any) => void;
  onUpdateEmployee?: (emp: Employee) => void;
  onDeleteEmployee?: (empId: string) => void;
}

const STAFF_ROLES: StaffRole[] = ['Tour Guide', 'Operations Manager', 'Agent', 'HR', 'Logistics Lead', 'Admin'];
const STAFF_STATUSES: StaffStatus[] = ['Active', 'On Leave', 'On Tour', 'Probation'];
const SALARY_TIERS: SalaryTier[] = ['Tier 1 - Senior Lead', 'Tier 2 - Specialist', 'Tier 3 - Associate', 'Contractor'];

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  employee,
  onClose,
  schedules = [],
  departments = [],
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit form state -- initialized fresh each time a different employee is opened for editing.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('Agent');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState<StaffStatus>('Active');
  const [salaryTier, setSalaryTier] = useState<SalaryTier>('Tier 3 - Associate');
  const [salaryAmount, setSalaryAmount] = useState<number | ''>('');

  if (!employee) return null;

  const assignedSchedules = (schedules || []).filter(
    (s) => s && (s.leadGuideId === employee.id || (s.supportStaffIds || []).includes(employee.id))
  );

  const startEditing = () => {
    setName(employee.name);
    setEmail(employee.email);
    setPhone(employee.phone);
    setRole(employee.role);
    setDepartmentId(employee.departmentId);
    setStatus(employee.status);
    setSalaryTier(employee.salaryTier);
    setSalaryAmount(employee.salaryAmount);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!onUpdateEmployee) return;
    const dept = departments.find((d) => d.id === departmentId);
    onUpdateEmployee({
      ...employee,
      name: name.trim() || employee.name,
      email: email.trim() || employee.email,
      phone: phone.trim() || employee.phone,
      role,
      departmentId: dept?.id || employee.departmentId,
      departmentName: dept?.name || employee.departmentName,
      status,
      salaryTier,
      salaryAmount: Number(salaryAmount) || 0,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!onDeleteEmployee) return;
    onDeleteEmployee(employee.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-50 via-amber-50/40 to-slate-100 p-6 sm:p-8 border-b border-slate-200 text-slate-900">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer border border-slate-300"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <Avatar
              src={employee.avatar}
              name={employee.name}
              className="w-20 h-20 rounded-2xl ring-2 ring-amber-300 shadow-md text-xl"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-serif italic text-slate-900 font-bold">{employee.name}</h3>
                <span
                  className={`text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold ${
                    employee.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : employee.status === 'On Tour'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {employee.status}
                </span>
              </div>
              <p className="text-sm text-amber-800 font-medium font-serif font-bold">
                {employee.role} · {employee.departmentName}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Staff ID: <span className="text-slate-900 font-semibold">{employee.id}</span> · Member since {employee.hireDate}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isEditing ? (
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-amber-900 font-bold">Edit Staff Record</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StaffStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                  >
                    {STAFF_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                  >
                    {STAFF_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                  >
                    <option value="">{employee.departmentName || 'Unassigned'}</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salary Tier</label>
                  <select
                    value={salaryTier}
                    onChange={(e) => setSalaryTier(e.target.value as SalaryTier)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                  >
                    {SALARY_TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Salary (USD)</label>
                  <input
                    type="number"
                    min={0}
                    value={salaryAmount}
                    onChange={(e) => setSalaryAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-semibold">Performance</div>
                  <div className="text-xl font-serif text-slate-900 mt-1 flex items-center gap-1 font-bold">
                    ⭐ {employee.rating} <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-semibold">Expeditions</div>
                  <div className="text-xl font-serif text-slate-900 mt-1 font-bold">{employee.assignedToursCount} Tours</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-semibold">Salary Tier</div>
                  <div className="text-xs font-bold text-slate-900 mt-1 truncate">{employee.salaryTier}</div>
                  <div className="text-xs text-amber-800 font-mono font-bold mt-0.5">${employee.salaryAmount}/mo</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-semibold">Certifications</div>
                  <div className="text-xl font-serif text-slate-900 mt-1 font-bold">{(employee.documents || []).length} Verified</div>
                </div>
              </div>

              {/* Contact & Languages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">Contact Details</h4>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${employee.email}`} className="text-slate-900 hover:underline font-medium">{employee.email}</a>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-mono font-medium">{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <Languages className="w-4 h-4 text-slate-400" />
                    <span>Languages: <span className="font-medium text-slate-900">{(employee.languages || []).join(', ')}</span></span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">Emergency & Health Dossier</h4>
                  <div className="text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">{employee.emergencyContact?.name || 'N/A'} ({employee.emergencyContact?.relation || 'Contact'})</p>
                    <p className="text-slate-500 font-mono mt-0.5">Direct Line: {employee.emergencyContact?.phone || 'N/A'}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                    {(employee.specialties || []).map((spec) => (
                      <span key={spec} className="text-[10px] px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium shadow-xs">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* EritreaVisit Onboarding Data Card (if available) */}
              {employee.onboardingData && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-[#134E6F] font-bold flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-600" /> EritreaVisit Verified HR Dossier
                    </h4>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 font-mono">
                      6-Page Form Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-mono block">Nationality & ID</span>
                      <span className="font-bold text-slate-900">{employee.onboardingData.personal.nationality}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">{employee.onboardingData.personal.nationalIdNo}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-mono block">Blood Group & Health</span>
                      <span className="font-bold text-slate-900">Type: {employee.onboardingData.medical.bloodGroup}</span>
                      <span className="text-[10px] text-slate-500 block truncate">Allergies: {employee.onboardingData.medical.knownAllergies}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-mono block">Bank Account</span>
                      <span className="font-bold text-slate-900 truncate block">{employee.onboardingData.bank.bankName}</span>
                      <span className="text-[10px] text-slate-500 block font-mono truncate">{employee.onboardingData.bank.accountNumber}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-mono block">Uniform Sizing</span>
                      <span className="font-bold text-slate-900">Shirt: {employee.onboardingData.uniform.shirtSize} · Jkt: {employee.onboardingData.uniform.jacketSize}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Shoe: {employee.onboardingData.uniform.shoeSize}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
                    <span>HR Officer: <strong className="text-slate-800">{employee.onboardingData.hrUseOnly.hrOfficer}</strong></span>
                    <span>TIN: <strong className="text-slate-800 font-mono">{employee.onboardingData.taxSocialSecurity.tin}</strong></span>
                    <span>Signed: <strong className="text-slate-800 italic">{employee.onboardingData.declaration.employeeSignature}</strong> ({employee.onboardingData.declaration.date})</span>
                  </div>
                </div>
              )}

              {/* Verified Document Repository */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Staff Document Repository
                  </h4>
                  <span className="text-[10px] text-slate-500">Recorded at onboarding</span>
                </div>

                {(employee.documents || []).length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    No documents recorded for this employee.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(employee.documents || []).map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between hover:border-slate-300 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 font-serif">{doc.title}</p>
                            <p className="text-[10px] text-slate-500 font-mono">Type: {doc.type} · Recorded {doc.uploadedAt}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 italic pr-1">No file attached</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assigned Field Departures */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Active & Upcoming Tour Assignments
                </h4>

                {assignedSchedules.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    No active departures assigned for this employee.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignedSchedules.map((sch) => (
                      <div
                        key={sch.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between hover:border-slate-300 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-serif font-bold text-slate-900">{sch.tourTitle}</span>
                            <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800 border border-sky-200">
                              {sch.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Dates: {sch.startDate} to {sch.endDate} · {sch.bookedSeats}/{sch.totalSeats} Passengers
                          </p>
                        </div>
                        <span className="text-xs font-bold text-amber-800 font-mono">
                          {sch.leadGuideId === employee.id ? '★ Lead Guide' : 'Support Staff'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isEditing && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {onUpdateEmployee && (
                <button
                  onClick={startEditing}
                  className="px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              )}
              {onDeleteEmployee && !confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-2 rounded-full bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
              {confirmDelete && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="text-[11px] text-rose-800 font-semibold">Remove {employee.name}?</span>
                  <button
                    onClick={handleDelete}
                    className="px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
