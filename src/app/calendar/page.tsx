'use client';

import { useState, useEffect } from 'react';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(23);
  const [selectedMonth, setSelectedMonth] = useState(7); // Track which month has selected date
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Sample photo data for dates with photos
  const photoDates = [
    { date: 1, image: '/c5e64eae168894fcc65662c84fd19a3668b4c94d.png' },
    { date: 8, image: '/8b3065bd083fb8ac6ae82ceab5042a0d2c23443e.png' },
    { date: 11, image: '/c5e64eae168894fcc65662c84fd19a3668b4c94d.png' },
    { date: 12, image: '/8b3065bd083fb8ac6ae82ceab5042a0d2c23443e.png' },
    { date: 14, image: '/6eeefb626d236d950bb73fdc6e99fcd267aee37b.png' },
    { date: 17, image: '/c5e64eae168894fcc65662c84fd19a3668b4c94d.png' },
    { date: 19, image: '/8b3065bd083fb8ac6ae82ceab5042a0d2c23443e.png' },
    { date: 22, image: '/6eeefb626d236d950bb73fdc6e99fcd267aee37b.png' },
    { date: 23, image: '/c5e64eae168894fcc65662c84fd19a3668b4c94d.png' },
    { date: 25, image: '/8b3065bd083fb8ac6ae82ceab5042a0d2c23443e.png' },
  ];
  
  // Generate calendar dates for a specific month
  const generateCalendarDates = (monthIndex: number) => {
    const dates = [];
    
    // Days in each month for 2025
    const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // First day of each month in 2025 (0=Sunday, 1=Monday, etc.)
    const firstDayOfMonths = [3, 6, 6, 2, 4, 0, 2, 5, 1, 3, 6, 1]; // 2025 starts on Wednesday
    
    const firstDayOfMonth = firstDayOfMonths[monthIndex];
    const daysInMonth = daysInMonths[monthIndex];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      dates.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(day);
    }
    
    return dates;
  };
  
  const getPhotoForDate = (date: number) => {
    return photoDates.find(photo => photo.date === date);
  };

  useEffect(() => {
    // Scroll to August (month 7) when page loads
    const scrollToAugust = () => {
      const augustElement = document.querySelector('[data-month="7"]');
      if (augustElement) {
        augustElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    };

    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(scrollToAugust, 100);
    return () => clearTimeout(timer);
  }, []);

  const renderMonth = (monthIndex: number) => {
    const calendarDates = generateCalendarDates(monthIndex);
    const monthName = `${monthNames[monthIndex]} 2025`;
    
    return (
      <div key={monthIndex} className="px-5 mb-12" data-month={monthIndex}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{monthName}</h2>
          <div className="text-4xl font-light text-gray-400">{monthIndex + 1}</div>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="text-center text-gray-400 text-sm py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDates.map((date, index) => {
            if (date === null) {
              return <div key={index} className="aspect-square"></div>;
            }

            const photo = getPhotoForDate(date);
            const isSelected = date === selectedDate && monthIndex === selectedMonth;

            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedMonth(monthIndex);
                }}
                className="aspect-square rounded-full overflow-hidden relative"
                style={{
                  backgroundImage: photo ? `url('${photo.image}')` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: photo ? 'transparent' : '#333333',
                  border: isSelected ? '2px solid #f97316' : 'none'
                }}
              >
                {/* Date number overlay */}
                <div className={`absolute inset-0 flex items-center justify-center ${
                  isSelected ? 'bg-orange-500 bg-opacity-80' : photo ? 'bg-black bg-opacity-30' : 'bg-transparent'
                }`}>
                  <span className={`text-white font-medium text-sm ${
                    photo ? 'drop-shadow-lg' : ''
                  }`}>
                    {date}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#191919] text-white relative max-w-[600px] mx-auto">
      {/* Header - Fixed */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[600px] bg-[#191919] z-20 flex items-center justify-between px-5 pt-12 pb-6">
        <a href="/main" className="w-10 h-10 flex items-center justify-center text-white" aria-label="Home">
          <img 
            src="/assets/home.svg" 
            alt="Home" 
            className="w-10 h-10"
          />
        </a>
        <h1 className="text-lg font-medium text-white">Photo</h1>
        <div className="w-10 h-10"></div>
      </div>

      {/* Photo Grid Preview */}
      <div className="px-5 my-8 mt-24">
        <div className="grid grid-cols-4 gap-2">
          {photoDates.slice(0, 8).map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden"
            >
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('${photo.image}')`
                }}
              />
              <div className="absolute bottom-1 right-1 text-white text-xs font-semibold bg-black bg-opacity-50 px-1 rounded">
                {photo.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Calendar Months - Vertically Stacked */}
      <div className="pb-8">
        {monthNames.slice(0, 8).map((_, monthIndex) => renderMonth(monthIndex))}
      </div>

    </div>
  );
}