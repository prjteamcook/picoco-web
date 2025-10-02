'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { VocaCard } from '@/components/VocaCard';
import { PhraseCard } from '@/components/PhraseCard';
import { DialogueCard } from '@/components/DialogueCard';

export default function LearnPage() {
  const [selectedTab, setSelectedTab] = useState('Voca');
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [aiVocaWords, setAiVocaWords] = useState<Array<{word: string, meaning: string}>>([]);
  const [aiPhrases, setAiPhrases] = useState<Array<{id: string, phrase: string, translation: string, isDark: boolean}>>([]);
  const [aiDialogueMessages, setAiDialogueMessages] = useState<Array<{id: string, message: string, character: 'left' | 'right', characterImage: string}>>([]);
  
  // 북마크 상태 관리
  const [starredVocas, setStarredVocas] = useState<string[]>([]);
  const [starredPhrases, setStarredPhrases] = useState<string[]>([]);
  const [starredDialogues, setStarredDialogues] = useState<string[]>([]);
  const [flippedVocas, setFlippedVocas] = useState<{ [key: string]: boolean }>({});
  const [flippedPhrases, setFlippedPhrases] = useState<{ [key: string]: boolean }>({});
  const sheetRef = useRef<HTMLDivElement>(null);

  // 북마크 로컬스토리지에서 로드
  useEffect(() => {
    if (isClient) {
      const savedVocas = localStorage.getItem('starredVocas');
      const savedPhrases = localStorage.getItem('starredPhrases');
      const savedDialogues = localStorage.getItem('starredDialogues');
      
      if (savedVocas) setStarredVocas(JSON.parse(savedVocas));
      if (savedPhrases) setStarredPhrases(JSON.parse(savedPhrases));
      if (savedDialogues) setStarredDialogues(JSON.parse(savedDialogues));
    }
  }, [isClient]);

  // 북마크 핸들러 함수들
  const handleVocaStar = (word: string, meaning: string) => {
    const vocaKey = `${word}|${meaning}`;
    const newStarredVocas = starredVocas.includes(vocaKey)
      ? starredVocas.filter(item => item !== vocaKey)
      : [...starredVocas, vocaKey];
    
    setStarredVocas(newStarredVocas);
    localStorage.setItem('starredVocas', JSON.stringify(newStarredVocas));
  };

  const handlePhraseStar = (id: string, phrase: string, translation: string) => {
    const phraseKey = `${id}|${phrase}|${translation}`;
    const newStarredPhrases = starredPhrases.includes(phraseKey)
      ? starredPhrases.filter(item => item !== phraseKey)
      : [...starredPhrases, phraseKey];
    
    setStarredPhrases(newStarredPhrases);
    localStorage.setItem('starredPhrases', JSON.stringify(newStarredPhrases));
  };

  const handleDialogueStar = (messageId: string, message: string, character: 'left' | 'right') => {
    const dialogueKey = `${messageId}|${message}|${character}`;
    const newStarredDialogues = starredDialogues.includes(dialogueKey)
      ? starredDialogues.filter(item => item !== dialogueKey)
      : [...starredDialogues, dialogueKey];
    
    setStarredDialogues(newStarredDialogues);
    localStorage.setItem('starredDialogues', JSON.stringify(newStarredDialogues));
  };

  // AI analysis function
  const sendToAIAnalysis = useCallback(async (imageData: string) => {
    try {
      console.log('🤖 Starting AI analysis...');
      console.log('🤖 Image data length:', imageData.length);
      
      setIsAnalyzing(true);
      
      // Convert base64 data URL to blob
      const base64Data = imageData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      console.log('🤖 Blob created:', {
        size: blob.size,
        type: blob.type
      });
      
      // Create FormData
        const formData = new FormData();
      formData.append('image', blob, 'analyze-image.jpg');
      
      console.log('🤖 Sending POST request to AI API...');
      console.log('🤖 Request URL: https://englife-server-production.up.railway.app/ai/analyze-image');
      console.log('🤖 FormData keys:', Array.from(formData.keys()));
      
      const response = await fetch('https://englife-server-production.up.railway.app/ai/analyze-image', {
          method: 'POST',
          body: formData
      });
      
      console.log('🤖 AI API response status:', response.status);
      console.log('🤖 AI API response headers:', Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            const errorText = await response.text();
        console.error('🤖 ❌ AI analysis failed:', {
              status: response.status,
              statusText: response.statusText,
              errorText: errorText
            });
        setIsAnalyzing(false);
            return;
          }
          
          const result = await response.json();
      console.log('🤖 ✅ AI analysis result:', result);
      
      // Store analysis result
      setAnalysisResult(result);
      setIsAnalyzing(false);
      
      // Process AI analysis result - update vocabulary, phrases, and dialogues
      console.log('🤖 Processing AI analysis result...');
      
      // Log the complete result structure for debugging
      console.log('🤖 📊 Complete AI result structure:', JSON.stringify(result, null, 2));
      
      // Extract data from nested structure if it exists
      const data = result.data || result;
      console.log('🤖 📊 Working with data:', data);
      
      // Try to find vocabulary data in various possible locations
      let vocabArray = data.extractedWords || data.words || data.vocabulary || data.voca;
      
      // If still not found, look for any array in the result that might contain words
      if (!vocabArray || !Array.isArray(vocabArray)) {
        const possibleArrays = Object.values(result).filter(val => Array.isArray(val));
        console.log('🤖 🔍 Searching for vocabulary in arrays:', possibleArrays);
        
        // Look for arrays that contain word-like objects
        vocabArray = possibleArrays.find((arr: any) => 
          arr.length > 0 && 
          arr.some((item: any) => 
            (typeof item === 'object' && (item.word || item.english || item.korean || item.meaning))
          )
        );
      }
      
      if (vocabArray && Array.isArray(vocabArray)) {
        const vocaData = vocabArray.map((item: any, index: number) => ({
          word: item.word || item.english || item.term || item.text || `Word ${index + 1}`,  // 기본 표시: 영어 단어
          meaning: item.ko || item.korean || item.meaning || item.translation || item.definition || 'No meaning'  // 클릭시 표시: 한글 뜻
        }));
        setAiVocaWords(vocaData);
        console.log('🤖 ✅ Updated Voca data (word: 영어, meaning: 한글):', vocaData);
      } else {
        console.log('🤖 ⚠️ No vocabulary data found in result structure');
      }
      
      // Try to find phrases data in various possible locations
      let phrasesArray = data.generatedExamples || data.examples || data.phrases || data.sentences;
      
      if (!phrasesArray || !Array.isArray(phrasesArray)) {
        const possibleArrays = Object.values(result).filter(val => Array.isArray(val));
        console.log('🤖 🔍 Searching for phrases in arrays:', possibleArrays);
        
        // Look for arrays that contain phrase-like objects (different from vocabulary)
        phrasesArray = possibleArrays.find((arr: any) => 
          arr.length > 0 && 
          arr.some((item: any) => 
            (typeof item === 'object' && (item.example || item.phrase || item.sentence)) ||
            (typeof item === 'string' && item.length > 10) // Assume longer strings are phrases
          )
        );
      }
      
      if (phrasesArray && Array.isArray(phrasesArray)) {
        const phrasesData = phrasesArray.map((item: any, index: number) => ({
          id: `ai-phrase-${index + 1}`,
          phrase: item.english || item.example || item.phrase || item.sentence || item.text || item || `Example ${index + 1}`,
          translation: item.korean || item.translation || item.meaning || 'No translation',
          isDark: index % 2 === 1 // Alternate dark/light
        }));
        setAiPhrases(phrasesData);
        console.log('🤖 ✅ Updated Phrases data:', phrasesData);
      } else {
        console.log('🤖 ⚠️ No phrases data found in result structure');
      }
      
      // Try to find dialogue data in various possible locations
      let dialogueArray = data.scenario?.dialogue || data.scenario || data.dialogue || data.conversations || data.dialogs;
      
      if (!dialogueArray || !Array.isArray(dialogueArray)) {
        const possibleArrays = Object.values(result).filter(val => Array.isArray(val));
        console.log('🤖 🔍 Searching for dialogue in arrays:', possibleArrays);
        
        // Look for arrays that contain dialogue-like objects
        dialogueArray = possibleArrays.find((arr: any) => 
          arr.length > 0 && 
          arr.some((item: any) => 
            (typeof item === 'object' && (item.message || item.dialogue || item.speaker)) ||
            (typeof item === 'string' && item.length > 5) // Assume strings could be dialogue
          )
        );
      }
      
            if (dialogueArray && Array.isArray(dialogueArray)) {
        const dialogueData = dialogueArray.map((item: any, index: number) => ({
          id: `ai-dialogue-${index + 1}`,
          message: item.english || item.message || item.text || item.dialogue || item.content || item || `Message ${index + 1}`,
          character: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
          characterImage: index % 2 === 0 ? '/cha1.svg' : '/cha2.svg'
        }));
        setAiDialogueMessages(dialogueData);
        console.log('🤖 ✅ Updated Dialogue data:', dialogueData);
        } else {
        console.log('🤖 ⚠️ No dialogue data found in result structure');
      }
      
      console.log('🤖 ✅ AI analysis processing completed');
      
    } catch (error) {
      console.error('🤖 ❌ AI analysis request failed:', error);
      console.error('🤖 ❌ Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      setIsAnalyzing(false);
    }
  }, []);

  // Load uploaded image and send to AI analysis
  useEffect(() => {
    setIsClient(true);
    setIsLoadingImage(true);
    
    console.log('🚀 Learn page useEffect started');
    
    const loadImage = async () => {
      // Method 1: Check for session ID in URL parameters (PRIMARY METHOD)
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session');
      
      console.log('🔍 Session ID from URL:', sessionId);
      
      if (sessionId) {
        try {
          console.log('🔍 Fetching image from API...');
          const response = await fetch(`/api/image?sessionId=${sessionId}`);
          
          console.log('🔍 API response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('🔍 API result:', result);
            
            if (result.success && (result.imageData || result.imageUrl)) {
              const imageToUse = result.imageUrl || result.imageData;
              console.log('✅ Using image from API');
              
              // Validate that the image data is in the correct format
              if (imageToUse && (imageToUse.startsWith('data:image/') || imageToUse.startsWith('http'))) {
                console.log('✅ Valid image format detected');
                setBackgroundImage(imageToUse);
                setIsLoadingImage(false);
                
                // Store in sessionStorage for faster future access
                try {
                if (imageToUse.length < 5 * 1024 * 1024) {
                  sessionStorage.setItem('currentImage', imageToUse);
                    console.log('✅ Stored in sessionStorage');
                }
              } catch (e) {
                  console.warn('Failed to store in sessionStorage:', e);
                }
                
                // Send to AI analysis API
                sendToAIAnalysis(imageToUse);
                
                return; // Exit if successful
            } else {
                console.error('❌ Invalid image format:', imageToUse?.substring(0, 50));
            }
          } else {
              console.log('🔍 No image data in API result');
            }
          } else {
            console.log('🔍 API response not ok');
          }
        } catch (error) {
          console.error('Failed to fetch image from API:', error);
        }
      }
      
      // Method 2: Fallback to sessionStorage
      try {
        const sessionImage = sessionStorage.getItem('currentImage');
        if (sessionImage && sessionImage.startsWith('data:image/')) {
          console.log('✅ Using sessionStorage image');
          setBackgroundImage(sessionImage);
          setIsLoadingImage(false);
          
          // Send to AI analysis API
          sendToAIAnalysis(sessionImage);
          
          return;
        }
      } catch (e) {
        console.warn('Failed to read from sessionStorage:', e);
      }
      
      // Method 3: Fallback to localStorage (legacy support)
      try {
        const localImage = localStorage.getItem('uploadedImage');
        if (localImage && localImage.startsWith('data:image/')) {
          console.log('✅ Using localStorage image');
          setBackgroundImage(localImage);
          setIsLoadingImage(false);
          
          // Send to AI analysis API
          sendToAIAnalysis(localImage);
          
          return;
        }
      } catch (e) {
        console.warn('Failed to read from localStorage:', e);
      }
      
      // No image found
      console.log('❌ No image found in any source');
      setIsLoadingImage(false);
    };
    
    loadImage();
    
    // Listen for messages from RN directly on learn page (simplified)
    const handleMessage = async (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'string') return;
      
      console.log('📱 Learn page received message from RN:', {
        type: typeof event.data,
        length: event.data.length,
        preview: event.data.substring(0, 100)
      });
      
      // Check if it's a base64 image and no image is currently loaded
      if (!backgroundImage) {
        let imageData = '';
        if (event.data.startsWith('data:image/')) {
          imageData = event.data;
        } else if (event.data.length > 100 && /^[A-Za-z0-9+/=]*$/.test(event.data)) {
          imageData = `data:image/jpeg;base64,${event.data}`;
        }
        
        if (imageData) {
          console.log('📱 Setting image from RN message');
          setBackgroundImage(imageData);
          setIsLoadingImage(false);
          
          // Store for future use
          try {
            sessionStorage.setItem('currentImage', imageData);
          } catch (e) {
            console.warn('Failed to store RN image:', e);
          }
          
          // Send to AI analysis API
          sendToAIAnalysis(imageData);
          
          // Clear pending session
          localStorage.removeItem('pendingImageSession');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Load existing bookmarks from localStorage
    const loadBookmarks = () => {
      try {
        const savedVocas = localStorage.getItem('starredVocas');
        const savedPhrases = localStorage.getItem('starredPhrases');
        const savedDialogues = localStorage.getItem('starredDialogues');
        
        if (savedVocas) {
          setStarredVocas(JSON.parse(savedVocas));
        }
        if (savedPhrases) {
          setStarredPhrases(JSON.parse(savedPhrases));
        }
        if (savedDialogues) {
          setStarredDialogues(JSON.parse(savedDialogues));
        }
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      }
    };
    
    loadBookmarks();
    
    // Cleanup function
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendToAIAnalysis]);

  
  const tabs = ['Voca', 'Pharase', 'Dialogue'];




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
                
                {/* 디버깅 정보 표시 */}
                <div className="text-xs text-gray-400 mb-4 max-w-md text-center">
                  <div>디버깅 정보:</div>
                  <div>URL sessionId: {new URLSearchParams(window.location.search).get('session') || '없음'}</div>
                  <div>localStorage image: {localStorage.getItem('uploadedImage') ? '있음' : '없음'}</div>
                  <div>sessionStorage image: {sessionStorage.getItem('currentImage') ? '있음' : '없음'}</div>
                  <div>backgroundImage 상태: {backgroundImage ? '설정됨' : '비어있음'}</div>
                  <div>AI 분석 상태: {isAnalyzing ? '분석 중' : analysisResult ? '완료' : '대기 중'}</div>
                </div>
                
                <div className="flex gap-2 mb-4 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('🔍 Manual debug check:');
                      console.log('🔍 URL sessionId:', new URLSearchParams(window.location.search).get('session'));
                      console.log('🔍 localStorage.uploadedImage length:', localStorage.getItem('uploadedImage')?.length || 0);
                      console.log('🔍 sessionStorage.currentImage length:', sessionStorage.getItem('currentImage')?.length || 0);
                      console.log('🔍 backgroundImage state:', backgroundImage);
                      console.log('🔍 isLoadingImage state:', isLoadingImage);
                      console.log('🔍 isAnalyzing state:', isAnalyzing);
                      console.log('🔍 analysisResult state:', analysisResult);
                    }}
                    className="px-3 py-1 bg-green-500 text-white rounded text-xs"
                  >
                    콘솔 디버그
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      console.log('🔧 Attempting manual image recovery...');
                      
                      // Try to recover from localStorage or sessionStorage
                      const storedImage = localStorage.getItem('uploadedImage') || 
                                         sessionStorage.getItem('currentImage');
                                         
                      if (storedImage && storedImage.startsWith('data:image/')) {
                        console.log('🔧 ✅ Found stored image, recovering...');
                        console.log('🔧 Image length:', storedImage.length);
                        setBackgroundImage(storedImage);
                        setIsLoadingImage(false);
                        
                        // Send to AI analysis API
                        sendToAIAnalysis(storedImage);
                        
                        alert('이미지 복구 성공!');
                      } else {
                        console.log('🔧 ❌ No stored image found for recovery');
                        alert('복구할 이미지가 없습니다.');
                      }
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                  >
                    이미지 복구
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      console.log('🔄 Forcing reload...');
                      window.location.reload();
                    }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-xs"
                  >
                    새로고침
                  </button>
                  
                  {analysisResult && (
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🔍 AI Result Structure Analysis:');
                        console.log('🔍 All keys in result:', Object.keys(analysisResult));
                        console.log('🔍 Full result object:', analysisResult);
                        
                        const data = analysisResult.data || analysisResult;
                        console.log('🔍 Data keys:', Object.keys(data));
                        console.log('🔍 Data object:', data);
                        
                        // Check for array properties
                        Object.entries(data).forEach(([key, value]) => {
                          if (Array.isArray(value)) {
                            console.log(`🔍 Array found - ${key}:`, value);
                          }
                        });
                        
                        // Check situationAnalysis
                        if (data.situationAnalysis) {
                          console.log('🔍 situationAnalysis:', data.situationAnalysis);
                        }
                        
                        alert(`Data 키들: ${Object.keys(data).join(', ')}\n\nsituationAnalysis context: ${data.situationAnalysis?.context || 'Not found'}`);
                      }}
                      className="px-3 py-1 bg-purple-500 text-white rounded text-xs"
                    >
                      AI 구조 분석
                    </button>
                  )}
                </div>
                
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
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-white text-sm">AI is extracting words...</p>
                    </div>
                                                      ) : analysisResult ? (
                <div className="space-y-3">
                  {/* 영어 context */}
                  {(analysisResult.data?.situationAnalysis?.context || 
                    analysisResult.situationAnalysis?.context || 
                    analysisResult.data?.situationAnalysis?.situation || 
                    analysisResult.situationAnalysis?.situation || 
                    analysisResult.situation || 
                    analysisResult.description) && (
                  <p className="text-white text-sm leading-relaxed">
                      {analysisResult.data?.situationAnalysis?.context || 
                       analysisResult.situationAnalysis?.context || 
                       analysisResult.data?.situationAnalysis?.situation || 
                       analysisResult.situationAnalysis?.situation || 
                       analysisResult.situation || 
                       analysisResult.description}
                    </p>
                  )}
                  
                  {/* 한국어 koContext */}
                  {(analysisResult.data?.situationAnalysis?.koContext || 
                    analysisResult.situationAnalysis?.koContext) && (
                    <p className="text-white text-sm leading-relaxed">
                      {analysisResult.data?.situationAnalysis?.koContext || 
                       analysisResult.situationAnalysis?.koContext}
                    </p>
                  )}
                  
                  {/* 둘 다 없는 경우 기본 메시지 */}
                  {!(analysisResult.data?.situationAnalysis?.context || 
                     analysisResult.situationAnalysis?.context || 
                     analysisResult.data?.situationAnalysis?.situation || 
                     analysisResult.situationAnalysis?.situation || 
                     analysisResult.situation || 
                     analysisResult.description ||
                     analysisResult.data?.situationAnalysis?.koContext || 
                     analysisResult.situationAnalysis?.koContext) && (
                    <p className="text-white text-sm leading-relaxed">
                      AI 분석이 완료되었습니다.
                    </p>
                  )}
                </div>
                  ) : (
                    <div>
                      <p className="text-white text-sm leading-relaxed">
                        이미지를 업로드하면 AI가 자동으로 분석합니다.
                  </p>
                  <div 
                    className="w-full h-[0.5px] my-2" 
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                  ></div>
                  <p className="text-white text-sm">
                        단어, 구문, 대화를 자동으로 생성합니다.
                  </p>
                    </div>
                  )}
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
                <button
                  type="button"
                  onClick={() => {
                    if (backgroundImage) {
                      console.log('🔄 Reanalyzing image for Voca...');
                      sendToAIAnalysis(backgroundImage);
                    }
                  }}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="Refresh Voca"
                >
                <img 
                  src="/assets/reload.svg" 
                  alt="Refresh" 
                  className="w-6 h-6"
                />
                </button>
              </div>

              {/* Vocabulary Grid */}
              <div className="grid grid-cols-2 gap-3 pb-8">
                {aiVocaWords.length > 0 ? (
                  aiVocaWords.map((item, index) => {
                    const vocaKey = `${item.word}|${item.meaning}`;
                    return (
                      <VocaCard
                        key={`${item.word}-${index}`}
                        word={item.word}
                        meaning={item.meaning}
                        isFlipped={flippedVocas[vocaKey] || false}
                        isStarred={starredVocas.includes(vocaKey)}
                        onFlip={() => {
                          setFlippedVocas(prev => ({
                            ...prev,
                            [vocaKey]: !prev[vocaKey]
                          }));
                        }}
                        onStar={(e) => {
                          e.stopPropagation();
                          handleVocaStar(item.word, item.meaning);
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center text-gray-400 py-8">
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <p>AI가 단어를 추출하고 있습니다...</p>
                      </div>
                    ) : (
                      <p>이미지를 업로드하면 AI가 단어를 추출합니다</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pharase Section */}
          {selectedTab === 'Pharase' && (
            <div>
              <div className="flex items-center gap-1.5 mb-6">
                <h2 className="text-xl font-bold text-white">Quick Pharases</h2>
                <button
                  type="button"
                  onClick={() => {
                    if (backgroundImage) {
                      console.log('🔄 Reanalyzing image for Phrases...');
                      sendToAIAnalysis(backgroundImage);
                    }
                  }}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="Refresh Phrases"
                >
                <img 
                  src="/assets/reload.svg" 
                  alt="Refresh" 
                  className="w-5 h-5"
                />
                </button>
              </div>

              {/* Phrase Cards */}
              <div className="flex flex-col gap-2 pb-8">
                {aiPhrases.length > 0 ? (
                  aiPhrases.map((item) => {
                    const phraseKey = `${item.id}|${item.phrase}|${item.translation}`;
                    return (
                      <PhraseCard
                        key={item.id}
                        phrase={item.phrase}
                        translation={item.translation}
                        isFlipped={flippedPhrases[phraseKey] || false}
                        isStarred={starredPhrases.includes(phraseKey)}
                        isDark={item.isDark}
                        onFlip={() => {
                          setFlippedPhrases(prev => ({
                            ...prev,
                            [phraseKey]: !prev[phraseKey]
                          }));
                        }}
                        onStar={(e) => {
                          e.stopPropagation();
                          handlePhraseStar(item.id, item.phrase, item.translation);
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <p>AI가 예문을 생성하고 있습니다...</p>
                      </div>
                    ) : (
                      <p>이미지를 업로드하면 AI가 예문을 생성합니다</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dialogue Section */}
          {selectedTab === 'Dialogue' && (
            <div>
              <div className="flex items-center gap-1.5 mb-6">
                <h2 className="text-xl font-bold text-white">Mini dialogues</h2>
                <button
                  type="button"
                  onClick={() => {
                    if (backgroundImage) {
                      console.log('🔄 Reanalyzing image for Dialogues...');
                      sendToAIAnalysis(backgroundImage);
                    }
                  }}
                  className="hover:opacity-70 transition-opacity"
                  aria-label="Refresh Dialogues"
                >
                <img 
                  src="/assets/reload.svg" 
                  alt="Refresh" 
                  className="w-5 h-5"
                />
                </button>
              </div>

              {aiDialogueMessages.length > 0 ? (
              <DialogueCard 
                  messages={aiDialogueMessages}
                onStarMessage={(messageId, e) => {
                  e.stopPropagation();
                  const message = aiDialogueMessages.find(msg => msg.id === messageId);
                  if (message) {
                    handleDialogueStar(messageId, message.message, message.character);
                  }
                }}
                starredMessages={starredDialogues}
              />
              ) : (
                <div className="text-center text-gray-400 py-8">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <p>AI가 대화를 생성하고 있습니다...</p>
            </div>
                  ) : (
                    <p>이미지를 업로드하면 AI가 대화를 생성합니다</p>
          )}
        </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}