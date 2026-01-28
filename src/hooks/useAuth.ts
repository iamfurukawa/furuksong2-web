import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('soundboard-user');
    if (storedUser) {
      setUser({ name: storedUser });
    }
    setIsLoading(false);
  }, []);

  const login = (name: string) => {
    setUser({ name });
    localStorage.setItem('soundboard-user', name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('soundboard-user');
  };

  return { user, isLoading, login, logout };
};
