import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  Copy,
  Check,
  Search,
  Sparkles,
  Layers,
  Database,
  Terminal,
  Code2,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import { LARAVEL_CODEBASE } from '../../data/laravelCodebase';
import { LaravelCodeFile } from '../../types/laravel';

export const CodeExplorer: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>('model-product');
  const [copied, setCopied] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const currentFile =
    LARAVEL_CODEBASE.find((f) => f.id === selectedFileId) || LARAVEL_CODEBASE[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFiles = LARAVEL_CODEBASE.filter(
    (f) =>
      f.filename.toLowerCase().includes(search.toLowerCase()) ||
      f.path.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [
    { id: 'migration', label: 'Migraciones MySQL', icon: Database },
    { id: 'model', label: 'Modelos Eloquent', icon: Layers },
    { id: 'controller', label: 'Controladores API', icon: Terminal },
    { id: 'request', label: 'Form Requests', icon: FileCheck2 },
    { id: 'notification', label: 'Eventos & Notificaciones', icon: Sparkles },
    { id: 'route', label: 'Rutas API', icon: FileCode },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-mono font-semibold bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30 mb-2">
            <Code2 className="w-3.5 h-3.5" />
            <span>Arquitectura Laravel 13 // PHP 8.4+ Strict</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono">
            EXPLORADOR DE CÓDIGO FUENTE (PSR-12)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Archivos estructurados, fuertemente tipados, listos para producción y compatibles con MySQL 8.0+. Incluye migraciones con claves foráneas, modelos Eloquent, scopes de recomendación y controladores limpios.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>¡Copiado al Portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Archivo Actual</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout: File tree on left (3 cols), Code Viewer on right (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: File Tree & Category Grouping */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar archivo (ej: Product, FreePass)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
            />
          </div>

          <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
            {categories.map((cat) => {
              const filesInCat = filteredFiles.filter((f) => f.category === cat.id);
              if (filesInCat.length === 0) return null;
              const Icon = cat.icon;

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-2 py-1 bg-slate-950/60 rounded-lg">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{cat.label}</span>
                    <span className="text-slate-600 ml-auto font-normal">
                      ({filesInCat.length})
                    </span>
                  </div>

                  <div className="space-y-1 pl-1">
                    {filesInCat.map((file) => {
                      const isSelected = file.id === currentFile.id;
                      return (
                        <button
                          key={file.id}
                          onClick={() => setSelectedFileId(file.id)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between group ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSelected ? 'text-cyan-400' : 'text-slate-500'
                              }`}
                            />
                            <span className="truncate">{file.filename}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* File Tab Header */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-cyan-400 truncate">
                {currentFile.path}
              </div>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {currentFile.filename}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{currentFile.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Highlights / Features pill list */}
          <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Aspectos Clave:
            </span>
            {currentFile.features.map((feat, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700/60"
              >
                ✓ {feat}
              </span>
            ))}
          </div>

          {/* Code Body with Line Numbers */}
          <div className="relative overflow-x-auto bg-[#0a0f1d] p-4 text-xs font-mono leading-relaxed text-slate-200 max-h-[620px] overflow-y-auto">
            <pre className="table w-full">
              {currentFile.code.split('\n').map((line, idx) => (
                <div key={idx} className="table-row hover:bg-slate-800/40">
                  <span className="table-cell select-none pr-4 text-right text-slate-600 text-[11px] w-10">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre font-mono">
                    {line}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
