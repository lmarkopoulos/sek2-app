import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import News from './pages/News';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './services/auth';

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

const App: React.FC = () => (
  <AuthProvider>
    <Layout>
      <Routes>
        <Route path="/" element={<News />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </Layout>
  </AuthProvider>
);

export default App;
