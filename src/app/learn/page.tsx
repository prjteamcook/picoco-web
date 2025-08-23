'use client';

import { useState, useRef } from 'react';

export default function LearnPage() {
  const [selectedTab, setSelectedTab] = useState('Voca');
  const [selectedVoca, setSelectedVoca] = useState('');
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  
  const tabs = ['Voca', 'Pharase', 'Dialogue'];
  
  const vocaWords = [
    { word: 'lamp', starred: false },
    { word: '노트북', starred: false },
    { word: 'tote bag', starred: true },
    { word: 'hoodie', starred: false },
    { word: 'projector', starred: false }
  ];

  const expandBottomSheet = () => {
    setIsBottomSheetExpanded(true);
  };

  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setDragStartY(clientY);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    
    const deltaY = clientY - dragStartY;
    
    // Only allow upward drag to expand
    if (deltaY < 0) {
      setCurrentTranslateY(deltaY);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Determine final state based on drag distance
    if (currentTranslateY < -100) {
      // Dragged up significantly - expand
      setIsBottomSheetExpanded(true);
    } else {
      // Not dragged enough - stay in current state
      setIsBottomSheetExpanded(isBottomSheetExpanded);
    }
    
    setCurrentTranslateY(0);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
    
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const handleMouseUpGlobal = () => {
      handleDragEnd();
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };

    document.addEventListener('mousemove', handleMouseMoveGlobal);
    document.addEventListener('mouseup', handleMouseUpGlobal);
  };

  return (
    <div className="min-h-screen bg-[#191919] text-white relative max-w-[600px] mx-auto overflow-hidden">
      {/* Header */}
      <div className="absolute top-12 left-5 z-20">
        <button type="button" className="w-8 h-8 flex items-center justify-center text-white" aria-label="Home">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <title>Home</title>
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </button>
      </div>

      {/* Background Image - Full Height */}
      <div className="relative h-screen">
        <div 
          className="w-full h-full bg-cover bg-center relative"
          style={{
            backgroundImage: 'url("/images/IMG_8972.png")'
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div 
        ref={sheetRef}
        className={`fixed bottom-0 left-1/2 w-full max-w-[600px] bg-[#191919] rounded-t-3xl transition-all duration-300 ease-out z-30 ${
          isBottomSheetExpanded ? 'h-[85vh]' : 'h-[50vh]'
        } ${isDragging ? 'transition-none' : ''}`}
        style={{
          transform: `translateX(-50%) translateY(${isDragging ? currentTranslateY : 0}px)`
        }}
      >
        {/* Sheet Handle - Draggable Area */}
        <button 
          type="button"
          className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing w-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleMouseDown}
          aria-label="Drag to expand bottom sheet"
        >
          <div className="w-12 h-1 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors" />
        </button>

        {/* Analysis Section - Always visible */}
        <div className="px-5 pb-4">
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 text-lg">✨</span>
            <div>
              <button
                type="button"
                onClick={expandBottomSheet}
                className="flex items-center gap-1 text-white font-medium mb-1 hover:text-gray-300 transition-colors"
              >
                Analysis
                <svg 
                  viewBox="0 0 24 24" 
                  className={`w-4 h-4 transition-transform ${isBottomSheetExpanded ? 'rotate-180' : ''}`}
                  fill="currentColor"
                >
                  <title>Expand</title>
                  <path d="M7 14l5-5 5 5z"/>
                </svg>
              </button>
              <p className="text-white text-sm leading-relaxed">
                The scene of a hackathon taking place in a large space with many participants.
              </p>
              <p className="text-white text-sm mt-2">
                큰 공간에서 다수의 인원이 해커톤 대회를 진행하는 모습
              </p>
            </div>
          </div>
        </div>

        {/* Content Section - Always visible now */}
        <div className="px-5 pt-4 flex-1 overflow-y-auto">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTab === tab
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Voca Section */}
          {selectedTab === 'Voca' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-bold text-white">Voca</h2>
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white">
                  <title>Refresh</title>
                  <path fill="currentColor" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9H21ZM15 23L12 20L9 23L12 20L15 23Z"/>
                </svg>
              </div>

              {/* Vocabulary Grid */}
              <div className="grid grid-cols-2 gap-3 pb-8">
                {vocaWords.map((item, index) => (
                  <button
                    key={`${item.word}-${index}`}
                    type="button"
                    onClick={() => setSelectedVoca(item.word)}
                    className={`relative p-4 rounded-2xl text-left transition-all ${
                      selectedVoca === item.word
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    <span className="font-medium">{item.word}</span>
                    
                    {/* Star Icon */}
                    <div className="absolute top-3 right-3">
                      {item.starred ? (
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-yellow-400 fill-current">
                          <title>Starred</title>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-400 stroke-current fill-none">
                          <title>Not starred</title>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pharase Section */}
          {selectedTab === 'Pharase' && (
            <div className="text-center py-20">
              <p className="text-gray-400">Pharase content coming soon...</p>
            </div>
          )}

          {/* Dialogue Section */}
          {selectedTab === 'Dialogue' && (
            <div className="text-center py-20">
              <p className="text-gray-400">Dialogue content coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}