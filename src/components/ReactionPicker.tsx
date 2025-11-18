import { useState, useRef } from 'react';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | null;

interface ReactionPickerProps {
  onReact: (reactionType: ReactionType) => void;
  currentReaction: ReactionType;
  disabled?: boolean;
}

const reactions = [
  { type: 'like', emoji: '👍', label: 'Thích', color: 'text-blue-500' },
  { type: 'love', emoji: '❤️', label: 'Yêu thích', color: 'text-red-500' },
  { type: 'haha', emoji: '😂', label: 'Haha', color: 'text-yellow-500' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: 'text-yellow-600' },
  { type: 'sad', emoji: '😢', label: 'Buồn', color: 'text-yellow-700' },
  { type: 'angry', emoji: '😠', label: 'Phẫn nộ', color: 'text-orange-600' }
];

export default function ReactionPicker({ onReact, currentReaction, disabled }: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setShowPicker(true);
  };

  const handleMouseLeave = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowPicker(false);
      setHoveredReaction(null);
    }, 200);  };

  const handleReactionClick = (reactionType: string) => {
    if (disabled) return;
    if (currentReaction === reactionType) {
      onReact(null);
    } else {
      onReact(reactionType as ReactionType);
    }
    setShowPicker(false);
  };

  const getReactionEmoji = (type: ReactionType) => {
    const reaction = reactions.find(r => r.type === type);
    return reaction ? reaction.emoji : '👍';
  };

  const getReactionColor = (type: ReactionType) => {
    const reaction = reactions.find(r => r.type === type);
    return reaction ? reaction.color : 'text-gray-500';
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      
      <button
        onClick={() => !disabled && handleReactionClick(currentReaction || 'like')}
        disabled={disabled}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : currentReaction
            ? `${getReactionColor(currentReaction)} bg-opacity-10 font-semibold`
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <span className="text-lg">{getReactionEmoji(currentReaction)}</span>
        <span className="text-sm">
          {currentReaction 
            ? reactions.find(r => r.type === currentReaction)?.label 
            : 'Thích'}
        </span>
      </button>

      
      {showPicker && !disabled && (
        <div
          className="absolute bottom-full left-0 bg-white rounded-full shadow-2xl border border-gray-200 px-3 py-2 flex items-center gap-1 z-50 animate-scaleIn"
          style={{
            animation: 'scaleIn 0.2s ease-out',
            marginBottom: '8px'
          }}
        >
          {reactions.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReactionClick(reaction.type)}
              onMouseEnter={() => setHoveredReaction(reaction.type)}
              onMouseLeave={() => setHoveredReaction(null)}
              className={`group relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:scale-125 hover:-translate-y-1 ${
                currentReaction === reaction.type ? 'scale-110' : ''
              }`}
            >
              <span className="text-2xl transition-transform duration-200 group-hover:scale-110 cursor-pointer">
                {reaction.emoji}
              </span>
              
              {hoveredReaction === reaction.type && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-[100]">
                  {reaction.label}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
interface ReactionStatsProps {
  stats: {
    like_count: number;
    love_count: number;
    haha_count: number;
    wow_count: number;
    sad_count: number;
    angry_count: number;
    total_reactions: number;
  };
  onClick?: () => void;
}

export function ReactionStats({ stats, onClick }: ReactionStatsProps) {
  const topReactions = Object.entries({
    like: stats.like_count,
    love: stats.love_count,
    haha: stats.haha_count,
    wow: stats.wow_count,
    sad: stats.sad_count,
    angry: stats.angry_count
  })
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  if (stats.total_reactions === 0) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-gray-600 hover:underline"
    >
      <div className="flex -space-x-1">
        {topReactions.map((type) => {
          const reaction = reactions.find(r => r.type === type);
          return reaction ? (
            <span
              key={type}
              className="inline-flex items-center justify-center w-5 h-5 bg-white rounded-full border border-gray-200 text-xs"
            >
              {reaction.emoji}
            </span>
          ) : null;
        })}
      </div>
      <span>{stats.total_reactions}</span>
    </button>
  );
}
