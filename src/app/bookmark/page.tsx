'use client';

import { useState, useEffect } from 'react';
import { VocaCard } from '@/components/VocaCard';
import { PhraseCard } from '@/components/PhraseCard';
import { DialogueCard } from '@/components/DialogueCard';

export default function BookmarkPage() {
  const [selectedTab, setSelectedTab] = useState('Voca');
  const [starredVocas, setStarredVocas] = useState<string[]>([]);
  const [starredPhrases, setStarredPhrases] = useState<string[]>([]);
  const [starredDialogues, setStarredDialogues] = useState<string[]>([]);
  const [flippedVocas, setFlippedVocas] = useState<{ [key: string]: boolean }>({});
  const [flippedPhrases, setFlippedPhrases] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Enable scrolling on this page (override global overflow: hidden)
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Load starred items from localStorage
    const loadBookmarks = () => {
      try {
        const savedStarredVocas = localStorage.getItem('starredVocas');
        const savedStarredPhrases = localStorage.getItem('starredPhrases');
        const savedStarredDialogues = localStorage.getItem('starredDialogues');
        
        if (savedStarredVocas) {
          setStarredVocas(JSON.parse(savedStarredVocas));
        }
        if (savedStarredPhrases) {
          setStarredPhrases(JSON.parse(savedStarredPhrases));
        }
        if (savedStarredDialogues) {
          setStarredDialogues(JSON.parse(savedStarredDialogues));
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
  
  // Parse bookmarked items from localStorage
  const parseVocaItems = () => {
    return starredVocas.map(vocaKey => {
      const [word, meaning] = vocaKey.split('|');
      return { word, meaning };
    });
  };

  const parsePhraseItems = () => {
    return starredPhrases.map(phraseKey => {
      const [id, phrase, translation] = phraseKey.split('|');
      return { id, phrase, translation, isDark: false };
    });
  };

  const parseDialogueItems = () => {
    return starredDialogues.map(dialogueKey => {
      const [id, message, character] = dialogueKey.split('|');
      return { 
        id, 
        message, 
        character: character as 'left' | 'right', 
        characterImage: character === 'left' ? '/cha1.svg' : '/cha2.svg' 
      };
    });
  };

  const starredVocaWords = parseVocaItems();
  const starredPhraseItems = parsePhraseItems();
  const starredDialogueMessages = parseDialogueItems();

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

  return (
    <div className="min-h-screen bg-[#191919] text-white relative max-w-[600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-6">
        <a href="/main" className="w-10 h-10 flex items-center justify-center" aria-label="Home">
          <img 
            src="/assets/home.svg" 
            alt="Home" 
            className="w-10 h-10"
            style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }}
          />
        </a>
        <h1 className="text-lg font-bold text-white">Bookmark</h1>
        <div className="w-10 h-10"></div>
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
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-white">Voca</h2>
              <img 
                src="/assets/reload.svg" 
                alt="Refresh" 
                className="w-5 h-5"
                style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }}
              />
            </div>

            {starredVocaWords.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {starredVocaWords.map((item, index) => {
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
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-lg font-medium text-white mb-2">No bookmarked words</h3>
                <p className="text-sm text-gray-400 mb-4">Add words to favorites from the learning page</p>
                <a 
                  href="/main"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Start Learning
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
                {starredPhraseItems.map((item) => {
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
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-white mb-2">No bookmarked phrases</h3>
                <p className="text-sm text-gray-400 mb-4">Add phrases to favorites from the learning page</p>
                <a 
                  href="/main"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Start Learning
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
                onStarMessage={(messageId, e) => {
                  e.stopPropagation();
                  const message = starredDialogueMessages.find(msg => msg.id === messageId);
                  if (message) {
                    handleDialogueStar(messageId, message.message, message.character);
                  }
                }}
                starredMessages={starredDialogues}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-4">💭</div>
                <h3 className="text-lg font-medium text-white mb-2">No bookmarked dialogues</h3>
                <p className="text-sm text-gray-400 mb-4">Add dialogues to favorites from the learning page</p>
                <a 
                  href="/main"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Start Learning
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}