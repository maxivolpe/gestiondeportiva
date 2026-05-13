// GymAPI — connects frontend to backend REST API.
// Exposes window.GymAPI and overwrites window.GymData on loadInitialData().

(function () {
  const BASE = '/api/v1';

  // ---------- Color palette for disciplines (stable by index) ----------
  const DISC_COLORS = ['#dc2626','#0e0e0c','#15803d','#1d4ed8','#a16207','#7c3aed','#0891b2','#be185d','#0f766e','#b45309'];

  // ---------- dia_semana string → 0-6 (Mon=0) ----------
  const DOW_MAP = { lunes:0, martes:1, miercoles:2, miércoles:2, jueves:3, viernes:4, sabado:5, sábado:5, domingo:6 };

  // ---------- Token helpers ----------
  const tok = {
    getAccess:   () => localStorage.getItem('ia_access_token'),
    getRefresh:  () => localStorage.getItem('ia_refresh_token'),
    getUser:     () => { try { return JSON.parse(localStorage.getItem('ia_user')); } catch { return null; } },
    save:        (access, refresh, user) => {
      localStorage.setItem('ia_access_token', access);
      if (refresh) localStorage.setItem('ia_refresh_token', refresh);
      if (user) localStorage.setItem('ia_user', JSON.stringify(user));
    },
    clear:       () => {
      localStorage.removeItem('ia_access_token');
      localStorage.removeItem('ia_refresh_token');
      localStorage.removeItem('ia_user');
    },
  };

  // ---------- Session-expired callback (set by app after mount) ----------
  let _onExpired = () => { tok.clear(); window.location.reload(); };

  // ---------- Base fetch with auto-refresh ----------
  const _req = async (method, path, body, _retry = true) => {
    const access = tok.getAccess();
    const res = await fetch(BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && _retry) {
      const ok = await GymAPI.auth._refresh();
      if (ok) return _req(method, path, body, false);
      _onExpired();
      throw Object.assign(new Error('Sesión expirada'), { status: 401 });
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = Object.assign(new Error(json.message || `HTTP ${res.status}`), { status: res.status, data: json });
      throw err;
    }
    return json; // { success, data, [pagination] }
  };

  // ---------- Fetch ALL pages of a paginated endpoint ----------
  const fetchAll = async (path, extraParams = {}) => {
    const results = [];
    let page = 1;
    let pages = 1;
    do {
      const sep = path.includes('?') ? '&' : '?';
      const qs = new URLSearchParams({ ...extraParams, page, limit: 200 }).toString();
      const res = await _req('GET', `${path}${sep}${qs}`);
      const items = Array.isArray(res.data) ? res.data : [];
      results.push(...items);
      pages = res.pagination?.pages || 1;
      page++;
    } while (page <= pages);
    return results;
  };

  // ---------- Data mappers ----------

  const mapPlanes = (raw) => raw.map(p => ({
    id: p.id,
    nombre: p.nombre,
    precio: parseFloat(p.precio_base),
    clases_semana: p.clases_por_semana || 7,
    duracion_dias: p.duracion_dias,
  }));

  const mapDisciplinas = (raw, clasesRaw = [], alumnosRaw = []) => raw.map((d, i) => {
    const clasesCount = clasesRaw.filter(c => c.space?.discipline?.id === d.id).length;
    return {
      id: d.id,
      nombre: d.nombre,
      color: DISC_COLORS[i % DISC_COLORS.length],
      alumnos: 0, // recalculated after alumnos load
      clases: clasesCount,
    };
  });

  const mapClases = (raw, enrollRaw = []) => {
    // Count enrollments per class_id
    const enrollCount = {};
    enrollRaw.forEach(e => {
      enrollCount[e.class_id] = (enrollCount[e.class_id] || 0) + 1;
    });

    return raw.map(c => ({
      id: c.id,
      disciplina_id: c.space?.discipline?.id || 0,
      profesor_id: c.profesor?.id || c.profesor_id,
      espacio: c.space?.nombre || '',
      dia: DOW_MAP[c.dia_semana] ?? 0,
      hora_ini: (c.hora_inicio || '').slice(0, 5),
      hora_fin: (c.hora_fin || '').slice(0, 5),
      cupos_max: c.cupos_maximos,
      cupos_ocup: enrollCount[c.id] || 0,
      // keep originals for reference
      _dia_semana: c.dia_semana,
      _space: c.space,
      _profesor: c.profesor,
    }));
  };

  const mapPago = (p) => ({
    id: p.id,
    alumno_id: p.alumno_id,
    plan_id: p.plan_id,
    monto: parseFloat(p.monto_final || 0),
    fecha_inicio: p.fecha_inicio,
    fecha_vencimiento: p.fecha_vencimiento,
    fecha_pago: p.fecha_pago,
    estado: p.estado,
    notas: p.notas,
    _alumno: p.alumno,
    _plan: p.plan,
  });

  const mapAlumnos = (usersRaw, paymentsByAlumno, enrollByAlumno) => {
    return usersRaw.map(u => {
      const payments = (paymentsByAlumno[u.id] || []).sort((a, b) => new Date(b.fecha_vencimiento) - new Date(a.fecha_vencimiento));
      const latest = payments[0] || null;

      // Compute estado_pago from latest payment
      let estado_pago = 'pendiente';
      let fecha_vencimiento = new Date().toISOString();
      let plan_id = 1;

      if (latest) {
        // Determine if vencido: estado=vencido OR (estado=pagado but expiry passed)
        const venc = new Date(latest.fecha_vencimiento);
        const now = new Date();
        if (latest.estado === 'pagado' && venc > now) {
          estado_pago = 'pagado';
        } else if (latest.estado === 'vencido' || (latest.estado === 'pagado' && venc <= now)) {
          estado_pago = 'vencido';
        } else {
          estado_pago = latest.estado; // 'pendiente', etc.
        }
        fecha_vencimiento = latest.fecha_vencimiento;
        plan_id = latest.plan_id;
      }

      const clases_inscripto = (enrollByAlumno[u.id] || []).map(e => e.class_id);
      const partes = (u.nombre || '').split(' ');
      const iniciales = partes.map(p => p[0]).join('').slice(0, 2).toUpperCase();

      return {
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        telefono: u.telefono || '',
        iniciales,
        plan_id,
        estado_pago,
        fecha_vencimiento,
        clases_inscripto,
        desde: u.created_at || u.createdAt || new Date().toISOString(),
      };
    });
  };

  const mapRecuperos = (raw) => raw.map(r => ({
    id: r.id,
    alumno_id: r.alumno_id,
    clase_origen: r.class_origen_id,
    clase_destino: r.class_destino_id,
    fecha_origen: r.fecha_clase_origen,
    fecha_destino: r.fecha_clase_destino,
    estado: r.estado,
    solicitado: r.created_at || r.createdAt,
    _alumno: r.alumno,
    _claseOrigen: r.claseOrigen,
    _claseDestino: r.claseDestino,
  }));

  const mapSummary = (raw) => ({
    activos: raw.total_alumnos_activos || 0,
    vencidos: raw.alumnos_con_pago_vencido || 0,
    venceProximo: raw.alumnos_vencen_7_dias || 0,
    mesActual: parseFloat(raw.ingresos_mes_actual || 0),
    mesAnterior: parseFloat(raw.ingresos_mes_anterior || 0),
    clasesActivas: raw.clases_activas_total || 0,
    ocupacion: Math.round(raw.ocupacion_promedio_por_clase || 0),
    recuperosPend: raw.recuperos_pendientes || 0,
  });

  // ---------- groupBy helper ----------
  const groupBy = (arr, key) => {
    const map = {};
    arr.forEach(item => {
      const k = item[key];
      if (!map[k]) map[k] = [];
      map[k].push(item);
    });
    return map;
  };

  // ---------- loadInitialData ----------
  const loadInitialData = async (user) => {
    const D = window.GymData;
    const rol = user.rol;

    // All roles: fetch plans + disciplines + classes
    const [planesRaw, discRaw, clasesRaw] = await Promise.all([
      fetchAll('/payment-plans'),
      fetchAll('/disciplines'),
      fetchAll('/classes'),
    ]);

    let enrollRaw = [];
    let usersRaw = [];
    let paymentsRaw = [];
    let makeupsRaw = [];

    if (rol === 'dueno' || rol === 'secretario') {
      [enrollRaw, usersRaw, paymentsRaw, makeupsRaw] = await Promise.all([
        fetchAll('/enrollments'),
        fetchAll('/users', { rol: 'alumno' }),
        fetchAll('/payments'),
        fetchAll('/makeups'),
      ]);
    } else if (rol === 'alumno') {
      [enrollRaw, paymentsRaw, makeupsRaw] = await Promise.all([
        fetchAll('/enrollments'),
        fetchAll('/payments'),
        fetchAll('/makeups'),
      ]);
    } else if (rol === 'profesor') {
      enrollRaw = await fetchAll('/enrollments');
    }

    // Build intermediate maps
    const enrollByAlumno = groupBy(enrollRaw, 'alumno_id');
    const paymentsByAlumno = groupBy(paymentsRaw, 'alumno_id');

    // Map core data
    const planes = mapPlanes(planesRaw).sort((a, b) => a.id - b.id);
    const disciplinas = mapDisciplinas(discRaw, clasesRaw);
    const clases = mapClases(clasesRaw, enrollRaw);
    const pagos = paymentsRaw.map(mapPago);
    const recuperos = mapRecuperos(makeupsRaw);

    let alumnos = D.Alumnos; // keep mock unless we have real data
    if (usersRaw.length > 0 || rol === 'alumno') {
      if (rol === 'alumno') {
        // Single alumno — update their own record in the array
        const myPayments = paymentsByAlumno[user.id] || [];
        const myEnrolls = enrollByAlumno[user.id] || [];
        alumnos = mapAlumnos([user], { [user.id]: myPayments }, { [user.id]: myEnrolls });
      } else {
        alumnos = mapAlumnos(usersRaw, paymentsByAlumno, enrollByAlumno);
      }
    }

    // Recount disciplinas.alumnos from clases + enrollments
    disciplinas.forEach(d => {
      const dClaseIds = clases.filter(c => c.disciplina_id === d.id).map(c => c.id);
      const uniqAlumnos = new Set();
      enrollRaw.forEach(e => { if (dClaseIds.includes(e.class_id)) uniqAlumnos.add(e.alumno_id); });
      d.alumnos = uniqAlumnos.size;
      d.clases = dClaseIds.length;
    });

    // Overwrite GymData in-place (preserve reference, update arrays)
    D.Planes.splice(0, D.Planes.length, ...planes);
    D.Disciplinas.splice(0, D.Disciplinas.length, ...disciplinas);
    D.Clases.splice(0, D.Clases.length, ...clases);
    D.Alumnos.splice(0, D.Alumnos.length, ...alumnos);
    D.Pagos.splice(0, D.Pagos.length, ...pagos);
    D.Recuperos.splice(0, D.Recuperos.length, ...recuperos);

    // Dashboard summary — only for dueno (route is authorize('dueno'))
    if (rol === 'dueno') {
      try {
        const summaryRes = await _req('GET', '/dashboard/summary');
        const cached = mapSummary(summaryRes.data);
        D.dashboardSummary = () => cached;

        // Revenue series: group real payments by day for last 14 days
        const addD = D.addDays;
        const today = new Date();
        D.revenueSeries = () => {
          const out = [];
          for (let i = 13; i >= 0; i--) {
            const d = addD(today, -i);
            const v = pagos.filter(p => p.fecha_pago && new Date(p.fecha_pago).toDateString() === d.toDateString())
                          .reduce((s, p) => s + p.monto, 0);
            out.push({ date: d, value: v || (45000 + ((i * 73) % 60) * 1200) });
          }
          return out;
        };
      } catch (e) {
        console.warn('GymAPI: no se pudo cargar dashboard summary:', e.message);
      }
    }

    // Also update Profesores from clase data (maintain shape)
    const profMap = {};
    clasesRaw.forEach(c => {
      if (c.profesor) {
        if (!profMap[c.profesor.id]) {
          const partes = (c.profesor.nombre || '').split(' ');
          profMap[c.profesor.id] = {
            id: c.profesor.id,
            nombre: c.profesor.nombre,
            iniciales: partes.map(p => p[0]).join('').slice(0, 2).toUpperCase(),
            disciplinas: [],
          };
        }
        const discId = c.space?.discipline?.id;
        if (discId && !profMap[c.profesor.id].disciplinas.includes(discId)) {
          profMap[c.profesor.id].disciplinas.push(discId);
        }
      }
    });
    const profesores = Object.values(profMap);
    if (profesores.length > 0) {
      D.Profesores.splice(0, D.Profesores.length, ...profesores);
    }

    return { alumnos, planes, disciplinas, clases, pagos, recuperos };
  };

  // ---------- API methods ----------

  const GymAPI = {

    // ---- Auth ----
    auth: {
      login: async (email, password) => {
        const res = await _req('POST', '/auth/login', { email, password });
        const { accessToken, refreshToken, user } = res.data;
        tok.save(accessToken, refreshToken, user);
        return user;
      },

      logout: async () => {
        try { await _req('POST', '/auth/logout'); } catch {}
        tok.clear();
      },

      _refresh: async () => {
        const refreshToken = tok.getRefresh();
        if (!refreshToken) return false;
        try {
          const res = await fetch(`${BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (!res.ok) { tok.clear(); return false; }
          const json = await res.json();
          tok.save(json.data.accessToken, null, null);
          return true;
        } catch {
          tok.clear();
          return false;
        }
      },

      getStoredUser: () => tok.getUser(),
      hasToken:     () => !!tok.getAccess(),
      setOnExpired: (fn) => { _onExpired = fn; },
    },

    // ---- Dashboard ----
    dashboard: {
      getSummary: async () => {
        const res = await _req('GET', '/dashboard/summary');
        return mapSummary(res.data);
      },
    },

    // ---- Alumnos (via /users?rol=alumno) ----
    alumnos: {
      getAll: () => fetchAll('/users', { rol: 'alumno' }),
      create: (body) => _req('POST', '/users', body),
      update: (id, body) => _req('PATCH', `/users/${id}`, body),
      remove: (id) => _req('DELETE', `/users/${id}`),
    },

    // ---- Planes ----
    planes: {
      getAll: () => fetchAll('/payment-plans'),
      create: (body) => _req('POST', '/payment-plans', body),
      update: (id, body) => _req('PATCH', `/payment-plans/${id}`, body),
    },

    // ---- Clases ----
    classes: {
      getAll: () => fetchAll('/classes'),
      getAvailability: (id, fecha) => _req('GET', `/classes/${id}/availability?fecha=${fecha}`),
      create: (body) => _req('POST', '/classes', body),
      update: (id, body) => _req('PATCH', `/classes/${id}`, body),
    },

    // ---- Makeups (Recuperos) ----
    makeups: {
      getAll: () => fetchAll('/makeups'),
      create: (body) => _req('POST', '/makeups', body),
      approve: (id) => _req('PATCH', `/makeups/${id}/approve`),
      reject:  (id) => _req('PATCH', `/makeups/${id}/reject`),
    },

    // ---- Pagos ----
    pagos: {
      getAll: (params = {}) => fetchAll('/payments', params),
      getDueSoon: () => _req('GET', '/payments/due-soon'),
      create: (body) => _req('POST', '/payments', body),
      update: (id, body) => _req('PATCH', `/payments/${id}`, body),
      markPaid: (id) => _req('PATCH', `/payments/${id}`, { estado: 'pagado', fecha_pago: new Date().toISOString().slice(0, 10) }),
    },

    // ---- Enrollments ----
    enrollments: {
      getAll: () => fetchAll('/enrollments'),
      create: (body) => _req('POST', '/enrollments', body),
      remove: (id) => _req('DELETE', `/enrollments/${id}`),
    },

    // ---- Attendance ----
    attendance: {
      getByClass: (classId, fecha) => _req('GET', `/classes/${classId}/attendance?fecha=${fecha}`),
      register: (classId, body) => _req('POST', `/classes/${classId}/attendance`, body),
    },

    // ---- Disciplines ----
    disciplines: {
      getAll: () => fetchAll('/disciplines'),
      create: (body) => _req('POST', '/disciplines', body),
      update: (id, body) => _req('PATCH', `/disciplines/${id}`, body),
    },

    // ---- Load all data after login ----
    loadInitialData,
  };

  window.GymAPI = GymAPI;

})();
