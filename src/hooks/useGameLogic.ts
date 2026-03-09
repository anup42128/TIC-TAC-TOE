import { useState, useCallback, useEffect } from 'react';

export type Player = 'X' | 'O' | null;

interface MultiplayerRoom {
  board: Player[];
  is_x_next: boolean;
  status: string;
  player1_id: string;
  player2_id: string;
}

export const useGameLogic = (roomData?: MultiplayerRoom | null, userSymbol?: Player) => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [isAiMode, setIsAiMode] = useState<boolean>(false);

  // Sync with multiplayer room data
  useEffect(() => {
    if (roomData) {
      setBoard(roomData.board);
      setIsXNext(roomData.is_x_next);
    }
  }, [roomData]);

  const calculateWinner = (squares: Player[]): { winner: Player; line: number[] | null } => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    return { winner: null, line: null };
  };

  const { winner, line: winningLine } = calculateWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  const minimax = (squares: Player[], depth: number, isMaximizing: boolean): number => {
    const { winner: currentWinner } = calculateWinner(squares);
    if (currentWinner === 'O') return 10 - depth;
    if (currentWinner === 'X') return depth - 10;
    if (squares.every(s => s !== null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (currentBoard: Player[]): number => {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const handleClick = useCallback((index: number, onMove?: (newBoard: Player[]) => void) => {
    if (board[index] || winner || isDraw) return;
    
    // AI Mode guards
    if (isAiMode && !isXNext) return;

    // Multiplayer turn guards
    if (roomData) {
      const currentTurnSymbol = isXNext ? 'X' : 'O';
      if (userSymbol !== currentTurnSymbol) return;
      if (roomData.status !== 'playing') return;
    }

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';

    if (onMove) {
      // In multiplayer, we just trigger the move callback
      onMove(newBoard);
    } else {
      // In local mode, we update state directly
      setBoard(newBoard);
      setIsXNext(!isXNext);
    }
  }, [board, isXNext, winner, isDraw, isAiMode, roomData, userSymbol]);

  useEffect(() => {
    if (isAiMode && !isXNext && !winner && !isDraw) {
      const timer = setTimeout(() => {
        const bestMove = getBestMove([...board]);
        if (bestMove !== -1) {
          const newBoard = [...board];
          newBoard[bestMove] = 'O';
          setBoard(newBoard);
          setIsXNext(true);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isAiMode, isXNext, board, winner, isDraw]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  }, []);

  const toggleAiMode = useCallback(() => {
    setIsAiMode(prev => !prev);
    resetGame();
  }, [resetGame]);

  return {
    board,
    isXNext,
    winner,
    winningLine,
    isDraw,
    isAiMode,
    handleClick,
    resetGame,
    toggleAiMode,
  };
};
