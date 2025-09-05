import React, { useEffect, useState, ReactElement } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import News from './pages/News';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './services/auth';
import Post from './pages/Post';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { PushNotifications } from '@capacitor/push-notifications';

/* ---------------- Private route ---------------- */
function PrivateRoute({ children }: { children: ReactElement }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

/* ---------------- Layout ---------------- */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tab, setTab] = useState<string>('home');

  return (
    <div className="app">
      <Header setTab={setTab} />

      <main className="container">
        {React.isValidElement(children) && children.type === Dashboard
          ? React.cloneElement(
              children as ReactElement<{ tab: string; setTab: (t: string) => void }>,
              { tab, setTab }
            )
          : children}
      </main>

      <Footer />
    </div>
  );
};

/* ---------------- Root ---------------- */
const Root: React.FC = () => {
  const navigate = useNavigate();
  const { token: authToken } = useAuth(); //get JWT token from your aut
  
  useEffect(() => {
    // === Handle checkout redirects ===
    const sub = CapApp.addListener('appUrlOpen', async (data) => {
      try {
        if (data.url.includes('/thank-you')) {
          await Browser.close();
        }
      } catch {
        /* noop */
      }
    });
    return () => {
      sub.then((s) => s.remove());
    };
  }, []);

  useEffect(() => {
    // === Push Notifications setup ===
    async function initPush() {
      try {
        const permStatus = await PushNotifications.requestPermissions();
        if (permStatus.receive !== 'granted') {
          console.warn('Push permission not granted');
          return;
        }

        await PushNotifications.register();

        PushNotifications.addListener('registration', (token) => {
  console.log('FCM Token:', token.value);

  fetch('https://students.kastoria.teiwm.gr/wp-json/push/v1/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: 'Bearer ' + authToken } : {}), // ✅ include JWT if available
    },
    body: JSON.stringify({ token: token.value }), // ✅ fixed
  })
    .then((res) => res.json())
    .then((data) => console.log('Token saved to WP:', data))
    .catch((err) => console.error('Failed to save token:', err));
});




        PushNotifications.addListener('registrationError', (err) => {
          console.error('Push registration error:', err);
        });

        PushNotifications.addListener('pushNotificationReceived', (notif) => {
          console.log('Push received in foreground:', notif);
          alert(`${notif.title}\n${notif.body}`);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Push action performed:', action.notification);

          const target = action.notification.data?.target;
          if (target === 'votings') {
            navigate('/dashboard', { state: { tab: 'votings' } });
          } else if (target === 'news') {
            navigate('/', { replace: true });
          }
        });
      } catch (err) {
        console.error('Push init failed:', err);
      }
    }

    initPush();
  }, [navigate, authToken]);  //depend on authToken

  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <News />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/post/:id"
          element={
            <Layout>
              <Post />
            </Layout>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

export default Root;
