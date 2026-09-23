/**
 * Authentic 15x15 Classic Ludo Board
 * Vector SVG implementation with responsive scaling, authentic safe star icons,
 * colored home stretches, and interactive 3D tokens.
 */

import React, { useMemo } from 'react';
import { Player, PlayerColor, MoveOption } from '../types/ludo';
import {
  COLOR_CONFIG,
  SAFE_TRACK_INDICES,
  START_TRACK_INDICES,
  getTokenCoordinate
} from '../utils/ludoBoard';

interface LudoBoardProps {
  players: Player[];
  activeColor: PlayerColor;
  legalMoves: MoveOption[];
  onTokenClick: (color: PlayerColor, tokenId: number) => void;
  animatingToken?: { color: PlayerColor; tokenId: number; step: number } | null;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  players,
  activeColor,
  legalMoves,
  onTokenClick,
  animatingToken
}) => {
  // Set of token keys currently moveable
  const moveableTokenKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const move of legalMoves) {
      keys.add(`${activeColor}-${move.tokenId}`);
    }
    return keys;
  }, [legalMoves, activeColor]);

  // Compute position and group tokens on same square for stacking offsets
  const tokenDisplayList = useMemo(() => {
    interface TokenDisplay {
      key: string;
      color: PlayerColor;
      tokenId: number;
      step: number;
      row: number;
      col: number;
      isMoveable: boolean;
      totalOnSquare: number;
      squareIndex: number;
    }

    const map = new Map<string, TokenDisplay[]>();

    for (const player of players) {
      if (!player.isActive) continue;

      for (const token of player.tokens) {
        // If this token is currently animating, use animated step
        const currentStep =
          animatingToken &&
          animatingToken.color === token.color &&
          animatingToken.tokenId === token.id
            ? animatingToken.step
            : token.step;

        const coord = getTokenCoordinate(token.color, token.id, currentStep);
        // Round to 1 decimal place to group tokens on same cell
        const cellKey = `${Math.round(coord.row * 10) / 10}_${Math.round(coord.col * 10) / 10}`;

        const item: TokenDisplay = {
          key: `${token.color}-${token.id}`,
          color: token.color,
          tokenId: token.id,
          step: currentStep,
          row: coord.row,
          col: coord.col,
          isMoveable: moveableTokenKeys.has(`${token.color}-${token.id}`),
          totalOnSquare: 1,
          squareIndex: 0
        };

        if (!map.has(cellKey)) {
          map.set(cellKey, []);
        }
        map.get(cellKey)!.push(item);
      }
    }

    const result: TokenDisplay[] = [];
    map.forEach((items) => {
      const count = items.length;
      items.forEach((item, idx) => {
        item.totalOnSquare = count;
        item.squareIndex = idx;
        result.push(item);
      });
    });

    return result;
  }, [players, animatingToken, moveableTokenKeys]);

  // Calculate pixel-exact offset for stacked tokens
  const calculateOffset = (total: number, index: number) => {
    if (total <= 1) return { dx: 0, dy: 0 };
    if (total === 2) {
      const offsets = [
        { dx: -0.16, dy: -0.16 },
        { dx: 0.16, dy: 0.16 }
      ];
      return offsets[index % 2];
    }
    if (total === 3) {
      const offsets = [
        { dx: 0, dy: -0.18 },
        { dx: -0.18, dy: 0.16 },
        { dx: 0.18, dy: 0.16 }
      ];
      return offsets[index % 3];
    }
    // 4 or more tokens
    const offsets = [
      { dx: -0.18, dy: -0.18 },
      { dx: 0.18, dy: -0.18 },
      { dx: -0.18, dy: 0.18 },
      { dx: 0.18, dy: 0.18 }
    ];
    return offsets[index % 4];
  };

  return (
    <div className="relative w-full max-w-[580px] aspect-square select-none mx-auto">
      {/* Outer Luxury Wooden Frame */}
      <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-br from-amber-950 via-amber-900 to-stone-950 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-amber-800/80 pointer-events-none">
        {/* Brass Corner Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-amber-400/70 border border-amber-300 shadow" />
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-amber-400/70 border border-amber-300 shadow" />
        <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-amber-400/70 border border-amber-300 shadow" />
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-amber-400/70 border border-amber-300 shadow" />
      </div>

      {/* Main Board SVG (15x15 Coordinate Grid) */}
      <svg
        viewBox="0 0 15 15"
        className="relative w-full h-full rounded-xl bg-white shadow-inner overflow-hidden border border-slate-300"
      >
        <defs>
          {/* Safe Star Symbol */}
          <g id="star-icon">
            <polygon
              points="0,-0.32 0.09,-0.1 0.32,-0.1 0.14,0.05 0.2,0.27 0,0.14 -0.2,0.27 -0.14,0.05 -0.32,-0.1 -0.09,-0.1"
              fill="#d97706"
              stroke="#92400e"
              strokeWidth="0.02"
              className="drop-shadow"
            />
          </g>

          {/* Token Gradient definitions */}
          <radialGradient id="token-red" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>
          <radialGradient id="token-green" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="40%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </radialGradient>
          <radialGradient id="token-yellow" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
          <radialGradient id="token-blue" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="40%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>

          {/* Yard dock shadow */}
          <filter id="inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx="0" dy="0.05" />
            <feGaussianBlur stdDeviation="0.04" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="black" floodOpacity="0.2" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>

        {/* 1. Base Grid Tiles (15x15) */}
        {Array.from({ length: 15 }).map((_, r) =>
          Array.from({ length: 15 }).map((_, c) => {
            // Check if cell is in one of the 4 corner houses (6x6)
            const isRedHouse = r < 6 && c < 6;
            const isGreenHouse = r < 6 && c >= 9;
            const isYellowHouse = r >= 9 && c >= 9;
            const isBlueHouse = r >= 9 && c < 6;
            // Check if in center (rows 6..8, cols 6..8)
            const isCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;

            // Skip corner houses and center triangles here (rendered specially below)
            if (isRedHouse || isGreenHouse || isYellowHouse || isBlueHouse || isCenter) {
              return null;
            }

            // Determine if cell is a home path
            const isRedHome = r === 7 && c >= 1 && c <= 5;
            const isGreenHome = c === 7 && r >= 1 && r <= 5;
            const isYellowHome = r === 7 && c >= 9 && c <= 13;
            const isBlueHome = c === 7 && r >= 9 && r <= 13;

            // Determine if start square
            const isRedStart = r === 6 && c === 1;
            const isGreenStart = r === 1 && c === 8;
            const isYellowStart = r === 8 && c === 13;
            const isBlueStart = r === 13 && c === 6;

            // Determine if star safe square
            const isStarSquare =
              (r === 2 && c === 6) ||
              (r === 6 && c === 12) ||
              (r === 12 && c === 8) ||
              (r === 8 && c === 2) ||
              isRedStart ||
              isGreenStart ||
              isYellowStart ||
              isBlueStart;

            let fillColor = '#ffffff';
            if (isRedHome || isRedStart) fillColor = COLOR_CONFIG.red.lightHex;
            if (isGreenHome || isGreenStart) fillColor = COLOR_CONFIG.green.lightHex;
            if (isYellowHome || isYellowStart) fillColor = COLOR_CONFIG.yellow.lightHex;
            if (isBlueHome || isBlueStart) fillColor = COLOR_CONFIG.blue.lightHex;

            return (
              <g key={`tile-${r}-${c}`}>
                <rect
                  x={c}
                  y={r}
                  width={1}
                  height={1}
                  fill={fillColor}
                  stroke="#cbd5e1"
                  strokeWidth="0.02"
                />

                {/* Star on safe tiles */}
                {isStarSquare && (
                  <use
                    href="#star-icon"
                    x={c + 0.5}
                    y={r + 0.5}
                    transform={isRedStart || isGreenStart || isYellowStart || isBlueStart ? 'scale(1.15)' : 'scale(1)'}
                  />
                )}

                {/* Entry Arrow Indicators */}
                {r === 7 && c === 0 && (
                  <polygon
                    points="0.2,0.3 0.8,0.5 0.2,0.7"
                    fill={COLOR_CONFIG.red.hex}
                  />
                )}
                {r === 0 && c === 7 && (
                  <polygon
                    points="0.3,0.2 0.5,0.8 0.7,0.2"
                    transform="translate(7, 0)"
                    fill={COLOR_CONFIG.green.hex}
                  />
                )}
                {r === 7 && c === 14 && (
                  <polygon
                    points="0.8,0.3 0.2,0.5 0.8,0.7"
                    transform="translate(14, 7)"
                    fill={COLOR_CONFIG.yellow.hex}
                  />
                )}
                {r === 14 && c === 7 && (
                  <polygon
                    points="0.3,0.8 0.5,0.2 0.7,0.8"
                    transform="translate(7, 14)"
                    fill={COLOR_CONFIG.blue.hex}
                  />
                )}
              </g>
            );
          })
        )}

        {/* 2. Four Corner Houses (6x6 each) */}
        {/* Red House (Top-Left) */}
        <g id="house-red">
          <rect x={0} y={0} width={6} height={6} fill={COLOR_CONFIG.red.hex} stroke="#b91c1c" strokeWidth="0.04" />
          <rect x={1} y={1} width={4} height={4} rx={0.6} fill="#ffffff" stroke="#fecaca" strokeWidth="0.04" />
          {/* 4 Token Docks */}
          {[
            { cx: 1.8, cy: 1.8 },
            { cx: 1.8, cy: 4.2 },
            { cx: 4.2, cy: 1.8 },
            { cx: 4.2, cy: 4.2 }
          ].map((dock, idx) => (
            <g key={`dock-red-${idx}`}>
              <circle cx={dock.cx} cy={dock.cy} r={0.7} fill={COLOR_CONFIG.red.lightHex} stroke={COLOR_CONFIG.red.hex} strokeWidth="0.04" />
              <circle cx={dock.cx} cy={dock.cy} r={0.45} fill="#ffffff" opacity={0.8} />
            </g>
          ))}
        </g>

        {/* Green House (Top-Right) */}
        <g id="house-green">
          <rect x={9} y={0} width={6} height={6} fill={COLOR_CONFIG.green.hex} stroke="#047857" strokeWidth="0.04" />
          <rect x={10} y={1} width={4} height={4} rx={0.6} fill="#ffffff" stroke="#a7f3d0" strokeWidth="0.04" />
          {[
            { cx: 10.8, cy: 1.8 },
            { cx: 10.8, cy: 4.2 },
            { cx: 13.2, cy: 1.8 },
            { cx: 13.2, cy: 4.2 }
          ].map((dock, idx) => (
            <g key={`dock-green-${idx}`}>
              <circle cx={dock.cx} cy={dock.cy} r={0.7} fill={COLOR_CONFIG.green.lightHex} stroke={COLOR_CONFIG.green.hex} strokeWidth="0.04" />
              <circle cx={dock.cx} cy={dock.cy} r={0.45} fill="#ffffff" opacity={0.8} />
            </g>
          ))}
        </g>

        {/* Yellow House (Bottom-Right) */}
        <g id="house-yellow">
          <rect x={9} y={9} width={6} height={6} fill={COLOR_CONFIG.yellow.hex} stroke="#b45309" strokeWidth="0.04" />
          <rect x={10} y={10} width={4} height={4} rx={0.6} fill="#ffffff" stroke="#fde68a" strokeWidth="0.04" />
          {[
            { cx: 10.8, cy: 10.8 },
            { cx: 10.8, cy: 13.2 },
            { cx: 13.2, cy: 10.8 },
            { cx: 13.2, cy: 13.2 }
          ].map((dock, idx) => (
            <g key={`dock-yellow-${idx}`}>
              <circle cx={dock.cx} cy={dock.cy} r={0.7} fill={COLOR_CONFIG.yellow.lightHex} stroke={COLOR_CONFIG.yellow.hex} strokeWidth="0.04" />
              <circle cx={dock.cx} cy={dock.cy} r={0.45} fill="#ffffff" opacity={0.8} />
            </g>
          ))}
        </g>

        {/* Blue House (Bottom-Left) */}
        <g id="house-blue">
          <rect x={0} y={9} width={6} height={6} fill={COLOR_CONFIG.blue.hex} stroke="#1d4ed8" strokeWidth="0.04" />
          <rect x={1} y={10} width={4} height={4} rx={0.6} fill="#ffffff" stroke="#bfdbfe" strokeWidth="0.04" />
          {[
            { cx: 1.8, cy: 10.8 },
            { cx: 1.8, cy: 13.2 },
            { cx: 4.2, cy: 10.8 },
            { cx: 4.2, cy: 13.2 }
          ].map((dock, idx) => (
            <g key={`dock-blue-${idx}`}>
              <circle cx={dock.cx} cy={dock.cy} r={0.7} fill={COLOR_CONFIG.blue.lightHex} stroke={COLOR_CONFIG.blue.hex} strokeWidth="0.04" />
              <circle cx={dock.cx} cy={dock.cy} r={0.45} fill="#ffffff" opacity={0.8} />
            </g>
          ))}
        </g>

        {/* 3. Center Triangular Finish (3x3 units: rows 6..8, cols 6..8) */}
        <g id="center-triangles">
          {/* Red Triangle (Left) */}
          <polygon
            points="6,6 7.5,7.5 6,9"
            fill={COLOR_CONFIG.red.hex}
            stroke="#b91c1c"
            strokeWidth="0.03"
          />
          {/* Green Triangle (Top) */}
          <polygon
            points="6,6 7.5,7.5 9,6"
            fill={COLOR_CONFIG.green.hex}
            stroke="#047857"
            strokeWidth="0.03"
          />
          {/* Yellow Triangle (Right) */}
          <polygon
            points="9,6 7.5,7.5 9,9"
            fill={COLOR_CONFIG.yellow.hex}
            stroke="#b45309"
            strokeWidth="0.03"
          />
          {/* Blue Triangle (Bottom) */}
          <polygon
            points="6,9 7.5,7.5 9,9"
            fill={COLOR_CONFIG.blue.hex}
            stroke="#1d4ed8"
            strokeWidth="0.03"
          />

          {/* Central Golden Crown / Finish Emblem */}
          <circle cx={7.5} cy={7.5} r={0.45} fill="#fef08a" stroke="#ca8a04" strokeWidth="0.04" className="shadow" />
          {/* Tiny Crown SVG */}
          <polygon
            points="7.3,7.65 7.7,7.65 7.65,7.4 7.5,7.5 7.35,7.4"
            fill="#854d0e"
          />
        </g>

        {/* 4. Interactive Ludo Tokens */}
        <g id="tokens">
          {tokenDisplayList.map((item) => {
            const { dx, dy } = calculateOffset(item.totalOnSquare, item.squareIndex);
            const posX = item.col + 0.5 + dx;
            const posY = item.row + 0.5 + dy;
            const colorCfg = COLOR_CONFIG[item.color];

            return (
              <g
                key={item.key}
                transform={`translate(${posX}, ${posY})`}
                onClick={() => {
                  if (item.isMoveable) {
                    onTokenClick(item.color, item.tokenId);
                  }
                }}
                className={`transition-transform duration-200 ${
                  item.isMoveable ? 'cursor-pointer' : 'pointer-events-none'
                }`}
              >
                {/* Pulsing aura ring when valid to move */}
                {item.isMoveable && (
                  <circle
                    r={0.52}
                    fill="none"
                    stroke={colorCfg.hex}
                    strokeWidth="0.08"
                    strokeDasharray="0.2 0.1"
                    className="animate-spin origin-center opacity-80"
                  />
                )}

                {/* Drop shadow */}
                <ellipse cx={0} cy={0.08} rx={0.34} ry={0.16} fill="rgba(0,0,0,0.3)" />

                {/* Token Base Ring */}
                <circle
                  r={0.36}
                  fill={`url(#token-${item.color})`}
                  stroke="#ffffff"
                  strokeWidth="0.04"
                />

                {/* 3D Inner Cap */}
                <circle
                  r={0.24}
                  fill={`url(#token-${item.color})`}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.02"
                />

                {/* Specular Glint */}
                <circle
                  cx={-0.08}
                  cy={-0.08}
                  r={0.07}
                  fill="#ffffff"
                  opacity={0.8}
                />

                {/* Token ID digit for easy identification */}
                <text
                  x={0}
                  y={0.08}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="0.24"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                >
                  {item.tokenId + 1}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
