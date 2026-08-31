import React from 'react';
import { TouristDestinationSlideshow } from './TouristDestinationSlideshow';
import { DashboardPhoneBook } from './DashboardPhoneBook';
import {
  Employee,
  TourSchedule,
  TourPackage,
  TouristProfile,
  Booking,
  Ticket as TicketRecord,
  VisaOnArrivalDoc,
  ActiveTab,
} from '../../types';

interface DashboardViewProps {
  employees?: Employee[];
  schedules?: TourSchedule[];
  packages?: TourPackage[];
  tourists?: TouristProfile[];
  bookings?: Booking[];
  tickets?: TicketRecord[];
  visaDocs?: VisaOnArrivalDoc[];
  permits?: any[];
  setActiveTab?: (tab: ActiveTab) => void;
  onNavigate?: (tab: ActiveTab) => void;
  onOpenQuickAction?: () => void;
  onSelectSchedule?: (schedule: TourSchedule) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees = [],
  setActiveTab,
  onNavigate,
}) => {
  const handleNavigate = (tab: ActiveTab) => {
    if (onNavigate) {
      onNavigate(tab);
    } else if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  return (
    <div id="dashboard-view-container" className="space-y-6 pb-12 font-sans text-slate-900">
      {/* 1. Pictorial Slideshow of Tourist Destinations */}
      <TouristDestinationSlideshow onNavigate={handleNavigate} />

      {/* 2. Operational Directory & Phone Book */}
      <DashboardPhoneBook employees={employees} />
    </div>
  );
};
