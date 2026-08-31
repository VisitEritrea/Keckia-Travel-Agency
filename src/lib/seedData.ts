import {
  mockDepartments,
  mockEmployees,
  mockPackages,
  mockActivities,
  mockSchedules,
  mockTourists,
  mockBookings,
  mockTickets,
  mockTicketingClients,
  mockVisaDocs,
  mockPermits,
  mockNotifications,
  mockVehicles,
  mockHotels,
  mockHotelReservations,
  mockHotelLetters,
  mockRentalLetters,
  mockMessageChannels,
  mockMessages,
  mockFinancialTransactions,
  mockFinancialInvoices,
  mockExpenseReceipts,
} from '../mockData';

/**
 * The starter dataset, initialized cleanly with empty arrays for production use.
 */
export const STARTER_COLLECTIONS: Record<string, any[]> = {
  departments: [],
  employees: [],
  packages: [],
  activities: [],
  schedules: [],
  tourists: [],
  bookings: [],
  tickets: [],
  ticketingClients: [],
  visaDocs: [],
  permits: [],
  notifications: [],
  vehicles: [],
  hotels: [],
  reservations: [],
  hotelLetters: [],
  rentalLetters: [],
  channels: [],
  messages: [],
  financialTransactions: [],
  financialInvoices: [],
  receipts: [],
  touristActivities: [],
  tourBookings: [],
  expeditions: [],
};

export const DEMO_SAMPLE_COLLECTIONS: Record<string, any[]> = {
  departments: mockDepartments,
  employees: mockEmployees,
  packages: mockPackages,
  activities: mockActivities,
  schedules: mockSchedules,
  tourists: mockTourists,
  bookings: mockBookings,
  tickets: mockTickets,
  ticketingClients: mockTicketingClients,
  visaDocs: mockVisaDocs,
  permits: mockPermits,
  notifications: mockNotifications,
  vehicles: mockVehicles,
  hotels: mockHotels,
  reservations: mockHotelReservations,
  hotelLetters: mockHotelLetters,
  rentalLetters: mockRentalLetters,
  channels: mockMessageChannels,
  messages: mockMessages,
  financialTransactions: mockFinancialTransactions,
  financialInvoices: mockFinancialInvoices,
  receipts: mockExpenseReceipts,
};

/**
 * The ids the legacy starter dataset occupied, per collection. Clearing sends this so
 * the server removes the sample records and nothing else — anything the agency
 * has entered itself keeps its place.
 */
export const STARTER_IDS: Record<string, string[]> = Object.fromEntries(
  Object.entries(DEMO_SAMPLE_COLLECTIONS).map(([collection, rows]) => [
    collection,
    rows.map((row) => row?.id).filter((id): id is string => Boolean(id)),
  ]),
);

/** How many records the starter dataset holds in total. */
export const STARTER_RECORD_COUNT = Object.values(STARTER_IDS).reduce(
  (total, ids) => total + ids.length,
  0,
);

/**
 * How many sample records are still present in a loaded workspace, so the
 * clear-data screen can tell the CEO exactly what it is about to remove.
 */
export function countSampleRecords(collections: Record<string, any[]>): number {
  return Object.entries(STARTER_IDS).reduce((total, [collection, ids]) => {
    const present = new Set((collections[collection] ?? []).map((row) => row?.id));
    return total + ids.filter((id) => present.has(id)).length;
  }, 0);
}
