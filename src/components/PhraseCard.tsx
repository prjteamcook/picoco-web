import React from 'react';

interface PhraseCardProps {
  phrase: string;
  translation: string;
  isFlipped: boolean;
  isStarred: boolean;
  isDark?: boolean;
  onFlip: () => void;
  onStar: (e: React.MouseEvent) => void;
}

export const PhraseCard: React.FC<PhraseCardProps> = ({
  phrase,
  translation,
  isFlipped,
  isStarred,
  isDark = false,
  onFlip,
  onStar,
}) => {
  return (
    <div className="relative h-16 rounded-xl overflow-hidden w-full">
      {/* Front side (phrase) */}
      <button 
        type="button"
        onClick={onFlip}
        className={`absolute inset-0 p-5 rounded-xl flex justify-between items-center transition-all duration-500 w-full ${
          isFlipped ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
        style={{ backgroundColor: isDark ? '#1f1f21' : '#f5f5f5' }}
      >
        <div className="flex-1 text-left text-base font-medium"
             style={{
               color: isDark ? 'rgba(244,244,245,0.6)' : '#292a2e'
             }}>
          {phrase}
        </div>
        <div
          onClick={onStar}
          className="w-6 h-6 cursor-pointer"
        >
          <img 
            src={isStarred ? "/assets/star.svg" : "/assets/non-star.svg"}
            alt="Star" 
            className="w-6 h-6"
            style={isDark ? { filter: 'brightness(0) saturate(100%) invert(96%) sepia(1%) saturate(526%) hue-rotate(202deg) brightness(99%) contrast(96%)' } : {}}
          />
        </div>
      </button>

      {/* Back side (translation) */}
      <button 
        type="button"
        onClick={onFlip}
        className={`absolute inset-0 p-5 rounded-xl flex justify-between items-center transition-all duration-500 w-full ${
          isFlipped ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        style={{ backgroundColor: '#1F1F21' }}
      >
        <div className="flex-1 text-left text-base font-medium text-[#F4F4F4]">
          {translation}
        </div>
        <div
          onClick={onStar}
          className="w-6 h-6 cursor-pointer"
        >
          <img 
            src={isStarred ? "/assets/star.svg" : "/assets/non-star.svg"}
            alt="Star" 
            className="w-6 h-6"
            style={{ filter: 'brightness(0) saturate(100%) invert(96%) sepia(1%) saturate(526%) hue-rotate(202deg) brightness(99%) contrast(96%)' }}
          />
        </div>
      </button>
    </div>
  );
};