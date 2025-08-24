'use client';

import { useState, useRef, useEffect } from 'react';
import { VocaCard } from '@/components/VocaCard';
import { PhraseCard } from '@/components/PhraseCard';
import { DialogueCard } from '@/components/DialogueCard';

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
  const [starredMessages, setStarredMessages] = useState<string[]>([]);
  const [flippedWords, setFlippedWords] = useState<string[]>([]);
  const [flippedPhrases, setFlippedPhrases] = useState<string[]>([]);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Load uploaded image from server session or fallback storage
  useEffect(() => {
    setIsClient(true);
    
    // Listen for messages from RN directly on learn page
    const handleMessage = async (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'string') return;
      
      console.log('📱 Learn page received message from RN:', {
        type: typeof event.data,
        length: event.data.length,
        preview: event.data.substring(0, 100)
      });
      
      // Check if it's a base64 image
      let imageData = '';
      if (event.data.startsWith('data:image/')) {
        imageData = event.data;
      } else if (event.data.length > 100 && /^[A-Za-z0-9+/=]*$/.test(event.data)) {
        imageData = `data:image/jpeg;base64,${event.data}`;
      }
      
      if (imageData) {
        console.log('📱 Setting image directly from RN message');
        setBackgroundImage(imageData);
        setIsLoadingImage(false);
        
        // Clear pending session
        localStorage.removeItem('pendingImageSession');
      }
    };

    window.addEventListener('message', handleMessage);
    
    const loadImage = async () => {
      // Method 1: Check for session ID in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session');
      
      console.log('🔍 Debug: Session ID from URL:', sessionId);
      
      // Check if this is a pending image session (camera was just clicked)
      const pendingSession = localStorage.getItem('pendingImageSession');
      if (pendingSession === sessionId) {
        console.log('🔍 Debug: This is a pending image session, showing loading state');
        setIsLoadingImage(true);
        
        // Auto-clear loading state after 30 seconds
        setTimeout(() => {
          setIsLoadingImage(false);
          console.log('📱 Loading state auto-cleared after 30 seconds');
        }, 30000);
      }
      
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
              console.log('🔍 Debug: Image to use type:', typeof imageToUse);
              console.log('🔍 Debug: Image to use length:', imageToUse?.length);
              console.log('🔍 Debug: Image to use starts with data:', imageToUse?.startsWith('data:'));
              console.log('🔍 Debug: Image to use starts with http:', imageToUse?.startsWith('http'));
              console.log('🔍 Debug: Image to use preview:', `${imageToUse?.substring(0, 100)}...`);
              
              // Validate that the image data is in the correct format
              if (imageToUse && (imageToUse.startsWith('data:image/') || imageToUse.startsWith('http'))) {
                console.log('✅ Valid image format detected, setting background image');
                setBackgroundImage(imageToUse);
                setIsLoadingImage(false);
              } else {
                console.error('❌ Invalid image format:', imageToUse?.substring(0, 50));
                setIsLoadingImage(false);
              }
              
              // Clear pending session
              if (pendingSession === sessionId) {
                localStorage.removeItem('pendingImageSession');
              }
              
              // Try to store in sessionStorage, but don't fail if quota exceeded
              try {
                // Only store if it's not too large (roughly 5MB limit)
                if (imageToUse.length < 5 * 1024 * 1024) {
                  sessionStorage.setItem('currentImage', imageToUse);
                  console.log('🔍 Debug: Stored in sessionStorage');
                } else {
                  console.log('🔍 Debug: Image too large for sessionStorage, skipping');
                }
              } catch (e) {
                console.warn('Failed to store in sessionStorage (quota exceeded):', e);
                // Clear any existing data to free up space
                try {
                  sessionStorage.removeItem('currentImage');
                  sessionStorage.removeItem('uploadedImage');
                } catch (clearError) {
                  console.warn('Failed to clear sessionStorage:', clearError);
                }
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
      try {
        const sessionImage = sessionStorage.getItem('currentImage');
        if (sessionImage) {
          console.log('🔍 Debug: Using sessionStorage image');
          setBackgroundImage(sessionImage);
          return;
        }
      } catch (e) {
        console.warn('Failed to read from sessionStorage:', e);
      }
      
      // Method 3: Fallback to localStorage (legacy support)
      try {
        const localImage = localStorage.getItem('uploadedImage');
        if (localImage) {
          console.log('🔍 Debug: Using localStorage image');
          setBackgroundImage(localImage);
          return;
        }
      } catch (e) {
        console.warn('Failed to read from localStorage:', e);
      }
    };
    
    loadImage();
    
    // Cleanup function
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  
  const tabs = ['Voca', 'Pharase', 'Dialogue'];
  
  const vocaWords = [
    { word: 'lamp', meaning: '램프' },
    { word: 'laptop', meaning: '노트북' },
    { word: 'tote bag', meaning: '토트백' },
    { word: 'hoodie', meaning: '후드티' },
    { word: 'projector', meaning: '프로젝터' }
  ];

  const phrases = [
    { id: 'phrase1', phrase: "There's an outlet under the table.", translation: "테이블 아래에 콘센트가 있어요.", isDark: false },
    { id: 'phrase2', phrase: "멀티탭 같이 써도 될까요?", translation: "Can we share the power strip?", isDark: true },
    { id: 'phrase3', phrase: "I'll be back in five.", translation: "5분 후에 돌아올게요.", isDark: false },
    { id: 'phrase4', phrase: "What's the Wi-Fi and password?", translation: "와이파이와 비밀번호가 뭐예요?", isDark: false },
    { id: 'phrase5', phrase: "Let's sync for five minutes.", translation: "5분간 싱크를 맞춰봐요.", isDark: false },
    { id: 'phrase6', phrase: "We have 10 minutes to demo", translation: "데모할 시간이 10분 있어요.", isDark: false }
  ];

  const dialogueMessages = [
    { id: 'msg1', message: "I'm getting a 401 from the API. Can you sanity-check my headers?", character: 'left' as const, characterImage: '/cha1.svg' },
    { id: 'msg2', message: '"Sure. Did you include the bearer token?"', character: 'right' as const, characterImage: '/cha2.svg' },
    { id: 'msg3', message: "I missed it. Adding now—works!", character: 'left' as const, characterImage: '/cha1.svg' }
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

  const toggleStarMessage = (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
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
        {isClient && backgroundImage && (
          <>
            <img 
              src={backgroundImage}
              alt="Background"
              className="w-full h-full object-cover"
              onError={() => {
                console.error('Image failed to load:', backgroundImage?.substring(0, 100));
                // If image fails to load, just clear it to show the placeholder
                setBackgroundImage('');
              }}
              onLoad={() => {
                console.log('Image loaded successfully');
              }}
            />
            {/* No global overlay - let the image show clearly */}
          </>
        )}
        
        
        {/* Loading or Error message */}
        {isClient && !backgroundImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            {isLoadingImage ? (
              <>
                <img 
                  src="/load.gif" 
                  alt="Loading..." 
                  className="w-16 h-16 mb-4"
                />
                <div className="text-xl mb-2">이미지를 처리 중입니다</div>
                <div className="text-sm text-gray-300 mb-4">잠시만 기다려주세요...</div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoadingImage(false);
                    console.log('📱 Loading state manually cleared');
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  로딩 중단
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">📷</div>
                <div className="text-xl mb-2">이미지를 찾을 수 없습니다</div>
                <div className="text-sm text-gray-300 mb-4">메인 페이지에서 이미지를 업로드해주세요</div>
                <a 
                  href="/main" 
                  className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  메인 페이지로 이동
                </a>
              </>
            )}
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
                  <VocaCard
                    key={`${item.word}-${index}`}
                    word={item.word}
                    meaning={item.meaning}
                    isFlipped={flippedWords.includes(item.word)}
                    isStarred={starredWords.includes(item.word)}
                    onFlip={() => toggleWordFlip(item.word)}
                    onStar={(e) => toggleStar(item.word, e)}
                  />
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
                {phrases.map((item) => (
                  <PhraseCard
                    key={item.id}
                    phrase={item.phrase}
                    translation={item.translation}
                    isFlipped={flippedPhrases.includes(item.phrase)}
                    isStarred={starredPhrases.includes(item.phrase)}
                    isDark={item.isDark}
                    onFlip={() => togglePhraseFlip(item.phrase)}
                    onStar={(e) => togglePhraseStar(item.phrase, e)}
                  />
                ))}
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

              <DialogueCard 
                messages={dialogueMessages}
                onStarMessage={toggleStarMessage}
                starredMessages={starredMessages}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}