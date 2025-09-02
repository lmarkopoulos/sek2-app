import React, { useEffect } from 'react';
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

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app">
    <Header />
    <main className="container">{children}</main>
    <Footer />
  </div>
);

const Root: React.FC = () => {
  // Close in-app browser when checkout redirects back to your site
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
    return () => { sub.then(s => s.remove()); };
  }, []);

  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<News />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/post/:id" element={<Post />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
};

export default Root;
