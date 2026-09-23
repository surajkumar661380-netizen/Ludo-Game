/**
 * Match Setup Modal
 * Supports 1 vs 1 (Duel), 2 vs 2 (Team Battle), and 4-Player (Free-for-All).
 */

import React, { useState } from 'react';
import { Bot, User, Play, Swords, Users2, ShieldAlert } from 'lucide-react';
import { Player, PlayerColor, PlayerType, BotDifficulty, GameMode } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoBoard';

interface GameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (playersConfig: Player[], selectedMode: GameMode) => void;
  currentPlayers: Player[];
  currentMode: GameMode;
}

export const GameSetupModal: React.FC<GameSetupModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  currentPlayers,
  currentMode
}) => {
  const [mode, setMode] = useState<GameMode>(currentMode);

  const [playerConfigs, setPlayerConfigs] = useState<
    Record<PlayerColor, { name: string; type: PlayerType; difficulty: BotDifficulty }>
  >(() => {
    const init: Record<PlayerColor, { name: string; type: PlayerType; difficulty: BotDifficulty }> = {
      red: { name: 'Player 1', type: 'human', difficulty: 'smart' },
      green: { name: 'Green Bot', type: 'bot', difficulty: 'smart' },
      yellow: { name: 'Yellow Bot', type: 'bot', difficulty: 'smart' },
      blue: { name: 'Blue Bot', type: 'bot', difficulty: 'smart' }
    };
    currentPlayers.forEach((p) => {
      init[p.color] = {
        name: p.name,
        type: p.type,
        difficulty: p.botDifficulty || 'smart'
      };
    });
    return init;
  });

  if (!isOpen) return null;

  const handleStart = () => {
    let activeColors: PlayerColor[] = [];
    if (mode === '1vs1') {
      activeColors = ['red', 'yellow'];
    } else {
      activeColors = ['red', 'green', 'yellow', 'blue'];
    }

    const allColors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

    const newPlayers: Player[] = allColors.map((color) => {
      const cfg = playerConfigs[color];
      const isActive = activeColors.includes(color);

      // In 2vs2 mode: Red & Yellow are Team Alpha, Green & Blue are Team Beta
      let team: Player['team'] = undefined;
      if (mode === '2vs2') {
        team = color === 'red' || color === 'yellow' ? 'team-alpha' : 'team-beta';
      }

      return {
        id: `player-${color}`,
        color,
        name: cfg.name,
        type: cfg.type,
        botDifficulty: cfg.difficulty,
        isActive,
        team,
        consecutiveSixes: 0,
        tokens: [
          { id: 0, color, step: -1 },
          { id: 1, color, step: -1 },
          { id: 2, color, step: -1 },
          { id: 3, color, step: -1 }
        ],
        stats: {
          rolls: 0,
          sixes: 0,
          captures: 0,
          tokensHome: 0
        }
      };
    });

    onStartGame(newPlayers, mode);
    onClose();
  };

  const setPreset = (presetType: string) => {
    if (presetType === '1v1_bot') {
      setMode('1vs1');
      setPlayerConfigs({
        red: { name: 'You (Red)', type: 'human', difficulty: 'smart' },
        green: { name: 'Green Bot', type: 'bot', difficulty: 'smart' },
        yellow: { name: 'Yellow Bot', type: 'bot', difficulty: 'smart' },
        blue: { name: 'Blue Bot', type: 'bot', difficulty: 'smart' }
      });
    } else if (presetType === '1v1_human') {
      setMode('1vs1');
      setPlayerConfigs({
        red: { name: 'Player 1 (Red)', type: 'human', difficulty: 'smart' },
        green: { name: 'Green Bot', type: 'bot', difficulty: 'smart' },
        yellow: { name: 'Player 2 (Yellow)', type: 'human', difficulty: 'smart' },
        blue: { name: 'Blue Bot', type: 'bot', difficulty: 'smart' }
      });
    } else if (presetType === '2v2_solo') {
      setMode('2vs2');
      setPlayerConfigs({
        red: { name: 'You (Red)', type: 'human', difficulty: 'smart' },
        green: { name: 'Enemy Green', type: 'bot', difficulty: 'smart' },
        yellow: { name: 'Partner Yellow', type: 'bot', difficulty: 'smart' },
        blue: { name: 'Enemy Blue', type: 'bot', difficulty: 'smart' }
      });
    } else if (presetType === '4p_solo') {
      setMode('4player');
      setPlayerConfigs({
        red: { name: 'You (Red)', type: 'human', difficulty: 'smart' },
        green: { name: 'Green Bot', type: 'bot', difficulty: 'smart' },
        yellow: { name: 'Yellow Bot', type: 'bot', difficulty: 'smart' },
        blue: { name: 'Blue Bot', type: 'bot', difficulty: 'smart' }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Configure Ludo Match</h2>
            <p className="text-xs text-stone-500">Choose game mode, team battle, and bots</p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Game Mode Selection */}
          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-2">
              Game Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* 1 vs 1 */}
              <button
                type="button"
                onClick={() => setMode('1vs1')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === '1vs1'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-sm ring-1 ring-amber-500'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50/50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <Swords className="w-3.5 h-3.5 text-amber-600" />
                  <span>1 vs 1 Duel</span>
                </div>
                <div className="text-[11px] text-stone-500 leading-tight">
                  Red vs Yellow head-to-head showdown
                </div>
              </button>

              {/* 2 vs 2 Teams */}
              <button
                type="button"
                onClick={() => setMode('2vs2')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === '2vs2'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-sm ring-1 ring-amber-500'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50/50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <Users2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>2 vs 2 Teams</span>
                </div>
                <div className="text-[11px] text-stone-500 leading-tight">
                  Team Red/Yellow vs Team Green/Blue
                </div>
              </button>

              {/* 4-Player Free-for-all */}
              <button
                type="button"
                onClick={() => setMode('4player')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === '4player'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-sm ring-1 ring-amber-500'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50/50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>4-Player FFA</span>
                </div>
                <div className="text-[11px] text-stone-500 leading-tight">
                  Every player for themselves (Classic)
                </div>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-2">
              Popular Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPreset('1v1_bot')}
                className="p-2 rounded-lg border border-stone-200 hover:border-amber-400 bg-stone-50 text-left text-xs font-medium text-stone-800"
              >
                1v1 vs Bot
              </button>
              <button
                type="button"
                onClick={() => setPreset('1v1_human')}
                className="p-2 rounded-lg border border-stone-200 hover:border-amber-400 bg-stone-50 text-left text-xs font-medium text-stone-800"
              >
                1v1 (2 Humans)
              </button>
              <button
                type="button"
                onClick={() => setPreset('2v2_solo')}
                className="p-2 rounded-lg border border-stone-200 hover:border-amber-400 bg-stone-50 text-left text-xs font-medium text-stone-800"
              >
                2v2 (You + Bot)
              </button>
              <button
                type="button"
                onClick={() => setPreset('4p_solo')}
                className="p-2 rounded-lg border border-stone-200 hover:border-amber-400 bg-stone-50 text-left text-xs font-medium text-stone-800"
              >
                4P vs 3 Bots
              </button>
            </div>
          </div>

          {/* Player Slots */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-stone-600 block">
              Player Slots ({mode === '1vs1' ? '2 Players' : '4 Players'})
            </label>

            {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
              const cfg = COLOR_CONFIG[color];
              const isSlotActive = mode === '1vs1' ? color === 'red' || color === 'yellow' : true;

              if (!isSlotActive) return null;

              const current = playerConfigs[color];
              const teamLabel =
                mode === '2vs2'
                  ? color === 'red' || color === 'yellow'
                    ? 'Team Alpha'
                    : 'Team Beta'
                  : null;

              return (
                <div
                  key={color}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-stone-200 bg-stone-50/70"
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0 shadow-inner"
                    style={{ backgroundColor: cfg.hex }}
                  />

                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <input
                      type="text"
                      value={current.name}
                      onChange={(e) =>
                        setPlayerConfigs((prev) => ({
                          ...prev,
                          [color]: { ...prev[color], name: e.target.value }
                        }))
                      }
                      className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder={`${cfg.name} Name`}
                    />
                    {teamLabel && (
                      <span className="text-[10px] whitespace-nowrap font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        {teamLabel}
                      </span>
                    )}
                  </div>

                  {/* Human vs Bot Toggle */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setPlayerConfigs((prev) => ({
                          ...prev,
                          [color]: { ...prev[color], type: 'human' }
                        }))
                      }
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                        current.type === 'human'
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      <User className="w-3 h-3" /> Human
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPlayerConfigs((prev) => ({
                          ...prev,
                          [color]: { ...prev[color], type: 'bot' }
                        }))
                      }
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                        current.type === 'bot'
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      <Bot className="w-3 h-3" /> Bot
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="px-6 py-2 text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-colors flex items-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-amber-950" />
            <span>Start Match</span>
          </button>
        </div>
      </div>
    </div>
  );
};
