/**
 * Player Card Component
 * Displays player status, token progress, active turn glow, and dice interaction.
 */

import React from 'react';
import { Bot, User, Trophy, Shield } from 'lucide-react';
import { Player, TurnPhase, GameMode } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoBoard';
import { Dice } from './Dice';

interface PlayerCardProps {
  player: Player;
  isCurrentTurn: boolean;
  turnPhase: TurnPhase;
  currentDiceValue: number | null;
  isRolling: boolean;
  onRollDice: () => void;
  canRoll: boolean;
  gameMode?: GameMode;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isCurrentTurn,
  turnPhase: _turnPhase,
  currentDiceValue,
  isRolling,
  onRollDice,
  canRoll,
  gameMode = '4player'
}) => {
  const colorCfg = COLOR_CONFIG[player.color];

  // Count tokens in various stages
  const homeCount = player.tokens.filter((t) => t.step === 56).length;
  const inYardCount = player.tokens.filter((t) => t.step === -1).length;
  const onTrackCount = 4 - homeCount - inYardCount;

  return (
    <div
      className={`
        relative rounded-xl p-3 sm:p-4 transition-all duration-300 border
        ${
          isCurrentTurn
            ? `bg-white shadow-xl ring-2 ${colorCfg.borderClass} ${colorCfg.glowClass}`
            : 'bg-white/80 border-slate-200/80 shadow-sm opacity-90'
        }
      `}
    >
      {/* Turn indicator glow stripe */}
      {isCurrentTurn && (
        <div
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl"
          style={{ backgroundColor: colorCfg.hex }}
        />
      )}

      {/* Header: Player Name, Type, Team, and Rank */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-4 h-4 rounded-full shadow-inner shrink-0"
            style={{ backgroundColor: colorCfg.hex }}
          />
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">
            {player.name}
          </h3>
          {gameMode === '2vs2' && player.team && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
              player.team === 'team-alpha' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {player.team === 'team-alpha' ? 'Team A' : 'Team B'}
            </span>
          )}
          {player.type === 'bot' ? (
            <span className="flex items-center text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
              <Bot className="w-3 h-3 mr-0.5" /> Bot
            </span>
          ) : (
            <span className="flex items-center text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
              <User className="w-3 h-3 mr-0.5" /> You
            </span>
          )}
        </div>

        {/* Finished rank badge if player finished */}
        {player.rank && (
          <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>#{player.rank}</span>
          </div>
        )}
      </div>

      {/* Token Progress Bar & Metrics */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Home: <strong className="tabular-nums text-slate-900">{homeCount}/4</strong></span>
          </span>
          <span className="text-[11px] text-slate-400">
            Yard: {inYardCount} · Track: {onTrackCount}
          </span>
        </div>

        {/* 4-segment progress bar */}
        <div className="grid grid-cols-4 gap-1 h-2 bg-slate-100 rounded-full p-0.5 border border-slate-200">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-colors duration-300 ${
                i < homeCount ? colorCfg.bgClass : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Dice Area when it is this player's active turn */}
      {isCurrentTurn && !player.rank && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {player.type === 'bot' ? (
              <span className="italic">Bot deciding move...</span>
            ) : canRoll ? (
              <span className="font-medium text-slate-700">Your Turn to Roll!</span>
            ) : (
              <span className="text-slate-600">Choose a highlighted token</span>
            )}
          </div>
          <Dice
            value={currentDiceValue}
            isRolling={isRolling}
            canRoll={canRoll && player.type === 'human'}
            playerColor={player.color}
            onRoll={onRollDice}
            size="sm"
          />
        </div>
      )}
    </div>
  );
};
