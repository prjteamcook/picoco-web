'use client';

import { useState } from 'react';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(23);
  
  // August 2025 calendar data
  const monthYear = 'August 2025';
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
  
  // Generate calendar dates (August 2025 starts on Friday)
  const generateCalendarDates = () => {
    const dates = [];
    const firstDayOfMonth = 5; // Friday (0=Sunday, 1=Monday, ..., 5=Friday)
    const daysInMonth = 31;
    
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
  
  const calendarDates = generateCalendarDates();
  
  const getPhotoForDate = (date: number) => {
    return photoDates.find(photo => photo.date === date);
  };

  return (
    <div className="min-h-screen bg-[#191919] text-white relative max-w-[600px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <a href="/main" className="w-10 h-10 flex items-center justify-center text-white" aria-label="Home">
          <img 
            src="/assets/home.svg" 
            alt="Home" 
            className="w-6 h-6"
          />
        </a>
        <h1 className="text-lg font-medium text-white">Photo</h1>
        <div className="w-10 h-10"></div>
      </div>

      {/* Photo Grid Preview */}
      <div className="px-5 mb-8">
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

      {/* Calendar Section */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{monthYear}</h2>
          <div className="text-4xl font-light text-gray-400">8</div>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center text-gray-400 text-sm py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {calendarDates.map((date, index) => {
            if (date === null) {
              return <div key={index} className="aspect-square"></div>;
            }

            const photo = getPhotoForDate(date);
            const isSelected = date === selectedDate;

            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`aspect-square rounded-full overflow-hidden relative ${
                  isSelected ? 'ring-4 ring-orange-500' : ''
                }`}
                style={{
                  backgroundImage: photo ? `url('${photo.image}')` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: photo ? 'transparent' : '#333333'
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

    </div>
  );
}