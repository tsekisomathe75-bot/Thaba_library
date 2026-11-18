import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('library_user'));
  } catch (err) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const saveSession = (data) => {
    localStorage.setItem('library_token', data.token);
    localStorage.setItem('library_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (membershipId, password) => {
    saveSession(await api('/auth/login', { method: 'POST', body: { membershipId, password } }));
  };

  // sign up as a member, then straight into the app
  const register = async (name, membershipId, password) => {
    saveSession(await api('/auth/register', { method: 'POST', body: { name, membershipId, password } }));
  };

  const logout = useCallback(() => {
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_user');
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener('library:unauthorized', logout);
    return () => window.removeEventListener('library:unauthorized', logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
