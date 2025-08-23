'use client';

import { useState, useRef } from 'react';

export default function LearnPage() {
  const [selectedTab, setSelectedTab] = useState('Voca');
  const [selectedVoca, setSelectedVoca] = useState('');
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const [starredWords, setStarredWords] = useState<string[]>([]);
  const sheetRef = useRef<HTMLDivElement>(null);
  
  const tabs = ['Voca', 'Pharase', 'Dialogue'];
  
  const vocaWords = [
    { word: 'lamp' },
    { word: '노트북' },
    { word: 'tote bag' },
    { word: 'hoodie' },
    { word: 'projector' }
  ];

  const toggleStar = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredWords(prev => 
      prev.includes(word) 
        ? prev.filter(w => w !== word)
        : [...prev, word]
    );
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
        <button type="button" className="w-10 h-10 flex items-center justify-center text-white" aria-label="Home">
          <img 
            src="/assets/home.svg" 
            alt="Home" 
            className="w-10 h-10"
          />
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
            <img 
              src="/assets/shine.svg" 
              alt="Shine" 
              className="w-6 h-6"
            />
            <div>
              <button
                type="button"
                onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                className="flex items-center gap-1 text-white font-bold mb-1 hover:text-gray-300 transition-colors"
              >
                Analysis
                <img 
                  src={isAnalysisExpanded ? "/assets/down.svg" : "/assets/up.svg"}
                  alt={isAnalysisExpanded ? "Close" : "Open"}
                  className="w-4 h-4"
                />
              </button>
              {isAnalysisExpanded && (
                <div>
                  <p className="text-white text-sm leading-relaxed">
                    The scene of a hackathon taking place in a large space with many participants.
                  </p>
                  <div 
                    className="w-full h-[0.5px] my-2" 
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                  ></div>
                  <p className="text-white text-sm">
                    큰 공간에서 다수의 인원이 해커톤 대회를 진행하는 모습
                  </p>
                </div>
              )}
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
                className={`relative min-w-8 max-h-8 min-h-8 px-3 py-1.5 rounded-md inline-flex justify-center items-center gap-1 overflow-hidden transition-all ${
                  selectedTab === tab
                    ? 'bg-white text-black'
                    : 'text-[#F4F4F4] hover:text-white hover:bg-gray-700'
                }`}
                style={{
                  backgroundColor: selectedTab === tab ? 'white' : '#1F1F21'
                }}
              >
                <div className="flex-1 text-center text-sm font-medium leading-snug">
                  {tab}
                </div>
                <div className="w-14 h-8 left-0 top-0 absolute rounded-md" />
              </button>
            ))}
          </div>

          {/* Voca Section */}
          {selectedTab === 'Voca' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-bold text-white">Voca</h2>
                <img 
                  src="/assets/reload.svg" 
                  alt="Refresh" 
                  className="w-6 h-6"
                />
              </div>

              {/* Vocabulary Grid */}
              <div className="grid grid-cols-2 gap-3 pb-8">
                {vocaWords.map((item, index) => (
                  <button
                    key={`${item.word}-${index}`}
                    type="button"
                    onClick={() => setSelectedVoca(item.word)}
                    className={`h-16 p-5 rounded-xl inline-flex justify-start items-center gap-1 transition-all ${
                      selectedVoca === item.word
                        ? 'bg-white text-black'
                        : 'text-black hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: selectedVoca === item.word ? 'white' : '#FAFAFA'
                    }}
                  >
                    <div className="flex-1 text-left text-base font-medium font-['SUIT'] leading-normal">
                      {item.word}
                    </div>
                    
                    {/* Star Icon */}
                    <button
                      type="button"
                      onClick={(e) => toggleStar(item.word, e)}
                      className="w-6 h-6"
                    >
                      <img 
                        src={starredWords.includes(item.word) ? "/assets/star.svg" : "/assets/non-star.svg"}
                        alt={starredWords.includes(item.word) ? "Starred" : "Not starred"}
                        className="w-6 h-6"
                      />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pharase Section */}
          {selectedTab === 'Pharase' && (
            <div>
              <div className="flex items-center gap-1.5 mb-6">
                <h2 className="text-xl font-bold text-white">Quick Pharases</h2>
                <img 
                  src="/assets/reload.svg" 
                  alt="Refresh" 
                  className="w-5 h-5"
                />
              </div>

              {/* Phrase Cards */}
              <div className="flex flex-col gap-2 pb-8">
                <button className="bg-neutral-50 flex items-center justify-start gap-1 p-5 rounded-xl w-full text-left">
                  <div className="flex-1 text-[#292a2e] text-base font-medium">
                    There's an outlet under the table.
                  </div>
                  <img 
                    src="/assets/non-star.svg" 
                    alt="Star" 
                    className="w-6 h-6"
                  />
                </button>

                <button className="bg-[#1f1f21] flex items-center justify-start gap-1 p-5 rounded-xl w-full text-left">
                  <div className="flex-1 text-[rgba(244,244,245,0.6)] text-base font-medium">
                    멀티탭 같이 써도 될까요?
                  </div>
                  <img 
                    src="/assets/non-star.svg" 
                    alt="Star" 
                    className="w-6 h-6"
                  />
                </button>

                <button className="bg-neutral-50 flex items-center justify-start gap-1 p-5 rounded-xl w-full text-left">
                  <div className="flex-1 text-[#292a2e] text-base font-medium">
                    I'll be back in five.
                  </div>
                  <img 
                    src="/assets/non-star.svg" 
                    alt="Star" 
                    className="w-6 h-6"
                  />
                </button>

                <button className="bg-neutral-50 flex items-center justify-start gap-1 p-5 rounded-xl w-full text-left">
                  <div className="flex-1 text-[#292a2e] text-base font-medium">
                    What's the Wi-Fi and password?
                  </div>
                  <img 
                    src="/assets/non-star.svg" 
                    alt="Star" 
                    className="w-6 h-6"
                  />
                </button>

                <button className="bg-neutral-50 flex items-center justify-start gap-1 p-5 rounded-xl w-full text-left">
                  <div className="flex-1 text-[#292a2e] text-base font-medium">
                    Let's sync for five minutes.
                  </div>
                  <img 
                    src="/assets/non-star.svg" 
                    alt="Star" 
                    className="w-6 h-6"
                  />
                </button>

                <button className="bg-neutral-50 flex items-center justify-start gap-1 p-5 rounded-xl w-full text-left">
                  <div className="flex-1 text-[#292a2e] text-base font-medium">
                    We have 10 minutes to demo
                  </div>
                  <img 
                    src="/assets/non-star.svg" 
                    alt="Star" 
                    className="w-6 h-6"
                  />
                </button>
              </div>
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