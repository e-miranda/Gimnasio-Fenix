import React, { useState } from 'react';
import { Database, Key, Link2, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface SchemaTable {
  name: string;
  description: string;
  engine: string;
  columns: {
    name: string;
    type: string;
    isPrimary?: boolean;
    isForeign?: boolean;
    foreignTarget?: string;
    isUnique?: boolean;
    isNullable?: boolean;
    isIndex?: boolean;
    notes?: string;
  }[];
  indexes: string[];
}

export const DatabaseSchemaVisualizer: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('products');

  const tables: SchemaTable[] = [
    {
      name: 'users',
      description: 'Usuarios del gimnasio: Administradores, Entrenadores y Miembros. Soporta inicio tradicional y Socialite.',
      engine: 'InnoDB (MySQL 8.0+)',
      columns: [
        { name: 'id', type: 'BIGINT UNSIGNED', isPrimary: true, notes: 'AUTO_INCREMENT' },
        { name: 'name', type: 'VARCHAR(120)', notes: 'Nombre completo' },
        { name: 'email', type: 'VARCHAR(255)', isUnique: true, notes: 'Credencial principal' },
        { name: 'password', type: 'VARCHAR(255)', isNullable: true, notes: 'Hash Argon2id/Bcrypt' },
        { name: 'role', type: 'ENUM("admin","trainer","member")', isIndex: true, notes: 'Control RBAC' },
        { name: 'social_id', type: 'VARCHAR(255)', isNullable: true, isIndex: true, notes: 'ID Proveedor OAuth' },
        { name: 'social_provider', type: 'VARCHAR(30)', isNullable: true, notes: 'google, apple, etc.' },
        { name: 'active', type: 'TINYINT(1)', isIndex: true, notes: 'Estado de la cuenta' },
        { name: 'avatar_url', type: 'VARCHAR(255)', isNullable: true },
        { name: 'created_at', type: 'TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMP' },
      ],
      indexes: [
        'PRIMARY KEY (id)',
        'UNIQUE INDEX (email)',
        'INDEX (role)',
        'INDEX (active)',
        'INDEX (social_provider, social_id)',
      ],
    },
    {
      name: 'memberships',
      description: 'Membresías activas de miembros (VIP, Regular) con claves foráneas en cascada y fechas de vigencia.',
      engine: 'InnoDB (MySQL 8.0+)',
      columns: [
        { name: 'id', type: 'BIGINT UNSIGNED', isPrimary: true },
        {
          name: 'user_id',
          type: 'BIGINT UNSIGNED',
          isForeign: true,
          foreignTarget: 'users.id (CASCADE)',
          notes: 'Un usuario tiene una membresía',
        },
        { name: 'tier_name', type: 'ENUM("VIP","Regular")', notes: 'Nivel contratado' },
        { name: 'status', type: 'ENUM("active","expired","suspended")', isIndex: true },
        { name: 'start_date', type: 'DATE', notes: 'Inicio de vigencia' },
        { name: 'end_date', type: 'DATE', isIndex: true, notes: 'Fecha de caducidad' },
        { name: 'price_paid', type: 'DECIMAL(8,2)' },
        { name: 'auto_renew', type: 'TINYINT(1)' },
        { name: 'created_at', type: 'TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMP' },
      ],
      indexes: [
        'PRIMARY KEY (id)',
        'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
        'INDEX (status)',
        'INDEX (user_id, status, end_date)',
      ],
    },
    {
      name: 'disciplines',
      description: 'Catálogo de disciplinas disponibles: Musculación, Crossfit, Funcional, Spinning.',
      engine: 'InnoDB (MySQL 8.0+)',
      columns: [
        { name: 'id', type: 'BIGINT UNSIGNED', isPrimary: true },
        { name: 'name', type: 'VARCHAR(80)', isUnique: true, notes: 'Nombre de la disciplina' },
        { name: 'slug', type: 'VARCHAR(90)', isUnique: true, notes: 'Identificador SEO' },
        { name: 'description', type: 'TEXT' },
        { name: 'icon', type: 'VARCHAR(50)', isNullable: true },
        { name: 'is_active', type: 'TINYINT(1)', isIndex: true },
        { name: 'weekly_classes', type: 'SMALLINT UNSIGNED' },
        { name: 'created_at', type: 'TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMP' },
      ],
      indexes: ['PRIMARY KEY (id)', 'UNIQUE INDEX (name)', 'UNIQUE INDEX (slug)', 'INDEX (is_active)'],
    },
    {
      name: 'discipline_user',
      description: 'Tabla pivote Muchos a Muchos (Many-to-Many) entre usuarios y disciplinas inscritas.',
      engine: 'InnoDB (MySQL 8.0+)',
      columns: [
        { name: 'id', type: 'BIGINT UNSIGNED', isPrimary: true },
        {
          name: 'user_id',
          type: 'BIGINT UNSIGNED',
          isForeign: true,
          foreignTarget: 'users.id (CASCADE)',
        },
        {
          name: 'discipline_id',
          type: 'BIGINT UNSIGNED',
          isForeign: true,
          foreignTarget: 'disciplines.id (CASCADE)',
        },
        { name: 'enrolled_at', type: 'TIMESTAMP' },
        { name: 'level_preference', type: 'VARCHAR(30)' },
        { name: 'created_at', type: 'TIMESTAMP' },
      ],
      indexes: [
        'PRIMARY KEY (id)',
        'UNIQUE KEY (user_id, discipline_id)',
        'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
        'FOREIGN KEY (discipline_id) REFERENCES disciplines(id) ON DELETE CASCADE',
      ],
    },
    {
      name: 'products',
      description: 'E-commerce de suplementos y ropa con columna JSON tags optimizada para recomendaciones cruzadas.',
      engine: 'InnoDB (MySQL 8.0+)',
      columns: [
        { name: 'id', type: 'BIGINT UNSIGNED', isPrimary: true },
        { name: 'name', type: 'VARCHAR(150)', isIndex: true },
        { name: 'slug', type: 'VARCHAR(160)', isUnique: true },
        { name: 'description', type: 'TEXT' },
        { name: 'price', type: 'DECIMAL(10,2)', notes: 'Precio exacto en divisa' },
        { name: 'stock', type: 'INT UNSIGNED', isIndex: true },
        { name: 'category', type: 'ENUM("supplement","clothing","equipment")', isIndex: true },
        {
          name: 'tags',
          type: 'JSON',
          notes: 'Motor de recomendación: JSON_CONTAINS() / Multi-Valued Index',
        },
        { name: 'image_url', type: 'VARCHAR(255)', isNullable: true },
        { name: 'is_active', type: 'TINYINT(1)', isIndex: true },
        { name: 'created_at', type: 'TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMP' },
      ],
      indexes: [
        'PRIMARY KEY (id)',
        'UNIQUE INDEX (slug)',
        'INDEX (name)',
        'INDEX (category)',
        'INDEX (is_active, category, stock)',
        'MULTI-VALUED INDEX ((CAST(tags AS CHAR(30) ARRAY))) [MySQL 8.0+]',
      ],
    },
    {
      name: 'community_posts',
      description: 'Prueba social: imágenes en storage optimizadas a WebP, moderación admin y contador atómico de likes.',
      engine: 'InnoDB (MySQL 8.0+)',
      columns: [
        { name: 'id', type: 'BIGINT UNSIGNED', isPrimary: true },
        {
          name: 'user_id',
          type: 'BIGINT UNSIGNED',
          isForeign: true,
          foreignTarget: 'users.id (CASCADE)',
        },
        { name: 'image_url', type: 'VARCHAR(255)', notes: 'Path relativo en storage WebP' },
        { name: 'caption', type: 'TEXT' },
        { name: 'approved_by_admin', type: 'TINYINT(1)', isIndex: true, notes: 'Filtro del Feed' },
        { name: 'likes_count', type: 'INT UNSIGNED', isIndex: true },
        { name: 'discipline_tag', type: 'VARCHAR(50)', isNullable: true, isIndex: true },
        { name: 'created_at', type: 'TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMP' },
      ],
      indexes: [
        'PRIMARY KEY (id)',
        'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
        'INDEX (approved_by_admin)',
        'INDEX (approved_by_admin, created_at)',
      ],
    },
    {
      name: 'free_passes',
      description: 'Captación de leads locales con generación de token QR único, control de caducidad y registro de canje.',
      engine: 'InnoDB (MySQL 8.0+)',
      columns: [
        { name: 'id', type: 'BIGINT UNSIGNED', isPrimary: true },
        { name: 'guest_name', type: 'VARCHAR(120)' },
        { name: 'guest_email', type: 'VARCHAR(255)', isIndex: true },
        { name: 'guest_phone', type: 'VARCHAR(30)' },
        { name: 'qr_code_token', type: 'VARCHAR(64)', isUnique: true, notes: 'Token seguro de QR' },
        { name: 'used_at', type: 'TIMESTAMP', isNullable: true, isIndex: true },
        { name: 'expires_at', type: 'TIMESTAMP', isIndex: true },
        { name: 'utm_source', type: 'VARCHAR(60)', isNullable: true },
        { name: 'staff_notes', type: 'TEXT', isNullable: true },
        { name: 'created_at', type: 'TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMP' },
      ],
      indexes: [
        'PRIMARY KEY (id)',
        'UNIQUE INDEX (qr_code_token)',
        'INDEX (guest_email)',
        'INDEX (qr_code_token, used_at, expires_at)',
      ],
    },
  ];

  const current = tables.find((t) => t.name === selectedTable) || tables[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-mono font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/30 mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>MySQL 8.0+ InnoDB Architecture Visualizer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono">
            ESQUEMA RELACIONAL &amp; INTEGRIDAD REFERENCIAL
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Diseño normalizado con claves foráneas, borrado en cascada (<code>onDelete(&apos;cascade&apos;)</code>), soporte para tipos JSON con índices multi-valuados para el motor de recomendación y claves compuestas.
          </p>
        </div>
      </div>

      {/* Relational Map Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {tables.map((t) => (
          <button
            key={t.name}
            onClick={() => setSelectedTable(t.name)}
            className={`p-3 rounded-xl border text-left transition-all font-mono ${
              selectedTable === t.name
                ? 'bg-indigo-500/20 border-indigo-500/60 text-white shadow-lg shadow-indigo-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] text-slate-500 uppercase">Tabla</div>
            <div className="text-xs font-bold truncate mt-0.5">{t.name}</div>
            <div className="text-[10px] text-indigo-400 mt-1">
              {t.columns.length} cols
            </div>
          </button>
        ))}
      </div>

      {/* Selected Table Deep Dive */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white font-mono">{current.name}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                {current.engine}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{current.description}</p>
          </div>

          <div className="text-xs font-mono text-slate-500">
            Total Índices: {current.indexes.length}
          </div>
        </div>

        {/* Columns Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-[11px] uppercase">
                <th className="pb-3 pr-4">Columna</th>
                <th className="pb-3 pr-4">Tipo MySQL</th>
                <th className="pb-3 pr-4">Restricciones</th>
                <th className="pb-3">Notas / Arquitectura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {current.columns.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2.5 pr-4 text-white font-bold flex items-center gap-1.5">
                    {col.isPrimary && <Key className="w-3.5 h-3.5 text-amber-400" />}
                    {col.isForeign && <Link2 className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{col.name}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-amber-300/90">{col.type}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {col.isPrimary && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                          PK
                        </span>
                      )}
                      {col.isForeign && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">
                          FK: {col.foreignTarget}
                        </span>
                      )}
                      {col.isUnique && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px]">
                          UNIQUE
                        </span>
                      )}
                      {col.isIndex && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                          INDEX
                        </span>
                      )}
                      {col.isNullable && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">
                          NULL
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 text-slate-400 text-[11px]">{col.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Index Declarations */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-mono text-indigo-400 font-bold uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Índices Definidos en la Migración de Laravel:</span>
          </div>
          <ul className="space-y-1 text-xs font-mono text-slate-300">
            {current.indexes.map((idx, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-indigo-500">▸</span>
                <code>{idx}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
