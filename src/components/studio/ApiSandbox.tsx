import React, { useState } from 'react';
import { Play, Terminal, Database, Clock, ArrowRight, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { FreePass, Product, User } from '../../types/laravel';

interface ApiSandboxProps {
  currentUser: User;
  freePasses: FreePass[];
  products: Product[];
}

export const ApiSandbox: React.FC<ApiSandboxProps> = ({
  currentUser,
  freePasses,
  products,
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('dashboard');
  const [copied, setCopied] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Custom parameters
  const [guestName, setGuestName] = useState<string>('Fernando Garcés');
  const [guestEmail, setGuestEmail] = useState<string>('fernando.g@gmail.com');
  const [guestPhone, setGuestPhone] = useState<string>('+591 789 54321');
  const [verifyToken, setVerifyToken] = useState<string>(
    freePasses[0]?.qr_code_token || 'PASS-8A7B9C-0192837465'
  );

  const endpoints = [
    {
      id: 'dashboard',
      method: 'GET',
      path: '/api/v1/dashboard',
      title: 'Dashboard del Miembro (DashboardController@index)',
      description: 'Carga membresía actual, clases de sus disciplinas y productos recomendados mediante scopeRecommendedFor.',
      requiresAuth: true,
    },
    {
      id: 'free-pass-store',
      method: 'POST',
      path: '/api/v1/free-passes',
      title: 'Generar Pase Libre 1 Día (FreePassController@store)',
      description: 'Valida reglas anti-abuso (StoreFreePassRequest), genera token QR y dispara evento/notificación.',
      requiresAuth: false,
    },
    {
      id: 'free-pass-verify',
      method: 'POST',
      path: '/api/v1/free-passes/verify/{token}',
      title: 'Verificar & Canjear Pase en Recepción (FreePassController@verify)',
      description: 'Valida token escaneado por torniquete, comprueba si no está expirado o usado, y sella used_at.',
      requiresAuth: false,
    },
    {
      id: 'community-index',
      method: 'GET',
      path: '/api/v1/community-posts',
      title: 'Feed Público de Comunidad (CommunityPostController@index)',
      description: 'Lista posts aprobados con paginación optimizada simplePaginate y autor eager-loaded.',
      requiresAuth: false,
    },
  ];

  const currentEp = endpoints.find((e) => e.id === selectedEndpoint) || endpoints[0];

  const handleCopyResponse = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate simulated response & queries based on selected endpoint
  const getEndpointData = () => {
    switch (selectedEndpoint) {
      case 'dashboard': {
        const recommended = products.slice(0, 3).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          tags: p.tags,
          stock: p.stock,
        }));

        const responseJson = {
          success: true,
          member: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            avatar_url: currentUser.avatar,
            disciplines: [
              { id: 1, name: 'Musculación', slug: 'musculacion' },
              { id: 2, name: 'Crossfit', slug: 'crossfit' },
            ],
          },
          membership: {
            id: 101,
            tier: 'VIP',
            is_vip: true,
            status: 'active',
            is_active: true,
            start_date: '2026-01-15',
            end_date: '2026-12-31',
            days_remaining: 57,
          },
          today_schedule: {
            day: 'Martes',
            date: '04/11/2026',
            classes: [
              {
                time: '08:00 - 09:30',
                discipline: 'Musculación',
                room: 'Sala de Pesas Libre',
                trainer: 'Coach Marcus',
                intensity: 'Alta',
              },
              {
                time: '19:00 - 20:00',
                discipline: 'Crossfit',
                room: 'The Box WOD 2',
                trainer: 'Coach Brenda',
                intensity: 'Extrema',
              },
            ],
          },
          recommended_products: recommended,
        };

        const sqlQueries = [
          {
            sql: 'SELECT * FROM `users` WHERE `id` = 1 LIMIT 1',
            time: '0.42ms',
          },
          {
            sql: 'SELECT * FROM `memberships` WHERE `user_id` = 1 AND `status` = "active" LIMIT 1',
            time: '0.35ms',
          },
          {
            sql: 'SELECT `disciplines`.*, `discipline_user`.`enrolled_at`, `discipline_user`.`level_preference` FROM `disciplines` INNER JOIN `discipline_user` ON `disciplines`.`id` = `discipline_user`.`discipline_id` WHERE `discipline_user`.`user_id` = 1 AND `disciplines`.`is_active` = 1',
            time: '0.61ms',
          },
          {
            sql: "SELECT `id`, `name`, `slug`, `price`, `stock`, `category`, `tags` FROM `products` WHERE `is_active` = 1 AND `stock` > 0 AND (JSON_CONTAINS(`tags`, '\"musculacion\"') OR JSON_CONTAINS(`tags`, '\"crossfit\"') OR `category` = 'supplement') ORDER BY CASE WHEN category = 'supplement' THEN 1 WHEN category = 'equipment' THEN 2 ELSE 3 END ASC, `stock` DESC LIMIT 4",
            time: '1.18ms',
          },
        ];

        return {
          status: '200 OK',
          responseJson,
          sqlQueries,
          requestPayload: null,
        };
      }

      case 'free-pass-store': {
        const payload = {
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          utm_source: 'google_maps_local',
        };

        const responseJson = {
          success: true,
          message:
            '¡Tu Pase Libre de 1 Día ha sido generado exitosamente! Revisa tu correo.',
          data: {
            id: 105,
            guest_name: guestName,
            guest_email: guestEmail,
            qr_code_token: 'PASS-8A7B9C-0192837465',
            qr_svg_url:
              'https://fenixgym.com/api/v1/free-passes/qr/PASS-8A7B9C-0192837465',
            expires_at: '2026-11-06T10:00:00+00:00',
            expires_human: 'en 2 días',
          },
        };

        const sqlQueries = [
          {
            sql: "SELECT count(*) as aggregate FROM `free_passes` WHERE `guest_email` = 'fernando.g@gmail.com' AND `created_at` >= '2026-08-06 10:00:00'",
            time: '0.45ms',
          },
          {
            sql: "INSERT INTO `free_passes` (`guest_name`, `guest_email`, `guest_phone`, `qr_code_token`, `expires_at`, `utm_source`, `updated_at`, `created_at`) VALUES ('Fernando Garcés', 'fernando.g@gmail.com', '+34 689 543 210', 'PASS-8A7B9C-0192837465', '2026-11-06 10:00:00', 'google_maps_local', '2026-11-04 10:00:00', '2026-11-04 10:00:00')",
            time: '1.05ms',
          },
        ];

        return {
          status: '201 Created',
          responseJson,
          sqlQueries,
          requestPayload: payload,
        };
      }

      case 'free-pass-verify': {
        const responseJson = {
          success: true,
          message: '¡Pase libre verificado con éxito! Bienvenido al gimnasio.',
          guest: {
            name: 'Santiago Morales',
            email: 'santiago.m@example.com',
            used_at: new Date().toISOString(),
          },
        };

        const sqlQueries = [
          {
            sql: `SELECT * FROM \`free_passes\` WHERE \`qr_code_token\` = '${verifyToken}' LIMIT 1`,
            time: '0.38ms',
          },
          {
            sql: "UPDATE `free_passes` SET `used_at` = '2026-11-04 10:15:00', `staff_notes` = 'Canjeado en recepción', `updated_at` = '2026-11-04 10:15:00' WHERE `id` = 1",
            time: '0.82ms',
          },
        ];

        return {
          status: '200 OK',
          responseJson,
          sqlQueries,
          requestPayload: { notes: 'Canjeado en recepción' },
        };
      }

      case 'community-index':
      default: {
        const responseJson = {
          success: true,
          data: [
            {
              id: 1,
              user_id: 1,
              image_url:
                'https://storage.fenixgym.com/public/community/post-1.webp',
              caption: '¡Nuevo PR en Peso Muerto: 220kg! 🔥 Constancia pura.',
              approved_by_admin: true,
              likes_count: 142,
              discipline_tag: 'Musculación',
              created_at: '2026-11-03T18:40:00.000000Z',
              user: {
                id: 1,
                name: 'Carlos Mendoza',
                role: 'member',
                avatar_url:
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
              },
            },
          ],
          pagination: {
            current_page: 1,
            has_more: true,
            next_page_url: 'https://fenixgym.com/api/v1/community-posts?page=2',
          },
        };

        const sqlQueries = [
          {
            sql: 'SELECT * FROM `community_posts` WHERE `approved_by_admin` = 1 ORDER BY `id` DESC LIMIT 13',
            time: '0.54ms',
          },
          {
            sql: 'SELECT `id`, `name`, `role`, `avatar_url` FROM `users` WHERE `id` IN (1, 2, 3)',
            time: '0.31ms',
          },
        ];

        return {
          status: '200 OK',
          responseJson,
          sqlQueries,
          requestPayload: null,
        };
      }
    }
  };

  const { status, responseJson, sqlQueries, requestPayload } = getEndpointData();

  const handleExecute = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Laravel 13 API Sandbox &amp; SQL Query Profiler</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono">
            TEST DE ENDPOINTS Y CONSULTAS MYSQL
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Simula las solicitudes HTTP a los controladores clave y observa en tiempo real los encabezados, respuestas JSON formateadas y las consultas SQL generadas por Eloquent.
          </p>
        </div>
      </div>

      {/* Endpoint Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {endpoints.map((ep) => {
          const isSelected = ep.id === selectedEndpoint;
          return (
            <button
              key={ep.id}
              onClick={() => setSelectedEndpoint(ep.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-800 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded ${
                    ep.method === 'POST'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="text-[11px] font-mono text-slate-300 truncate">
                  {ep.path}
                </span>
              </div>
              <div className="text-xs font-bold text-white line-clamp-1">
                {ep.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Sandbox Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-6">
        {/* Request Line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg ${
                currentEp.method === 'POST'
                  ? 'bg-red-600 text-white'
                  : 'bg-cyan-500 text-slate-950'
              }`}
            >
              {currentEp.method}
            </span>
            <code className="text-sm font-mono text-white font-bold">
              {currentEp.path}
            </code>
          </div>

          <button
            onClick={handleExecute}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>{isRunning ? 'Ejecutando...' : 'Enviar Solicitud'}</span>
          </button>
        </div>

        {/* Headers and Auth status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 text-slate-400">
            <div className="text-slate-500 uppercase text-[10px]">HTTP Request Headers:</div>
            <div>Accept: application/json</div>
            <div>Content-Type: application/json</div>
            <div>
              Authorization:{' '}
              {currentEp.requiresAuth ? (
                <span className="text-red-400">Bearer 1|sanctum_token_carlos_mendoza</span>
              ) : (
                <span className="text-slate-600">None (Public)</span>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 text-slate-400">
            <div className="text-slate-500 uppercase text-[10px]">Response Status:</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-400 font-bold">{status}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Laravel 13 Engine</span>
            </div>
          </div>
        </div>

        {/* Dynamic Parameters Editor for POST requests */}
        {requestPayload && (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-red-400 font-bold uppercase">
              Payload Enviado (Request Body):
            </div>
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
              {JSON.stringify(requestPayload, null, 2)}
            </pre>
          </div>
        )}

        {/* SQL Profiler (Telescope / Debugbar simulation) */}
        <div className="p-4 bg-[#0a101d] rounded-xl border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-bold uppercase">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Consultas MySQL 8.0 Ejecutadas por Eloquent ({sqlQueries.length})</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              InnoDB Engine
            </span>
          </div>

          <div className="space-y-2">
            {sqlQueries.map((query, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-2"
              >
                <code className="text-slate-300 leading-relaxed text-[11px] break-all">
                  {query.sql}
                </code>
                <span className="text-[10px] font-bold text-red-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                  {query.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Formatted JSON Response */}
        <div className="p-4 bg-[#070b14] rounded-xl border border-slate-800 space-y-2 relative">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
            <span>JSON Response Body</span>
            <button
              onClick={() => handleCopyResponse(JSON.stringify(responseJson, null, 2))}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar JSON'}</span>
            </button>
          </div>

          <pre className="text-xs font-mono text-emerald-400/90 leading-relaxed max-h-80 overflow-y-auto">
            {JSON.stringify(responseJson, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
