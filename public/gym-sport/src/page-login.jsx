// Demo users seeded in backend (seeder 20240101000001)
const DEMO_USERS = [
  { rol: 'dueno',      nombre: 'Admin',          email: 'admin@gimnasio.com',        password: 'Admin1234!' },
  { rol: 'secretario', nombre: 'Valeria Donati', email: 'secretaria@ironatlas.com',  password: '123456' },
  { rol: 'profesor',   nombre: 'Mariana Ledesma',email: 'mariana@ironatlas.com',     password: '123456' },
  { rol: 'alumno',     nombre: 'Camila Ortega',  email: 'camila@ironatlas.com',      password: '123456' },
];

// Login page.
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('secretaria@ironatlas.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const submit = async (e) => {
    e?.preventDefault?.();
    setError(null);
    if (!email.includes('@')) { setError('Email inválido'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      const u = await GymAPI.auth.login(email, password);
      toast.push('Sesión iniciada', 'ok');
      onLogin(u);
    } catch (err) {
      setLoading(false);
      if (err.status === 401 || err.status === 400) {
        setError('Email o contraseña incorrectos');
      } else {
        setError(err.message || 'Error al conectar con el servidor');
      }
    }
  };

  const quick = (u) => { setEmail(u.email); setPassword(u.password); };

  return (
    <div className="min-h-screen login-bg flex">
      {/* Left: form */}
      <div className="flex-1 flex flex-col p-12 max-w-[520px]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-accent text-accent-fg flex items-center justify-center font-display font-bold tracking-tighter">IA</div>
          <div className="leading-tight">
            <div className="font-display font-bold tracking-tight">IRON ATLAS</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-mute">Gestión Deportiva</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="eyebrow mb-3">Plataforma operativa</div>
          <h1 className="font-display font-extrabold text-[56px] leading-[0.95] tracking-tight">
            Tu gimnasio,<br/>
            sin papeles.
          </h1>
          <p className="text-ink-soft text-[15px] mt-5 max-w-md leading-relaxed">
            Cobranzas, recuperos, asistencia y horarios en un solo lugar.
            Pensado para secretarías que necesitan moverse rápido.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4 max-w-sm">
            <Field label="Email" required>
              <div className="relative">
                <Icon.Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"/>
                <input className="input pl-9" value={email} onChange={e => setEmail(e.target.value)} type="email"/>
              </div>
            </Field>
            <Field label="Contraseña" required>
              <div className="relative">
                <Icon.Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"/>
                <input className="input pl-9" value={password} onChange={e => setPassword(e.target.value)} type="password"/>
              </div>
            </Field>
            {error && <div className="text-[12.5px] text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</div>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-3">
              {loading ? 'Verificando…' : <>Iniciar sesión <Icon.ArrowRight size={15}/></>}
            </button>
          </form>

          <div className="mt-8 max-w-sm">
            <div className="eyebrow mb-3">Acceso rápido para demo</div>
            <div className="grid grid-cols-2 gap-1.5">
              {DEMO_USERS.map((u) => (
                <button key={u.rol} onClick={() => quick(u)}
                  className="text-left px-3 py-2 border border-line hover:bg-bg-soft">
                  <div className="text-[11px] text-ink-mute uppercase tracking-wider">{ROLE_LABEL[u.rol]}</div>
                  <div className="text-[12.5px] font-medium truncate">{u.nombre}</div>
                </button>
              ))}
            </div>
            <div className="text-[11px] text-ink-mute mt-3 font-mono">Admin: Admin1234! · Resto: 123456</div>
          </div>
        </div>

        <div className="text-[11px] text-ink-mute font-mono">© 2026 Iron Atlas · v1.4.2</div>
      </div>

      {/* Right: visual */}
      <div className="hidden md:flex flex-1 relative items-center justify-center overflow-hidden bg-accent text-accent-fg">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 40px), repeating-linear-gradient(0deg, currentColor 0 1px, transparent 1px 40px)' }} />
        <div className="relative max-w-[460px] w-full p-12">
          <div className="eyebrow opacity-70">En sala</div>
          <div className="font-display font-extrabold text-[140px] leading-[0.85] tracking-tighter mt-1 tabular">187</div>
          <div className="text-[14px] opacity-80 mt-2">alumnos activos esta semana</div>

          <div className="mt-10 mb-14 grid grid-cols-2 gap-5">
            {[
              { k: 'OCUPACIÓN', v: '78%' },
              { k: 'COBRADO HOY', v: '$214K' },
              { k: 'RECUPEROS PEND.', v: '05' },
              { k: 'CLASES HOY', v: '14' },
            ].map(s => (
              <div key={s.k} className="border-t border-current/30 pt-3">
                <div className="text-[10px] uppercase tracking-[0.18em] opacity-60">{s.k}</div>
                <div className="font-display font-bold text-[28px] tabular mt-1">{s.v}</div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-12 left-12 right-12 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] opacity-60">
            <span className="dot"/> Sistema operativo. Última sincronización 12:04
          </div>
        </div>
      </div>
    </div>
  );
}

window.LoginPage = LoginPage;
