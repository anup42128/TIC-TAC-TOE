import React from 'react';
import Square from './Square';
import type { Player } from '../hooks/useGameLogic';

interface BoardProps {
  squares: Player[];
  onClick: (i: number) => void;
  winningLine: number[] | null;
}

const Board: React.FC<BoardProps> = ({ squares, onClick, winningLine }) => {
  return (
    <div className="board">
      {squares.map((square, i) => (
        <Square
          key={i}
          value={square}
          onClick={() => onClick(i)}
          isWinningSquare={winningLine?.includes(i) ?? false}
        />
      ))}
    </div>
  );
};

export default Board;
