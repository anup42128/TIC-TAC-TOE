import React from 'react';

interface SquareProps {
  value: 'X' | 'O' | null;
  onClick: () => void;
  isWinningSquare: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare }) => {
  return (
    <button
      className={`square ${isWinningSquare ? 'winning' : ''}`}
      onClick={onClick}
      disabled={value !== null}
    >
      {value === 'X' && (
        <svg viewBox="0 0 100 100" className="icon x-icon">
          <path d="M 20 20 L 80 80" />
          <path d="M 80 20 L 20 80" />
        </svg>
      )}
      {value === 'O' && (
        <svg viewBox="0 0 100 100" className="icon o-icon">
          <circle cx="50" cy="50" r="35" />
        </svg>
      )}
    </button>
  );
};

export default Square;
