import React from 'react';
import { X, Sparkles, Crown, Swords, Shuffle, Check } from 'lucide-react';
import { GameVariant } from '../types/chess';

interface GameVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVariant: GameVariant;
  onSelectVariant: (v: GameVariant) => void;
}

const VARIANTS_LIST: {
  id: GameVariant;
  title: string;
  icon: any;
  desc: string;
}[] = [
  {
    id: 'standard',
    title: 'Standard Chess',
    icon: Swords,
    desc: 'Official FIDE standard rules with castling, en passant and pawn promotion.'
  },
  {
    id: 'chess960',
    title: 'Chess960 (Fischer Random)',
    icon: Shuffle,
    desc: 'Randomized back-rank layout eliminating opening preparation and testing pure tactics.'
  },
  {
    id: 'king_of_the_hill',
    title: 'King of the Hill',
    icon: Crown,
    desc: 'Classic rules, plus bringing your King to any of the four center squares (d4, e4, d5, e5) wins immediately!'
  },
  {
    id: 'three_check',
    title: 'Three-Check Chess',
    icon: Sparkles,
    desc: 'First player to deliver 3 checks to the opponent’s king wins the match instantly.'
  }
];

export const GameVariantsModal: React.FC<GameVariantsModalProps> = ({
  isOpen,
  onClose,
  selectedVariant,
  onSelectVariant
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-zinc-100 text-base">Chess Variants</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Variants List */}
        <div className="p-5 overflow-y-auto space-y-2.5 text-xs">
          {VARIANTS_LIST.map((v) => {
            const Icon = v.icon;
            const isSelected = selectedVariant === v.id;
            return (
              <button
                key={v.id}
                onClick={() => {
                  onSelectVariant(v.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div
                  className={`p-2 rounded-lg mt-0.5 ${
                    isSelected ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-100">{v.title}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-500" />}
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed">{v.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
