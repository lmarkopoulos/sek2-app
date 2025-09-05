import { App } from '@capacitor/app';
import React, { useEffect, useState } from 'react';
import { Browser } from '@capacitor/browser';
import { useLocation } from 'react-router-dom';
import News from './News';

import {
  sekFees,
  sekOrders,
  sekUserStatus,
  sekCartLink,
  fetchVoting,
  castVote,
  fetchVotingResults
} from '../services/api';
import { useAuth } from '../services/auth';
import { useCheckoutReturn } from '../hooks/useCheckoutReturn';

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
  </div>
);

/* ---------------- Payment ---------------- */
const Payment: React.FC<{ token: string | null }> = ({ token }) => {
  const [fees, setFees] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [f] = await Promise.all([sekFees()]);
        setFees(f || []);
        if (token) {
          const o = await sekOrders(token);
          setOrders(o || []);
        }
      } catch (e: any) {
        setErr(e?.response?.data?.message || 'Σφάλμα φόρτωσης πληρωμών');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function goToCart(productId: number, qty: number = 1) {
    if (!token) {
      alert('Απαιτείται σύνδεση');
      return;
    }

    try {
      const { cart_url } = await sekCartLink(token, productId, qty);
      await Browser.open({ url: cart_url, presentationStyle: 'fullscreen' });
    } catch (err: any) {
      alert(err?.message || 'Αποτυχία μετάβασης στο καλάθι');
    }
  }

  return (
    <div className="card">
      <h3>Συνδρομές / Πληρωμές</h3>
      {loading ? (
        <div>Φόρτωση…</div>
      ) : (
        <>
          {err && <div style={{ color: '#b00020' }}>{err}</div>}
          <h4>Διαθέσιμες συνδρομές</h4>
          <ul className="clean">
            {fees.map((fee: any) => (
              <li key={fee.id} style={{ marginBottom: 8 }}>
                <b>{fee.name}</b> — {fee.price}
                {fee.currency ? ` ${fee.currency}` : '€'}
                <button
                  className="btn"
                  style={{ marginLeft: 8 }}
                  onClick={() => goToCart(fee.id)}
                >
                  Πληρωμή
                </button>
              </li>
            ))}
            {!fees.length && <li>Δεν υπάρχουν διαθέσιμες συνδρομές.</li>}
          </ul>

          <h4 style={{ marginTop: 20 }}>Οι παραγγελίες μου</h4>
          <ul className="clean">
            {orders.map((o: any) => (
              <li key={o.id} style={{ marginBottom: 6 }}>
                #{o.number} — {o.status} — {o.total}
                {o.currency ? ` ${o.currency}` : '€'}
              </li>
            ))}
            {!orders.length && <li>Δεν υπάρχουν παραγγελίες.</li>}
          </ul>
        </>
      )}
    </div>
  );
};

/* ---------------- Private News ---------------- */
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
    import("../services/api").then(({ fetchVotings }) => {
      fetchVotings("open")
        .then(setList)
        .finally(() => setLoading(false));
    });
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
      setError(e?.response?.data?.message || "Vote failed");
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
          {list.map((v) => (
            <li key={v.id} style={{ marginBottom: 12 }}>
              <button
                className="btn btn-outline"
                onClick={() => selectVoting(v.id)}
              >
                {v.title}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setSelected(null);
            setResults(null);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>{selected.title}</h4>
            <div dangerouslySetInnerHTML={{ __html: selected.content }} />

            {selected.open && selected.already_voted === null ? (
              canVote ? (
                <div>
                  <div style={{ margin: "1em 0" }}>Επιλέξτε:</div>
                  {selected.options.map((opt: string, i: number) => (
                    <div key={i} style={{ margin: "8px 0" }}>
                      <button
                        className="btn btn-primary"
                        disabled={voteLoading}
                        onClick={() => handleVote(i)}
                      >
                        {opt}
                      </button>
                    </div>
                  ))}
                  {error && <div style={{ color: "red" }}>{error}</div>}
                </div>
              ) : (
                <div style={{ color: "#d00", margin: "1em 0" }}>
                  Για να ψηφίσετε απαιτείται επαλήθευση κινητού.
                </div>
              )
            ) : (
              <div style={{ margin: "1em 0" }}>
                {selected.already_voted !== null && (
                  <div>
                    <strong>Έχετε ήδη ψηφίσει.</strong>
                  </div>
                )}
                {!selected.open && <div>Η ψηφοφορία έκλεισε.</div>}
              </div>
            )}

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
interface DashboardProps {
  tab?: string;
  setTab?: (t: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tab = 'home', setTab }) => {
  const { token } = useAuth();
  const [status, setStatus] = useState<any>(null);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(tab);

  // Sync tab from props
  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  // Override tab if navigation state provides one (push notification)
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
      if (setTab) setTab(location.state.tab);
    }
  }, [location.state, setTab]);

  useCheckoutReturn(setTab || (() => {}));

  useEffect(() => {
    if (token) sekUserStatus(token).then(setStatus);
  }, [token]);

  return (
    <div>
      {activeTab === 'home' && <News />}
      {activeTab === 'account' && <Account status={status} />}
      {activeTab === 'votings' && <Votings status={status} token={token} />}
      {activeTab === 'payment' && <Payment token={token} />}
    </div>
  );
};

export default Dashboard;
