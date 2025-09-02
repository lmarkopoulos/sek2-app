import React, { useEffect, useState } from 'react';
import { Browser } from '@capacitor/browser';
import {
  sekFees,
  sekOrders,
  sekUserStatus,
  sekCheckout,
  fetchVotings,
  fetchVoting,
  castVote,
  fetchVotingResults
} from '../services/api';
import { useAuth } from '../services/auth';

/* ---------------- Tabs ---------------- */
const Tabs: React.FC<{ tab: string; setTab: (t: string) => void }> = ({ tab, setTab }) => (
  <div className="tabs">
    <span className={`tab ${tab === 'account' ? 'active' : ''}`} onClick={() => setTab('account')}>Account</span>
    <span className={`tab ${tab === 'votings' ? 'active' : ''}`} onClick={() => setTab('votings')}>Votings</span>
    <span className={`tab ${tab === 'payment' ? 'active' : ''}`} onClick={() => setTab('payment')}>Payment</span>
	<span className={`tab ${tab==='orders'?'active':''}`} onClick={()=>setTab('orders')}>Orders</span>
    <span className={`tab ${tab === 'news' ? 'active' : ''}`} onClick={() => setTab('news')}>Private news</span>
  </div>
);

/* ---------------- Account ---------------- */
const Account: React.FC<{ status: any }> = ({ status }) => (
  <div className="card">
    <h3>Λογαριασμός</h3>
    <div>Όνομα: {status?.profile?.first_name}</div>
    <div>Επώνυμο: {status?.profile?.last_name}</div>
    <div>Επωνυμία: {status?.profile?.business_name}</div>
    <div>Κινητό: {status?.profile?.mobile}</div>
    <div>Email: {status?.profile?.email}</div>
    <div>Τηλ. επιβεβαιωμένο: {status?.phone_verified ? 'Ναι' : 'Όχι'}</div>
    <div>Email επιβεβαιωμένο: {status?.email_verified ? 'Ναι' : 'Όχι'}</div>
  </div>
);

/* ---------------- Payment ---------------- */
const Payment: React.FC<{ token: string | null }> = ({ token }) => {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sekFees().then(setFees).finally(() => setLoading(false));
  }, []);

  async function pay(id: number) {
    if (!token) return;
    try {
      // backend should return { checkout_url }
      const res = await sekCheckout(token, id);
      await Browser.open({
        url: res.checkout_url,
        presentationStyle: 'fullscreen',
      });
    } catch (err) {
      console.error(err);
      alert('Αποτυχία ανοίγματος πληρωμής');
    }
  }

  return (
    <div className="card">
      <h3>Συνδρομές / Πληρωμές</h3>
      {loading ? (
        <div>Φόρτωση...</div>
      ) : (
        <ul className="clean">
          {fees.map((fee) => (
            <li key={fee.id} style={{ marginBottom: 8 }}>
              <b>{fee.name}</b> — {fee.price}€
              <button
                className="btn btn-outline"
                style={{ marginLeft: 8 }}
                onClick={() => pay(fee.id)}
              >
                Πληρωμή
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


/* ---------------- Private News placeholder ---------------- */
const PrivateNews: React.FC = () => (
  <div className="card">
    <h3>Ιδιωτικά Νέα</h3>
    <p>Εδώ μπορείς να εμφανίσεις extra περιεχόμενο ή λινκ προς το public News tab.</p>
  </div>
);

/* ---------------- Votings ---------------- */
const Votings: React.FC<{ status: any; token: string | null }> = ({ status, token }) => {
  const [list, setList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canVote = !!status?.phone_verified;

  useEffect(() => {
    setLoading(true);
    fetchVotings('open').then(setList).finally(() => setLoading(false));
  }, []);

  async function selectVoting(id: number) {
    setSelected(null);
    setResults(null);
    const v = await fetchVoting(id);
    setSelected(v);
    if (!v.open || v.already_voted !== null) {
      try {
        setResults(await fetchVotingResults(id));
      } catch {
        /* ignore */
      }
    }
  }

  async function handleVote(optIdx: number) {
    if (!token || !selected) return;
    setVoteLoading(true);
    setError(null);
    try {
      await castVote(token, selected.id, optIdx);
      await selectVoting(selected.id);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Vote failed');
    } finally {
      setVoteLoading(false);
    }
  }

  return (
    <div className="card">
      <h3>Τρέχουσες Ψηφοφορίες</h3>
      {loading ? (
        <div>Φόρτωση...</div>
      ) : list.length === 0 ? (
        <div>Καμία ενεργή ψηφοφορία.</div>
      ) : (
        <ul className="clean">
          {list.map(v => (
            <li key={v.id} style={{ marginBottom: 12 }}>
              <button className="btn btn-outline" onClick={() => selectVoting(v.id)}>
                {v.title}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Voting details modal */}
      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setSelected(null);
            setResults(null);
          }}
        >
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h4>{selected.title}</h4>
            <div dangerouslySetInnerHTML={{ __html: selected.content }} />

            {/* Main voting ternary */}
            {selected.open && selected.already_voted === null ? (
              canVote ? (
                <div>
                  <div style={{ margin: '1em 0' }}>Επιλέξτε:</div>
                  {selected.options.map((opt: string, i: number) => (
                    <div key={i} style={{ margin: '8px 0' }}>
                      <button className="btn btn-primary" disabled={voteLoading} onClick={() => handleVote(i)}>
                        {opt}
                      </button>
                    </div>
                  ))}
                  {error && <div style={{ color: 'red' }}>{error}</div>}
                </div>
              ) : (
                <div style={{ color: '#d00', margin: '1em 0' }}>Για να ψηφίσετε απαιτείται επαλήθευση κινητού.</div>
              )
            ) : (
              <div style={{ margin: '1em 0' }}>
                {selected.already_voted !== null && <div><strong>Έχετε ήδη ψηφίσει.</strong></div>}
                {!selected.open && <div>Η ψηφοφορία έκλεισε.</div>}
              </div>
            )}

            {/* Results */}
            {results && (
              <div style={{ marginTop: 20 }}>
                <h5>Αποτελέσματα</h5>
                <ul>
                  {results.options.map((opt: string, i: number) => (
                    <li key={i}>
                      {opt}: <strong>{results.counts[i]}</strong> ψήφοι
                    </li>
                  ))}
                </ul>
                <div>Σύνολο: {results.total}</div>
              </div>
            )}

            <div className="row" style={{ marginTop: 16 }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSelected(null);
                  setResults(null);
                }}
              >
                Κλείσιμο
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- Dashboard ---------------- */
const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const [tab, setTab] = useState('account');
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    if (token) sekUserStatus(token).then(setStatus);
  }, [token]);

  return (
    <div>
      <Tabs tab={tab} setTab={setTab} />
      {tab === 'account' && <Account status={status} />}
      {tab === 'votings' && <Votings status={status} token={token} />}
      {tab === 'payment' && <Payment token={token} />}
	  {tab === 'orders' && <Orders token={token} />}
      {tab === 'news' && <PrivateNews />}
    </div>
  );
};
/* ---------------- Orders---------------- */
const Orders: React.FC<{ token: string | null }> = ({ token }) => {
  const [orders, setOrders] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) { setOrders([]); setLoading(false); return; }
      try {
        const data = await sekOrders(token);
        setOrders(data || []);
      } catch (e: any) {
        setErr(e?.response?.data?.message || 'Αποτυχία φόρτωσης παραγγελιών');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <div className="card">
      <h3>Οι παραγγελίες μου</h3>
      {loading ? <div>Φόρτωση…</div> :
        err ? <div style={{ color: 'red' }}>{err}</div> :
        (!orders || orders.length === 0) ? <div className="muted">Δεν υπάρχουν παραγγελίες.</div> :
        <ul className="clean">
          {orders.map((o) => (
            <li key={o.id} className="card" style={{ marginBottom: 10 }}>
              <div className="spread">
                <div><b>#{o.number}</b> — {o.status}</div>
                <div><b>{o.total}</b> {o.currency}</div>
              </div>
              <div className="muted">{o.date_created ? new Date(o.date_created * 1000).toLocaleString() : ''}</div>
              <div className="muted">Πληρωμή: {o.payment_method || '-'}</div>
              <ul>
                {o.items.map((it: any, idx: number) => (
                  <li key={idx}>{it.quantity} × {it.name} — {it.total} {o.currency}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      }
    </div>
  );
};


export default Dashboard;
