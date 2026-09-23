/**
 * Interactive 3D Ludo Dice Component
 * Realistic 6-sided die with dots, 3D tumbling animation, and color theming.
 */

import React from 'react';
import { PlayerColor } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoBoard';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  playerColor: PlayerColor;
  onRoll: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  canRoll,
  playerColor,
  onRoll,
  size = 'md'
}) => {
  const color = COLOR_CONFIG[playerColor];

  // Dot patterns for values 1-6
  const renderDots = (num: number) => {
    switch (num) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-inner" />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full p-2 flex flex-col justify-between">
            <div className="flex justify-start">
              <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            </div>
            <div className="flex justify-end">
              <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full p-2 flex flex-col justify-between">
            <div className="flex justify-start">
              <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            </div>
            <div className="flex justify-center">
              <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            </div>
            <div className="flex justify-end">
              <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full p-2 grid grid-cols-2 grid-rows-2 gap-1 place-items-center">
            <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full p-2 relative">
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full p-2 grid grid-cols-2 grid-rows-3 gap-1 place-items-center">
            <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
            <span className="w-3 h-3 rounded-full bg-slate-800 shadow-inner" />
          </div>
        );
      default:
        return null;
    }
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg'
  }[size];

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => {
          if (canRoll && !isRolling) {
            onRoll();
          }
        }}
        disabled={!canRoll || isRolling}
        aria-label={`Roll dice for ${color.name}. Current value: ${value ?? 'none'}`}
        className={`
          relative ${sizeClasses} rounded-2xl p-1.5 transition-all duration-200 select-none
          ${canRoll ? 'cursor-pointer hover:scale-105 active:scale-95 ring-4' : 'cursor-default opacity-90'}
          ${canRoll ? color.borderClass : 'border-slate-300'}
          ${canRoll ? 'ring-offset-2 ring-' + playerColor + '-400 shadow-lg' : 'shadow-md'}
          bg-gradient-to-b from-white via-slate-50 to-slate-200 border-2
          border-slate-300 flex items-center justify-center
          ${isRolling ? 'animate-spin' : ''}
        `}
        style={{
          boxShadow: canRoll
            ? `0 10px 25px -5px ${color.hex}40, 0 8px 10px -6px ${color.hex}30, inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -3px 4px rgba(0,0,0,0.15)`
            : '0 4px 6px -1px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 3px rgba(0,0,0,0.1)'
        }}
      >
        {/* Subtle 3D Bevel Edge */}
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-white via-slate-100 to-slate-200 border border-slate-200/80 shadow-inner flex items-center justify-center overflow-hidden">
          {value ? (
            renderDots(value)
          ) : (
            <div className="text-center font-bold text-slate-400 text-xs uppercase tracking-wider">
              Roll
            </div>
          )}
        </div>

        {/* Pulse beacon when human player's turn to roll */}
        {canRoll && !isRolling && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: color.hex }}
            />
            <span
              className="relative inline-flex rounded-full h-4 w-4 shadow-sm border border-white"
              style={{ backgroundColor: color.hex }}
            />
          </span>
        )}
      </button>

      {/* Helper caption */}
      {canRoll && (
        <span className="mt-1 text-[11px] font-semibold text-slate-700 tracking-tight animate-bounce">
          Tap to Roll
        </span>
      )}
    </div>
  );
};
