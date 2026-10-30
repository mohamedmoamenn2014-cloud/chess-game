import React from 'react';
import { X, Palette, Volume2, VolumeX, Clock, Sliders, Check } from 'lucide-react';
import { BoardTheme, ComputerDifficulty, TimeControl } from '../types/chess';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardTheme: BoardTheme;
  onSelectBoardTheme: (theme: BoardTheme) => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  soundVolume: number;
  onChangeVolume: (vol: number) => void;
  showCoordinates: boolean;
  onToggleCoordinates: () => void;
  difficulty: ComputerDifficulty;
  onChangeDifficulty: (diff: ComputerDifficulty) => void;
  timeControls: TimeControl[];
  activeTimeControl: TimeControl;
  onSelectTimeControl: (tc: TimeControl) => void;
}

const THEME_OPTIONS: { id: BoardTheme; name: string; lightColor: string; darkColor: string }[] = [
  { id: 'emerald', name: 'Tournament Emerald', lightColor: '#f0d9b5', darkColor: '#367954' },
  { id: 'wood', name: 'Classic Mahogany Wood', lightColor: '#eed5a6', darkColor: '#b88b4a' },
  { id: 'blue', name: 'Modern Steel Blue', lightColor: '#e2e8f0', darkColor: '#4b7399' },
  { id: 'midnight', name: 'Midnight Slate', lightColor: '#94a3b8', darkColor: '#334155' },
  { id: 'charcoal', name: 'Charcoal Obsidian', lightColor: '#a1a1aa', darkColor: '#27272a' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  boardTheme,
  onSelectBoardTheme,
  soundMuted,
  onToggleSound,
  soundVolume,
  onChangeVolume,
  showCoordinates,
  onToggleCoordinates,
  timeControls,
  activeTimeControl,
  onSelectTimeControl
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-zinc-100 text-base">Game Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Board Themes */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
              <Palette className="w-4 h-4 text-amber-500" />
              <span>Board Palette & Finish</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {THEME_OPTIONS.map((th) => (
                <button
                  key={th.id}
                  onClick={() => onSelectBoardTheme(th.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    boardTheme === th.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 border border-zinc-700">
                      <div style={{ backgroundColor: th.lightColor }} />
                      <div style={{ backgroundColor: th.darkColor }} />
                      <div style={{ backgroundColor: th.darkColor }} />
                      <div style={{ backgroundColor: th.lightColor }} />
                    </div>
                    <span className="font-bold">{th.name}</span>
                  </div>
                  {boardTheme === th.id && <Check className="w-4 h-4 text-amber-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Time Controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Time Control</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {timeControls.map((tc) => (
                <button
                  key={tc.id}
                  onClick={() => onSelectTimeControl(tc)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    activeTimeControl.id === tc.id
                      ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500 shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {tc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Controls */}
          <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
                {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                <span>Audio Feedback</span>
              </div>
              <button
                onClick={onToggleSound}
                className={`px-3 py-1 rounded-lg font-bold text-xs ${
                  soundMuted ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-600 text-white'
                }`}
              >
                {soundMuted ? 'Muted' : 'Enabled'}
              </button>
            </div>

            {!soundMuted && (
              <div className="flex items-center gap-3 pt-3">
                <span className="text-zinc-500 text-[11px] font-medium">Volume:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-500"
                />
              </div>
            )}
          </div>

          {/* Board Coordinates */}
          <div className="space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-300">Show Board Coordinates (a-h / 1-8)</span>
              <input
                type="checkbox"
                checked={showCoordinates}
                onChange={onToggleCoordinates}
                className="w-4 h-4 accent-amber-500 rounded"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
