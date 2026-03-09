import React from 'react';
import AuthModal from './AuthModal';

interface LandingPageProps {
  onStart: (isGuest: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  return (
    <div className="landing-container">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={() => onStart(false)}
      />
      
      <div className="hero-section">
        <div className="game-preview">
          <div className="preview-square x">
            <svg viewBox="0 0 100 100" className="icon x-icon">
              <path d="M 20 20 L 80 80" />
              <path d="M 80 20 L 20 80" />
            </svg>
          </div>
          <div className="preview-square o">
            <svg viewBox="0 0 100 100" className="icon o-icon">
              <circle cx="50" cy="50" r="35" />
            </svg>
          </div>
        </div>
        
        <h1 className="hero-title">Tic Tac Toe</h1>
        <p className="hero-subtitle">
          Experience the classic game with a modern, premium twist. 
          Challenge our perfect AI or play with a friend.
        </p>
        <div className="cta-group">
          <button className="cta-button guest" onClick={() => onStart(true)}>
            Play As Guest
          </button>
          <button className="cta-button player" onClick={() => setIsAuthModalOpen(true)}>
            Be A Player
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default LandingPage;
