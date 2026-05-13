// AppLayout — sidebar + topbar with role switcher. Drives navigation.
const { Disciplinas, Profesores, Users } = window.GymData;

const NAV_BY_ROLE = {
  dueno: [
    { key: 'dashboard',  label: 'Dashboard',   icon: Icon.Dashboard },
    { key: 'alumnos',    label: 'Alumnos',     icon: Icon.Users },
    { key: 'clases',     label: 'Clases',      icon: Icon.Calendar },
    { key: 'disciplinas',label: 'Disciplinas', icon: Icon.Dumbbell },
    { key: 'pagos',      label: 'Pagos',       icon: Icon.Card },
    { key: 'caja',       label: 'Caja',        icon: Icon.Building },
  ],
  secretario: [
    { key: 'alumnos',    label: 'Alumnos',    icon: Icon.Users },
    { key: 'recuperos',  label: 'Recuperos',  icon: Icon.Cycle },
    { key: 'pagos',      label: 'Pagos',      icon: Icon.Card },
    { key: 'caja',       label: 'Caja',       icon: Icon.Building },
    { key: 'asistencia', label: 'Asistencia', icon: Icon.Check },
  ],
  profesor: [
    { key: 'misclases',  label: 'Mis Clases', icon: Icon.Calendar },
    { key: 'asistencia', label: 'Asistencia', icon: Icon.Check },
  ],
  alumno: [
    { key: 'horario',    label: 'Mi Horario', icon: Icon.Calendar },
    { key: 'pagos',      label: 'Mis Pagos',  icon: Icon.Card },
  ],
};

const ROLE_LABEL = {
  dueno: 'Dueño',
  secretario: 'Secretaría',
  profesor: 'Profesor',
  alumno: 'Alumno',
};

function Brand({ collapsed }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-5">
      <div className="w-8 h-8 bg-accent text-accent-fg flex items-center justify-center font-display font-bold text-[14px] tracking-tighter flex-shrink-0">
        IA
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <div className="font-display font-bold text-[15px] tracking-tight">IRON ATLAS</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-mute font-medium">Gestión Deportiva</div>
        </div>
      )}
    </div>
  );
}

function Sidebar({ collapsed, mobileOpen, onMobileClose, role, route, onNavigate, onLogout }) {
  const nav = NAV_BY_ROLE[role] || [];
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside className={`
        flex flex-col border-r border-line bg-bg shrink-0
        fixed inset-y-0 left-0 z-50 transition-transform duration-200
        md:static md:translate-x-0 md:transition-[width] md:duration-150
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        ${collapsed ? 'sidebar-collapsed w-[64px]' : 'w-[232px]'}
      `}>
        <Brand collapsed={collapsed} />
        <div className="hr-rule mx-3" />
        <div className="mt-3 px-3">
          {!collapsed && <div className="sidebar-section-label eyebrow mb-2 px-3">Navegación</div>}
          <nav className="space-y-0.5">
            {nav.map((item) => {
              const Ic = item.icon;
              const active = route === item.key;
              return (
                <button key={item.key}
                  onClick={() => { onNavigate(item.key); onMobileClose(); }}
                  className={`nav-item w-full text-left ${active ? 'active' : ''}`}>
                  <Ic size={16} />
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex-1" />
        <div className="hr-rule mx-3" />
        <div className="p-3">
          <button onClick={() => { onLogout(); onMobileClose(); }} className="nav-item w-full">
            <Icon.Logout size={16}/>
            <span className="nav-label">Cerrar sesión</span>
          </button>
          {!collapsed && (
            <div className="px-3 py-3 sidebar-footer-text text-[10px] text-ink-mute leading-relaxed">
              <div className="font-mono">v1.4.2</div>
              <div className="mt-0.5">Sucursal Palermo Nº 1</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function RoleSwitcher({ role, user, onSwitch }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 px-2 py-1.5 hover:bg-bg-soft border border-line-strong">
        <Avatar name={user.nombre} size={26} />
        <div className="text-left leading-tight hidden sm:block">
          <div className="text-[12.5px] font-semibold">{user.nombre}</div>
          <div className="text-[10.5px] uppercase tracking-wider text-ink-mute font-medium">{ROLE_LABEL[role]}</div>
        </div>
        <Icon.ChevronDown size={14} className="text-ink-mute ml-1 hidden sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-[280px] bg-surface border border-line-strong z-50 shadow-xl">
          <div className="px-4 py-3 border-b border-line bg-bg-soft">
            <div className="eyebrow">Vista de demostración</div>
            <div className="text-[12px] text-ink-soft mt-1">Cambiá de rol para ver la app desde cada perspectiva.</div>
          </div>
          <div>
            {Users.map(u => (
              <button key={u.id} onClick={() => { onSwitch(u); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg-soft text-left ${u.rol === role ? 'bg-bg-soft' : ''}`}>
                <Avatar name={u.nombre} size={30} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate">{u.nombre}</div>
                  <div className="text-[11px] text-ink-mute truncate">{u.email}</div>
                </div>
                <Badge kind={u.rol === role ? 'info' : 'neutral'}>{ROLE_LABEL[u.rol]}</Badge>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Topbar({ onToggleSidebar, role, user, onSwitchUser, breadcrumb, onLogout }) {
  return (
    <header className="h-[56px] border-b border-line bg-bg flex items-center px-4 gap-3 shrink-0">
      <button onClick={onToggleSidebar} className="btn-ghost btn btn-icon flex-shrink-0">
        <Icon.Menu size={16}/>
      </button>
      <div className="flex items-center gap-1.5 text-[12.5px] text-ink-soft min-w-0">
        <span className="text-ink-mute hidden sm:inline">{ROLE_LABEL[role]}</span>
        <Icon.ChevronRight size={13} className="text-ink-mute hidden sm:inline"/>
        <span className="font-semibold text-ink truncate">{breadcrumb}</span>
      </div>

      <div className="flex-1" />

      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 border border-line bg-bg-soft text-[12px] text-ink-soft">
        <Icon.Search size={13}/>
        <span>Buscar alumnos, clases…</span>
        <span className="ml-3 font-mono text-[10.5px] text-ink-mute border border-line-strong px-1">⌘K</span>
      </div>

      <button className="btn-ghost btn btn-icon relative flex-shrink-0">
        <Icon.Bell size={16}/>
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>

      <RoleSwitcher role={role} user={user} onSwitch={onSwitchUser} />
    </header>
  );
}

window.Layout = { Sidebar, Topbar, NAV_BY_ROLE, ROLE_LABEL };
Object.assign(window, { Sidebar, Topbar, NAV_BY_ROLE, ROLE_LABEL });
