import type React from 'react';

interface DialogueMessage {
  id: string;
  message: string;
  character: 'left' | 'right';
  characterImage: string;
  isStarred?: boolean;
}

interface DialogueCardProps {
  messages: DialogueMessage[];
  onStarMessage: (messageId: string, e: React.MouseEvent) => void;
  starredMessages: string[];
}

export const DialogueCard: React.FC<DialogueCardProps> = ({
  messages,
  onStarMessage,
  starredMessages,
}) => {
  return (
    <div className="flex flex-col gap-4 pb-8">
      {messages.map((msg) => {
        const isStarred = starredMessages.includes(msg.id);
        
        if (msg.character === 'left') {
          return (
            <div key={msg.id} className="flex gap-2 items-start w-full">
              <div className="flex flex-col gap-2 items-start">
                <img 
                  src={msg.characterImage} 
                  alt="Character" 
                  className="w-[31px] h-[31px]"
                />
                <button
                  type="button"
                  onClick={(e) => onStarMessage(msg.id, e)}
                  className="w-4 h-4 cursor-pointer bg-transparent border-none p-0"
                  aria-label={isStarred ? "Remove from favorites" : "Add to favorites"}
                >
                  <img 
                    src={isStarred ? "/assets/star.svg" : "/assets/non-star.svg"}
                    alt="Star" 
                    className="w-4 h-4"
                  />
                </button>
              </div>
              <div className="bg-neutral-50 px-5 py-2 rounded-bl-[32px] rounded-br-[32px] rounded-tr-[32px] max-w-[271px]">
                <p className="text-[#292a2e] text-base font-medium leading-6">
                  {msg.message}
                </p>
              </div>
            </div>
          );
        } else {
          return (
            <div key={msg.id} className="flex gap-2 items-start justify-end w-full">
              <div className="bg-[#303033] px-5 py-2 rounded-bl-[32px] rounded-br-[32px] rounded-tl-[32px] max-w-[282px]">
                <p className="text-[rgba(244,244,245,0.6)] text-base font-medium leading-6 text-right">
                  {msg.message}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <img 
                  src={msg.characterImage} 
                  alt="Character" 
                  className="w-[20px] h-[32px]"
                />
                <button
                  type="button"
                  onClick={(e) => onStarMessage(msg.id, e)}
                  className="w-4 h-4 cursor-pointer bg-transparent border-none p-0"
                  aria-label={isStarred ? "Remove from favorites" : "Add to favorites"}
                >
                  <img 
                    src={isStarred ? "/assets/star.svg" : "/assets/non-star.svg"}
                    alt="Star" 
                    className="w-4 h-4"
                    style={{ filter: 'brightness(0) saturate(100%) invert(96%) sepia(1%) saturate(526%) hue-rotate(202deg) brightness(99%) contrast(96%)' }}
                  />
                </button>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};