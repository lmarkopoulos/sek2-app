import React, { useState } from 'react';
import { useAuth } from '../services/auth';
import { FaUserCircle } from 'react-icons/fa';
import { useLocation, useNavigate, Link } from 'react-router-dom';


interface HeaderProps {
  setTab?: (t: string) => void; // optional, safe fallback
}

const Header: React.FC<HeaderProps> = ({ setTab }) => {
  const { token, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();   // ✅ know current route
  const [open, setOpen] = useState(false);

  function handleSelectTab(key: string) {
    console.log("Switching tab ->", key);

    if (location.pathname.startsWith('/dashboard')) {
      // ✅ already inside dashboard
      if (setTab) setTab(key);
    } else {
      // ✅ outside dashboard, navigate there with state
      nav('/dashboard', { state: { tab: key } });
    }

    setOpen(false);
  }


  return (
    <header className="app-header">
      {/* LEFT: Dropdown menu if logged in, else Σύνδεση */}
      <div className="left" style={{ position: 'relative' }}>
        {!token ? (
          <Link className="btn" to="/login">Σύνδεση</Link>
        ) : (
          <div className="dropdown">
            <button
              className="icon-btn"
              onClick={() => setOpen(!open)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {(FaUserCircle as any)({ size: 28, color: "#00612e" })} {/* union green */}
            </button>

            {open && (
              <div
                className="dropdown-menu"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  padding: '8px 0',
                  zIndex: 1000,
                  minWidth: '160px'
                }}
              >
                {[
                  { key: 'home', label: 'Αρχική' },
                  { key: 'account', label: 'Λογαριασμός' },
                  { key: 'votings', label: 'Ψηφοφορίες' },
                  { key: 'payment', label: 'Πληρωμές' }
                ].map(item => (
                  <span
                    key={item.key}
                    className="dropdown-item"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      color: '#00612e',
                      fontWeight: 500
                    }}
                    onClick={() => handleSelectTab(item.key)}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f0f9f0')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CENTER: Brand (tap to go Home) */}
      <div className="brand" onClick={() => nav('/')} style={{ cursor: 'pointer' }}>
        <img src="/assets/sek.png" className="logo" alt="SEK logo" />
      </div>

      {/* RIGHT: Register / Logout */}
      <div className="right">
        {!token ? (
          <button className="btn" onClick={() => nav('/register')}>Εγγραφή</button>
        ) : (
          <button className="btn" onClick={() => { logout(); nav('/'); }}>Αποσύνδεση</button>
        )}
      </div>
    </header>
  );
};

export default Header;
