import React from 'react';

interface JoinRoomModalProps {
  onClose: () => void;
  onJoin: (code: string) => Promise<void>;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ onClose, onJoin }) => {
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isJoining, setIsJoining] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsJoining(true);
    setError(null);
    try {
      await onJoin(code);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
      setIsJoining(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    if (error) setError(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Join Game</h2>
        <p>Enter the 6-digit code shared by your friend.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="room-code">Room Code</label>
            <input
              id="room-code"
              type="text"
              placeholder="000 000"
              value={code}
              onChange={handleInputChange}
              className="room-code-input"
              autoFocus
              disabled={isJoining}
            />
          </div>

          <button 
            type="submit" 
            className="modal-submit-button"
            disabled={isJoining || code.length !== 6}
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
};
