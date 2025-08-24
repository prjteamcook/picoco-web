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
    <button 
      type="button"
      onClick={onFlip}
      className="flex items-center justify-start gap-1 p-5 rounded-xl w-full text-left transition-all duration-500"
      style={{
        backgroundColor: isFlipped ? '#1F1F21' : (isDark ? '#1f1f21' : '#f5f5f5'),
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}
    >
      <div className="flex-1 text-base font-medium"
           style={{
             backfaceVisibility: 'hidden',
             transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
             color: isFlipped 
               ? '#F4F4F4' 
               : (isDark ? 'rgba(244,244,245,0.6)' : '#292a2e')
           }}>
        {isFlipped ? translation : phrase}
      </div>
      <img 
        src={isStarred ? "/assets/star.svg" : "/assets/non-star.svg"}
        alt="Star" 
        className="w-6 h-6"
        onClick={onStar}
      />
    </button>
  );
};