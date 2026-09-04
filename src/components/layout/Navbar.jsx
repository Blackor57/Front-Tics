import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Radar,
  Moon,
  Sun,
  LogOut,
  Activity,
  FileText,
  Search,
  Menu,
  X,
  Sparkles,
  Server,
  ShieldCheck,
} from 'lucide-react';

export const Navbar = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  backendOnline,
  demoModeActive,
  onToggleDemoMode,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('analyzer')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-glow-indigo">
              <Radar className="w-6 h-6 animate-pulse-slow" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-brand-600 to-indigo-600 dark:from-white dark:via-brand-300 dark:to-indigo-300">
                  SIMAP
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  v2.5 AI
                </span>
              </div>
              <p className="hidden md:block text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
                Universal Scraper & Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onSelectTab('analyzer')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'analyzer'
                  ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Analizador & Preview</span>
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  onOpenAuth('login');
                } else {
                  onSelectTab('tracking');
                }
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'tracking'
                  ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Monitoreo Continuo</span>
              {!isAuthenticated && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Auth
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('reports')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'reports'
                  ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Historial</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={onToggleDemoMode}
              title={
                demoModeActive
                  ? 'Modo Demo Activo (Haz clic para alternar a Backend en vivo)'
                  : backendOnline
                  ? 'Conectado a FastAPI en localhost:8000'
                  : 'Backend offline. Clic para forzar Modo Demo'
              }
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                demoModeActive
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : backendOnline
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  demoModeActive
                    ? 'bg-amber-500 animate-pulse'
                    : backendOnline
                    ? 'bg-emerald-500'
                    : 'bg-rose-500'
                }`}
              />
              <Server className="w-3 h-3" />
              <span>{demoModeActive ? 'Modo Demo' : backendOnline ? 'API 8000' : 'Desconectado'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 pl-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-brand-500 transition-all text-xs font-semibold"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-[11px]">
                    {(user.nombre_completo || user.email).charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.nombre_completo || user.email}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl glass-dropdown border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {user.nombre_completo || 'Usuario SIMAP'}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium text-[10px]">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Sesión JWT Activa</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onSelectTab('tracking');
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Mis Monitoreos Activos</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onSelectTab('reports');
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Mis Reportes Descargables</span>
                    </button>

                    <div className="border-t border-slate-200 dark:border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-lg shadow-sm hover:shadow-glow-indigo transition-all flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Crear Cuenta</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-4 space-y-2 text-sm">
          <button
            onClick={() => {
              onSelectTab('analyzer');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg font-medium ${
              currentTab === 'analyzer'
                ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Analizador & Preview</span>
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                onOpenAuth('login');
              } else {
                onSelectTab('tracking');
              }
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg font-medium ${
              currentTab === 'tracking'
                ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Monitoreo Continuo</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('reports');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg font-medium ${
              currentTab === 'reports'
                ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Historial de Reportes</span>
          </button>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={onToggleDemoMode}
              className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{demoModeActive ? 'Modo Demo Activo' : 'Backend Real'}</span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-rose-500 font-semibold"
              >
                Cerrar Sesión
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800"
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1 text-xs text-white rounded bg-brand-600"
                >
                  Registro
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
