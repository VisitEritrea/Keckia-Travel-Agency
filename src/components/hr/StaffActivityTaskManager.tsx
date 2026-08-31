import React, { useState, useMemo } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users2,
  Calendar,
  MapPin,
  Plus,
  Filter,
  Search,
  Check,
  X,
  ChevronRight,
  Shield,
  Briefcase,
  Sparkles,
  PlaneTakeoff,
  UserCheck,
  UserX,
  Car,
  Ship,
  FileCheck,
  Building2,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { Employee, TourSchedule, StaffStatus } from '../../types';
import { Avatar } from '../ui/Kit';

export type StaffActivityState = 'on_tour' | 'available' | 'task_assigned' | 'on_leave';

export interface StaffTask {
  id: string;
  title: string;
  category: 'Tour Expedition' | 'Consular & Visa' | 'Fleet & Logistics' | 'Airport Meet & Greet' | 'Ticketing & Hospitality' | 'Finance & Admin';
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  assignedRole: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Normal';
  dueDate: string;
  location: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  notes?: string;
  createdAt: string;
}

interface StaffActivityTaskManagerProps {
  employees: Employee[];
  schedules?: TourSchedule[];
  onUpdateEmployeeStatus?: (empId: string, status: StaffStatus) => void;
  onOpenEmployeeDossier?: (empId: string) => void;
}

// Initial realistic default tasks for operational tracking
const DEFAULT_TASKS: StaffTask[] = [
  {
    id: 'task-101',
    title: 'Asmara International Airport Meet & Greet (ET312 Arrivals)',
    category: 'Airport Meet & Greet',
    assignedEmployeeId: 'emp-1',
    assignedEmployeeName: 'Yonas Haile',
    assignedRole: 'Senior Tour Guide & Cultural Interpreter',
    priority: 'Urgent',
    dueDate: 'Today, 14:30',
    location: 'Asmara Intl Airport Terminal 1',
    status: 'In Progress',
    notes: 'Meet 6 VIP German cultural travelers, provide welcome packs and escort to Asmara Palace Hotel.',
    createdAt: '2026-08-28',
  },
  {
    id: 'task-102',
    title: 'Consular Visa-on-Arrival Clearance & Immigration Submission',
    category: 'Consular & Visa',
    assignedEmployeeId: 'emp-4',
    assignedEmployeeName: 'Semhar Fisseha',
    assignedRole: 'Immigration & Consular Liaison Officer',
    priority: 'High',
    dueDate: 'Tomorrow, 09:00',
    location: 'Immigration & Nationality HQ, Asmara',
    status: 'In Progress',
    notes: 'Submit 8 approved VoA clearance dossiers and pick up travel permits for Dahlak marine expedition.',
    createdAt: '2026-08-28',
  },
  {
    id: 'task-103',
    title: 'Pre-Departure 4WD Convoy Mechanical Inspection & Fueling',
    category: 'Fleet & Logistics',
    assignedEmployeeId: 'emp-3',
    assignedEmployeeName: 'Filmon Tesfay',
    assignedRole: 'Logistics Coordinator & Senior Chauffeur',
    priority: 'High',
    dueDate: 'Today, 17:00',
    location: 'Central Fleet Garage, Asmara Depot',
    status: 'Pending',
    notes: 'Inspect Toyota Land Cruisers (ER-2-4412 & ER-2-8831) before the 5-day Qohaito expedition departure.',
    createdAt: '2026-08-28',
  },
  {
    id: 'task-104',
    title: 'Massawa Gurgusum Beach Hotel Vouchers & Scuba Gear Inspection',
    category: 'Ticketing & Hospitality',
    assignedEmployeeId: 'emp-2',
    assignedEmployeeName: 'Senait Berhane',
    assignedRole: 'Field Operations & Ticketing Manager',
    priority: 'Normal',
    dueDate: 'Aug 30, 2026',
    location: 'Massawa Port Operations Hub',
    status: 'Pending',
    notes: 'Confirm 12 dive tank rentals and luxury suite reservations for incoming Dahlak scuba group.',
    createdAt: '2026-08-28',
  },
];

export const StaffActivityTaskManager: React.FC<StaffActivityTaskManagerProps> = ({
  employees = [],
  schedules = [],
  onUpdateEmployeeStatus,
  onOpenEmployeeDossier,
}) => {
  const [tasks, setTasks] = useState<StaffTask[]>(DEFAULT_TASKS);
  const [activeTab, setActiveTab] = useState<'activity' | 'tasks'>('activity');
  const [activityFilter, setActivityFilter] = useState<'all' | 'on_tour' | 'available' | 'task_assigned' | 'on_leave'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<StaffTask['category']>('Tour Expedition');
  const [newTaskStaffId, setNewTaskStaffId] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<StaffTask['priority']>('High');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskLocation, setNewTaskLocation] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Active tour schedules
  const activeTours = useMemo(() => {
    return (schedules || []).filter(
      (s) => s.status === 'Active' || s.status === 'Upcoming'
    );
  }, [schedules]);

  // Compute live activity state for each employee
  const employeeActivityMap = useMemo(() => {
    const map = new Map<
      string,
      {
        state: StaffActivityState;
        details: string;
        tour?: TourSchedule;
        task?: StaffTask;
      }
    >();

    employees.forEach((emp) => {
      // 1. Check if employee is on leave
      if (emp.status === 'On Leave') {
        map.set(emp.id, {
          state: 'on_leave',
          details: 'Approved Annual / Medical Leave',
        });
        return;
      }

      // 2. Check if employee is assigned to an active / in-progress tour
      const assignedTour = activeTours.find(
        (t) =>
          t.leadGuideId === emp.id ||
          (t.leadGuideName && t.leadGuideName.toLowerCase() === emp.name.toLowerCase()) ||
          (t.supportStaffIds && t.supportStaffIds.includes(emp.id)) ||
          (t.supportStaffNames && t.supportStaffNames.some((name) => name.toLowerCase() === emp.name.toLowerCase()))
      );

      if (assignedTour) {
        map.set(emp.id, {
          state: 'on_tour',
          details: `On Tour: ${assignedTour.tourTitle} (${assignedTour.destination || 'Field Expedition'})`,
          tour: assignedTour,
        });
        return;
      }

      // 3. Check if employee has an in-progress or pending task
      const assignedTask = tasks.find(
        (t) => (t.assignedEmployeeId === emp.id || t.assignedEmployeeName.toLowerCase() === emp.name.toLowerCase()) && t.status !== 'Completed'
      );

      if (assignedTask) {
        map.set(emp.id, {
          state: 'task_assigned',
          details: `Active Task: ${assignedTask.title}`,
          task: assignedTask,
        });
        return;
      }

      // 4. Otherwise Available for assignment
      map.set(emp.id, {
        state: 'available',
        details: 'Available for Tour Dispatch & Field Assignment',
      });
    });

    return map;
  }, [employees, activeTours, tasks]);

  // Activity counts
  const counts = useMemo(() => {
    let onTour = 0;
    let available = 0;
    let taskAssigned = 0;
    let onLeave = 0;

    employees.forEach((emp) => {
      const act = employeeActivityMap.get(emp.id)?.state || 'available';
      if (act === 'on_tour') onTour++;
      else if (act === 'available') available++;
      else if (act === 'task_assigned') taskAssigned++;
      else if (act === 'on_leave') onLeave++;
    });

    return {
      total: employees.length,
      onTour,
      available,
      taskAssigned,
      onLeave,
    };
  }, [employees, employeeActivityMap]);

  // Filtered employees for Activity Roster
  const filteredStaff = useMemo(() => {
    return employees.filter((emp) => {
      const act = employeeActivityMap.get(emp.id);
      const state = act?.state || 'available';

      if (activityFilter !== 'all' && state !== activityFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesRole = emp.role.toLowerCase().includes(q);
        const matchesDept = (emp.departmentName || '').toLowerCase().includes(q);
        const matchesDetails = (act?.details || '').toLowerCase().includes(q);
        return matchesName || matchesRole || matchesDept || matchesDetails;
      }

      return true;
    });
  }, [employees, employeeActivityMap, activityFilter, searchQuery]);

  // Handle task status update
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus: StaffTask['status'] =
          t.status === 'Pending' ? 'In Progress' : t.status === 'In Progress' ? 'Completed' : 'Pending';
        return { ...t, status: nextStatus };
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const assignedStaff = employees.find((e) => e.id === newTaskStaffId) || employees[0];

    const newTask: StaffTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      assignedEmployeeId: assignedStaff?.id || 'emp-unassigned',
      assignedEmployeeName: assignedStaff?.name || 'Unassigned Staff',
      assignedRole: assignedStaff?.role || 'Staff Member',
      priority: newTaskPriority,
      dueDate: newTaskDueDate.trim() || 'Within 24 Hours',
      location: newTaskLocation.trim() || 'Asmara Operations HQ',
      status: 'In Progress',
      notes: newTaskNotes.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTasks([newTask, ...tasks]);
    setIsTaskModalOpen(false);

    // Reset Form
    setNewTaskTitle('');
    setNewTaskStaffId('');
    setNewTaskLocation('');
    setNewTaskDueDate('');
    setNewTaskNotes('');
  };

  const getStatusBadge = (state: StaffActivityState) => {
    switch (state) {
      case 'on_tour':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-xs animate-pulse">
            <Compass className="w-3.5 h-3.5 text-slate-950" />
            <span>On Tour in Field</span>
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Available / Ready</span>
          </span>
        );
      case 'task_assigned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span>Task Assigned</span>
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
            <UserX className="w-3.5 h-3.5 text-slate-500" />
            <span>On Leave / Rest</span>
          </span>
        );
    }
  };

  return (
    <div id="staff-activity-task-tracking" className="space-y-5 rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif italic text-slate-900">
                Staff Activity Tracking &amp; Task Management
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold">
                Live Deployment
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time monitoring of tour guides in the field, consular liaisons, driver logistics &amp; daily task dispatching
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'activity' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Activity Roster ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tasks' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Operational Tasks</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono">
                {tasks.filter((t) => t.status !== 'Completed').length} active
              </span>
            </button>
          </div>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Dispatch / Assign Task
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards: On Tour vs Available vs Tasks vs Leave */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: On Tour */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('activity');
            setActivityFilter(activityFilter === 'on_tour' ? 'all' : 'on_tour');
          }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            activityFilter === 'on_tour'
              ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">
              On Tour in Field
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{counts.onTour}</span>
            <span className="text-xs text-slate-500 font-medium">Guides &amp; Crew</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            Active expedition leaders in field
          </p>
        </button>

        {/* Metric 2: Available */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('activity');
            setActivityFilter(activityFilter === 'available' ? 'all' : 'available');
          }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            activityFilter === 'available'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30'
              : 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
              Available &amp; Ready
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">{counts.available}</span>
            <span className="text-xs text-slate-500 font-medium">Personnel Ready</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Ready for dispatch / new tours
          </p>
        </button>

        {/* Metric 3: Active Task Assigned */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('tasks');
          }}
          className="p-4 rounded-2xl border bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">
              Assigned Operations
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-700 font-mono">
              {tasks.filter((t) => t.status !== 'Completed').length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Active Tasks</span>
          </div>
          <p className="text-[11px] text-blue-700 font-medium mt-1">
            Consular, airport, fleet maintenance
          </p>
        </button>

        {/* Metric 4: On Leave */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('activity');
            setActivityFilter(activityFilter === 'on_leave' ? 'all' : 'on_leave');
          }}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            activityFilter === 'on_leave'
              ? 'bg-slate-100 border-slate-500 ring-2 ring-slate-500/30'
              : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              On Leave / Rest
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-600 font-mono">{counts.onLeave}</span>
            <span className="text-xs text-slate-500 font-medium">Off Duty</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Annual leave or rest rotation
          </p>
        </button>
      </div>

      {/* 3. View Content: Activity Board or Task Management */}
      {activeTab === 'activity' ? (
        <div className="space-y-4 pt-2">
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <button
                onClick={() => setActivityFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activityFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Staff ({counts.total})
              </button>
              <button
                onClick={() => setActivityFilter('on_tour')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activityFilter === 'on_tour'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                    : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>On Tour ({counts.onTour})</span>
              </button>
              <button
                onClick={() => setActivityFilter('available')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activityFilter === 'available'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Available ({counts.available})</span>
              </button>
              <button
                onClick={() => setActivityFilter('task_assigned')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activityFilter === 'task_assigned'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Assigned Task ({counts.taskAssigned})</span>
              </button>
              <button
                onClick={() => setActivityFilter('on_leave')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activityFilter === 'on_leave'
                    ? 'bg-slate-700 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>On Leave ({counts.onLeave})</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, role, tour..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Activity Staff Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredStaff.map((emp) => {
              const act = employeeActivityMap.get(emp.id);
              const state = act?.state || 'available';

              return (
                <div
                  key={emp.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={emp.name} src={emp.avatar} className="w-10 h-10 rounded-xl" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {emp.name}
                        </h4>
                        <p className="text-xs text-slate-500">{emp.role}</p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {emp.departmentName || 'Operations'}
                        </span>
                      </div>
                    </div>

                    {getStatusBadge(state)}
                  </div>

                  {/* Activity Details Box */}
                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed ${
                      state === 'on_tour'
                        ? 'bg-amber-50 border border-amber-200 text-amber-900'
                        : state === 'available'
                        ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-900'
                        : state === 'task_assigned'
                        ? 'bg-blue-50 border border-blue-200 text-blue-900'
                        : 'bg-slate-50 border border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-1.5">
                      {state === 'on_tour' ? (
                        <Compass className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      ) : state === 'available' ? (
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : state === 'task_assigned' ? (
                        <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">{act?.details}</p>
                        {act?.tour && (
                          <div className="mt-1 text-[11px] text-amber-800/90 font-medium flex items-center gap-2">
                            <span>📅 {act.tour.startDate} – {act.tour.endDate}</span>
                            <span>•</span>
                            <span>📍 {act.tour.destination}</span>
                          </div>
                        )}
                        {act?.task && (
                          <div className="mt-1 text-[11px] text-blue-800/90 font-medium flex items-center gap-2">
                            <span>⏱️ Due: {act.task.dueDate}</span>
                            <span>•</span>
                            <span>📍 {act.task.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {emp.phone || emp.email || 'Direct contact on file'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {state === 'available' && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewTaskStaffId(emp.id);
                            setIsTaskModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition cursor-pointer"
                        >
                          + Assign Task
                        </button>
                      )}
                      {onOpenEmployeeDossier && (
                        <button
                          type="button"
                          onClick={() => onOpenEmployeeDossier(emp.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          title="View Profile Dossier"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Operational Tasks Management Table / Cards */
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Active Operational &amp; Field Dispatch Tasks ({tasks.length})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                New Task
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  task.status === 'Completed'
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : task.priority === 'Urgent'
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-600 text-white'
                          : task.priority === 'High'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-semibold">
                      {task.category}
                    </span>
                    <h4
                      className={`text-sm font-bold text-slate-900 ${
                        task.status === 'Completed' ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      Assigned to: <strong className="text-slate-800">{task.assignedEmployeeName}</strong> ({task.assignedRole})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Due: {task.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {task.location}
                    </span>
                  </div>

                  {task.notes && (
                    <p className="text-xs text-slate-500 italic mt-0.5 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      "{task.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleTaskStatus(task.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      task.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : task.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {task.status === 'Completed' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed
                      </>
                    ) : task.status === 'In Progress' ? (
                      <>
                        <Clock className="w-4 h-4 text-amber-600" /> In Progress
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-slate-500" /> Mark Active
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove task"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. New Task Assignment Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Assign Operational Task</h3>
                  <p className="text-xs text-slate-400">Dispatch personnel to tour support, consular or logistics duties</p>
                </div>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Task Title / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Airport Meet & Greet for German Cultural Tour Group"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Assign To Personnel *
                  </label>
                  <select
                    value={newTaskStaffId}
                    onChange={(e) => setNewTaskStaffId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="">-- Select Available Staff --</option>
                    {employees.map((emp) => {
                      const act = employeeActivityMap.get(emp.id)?.state || 'available';
                      return (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.role}) - [{act.toUpperCase().replace('_', ' ')}]
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Task Category
                  </label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="Tour Expedition">Tour Expedition</option>
                    <option value="Consular & Visa">Consular & Visa</option>
                    <option value="Fleet & Logistics">Fleet & Logistics</option>
                    <option value="Airport Meet & Greet">Airport Meet & Greet</option>
                    <option value="Ticketing & Hospitality">Ticketing & Hospitality</option>
                    <option value="Finance & Admin">Finance & Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Due Date / Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Today, 16:00"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Asmara Intl Airport"
                    value={newTaskLocation}
                    onChange={(e) => setNewTaskLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Operational Notes &amp; Special Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific details, permit reference, flight numbers or contact numbers..."
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-xs transition cursor-pointer"
                >
                  Confirm &amp; Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
