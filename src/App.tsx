import React, { useEffect, useState } from 'react';
import Board from './components/Board';
import LandingPage from './components/LandingPage';
import { useGameLogic } from './hooks/useGameLogic';
import type { Player } from './hooks/useGameLogic';
import { supabase } from './supabaseClient';
import { JoinRoomModal } from './components/JoinRoomModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'game'>('landing');
  const [isGuest, setIsGuest] = useState(true);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [optionsView, setOptionsView] = useState<'main' | 'friends'>('main');
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  // Multiplayer State
  const [room, setRoom] = useState<any>(null);
  const [userSymbol, setUserSymbol] = useState<Player>(null);
  const [user, setUser] = useState<any>(null);

  const { 
    board, winner, winningLine, isDraw, 
    handleClick, resetGame, isXNext, isAiMode, toggleAiMode 
  } = useGameLogic(room, userSymbol);

  // Auth Session Sync
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Realtime Room Subscription
  useEffect(() => {
    if (!room?.id) return;

    const channel = supabase
      .channel(`room_${room.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'rooms',
        filter: `id=eq.${room.id}` 
      }, (payload) => {
        setRoom(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id]);

  const handleStartGame = (guest: boolean, userData?: any) => {
    setIsGuest(guest);
    if (userData) setUser(userData);
    setCurrentView('game');
  };

  const handleCreateRoom = async () => {
    if (!user) {
      alert('Please log in to create a room!');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code,
        player1_id: user.username,
        player1_name: user.username || 'Player 1',
        status: 'waiting',
        board: Array(9).fill(null),
        is_x_next: true
      })
      .select()
      .single();

    if (error) {
      alert('Failed to create room: ' + error.message);
      return;
    }

    setRoom(data);
    setUserSymbol('X');
    setIsGuest(false);
    setCurrentView('game');
    setShowOptionsMenu(false);
    setOptionsView('main');
  };

  const handleJoinRoom = async (code: string) => {
    if (!user) throw new Error('Please log in to join a room!');

    const { data: rooms, error: findError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .eq('status', 'waiting')
      .neq('player1_id', user.username);

    if (findError) throw findError;
    if (!rooms || rooms.length === 0) throw new Error('Room not found or already full');

    const targetRoom = rooms[0];
    const { data, error: joinError } = await supabase
      .from('rooms')
      .update({
        player2_id: user.username,
        player2_name: user.username || 'Player 2',
        status: 'playing'
      })
      .eq('id', targetRoom.id)
      .select()
      .single();

    if (joinError) throw joinError;

    setRoom(data);
    setUserSymbol('O');
    setIsGuest(false);
    setCurrentView('game');
    setShowJoinModal(false);
    setShowOptionsMenu(false);
    setOptionsView('main');
  };

  const handleMove = async (newBoard: Player[]) => {
    if (!room) return;

    const { error } = await supabase
      .from('rooms')
      .update({
        board: newBoard,
        is_x_next: !isXNext,
        last_activity: new Date().toISOString()
      })
      .eq('id', room.id);

    if (error) console.error('Move update failed:', error);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetGame();
    setUser(null);
    setRoom(null);
    setUserSymbol(null);
    setShowOptionsMenu(false);
    setOptionsView('main');
    setCurrentView('landing');
  };

  const closeOptions = () => {
    setShowOptionsMenu(false);
    setOptionsView('main');
  };

  let statusText;
  if (room && room.status === 'waiting') {
    statusText = "Waiting for Opponent...";
  } else if (winner) {
    statusText = winner === userSymbol ? "You Won! 🎉" : "Opponent Won! 💀";
    if (isGuest || isAiMode) statusText = `Winner: ${winner} 🎉`;
  } else if (isDraw) {
    statusText = "It's a Draw! 🤝";
  } else {
    const turnLabel = isXNext ? 'X' : 'O';
    const isMyTurn = turnLabel === userSymbol;
    statusText = isMyTurn ? "Your Turn! ⭐" : `Waiting for ${turnLabel}...`;
    if (isGuest || isAiMode) statusText = `Next player: ${turnLabel}`;
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
          disabled={!!room}
        >
          {isAiMode ? 'AI Mode: ON' : 'Play with AI'}
        </button>
      </div>

      {room && (
        <div className="room-code-display">
          <span>Room Code:</span>
          <div className="room-code-badge">{room.code}</div>
        </div>
      )}

      {showOptionsMenu && (
        <div className="options-overlay" onClick={closeOptions}>
          <div className="options-card" onClick={(e) => e.stopPropagation()}>
            <button className="options-close" onClick={closeOptions}>×</button>
            <div className="options-header">
              {optionsView === 'friends' && (
                <button className="back-menu-icon" onClick={() => setOptionsView('main')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h2>{optionsView === 'main' ? 'Options' : 'Play with Friends'}</h2>
            </div>
            <div className="options-list">
              {optionsView === 'main' ? (
                <>
                  <button 
                    className="options-item" 
                    onClick={() => {
                      if (room) {
                        if (window.confirm('Leave current game?')) {
                          setRoom(null);
                          setUserSymbol(null);
                          closeOptions();
                          setCurrentView('landing');
                        }
                      } else {
                        closeOptions();
                        setCurrentView('landing');
                      }
                    }}
                  >
                    Return to Home
                  </button>
                  <button className="options-item" onClick={() => setOptionsView('friends')}>
                    Play with Friends
                  </button>
                  <button className="options-item logout-variant" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button className="options-item" onClick={() => setShowJoinModal(true)}>
                    Join A Room
                  </button>
                  <button className="options-item" onClick={handleCreateRoom}>
                    Create A Room
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <JoinRoomModal 
          onClose={() => setShowJoinModal(false)} 
          onJoin={handleJoinRoom} 
        />
      )}
      
      <header className="game-header">
        <h1>Tic Tac Toe</h1>
        <p style={{ color: 'var(--text-secondary)' }}>A Perfect Game Experience</p>
      </header>

      <div className={`status-card ${(winner || isDraw) ? 'winner' : ''}`}>
        {statusText}
        {room && room.status === 'waiting' && <span className="pulsing-dot" />}
      </div>

      <Board
        squares={board}
        onClick={(i) => handleClick(i, room ? handleMove : undefined)}
        winningLine={winningLine}
      />

      {(winner || isDraw) && !room && (
        <button className="reset-button" onClick={resetGame}>
          Play Again
        </button>
      )}
      
      {!winner && !isDraw && !room && board.some(s => s !== null) && (
        <button className="reset-button" onClick={resetGame} style={{ background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>
          Reset
        </button>
      )}
    </div>
  );
};

export default App;
