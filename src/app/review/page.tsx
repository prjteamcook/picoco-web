'use client';

import { useState, useEffect } from 'react';
import { VocaCard } from '@/components/VocaCard';
import { PhraseCard } from '@/components/PhraseCard';
import { DialogueCard } from '@/components/DialogueCard';

export default function BookmarkPage() {
  const [selectedTab, setSelectedTab] = useState('Voca');
  const [starredWords, setStarredWords] = useState<string[]>([]);
  const [starredPhrases, setStarredPhrases] = useState<string[]>([]);
  const [starredMessages, setStarredMessages] = useState<string[]>([]);
  const [flippedWords, setFlippedWords] = useState<string[]>([]);
  const [flippedPhrases, setFlippedPhrases] = useState<string[]>([]);

  useEffect(() => {
    // Enable scrolling on this page (override global overflow: hidden)
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Load starred items from localStorage
    const loadBookmarks = () => {
      try {
        const savedStarredWords = localStorage.getItem('starredWords');
        const savedStarredPhrases = localStorage.getItem('starredPhrases');
        const savedStarredMessages = localStorage.getItem('starredMessages');
        
        if (savedStarredWords) {
          setStarredWords(JSON.parse(savedStarredWords));
        }
        if (savedStarredPhrases) {
          setStarredPhrases(JSON.parse(savedStarredPhrases));
        }
        if (savedStarredMessages) {
          setStarredMessages(JSON.parse(savedStarredMessages));
        }
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      }
    };
    
    loadBookmarks();
    
    // Cleanup: restore original overflow values
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  const tabs = ['Voca', 'Pharase', 'Dialogue'];
  
  // All available vocabulary words with meanings
  const allVocaWords = [
    { word: 'lamp', meaning: '램프' },
    { word: '노트북', meaning: 'laptop' },
    { word: 'tote bag', meaning: '토트백' },
    { word: 'hoodie', meaning: '후드티' },
    { word: 'projector', meaning: '프로젝터' },
    { word: 'keyboard', meaning: '키보드' },
    { word: 'monitor', meaning: '모니터' },
    { word: 'speaker', meaning: '스피커' },
    { word: 'headphones', meaning: '헤드폰' },
    { word: 'mouse', meaning: '마우스' },
    { word: 'tablet', meaning: '태블릿' },
    { word: 'smartphone', meaning: '스마트폰' },
    { word: 'charger', meaning: '충전기' },
    { word: 'cable', meaning: '케이블' },
    { word: 'adapter', meaning: '어댑터' },
    { word: 'router', meaning: '라우터' },
    { word: 'webcam', meaning: '웹캠' },
    { word: 'microphone', meaning: '마이크' }
  ];

  // All available phrases
  const allPhrases = [
    { id: 'phrase1', phrase: "There's an outlet under the table.", translation: "테이블 아래에 콘센트가 있어요.", isDark: false },
    { id: 'phrase2', phrase: "멀티탭 같이 써도 될까요?", translation: "Can we share the power strip?", isDark: true },
    { id: 'phrase3', phrase: "I'll be back in five.", translation: "5분 후에 돌아올게요.", isDark: false },
    { id: 'phrase4', phrase: "What's the Wi-Fi and password?", translation: "와이파이와 비밀번호가 뭐예요?", isDark: false },
    { id: 'phrase5', phrase: "Let's sync for five minutes.", translation: "5분간 싱크를 맞춰봐요.", isDark: false },
    { id: 'phrase6', phrase: "We have 10 minutes to demo", translation: "데모할 시간이 10분 있어요.", isDark: false }
  ];

  // All available dialogue messages
  const allDialogueMessages = [
    { id: 'msg1', message: "I'm getting a 401 from the API. Can you sanity-check my headers?", character: 'left' as const, characterImage: '/cha1.svg' },
    { id: 'msg2', message: '"Sure. Did you include the bearer token?"', character: 'right' as const, characterImage: '/cha2.svg' },
    { id: 'msg3', message: "I missed it. Adding now—works!", character: 'left' as const, characterImage: '/cha1.svg' }
  ];

  // Filter only starred items
  const starredVocaWords = allVocaWords.filter(item => starredWords.includes(item.word));
  const starredPhraseItems = allPhrases.filter(item => starredPhrases.includes(item.phrase));
  const starredDialogueMessages = allDialogueMessages.filter(item => starredMessages.includes(item.id));

  const toggleStar = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStarredWords = starredWords.includes(word) 
      ? starredWords.filter(w => w !== word)
      : [...starredWords, word];
    
    setStarredWords(newStarredWords);
    localStorage.setItem('starredWords', JSON.stringify(newStarredWords));
  };

  const togglePhraseStar = (phrase: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStarredPhrases = starredPhrases.includes(phrase) 
      ? starredPhrases.filter(p => p !== phrase)
      : [...starredPhrases, phrase];
    
    setStarredPhrases(newStarredPhrases);
    localStorage.setItem('starredPhrases', JSON.stringify(newStarredPhrases));
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
    const newStarredMessages = starredMessages.includes(messageId) 
      ? starredMessages.filter(id => id !== messageId)
      : [...starredMessages, messageId];
    
    setStarredMessages(newStarredMessages);
    localStorage.setItem('starredMessages', JSON.stringify(newStarredMessages));
  };

  const toggleWordFlip = (word: string) => {
    setFlippedWords(prev => 
      prev.includes(word) 
        ? prev.filter(w => w !== word)
        : [...prev, word]
    );
  };

  return (
    <div className="min-h-screen bg-[#191919] text-white relative max-w-[600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-6">
        <a href="/main" className="w-6 h-6 flex items-center justify-center" aria-label="Home">
          <img 
            src="/assets/home.svg" 
            alt="Home" 
            className="w-6 h-6"
            style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }}
          />
        </a>
        <h1 className="text-lg font-bold text-white">Bookmark</h1>
        <div className="w-6 h-6"></div>
      </div>

      {/* Content */}
      <div className="px-5 py-3">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedTab === tab
                  ? 'bg-white text-[#292a2e]'
                  : 'bg-[#1f1f21] text-[rgba(244,244,245,0.6)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Voca Section */}
        {selectedTab === 'Voca' && (
          <div>
            <div className="flex items-center gap-1.5 mb-4">
              <h2 className="text-lg font-bold text-white">Bookmarked Vocabulary</h2>
              <img 
                src="/assets/reload.svg" 
                alt="Refresh" 
                className="w-5 h-5"
              />
            </div>

            {starredVocaWords.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {starredVocaWords.map((item, index) => (
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
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-lg font-medium text-white mb-2">북마크된 단어가 없습니다</h3>
                <p className="text-sm text-gray-400 mb-4">학습 페이지에서 단어를 즐겨찾기에 추가해보세요</p>
                <a 
                  href="/main"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  학습하러 가기
                </a>
              </div>
            )}
          </div>
        )}

        {/* Phrase Section */}
        {selectedTab === 'Pharase' && (
          <div>
            <div className="flex items-center gap-1.5 mb-4">
              <h2 className="text-lg font-bold text-white">Bookmarked Phrases</h2>
              <img 
                src="/assets/reload.svg" 
                alt="Refresh" 
                className="w-5 h-5"
              />
            </div>

            {starredPhraseItems.length > 0 ? (
              <div className="flex flex-col gap-2">
                {starredPhraseItems.map((item) => (
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
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-white mb-2">북마크된 구문이 없습니다</h3>
                <p className="text-sm text-gray-400 mb-4">학습 페이지에서 구문을 즐겨찾기에 추가해보세요</p>
                <a 
                  href="/main"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  학습하러 가기
                </a>
              </div>
            )}
          </div>
        )}

        {/* Dialogue Section */}
        {selectedTab === 'Dialogue' && (
          <div>
            <div className="flex items-center gap-1.5 mb-4">
              <h2 className="text-lg font-bold text-white">Bookmarked Dialogues</h2>
              <img 
                src="/assets/reload.svg" 
                alt="Refresh" 
                className="w-5 h-5"
              />
            </div>

            {starredDialogueMessages.length > 0 ? (
              <DialogueCard 
                messages={starredDialogueMessages}
                onStarMessage={toggleStarMessage}
                starredMessages={starredMessages}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-4">💭</div>
                <h3 className="text-lg font-medium text-white mb-2">북마크된 대화가 없습니다</h3>
                <p className="text-sm text-gray-400 mb-4">학습 페이지에서 대화를 즐겨찾기에 추가해보세요</p>
                <a 
                  href="/main"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  학습하러 가기
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}