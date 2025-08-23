'use client';

import { useState, useRef, useEffect } from 'react';

export default function LearnPage() {
  const [selectedTab, setSelectedTab] = useState('Voca');
  const [selectedVoca, setSelectedVoca] = useState('');
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const [starredWords, setStarredWords] = useState<string[]>([]);
  const [starredPhrases, setStarredPhrases] = useState<string[]>([]);
  const [flippedWords, setFlippedWords] = useState<string[]>([]);
  const [flippedPhrases, setFlippedPhrases] = useState<string[]>([]);
  const [backgroundImage, setBackgroundImage] = useState('/8b3065bd083fb8ac6ae82ceab5042a0d2c23443e.png');
  const [isClient, setIsClient] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Load uploaded image from server session or fallback storage
  useEffect(() => {
    setIsClient(true);
    
    const loadImage = async () => {
      // Method 1: Check for session ID in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session');
      
      console.log('🔍 Debug: Session ID from URL:', sessionId);
      
      if (sessionId) {
        try {
          console.log('🔍 Debug: Fetching from API...');
          const response = await fetch(`/api/image?sessionId=${sessionId}`);
          
          console.log('🔍 Debug: API response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('🔍 Debug: API result:', result);
            
            if (result.success && (result.imageData || result.imageUrl)) {
              const imageToUse = result.imageUrl || result.imageData;
              console.log('🔍 Debug: Image to use:', imageToUse?.substring(0, 100) + '...');
              setBackgroundImage(imageToUse);
              
              // Store in sessionStorage for future navigation
              try {
                sessionStorage.setItem('currentImage', imageToUse);
                console.log('🔍 Debug: Stored in sessionStorage');
              } catch (e) {
                console.error('Failed to store in sessionStorage:', e);
              }
              
              return; // Exit early if successful
            } else {
              console.log('🔍 Debug: No image data in result');
            }
          } else {
            console.log('🔍 Debug: API response not ok');
          }
        } catch (error) {
          console.error('Failed to fetch image from server:', error);
        }
      } else {
        console.log('🔍 Debug: No session ID found');
      }
      
      // Method 2: Fallback to sessionStorage
      const sessionImage = sessionStorage.getItem('currentImage');
      if (sessionImage) {
        setBackgroundImage(sessionImage);
        return;
      }
      
      // Method 3: Fallback to localStorage (legacy support)
      const localImage = localStorage.getItem('uploadedImage');
      if (localImage) {
        setBackgroundImage(localImage);
        return;
      }
    };
    
    loadImage();
  }, []);

  
  const tabs = ['Voca', 'Pharase', 'Dialogue'];
  
  const vocaWords = [
    { word: 'lamp', meaning: '램프' },
    { word: 'laptop', meaning: '노트북' },
    { word: 'tote bag', meaning: '토트백' },
    { word: 'hoodie', meaning: '후드티' },
    { word: 'projector', meaning: '프로젝터' }
  ];

  const toggleStar = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredWords(prev => 
      prev.includes(word) 
        ? prev.filter(w => w !== word)
        : [...prev, word]
    );
  };

  const togglePhraseStar = (phrase: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredPhrases(prev => 
      prev.includes(phrase) 
        ? prev.filter(p => p !== phrase)
        : [...prev, phrase]
    );
  };

  const toggleWordFlip = (word: string) => {
    setFlippedWords(prev => 
      prev.includes(word) 
        ? prev.filter(w => w !== word)
        : [...prev, word]
    );
  };

  const togglePhraseFlip = (phrase: string) => {
    setFlippedPhrases(prev => 
      prev.includes(phrase) 
        ? prev.filter(p => p !== phrase)
        : [...prev, phrase]
    );
  };


  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setDragStartY(clientY);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    
    const deltaY = clientY - dragStartY;
    
    // Allow both upward and downward drag
    setCurrentTranslateY(deltaY);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Determine final state based on drag distance
    if (currentTranslateY < -100) {
      // Dragged up significantly - expand
      setIsBottomSheetExpanded(true);
    } else if (currentTranslateY > 100) {
      // Dragged down significantly - collapse
      setIsBottomSheetExpanded(false);
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

  if (!isClient) {
    return null; // Prevent server-side rendering
  }

  return (
    <div className="min-h-screen bg-[#191919] text-white relative max-w-[600px] mx-auto overflow-hidden">
      {/* Header */}
      <div className="absolute top-12 left-5 z-20">
        <a href="/main" className="w-10 h-10 flex items-center justify-center text-white" aria-label="Home">
          <img 
            src="/assets/home.svg" 
            alt="Home" 
            className="w-10 h-10"
            style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }}
          />
        </a>
      </div>

      {/* Background Image - Top 50vh */}
      <div className="relative h-[55vh] bg-gray-800">
        {isClient && (
          <>
            <img 
              src={backgroundImage}
              alt="Background"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Try to reload from localStorage as fallback
                const uploadedImage = localStorage.getItem('uploadedImage');
                if (uploadedImage && uploadedImage !== backgroundImage) {
                  setBackgroundImage(uploadedImage);
                } else {
                  e.currentTarget.style.display = 'none';
                }
              }}
            />
            {/* No global overlay - let the image show clearly */}
          </>
        )}
        
        {/* Debug info */}
        {isClient && (
          <div className="absolute top-20 left-5 z-30 bg-black bg-opacity-70 text-white p-2 rounded text-xs max-w-[90%]">
            <div>Background Image: {backgroundImage ? backgroundImage.substring(0, 50) + '...' : 'null'}</div>
            <div>Is Data URL: {backgroundImage?.startsWith('data:') ? 'Yes' : 'No'}</div>
            <div>Is File URL: {backgroundImage?.startsWith('file://') ? 'Yes' : 'No'}</div>
            <div>Is HTTP URL: {backgroundImage?.startsWith('http') ? 'Yes' : 'No'}</div>
          </div>
        )}
        
        {/* Error message if no image is loaded */}
        {isClient && (!backgroundImage || (!backgroundImage.startsWith('data:') && !backgroundImage.startsWith('http://') && !backgroundImage.startsWith('https://') && !backgroundImage.startsWith('file://'))) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="text-6xl mb-4">📷</div>
            <div className="text-xl mb-2">이미지를 찾을 수 없습니다</div>
            <div className="text-sm text-gray-300 mb-4">메인 페이지에서 이미지를 업로드해주세요</div>
            <a 
              href="/main" 
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              메인 페이지로 이동
            </a>
          </div>
        )}
        
        {/* Loading indicator */}
        {!isClient && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white">Loading...</div>
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div 
        ref={sheetRef}
        className={`fixed bottom-0 left-1/2 w-full max-w-[600px] bg-[#191919] rounded-t-3xl transition-all duration-300 ease-out z-30 flex flex-col ${
          isBottomSheetExpanded ? 'h-[75vh]' : 'h-[50vh]'
        } ${isDragging ? 'transition-none' : ''}`}
        style={{
          transform: `translateX(-50%) translateY(${isDragging ? currentTranslateY : 0}px)`,
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem'
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
        <div className="px-5 pb-4 flex-shrink-0">
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
        <div 
          className="px-5 pt-4 flex-1 overflow-y-auto min-h-0"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
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
                    onClick={() => toggleWordFlip(item.word)}
                    className={`h-16 p-5 rounded-xl inline-flex justify-start items-center gap-1 transition-all duration-500 transform-gpu ${
                      flippedWords.includes(item.word) ? 'rotateY-180' : ''
                    }`}
                    style={{
                      backgroundColor: flippedWords.includes(item.word) ? '#1F1F21' : '#FAFAFA',
                      transformStyle: 'preserve-3d',
                      transform: flippedWords.includes(item.word) ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    <div className="flex-1 text-left text-base font-medium font-['SUIT'] leading-normal"
                         style={{
                           backfaceVisibility: 'hidden',
                           transform: flippedWords.includes(item.word) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                           color: flippedWords.includes(item.word) ? '#F4F4F4' : '#000000'
                         }}>
                      {flippedWords.includes(item.word) ? item.meaning : item.word}
                    </div>
                    
                    {/* Star Icon */}
                    <div
                      onClick={(e) => toggleStar(item.word, e)}
                      className="w-6 h-6 cursor-pointer"
                    >
                      <img 
                        src={starredWords.includes(item.word) ? "/assets/star.svg" : "/assets/non-star.svg"}
                        alt={starredWords.includes(item.word) ? "Starred" : "Not starred"}
                        className="w-6 h-6"
                      />
                    </div>
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
                <button 
                  type="button"
                  onClick={() => togglePhraseFlip("There's an outlet under the table.")}
                  className="flex items-center justify-start gap-1 p-5 rounded-xl w-full text-left transition-all duration-500"
                  style={{
                    backgroundColor: flippedPhrases.includes("There's an outlet under the table.") ? '#1F1F21' : '#f5f5f5',
                    transformStyle: 'preserve-3d',
                    transform: flippedPhrases.includes("There's an outlet under the table.") ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  <div className="flex-1 text-base font-medium"
                       style={{
                         backfaceVisibility: 'hidden',
                         transform: flippedPhrases.includes("There's an outlet under the table.") ? 'rotateY(180deg)' : 'rotateY(0deg)',
                         color: flippedPhrases.includes("There's an outlet under the table.") ? '#F4F4F4' : '#292a2e'
                       }}>
                    {flippedPhrases.includes("There's an outlet under the table.") ? "테이블 아래에 콘센트가 있어요." : "There's an outlet under the table."}
                  </div>
                  <img 
                    src={starredPhrases.includes("There's an outlet under the table.") ? "/assets/star.svg" : "/assets/non-star.svg"}
                    alt="Star" 
                    className="w-6 h-6"
                    onClick={(e) => togglePhraseStar("There's an outlet under the table.", e)}
                  />
                </button>

                <button 
                  type="button"
                  onClick={() => togglePhraseFlip("멀티탭 같이 써도 될까요?")}
                  className="flex items-center justify-start gap-1 p-5 rounded-xl w-full text-left transition-all duration-500"
                  style={{
                    backgroundColor: flippedPhrases.includes("멀티탭 같이 써도 될까요?") ? '#1F1F21' : '#1f1f21',
                    transformStyle: 'preserve-3d',
                    transform: flippedPhrases.includes("멀티탭 같이 써도 될까요?") ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  <div className="flex-1 text-base font-medium"
                       style={{
                         backfaceVisibility: 'hidden',
                         transform: flippedPhrases.includes("멀티탭 같이 써도 될까요?") ? 'rotateY(180deg)' : 'rotateY(0deg)',
                         color: flippedPhrases.includes("멀티탭 같이 써도 될까요?") ? '#F4F4F4' : 'rgba(244,244,245,0.6)'
                       }}>
                    {flippedPhrases.includes("멀티탭 같이 써도 될까요?") ? "Can we share the power strip?" : "멀티탭 같이 써도 될까요?"}
                  </div>
                  <img 
                    src={starredPhrases.includes("멀티탭 같이 써도 될까요?") ? "/assets/star.svg" : "/assets/non-star.svg"}
                    alt="Star" 
                    className="w-6 h-6"
                    onClick={(e) => togglePhraseStar("멀티탭 같이 써도 될까요?", e)}
                  />
                </button>

                <button 
                  type="button"
                  onClick={() => togglePhraseFlip("I'll be back in five.")}
                  className="flex items-center justify-start gap-1 p-5 rounded-xl w-full text-left transition-all duration-500"
                  style={{
                    backgroundColor: flippedPhrases.includes("I'll be back in five.") ? '#1F1F21' : '#f5f5f5',
                    transformStyle: 'preserve-3d',
                    transform: flippedPhrases.includes("I'll be back in five.") ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  <div className="flex-1 text-base font-medium"
                       style={{
                         backfaceVisibility: 'hidden',
                         transform: flippedPhrases.includes("I'll be back in five.") ? 'rotateY(180deg)' : 'rotateY(0deg)',
                         color: flippedPhrases.includes("I'll be back in five.") ? '#F4F4F4' : '#292a2e'
                       }}>
                    {flippedPhrases.includes("I'll be back in five.") ? "5분 후에 돌아올게요." : "I'll be back in five."}
                  </div>
                  <img 
                    src={starredPhrases.includes("I'll be back in five.") ? "/assets/star.svg" : "/assets/non-star.svg"}
                    alt="Star" 
                    className="w-6 h-6"
                    onClick={(e) => togglePhraseStar("I'll be back in five.", e)}
                  />
                </button>

                <button 
                  type="button"
                  onClick={() => togglePhraseFlip("What's the Wi-Fi and password?")}
                  className="flex items-center justify-start gap-1 p-5 rounded-xl w-full text-left transition-all duration-500"
                  style={{
                    backgroundColor: flippedPhrases.includes("What's the Wi-Fi and password?") ? '#1F1F21' : '#f5f5f5',
                    transformStyle: 'preserve-3d',
                    transform: flippedPhrases.includes("What's the Wi-Fi and password?") ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  <div className="flex-1 text-base font-medium"
                       style={{
                         backfaceVisibility: 'hidden',
                         transform: flippedPhrases.includes("What's the Wi-Fi and password?") ? 'rotateY(180deg)' : 'rotateY(0deg)',
                         color: flippedPhrases.includes("What's the Wi-Fi and password?") ? '#F4F4F4' : '#292a2e'
                       }}>
                    {flippedPhrases.includes("What's the Wi-Fi and password?") ? "와이파이와 비밀번호가 뭐예요?" : "What's the Wi-Fi and password?"}
                  </div>
                  <img 
                    src={starredPhrases.includes("What's the Wi-Fi and password?") ? "/assets/star.svg" : "/assets/non-star.svg"}
                    alt="Star" 
                    className="w-6 h-6"
                    onClick={(e) => togglePhraseStar("What's the Wi-Fi and password?", e)}
                  />
                </button>

                <button 
                  type="button"
                  onClick={() => togglePhraseFlip("Let's sync for five minutes.")}
                  className="flex items-center justify-start gap-1 p-5 rounded-xl w-full text-left transition-all duration-500"
                  style={{
                    backgroundColor: flippedPhrases.includes("Let's sync for five minutes.") ? '#1F1F21' : '#f5f5f5',
                    transformStyle: 'preserve-3d',
                    transform: flippedPhrases.includes("Let's sync for five minutes.") ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  <div className="flex-1 text-base font-medium"
                       style={{
                         backfaceVisibility: 'hidden',
                         transform: flippedPhrases.includes("Let's sync for five minutes.") ? 'rotateY(180deg)' : 'rotateY(0deg)',
                         color: flippedPhrases.includes("Let's sync for five minutes.") ? '#F4F4F4' : '#292a2e'
                       }}>
                    {flippedPhrases.includes("Let's sync for five minutes.") ? "5분간 싱크를 맞춰봐요." : "Let's sync for five minutes."}
                  </div>
                  <img 
                    src={starredPhrases.includes("Let's sync for five minutes.") ? "/assets/star.svg" : "/assets/non-star.svg"}
                    alt="Star" 
                    className="w-6 h-6"
                    onClick={(e) => togglePhraseStar("Let's sync for five minutes.", e)}
                  />
                </button>

                <button 
                  type="button"
                  onClick={() => togglePhraseFlip("We have 10 minutes to demo")}
                  className="flex items-center justify-start gap-1 p-5 rounded-xl w-full text-left transition-all duration-500"
                  style={{
                    backgroundColor: flippedPhrases.includes("We have 10 minutes to demo") ? '#1F1F21' : '#f5f5f5',
                    transformStyle: 'preserve-3d',
                    transform: flippedPhrases.includes("We have 10 minutes to demo") ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  <div className="flex-1 text-base font-medium"
                       style={{
                         backfaceVisibility: 'hidden',
                         transform: flippedPhrases.includes("We have 10 minutes to demo") ? 'rotateY(180deg)' : 'rotateY(0deg)',
                         color: flippedPhrases.includes("We have 10 minutes to demo") ? '#F4F4F4' : '#292a2e'
                       }}>
                    {flippedPhrases.includes("We have 10 minutes to demo") ? "데모할 시간이 10분 있어요." : "We have 10 minutes to demo"}
                  </div>
                  <img 
                    src={starredPhrases.includes("We have 10 minutes to demo") ? "/assets/star.svg" : "/assets/non-star.svg"}
                    alt="Star" 
                    className="w-6 h-6"
                    onClick={(e) => togglePhraseStar("We have 10 minutes to demo", e)}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Dialogue Section */}
          {selectedTab === 'Dialogue' && (
            <div>
              <div className="flex items-center gap-1.5 mb-6">
                <h2 className="text-xl font-bold text-white">Mini dialogues</h2>
                <img 
                  src="/assets/reload.svg" 
                  alt="Refresh" 
                  className="w-5 h-5"
                />
              </div>

              {/* Dialogue Messages */}
              <div className="flex flex-col gap-4 pb-8">
                {/* First message - left side */}
                <div className="flex gap-2 items-start w-full">
                  <div className="flex flex-col gap-2 items-start">
                    <img 
                      src="/cha1.svg" 
                      alt="Character 1" 
                      className="w-[31px] h-[31px]"
                    />
                    <img 
                      src="/assets/non-star.svg" 
                      alt="Star" 
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="bg-neutral-50 px-5 py-2 rounded-bl-[32px] rounded-br-[32px] rounded-tr-[32px] max-w-[271px]">
                    <p className="text-[#292a2e] text-base font-medium leading-6">
                      I'm getting a 401 from the API. Can you sanity-check my headers?
                    </p>
                  </div>
                </div>

                {/* Second message - right side */}
                <div className="flex gap-2 items-start justify-end w-full">
                  <div className="bg-[#303033] px-5 py-2 rounded-bl-[32px] rounded-br-[32px] rounded-tl-[32px] max-w-[282px]">
                    <p className="text-[rgba(244,244,245,0.6)] text-base font-medium leading-6 text-right">
                      "Sure. Did you include the bearer token?"
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <img 
                      src="/cha2.svg" 
                      alt="Character 2" 
                      className="w-[20px] h-[32px]"
                    />
                    <img 
                      src="/assets/non-star.svg" 
                      alt="Star" 
                      className="w-4 h-4"
                    />
                  </div>
                </div>

                {/* Third message - left side */}
                <div className="flex gap-2 items-start w-full">
                  <div className="flex flex-col gap-2 items-start">
                    <img 
                      src="/cha1.svg" 
                      alt="Character 1" 
                      className="w-[31px] h-[31px]"
                    />
                    <img 
                      src="/assets/non-star.svg" 
                      alt="Star" 
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="bg-neutral-50 px-5 py-2 rounded-bl-[32px] rounded-br-[32px] rounded-tr-[32px]">
                    <p className="text-[#292a2e] text-base font-medium leading-6 text-center whitespace-nowrap">
                      I missed it. Adding now—works!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}