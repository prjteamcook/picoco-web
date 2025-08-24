import React from 'react';

interface VocaCardProps {
  word: string;
  meaning: string;
  isFlipped: boolean;
  isStarred: boolean;
  onFlip: () => void;
  onStar: (e: React.MouseEvent) => void;
}

export const VocaCard: React.FC<VocaCardProps> = ({
  word,
  meaning,
  isFlipped,
  isStarred,
  onFlip,
  onStar,
}) => {
  return (
    <button
      type="button"
      onClick={onFlip}
      className={`h-16 p-5 rounded-xl inline-flex justify-start items-center gap-1 transition-all duration-500 transform-gpu ${
        isFlipped ? 'rotateY-180' : ''
      }`}
      style={{
        backgroundColor: isFlipped ? '#1F1F21' : '#FAFAFA',
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}
    >
      <div className="flex-1 text-left text-base font-medium font-['SUIT'] leading-normal"
           style={{
             backfaceVisibility: 'hidden',
             transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
             color: isFlipped ? '#F4F4F4' : '#000000'
           }}>
        {isFlipped ? meaning : word}
      </div>
      
      <div
        onClick={onStar}
        className="w-6 h-6 cursor-pointer"
      >
        <img 
          src={isStarred ? "/assets/star.svg" : "/assets/non-star.svg"}
          alt={isStarred ? "Starred" : "Not starred"}
          className="w-6 h-6"
        />
      </div>
    </button>
  );
};