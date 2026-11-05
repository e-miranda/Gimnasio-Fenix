import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  QrCode,
  Mail,
  Phone,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { FreePass } from '../../types/laravel';
import { QrCodeSvg } from '../common/QrCodeSvg';

interface FreePassLeadGenProps {
  freePasses: FreePass[];
  onGeneratePass: (pass: Omit<FreePass, 'id' | 'created_at'>) => void;
  onVerifyPass: (token: string) => { success: boolean; message: string };
}

export const FreePassLeadGen: React.FC<FreePassLeadGenProps> = ({
  freePasses,
  onGeneratePass,
  onVerifyPass,
}) => {
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [utmSource, setUtmSource] = useState<string>('google_maps_local');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePass, setActivePass] = useState<FreePass | null>(freePasses[0] || null);
  const [showEmailPreview, setShowEmailPreview] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Scanner simulator for front-desk reception
  const [scanTokenInput, setScanTokenInput] = useState<string>('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!guestName || !guestEmail || !guestPhone) {
      setErrorMsg('Por favor completa todos los campos del formulario.');
      return;
    }

    // Anti-abuse check (simulating StoreFreePassRequest 90-day rule)
    const normalizedEmail = guestEmail.toLowerCase().trim();
    const existing = freePasses.find(
      (p) => p.guest_email.toLowerCase() === normalizedEmail
    );

    if (existing) {
      setErrorMsg(
        'Este correo electrónico ya solicitó un pase libre en los últimos 90 días (Regla anti-abuso StoreFreePassRequest).'
      );
      return;
    }

    // Generate unique secure token
    const uniqueToken =
      'PASS-' +
      Math.random().toString(36).substring(2, 8).toUpperCase() +
      '-' +
      Date.now().toString().slice(-6);

    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

    const newPass: FreePass = {
      id: Date.now(),
      guest_name: guestName,
      guest_email: normalizedEmail,
      guest_phone: guestPhone,
      qr_code_token: uniqueToken,
      used_at: null,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    };

    onGeneratePass(newPass);
    setActivePass(newPass);

    // Fire confetti celebration with intense red palette
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#dc2626', '#ef4444', '#f87171', '#ffffff'],
      });
    } catch {
      // Ignore
    }

    // Clear form
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleSimulateReceptionScan = () => {
    if (!scanTokenInput.trim()) return;
    const res = onVerifyPass(scanTokenInput.trim());
    setScanResult(res);

    if (activePass && activePass.qr_code_token === scanTokenInput.trim() && res.success) {
      setActivePass({
        ...activePass,
        used_at: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Hero Banner SEO / Lead Gen */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-red-950/40 to-slate-900 border border-red-500/30 p-6 md:p-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs text-red-400 font-mono font-semibold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo 4: Captación de Leads Locales &amp; Código QR Dinámico</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-mono">
            PASE LIBRE DE 1 DÍA // FENIX GYM
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Generador dinámico de códigos QR para captar prospectos en Bolivia (La Paz, Santa Cruz, Cochabamba). Cada pase cuenta con un token criptográfico único, vencimiento a las 48 horas y notificación automática con Laravel Mail.
          </p>
        </div>
      </div>

      {/* Main Grid: Form on Left, Active Generated Pass on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Lead Generation Form */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-red-500" />
                <span>Solicitar Pase de Cortesía</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Valida tus datos y recibe tu código QR de acceso instantáneo.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              48h Validez
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                Nombre y Apellidos:
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="ej. Mateo Velásquez"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                Correo Electrónico (Para recibir QR):
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="mateo.v@gmail.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                />
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                * Regla anti-abuso: 1 pase cada 90 días por dirección de correo.
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                Teléfono / WhatsApp en Bolivia:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+591 700 00000"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">
                Canal de Captación (UTM Source):
              </label>
              <select
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
              >
                <option value="google_maps_local">Google Maps / Ficha Local SEO</option>
                <option value="instagram_ads">Instagram Ads &amp; Stories</option>
                <option value="tiktok_fitness">TikTok Fitness Lead</option>
                <option value="qr_flyer_outdoor">Flyer QR Impreso en Exterior</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 active:scale-98 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Generar Mi Pase Libre con QR Dinámico</span>
            </button>
          </form>

          {/* Backend architecture footnote */}
          <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 space-y-1">
            <div className="text-red-400 font-semibold">Flujo de Controlador Laravel:</div>
            <div>1. Valida con StoreFreePassRequest (anti-abuso 90 días)</div>
            <div>2. Crea FreePass::create() con token qr_code_token</div>
            <div>3. Dispara event(new FreePassGenerated($freePass))</div>
            <div>4. Envía SendFreePassNotification por correo electrónico</div>
          </div>
        </div>

        {/* Right: Active Ticket with QR & Verification Scanner */}
        <div className="lg:col-span-6 space-y-6">
          {activePass ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
              {/* Top ticket header in Intense Red */}
              <div className="bg-gradient-to-r from-red-600 to-rose-700 p-5 text-white flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs uppercase font-black tracking-widest text-red-200">
                    FENIX GYM // TICKET DIGITAL
                  </div>
                  <div className="text-2xl font-black uppercase font-mono tracking-tight text-white">
                    PASE LIBRE DE 1 DÍA
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-950/30 flex items-center justify-center font-black text-white">
                  1D
                </div>
              </div>

              {/* Ticket Body */}
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-950 p-5 rounded-xl border border-slate-800">
                  {/* SVG QR Code */}
                  <div className="flex flex-col items-center">
                    <QrCodeSvg value={activePass.qr_code_token} size={150} />
                    <span className="text-[10px] font-mono text-slate-500 mt-2">
                      Escanear en mostrador
                    </span>
                  </div>

                  {/* Pass details */}
                  <div className="space-y-3 text-left w-full sm:w-auto">
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">
                        Titular del Pase
                      </div>
                      <div className="text-base font-bold text-white">
                        {activePass.guest_name}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">
                        Token Único (Unique Index)
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-red-400 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          {activePass.qr_code_token}
                        </code>
                        <button
                          onClick={() => handleCopyToken(activePass.qr_code_token)}
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                          title="Copiar token"
                        >
                          {copiedToken ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">
                        Estado del Pase
                      </div>
                      {activePass.used_at ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          CANJEADO (USED)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          ACTIVO (DISPONIBLE)
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">
                        Expira el:
                      </div>
                      <div className="text-xs text-slate-300 font-mono">
                        {new Date(activePass.expires_at).toLocaleString('es-ES')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-red-400" />
                    <span>
                      {showEmailPreview ? 'Ocultar Correo Laravel' : 'Ver Correo Simulado (Notification)'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setScanTokenInput(activePass.qr_code_token);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cargar en Escáner de Recepción</span>
                  </button>
                </div>

                {/* Email Simulation */}
                {showEmailPreview && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                      <span>De: noreply@fenixgym.bo (SendFreePassNotification)</span>
                      <span>Para: {activePass.guest_email}</span>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-white text-sm">
                        🏋️ ¡Tu Pase Libre de 1 Día en Fenix GYM está listo!
                      </p>
                      <p>
                        ¡Hola, <strong className="text-red-400">{activePass.guest_name}</strong>!
                      </p>
                      <p className="text-slate-400">
                        Te damos la bienvenida a la experiencia Fenix GYM. Tu pase de cortesía de 1 día ha sido emitido con éxito. Presenta el código QR en la recepción para ingresar sin costo.
                      </p>
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px]">
                        <div>Token de seguridad: {activePass.qr_code_token}</div>
                        <div>Expira: {new Date(activePass.expires_at).toLocaleString('es-ES')}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              No hay pases generados aún. Completa el formulario de la izquierda.
            </div>
          )}

          {/* FRONT-DESK RECEPTION SCANNER SIMULATOR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Simulador de Recepción / Torniquete (FreePassController@verify)</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Staff Check-In
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Ingresa o escanea el token del código QR para canjear el pase libre en recepción:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="PASS-XXXXXX-XXXXXX"
                value={scanTokenInput}
                onChange={(e) => setScanTokenInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                onClick={handleSimulateReceptionScan}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors"
              >
                Validar QR
              </button>
            </div>

            {scanResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  scanResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {scanResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{scanResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
