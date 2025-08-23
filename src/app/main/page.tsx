'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  // Get today's date
  const today = new Date().getDate();
  const [selectedDate, setSelectedDate] = useState(today);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Generate all dates from 1 to 31
  const allDates = Array.from({ length: 31 }, (_, i) => i + 1); // 1-31
  
  // Using actual image URLs from public folder to match the Figma design
  const photos = [
    {
      id: 1,
      image: '/c5e64eae168894fcc65662c84fd19a3668b4c94d.png',
      rotation: '-rotate-3'
    },
    {
      id: 2,
      image: '/8b3065bd083fb8ac6ae82ceab5042a0d2c23443e.png',
      rotation: 'rotate-3'
    },
    {
      id: 3,
      image: '/6eeefb626d236d950bb73fdc6e99fcd267aee37b.png',
      rotation: 'rotate-3'
    }
  ];

  useEffect(() => {
    // Center the selected date on component mount
    const centerSelectedDate = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        // Find the button element for today's date
        const todayButton = container.querySelector(`button[data-date="${today}"]`) as HTMLElement;
        if (todayButton) {
          todayButton.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }
    };

    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(centerSelectedDate, 100);
    return () => clearTimeout(timer);
  }, [today]);

  const handleDateClick = (date: number) => {
    setSelectedDate(date);
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const clickedButton = container.querySelector(`button[data-date="${date}"]`) as HTMLElement;
      if (clickedButton) {
        clickedButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] text-white relative max-w-[600px] mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-6">
        <img 
          src="/logo.svg" 
          alt="Picoco logo" 
          className="h-8"
        />
        <img 
          src="/assets/date_range.svg" 
          alt="Date range" 
          className="w-6 h-6"
        />
      </div>

      {/* Date Navigation */}
      <div className="relative mb-12">
        <div className="overflow-hidden">
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide px-[50%]"
            style={{
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollBehavior: 'smooth'
            }}
          >
            {allDates.map((date) => (
              <button
                key={date}
                type="button"
                data-date={date}
                onClick={() => handleDateClick(date)}
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-all duration-300 ${
                  selectedDate === date
                    ? 'text-white font-bold scale-100'
                    : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
                style={{
                  backgroundColor: selectedDate === date ? 'rgba(255, 255, 255, 0.25)' : 'transparent'
                }}
                aria-label={`Select date ${date}`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
        
        {/* Center indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white border-opacity-20 pointer-events-none"></div>
      </div>

      {/* Photo Grid */}
      <div className="px-8 mb-20">
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`relative transform ${photo.rotation}`}
            >
              <div 
                className="w-full aspect-[3/4] rounded-2xl bg-cover bg-center shadow-lg"
                style={{
                  backgroundImage: `url('${photo.image}')`
                }}
              />
            </div>
          ))}
          
          {/* Add Photo Placeholder */}
          <div className="relative transform -rotate-3">
            <button 
              type="button"
              className="w-full aspect-[3/4] border-2 border-dashed border-gray-500 rounded-2xl flex items-center justify-center hover:border-gray-400 transition-colors bg-[#313131]"
              aria-label="Add new photo"
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="w-12 h-12 text-gray-500"
                aria-label="Plus icon"
              >
                <title>Add photo</title>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Camera Interface */}
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 flex items-center">
        {/* Camera Button - centered */}
        <div className="relative">
          <button type="button" className="w-20 h-20 flex items-center justify-center" aria-label="Take photo">
            <img 
              src="/assets/camera.svg" 
              alt="Camera" 
              className="w-20 h-20"
            />
          </button>
        </div>
        
        {/* Favorite Button - positioned to the right */}
        <button type="button" className="absolute right-[-120px] w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg" aria-label="Favorites">
          <img 
            src="/assets/star.svg" 
            alt="Star" 
            className="w-6 h-6"
          />
        </button>
      </div>

      {/* Camera Label */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <span className="text-sm text-white">Camera</span>
      </div>

      {/* Home Indicator */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-1 bg-white rounded-full opacity-60"></div>
      </div>
    </div>
  );
}
