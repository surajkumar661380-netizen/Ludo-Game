/**
 * Game Top Bar and Controls
 * Conforms to Top Bar Contract (1 row, 3 clean zones).
 */

import React from 'react';
import { Volume2, VolumeX, RotateCcw, BookOpen, Zap } from 'lucide-react';

interface GameHUDProps {
  isMuted: boolean;
  onToggleMute: () => void;
  speed: 'normal' | 'fast';
  onToggleSpeed: () => void;
  onOpenRules: () => void;
  onNewGame: () => void;
  roundCount: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  isMuted,
  onToggleMute,
  speed,
  onToggleSpeed,
  onOpenRules,
  onNewGame,
  roundCount
}) => {
  return (
    <header className="w-full bg-stone-900 text-white border-b border-stone-800 px-4 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text wordmark in display style */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-amber-400">
            Ludo Master
          </span>
          <span className="hidden sm:inline-block text-xs text-stone-400 font-normal">
            Classic 4-Player Board Game
          </span>
        </div>

        {/* Zone 2: Unboxed round status */}
        <div className="hidden md:flex items-center gap-3 text-xs text-stone-300">
          <span>Match Round <strong className="text-amber-400 tabular-nums">{roundCount}</strong></span>
          <span aria-hidden="true" className="text-stone-600">·</span>
          <span>Authentic Rules</span>
          <span aria-hidden="true" className="text-stone-600">·</span>
          <span>8 Safe Havens</span>
        </div>

        {/* Zone 3: Interactive Controls (Sound, Speed, Rules, New Game) */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute game audio' : 'Mute game audio'}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Speed Toggle */}
          <button
            type="button"
            onClick={onToggleSpeed}
            aria-label={`Toggle speed. Current: ${speed}`}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              speed === 'fast'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
            title="Toggle Animation Speed"
          >
            <Zap className={`w-3.5 h-3.5 ${speed === 'fast' ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span className="hidden sm:inline">{speed === 'fast' ? '2x Fast' : '1x Normal'}</span>
          </button>

          {/* Rules Modal Trigger */}
          <button
            type="button"
            onClick={onOpenRules}
            className="px-3 py-1.5 text-xs font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          {/* New Game Trigger */}
          <button
            type="button"
            onClick={onNewGame}
            className="px-3 py-1.5 text-xs font-medium text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Game</span>
          </button>
        </div>
      </div>
    </header>
  );
};
