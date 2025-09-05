import React, { useEffect, useState, ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
      {/* Header always shown */}
      <Header setTab={setTab} />

      <main className="container">
        {React.isValidElement(children) && children.type === Dashboard
          ? React.cloneElement(children as ReactElement<{ tab: string; setTab: (t: string) => void }>, { tab, setTab })
          : children}
      </main>

      <Footer />
    </div>
  );
};

/* ---------------- Root ---------------- */
const Root: React.FC = () => {
  useEffect(() => {
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
