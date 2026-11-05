import React, { useState } from 'react';
import {
  Github,
  Copy,
  Check,
  Terminal,
  GitBranch,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  ArrowRight,
  FolderGit2
} from 'lucide-react';

export const GitHubDeployGuide: React.FC = () => {
  const [username, setUsername] = useState<string>('emirandacortez');
  const [repoName, setRepoName] = useState<string>('fenix-gym-platform');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const cleanUser = username.trim() || 'tu-usuario';
  const cleanRepo = repoName.trim() || 'fenix-gym-platform';
  const remoteUrl = `https://github.com/${cleanUser}/${cleanRepo}.git`;

  const steps = [
    {
      title: 'Paso 1: Crear nuevo repositorio en GitHub',
      description:
        'Entra a github.com/new y crea un repositorio vacío (sin inicializar README ni .gitignore porque ya los tenemos creados y optimizados).',
      command: `# Puedes crearlo desde la web o usando GitHub CLI:
gh repo create ${cleanRepo} --public --source=. --remote=origin`,
      isCliOnly: true,
    },
    {
      title: 'Paso 2: Inicializar Git en el proyecto local',
      description: 'Abre una terminal en la raíz de tu proyecto e inicializa el control de versiones.',
      command: 'git init',
    },
    {
      title: 'Paso 3: Agregar todos los archivos y crear el primer commit',
      description: 'El archivo .gitignore ya está configurado para omitir node_modules/ y temporales.',
      command: `git add .
git commit -m "feat: initial commit - Fenix GYM platform with Laravel 13 architecture"`,
    },
    {
      title: 'Paso 4: Renombrar la rama a "main"',
      description: 'Asegura la convención estándar moderna de ramas principales en GitHub.',
      command: 'git branch -M main',
    },
    {
      title: 'Paso 5: Vincular con tu repositorio remoto de GitHub',
      description: 'Conecta tu repositorio local con la URL remota de tu cuenta.',
      command: `git remote add origin ${remoteUrl}`,
    },
    {
      title: 'Paso 6: Subir tu código a GitHub',
      description: 'Publica todos tus commits y ramas en la nube.',
      command: 'git push -u origin main',
    },
  ];

  const fullScript = `# === GUÍA DE PUBLICACIÓN EN GITHUB (FENIX GYM) ===
# 1. Inicializar git
git init

# 2. Agregar archivos
git add .
git commit -m "feat: initial commit - Fenix GYM platform with Laravel 13 architecture"

# 3. Rama main
git branch -M main

# 4. Vincular remoto
git remote add origin ${remoteUrl}

# 5. Subir a GitHub
git push -u origin main`;

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-red-400 font-mono font-semibold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30 mb-2">
            <Github className="w-3.5 h-3.5" />
            <span>Guía Paso a Paso para Publicar en GitHub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            PUBLICAR FENIX GYM EN GITHUB
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Generador de comandos Git interactivo, configuración de .gitignore, pipeline de CI con GitHub Actions y documentación README lista para tu portafolio.
          </p>
        </div>

        <button
          onClick={() => copyToClipboard(fullScript)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30 active:scale-95 whitespace-nowrap self-start md:self-center"
        >
          {copiedAll ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          <span>{copiedAll ? '¡Script Copiado!' : 'Copiar Todos los Comandos'}</span>
        </button>
      </div>

      {/* Dynamic Repo Configurator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-red-500" />
          <span>Configura tus datos de GitHub para generar los comandos exactos</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
              Tu Usuario u Organización de GitHub:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: emirandacortez"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
              Nombre del Repositorio:
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="ej: fenix-gym-platform"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono flex items-center justify-between gap-2 text-slate-300">
          <span className="truncate">
            URL Remota:{' '}
            <code className="text-red-400 font-bold">{remoteUrl}</code>
          </span>
          <a
            href="https://github.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline shrink-0"
          >
            <span>Crear en GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Step by step cards */}
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 text-xs flex items-center justify-center font-mono border border-red-500/30">
                    {idx + 1}
                  </span>
                  <span>{step.title}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 pl-7">
                  {step.description}
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(step.command, idx)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors border border-slate-700 shrink-0"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            <div className="pl-7">
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-red-300 overflow-x-auto leading-relaxed">
                {step.command}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Verification & Goodies Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Archivos ya preparados y optimizados en este proyecto</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-bold">✓ .gitignore</div>
            <p className="text-slate-400 text-[11px]">
              Protege credenciales, ignora <code>node_modules/</code> y carpetas de build.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-bold">✓ README.md Completo</div>
            <p className="text-slate-400 text-[11px]">
              Documentación lista con badges, guías de instalación y despliegue Laravel.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-bold">✓ GitHub Actions CI</div>
            <p className="text-slate-400 text-[11px]">
              Workflow en <code>.github/workflows/ci.yml</code> que valida build y tipos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
