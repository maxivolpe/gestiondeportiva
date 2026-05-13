// Main app shell. Handles auth, role, navigation, tweaks.

const PAGE_TITLES = {
  dueno: { dashboard: 'Dashboard', alumnos: 'Alumnos', clases: 'Clases', disciplinas: 'Disciplinas', pagos: 'Pagos', caja: 'Caja' },
  secretario: { alumnos: 'Alumnos', recuperos: 'Recuperos', pagos: 'Pagos', caja: 'Caja', asistencia: 'Asistencia' },
  profesor: { misclases: 'Mis Clases', asistencia: 'Asistencia' },
  alumno: { horario: 'Mi Horario', pagos: 'Mis Pagos' },
};

const DEFAULT_ROUTE = {
  dueno: 'dashboard',
  secretario: 'alumnos',
  profesor: 'misclases',
  alumno: 'horario',
};

function AppShell() {
  // Tweaks
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (t.dark) root.classList.add('dark'); else root.classList.remove('dark');
    root.classList.remove('density-compact','density-comfy');
    if (t.density === 'compact') root.classList.add('density-compact');
    if (t.density === 'comfy')   root.classList.add('density-comfy');
    root.style.setProperty('--accent', t.accent);
    // accent-fg: pick contrast
    const hex = t.accent.replace('#','');
    const r = parseInt(hex.slice(0,2), 16);
    const g = parseInt(hex.slice(2,4), 16);
    const b = parseInt(hex.slice(4,6), 16);
    const luma = 0.2126*r + 0.7152*g + 0.0722*b;
    root.style.setProperty('--accent-fg', luma > 140 ? '#0e0e0c' : '#f5f3ee');
  }, [t.dark, t.density, t.accent]);

  // Auth
  const [user, setUser] = useState(null);
  const [route, setRoute] = useState('dashboard');
  const [loggedIn, setLoggedIn] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // On mount: check if we already have a valid token stored
  useEffect(() => {
    const stored = GymAPI.auth.getStoredUser();
    if (stored && GymAPI.auth.hasToken()) {
      handlePostLogin(stored);
    }
    // Register session-expired handler
    GymAPI.auth.setOnExpired(() => {
      setLoggedIn(false);
      setUser(null);
    });
  }, []);

  const handlePostLogin = async (u) => {
    setUser(u);
    setRoute(DEFAULT_ROUTE[u.rol] || 'dashboard');
    setTweak('activeRole', u.rol);
    setDataLoading(true);
    try {
      await GymAPI.loadInitialData(u);
    } catch (e) {
      console.warn('GymAPI.loadInitialData error:', e.message);
      // Continue with mock data if API unreachable
    }
    setDataLoading(false);
    setLoggedIn(true);
  };

  const handleSwitchUser = (u) => {
    setUser(u);
    setRoute(DEFAULT_ROUTE[u.rol]);
    setTweak('activeRole', u.rol);
  };

  const handleLogout = async () => {
    await GymAPI.auth.logout();
    setLoggedIn(false);
    setUser(null);
  };

  if (dataLoading) {
    return (
      <ToastProvider>
        <div className="min-h-screen login-bg flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 bg-accent text-accent-fg flex items-center justify-center font-display font-bold mx-auto">IA</div>
            <div className="font-display font-bold text-xl">Cargando datos…</div>
            <div className="text-sm text-ink-soft">Sincronizando con el servidor</div>
          </div>
        </div>
        <GymTweaks t={t} setTweak={setTweak}/>
      </ToastProvider>
    );
  }

  if (!loggedIn || !user) {
    return (
      <ToastProvider>
        <LoginPage onLogin={handlePostLogin}/>
        <GymTweaks t={t} setTweak={setTweak}/>
      </ToastProvider>
    );
  }

  const role = user.rol;
  const pageTitle = PAGE_TITLES[role]?.[route] || '';
  const globalState = t.state === 'data' ? null : t.state;

  let Page = null;
  if (role === 'dueno') {
    if (route === 'dashboard')   Page = <DuenoDashboard   globalState={globalState}/>;
    if (route === 'alumnos')     Page = <DuenoAlumnos     globalState={globalState}/>;
    if (route === 'clases')      Page = <DuenoClases      globalState={globalState}/>;
    if (route === 'disciplinas') Page = <DuenoDisciplinas globalState={globalState}/>;
    if (route === 'pagos')       Page = <DuenoPagos       globalState={globalState}/>;
    if (route === 'caja')        Page = <CajaDiaria       globalState={globalState} readOnly={true}/>;
  }
  if (role === 'secretario') {
    if (route === 'alumnos')    Page = <SecAlumnos    globalState={globalState}/>;
    if (route === 'recuperos')  Page = <SecRecuperos  globalState={globalState}/>;
    if (route === 'pagos')      Page = <SecPagos      globalState={globalState}/>;
    if (route === 'caja')       Page = <CajaDiaria    globalState={globalState}/>;
    if (route === 'asistencia') Page = <SecAsistencia globalState={globalState}/>;
  }
  if (role === 'profesor') {
    if (route === 'misclases')  Page = <ProfClases    globalState={globalState} user={user}/>;
    if (route === 'asistencia') Page = <ProfAsistencia globalState={globalState} user={user}/>;
  }
  if (role === 'alumno') {
    if (route === 'horario') Page = <AlumnoHorario globalState={globalState} user={user}/>;
    if (route === 'pagos')   Page = <AlumnoPagos   globalState={globalState} user={user}/>;
  }

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileNavOpen(o => !o);
    } else {
      setTweak('sidebarCollapsed', !t.sidebarCollapsed);
    }
  };

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={t.sidebarCollapsed}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
          role={role}
          route={route}
          onNavigate={setRoute}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            onToggleSidebar={handleToggleSidebar}
            role={role}
            user={user}
            onSwitchUser={handleSwitchUser}
            breadcrumb={pageTitle}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-auto bg-bg p-4 md:p-7">
            <div className="max-w-[1400px] mx-auto">
              {Page}
            </div>
          </main>
        </div>
      </div>
      <GymTweaks t={t} setTweak={setTweak}/>
    </ToastProvider>
  );
}

function GymTweaks({ t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Rol activo"/>
      <TweakSelect
        label="Vista"
        value={t.activeRole}
        options={[
          { value: 'dueno', label: 'Dueño' },
          { value: 'secretario', label: 'Secretaría' },
          { value: 'profesor', label: 'Profesor' },
          { value: 'alumno', label: 'Alumno' },
        ]}
        onChange={(v) => setTweak('activeRole', v)}
      />

      <TweakSection label="Tema"/>
      <TweakToggle label="Modo oscuro" value={t.dark} onChange={(v) => setTweak('dark', v)}/>
      <TweakColor
        label="Acento"
        value={t.accent}
        options={['#0e0e0c', '#dc2626', '#1d4ed8', '#15803d', '#b35a00', '#7c3aed']}
        onChange={(v) => setTweak('accent', v)}
      />

      <TweakSection label="Layout"/>
      <TweakRadio
        label="Densidad"
        value={t.density}
        options={['compact','regular','comfy']}
        onChange={(v) => setTweak('density', v)}
      />
      <TweakToggle label="Sidebar contraída" value={t.sidebarCollapsed} onChange={(v) => setTweak('sidebarCollapsed', v)}/>

      <TweakSection label="Estados (demo)"/>
      <TweakRadio
        label="Estado"
        value={t.state}
        options={[
          { value: 'data', label: 'Datos' },
          { value: 'loading', label: 'Cargando' },
          { value: 'error', label: 'Error' },
        ]}
        onChange={(v) => setTweak('state', v)}
      />
    </TweaksPanel>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppShell/>);
