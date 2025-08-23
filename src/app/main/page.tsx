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

  useEffect(() => {
    // Handle messages from React Native
    const handleMessage = async (event: MessageEvent) => {
      if (event.data) {
        try {
          console.log('📱 Received message from RN:', typeof event.data, event.data);
          let imageData: string;
          
          // Check if data is already base64 (data:image/...)
          if (typeof event.data === 'string' && event.data.startsWith('data:image/')) {
            console.log('📱 Processing complete base64 data URL');
            imageData = event.data;
          } 
          // Check if data is an object with base64 data
          else if (typeof event.data === 'object' && event.data.base64) {
            console.log('📱 Processing base64 object, creating data URL');
            imageData = `data:image/jpeg;base64,${event.data.base64}`;
          }
          // Handle local file paths or URLs
          else if (typeof event.data === 'string') {
            const filePath = event.data;
            console.log('📱 Received path/URL from RN:', filePath);
            
            // Check if it's a local file path (starts with / or contains file path patterns)
            if (filePath.startsWith('/') || filePath.includes('/Users/') || filePath.includes('/Downloads/')) {
              try {
                console.log('📱 Converting local file path to base64...');
                // Convert file path to file:// URL for fetch
                const fileUrl = filePath.startsWith('file://') ? filePath : `file://${filePath}`;
                const response = await fetch(fileUrl);
                const blob = await response.blob();
                
                const reader = new FileReader();
                reader.onload = async (e) => {
                  const base64Data = e.target?.result as string;
                  console.log('📱 Converted local file to base64, size:', base64Data.length);
                  
                  // Store base64 data
                  const uploadResponse = await fetch('/api/image', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      imageData: base64Data
                    })
                  });
                  
                  if (!uploadResponse.ok) {
                    throw new Error(`Server responded with ${uploadResponse.status}`);
                  }
                  
                  const result = await uploadResponse.json();
                  
                  if (result.success && result.sessionId) {
                    const learnUrl = `/learn?session=${result.sessionId}`;
                    window.location.href = learnUrl;
                  } else {
                    throw new Error(result.error || 'Upload failed');
                  }
                };
                
                reader.onerror = () => {
                  console.error('Failed to read file blob');
                  alert('파일을 읽을 수 없습니다.');
                };
                
                reader.readAsDataURL(blob);
                return;
                
              } catch (fetchError) {
                console.error('Failed to fetch local file:', fetchError);
                alert('로컬 파일에 접근할 수 없습니다.');
                return;
              }
            } else {
              // For http/https URLs, store URL directly
              const uploadResponse = await fetch('/api/image', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  imageUrl: filePath
                })
              });
              
              if (!uploadResponse.ok) {
                throw new Error(`Server responded with ${uploadResponse.status}`);
              }
              
              const result = await uploadResponse.json();
              
              if (result.success && result.sessionId) {
                const learnUrl = `/learn?session=${result.sessionId}`;
                window.location.href = learnUrl;
              } else {
                throw new Error(result.error || 'Upload failed');
              }
              return;
            }
          } 
          else {
            throw new Error('Unsupported data format from RN');
          }
          
          // Store base64 data
          console.log('📱 Storing base64 data, size:', imageData.length);
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
          
        } catch (error) {
          console.error('Failed to process message from RN:', error);
          alert('이미지 처리에 실패했습니다.');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage as unknown as EventListener);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage as unknown as EventListener);
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
    <div className="min-h-screen bg-[#191919] text-white relative max-w-[600px] mx-auto overflow-hidden">
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
                    window.goCamera();
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
                  window.goCamera();
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
