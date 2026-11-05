import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { CommunityPost, Discipline, StoryItem, User } from '../../types/laravel';
import { SEED_STORIES } from '../../data/gymData';

interface CommunityFeedProps {
  posts: CommunityPost[];
  currentUser: User;
  onLikePost: (postId: number) => void;
  onUploadPost: (newPost: {
    caption: string;
    image_url: string;
    discipline_tag?: string;
    original_size: string;
    webp_size: string;
  }) => void;
  onToggleApprove: (postId: number, approved: boolean) => void;
  disciplines: Discipline[];
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  posts,
  currentUser,
  onLikePost,
  onUploadPost,
  onToggleApprove,
  disciplines,
}) => {
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [filterDiscipline, setFilterDiscipline] = useState<string>('all');
  const [caption, setCaption] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('Musculación');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80'
  );
  const [isProcessingWebp, setIsProcessingWebp] = useState<boolean>(false);

  // Active Story Modal State
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);

  const sampleImages = [
    {
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      label: 'Mancuernas & Pesas Libres',
      discipline: 'Musculación',
      rawSize: '4.8 MB (JPG)',
      webpSize: '165 KB (-96%)',
    },
    {
      url: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&auto=format&fit=crop&q=80',
      label: 'Box Crossfit & Kettlebells',
      discipline: 'Crossfit',
      rawSize: '3.9 MB (PNG)',
      webpSize: '142 KB (-96%)',
    },
    {
      url: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&auto=format&fit=crop&q=80',
      label: 'Spinning Sprint Indoor',
      discipline: 'Spinning',
      rawSize: '5.2 MB (JPG)',
      webpSize: '180 KB (-97%)',
    },
    {
      url: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&auto=format&fit=crop&q=80',
      label: 'TRX Movilidad Funcional',
      discipline: 'Funcional',
      rawSize: '3.6 MB (JPG)',
      webpSize: '135 KB (-96%)',
    },
    {
      url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
      label: 'Peso Muerto Competición',
      discipline: 'Musculación',
      rawSize: '4.1 MB (JPG)',
      webpSize: '155 KB (-96%)',
    },
    {
      url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&auto=format&fit=crop&q=80',
      label: 'Murph WOD Celebración',
      discipline: 'Crossfit',
      rawSize: '5.5 MB (PNG)',
      webpSize: '190 KB (-96%)',
    },
  ];

  const filteredPosts = posts.filter((p) => {
    const canSee = currentUser.role === 'admin' || p.approved_by_admin || p.user_id === currentUser.id;
    if (!canSee) return false;

    if (filterDiscipline === 'all') return true;
    return p.discipline_tag?.toLowerCase() === filterDiscipline.toLowerCase();
  });

  const handleSimulateSubmit = () => {
    if (!caption.trim()) return;

    setIsProcessingWebp(true);
    setTimeout(() => {
      const match = sampleImages.find((s) => s.url === selectedImageUrl) || sampleImages[0];
      onUploadPost({
        caption,
        image_url: selectedImageUrl,
        discipline_tag: selectedDiscipline,
        original_size: match.rawSize,
        webp_size: match.webpSize,
      });
      setIsProcessingWebp(false);
      setShowUploadModal(false);
      setCaption('');
    }, 700);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-red-400 font-mono font-semibold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30 mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>Módulo 3: Comunidad &amp; Prueba Social (FitGram Red Edition)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            FITGRAM // FENIX COMMUNITY
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Prueba social con subida optimizada en WebP mediante la Storage API de Laravel y carrusel dinámico de Stories de atletas y entrenadores.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30 active:scale-95 whitespace-nowrap self-start md:self-center"
        >
          <Camera className="w-4 h-4" />
          <span>Subir Mi Entrenamiento</span>
        </button>
      </div>

      {/* STORIES CAROUSEL (Instagram-like Stories) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            Stories en Vivo de la Comunidad
          </span>
          <span className="text-[11px] font-mono text-red-400">
            {SEED_STORIES.length} Actualizaciones
          </span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto scrollbar-none py-2 px-1">
          {SEED_STORIES.map((story) => (
            <button
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="flex flex-col items-center gap-1.5 group shrink-0 focus:outline-none"
            >
              <div
                className={`w-16 h-16 rounded-full p-0.5 transition-all group-hover:scale-105 ${
                  story.has_unseen
                    ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-red-400 ring-2 ring-red-500/30'
                    : 'bg-slate-700'
                }`}
              >
                <img
                  src={story.user_avatar}
                  alt={story.user_name}
                  className="w-full h-full rounded-full object-cover border-2 border-slate-950"
                />
              </div>
              <span className="text-[11px] font-medium text-slate-300 group-hover:text-red-400 transition-colors truncate max-w-[70px]">
                {story.user_name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Moderation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-slate-500 font-mono text-[11px] mr-1">Filtrar:</span>
          {['all', 'Musculación', 'Crossfit', 'Spinning', 'Funcional'].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDiscipline(d)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterDiscipline === d
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {d === 'all' ? 'Todos los Feeds' : d}
            </button>
          ))}
        </div>

        {currentUser.role === 'admin' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-500/30 rounded-lg text-red-400 font-mono text-[11px]">
            <Shield className="w-3.5 h-3.5" />
            <span>Modo Moderador Activo: Puedes aprobar o rechazar posts</span>
          </div>
        )}
      </div>

      {/* Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => {
          const isPending = !post.approved_by_admin;
          return (
            <article
              key={post.id}
              className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                isPending ? 'border-red-500/60 ring-1 ring-red-500/30' : 'border-slate-800'
              }`}
            >
              {/* Card Header: Author info */}
              <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 p-0.5 ring-1 ring-red-500/60">
                    <img
                      src={
                        post.user?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={post.user?.name || 'Miembro'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>{post.user?.name || 'Miembro Fenix'}</span>
                      {post.discipline_tag && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-red-400">
                          {post.discipline_tag}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(post.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                {isPending ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                    <Clock className="w-3 h-3" />
                    PENDIENTE MODERACIÓN
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Aprobado
                  </span>
                )}
              </div>

              {/* Main Image with WebP Overlay */}
              <div className="relative aspect-4/3 overflow-hidden bg-slate-950 group">
                <img
                  src={post.image_url}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />

                {/* Storage WebP compression badge */}
                <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] font-mono text-slate-300 flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Storage: WebP {post.webp_optimized_size || '150 KB'}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">{post.original_size || '3.5 MB original'}</span>
                </div>
              </div>

              {/* Card Footer: Actions & Caption */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-transform active:scale-125 ${
                        post.is_liked_by_me ? 'text-red-500' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${post.is_liked_by_me ? 'fill-red-500 text-red-500' : ''}`}
                      />
                      <span>{post.likes_count} likes</span>
                    </button>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <MessageCircle className="w-4 h-4" />
                      <span>Comentarios</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    MySQL: approved={post.approved_by_admin ? '1' : '0'}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  <strong className="text-white mr-1.5">{post.user?.name}:</strong>
                  {post.caption}
                </p>

                {/* Admin Moderation Button */}
                {currentUser.role === 'admin' && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Control Administrador:
                    </span>
                    <button
                      onClick={() => onToggleApprove(post.id, !post.approved_by_admin)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        post.approved_by_admin
                          ? 'bg-slate-800 text-slate-300 hover:bg-red-500/20 hover:text-red-400'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md'
                      }`}
                    >
                      {post.approved_by_admin ? 'Desaprobar Post' : 'Aprobar para Feed'}
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* STORY VIEWER MODAL */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-slate-900 rounded-2xl overflow-hidden border border-red-500/40 shadow-2xl">
            {/* Top progress bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-slate-800 z-30">
              <div className="h-full bg-red-500 w-full animate-[progress_5s_linear]"></div>
            </div>

            {/* Story header */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <img
                  src={activeStory.user_avatar}
                  alt={activeStory.user_name}
                  className="w-8 h-8 rounded-full border border-red-500 object-cover"
                />
                <div>
                  <div className="text-xs font-bold font-mono">{activeStory.user_name}</div>
                  <div className="text-[10px] text-slate-300">{activeStory.time_ago}</div>
                </div>
              </div>

              <button
                onClick={() => setActiveStory(null)}
                className="w-7 h-7 rounded-full bg-slate-950/60 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Story image */}
            <div className="relative aspect-9/16 bg-slate-950">
              <img
                src={activeStory.image_url}
                alt={activeStory.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60"></div>
              <div className="absolute bottom-6 inset-x-4 text-center">
                <p className="text-sm font-bold text-white font-mono bg-slate-950/80 backdrop-blur-sm p-3 rounded-xl border border-slate-800">
                  {activeStory.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal with Simulated WebP Processing */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-white text-base">
                  Subir Fotografía a la Comunidad
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                ×
              </button>
            </div>

            {/* Image Selection with More Photos */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-2">
                Selecciona Fotografía de Entrenamiento:
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {sampleImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedImageUrl(img.url);
                      setSelectedDiscipline(img.discipline);
                    }}
                    className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      selectedImageUrl === img.url
                        ? 'border-red-500 bg-slate-800'
                        : 'border-slate-800 bg-slate-950 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white truncate">
                        {img.label}
                      </div>
                      <div className="text-[9px] text-red-400 font-mono truncate">
                        WebP: {img.webpSize}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Discipline Tag */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                Disciplina Vinculada:
              </label>
              <select
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {disciplines.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                Descripción o Logro:
              </label>
              <textarea
                rows={3}
                placeholder="¡Rompiendo récords hoy en el gimnasio con la comunidad Fenix!"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              ></textarea>
            </div>

            {/* Laravel Storage & Optimization Notice */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="text-red-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Laravel Storage API Pipeline:</span>
              </div>
              <div>1. Conversión de JPG/PNG a WebP con calidad 82</div>
              <div>2. Almacenamiento en disco &apos;public/community/{'{uuid}'}.webp&apos;</div>
              <div>3. approved_by_admin = false (Moderación preventiva)</div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                disabled={!caption.trim() || isProcessingWebp}
                onClick={handleSimulateSubmit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 active:scale-95 disabled:opacity-50"
              >
                {isProcessingWebp ? 'Optimizando a WebP...' : 'Publicar Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
