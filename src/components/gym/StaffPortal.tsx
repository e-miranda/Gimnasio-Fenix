import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  QrCode,
  Flame,
  Phone,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { CommunityPost, FreePass, User } from '../../types/laravel';

interface StaffPortalProps {
  currentUser: User;
  freePasses: FreePass[];
  onVerifyPass: (token: string) => { success: boolean; message: string };
  posts: CommunityPost[];
  onToggleApprove: (postId: number, approved: boolean) => void;
  users: User[];
}

export const StaffPortal: React.FC<StaffPortalProps> = ({
  currentUser,
  freePasses,
  onVerifyPass,
  posts,
  onToggleApprove,
  users,
}) => {
  const pendingPosts = posts.filter((p) => !p.approved_by_admin);

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-red-400 font-mono font-semibold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Portal Interno de Operaciones &amp; Staff (Fenix GYM)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            RECEPCIÓN, LEADS &amp; MODERACIÓN
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Panel para Entrenadores y Administradores para validar pases QR en torniquete y moderar las fotos de la comunidad.
          </p>
        </div>

        <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-xs font-mono text-slate-300">
          Operando como: <span className="text-red-400 font-bold uppercase">{currentUser.role}</span> ({currentUser.name})
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Pending Community Posts Moderation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-500" />
              <span>Cola de Moderación de Comunidad ({pendingPosts.length})</span>
            </h2>
            <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
              approved_by_admin = 0
            </span>
          </div>

          {pendingPosts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
              <span>¡Excelente! No hay posts pendientes de moderación en la cola.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex gap-4 items-start"
                >
                  <img
                    src={post.image_url}
                    alt={post.caption}
                    className="w-20 h-20 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white truncate">
                        {post.user?.name || 'Miembro'}
                      </span>
                      <span className="text-[10px] font-mono text-red-400">
                        {post.discipline_tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      {post.caption}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => onToggleApprove(post.id, true)}
                        className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprobar</span>
                      </button>
                      <button
                        onClick={() => onToggleApprove(post.id, false)}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Free Pass Leads List & Quick Check-In */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Pases Libres Registrados en Bolivia</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              Total: {freePasses.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {freePasses.map((pass) => {
              const isUsed = pass.used_at !== null;
              return (
                <div
                  key={pass.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="font-bold text-white flex items-center gap-2 truncate">
                      <span>{pass.guest_name}</span>
                      {isUsed ? (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.2 rounded">
                          CANJEADO
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          ACTIVO
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 flex items-center gap-2 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {pass.guest_email}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {pass.guest_phone}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-red-400">
                      Token: {pass.qr_code_token}
                    </div>
                  </div>

                  {!isUsed && (
                    <button
                      onClick={() => onVerifyPass(pass.qr_code_token)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold whitespace-nowrap transition-colors shrink-0 shadow-md shadow-red-600/30"
                    >
                      Check-In
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
