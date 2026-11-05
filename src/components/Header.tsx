import React from 'react';
import { Dumbbell, Code2, Sparkles, ShoppingBag, ShieldCheck, UserCheck, Flame, Layers } from 'lucide-react';
import { User } from '../types/laravel';

interface HeaderProps {
  viewMode: 'app' | 'studio';
  onViewModeChange: (mode: 'app' | 'studio') => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User;
  users: User[];
  onUserChange: (user: User) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  activeTab,
  onTabChange,
  currentUser,
  users,
  onUserChange,
  cartCount,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top micro bar: Architecture & Currency notice (Bs. Bolivianos) */}
      <div className="bg-gradient-to-r from-red-950/40 via-red-900/30 to-slate-950 px-4 py-1.5 border-b border-red-500/20 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-red-400 flex items-center gap-1.5 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Arquitectura Laravel 13 // Moneda Oficial: Bs. (Bolivianos)
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">PHP 8.4+ Strict</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">MySQL 8.0+ JSON Tags</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>Socialite OAuth</span>
          <span className="text-slate-600">·</span>
          <span>WebP Storage</span>
          <span className="text-slate-600">·</span>
          <span>QR Lead Passes</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/30">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider uppercase text-white font-mono">
                FENIX <span className="text-red-500">GYM</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/80">
                PRO PLATFORM
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Gestión Integral, E-Commerce &amp; Comunidad
            </p>
          </div>
        </div>

        {/* View Mode Switcher (App Live Demo vs Laravel Studio) */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onViewModeChange('app')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'app'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Plataforma Web (Live)</span>
          </button>
          <button
            onClick={() => onViewModeChange('studio')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'studio'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Laravel 13 Architecture Studio</span>
          </button>
        </div>

        {/* User Persona & Role Selector */}
        <div className="flex items-center gap-3">
          {/* User selector dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-red-500/60"
            />
            <div className="hidden md:block text-left">
              <div className="font-medium text-slate-200 text-xs leading-none">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-red-400 uppercase font-mono mt-0.5 flex items-center gap-1">
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-2.5 h-2.5 inline" />
                ) : (
                  <UserCheck className="w-2.5 h-2.5 inline" />
                )}
                {currentUser.role}
              </div>
            </div>

            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = users.find((x) => x.id === Number(e.target.value));
                if (u) onUserChange(u);
              }}
              aria-label="Seleccionar rol de usuario activo"
              className="bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Cart Icon with Bolivianos counter */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-red-400 hover:border-red-500/40 transition-colors"
            title="Ver carrito de compras (Bs.)"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-bounce shadow-md shadow-red-600/40">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Secondary Navigation for App Mode */}
      {viewMode === 'app' && (
        <div className="bg-slate-900/60 border-t border-slate-800/80 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
            {[
              { id: 'dashboard', label: 'Mi Dashboard & Membresía', icon: Layers },
              { id: 'store', label: 'E-commerce Inteligente (Bs.)', icon: ShoppingBag, badge: 'Venta Cruzada' },
              { id: 'community', label: 'Comunidad (Prueba Social)', icon: Flame, badge: 'Stories & WebP' },
              { id: 'free-pass', label: 'Pase Libre 1 Día (Leads)', icon: Sparkles, badge: 'QR Dinámico' },
              { id: 'staff', label: 'Recepción & Moderación', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-red-600/20 text-red-400 border border-red-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
