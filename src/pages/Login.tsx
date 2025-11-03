import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ERROR_MESSAGES, ROUTES, APP_NAME } from '../constants';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError(ERROR_MESSAGES.EMAIL_REQUIRED);
      return;
    }

    const success = login(email);
    if (success) {
      navigate(ROUTES.FEED);
    } else {
      setError(ERROR_MESSAGES.INVALID_EMAIL);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{APP_NAME}</h1>
          <p>Share your startup ideas with the DTU community</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">University Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@dtu.ac.in"
              className="form-input"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        <div className="login-footer">
          <p>Only emails from @dtu.ac.in domain are accepted</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
