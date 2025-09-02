import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin } from './api';

type AuthCtx = {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({
  token: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sek_jwt'));

  useEffect(() => {
    if (token) localStorage.setItem('sek_jwt', token);
    else localStorage.removeItem('sek_jwt');
  }, [token]);

  async function login(username: string, password: string) {
    const data = await apiLogin(username, password);
    setToken(data?.token);
  }
  function logout() { setToken(null); }

  return <Ctx.Provider value={{ token, login, logout }}>{children}</Ctx.Provider>;
};
export function useAuth() { return useContext(Ctx); }
