import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'aquashare_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_KEY + '_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEY + '_profile');
    }
  }, [profile]);

  const login = (userData, profileData) => {
    setUser(userData);
    setProfile(profileData || null);
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY + '_profile');
  };

  const updateProfile = (profileData) => {
    setProfile(profileData);
  };

  const isAuthenticated = !!user;
  const role = user?.role || null;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      role,
      login,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
