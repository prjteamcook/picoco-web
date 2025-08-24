'use client';

import { useState, useRef, useEffect } from 'react';

// Declare window.goCamera for React Native bridge
declare global {
  interface Window {
    goCamera?: () => void;
  }
}

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
      image: '/6eeefb626d236d950bb73fdc6e99fcd267aee37b.png',
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

  useEffect(() => {
    // Handle messages from React Native
    const handleMessage = async (event: MessageEvent) => {
      // Ignore messages that are clearly not from RN
      if (!event.data) {
        return;
      }
      
      // Skip very short messages that are likely not image data
      if (typeof event.data === 'string' && event.data.length < 50) {
        return;
      }
      
      try {
        console.log('📱 Received message from RN:', {
          type: typeof event.data,
          length: typeof event.data === 'string' ? event.data.length : 'N/A',
          startsWithData: typeof event.data === 'string' && event.data.startsWith('data:'),
          preview: typeof event.data === 'string' ? event.data.substring(0, 100) : event.data
        });
        let imageData: string = '';
        
        // Try to process the data in different ways
        
        // 1. Check if it's already a complete base64 data URL
        if (typeof event.data === 'string' && event.data.startsWith('data:image/')) {
          console.log('📱 Processing complete base64 data URL');
          imageData = event.data;
        }
        // 2. Check if it's an object with base64 property
        else if (typeof event.data === 'object' && event.data && event.data.base64) {
          console.log('📱 Processing base64 object, creating data URL');
          imageData = `data:image/jpeg;base64,${event.data.base64}`;
        }
        // 3. Check if it's just raw base64 string (without data: prefix)
        else if (typeof event.data === 'string' && event.data.length > 100) {
          console.log('📱 Analyzing potential base64 string:', {
            length: event.data.length,
            firstChars: event.data.substring(0, 10),
            lastChars: event.data.substring(event.data.length - 10),
            hasValidBase64Chars: /^[A-Za-z0-9+/=]*$/.test(event.data),
            lengthMod4: event.data.length % 4
          });
          
          // More flexible base64 detection
          const isBase64Like = /^[A-Za-z0-9+/=]*$/.test(event.data) && 
                               event.data.length > 100 &&
                               (event.data.length % 4 === 0 || event.data.endsWith('=') || event.data.endsWith('=='));
          
          if (isBase64Like) {
            console.log('📱 Processing raw base64 string, adding data URL prefix');
            imageData = `data:image/jpeg;base64,${event.data}`;
          } else {
            console.log('📱 String does not appear to be valid base64');
          }
        }
        // 4. Check if it's a file path
        else if (typeof event.data === 'string' && (event.data.startsWith('/') || event.data.includes('/Users/') || event.data.includes('/Downloads/'))) {
          const filePath = event.data;
          console.log('📱 Processing file path:', filePath);
          
          // Handle file path (keep existing logic but don't return early)
          try {
            const fileUrl = filePath.startsWith('file://') ? filePath : `file://${filePath}`;
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            
            const reader = new FileReader();
            reader.onload = async (e) => {
              const base64Data = e.target?.result as string;
              console.log('📱 Converted file to base64, uploading...');
              
              const uploadResponse = await fetch('/api/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageData: base64Data })
              });
              
              if (uploadResponse.ok) {
                const result = await uploadResponse.json();
                if (result.success && result.sessionId) {
                  window.location.href = `/learn?session=${result.sessionId}`;
                }
              }
            };
            reader.readAsDataURL(blob);
            return; // Early return for file processing
          } catch (error) {
            console.error('File processing failed:', error);
          }
        }
        // 5. Check if it's a URL
        else if (typeof event.data === 'string' && (event.data.startsWith('http://') || event.data.startsWith('https://'))) {
          console.log('📱 Processing URL:', event.data);
          const uploadResponse = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: event.data })
          });
          
          if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            if (result.success && result.sessionId) {
              window.location.href = `/learn?session=${result.sessionId}`;
            }
          }
          return; // Early return for URL processing
        }
        // 6. If nothing matches, try to treat it as base64 anyway
        else if (typeof event.data === 'string' && event.data.length > 100) {
          console.warn('📱 Unknown data format, attempting to treat as base64:', {
            type: typeof event.data,
            length: event.data.length,
            preview: event.data.substring(0, 50)
          });
          
          // Assume it's base64 and add prefix if needed
          imageData = event.data.startsWith('data:') ? event.data : `data:image/jpeg;base64,${event.data}`;
        }
        else {
          console.error('📱 Unsupported data format:', {
            type: typeof event.data,
            length: typeof event.data === 'string' ? event.data.length : 'N/A',
            data: event.data
          });
          throw new Error(`Unsupported data type: ${typeof event.data}`);
        }
        
        // Store base64 data (only if imageData was successfully set)
        if (imageData) {
          console.log('📱 Processing base64 data, size:', imageData.length);
          
          // Try to navigate to learn page first and send image directly
          const pendingSessionId = localStorage.getItem('pendingImageSession');
          if (pendingSessionId) {
            console.log('📱 Sending image directly to learn page');
            const learnUrl = `/learn?session=${pendingSessionId}`;
            console.log('📱 Navigating to:', learnUrl);
            window.location.href = learnUrl;
            
            // Send the image data to the learn page after a short delay
            setTimeout(() => {
              const learnWindow = window.frames[0] || window;
              learnWindow.postMessage(imageData, window.location.origin);
              console.log('📱 Posted message to learn page:', imageData.substring(0, 100));
            }, 500);
            return;
          }
          
          // Fallback: Store in API
          console.log('📱 Storing base64 data in API, size:', imageData.length);
          const uploadResponse = await fetch('/api/image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageData: imageData
            })
          });
          
          if (!uploadResponse.ok) {
            throw new Error(`Server responded with ${uploadResponse.status}`);
          }
          
          const result = await uploadResponse.json();
          console.log('📱 Upload result:', result);
          
          if (result.success && result.sessionId) {
            const learnUrl = `/learn?session=${result.sessionId}`;
            console.log('📱 Navigating to:', learnUrl);
            window.location.href = learnUrl;
          } else {
            throw new Error(result.error || 'Upload failed');
          }
        } else {
          throw new Error('No valid image data could be extracted');
        }
        
      } catch (error) {
        console.error('Failed to process message from RN:', error);
        // Don't show alert for every message error to avoid spam
        console.warn('Skipping message due to processing error');
      }
    };

    // Only listen for window messages, not document messages to avoid conflicts
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

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
    <div className="min-h-screen bg-[#191919] text-white relative max-w-[600px] mx-auto overflow-hidden" suppressHydrationWarning>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-6">
        <img 
          src="/logo.svg" 
          alt="Picoco logo" 
          className="h-8"
        />
        <a href="/calendar" className="w-6 h-6 flex items-center justify-center" aria-label="Calendar">
          <img 
            src="/assets/date_range.svg" 
            alt="Date range" 
            className="w-6 h-6"
          />
        </a>
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
              onClick={() => {
                if (window.goCamera) {
                  try {
                    // Generate a temporary session ID and navigate immediately
                    const tempSessionId = crypto.randomUUID();
                    localStorage.setItem('pendingImageSession', tempSessionId);
                    window.location.href = `/learn?session=${tempSessionId}`;
                    
                    // Call goCamera after navigation
                    setTimeout(() => {
                      if (window.goCamera) {
                        window.goCamera();
                      }
                    }, 100);
                  } catch (error) {
                    console.error('goCamera failed:', error);
                    document.getElementById('camera-input')?.click();
                  }
                } else {
                  document.getElementById('camera-input')?.click();
                }
              }}
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
          <input
            type="file"
            id="camera-input"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              
              if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                  const imageUrl = event.target?.result as string;
                  
                  if (imageUrl) {
                    // Use original image without compression
                    try {
                      const response = await fetch('/api/image', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          imageData: imageUrl // 원본 이미지 그대로 사용
                        })
                      });
                      
                      if (!response.ok) {
                        throw new Error(`Server responded with ${response.status}`);
                      }
                      
                      const result = await response.json();
                      
                      if (result.success && result.sessionId) {
                        // 세션 ID로 learn 페이지로 이동
                        const learnUrl = `/learn?session=${result.sessionId}`;
                        window.location.href = learnUrl;
                      } else {
                        throw new Error(result.error || 'Upload failed');
                      }
                      
                    } catch (error) {
                      console.error('Failed to upload image:', error);
                      
                      // 원본이 너무 크면 압축 버전으로 fallback
                      if ((error as Error).message?.includes('413') || (error as Error).message?.includes('431')) {
                        console.log('Original image too large, trying compressed version...');
                        
                        // 최소한의 압축만 적용
                        const img = new Image();
                        img.onload = async () => {
                          const canvas = document.createElement('canvas');
                          const ctx = canvas.getContext('2d');
                          
                          // 원본 크기 유지, 품질만 약간 압축
                          canvas.width = img.width;
                          canvas.height = img.height;
                          
                          if (ctx) {
                            ctx.imageSmoothingEnabled = true;
                            ctx.imageSmoothingQuality = 'high';
                            ctx.drawImage(img, 0, 0);
                          }
                          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.95); // 95% 품질
                          
                          try {
                            const response = await fetch('/api/image', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                imageData: compressedDataUrl
                              })
                            });
                            
                            if (!response.ok) {
                              throw new Error(`Server responded with ${response.status}`);
                            }
                            
                            const result = await response.json();
                            
                            if (result.success && result.sessionId) {
                              const learnUrl = `/learn?session=${result.sessionId}`;
                              window.location.href = learnUrl;
                            } else {
                              throw new Error(result.error || 'Upload failed');
                            }
                          } catch (fallbackError) {
                            console.error('Fallback also failed:', fallbackError);
                            alert('이미지가 너무 큽니다. 더 작은 이미지를 선택해주세요.');
                          }
                        };
                        
                        img.onerror = () => {
                          console.error('Failed to load image for fallback');
                          alert('이미지 처리에 실패했습니다.');
                        };
                        
                        img.src = imageUrl;
                      } else {
                        alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
                      }
                    }
                  }
                };
                
                reader.onerror = () => {
                  console.error('Failed to read file');
                };
                
                reader.readAsDataURL(file);
              }
            }}
          />
          <button 
            type="button"
            className="w-20 h-20 flex items-center justify-center cursor-pointer" 
            aria-label="Take photo"
            onClick={() => {
              if (window.goCamera) {
                try {
                  // Generate a temporary session ID and navigate immediately
                  const tempSessionId = crypto.randomUUID();
                  localStorage.setItem('pendingImageSession', tempSessionId);
                  window.location.href = `/learn?session=${tempSessionId}`;
                  
                  // Call goCamera after navigation
                  setTimeout(() => {
                    if (window.goCamera) {
                      window.goCamera();
                    }
                  }, 100);
                } catch (error) {
                  console.error('goCamera failed:', error);
                  document.getElementById('camera-input')?.click();
                }
              } else {
                document.getElementById('camera-input')?.click();
              }
            }}
          >
            <img 
              src="/assets/camera.svg" 
              alt="Camera" 
              className="w-20 h-20"
            />
          </button>
        </div>
        
        {/* Bookmark Button - positioned to the right */}
        <button 
          type="button" 
          onClick={() => window.location.href = '/bookmark'}
          className="absolute right-[-120px] w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg" 
          aria-label="Bookmarks"
        >
          <img 
            src="/assets/star.svg" 
            alt="Bookmarks" 
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