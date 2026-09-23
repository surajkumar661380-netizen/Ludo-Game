/**
 * Victory Celebration & Match Summary Modal
 * Handles Free-for-all, 1v1 Duel, and 2 vs 2 Team Victories.
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Swords, Dices, Users2 } from 'lucide-react';
import { Player, GameMode } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoBoard';

interface VictoryModalProps {
  isOpen: boolean;
  players: Player[];
  gameMode: GameMode;
  onPlayAgain: () => void;
  onNewSetup: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  players,
  gameMode,
  onPlayAgain,
  onNewSetup
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 60,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 60,
            origin: { x: 1 }
          });
        }, 300);
      } catch {
        // Fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activePlayers = players.filter((p) => p.isActive);

  // In 2vs2 team mode
  if (gameMode === '2vs2') {
    const teamAlpha = activePlayers.filter((p) => p.team === 'team-alpha');
    const teamBeta = activePlayers.filter((p) => p.team === 'team-beta');

    const alphaHome = teamAlpha.reduce(
      (sum, p) => sum + p.tokens.filter((t) => t.step === 56).length,
      0
    );
    const betaHome = teamBeta.reduce(
      (sum, p) => sum + p.tokens.filter((t) => t.step === 56).length,
      0
    );

    const winningTeam = alphaHome >= 8 ? 'Team Alpha (Red & Yellow)' : betaHome >= 8 ? 'Team Beta (Green & Blue)' : alphaHome >= betaHome ? 'Team Alpha (Red & Yellow)' : 'Team Beta (Green & Blue)';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-center p-6 sm:p-8">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 animate-bounce">
            <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-amber-500 fill-amber-400" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
            <Users2 className="w-3.5 h-3.5" />
            <span>2 vs 2 Team Championship</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-1">
            {winningTeam} Wins!
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mb-6">
            Both teammates worked together to bring all 8 tokens into Home!
          </p>

          {/* Team Scores */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3.5 rounded-2xl border border-amber-300 bg-amber-50/70 text-left">
              <div className="font-bold text-xs text-amber-900 mb-1">Team Alpha (Red + Yellow)</div>
              <div className="text-2xl font-black text-amber-700 tabular-nums">
                {alphaHome}/8 <span className="text-xs font-normal text-stone-500">tokens home</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/50 text-left">
              <div className="font-bold text-xs text-blue-900 mb-1">Team Beta (Green + Blue)</div>
              <div className="text-2xl font-black text-blue-700 tabular-nums">
                {betaHome}/8 <span className="text-xs font-normal text-stone-500">tokens home</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onNewSetup}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Change Mode
            </button>
            <button
              type="button"
              onClick={onPlayAgain}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rematch</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Free for all & 1 vs 1
  const sortedPlayers = [...activePlayers].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    const aHome = a.tokens.filter((t) => t.step === 56).length;
    const bHome = b.tokens.filter((t) => t.step === 56).length;
    return bHome - aHome;
  });

  const winner = sortedPlayers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-center p-6 sm:p-8">
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 animate-bounce">
          <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-amber-500 fill-amber-400" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-1">
          {winner ? `${winner.name} Wins!` : 'Match Finished!'}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mb-6">
          All four tokens arrived safely in Home!
        </p>

        {/* Podium Standings */}
        <div className="space-y-2 mb-6">
          {sortedPlayers.map((player, idx) => {
            const colorCfg = COLOR_CONFIG[player.color];
            const homeCount = player.tokens.filter((t) => t.step === 56).length;
            const rankLabel =
              idx === 0 ? '1st Place 🏆' : idx === 1 ? '2nd Place 🥈' : idx === 2 ? '3rd Place 🥉' : '4th Place';

            return (
              <div
                key={player.color}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  idx === 0
                    ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-4 h-4 rounded-full shadow-inner shrink-0"
                    style={{ backgroundColor: colorCfg.hex }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-xs sm:text-sm text-stone-800 truncate">
                      {player.name}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {homeCount}/4 tokens home · {player.stats.captures} captures
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold text-stone-700 whitespace-nowrap pl-2">
                  {rankLabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlight Stats */}
        {winner && (
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-700 text-xs mb-6">
            <div>
              <div className="flex items-center justify-center gap-1 text-stone-400 mb-0.5">
                <Dices className="w-3.5 h-3.5" />
                <span>Rolls</span>
              </div>
              <strong className="text-sm font-bold text-stone-900 tabular-nums">
                {winner.stats.rolls}
              </strong>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-stone-400 mb-0.5">
                <Swords className="w-3.5 h-3.5" />
                <span>Captures</span>
              </div>
              <strong className="text-sm font-bold text-stone-900 tabular-nums">
                {winner.stats.captures}
              </strong>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-stone-400 mb-0.5">
                <span className="font-bold">6s</span>
                <span>Rolled</span>
              </div>
              <strong className="text-sm font-bold text-stone-900 tabular-nums">
                {winner.stats.sixes}
              </strong>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onNewSetup}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Change Mode
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
