import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';

const Header: React.FC = () => {
  const { token, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="app-header">
      <div className="brand" onClick={() => nav('/')} style={{ cursor: 'pointer' }}>
        <img src="/assets/sek.png" className="logo" alt="SEK logo" />
        {/* <strong>SEK</strong>  // uncomment if you want a title */}
      </div>
      <div className="right">
        {!token ? (
          <>
            <button className="btn btn-ghost" onClick={() => nav('/login')}>Login</button>
            <button className="btn btn-primary" onClick={() => nav('/register')}>Register</button>
          </>
        ) : (
          <>
            <button className="btn btn-outline" onClick={() => nav('/dashboard')}>Dashboard</button>
            <button className="btn btn-primary" onClick={() => { logout(); nav('/'); }}>Logout</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
