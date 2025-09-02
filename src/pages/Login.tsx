import React, { useState } from 'react';
import { useAuth } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try { await login(username, password); nav('/dashboard'); }
    catch (e: any) { setErr(e?.response?.data?.message || 'Login failed'); }
    finally { setBusy(false); }
  }

  return <div className="card"><h2>Σύνδεση</h2>
    <form onSubmit={onSubmit}>
      <div><label>Username / Email<br/><input value={username} onChange={e=>setUsername(e.target.value)} /></label></div>
      <div><label>Password<br/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label></div>
      {err && <div className="muted">{err}</div>}
      <button className="btn btn-primary" disabled={busy} type="submit">Login</button>
    </form></div>;
};
export default Login;
