import React, { useState, useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  ActiveTab,
  Department,
  Employee,
  TourPackage,
  TourSchedule,
  TouristProfile,
  WebsiteEnquiry,
  Booking,
  Ticket,
  TicketingClient,
  VisaOnArrivalDoc,
  RegionalPermitDoc,
  NotificationItem,
  ItineraryItem,
  StaffStatus,
  Vehicle,
  TourActivity,
  VehicleStatus,
  Hotel,
  HotelReservation,
  HotelLetterDoc,
  RentalLetterDoc,
  MessageChannel,
  MessageItem,
  FinancialTransaction,
  FinancialInvoice,
  ExpenseReceipt,
  ReceiptVerificationStatus,
  TouristActivity,
  TourBooking,
} from './types';
import { useCollection, useWorkspace } from './lib/workspace';
import { api, setAuthToken } from './lib/api';
import { ROLES, canView, canWrite, ADMIN_ONLY_EDIT_MESSAGE } from '../shared/roles';
import { BRAND } from '../shared/brand';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { QuickActionModal } from './components/layout/QuickActionModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { StaffManagementView } from './components/hr/StaffManagementView';
import { TourCalendarView } from './components/tours/TourCalendarView';
import { TouristDirectoryView } from './components/tourists/TouristDirectoryView';
import { VisaPermitGeneratorView } from './components/documents/VisaPermitGeneratorView';
import { TicketManagementView } from './components/tickets/TicketManagementView';
import { TourPackagesView } from './components/packages/TourPackagesView';
import { TransportManagementView } from './components/transport/TransportManagementView';
import { HotelManagementView } from './components/hotels/HotelManagementView';
import { MessagesView } from './components/messages/MessagesView';
import { FinanceWorkspace } from './components/finance/FinanceWorkspace';
import { AuditControlView, detectRedFlags } from './components/audit/AuditControlView';
import { StaffAccountsView } from './components/accounts/StaffAccountsView';
import { AdminControlCentre } from './components/admin/AdminControlCentre';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Modals
import { AddEmployeeModal } from './components/hr/AddEmployeeModal';
import { NewDepartureModal } from './components/tours/NewDepartureModal';
import { AddTouristModal } from './components/tourists/AddTouristModal';
import { IssueTicketModal } from './components/tickets/IssueTicketModal';
import { HotelReservationModal } from './components/hotels/HotelReservationModal';
import { AddTouristActivityModal } from './components/tourists/AddTouristActivityModal';
import { SampleDataModal } from './components/settings/SampleDataModal';
import { mockTicketingClients } from './mockData';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Core data. Each of these reads from, and writes back to, the shared
  // agency database — the hook has the same shape as useState, so every screen
  // below works exactly as it did when the data was local.
  const { user, status: saveStatus, lastError, dismissError, canEditRecords } = useWorkspace();
  const role = user.role;
  const permissions = ROLES[role];

  const [departments, setDepartments] = useCollection<Department>('departments');
  const [employees, setEmployees] = useCollection<Employee>('employees');
  const [packages, setPackages] = useCollection<TourPackage>('packages');
  const [activities, setActivities] = useCollection<TourActivity>('activities');
  const [vehicles, setVehicles] = useCollection<Vehicle>('vehicles');
  const [schedules, setSchedules] = useCollection<TourSchedule>('schedules');
  const [tourists, setTourists] = useCollection<TouristProfile>('tourists');
  const [bookings, setBookings] = useCollection<Booking>('bookings');
  const [websiteEnquiries, setWebsiteEnquiries] = useCollection<WebsiteEnquiry>('websiteEnquiries');
  const [tickets, setTickets] = useCollection<Ticket>('tickets');
  const [visaDocs, setVisaDocs] = useCollection<VisaOnArrivalDoc>('visaDocs');
  const [permits, setPermits] = useCollection<RegionalPermitDoc>('permits');
  const [hotels, setHotels] = useCollection<Hotel>('hotels');
  const [reservations, setReservations] = useCollection<HotelReservation>('reservations');
  const [hotelLetters, setHotelLetters] = useCollection<HotelLetterDoc>('hotelLetters');
  const [rentalLetters, setRentalLetters] = useCollection<RentalLetterDoc>('rentalLetters');
  const [channels, setChannels] = useCollection<MessageChannel>('channels');
  const [messages, setMessages] = useCollection<MessageItem>('messages');
  const [financialTransactions, setFinancialTransactions] = useCollection<FinancialTransaction>('financialTransactions');
  const [financialInvoices, setFinancialInvoices] = useCollection<FinancialInvoice>('financialInvoices');
  const [receipts, setReceipts] = useCollection<ExpenseReceipt>('receipts');
  const [notifications, setNotifications] = useCollection<NotificationItem>('notifications');
  const [touristActivities, setTouristActivities] = useCollection<TouristActivity>('touristActivities');
  const [tourBookings, setTourBookings] = useCollection<TourBooking>('tourBookings');
  const [persistedClients, setPersistedClients] = useCollection<TicketingClient>('ticketingClients');

  const ticketingClients = useMemo(() => {
    if (persistedClients && persistedClients.length > 0) return persistedClients;
    return mockTicketingClients;
  }, [persistedClients]);

  const handleAddTicketingClient = (newClient: TicketingClient) => {
    setPersistedClients((prev) => [newClient, ...(prev && prev.length > 0 ? prev : mockTicketingClients)]);
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `New Ticketing Client Registered`,
      message: `Client ${newClient.fullName} (${newClient.clientCode || 'Client'}) registered with verified passport profile.`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'permit_issued',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  // Global Modals State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isSampleDataOpen, setIsSampleDataOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isScheduleDepartureOpen, setIsScheduleDepartureOpen] = useState(false);
  const [isAddTouristOpen, setIsAddTouristOpen] = useState(false);
  const [isIssueTicketOpen, setIsIssueTicketOpen] = useState(false);
  const [isReserveHotelOpen, setIsReserveHotelOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);

  // Preselected context for workflows
  const [preselectedTourist, setPreselectedTourist] = useState<TouristProfile | null>(null);
  const [preselectedHotelPackage, setPreselectedHotelPackage] = useState<TourPackage | null>(null);
  const [preselectedHotelTourist, setPreselectedHotelTourist] = useState<TouristProfile | null>(null);
  const [preselectedActivityTourist, setPreselectedActivityTourist] = useState<TouristProfile | null>(null);

  // Unread urgent alert count
  const urgentAlertCount = useMemo(
    () => notifications.filter((n) => !n.read && n.priority === 'urgent').length,
    [notifications]
  );

  // Handlers for HR
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees((prev) => [newEmp, ...prev]);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // Handlers for Tour Packages & Activities
  const handleAddPackage = (newPkg: TourPackage) => {
    setPackages((prev) => [newPkg, ...prev]);
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Tour Package Created`,
      message: `"${newPkg.title}" (${newPkg.durationDays} Days, ${newPkg.region}) added to expedition catalog.`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'schedule_change',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  const handleUpdatePackage = (updatedPkg: TourPackage) => {
    setPackages((prev) => prev.map((p) => (p.id === updatedPkg.id ? updatedPkg : p)));
  };

  const handleSavePackageItinerary = (packageId: string, itinerary: ItineraryItem[]) => {
    setPackages((prev) =>
      prev.map((pkg) => (pkg.id === packageId ? { ...pkg, itinerary } : pkg))
    );
  };

  const handleAddActivity = (newActivity: TourActivity) => {
    setActivities((prev) => [newActivity, ...prev]);
  };

  const handleAddTourBooking = (booking: TourBooking) => {
    setTourBookings((prev) => [booking, ...prev]);
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Tour Booking Confirmed: ${booking.touristName}`,
      message: `${booking.region} · ${booking.startDate} → ${booking.endDate} · ${booking.travelersCount} pax · $${booking.totalPackageUSD.toLocaleString()} total.`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'schedule_change',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  // Handlers for Vehicles & Transport
  const handleAddVehicle = (newVeh: Vehicle) => {
    setVehicles((prev) => [newVeh, ...prev]);
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Fleet Asset Registered`,
      message: `"${newVeh.name}" (${newVeh.plateNumber}) added to the Asmara fleet depot.`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'schedule_change',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  const handleUpdateVehicle = (updatedVeh: Vehicle) => {
    setVehicles((prev) => prev.map((v) => (v.id === updatedVeh.id ? updatedVeh : v)));
  };

  const handleUpdateVehicleStatus = (vehicleId: string, status: VehicleStatus) => {
    setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? { ...v, status } : v)));
  };

  const handleSaveRentalLetter = (letter: RentalLetterDoc) => {
    setRentalLetters((prev) => {
      const exists = prev.some((l) => l.id === letter.id);
      if (exists) {
        return prev.map((l) => (l.id === letter.id ? letter : l));
      }
      return [letter, ...prev];
    });

    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Rental Requisition Letter Logged`,
      message: `ደብዳቤ ጠለብ ክራይ #${letter.refNumber} generated for ${letter.rentalCompanyName} ($${letter.totalEstimatedCostUSD} USD).`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'permit_issued',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  // Handlers for Hotels & Lodging
  const handleAddHotel = (newHotel: Hotel) => {
    setHotels((prev) => [newHotel, ...prev]);
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Hotel Added`,
      message: `${newHotel.name} (${newHotel.city}) added to partner properties catalog.`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'permit_issued',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  const handleUpdateHotel = (updatedHotel: Hotel) => {
    setHotels((prev) => prev.map((h) => (h.id === updatedHotel.id ? updatedHotel : h)));
  };

  const handleAddHotelReservation = (newRes: HotelReservation) => {
    setReservations((prev) => [newRes, ...prev]);
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Hotel Room Confirmed (${newRes.confirmationCode})`,
      message: `${newRes.hotelName} (${newRes.roomTypeName}) reserved for ${newRes.touristName} (${newRes.numberOfNights} nights, $${newRes.totalAmount} USD).`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'permit_issued',
    };
    setNotifications((prev) => [alert, ...prev]);

    // Auto-record financial transaction for reservation
    const txn: FinancialTransaction = {
      id: `txn-res-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      referenceCode: `TXN-HTL-${newRes.confirmationCode.slice(-4)}`,
      category: 'Hotel Lodging',
      type: 'Income',
      description: `Lodging booking payment: ${newRes.hotelName} for ${newRes.touristName}`,
      amountUSD: newRes.totalAmount,
      amountNFA: newRes.totalAmount * 15,
      payerOrPayee: newRes.touristName,
      paymentMethod: 'Bank Wire',
      status: 'Completed',
      receiptNumber: `REC-${newRes.confirmationCode}`,
      recordedBy: 'Hotel Desk Ops',
    };
    setFinancialTransactions((prev) => [txn, ...prev]);
  };

  const handleSaveHotelLetter = (letter: HotelLetterDoc) => {
    setHotelLetters((prev) => {
      const exists = prev.some((l) => l.id === letter.id);
      if (exists) {
        return prev.map((l) => (l.id === letter.id ? letter : l));
      }
      return [letter, ...prev];
    });

    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Official Hotel Letter Generated`,
      message: `ደብዳቤ ምሓዝ ክፍልታት #${letter.refNumber} generated for ${letter.hotelName} (${letter.guests.length} guests).`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'permit_issued',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  const handleSendToHotelMessage = (letter: HotelLetterDoc) => {
    handleSaveHotelLetter(letter);

    // Find channel for this hotel or use ops channel
    const hotelChannel = channels.find((c) => c.hotelId === letter.hotelId) || channels[0];

    const firstDate = letter.guests[0]?.reservedDate || letter.date;
    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      channelId: hotelChannel.id,
      senderId: 'usr-admin',
      senderName: 'EritreaVisit Central Operations',
      senderRole: 'Reservations Desk',
      content: `Official room request letter (Ref: ${letter.refNumber}) dispatched for ${letter.hotelName}. Total ${letter.guests.length} guest accommodations requested for check-in on ${firstDate}.`,
      timestamp: 'Just now',
      isOutgoing: true,
      priority: 'normal',
      attachments: [
        {
          id: `att-${letter.id}`,
          name: `ደብዳቤ_ምሓዝ_ክፍልታት_${letter.refNumber}.pdf`,
          type: 'letter',
          size: '184 KB',
        },
      ],
    };

    setMessages((prev) => [...prev, newMsg]);
    setActiveTab('messages');
  };

  const handleReserveHotelForTourist = (tourist: TouristProfile) => {
    setPreselectedHotelTourist(tourist);
    setPreselectedHotelPackage(null);
    setIsReserveHotelOpen(true);
  };

  const handleAddActivityForTourist = (tourist: TouristProfile) => {
    setPreselectedActivityTourist(tourist);
    setIsAddActivityOpen(true);
  };

  const handleSaveTouristActivity = (activity: TouristActivity) => {
    setTouristActivities((prev) => [activity, ...prev]);
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Activity Added: ${activity.title}`,
      message: `${activity.date}${activity.timeSlot ? ` · ${activity.timeSlot}` : ''} for ${activity.touristName}${
        activity.guideName ? ` · Guide: ${activity.guideName}` : ''
      }${activity.driverName ? ` · Driver: ${activity.driverName}` : ''}.`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'schedule_change',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  const handleReserveHotelForPackage = (pkg: TourPackage) => {
    setPreselectedHotelPackage(pkg);
    setPreselectedHotelTourist(null);
    setIsReserveHotelOpen(true);
  };

  // Handlers for Messages & Dispatch
  const handleSendMessage = (
    channelId: string,
    content: string,
    priority: 'normal' | 'urgent' | 'broadcast' = 'normal',
    attachments: any[] = []
  ) => {
    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: 'usr-admin',
      senderName: 'EritreaVisit Operations',
      senderRole: 'Dispatch Control',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOutgoing: true,
      priority,
      attachments,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Update channel's last message
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId
          ? {
              ...c,
              lastMessage: content.slice(0, 60),
              lastMessageTime: 'Just now',
            }
          : c
      )
    );
  };

  // Handlers for Financial Transactions & Invoices
  const handleAddFinancialTransaction = (newTxn: FinancialTransaction) => {
    setFinancialTransactions((prev) => [newTxn, ...prev]);
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Financial Entry Recorded`,
      message: `${newTxn.type === 'Income' ? '+' : '-'}$${newTxn.amountUSD} USD (${newTxn.category}) recorded in General Ledger.`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'permit_issued',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  const handleAddFinancialInvoice = (newInv: FinancialInvoice) => {
    setFinancialInvoices((prev) => [newInv, ...prev]);
  };

  // Handlers for Tour Schedules
  const handleAddSchedule = (newSch: TourSchedule) => {
    setSchedules((prev) => [newSch, ...prev]);
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Tour Departure Scheduled`,
      message: `Convoy for "${newSch.tourTitle}" departing on ${newSch.startDate} initialized.`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'schedule_change',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  const handleUpdateScheduleGuide = (scheduleId: string, guideName: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, leadGuideName: guideName } : s))
    );
  };

  // Handlers for Tourist Profiles
  const handleAddTourist = (newTourist: TouristProfile) => {
    setTourists((prev) => [newTourist, ...prev]);
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `New Tourist Dossier Created`,
      message: `${newTourist.fullName} (${newTourist.nationality}) registered. Passport: ${newTourist.passportNumber}.`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'permit_issued',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  /** Move an enquiry along its pipeline; the change syncs to the database. */
  const handleUpdateEnquiry = (updated: WebsiteEnquiry) => {
    setWebsiteEnquiries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  /**
   * Turn a website enquiry into a tourist dossier. Only what the visitor
   * actually gave us is copied across — passport and travel details stay blank
   * for the desk to complete, so nothing is invented on their behalf.
   */
  const handleConvertEnquiry = (enquiry: WebsiteEnquiry) => {
    const tourist: TouristProfile = {
      id: `tour-${Date.now()}`,
      fullName: enquiry.fullName,
      email: enquiry.email,
      phone: enquiry.phone || '',
      passportNumber: '',
      passportExpiry: '',
      nationality: enquiry.country || '',
      dateOfBirth: '',
      gender: 'Prefer not to say',
      dietaryRequirements: '',
      medicalNotes: '',
      emergencyContact: { name: '', relation: '', phone: '' },
      travelHistoryCount: 0,
      status: 'Inquiry',
      avatar: '',
      notes: [
        `Website enquiry ${enquiry.id} received ${new Date(enquiry.receivedAt).toLocaleDateString()}.`,
        enquiry.tourTitle ? `Interested in: ${enquiry.tourTitle}.` : '',
        enquiry.preferredDate ? `Preferred travel date: ${enquiry.preferredDate}.` : '',
        enquiry.partySize ? `Party size: ${enquiry.partySize}.` : '',
        enquiry.message,
      ]
        .filter(Boolean)
        .join(' '),
      preferredLanguage: 'English',
    };
    handleAddTourist(tourist);
    // Marking the lead as converted changes a stored entry, so it only happens
    // for the administrator; for everyone else the dossier is still created and
    // the lead stays where it is.
    if (canEditRecords) {
      handleUpdateEnquiry({ ...enquiry, status: 'Converted', handledAt: new Date().toISOString() });
    }
  };

  const handleGenerateVoAForTourist = (tourist: TouristProfile) => {
    setPreselectedTourist(tourist);
    setActiveTab('documents');
  };

  const handleIssueTicketForTourist = (tourist: TouristProfile) => {
    setPreselectedTourist(tourist);
    setIsIssueTicketOpen(true);
  };

  // Handlers for VoA & Permits
  const handleSaveVoADoc = (doc: VisaOnArrivalDoc) => {
    setVisaDocs((prev) => [doc, ...prev]);
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `VoA Sponsorship Letter Drafted`,
      message: `Official consular letter for ${doc.touristName} (${doc.docNumber}) ready for dispatch.`,
      timestamp: 'Just now',
      read: false,
      priority: 'urgent',
      type: 'voa_status',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  const handleSavePermitDoc = (permit: RegionalPermitDoc) => {
    setPermits((prev) => [permit, ...prev]);
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Ministry of Tourism Permit Issued`,
      message: `Zoba Travel Clearance #${permit.permitNumber} generated for ${permit.zoneName.slice(0, 30)}...`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'permit_issued',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  const handleApproveVoADoc = (docId: string) => {
    setVisaDocs((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, issuanceStatus: 'Approved' } : d))
    );
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `VoA Letter Approved by Consular Desk`,
      message: `Immigration stamp generated and synchronized with Asmara Airport Port of Entry.`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'voa_status',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  // Handlers for Tickets
  const handleIssueTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Expedition Pass Issued`,
      message: `Pass #${newTicket.ticketNumber} for ${newTicket.touristName} issued with security QR code.`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'permit_issued',
    };
    setNotifications((prev) => [alert, ...prev]);

    // Every dollar collected at issue time becomes a real ledger entry, not
    // just a number on the ticket -- that's the ticketing desk's own
    // accounting trail rather than a manual finance entry.
    if (newTicket.amountPaid && newTicket.amountPaid > 0) {
      const txn: FinancialTransaction = {
        id: `txn-tkt-${Date.now()}`,
        date: newTicket.paymentDate || newTicket.bookingDate || new Date().toISOString().split('T')[0],
        referenceCode: `TXN-TKT-${(newTicket.pnr || newTicket.ticketNumber || '').slice(-6)}`,
        category: 'Flight Tickets',
        type: 'Income',
        description: `Ticket payment: ${newTicket.airline || 'Flight'} ${newTicket.route || ''} for ${newTicket.touristName}`,
        amountUSD: newTicket.amountPaid,
        amountNFA: newTicket.amountPaid * 15,
        payerOrPayee: newTicket.touristName,
        paymentMethod: newTicket.creditCardRef ? 'Credit Card' : 'Cash (USD)',
        status: 'Completed',
        linkedEntityId: newTicket.id,
        linkedEntityType: 'ticket',
        recordedBy: newTicket.agent || 'Ticketing Desk',
      };
      setFinancialTransactions((prev) => [txn, ...prev]);
    }
  };

  const handleUpdateTicketStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status } : t)));
  };

  const handleRecordTicketPayment = (
    ticketId: string,
    amountCollected: number,
    newPaymentStatus: Ticket['paymentStatus']
  ) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, amountPaid: (t.amountPaid || 0) + amountCollected, paymentStatus: newPaymentStatus }
          : t
      )
    );

    const txn: FinancialTransaction = {
      id: `txn-tkt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      referenceCode: `TXN-TKT-${(ticket.pnr || ticket.ticketNumber || '').slice(-6)}-${Date.now().toString().slice(-4)}`,
      category: 'Flight Tickets',
      type: 'Income',
      description: `Ticket payment: ${ticket.airline || 'Flight'} ${ticket.route || ''} for ${ticket.touristName}`,
      amountUSD: amountCollected,
      amountNFA: amountCollected * 15,
      payerOrPayee: ticket.touristName,
      paymentMethod: 'Cash (USD)',
      status: 'Completed',
      linkedEntityId: ticket.id,
      linkedEntityType: 'ticket',
      recordedBy: user.fullName || 'Finance Desk',
    };
    setFinancialTransactions((prev) => [txn, ...prev]);

    const alert: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Payment Recorded: ${ticket.touristName}`,
      message: `$${amountCollected.toLocaleString()} collected for PNR ${ticket.pnr || ticket.bookingRef} — now ${newPaymentStatus}.`,
      timestamp: 'Just now',
      read: false,
      priority: 'normal',
      type: 'permit_issued',
    };
    setNotifications((prev) => [alert, ...prev]);
  };

  // Handlers for the receipt store
  const handleAddReceipt = (receipt: ExpenseReceipt, autoCreateTransaction = false) => {
    setReceipts((prev) => [receipt, ...prev]);
    if (autoCreateTransaction) {
      const txn: FinancialTransaction = {
        id: `txn-rcpt-${Date.now()}`,
        date: receipt.date,
        referenceCode: `TXN-${receipt.receiptNumber}`,
        category: 'Miscellaneous',
        type: 'Expense',
        description: `${receipt.vendorName} — ${receipt.description}`,
        amountUSD: receipt.amountUSD,
        amountNFA: receipt.amountNFA,
        payerOrPayee: receipt.vendorName,
        paymentMethod: receipt.paymentMethod || 'Cash (USD)',
        status: 'Completed',
        receiptNumber: receipt.receiptNumber,
        receiptId: receipt.id,
        recordedBy: user.fullName,
      };
      setFinancialTransactions((prev) => [txn, ...prev]);
    }
  };

  const handleUpdateReceiptStatus = (
    receiptId: string,
    status: ReceiptVerificationStatus,
    notes?: string,
    verifiedBy?: string,
  ) => {
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === receiptId
          ? {
              ...r,
              verificationStatus: status,
              verificationNotes: notes ?? r.verificationNotes,
              verifiedBy: verifiedBy || user.fullName,
              verifiedAt: new Date().toISOString(),
            }
          : r,
      ),
    );
  };

  const handleLinkReceiptToTransaction = (receiptId: string, transactionId: string) => {
    const transaction = financialTransactions.find((t) => t.id === transactionId);
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === receiptId
          ? {
              ...r,
              linkedTransactionId: transactionId,
              linkedTransactionRef: transaction?.referenceCode,
              verificationStatus: r.verificationStatus === 'Unmatched' ? 'Pending Review' : r.verificationStatus,
            }
          : r,
      ),
    );
    setFinancialTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, receiptId } : t)),
    );
  };

  const handleSignOut = async () => {
    await api.post('auth/logout').catch(() => undefined);
    setAuthToken(null);
    window.location.reload();
  };

  // Which module each screen belongs to, so a role never lands on a tab it
  // cannot open (by deep link, or after its permissions change).
  const TAB_MODULE: Record<string, Parameters<typeof canView>[1]> = {
    dashboard: 'dashboard', packages: 'packages', hotels: 'hotels', transport: 'transport',
    hr: 'hr', tours: 'tours', tourists: 'tourists', documents: 'documents', tickets: 'tickets',
    messages: 'messages', finance: 'finance', audit: 'audit', accounts: 'accounts',
    admin: 'admin',
  };

  const allowedTabs = Object.keys(TAB_MODULE).filter((tab) => canView(role, TAB_MODULE[tab])) as ActiveTab[];
  const effectiveTab: ActiveTab = allowedTabs.includes(activeTab) ? activeTab : (allowedTabs[0] ?? 'dashboard');

  // Control exceptions drive the badge on the Audit tab.
  const redFlagCount = useMemo(() => {
    if (!canView(role, 'audit')) return 0;
    return detectRedFlags({ tickets, bookings, transactions: financialTransactions, receipts, auditEntries: [] })
      .length;
  }, [role, tickets, bookings, financialTransactions, receipts]);

  // Notification Drawer Helpers
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div id="app-container" className="flex h-screen bg-[#FBF8F5] text-slate-900 overflow-hidden font-sans antialiased">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={effectiveTab}
        setActiveTab={setActiveTab}
        urgentAlertCount={urgentAlertCount}
        role={role}
        redFlagCount={redFlagCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          urgentAlertCount={urgentAlertCount}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          user={{ fullName: user.fullName, username: user.username, role }}
          saveStatus={saveStatus}
          onSignOut={handleSignOut}
          onManageSampleData={role === 'CEO' ? () => setIsSampleDataOpen(true) : undefined}
          onOpenAdmin={role === 'CEO' ? () => setActiveTab('admin') : undefined}
          activeTabTitle={
            effectiveTab === 'audit'
              ? 'Audit & Operational Controls'
              : effectiveTab === 'accounts'
              ? 'Staff Accounts & Access'
              : effectiveTab === 'admin'
              ? 'Admin Control Centre'
              : activeTab === 'dashboard'
              ? 'Dashboard & Operations Core'
              : activeTab === 'packages'
              ? 'Tour Operations'
              : activeTab === 'hotels'
              ? 'Hotels, Lodging & Management Letters'
              : activeTab === 'transport'
              ? 'Transport & Fleet Depot'
              : activeTab === 'hr'
              ? 'Staff, HR & Guide Roster'
              : activeTab === 'tours'
              ? 'Tour Schedules & Convoy Departures'
              : activeTab === 'tourists'
              ? 'Tourist Profiles & Dossiers'
              : activeTab === 'documents'
              ? 'Visa on Arrival & Regional Permits'
              : activeTab === 'tickets'
              ? 'Digital Boarding Passes & Tickets'
              : activeTab === 'messages'
              ? 'Messaging & Field Dispatch'
              : 'Financial Operations & General Ledger'
          }
          onNavigate={(tab) => setActiveTab(tab)}
        />

        <main className="flex-1 overflow-y-auto p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-28 bg-[#FBF8F5]">
          {lastError && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-rose-900">That change was not saved</div>
                <p className="mt-0.5 text-sm text-rose-700">{lastError}</p>
              </div>
              <button
                onClick={dismissError}
                className="shrink-0 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/*
            Everyone can add new work; only the administrator can change or
            remove something already saved. Saying so once, plainly, at the top
            of the screen is kinder than letting someone fill in a form and
            discover the refusal at the end.
          */}
          {!canEditRecords && effectiveTab !== 'dashboard' && effectiveTab !== 'messages' && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-lagoon-200 bg-lagoon-50 px-5 py-3.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-lagoon-600" />
              <p className="text-sm leading-relaxed text-lagoon-950">
                <span className="font-semibold">You can add new records here.</span> {ADMIN_ONLY_EDIT_MESSAGE}
              </p>
            </div>
          )}

          <ErrorBoundary label={effectiveTab} resetKey={effectiveTab}>
          {effectiveTab === 'dashboard' && (
            <DashboardView
              employees={employees}
              schedules={schedules}
              tourists={tourists}
              bookings={bookings}
              tickets={tickets}
              visaDocs={visaDocs}
              permits={permits}
              packages={packages}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectSchedule={() => setActiveTab('tours')}
            />
          )}

          {effectiveTab === 'packages' && (
            <TourPackagesView
              packages={packages}
              activities={activities}
              tourists={tourists}
              hotels={hotels}
              employees={employees}
              vehicles={vehicles}
              tourBookings={tourBookings}
              canEdit={canEditRecords}
              onAddPackage={handleAddPackage}
              onUpdatePackage={handleUpdatePackage}
              onSaveItinerary={handleSavePackageItinerary}
              onAddActivity={handleAddActivity}
              onReserveHotelForPackage={handleReserveHotelForPackage}
              onScheduleDeparture={(pkg) => {
                setIsScheduleDepartureOpen(true);
              }}
              onAddTourBooking={handleAddTourBooking}
            />
          )}

          {effectiveTab === 'hotels' && (
            <HotelManagementView
              hotels={hotels}
              reservations={reservations}
              tourists={tourists}
              packages={packages}
              schedules={schedules}
              hotelLetters={hotelLetters}
              canEdit={canEditRecords}
              onAddReservation={handleAddHotelReservation}
              onAddHotel={handleAddHotel}
              onUpdateHotel={handleUpdateHotel}
              onSaveHotelLetter={handleSaveHotelLetter}
              onSendToHotelMessage={handleSendToHotelMessage}
              onGenerateVoA={handleGenerateVoAForTourist}
              onGeneratePermit={() => setActiveTab('documents')}
            />
          )}

          {effectiveTab === 'transport' && (
            <TransportManagementView
              vehicles={vehicles}
              rentalLetters={rentalLetters}
              canEdit={canEditRecords}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onUpdateVehicleStatus={handleUpdateVehicleStatus}
              onSaveRentalLetter={handleSaveRentalLetter}
              onAddFinancialTransaction={handleAddFinancialTransaction}
            />
          )}

          {effectiveTab === 'hr' && (
            <StaffManagementView
              employees={employees}
              departments={departments}
              schedules={schedules}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={canEditRecords ? handleUpdateEmployee : undefined}
              onDeleteEmployee={canEditRecords ? handleDeleteEmployee : undefined}
              onUpdateEmployeeStatus={
                canEditRecords
                  ? (empId: string, status: StaffStatus) => {
                      setEmployees((prev) =>
                        prev.map((e) => (e.id === empId ? { ...e, status } : e))
                      );
                    }
                  : undefined
              }
            />
          )}

          {effectiveTab === 'tours' && (
            <TourCalendarView
              schedules={schedules}
              packages={packages}
              employees={employees}
              canEdit={canEditRecords}
              onAddSchedule={handleAddSchedule}
              onUpdateScheduleGuide={handleUpdateScheduleGuide}
              onSavePackageItinerary={handleSavePackageItinerary}
            />
          )}

          {effectiveTab === 'tourists' && (
            <TouristDirectoryView
              tourists={tourists}
              bookings={bookings}
              reservations={reservations}
              schedules={schedules}
              packages={packages}
              activities={touristActivities}
              enquiries={websiteEnquiries}
              canEdit={canEditRecords}
              onUpdateEnquiry={handleUpdateEnquiry}
              onConvertEnquiry={handleConvertEnquiry}
              onAddTourist={handleAddTourist}
              onGenerateVoA={handleGenerateVoAForTourist}
              onIssueTicket={handleIssueTicketForTourist}
              onReserveHotel={handleReserveHotelForTourist}
              onGeneratePermit={() => setActiveTab('documents')}
              onAddActivity={handleAddActivityForTourist}
            />
          )}

          {effectiveTab === 'documents' && (
            <VisaPermitGeneratorView
              tourists={tourists}
              packages={packages}
              schedules={schedules}
              vehicles={vehicles}
              employees={employees}
              reservations={reservations}
              hotels={hotels}
              visaDocs={visaDocs}
              permits={permits}
              initialSelectedTouristId={preselectedTourist?.id}
              onSaveVoADoc={handleSaveVoADoc}
              onSavePermitDoc={handleSavePermitDoc}
              onApproveVoADoc={canEditRecords ? handleApproveVoADoc : undefined}
            />
          )}

          {effectiveTab === 'tickets' && (
            <TicketManagementView
              tickets={tickets}
              tourists={tourists}
              schedules={schedules}
              clients={ticketingClients}
              canEdit={canEditRecords}
              canRecordPayment={permissions.can.recordPayment}
              onIssueTicket={handleIssueTicket}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onRecordPayment={handleRecordTicketPayment}
              onAddClient={handleAddTicketingClient}
            />
          )}

          {effectiveTab === 'messages' && (
            <MessagesView
              channels={channels}
              messages={messages}
              hotelLetters={hotelLetters}
              hotels={hotels}
              tourists={tourists}
              employees={employees}
              onSendMessage={handleSendMessage}
              onOpenNewLetterForHotel={(hotelId) => {
                const targetHotel = hotels.find((h) => h.id === hotelId);
                setActiveTab('hotels');
              }}
            />
          )}

          {effectiveTab === 'finance' && (
            <FinanceWorkspace
              transactions={financialTransactions}
              invoices={financialInvoices}
              receipts={receipts}
              tourists={tourists}
              packages={packages}
              hotels={hotels}
              tickets={tickets}
              canRecordPayment={permissions.can.recordPayment}
              canEdit={canEditRecords}
              onAddTransaction={handleAddFinancialTransaction}
              onAddInvoice={handleAddFinancialInvoice}
              onAddReceipt={handleAddReceipt}
              onUpdateReceiptStatus={handleUpdateReceiptStatus}
              onLinkReceiptToTransaction={handleLinkReceiptToTransaction}
            />
          )}

          {effectiveTab === 'audit' && (
            <AuditControlView
              role={role}
              tickets={tickets}
              bookings={bookings}
              transactions={financialTransactions}
              receipts={receipts}
              tourists={tourists}
            />
          )}

          {effectiveTab === 'accounts' && <StaffAccountsView currentUserId={user.id} />}

          {effectiveTab === 'admin' && <AdminControlCentre />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        setActiveTab={setActiveTab}
        onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
        onOpenScheduleDeparture={() => setIsScheduleDepartureOpen(true)}
        onOpenAddTourist={() => setIsAddTouristOpen(true)}
        onOpenIssueTicket={() => setIsIssueTicketOpen(true)}
        onOpenReserveHotel={() => {
          setPreselectedHotelTourist(null);
          setPreselectedHotelPackage(null);
          setIsReserveHotelOpen(true);
        }}
      />

      {/* Sample data controls (CEO only) */}
      <SampleDataModal isOpen={isSampleDataOpen} onClose={() => setIsSampleDataOpen(false)} />

      {/* Standalone Triggered Modals */}
      {isAddEmployeeOpen && (
        <AddEmployeeModal
          departments={departments}
          onClose={() => setIsAddEmployeeOpen(false)}
          onAddEmployee={handleAddEmployee}
        />
      )}

      {isScheduleDepartureOpen && (
        <NewDepartureModal
          packages={packages}
          employees={employees}
          onClose={() => setIsScheduleDepartureOpen(false)}
          onAddSchedule={handleAddSchedule}
        />
      )}

      {isAddTouristOpen && (
        <AddTouristModal
          onClose={() => setIsAddTouristOpen(false)}
          onAddTourist={handleAddTourist}
        />
      )}

      {isIssueTicketOpen && (
        <IssueTicketModal
          tourists={tourists}
          schedules={schedules}
          preselectedTourist={preselectedTourist}
          onClose={() => {
            setIsIssueTicketOpen(false);
            setPreselectedTourist(null);
          }}
          onIssueTicket={handleIssueTicket}
        />
      )}

      {/* Hotel Reservation Modal */}
      {isReserveHotelOpen && (
        <HotelReservationModal
          hotels={hotels}
          tourists={tourists}
          packages={packages}
          schedules={schedules}
          initialTourist={preselectedHotelTourist}
          initialPackage={preselectedHotelPackage}
          onClose={() => {
            setIsReserveHotelOpen(false);
            setPreselectedHotelTourist(null);
            setPreselectedHotelPackage(null);
          }}
          onSaveReservation={handleAddHotelReservation}
        />
      )}

      {/* Add Traveler Activity Modal */}
      {isAddActivityOpen && (
        <AddTouristActivityModal
          tourists={tourists}
          schedules={schedules}
          packages={packages}
          reservations={reservations}
          visaDocs={visaDocs}
          permits={permits}
          vehicles={vehicles}
          employees={employees}
          initialTourist={preselectedActivityTourist}
          onClose={() => {
            setIsAddActivityOpen(false);
            setPreselectedActivityTourist(null);
          }}
          onSave={handleSaveTouristActivity}
        />
      )}
    </div>
  );
}

