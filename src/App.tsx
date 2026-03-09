import React from 'react';
import Board from './components/Board';
import LandingPage from './components/LandingPage';
import { useGameLogic } from './hooks/useGameLogic';

const App: React.FC = () => {
  const [currentView, setCurrentView] = React.useState<'landing' | 'game'>('landing');
  const [isGuest, setIsGuest] = React.useState(true);
  const [showOptionsMenu, setShowOptionsMenu] = React.useState(false);
  const { board, winner, winningLine, isDraw, handleClick, resetGame, isXNext, isAiMode, toggleAiMode } = useGameLogic();

  const handleStartGame = (guest: boolean) => {
    setIsGuest(guest);
    setCurrentView('game');
  };

  const handleLogout = () => {
    resetGame();
    setShowOptionsMenu(false);
    setCurrentView('landing');
  };

  let status;
  if (winner) {
    status = `Winner: ${winner} 🎉`;
  } else if (isDraw) {
    status = "It's a Draw! 🤝";
  } else {
    status = `Next player: ${isXNext ? 'X' : 'O'}`;
  }

  if (currentView === 'landing') {
    return (
      <div className="game-container">
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        <LandingPage onStart={handleStartGame} />
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="top-controls">
        {isGuest ? (
          <button 
            className="back-button" 
            onClick={() => setCurrentView('landing')}
          >
            ← Home
          </button>
        ) : (
          <button 
            className="back-button" 
            onClick={() => setShowOptionsMenu(true)}
          >
            More Options
          </button>
        )}
        <button 
          className={`ai-toggle ${isAiMode ? 'active' : ''}`} 
          onClick={toggleAiMode}
        >
          {isAiMode ? 'AI Mode: ON' : 'Play with AI'}
        </button>
      </div>

      {showOptionsMenu && (
        <div className="options-overlay" onClick={() => setShowOptionsMenu(false)}>
          <div className="options-card" onClick={(e) => e.stopPropagation()}>
            <button className="options-close" onClick={() => setShowOptionsMenu(false)}>×</button>
            <h2>Options</h2>
            <div className="options-list">
              <button className="options-item disabled">
                Play with Friends <span>(Coming Soon)</span>
              </button>
              <button className="options-item logout-variant" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
      <header className="game-header">
        <h1>Tic Tac Toe</h1>
        <p style={{ color: 'var(--text-secondary)' }}>A Perfect Game Experience</p>
      </header>

      <div className={`status-card ${(winner || isDraw) ? 'winner' : ''}`}>
        {status}
      </div>

      <Board
        squares={board}
        onClick={handleClick}
        winningLine={winningLine}
      />

      {(winner || isDraw) && (
        <button className="reset-button" onClick={resetGame}>
          Play Again
        </button>
      )}
      
      {!winner && !isDraw && board.some(s => s !== null) && (
        <button className="reset-button" onClick={resetGame} style={{ background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>
          Reset
        </button>
      )}
    </div>
  );
};

export default App;
