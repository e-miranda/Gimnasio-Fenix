import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Award,
  Zap,
  Flame,
  Bike,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Discipline, GymFacility, Membership, Product, User } from '../../types/laravel';
import { ImageCarousel } from '../common/ImageCarousel';

interface MemberDashboardProps {
  user: User;
  membership?: Membership;
  disciplines: Discipline[];
  allDisciplines: Discipline[];
  onToggleDiscipline: (disciplineId: number) => void;
  recommendedProducts: Product[];
  onAddToCart: (product: Product) => void;
  onNavigateToStore: () => void;
  facilities: GymFacility[];
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  user,
  membership,
  disciplines,
  allDisciplines,
  onToggleDiscipline,
  recommendedProducts,
  onAddToCart,
  onNavigateToStore,
  facilities,
}) => {
  const getDisciplineIcon = (name: string) => {
    switch (name) {
      case 'Musculación':
        return Dumbbell;
      case 'Crossfit':
        return Flame;
      case 'Spinning':
        return Bike;
      case 'Funcional':
      default:
        return Activity;
    }
  };

  const classesForToday = [
    {
      time: '08:00 - 09:30',
      discipline: 'Musculación',
      title: 'Hipertrofia Tren Superior & Core',
      room: 'Sala de Pesas Libre - Zona A',
      trainer: 'Coach Marcus',
      intensity: 'Alta',
    },
    {
      time: '18:30 - 19:30',
      discipline: 'Crossfit',
      title: 'WOD: Olympic Snatch & Metcon',
      room: 'The Box WOD 1',
      trainer: 'Coach Brenda',
      intensity: 'Extrema',
    },
    {
      time: '19:30 - 20:15',
      discipline: 'Spinning',
      title: 'Interval Ride: Sprint & Climbs',
      room: 'Studio Ciclo Indoor',
      trainer: 'Coach Sofía',
      intensity: 'Media-Alta',
    },
    {
      time: '17:00 - 18:00',
      discipline: 'Funcional',
      title: 'Mobility & Kettlebell Flow',
      room: 'Área TRX & Mobility',
      trainer: 'Coach Daniel',
      intensity: 'Media',
    },
  ].filter((c) => disciplines.some((d) => d.name === c.discipline));

  const isVip = membership?.tier_name === 'VIP';
  const daysLeft = membership
    ? Math.max(
        0,
        Math.ceil(
          (new Date(membership.end_date).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/40 border border-slate-800 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-red-500/60 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {user.name}
                </h1>
                {isVip && (
                  <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded uppercase tracking-wider font-mono shadow-md shadow-red-600/30">
                    VIP PASS
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                <span>{user.email}</span>
                <span className="text-slate-600">·</span>
                {user.social_provider ? (
                  <span className="text-xs text-red-400 font-mono">
                    OAuth: {user.social_provider.toUpperCase()}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-mono">
                    Email Tradicional
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                Disciplinas
              </div>
              <div className="text-xl font-bold text-red-400 font-mono">
                {disciplines.length} Activas
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                Vigencia Plan
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {daysLeft} días
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FACILITIES & ZONES INTERACTIVE CAROUSEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-500" />
            <h2 className="text-base sm:text-lg font-bold text-white font-mono">
              CONOCE NUESTRAS INSTALACIONES // CARRUSEL DE SEDES
            </h2>
          </div>
          <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
            {facilities.length} Zonas Exclusivas
          </span>
        </div>

        {/* Carousel of Gym Facilities */}
        <div className="rounded-xl overflow-hidden border border-slate-800">
          <ImageCarousel
            images={facilities.map((f) => f.image_url)}
            alt="Sedes Fenix GYM"
            aspectRatio="wide"
            autoPlay={true}
            interval={5000}
            showThumbnails={true}
            title={facilities[0]?.title}
            subtitle={facilities[0]?.tagline}
            badge="ZONA DE ENTRENAMIENTO"
          />
        </div>
      </div>

      {/* Grid: Membership status + Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Membership Eloquent Entity with Bolivianos (Bs.) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-red-400" />
                Membresía Activa (Eloquent)
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Vigente
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900/90 border border-slate-700/60 mb-4">
              <div className="text-xs text-slate-400 uppercase font-mono">Plan Contratado</div>
              <div className="text-2xl font-black text-white mt-0.5 flex items-center justify-between">
                <span>{membership?.tier_name || 'Regular'} Tier</span>
                <span className="text-base text-red-400 font-mono font-bold">
                  {isVip ? 'Bs. 399 / mes' : 'Bs. 279 / mes'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Válido hasta: <strong className="text-slate-200">{membership?.end_date}</strong>
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Acceso a instalaciones</span>
                <span className="font-semibold text-white">24/7 Ilimitado</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Descuento en tienda</span>
                <span className="font-semibold text-red-400">{isVip ? '15% VIP' : '5%'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Invitados por mes</span>
                <span className="font-semibold text-white">{isVip ? '2 Pases Gratis' : 'Ninguno'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            Relación: User-&gt;hasOne(Membership::class)
          </div>
        </div>

        {/* Center & Right Column: Enrolled Disciplines & Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Disciplines Management (Many-to-Many Pivot) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-500" />
                  Disciplinas Inscritas (Pivot Table: discipline_user)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Haz clic para activar o desactivar disciplinas y observa cómo el motor de e-commerce recalcula las recomendaciones en Bs. en vivo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {allDisciplines.map((d) => {
                const Icon = getDisciplineIcon(d.name);
                const isEnrolled = disciplines.some((x) => x.id === d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => onToggleDiscipline(d.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      isEnrolled
                        ? 'bg-slate-800/90 border-red-500/60 shadow-lg shadow-red-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isEnrolled ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isEnrolled
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isEnrolled ? 'ACTIVA' : 'INACTIVA'}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white">{d.name}</div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {d.weekly_classes} clases/sem
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's Schedule for User */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Clases de Hoy para tus Disciplinas
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            </div>

            {classesForToday.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  No tienes clases hoy para tus disciplinas activas. Activa una disciplina arriba para ver el cronograma.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {classesForToday.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-red-400 font-bold">{c.time}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                        Intensidad: {c.intensity}
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm">{c.title}</div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                      <span>{c.room}</span>
                      <span className="text-slate-300 font-medium">{c.trainer}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INTELLIGENT CROSS-SELLING SECTION (SCOPE RECOMMENDED FOR IN BS.) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/20 border border-red-500/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-red-400 font-mono font-semibold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Eloquent Local Scope: Product::scopeRecommendedFor($query, $user)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Venta Cruzada Inteligente en Bolivianos (Bs.)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Productos seleccionados evaluando los tags JSON en MySQL 8.0 según tus disciplinas:{' '}
              <span className="text-red-300 font-semibold font-mono">
                [{disciplines.map((d) => d.name).join(', ') || 'Ninguna'}]
              </span>
            </p>
          </div>

          <button
            onClick={onNavigateToStore}
            className="self-start sm:self-center flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Cards with Mini Image Carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-red-500/60 rounded-xl overflow-hidden flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Carousel for product images */}
                <div className="relative">
                  <ImageCarousel
                    images={product.images && product.images.length > 0 ? product.images : [product.image_url]}
                    alt={product.name}
                    aspectRatio="square"
                    autoPlay={false}
                    className="rounded-t-xl"
                  />
                  <div className="absolute top-2 left-2 z-20">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900/90 text-red-400 border border-slate-700">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 z-20">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/80 text-emerald-400">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-red-400 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {product.description}
                  </p>

                  {/* JSON tags inspection */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-800/80 mt-2">
                <div>
                  <div className="text-[9px] text-slate-500 font-mono uppercase">Moneda Oficial</div>
                  <div className="text-lg font-black text-red-400 font-mono">
                    Bs. {product.price.toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={() => onAddToCart(product)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Architecture Footnote */}
        <div className="mt-6 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>
            Query SQL generada:{' '}
            <code className="text-red-300">
              SELECT * FROM products WHERE is_active = 1 AND stock &gt; 0 AND (JSON_CONTAINS(tags, &apos;&quot;musculacion&quot;&apos;) OR category = &apos;supplement&apos;)
            </code>
          </span>
          <span className="text-slate-500">Precios indexados en Bolivianos (Bs.)</span>
        </div>
      </div>
    </div>
  );
};
