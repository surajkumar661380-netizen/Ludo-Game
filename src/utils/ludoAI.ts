/**
 * Bot AI Decision Engine for Ludo
 * Evaluates tactical moves across both Free-for-All and 2 vs 2 Team modes.
 */

import { Player, MoveOption, GameMode } from '../types/ludo';
import {
  SAFE_TRACK_INDICES,
  START_TRACK_INDICES,
  getTrackIndex
} from './ludoBoard';

export function chooseBestMove(
  player: Player,
  legalMoves: MoveOption[],
  allPlayers: Player[],
  difficulty: 'casual' | 'smart' = 'smart',
  gameMode: GameMode = '4player'
): MoveOption {
  if (legalMoves.length === 1) {
    return legalMoves[0];
  }

  // Score each legal move
  const scoredMoves = legalMoves.map((move) => {
    let score = 0;

    // 1. Can capture an enemy token (Huge tactical swing + bonus roll)
    if (move.willCaptureToken) {
      score += 130;
    }

    // 2. Can reach home center (Guarantees victory progress + bonus roll)
    if (move.willReachHome) {
      score += 100;
    }

    // 3. Releasing token from yard with a 6
    if (move.fromStep === -1 && move.toStep === 0) {
      // Releasing first or second token is top priority to mobilize
      const tokensOut = player.tokens.filter((t) => t.step >= 0).length;
      score += tokensOut < 2 ? 85 : 65;
    }

    // 4. Entering the home stretch (completely immune from captures)
    if (move.fromStep <= 50 && move.toStep >= 51) {
      score += 60;
    }

    // 5. Landing on a safe star square on the main track
    if (move.toStep >= 0 && move.toStep <= 50) {
      const startIdx = START_TRACK_INDICES[player.color];
      const targetTrackIdx = (startIdx + move.toStep) % 52;
      if (SAFE_TRACK_INDICES.has(targetTrackIdx)) {
        score += 45;
      }
    }

    // 6. Escaping danger: was the token on an unsafe square with an opponent close behind?
    if (move.fromStep >= 0 && move.fromStep <= 50) {
      const currentTrackIdx = getTrackIndex(player.color, move.fromStep);
      if (currentTrackIdx !== null && !SAFE_TRACK_INDICES.has(currentTrackIdx)) {
        for (const opp of allPlayers) {
          if (!opp.isActive || opp.color === player.color) continue;
          // In 2 vs 2, teammates are not dangerous
          if (gameMode === '2vs2' && opp.team && player.team && opp.team === player.team) {
            continue;
          }

          for (const oppToken of opp.tokens) {
            if (oppToken.step >= 0 && oppToken.step <= 50) {
              const oppTrack = getTrackIndex(opp.color, oppToken.step);
              if (oppTrack !== null) {
                const distanceBehind = (currentTrackIdx - oppTrack + 52) % 52;
                if (distanceBehind >= 1 && distanceBehind <= 6) {
                  score += 40; // Escape threat!
                }
              }
            }
          }
        }
      }
    }

    // 7. General progression: prefer advancing tokens that are closer to home stretch
    score += move.toStep * 0.6;

    // Slight variance in casual mode
    if (difficulty === 'casual') {
      score += (Math.random() - 0.5) * 35;
    }

    return { move, score };
  });

  // Sort descending by score
  scoredMoves.sort((a, b) => b.score - a.score);
  return scoredMoves[0].move;
}
