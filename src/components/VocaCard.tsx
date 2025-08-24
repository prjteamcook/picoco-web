import type React from 'react';

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
    <div className="relative h-14 rounded-xl overflow-hidden">
      {/* Front side (word) */}
      <div
        className={`absolute inset-0 p-4 rounded-xl flex justify-between items-center transition-all duration-500 ${
          isFlipped ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
        style={{ backgroundColor: '#FAFAFA' }}
      >
        <button
          type="button"
          className="flex-1 text-left text-base font-medium font-['SUIT'] leading-normal text-[#000000] cursor-pointer bg-transparent border-none p-0"
          onClick={onFlip}
        >
          {word}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStar(e);
          }}
          className="w-6 h-6 cursor-pointer bg-transparent border-none p-0"
          aria-label={isStarred ? "Remove from favorites" : "Add to favorites"}
        >
          <img 
            src={isStarred ? "/assets/star.svg" : "/assets/non-star.svg"}
            alt={isStarred ? "Starred" : "Not starred"}
            className="w-6 h-6"
          />
        </button>
      </div>

      {/* Back side (meaning) */}
      <div
        className={`absolute inset-0 p-4 rounded-xl flex justify-between items-center transition-all duration-500 ${
          isFlipped ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        style={{ backgroundColor: '#1F1F21' }}
      >
        <button
          type="button"
          className="flex-1 text-left text-base font-medium font-['SUIT'] leading-normal text-[#F4F4F4] cursor-pointer bg-transparent border-none p-0"
          onClick={onFlip}
        >
          {meaning}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStar(e);
          }}
          className="w-6 h-6 cursor-pointer bg-transparent border-none p-0"
          aria-label={isStarred ? "Remove from favorites" : "Add to favorites"}
        >
          <img 
            src={isStarred ? "/assets/star.svg" : "/assets/non-star.svg"}
            alt={isStarred ? "Starred" : "Not starred"}
            className="w-6 h-6"
            style={{ filter: 'brightness(0) saturate(100%) invert(96%) sepia(1%) saturate(526%) hue-rotate(202deg) brightness(99%) contrast(96%)' }}
          />
        </button>
      </div>
    </div>
  );
};