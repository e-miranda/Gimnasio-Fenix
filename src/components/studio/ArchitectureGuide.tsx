import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Database,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  FileCode,
  ArrowRight
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="inline-flex items-center gap-1.5 text-xs text-red-400 font-mono font-semibold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Documento de Arquitectura de Software Senior</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
          MANIFIESTO TÉCNICO // FENIX GYM LARAVEL 13
        </h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Diseño arquitectónico para una plataforma de gimnasio modular, de alto rendimiento y adaptada al mercado boliviano (precios en Bs.), con carruseles multimedia y moderación social.
        </p>
      </div>

      {/* Grid of 4 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-red-400">
            <Cpu className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">
              1. PHP 8.4+ y Laravel 13 Core
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Se implementa tipado estricto con <code className="text-red-300 font-mono">declare(strict_types=1);</code> en cada archivo. Se aprovechan las novedades de PHP 8.4: property hooks, tipado asimétrico y el nuevo método unificado de casts en modelos de Laravel 11/12/13 (<code className="text-red-300 font-mono">protected function casts(): array</code>).
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800 font-mono">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Estándar de codificación PSR-12 estricto</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Tipos de retorno en todas las relaciones Eloquent</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Sanctum API Tokens con Roles RBAC</span>
            </li>
          </ul>
        </div>

        {/* Pillar 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Database className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">
              2. MySQL 8.0+ JSON &amp; Recomendador
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            El modelo <code className="text-cyan-300 font-mono">Product</code> almacena etiquetas mediante una columna nativa <code className="text-cyan-300 font-mono">JSON tags</code>. El Local Scope <code className="text-cyan-300 font-mono">scopeRecommendedFor</code> correlaciona las disciplinas inscritas del usuario (<code className="text-cyan-300 font-mono">discipline_user</code>) utilizando funciones nativas <code className="text-cyan-300 font-mono">JSON_CONTAINS()</code>.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800 font-mono">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Multi-Valued Index en MySQL 8.0+ para tags</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Priorización ponderada de Suplementos vs Equipamiento</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Fallback automático a productos con stock abundante</span>
            </li>
          </ul>
        </div>

        {/* Pillar 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-rose-400">
            <Layers className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">
              3. Optimización WebP &amp; Moderación
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Las fotografías subidas por miembros en el módulo de comunidad pasan por un pipeline de conversión a WebP con calidad 82%. Esto reduce el tamaño de los archivos en más de un 95% (de ~4MB a ~150KB), ahorrando ancho de banda y acelerando el tiempo de carga del feed tipo Instagram.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800 font-mono">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Storage API con discos intercambiables (S3 / Local)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Moderación preventiva: approved_by_admin = false</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Contador atómico de likes sin bloqueos de tabla</span>
            </li>
          </ul>
        </div>

        {/* Pillar 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">
              4. Captación de Leads &amp; Pase QR Único
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            El sistema de captación local genera un token único (<code className="text-emerald-300 font-mono">qr_code_token</code>) de 64 caracteres. El Form Request previene el abuso permitiendo solo 1 pase por email cada 90 días. Se disparan eventos asíncronos (<code className="text-emerald-300 font-mono">FreePassGenerated</code>) y notificaciones en cola (<code className="text-emerald-300 font-mono">ShouldQueue</code>).
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800 font-mono">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Ventana de expiración automática de 48 horas</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Sello transaccional con timestamp used_at en recepción</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Rate limiting de 5 solicitudes por minuto por IP</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Migration Commands & Artisan Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileCode className="w-4 h-4 text-red-500" />
          <span>Comandos de Instalación &amp; Despliegue en Laravel</span>
        </h3>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <div className="text-slate-500"># 1. Ejecutar las migraciones en orden de dependencia</div>
          <div className="text-emerald-400 font-bold">php artisan migrate</div>
          <div className="text-slate-500 mt-2"># 2. Poblar la base de datos con los seeders de catálogo y disciplinas</div>
          <div className="text-emerald-400 font-bold">php artisan db:seed --class=GymPlatformSeeder</div>
          <div className="text-slate-500 mt-2"># 3. Enlazar el almacenamiento público para fotos de comunidad</div>
          <div className="text-emerald-400 font-bold">php artisan storage:link</div>
          <div className="text-slate-500 mt-2"># 4. Iniciar el procesador de colas para optimización WebP y correos con QR</div>
          <div className="text-emerald-400 font-bold">php artisan queue:work --tries=3</div>
        </div>
      </div>
    </div>
  );
};
