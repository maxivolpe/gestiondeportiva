// Shared UI primitives + toast/modal system.
const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

// --- Toast ---
const ToastCtx = createContext({ push: () => {} });

function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = (msg, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setItems((cur) => [...cur, { id, msg, kind }]);
    setTimeout(() => setItems((cur) => cur.filter(t => t.id !== id)), 2800);
  };
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="toast-stack">
        {items.map(t => (
          <div key={t.id} className={`toast ${t.kind}`}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);

// --- Modal ---
function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  const maxW = size === 'sm' ? 420 : size === 'lg' ? 760 : 540;
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal-card" style={{ maxWidth: maxW }}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b">
          <div>
            <div className="font-display text-[20px] font-bold leading-tight">{title}</div>
            {subtitle && <div className="text-[12.5px] text-ink-soft mt-1">{subtitle}</div>}
          </div>
          <button className="btn-ghost btn btn-icon" onClick={onClose}><Icon.X size={16}/></button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t bg-bg-soft flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// --- Confirm dialog (programmatic) ---
function ConfirmDialog({ open, title, message, danger, confirmLabel = 'Confirmar', onCancel, onConfirm }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm"
      footer={<>
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
      </>}>
      <div className="text-[14px] text-ink-soft leading-relaxed">{message}</div>
    </Modal>
  );
}

// --- Badge ---
function Badge({ children, kind = 'neutral', dot, className = '' }) {
  return (
    <span className={`badge badge-${kind} ${className}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

function PaymentStatusBadge({ estado }) {
  if (estado === 'pagado')    return <Badge kind="ok" dot>Pagado</Badge>;
  if (estado === 'pendiente') return <Badge kind="warn" dot>Pendiente</Badge>;
  if (estado === 'vencido')   return <Badge kind="bad" dot>Vencido</Badge>;
  return <Badge kind="neutral">{estado}</Badge>;
}

// --- Avatar (initials) ---
function Avatar({ name, size = 32, color }) {
  const init = (name || '?').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  const hue = name ? [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % 360 : 0;
  const bg = color || `oklch(0.85 0.04 ${hue})`;
  const fg = '#0e0e0c';
  return (
    <div className="font-display font-bold inline-flex items-center justify-center select-none"
         style={{ width: size, height: size, fontSize: size * 0.42, background: bg, color: fg, lineHeight: 1, letterSpacing: '-0.02em' }}>
      {init}
    </div>
  );
}

// --- Card / Stat ---
function Card({ children, className = '', padded = true }) {
  return <div className={`card ${padded ? 'p-5' : ''} ${className}`}>{children}</div>;
}

function KpiCard({ label, value, sub, trend, intent, suffix }) {
  const intentBar = intent === 'bad' ? 'bg-red-500' : intent === 'warn' ? 'bg-amber-500' : 'bg-emerald-500';
  const long = typeof value === 'string' && value.length > 5;
  return (
    <div className="card relative overflow-hidden">
      {intent && <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${intentBar}`} />}
      <div className="p-5">
        <div className="eyebrow">{label}</div>
        <div className="mt-3 flex items-baseline gap-2">
          <div className={long ? 'stat-num-sm tabular' : 'stat-num tabular'}>{value}</div>
          {suffix && <div className="text-ink-mute text-sm font-mono">{suffix}</div>}
        </div>
        {sub && <div className="text-[12.5px] text-ink-soft mt-2 flex items-center gap-1.5">
          {trend === 'up' && <Icon.TrendUp size={13} className="text-emerald-600" />}
          {trend === 'down' && <Icon.TrendDown size={13} className="text-red-600" />}
          {sub}
        </div>}
      </div>
    </div>
  );
}

// --- Empty / Loading / Error states ---
function EmptyState({ title, message, icon: Ic = Icon.Info, action }) {
  return (
    <div className="card flex flex-col items-center text-center py-16 px-6">
      <div className="w-12 h-12 border border-line-strong flex items-center justify-center text-ink-soft mb-4"><Ic size={20}/></div>
      <div className="font-display font-bold text-[18px]">{title}</div>
      {message && <div className="text-[13.5px] text-ink-soft mt-2 max-w-md leading-relaxed">{message}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function LoadingState({ rows = 6 }) {
  return (
    <div className="card divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="skeleton w-9 h-9" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-3 w-1/4" />
          </div>
          <div className="skeleton h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message = 'No se pudo cargar la información.', onRetry }) {
  return (
    <div className="card flex flex-col items-center text-center py-16 px-6">
      <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center mb-4"><Icon.Alert size={20}/></div>
      <div className="font-display font-bold text-[18px]">Algo salió mal</div>
      <div className="text-[13.5px] text-ink-soft mt-2 max-w-md leading-relaxed">{message}</div>
      {onRetry && <button onClick={onRetry} className="btn mt-5"><Icon.Cycle size={14}/> Reintentar</button>}
    </div>
  );
}

// --- Page header ---
function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-6 flex-wrap">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="font-display font-bold text-[34px] leading-[1.05] tracking-tight">{title}</h1>
        {subtitle && <div className="text-[14px] text-ink-soft mt-2 max-w-2xl">{subtitle}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// --- Tabs (simple) ---
function Tabs({ value, onChange, items }) {
  return (
    <div className="flex items-center gap-1 border-b border-line overflow-x-auto">
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button key={it.value} onClick={() => onChange(it.value)}
            className={`px-3 py-2.5 text-[13px] font-semibold relative ${active ? 'text-ink' : 'text-ink-mute hover:text-ink'}`}>
            {it.label}
            {it.count != null && <span className="ml-1.5 text-ink-mute font-mono text-[11.5px]">{it.count}</span>}
            {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}

// --- Mini bar chart ---
function MiniBars({ data, height = 90, accent = 'var(--accent)' }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex items-end" style={{ height: '100%' }}>
          <div style={{ width: '100%', height: `${(d.value / max) * 100}%`, background: accent, opacity: 0.85 }} />
        </div>
      ))}
    </div>
  );
}

// --- Donut chart (single-slice progress) ---
function Donut({ value, size = 110, strokeWidth = 12, label, sub }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-soft)" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--accent)" strokeWidth={strokeWidth} fill="none"
                strokeDasharray={c} strokeDashoffset={c - (c * value / 100)} strokeLinecap="butt" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="font-display font-bold text-[22px] tabular leading-none">{label}</div>
        {sub && <div className="text-[10.5px] text-ink-mute mt-1 uppercase tracking-wider">{sub}</div>}
      </div>
    </div>
  );
}

// --- Toggle ---
function Toggle({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 select-none">
      <span className="relative w-9 h-5 transition-colors"
            style={{ background: checked ? 'var(--accent)' : 'var(--line-strong)' }}>
        <span className="absolute top-[2px] w-4 h-4 bg-white transition-transform"
              style={{ transform: `translateX(${checked ? '18px' : '2px'})` }} />
      </span>
      {label && <span className="text-[13px]">{label}</span>}
    </button>
  );
}

// --- Field (label wrapper) ---
function Field({ label, error, hint, children, required }) {
  return (
    <label className="block">
      <span className="text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <div className="text-[11.5px] text-ink-mute mt-1.5">{hint}</div>}
      {error && <div className="text-[11.5px] text-red-600 mt-1.5">{error}</div>}
    </label>
  );
}

window.UI = {
  ToastProvider, useToast,
  Modal, ConfirmDialog,
  Badge, PaymentStatusBadge,
  Avatar,
  Card, KpiCard,
  EmptyState, LoadingState, ErrorState,
  PageHeader, Tabs, MiniBars, Donut, Toggle, Field,
};

Object.assign(window, window.UI);
