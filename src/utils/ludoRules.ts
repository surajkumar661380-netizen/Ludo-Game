/**
 * Ludo Game Logic & Rule Engine
 * Full support for Free-For-All and 2 vs 2 Team modes.
 */

import { Player, PlayerColor, Token, MoveOption, GameMode, TeamId } from '../types/ludo';
import {
  START_TRACK_INDICES,
  SAFE_TRACK_INDICES,
  getTrackIndex
} from './ludoBoard';

/**
 * Checks if a token can legally move with the given dice roll.
 * Returns MoveOption if valid, or null if invalid.
 */
export function getLegalMoveForToken(
  player: Player,
  token: Token,
  diceRoll: number,
  allPlayers: Player[],
  gameMode: GameMode = '4player'
): MoveOption | null {
  // Token already finished at Home
  if (token.step === 56) {
    return null;
  }

  // Token is inside Yard
  if (token.step === -1) {
    // Only a roll of 6 allows exiting the yard onto the starting tile (step 0)
    if (diceRoll === 6) {
      return {
        tokenId: token.id,
        fromStep: -1,
        toStep: 0,
        willReachHome: false
      };
    }
    return null;
  }

  // Token is active on track or home stretch
  const targetStep = token.step + diceRoll;

  // Overshoots home center (exact roll needed to reach 56)
  if (targetStep > 56) {
    return null;
  }

  const willReachHome = targetStep === 56;

  // Check for opponent capture if landing on common track
  let willCaptureToken: MoveOption['willCaptureToken'] = undefined;

  if (targetStep >= 0 && targetStep <= 50) {
    const startIdx = START_TRACK_INDICES[player.color];
    const targetTrackIdx = (startIdx + targetStep) % 52;

    // Safe squares prevent captures
    const isTargetSafe = SAFE_TRACK_INDICES.has(targetTrackIdx);

    if (!isTargetSafe) {
      // Check for opponent tokens on this square
      for (const opp of allPlayers) {
        if (!opp.isActive || opp.color === player.color) continue;

        // In 2 vs 2 mode, teammates do NOT capture each other!
        if (gameMode === '2vs2' && opp.team && player.team && opp.team === player.team) {
          continue;
        }

        for (const oppToken of opp.tokens) {
          if (oppToken.step >= 0 && oppToken.step <= 50) {
            const oppTrackIdx = getTrackIndex(opp.color, oppToken.step);
            if (oppTrackIdx === targetTrackIdx) {
              willCaptureToken = {
                color: opp.color,
                tokenId: oppToken.id
              };
              break;
            }
          }
        }
        if (willCaptureToken) break;
      }
    }
  }

  return {
    tokenId: token.id,
    fromStep: token.step,
    toStep: targetStep,
    willCaptureToken,
    willReachHome
  };
}

/**
 * Returns all legal moves available to a player for a given dice roll.
 */
export function getAllLegalMoves(
  player: Player,
  diceRoll: number,
  allPlayers: Player[],
  gameMode: GameMode = '4player'
): MoveOption[] {
  const legalMoves: MoveOption[] = [];

  for (const token of player.tokens) {
    const move = getLegalMoveForToken(player, token, diceRoll, allPlayers, gameMode);
    if (move) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
}

/**
 * Determines the next active player in clockwise rotation who has not finished.
 */
export function getNextPlayerColor(
  currentColor: PlayerColor,
  players: Player[]
): PlayerColor {
  const turnOrder: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
  const currentIndex = turnOrder.indexOf(currentColor);

  for (let i = 1; i <= 4; i++) {
    const nextIdx = (currentIndex + i) % 4;
    const nextColor = turnOrder[nextIdx];
    const player = players.find((p) => p.color === nextColor);

    // Player must be active and not finished
    if (player && player.isActive && player.rank === undefined) {
      return nextColor;
    }
  }

  return currentColor;
}

/**
 * Checks if an individual player has finished (all 4 tokens home).
 */
export function hasPlayerFinished(player: Player): boolean {
  return player.tokens.every((t) => t.step === 56);
}

/**
 * Checks if a team has won in 2vs2 mode (all 8 tokens home for that team).
 */
export function hasTeamFinished(teamId: TeamId, players: Player[]): boolean {
  const teamMembers = players.filter((p) => p.isActive && p.team === teamId);
  if (teamMembers.length === 0) return false;
  return teamMembers.every((m) => m.tokens.every((t) => t.step === 56));
}
