import React from 'react';
import { supabase } from '../supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userData: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = React.useState<'login' | 'signup'>('signup');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const [showPassword, setShowPassword] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    fullName: '',
    username: '',
    password: ''
  });

  if (!isOpen) return null;

  const validateUsername = (username: string) => {
    if (username.length < 3) return 'Username must be at least 3 characters long.';
    if (username.length > 10) return 'Username cannot exceed 10 characters.';
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(username)) return 'Username can only contain letters and numbers.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateUsername(formData.username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase
          .from('profiles')
          .insert([
            { 
              full_name: formData.fullName, 
              username: formData.username, 
              password: formData.password 
            }
          ]);

        if (signUpError) {
          if (signUpError.code === '23505') {
            throw new Error('Username already exists. Please try another one.');
          }
          throw signUpError;
        }

        onAuthSuccess({ id: formData.username, username: formData.username }); // Use username as ID for now
      } else {
        const { data, error: signInError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', formData.username)
          .eq('password', formData.password)
          .single();

        if (signInError || !data) {
          throw new Error('Invalid username or password');
        }

        onAuthSuccess(data);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setError(null);
              setFormData({ fullName: '', username: '', password: '' });
            }}
          >
            Login
          </button>
          <button 
            className={`modal-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setMode('signup');
              setError(null);
              setFormData({ fullName: '', username: '', password: '' });
            }}
          >
            Create Account
          </button>
        </div>

        <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        <p>{mode === 'login' ? 'Log in to your account to continue.' : 'Join the arena and track your progress.'}</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="fullName"
                placeholder="" 
                value={formData.fullName}
                onChange={handleInputChange}
                required 
              />
            </div>
          )}
          
          <div className="input-group">
            <label>Username</label>
            <div className="username-input-wrapper">
              <span className="at-symbol">@</span>
              <input 
                type="text" 
                name="username"
                placeholder="" 
                value={formData.username}
                onChange={handleInputChange}
                required 
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                placeholder="" 
                value={formData.password}
                onChange={handleInputChange}
                required 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <button type="submit" className="modal-submit-button" disabled={loading}>
            {loading ? 'Processing...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
