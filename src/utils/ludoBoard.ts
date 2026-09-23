/**
 * Ludo Board Geometry & Path Mapping
 * Standard 15x15 cross board coordinates
 */

import { Coordinate, PlayerColor } from '../types/ludo';

// 52 Common Track Coordinates in clockwise order
export const TRACK_COORDINATES: Coordinate[] = [
  // Red start arm (left arm, top row)
  { row: 6, col: 1 },  // 0  - RED START (SAFE)
  { row: 6, col: 2 },  // 1
  { row: 6, col: 3 },  // 2
  { row: 6, col: 4 },  // 3
  { row: 6, col: 5 },  // 4

  // Top arm (left column going up)
  { row: 5, col: 6 },  // 5
  { row: 4, col: 6 },  // 6
  { row: 3, col: 6 },  // 7
  { row: 2, col: 6 },  // 8  - SAFE STAR
  { row: 1, col: 6 },  // 9
  { row: 0, col: 6 },  // 10

  // Top crossover
  { row: 0, col: 7 },  // 11
  { row: 0, col: 8 },  // 12

  // Top arm (right column going down)
  { row: 1, col: 8 },  // 13 - GREEN START (SAFE)
  { row: 2, col: 8 },  // 14
  { row: 3, col: 8 },  // 15
  { row: 4, col: 8 },  // 16
  { row: 5, col: 8 },  // 17

  // Right arm (top row going right)
  { row: 6, col: 9 },  // 18
  { row: 6, col: 10 }, // 19
  { row: 6, col: 11 }, // 20
  { row: 6, col: 12 }, // 21 - SAFE STAR
  { row: 6, col: 13 }, // 22
  { row: 6, col: 14 }, // 23

  // Right crossover
  { row: 7, col: 14 }, // 24
  { row: 8, col: 14 }, // 25

  // Right arm (bottom row going left)
  { row: 8, col: 13 }, // 26 - YELLOW START (SAFE)
  { row: 8, col: 12 }, // 27
  { row: 8, col: 11 }, // 28
  { row: 8, col: 10 }, // 29
  { row: 8, col: 9 },  // 30

  // Bottom arm (right column going down)
  { row: 9, col: 8 },  // 31
  { row: 10, col: 8 }, // 32
  { row: 11, col: 8 }, // 33
  { row: 12, col: 8 }, // 34 - SAFE STAR
  { row: 13, col: 8 }, // 35
  { row: 14, col: 8 }, // 36

  // Bottom crossover
  { row: 14, col: 7 }, // 37
  { row: 14, col: 6 }, // 38

  // Bottom arm (left column going up)
  { row: 13, col: 6 }, // 39 - BLUE START (SAFE)
  { row: 12, col: 6 }, // 40
  { row: 11, col: 6 }, // 41
  { row: 10, col: 6 }, // 42
  { row: 9, col: 6 },  // 43

  // Left arm (bottom row going left)
  { row: 8, col: 5 },  // 44
  { row: 8, col: 4 },  // 45
  { row: 8, col: 3 },  // 46
  { row: 8, col: 2 },  // 47 - SAFE STAR
  { row: 8, col: 1 },  // 48
  { row: 8, col: 0 },  // 49

  // Left crossover
  { row: 7, col: 0 },  // 50
  { row: 6, col: 0 }   // 51
];

// Starting track indices for each player
export const START_TRACK_INDICES: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

// Safe squares on the common track (indices 0..51)
export const SAFE_TRACK_INDICES = new Set<number>([
  0, 8, 13, 21, 26, 34, 39, 47
]);

// Home columns (steps 51..55) and Center Home (step 56)
export const HOME_PATHS: Record<PlayerColor, Coordinate[]> = {
  red: [
    { row: 7, col: 1 }, // step 51
    { row: 7, col: 2 }, // step 52
    { row: 7, col: 3 }, // step 53
    { row: 7, col: 4 }, // step 54
    { row: 7, col: 5 }, // step 55
    { row: 7, col: 6 }  // step 56 (Center Home)
  ],
  green: [
    { row: 1, col: 7 }, // step 51
    { row: 2, col: 7 }, // step 52
    { row: 3, col: 7 }, // step 53
    { row: 4, col: 7 }, // step 54
    { row: 5, col: 7 }, // step 55
    { row: 6, col: 7 }  // step 56 (Center Home)
  ],
  yellow: [
    { row: 7, col: 13 }, // step 51
    { row: 7, col: 12 }, // step 52
    { row: 7, col: 11 }, // step 53
    { row: 7, col: 10 }, // step 54
    { row: 7, col: 9 },  // step 55
    { row: 7, col: 8 }   // step 56 (Center Home)
  ],
  blue: [
    { row: 13, col: 7 }, // step 51
    { row: 12, col: 7 }, // step 52
    { row: 11, col: 7 }, // step 53
    { row: 10, col: 7 }, // step 54
    { row: 9, col: 7 },  // step 55
    { row: 8, col: 7 }   // step 56 (Center Home)
  ]
};

// Yard positions for the 4 tokens in each house (matching dock centers)
export const YARD_COORDINATES: Record<PlayerColor, Coordinate[]> = {
  red: [
    { row: 1.8, col: 1.8 },
    { row: 1.8, col: 4.2 },
    { row: 4.2, col: 1.8 },
    { row: 4.2, col: 4.2 }
  ],
  green: [
    { row: 1.8, col: 10.8 },
    { row: 1.8, col: 13.2 },
    { row: 4.2, col: 10.8 },
    { row: 4.2, col: 13.2 }
  ],
  yellow: [
    { row: 10.8, col: 10.8 },
    { row: 10.8, col: 13.2 },
    { row: 13.2, col: 10.8 },
    { row: 13.2, col: 13.2 }
  ],
  blue: [
    { row: 10.8, col: 1.8 },
    { row: 10.8, col: 4.2 },
    { row: 13.2, col: 1.8 },
    { row: 13.2, col: 4.2 }
  ]
};

// Player visual attributes
export const COLOR_CONFIG: Record<
  PlayerColor,
  {
    name: string;
    hex: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    glowClass: string;
    gradient: string;
    homeColor: string;
    lightHex: string;
    accentHex: string;
  }
> = {
  red: {
    name: 'Red',
    hex: '#ef4444',
    lightHex: '#fee2e2',
    accentHex: '#b91c1c',
    bgClass: 'bg-red-500',
    textClass: 'text-red-600',
    borderClass: 'border-red-500',
    glowClass: 'shadow-red-500/50',
    gradient: 'from-red-500 to-rose-600',
    homeColor: '#dc2626'
  },
  green: {
    name: 'Green',
    hex: '#10b981',
    lightHex: '#d1fae5',
    accentHex: '#047857',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-600',
    borderClass: 'border-emerald-500',
    glowClass: 'shadow-emerald-500/50',
    gradient: 'from-emerald-500 to-green-600',
    homeColor: '#059669'
  },
  yellow: {
    name: 'Yellow',
    hex: '#f59e0b',
    lightHex: '#fef3c7',
    accentHex: '#b45309',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-600',
    borderClass: 'border-amber-500',
    glowClass: 'shadow-amber-500/50',
    gradient: 'from-amber-400 to-yellow-600',
    homeColor: '#d97706'
  },
  blue: {
    name: 'Blue',
    hex: '#3b82f6',
    lightHex: '#dbeafe',
    accentHex: '#1d4ed8',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-600',
    borderClass: 'border-blue-500',
    glowClass: 'shadow-blue-500/50',
    gradient: 'from-blue-500 to-indigo-600',
    homeColor: '#2563eb'
  }
};

/**
 * Returns the exact (row, col) coordinate for a token based on its color, tokenId, and step
 */
export function getTokenCoordinate(
  color: PlayerColor,
  tokenId: number,
  step: number
): Coordinate {
  // Token in yard
  if (step === -1) {
    return YARD_COORDINATES[color][tokenId];
  }

  // Token on main 52-tile track (step 0 to 50)
  if (step >= 0 && step <= 50) {
    const startIndex = START_TRACK_INDICES[color];
    const trackIndex = (startIndex + step) % 52;
    return TRACK_COORDINATES[trackIndex];
  }

  // Token on home path (step 51 to 55) or center home (step 56)
  if (step >= 51 && step <= 56) {
    const homeIndex = step - 51;
    return HOME_PATHS[color][homeIndex];
  }

  // Fallback
  return YARD_COORDINATES[color][tokenId];
}

/**
 * Checks if a given step for a color is on a safe square
 */
export function isStepSafe(color: PlayerColor, step: number): boolean {
  if (step === -1) return true; // Yard is protected
  if (step >= 51) return true;  // Home stretch is safe
  if (step >= 0 && step <= 50) {
    const startIndex = START_TRACK_INDICES[color];
    const trackIndex = (startIndex + step) % 52;
    return SAFE_TRACK_INDICES.has(trackIndex);
  }
  return false;
}

/**
 * Returns the track index (0..51) if the token is on the common track, or null if in yard or home stretch
 */
export function getTrackIndex(color: PlayerColor, step: number): number | null {
  if (step >= 0 && step <= 50) {
    const startIndex = START_TRACK_INDICES[color];
    return (startIndex + step) % 52;
  }
  return null;
}
