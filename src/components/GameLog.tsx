/**
 * Match Activity Log Component
 * Clean chronological feed of rolls, moves, captures, and home achievements.
 */

import React, { useRef, useEffect } from 'react';
import { Swords, Dices, Award, ShieldAlert } from 'lucide-react';
import { LogEntry } from '../types/ludo';
import { COLOR_CONFIG } from '../utils/ludoBoard';

interface GameLogProps {
  logs: LogEntry[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0; // Show latest log at top
    }
  }, [logs]);

  const renderIcon = (type: LogEntry['iconType']) => {
    switch (type) {
      case 'capture':
        return <Swords className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'home':
        return <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'warning':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      case 'dice':
      default:
        return <Dices className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-white/90 rounded-2xl border border-slate-200/90 shadow-sm p-3 sm:p-4 flex flex-col h-44 sm:h-52">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Match Feed
        </h4>
        <span className="text-[11px] text-slate-400">
          Live moves
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs select-none"
      >
        {logs.length === 0 ? (
          <div className="text-slate-400 text-xs italic py-4 text-center">
            Roll the dice to start the game!
          </div>
        ) : (
          logs.map((log) => {
            const colorCfg = COLOR_CONFIG[log.playerColor];
            return (
              <div
                key={log.id}
                className="flex items-start gap-2 text-slate-600 leading-snug animate-fade-in"
              >
                <div className="pt-0.5">{renderIcon(log.iconType)}</div>
                <div className="flex-1 min-w-0">
                  <span
                    className="font-semibold mr-1.5"
                    style={{ color: colorCfg.hex }}
                  >
                    {colorCfg.name}
                  </span>
                  <span className="text-slate-700">{log.message}</span>
                </div>
                <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                  {log.timestamp}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
