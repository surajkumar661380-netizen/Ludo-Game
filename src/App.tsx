/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Swords, Users2, ShieldAlert } from 'lucide-react';
import { Player, PlayerColor, TurnPhase, MoveOption, LogEntry, GameMode } from './types/ludo';
import { COLOR_CONFIG } from './utils/ludoBoard';
import {
  getAllLegalMoves,
  getNextPlayerColor,
  hasPlayerFinished,
  hasTeamFinished
} from './utils/ludoRules';
import { chooseBestMove } from './utils/ludoAI';
import { sound } from './utils/audio';
import { LudoBoard } from './components/LudoBoard';
import { PlayerCard } from './components/PlayerCard';
import { Dice } from './components/Dice';
import { GameHUD } from './components/GameHUD';
import { GameLog } from './components/GameLog';
import { RulesModal } from './components/RulesModal';
import { GameSetupModal } from './components/GameSetupModal';
import { VictoryModal } from './components/VictoryModal';

// Generates player list for a given mode
const generatePlayersForMode = (mode: GameMode): Player[] => {
  const allColors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

  return allColors.map((color) => {
    // In 1 vs 1, only Red and Yellow participate
    const isActive = mode === '1vs1' ? color === 'red' || color === 'yellow' : true;

    // In 2 vs 2, Red + Yellow = Team Alpha, Green + Blue = Team Beta
    let team: Player['team'] = undefined;
    if (mode === '2vs2') {
      team = color === 'red' || color === 'yellow' ? 'team-alpha' : 'team-beta';
    }

    let defaultName = `${COLOR_CONFIG[color].name} Bot`;
    let defaultType: Player['type'] = 'bot';

    if (color === 'red') {
      defaultName = 'You (Red)';
      defaultType = 'human';
    }

    return {
      id: `player-${color}`,
      color,
      name: defaultName,
      type: defaultType,
      botDifficulty: 'smart',
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
};

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('4player');
  const [players, setPlayers] = useState<Player[]>(() => generatePlayersForMode('4player'));
  const [activeColor, setActiveColor] = useState<PlayerColor>('red');
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('ROLL');
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [legalMoves, setLegalMoves] = useState<MoveOption[]>([]);
  const [pendingMove, setPendingMove] = useState<MoveOption | null>(null);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [roundCount, setRoundCount] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<string>('Red to roll the dice.');

  // Settings & Animation
  const [speed, setSpeed] = useState<'normal' | 'fast'>('normal');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [animatingToken, setAnimatingToken] = useState<{
    color: PlayerColor;
    tokenId: number;
    step: number;
  } | null>(null);

  // Modals & Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);

  // Sync mute state
  useEffect(() => {
    sound.setMuted(isMuted);
  }, [isMuted]);

  const addLog = useCallback(
    (
      playerColor: PlayerColor,
      message: string,
      iconType: LogEntry['iconType'] = 'dice'
    ) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const newEntry: LogEntry = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: timeStr,
        playerColor,
        message,
        iconType
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
    },
    []
  );

  const activePlayer = players.find((p) => p.color === activeColor)!;

  /**
   * Passes turn cleanly to the next active player
   */
  const passTurn = useCallback(
    (currentPlayersList = players, currentColor = activeColor) => {
      const nextColor = getNextPlayerColor(currentColor, currentPlayersList);
      const nextPlayer = currentPlayersList.find((p) => p.color === nextColor)!;

      if (nextColor === 'red') {
        setRoundCount((r) => r + 1);
      }

      setActiveColor(nextColor);
      setConsecutiveSixes(0);
      setDiceValue(null);
      setLegalMoves([]);
      setPendingMove(null);
      setTurnPhase('ROLL');
      setStatusMessage(`${nextPlayer.name}'s turn to roll.`);
    },
    [players, activeColor]
  );

  /**
   * Executes a move with full step-by-step path animation
   */
  const executeMove = useCallback(
    (move: MoveOption) => {
      setTurnPhase('ANIMATING');
      setLegalMoves([]);
      setPendingMove(null);

      const player = players.find((p) => p.color === activeColor)!;
      const startStep = move.fromStep;
      const endStep = move.toStep;

      // Leaving Yard onto starting square
      if (startStep === -1) {
        sound.playEnterBoard();
        setAnimatingToken({ color: activeColor, tokenId: move.tokenId, step: 0 });

        setTimeout(() => {
          setAnimatingToken(null);
          finalize(move);
        }, speed === 'fast' ? 180 : 300);
        return;
      }

      // Step-by-step track walk
      let currentStep = startStep;
      const stepDuration = speed === 'fast' ? 70 : 130;

      const stepInterval = setInterval(() => {
        currentStep++;
        sound.playStep(1 + (currentStep % 6) * 0.08);
        setAnimatingToken({
          color: activeColor,
          tokenId: move.tokenId,
          step: currentStep
        });

        if (currentStep >= endStep) {
          clearInterval(stepInterval);
          setTimeout(() => {
            setAnimatingToken(null);
            finalize(move);
          }, speed === 'fast' ? 100 : 180);
        }
      }, stepDuration);

      function finalize(completedMove: MoveOption) {
        setPlayers((prevPlayers) => {
          let updatedPlayers = prevPlayers.map((p) => {
            if (p.color !== activeColor) return p;

            const updatedTokens = p.tokens.map((t) =>
              t.id === completedMove.tokenId ? { ...t, step: completedMove.toStep } : t
            );

            const tokensHome = updatedTokens.filter((t) => t.step === 56).length;

            return {
              ...p,
              tokens: updatedTokens,
              stats: {
                ...p.stats,
                tokensHome
              }
            };
          });

          // Check if token captured an opponent
          let wasCaptured = false;
          if (completedMove.willCaptureToken) {
            wasCaptured = true;
            sound.playCapture();
            const { color: oppColor, tokenId: oppTokenId } = completedMove.willCaptureToken;

            updatedPlayers = updatedPlayers.map((p) => {
              if (p.color === oppColor) {
                return {
                  ...p,
                  tokens: p.tokens.map((t) =>
                    t.id === oppTokenId ? { ...t, step: -1 } : t
                  )
                };
              }
              if (p.color === activeColor) {
                return {
                  ...p,
                  stats: {
                    ...p.stats,
                    captures: p.stats.captures + 1
                  }
                };
              }
              return p;
            });

            addLog(
              activeColor,
              `captured ${COLOR_CONFIG[oppColor].name}'s token #${oppTokenId + 1}!`,
              'capture'
            );
          } else if (completedMove.fromStep === -1) {
            addLog(
              activeColor,
              `released token #${completedMove.tokenId + 1} onto start!`,
              'enter'
            );
          } else if (completedMove.willReachHome) {
            sound.playHome();
            addLog(
              activeColor,
              `token #${completedMove.tokenId + 1} arrived Home!`,
              'home'
            );
          } else {
            addLog(
              activeColor,
              `moved token #${completedMove.tokenId + 1} forward ${diceValue} steps.`
            );
          }

          // Check game over / winner
          let matchFinished = false;

          if (gameMode === '2vs2') {
            const playerTeam = player.team;
            if (playerTeam && hasTeamFinished(playerTeam, updatedPlayers)) {
              sound.playVictory();
              setIsVictoryOpen(true);
              matchFinished = true;
            }
          } else {
            const activeAfterMove = updatedPlayers.find((p) => p.color === activeColor)!;
            if (hasPlayerFinished(activeAfterMove) && activeAfterMove.rank === undefined) {
              const finishedCount = updatedPlayers.filter((p) => p.rank !== undefined).length;
              const nextRank = finishedCount + 1;
              updatedPlayers = updatedPlayers.map((p) =>
                p.color === activeColor ? { ...p, rank: nextRank } : p
              );

              sound.playVictory();
              addLog(activeColor, `finished in #${nextRank} place!`, 'trophy');

              if (nextRank === 1) {
                setIsVictoryOpen(true);
                matchFinished = true;
              }
            }
          }

          if (matchFinished) {
            return updatedPlayers;
          }

          // Bonus turn determination
          // Bonus granted for: rolling a 6, capturing an opponent, or bringing a token to Home
          const earnedBonusTurn =
            diceValue === 6 || wasCaptured || completedMove.willReachHome;

          const stillActive = !hasPlayerFinished(
            updatedPlayers.find((p) => p.color === activeColor)!
          );

          if (earnedBonusTurn && stillActive) {
            let reason = 'Rolled a 6';
            if (wasCaptured) reason = 'Captured enemy';
            if (completedMove.willReachHome) reason = 'Reached Home';

            setStatusMessage(`${player.name} earned a bonus roll! (${reason})`);
            setTurnPhase('ROLL');
            setDiceValue(null);
            setLegalMoves([]);
          } else {
            passTurn(updatedPlayers, activeColor);
          }

          return updatedPlayers;
        });
      }
    },
    [activeColor, diceValue, players, speed, gameMode, addLog, passTurn]
  );

  /**
   * Main dice rolling trigger
   */
  const handleRollDice = useCallback(() => {
    if (turnPhase !== 'ROLL' || isRolling) return;

    setIsRolling(true);
    setTurnPhase('ROLLING');
    sound.playDiceRoll();

    const rollDuration = speed === 'fast' ? 250 : 450;

    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDiceValue(rolled);
      setIsRolling(false);

      if (rolled === 6) {
        sound.playSix();
      }

      // Record player stats
      setPlayers((prev) =>
        prev.map((p) =>
          p.color === activeColor
            ? {
                ...p,
                stats: {
                  ...p.stats,
                  rolls: p.stats.rolls + 1,
                  sixes: rolled === 6 ? p.stats.sixes + 1 : p.stats.sixes
                }
              }
            : p
        )
      );

      // Check Three 6s rule
      const nextConsecutive = rolled === 6 ? consecutiveSixes + 1 : 0;
      setConsecutiveSixes(nextConsecutive);

      if (nextConsecutive >= 3) {
        addLog(activeColor, 'rolled three 6s in a row! Turn forfeited.', 'warning');
        setStatusMessage('Three consecutive 6s! Turn forfeited.');
        setTurnPhase('NO_MOVES');
        return;
      }

      addLog(activeColor, `rolled a ${rolled}.`, 'dice');

      // Calculate legal moves
      const moves = getAllLegalMoves(activePlayer, rolled, players, gameMode);
      setLegalMoves(moves);

      if (moves.length === 0) {
        setStatusMessage(
          rolled === 6
            ? `No moves available for ${activePlayer.name}.`
            : `No moves available (need 6 to enter). Passing turn...`
        );
        setTurnPhase('NO_MOVES');
        return;
      }

      // Single legal move
      if (moves.length === 1) {
        setPendingMove(moves[0]);
        if (activePlayer.type === 'bot') {
          setStatusMessage(`${activePlayer.name} moving token...`);
          setTurnPhase('AUTO_MOVING');
        } else {
          // Human player: can tap to move or auto-moves quickly
          setStatusMessage(`1 move available. Tap token #${moves[0].tokenId + 1} to move.`);
          setTurnPhase('AUTO_MOVING');
        }
        return;
      }

      // Multiple legal moves
      if (activePlayer.type === 'bot') {
        setStatusMessage(`${activePlayer.name} is calculating move...`);
        setTurnPhase('BOT_THINKING');
      } else {
        setStatusMessage(`Rolled ${rolled}! Tap any highlighted token to move.`);
        setTurnPhase('SELECT_TOKEN');
      }
    }, rollDuration);
  }, [
    turnPhase,
    isRolling,
    speed,
    activeColor,
    consecutiveSixes,
    addLog,
    activePlayer,
    players,
    gameMode
  ]);

  // Dedicated Effect 1: Bot Roll trigger
  useEffect(() => {
    if (
      activePlayer &&
      activePlayer.type === 'bot' &&
      turnPhase === 'ROLL' &&
      !isRolling &&
      !isVictoryOpen &&
      !isSetupOpen
    ) {
      const delay = speed === 'fast' ? 350 : 600;
      const timer = setTimeout(() => {
        handleRollDice();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [
    activePlayer,
    turnPhase,
    isRolling,
    isVictoryOpen,
    isSetupOpen,
    speed,
    handleRollDice
  ]);

  // Dedicated Effect 2: Bot Thinking trigger (multiple legal moves)
  useEffect(() => {
    if (turnPhase === 'BOT_THINKING' && activePlayer.type === 'bot' && legalMoves.length > 0) {
      const delay = speed === 'fast' ? 300 : 550;
      const timer = setTimeout(() => {
        const chosen = chooseBestMove(
          activePlayer,
          legalMoves,
          players,
          activePlayer.botDifficulty,
          gameMode
        );
        executeMove(chosen);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [turnPhase, activePlayer, legalMoves, players, gameMode, speed, executeMove]);

  // Dedicated Effect 3: Auto-moving trigger (single legal move)
  useEffect(() => {
    if (turnPhase === 'AUTO_MOVING' && pendingMove) {
      const delay = speed === 'fast' ? 250 : 450;
      const timer = setTimeout(() => {
        executeMove(pendingMove);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [turnPhase, pendingMove, speed, executeMove]);

  // Dedicated Effect 4: No moves pass turn trigger
  useEffect(() => {
    if (turnPhase === 'NO_MOVES') {
      const delay = speed === 'fast' ? 400 : 700;
      const timer = setTimeout(() => {
        passTurn();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [turnPhase, speed, passTurn]);

  /**
   * Human token click handler
   */
  const handleTokenClick = (color: PlayerColor, tokenId: number) => {
    if (color !== activeColor) return;
    if (turnPhase !== 'SELECT_TOKEN' && turnPhase !== 'AUTO_MOVING') return;

    const matchingMove = legalMoves.find((m) => m.tokenId === tokenId);
    if (matchingMove) {
      executeMove(matchingMove);
    }
  };

  /**
   * Reset game with current mode
   */
  const handleResetGame = () => {
    const freshPlayers = generatePlayersForMode(gameMode);
    setPlayers(freshPlayers);
    setActiveColor('red');
    setTurnPhase('ROLL');
    setDiceValue(null);
    setIsRolling(false);
    setLegalMoves([]);
    setPendingMove(null);
    setRoundCount(1);
    setLogs([]);
    setIsVictoryOpen(false);
    setStatusMessage('New match started. Red to roll.');
  };

  /**
   * Change Game Mode directly from tabs
   */
  const handleModeChange = (newMode: GameMode) => {
    setGameMode(newMode);
    const freshPlayers = generatePlayersForMode(newMode);
    setPlayers(freshPlayers);
    setActiveColor('red');
    setTurnPhase('ROLL');
    setDiceValue(null);
    setIsRolling(false);
    setLegalMoves([]);
    setPendingMove(null);
    setRoundCount(1);
    setLogs([]);
    setIsVictoryOpen(false);
    setStatusMessage(`Switched to ${newMode === '1vs1' ? '1 vs 1 Duel' : newMode === '2vs2' ? '2 vs 2 Teams' : '4-Player FFA'}. Red to roll.`);
  };

  /**
   * Start custom configured match from Setup modal
   */
  const handleStartCustomMatch = (configuredPlayers: Player[], selectedMode: GameMode) => {
    setGameMode(selectedMode);
    setPlayers(configuredPlayers);
    const firstActive = configuredPlayers.find((p) => p.isActive)?.color || 'red';
    setActiveColor(firstActive);
    setTurnPhase('ROLL');
    setDiceValue(null);
    setIsRolling(false);
    setLegalMoves([]);
    setPendingMove(null);
    setRoundCount(1);
    setLogs([]);
    setIsVictoryOpen(false);
    setStatusMessage(`Match started. ${COLOR_CONFIG[firstActive].name} to roll.`);
  };

  const redPlayer = players.find((p) => p.color === 'red')!;
  const greenPlayer = players.find((p) => p.color === 'green')!;
  const yellowPlayer = players.find((p) => p.color === 'yellow')!;
  const bluePlayer = players.find((p) => p.color === 'blue')!;

  // Team summary counts for 2 vs 2
  const alphaTokensHome =
    gameMode === '2vs2'
      ? players
          .filter((p) => p.team === 'team-alpha')
          .reduce((sum, p) => sum + p.tokens.filter((t) => t.step === 56).length, 0)
      : null;

  const betaTokensHome =
    gameMode === '2vs2'
      ? players
          .filter((p) => p.team === 'team-beta')
          .reduce((sum, p) => sum + p.tokens.filter((t) => t.step === 56).length, 0)
      : null;

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col text-slate-100 font-sans selection:bg-amber-400 selection:text-amber-950">
      {/* Top Bar (Contract Compliant) */}
      <GameHUD
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((m) => !m)}
        speed={speed}
        onToggleSpeed={() => setSpeed((s) => (s === 'normal' ? 'fast' : 'normal'))}
        onOpenRules={() => setIsRulesOpen(true)}
        onNewGame={() => setIsSetupOpen(true)}
        roundCount={roundCount}
      />

      {/* Main Game Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col items-center justify-center">
        {/* Game Mode Selector Tabs */}
        <div className="w-full max-w-xl mb-3 flex items-center justify-center gap-1.5 p-1 bg-stone-900 border border-stone-800 rounded-2xl shadow-md">
          <button
            type="button"
            onClick={() => handleModeChange('1vs1')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              gameMode === '1vs1'
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>1 vs 1 Duel</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('2vs2')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              gameMode === '2vs2'
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>2 vs 2 Teams</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('4player')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              gameMode === '4player'
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>4-Player FFA</span>
          </button>
        </div>

        {/* 2 vs 2 Team Status Banner */}
        {gameMode === '2vs2' && (
          <div className="w-full max-w-3xl mb-2 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300">
              <span className="font-semibold">Team Alpha (Red + Yellow)</span>
              <strong className="text-amber-400 tabular-nums">{alphaTokensHome}/8 Home</strong>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-300">
              <span className="font-semibold">Team Beta (Green + Blue)</span>
              <strong className="text-blue-400 tabular-nums">{betaTokensHome}/8 Home</strong>
            </div>
          </div>
        )}

        {/* Status Announcement Banner */}
        <div className="w-full max-w-3xl mb-3 px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow animate-pulse"
              style={{ backgroundColor: COLOR_CONFIG[activeColor].hex }}
            />
            <span className="font-semibold text-stone-200 truncate">
              {statusMessage}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {turnPhase === 'SELECT_TOKEN' && activePlayer.type === 'human' && (
              <span className="text-amber-400 font-medium text-xs animate-bounce hidden sm:inline">
                Tap highlighted pawn to advance
              </span>
            )}
          </div>
        </div>

        {/* Responsive Board & HUD Layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
          {/* Left Column: Red & Blue Players (desktop) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
            {redPlayer.isActive && (
              <PlayerCard
                player={redPlayer}
                isCurrentTurn={activeColor === 'red'}
                turnPhase={turnPhase}
                currentDiceValue={diceValue}
                isRolling={isRolling}
                onRollDice={handleRollDice}
                canRoll={activeColor === 'red' && turnPhase === 'ROLL'}
                gameMode={gameMode}
              />
            )}
            {bluePlayer.isActive && (
              <PlayerCard
                player={bluePlayer}
                isCurrentTurn={activeColor === 'blue'}
                turnPhase={turnPhase}
                currentDiceValue={diceValue}
                isRolling={isRolling}
                onRollDice={handleRollDice}
                canRoll={activeColor === 'blue' && turnPhase === 'ROLL'}
                gameMode={gameMode}
              />
            )}
          </div>

          {/* Center Column: The Ludo Board */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center w-full">
            <LudoBoard
              players={players}
              activeColor={activeColor}
              legalMoves={legalMoves}
              onTokenClick={handleTokenClick}
              animatingToken={animatingToken}
            />

            {/* Mobile / Tablet Dice Bar */}
            <div className="lg:hidden mt-4 w-full flex items-center justify-between gap-4 bg-stone-900 p-3 rounded-2xl border border-stone-800">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLOR_CONFIG[activeColor].hex }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-stone-200 truncate">
                    {activePlayer.name}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {activePlayer.type === 'bot' ? 'Bot thinking...' : 'Your turn'}
                  </div>
                </div>
              </div>
              <Dice
                value={diceValue}
                isRolling={isRolling}
                canRoll={activePlayer.type === 'human' && turnPhase === 'ROLL'}
                playerColor={activeColor}
                onRoll={handleRollDice}
                size="md"
              />
            </div>
          </div>

          {/* Right Column: Green & Yellow Players + Live Feed (desktop) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
            {greenPlayer.isActive && (
              <PlayerCard
                player={greenPlayer}
                isCurrentTurn={activeColor === 'green'}
                turnPhase={turnPhase}
                currentDiceValue={diceValue}
                isRolling={isRolling}
                onRollDice={handleRollDice}
                canRoll={activeColor === 'green' && turnPhase === 'ROLL'}
                gameMode={gameMode}
              />
            )}
            {yellowPlayer.isActive && (
              <PlayerCard
                player={yellowPlayer}
                isCurrentTurn={activeColor === 'yellow'}
                turnPhase={turnPhase}
                currentDiceValue={diceValue}
                isRolling={isRolling}
                onRollDice={handleRollDice}
                canRoll={activeColor === 'yellow' && turnPhase === 'ROLL'}
                gameMode={gameMode}
              />
            )}
            <GameLog logs={logs} />
          </div>

          {/* Mobile: Player summary cards */}
          <div className="lg:hidden w-full grid grid-cols-2 gap-2 mt-2">
            {players
              .filter((p) => p.isActive)
              .map((p) => (
                <div
                  key={p.color}
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    p.color === activeColor
                      ? 'bg-stone-900 border-amber-400 shadow-md ring-1 ring-amber-400'
                      : 'bg-stone-900/60 border-stone-800 opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLOR_CONFIG[p.color].hex }}
                      />
                      <span className="font-semibold text-stone-200 truncate">
                        {p.name}
                      </span>
                    </div>
                    {p.rank && (
                      <span className="text-[10px] text-amber-400 font-bold">
                        #{p.rank}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Home: {p.tokens.filter((t) => t.step === 56).length}/4
                    {gameMode === '2vs2' && p.team && (
                      <span className="ml-1 text-amber-300 font-medium">
                        ({p.team === 'team-alpha' ? 'Team A' : 'Team B'})
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Mobile Live Feed */}
          <div className="lg:hidden w-full mt-2">
            <GameLog logs={logs} />
          </div>
        </div>
      </main>

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Match Setup Modal */}
      <GameSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartGame={handleStartCustomMatch}
        currentPlayers={players}
        currentMode={gameMode}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={isVictoryOpen}
        players={players}
        gameMode={gameMode}
        onPlayAgain={handleResetGame}
        onNewSetup={() => {
          setIsVictoryOpen(false);
          setIsSetupOpen(true);
        }}
      />
    </div>
  );
}
