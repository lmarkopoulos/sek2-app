import React, { useState } from 'react';
import { sekRegister, sekRequestOtp, sekVerifyOtp } from '../services/api';

const Register: React.FC = () => {
  const [form, setForm] = useState({ first_name: '', last_name: '', business_name: '', mobile: '', email: '', password: '' });
  const [stage, setStage] = useState<'reg'|'otp'|'done'>('reg');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: string) { setForm(prev => ({ ...prev, [k]: v })); }
  async function onRegister(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setMsg(null);
    try {
      const res = await sekRegister(form);
      setMsg('Registration successful. Check your email for a verification link.');
      setIdentifier(form.mobile); await sekRequestOtp(form.mobile); setStage('otp');
    } catch (e: any) { setErr(e?.response?.data?.message || 'Registration failed'); }
  }
  async function onVerify(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setMsg(null);
    try { await sekVerifyOtp(identifier, otp); setMsg('Το κινητό επαληθεύτηκε! Μπορείτε να συνδεθείτε.'); setStage('done'); }
    catch (e: any) { setErr(e?.response?.data?.message || 'OTP verification failed'); }
  }

  return <div className="card"><h2>Εγγραφή</h2>
    {stage === 'reg' && (<form onSubmit={onRegister}>
      <div><label>Όνομα<br/><input value={form.first_name} onChange={e=>set('first_name', e.target.value)} required/></label></div>
      <div><label>Επώνυμο<br/><input value={form.last_name} onChange={e=>set('last_name', e.target.value)} required/></label></div>
      <div><label>Επωνυμία<br/><input value={form.business_name} onChange={e=>set('business_name', e.target.value)} required/></label></div>
      <div><label>Κινητό<br/><input value={form.mobile} onChange={e=>set('mobile', e.target.value)} required/></label></div>
      <div><label>Email<br/><input type="email" value={form.email} onChange={e=>set('email', e.target.value)} required/></label></div>
      <div><label>Κωδικός<br/><input type="password" value={form.password} onChange={e=>set('password', e.target.value)} required/></label></div>
      {err && <div className="muted">{err}</div>}
      {msg && <div className="muted">{msg}</div>}
      <button className="btn btn-primary" type="submit">Εγγραφή</button>
    </form>)}
    {stage === 'otp' && (<form onSubmit={onVerify}>
      <div><label>Κωδικός OTP (SMS)<br/><input value={otp} onChange={e=>setOtp(e.target.value)} required/></label></div>
      <button className="btn btn-primary" type="submit">Επαλήθευση</button>
      {err && <div className="muted">{err}</div>}
      {msg && <div className="muted">{msg}</div>}
    </form>)}
    {stage === 'done' && (<p>Ολοκληρώθηκε. Μπορείτε να συνδεθείτε από το επάνω δεξί κουμπί.</p>)}
  </div>;
};
export default Register;
