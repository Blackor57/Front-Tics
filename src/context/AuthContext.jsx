import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('simap_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('simap_token');
  });
  const [isLoading, setIsLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('simap_token');
      if (storedToken) {
        try {
          const me = await authAPI.getMe();
          setUser(me);
          localStorage.setItem('simap_user', JSON.stringify(me));
        } catch {
          const savedUser = localStorage.getItem('simap_user');
          if (!savedUser) {
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (payload) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(payload);
      const { access_token, user: loggedUser } = response;

      localStorage.setItem('simap_token', access_token);
      localStorage.setItem('simap_user', JSON.stringify(loggedUser));
      setToken(access_token);
      setUser(loggedUser);

      toast.success('¡Sesión iniciada con éxito!', {
        description: `Bienvenido de nuevo, ${loggedUser.nombre_completo || loggedUser.email}`,
      });
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.';
      toast.error('Error de autenticación', { description: message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(payload);
      const { access_token, user: newUser } = response;

      localStorage.setItem('simap_token', access_token);
      localStorage.setItem('simap_user', JSON.stringify(newUser));
      setToken(access_token);
      setUser(newUser);

      toast.success('¡Cuenta creada exitosamente!', {
        description: `Bienvenido a SIMAP, ${newUser.nombre_completo || newUser.email}`,
      });
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'No se pudo registrar la cuenta.';
      toast.error('Error de registro', { description: message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('simap_token');
    localStorage.removeItem('simap_user');
    setToken(null);
    setUser(null);
    toast.info('Sesión cerrada correctamente');
  };

  const setDemoUser = () => {
    const demoUser = {
      id: 999,
      email: 'investigador.senior@simap.ai',
      nombre_completo: 'Analista de Inteligencia',
      is_active: true,
      is_superuser: false,
      created_at: new Date().toISOString(),
    };
    const demoToken = 'demo-jwt-simap-token';
    localStorage.setItem('simap_token', demoToken);
    localStorage.setItem('simap_user', JSON.stringify(demoUser));
    setToken(demoToken);
    setUser(demoUser);
    toast.success('Modo Demostración Activado', {
      description: 'Has ingresado con la cuenta de Analista de Inteligencia.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
