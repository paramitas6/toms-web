// pages/calendar.tsx

import React from 'react';
import dynamic from 'next/dynamic';

const EnterpriseCalendar = dynamic(() => import('./_components/EnterpriseCalendar'), { ssr: false });

const CalendarPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Order Schedule</h1>
      <EnterpriseCalendar />
    </div>
  );
};

export default CalendarPage;
