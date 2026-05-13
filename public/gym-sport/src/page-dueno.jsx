// Dueño pages: Dashboard, Alumnos, Clases, Disciplinas, Pagos.
const D = window.GymData;

// ---------- Dashboard ----------
function DuenoDashboard({ globalState }) {
  if (globalState === 'loading') return <LoadingState rows={4} />;
  if (globalState === 'error') return <ErrorState onRetry={() => {}} />;
  const s = D.dashboardSummary();
  const series = D.revenueSeries();
  const deltaIngresos = s.mesAnterior ? Math.round(100 * (s.mesActual - s.mesAnterior) / s.mesAnterior) : 0;

  // Top disciplinas by alumnos
  const topDisc = [...D.Disciplinas].sort((a,b) => b.alumnos - a.alumnos);
  const maxAlu = topDisc[0].alumnos;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resumen operativo"
        title="Hoy en Iron Atlas"
        subtitle="Una mirada general al pulso del gimnasio. Datos actualizados en vivo desde la sucursal Palermo."
        actions={<>
          <button className="btn"><Icon.Filter size={14}/> Sucursal Palermo</button>
          <button className="btn"><Icon.Download size={14}/> Exportar</button>
        </>}
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Alumnos activos" value={s.activos} sub="3 nuevos esta semana" trend="up" />
        <KpiCard label="Pagos vencidos" value={s.vencidos} sub="Requiere contacto" intent={s.vencidos ? 'bad' : null} />
        <KpiCard label="Vencen en 7 días" value={s.venceProximo} sub="Avisar por WhatsApp" intent={s.venceProximo ? 'warn' : null} />
        <KpiCard label="Recuperos pendientes" value={s.recuperosPend} sub="Pendientes de revisión" intent={s.recuperosPend > 3 ? 'warn' : null} />
      </div>

      {/* Revenue + occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="eyebrow">Ingresos mes actual</div>
              <div className="flex items-baseline gap-3 mt-2">
                <div className="stat-num tabular">{D.fmtMoney(s.mesActual)}</div>
                <Badge kind={deltaIngresos >= 0 ? 'ok' : 'bad'} dot>
                  {deltaIngresos >= 0 ? '+' : ''}{deltaIngresos}% vs mes anterior
                </Badge>
              </div>
              <div className="text-[12.5px] text-ink-soft mt-2 font-mono">Mes anterior {D.fmtMoney(s.mesAnterior)}</div>
            </div>
            <div className="flex gap-1">
              <button className="tag active">14d</button>
              <button className="tag">30d</button>
              <button className="tag">90d</button>
            </div>
          </div>

          <MiniBars data={series} height={150} />
          <div className="flex justify-between mt-2 text-[10.5px] font-mono text-ink-mute">
            <span>{D.fmtDateShort(series[0].date)}</span>
            <span>{D.fmtDateShort(series[Math.floor(series.length/2)].date)}</span>
            <span>{D.fmtDateShort(series[series.length-1].date)}</span>
          </div>
        </Card>

        <Card>
          <div className="eyebrow">Ocupación promedio</div>
          <div className="mt-4 flex flex-col items-center">
            <Donut value={s.ocupacion} size={150} strokeWidth={16} label={`${s.ocupacion}%`} sub="de cupo" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="border-t border-line pt-3">
              <div className="text-[10.5px] uppercase tracking-wider text-ink-mute">Clases activas</div>
              <div className="font-display font-bold text-[22px] tabular mt-1">{s.clasesActivas}</div>
            </div>
            <div className="border-t border-line pt-3">
              <div className="text-[10.5px] uppercase tracking-wider text-ink-mute">Llenas (≥80%)</div>
              <div className="font-display font-bold text-[22px] tabular mt-1">
                {D.Clases.filter(c => c.cupos_ocup / c.cupos_max >= 0.8).length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Disciplinas + Próximos vencimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="eyebrow">Disciplinas por alumnos</div>
            <span className="text-[11px] text-ink-mute font-mono">{D.Disciplinas.length} disciplinas</span>
          </div>
          <div className="space-y-3">
            {topDisc.map(d => (
              <div key={d.id} className="flex items-center gap-3">
                <div className="w-2 h-8" style={{ background: d.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold">{d.nombre}</span>
                    <span className="font-mono text-ink-soft">{d.alumnos}</span>
                  </div>
                  <div className="prog mt-1.5"><i style={{ width: (d.alumnos / maxAlu * 100) + '%', background: d.color }}/></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="eyebrow">Próximos vencimientos</div>
            <button className="text-[11.5px] text-ink-soft font-semibold underline-offset-2 hover:underline">Ver todos</button>
          </div>
          <div className="-mx-5">
            <table className="tbl">
              <tbody>
                {D.Alumnos.filter(a => D.diffDays(a.fecha_vencimiento) <= 7).slice(0, 6).map(a => {
                  const d = D.diffDays(a.fecha_vencimiento);
                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={a.nombre} size={26}/>
                          <div>
                            <div className="font-semibold">{a.nombre}</div>
                            <div className="text-[11px] text-ink-mute font-mono">{D.Planes[a.plan_id-1].nombre}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right">
                        {d < 0
                          ? <Badge kind="bad">Vencido hace {-d} d</Badge>
                          : d <= 3
                          ? <Badge kind="bad">Vence en {d} d</Badge>
                          : <Badge kind="warn">Vence en {d} d</Badge>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------- Alumnos (read-only, dueño) ----------
function DuenoAlumnos({ globalState }) {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('todos');

  if (globalState === 'loading') return <LoadingState rows={8}/>;
  if (globalState === 'error') return <ErrorState/>;

  const filtered = D.Alumnos.filter(a => {
    if (q && !(a.nombre + ' ' + a.email).toLowerCase().includes(q.toLowerCase())) return false;
    if (estado !== 'todos' && a.estado_pago !== estado) return false;
    return true;
  });

  if (globalState === 'empty' || filtered.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Vista global" title="Alumnos" subtitle="Acceso de solo lectura para visualizar la base completa."/>
        <EmptyState icon={Icon.Users} title="Sin resultados" message="Probá limpiar los filtros o buscar otro alumno."/>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Vista global" title="Alumnos" subtitle="Acceso de solo lectura para visualizar la base completa."/>
      <Card padded={false}>
        <div className="flex items-center gap-3 p-4 border-b border-line flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Icon.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"/>
            <input className="input pl-9" placeholder="Buscar por nombre o email…" value={q} onChange={e=>setQ(e.target.value)}/>
          </div>
          <div className="flex gap-1">
            {['todos','pagado','pendiente','vencido'].map(s => (
              <button key={s} onClick={()=>setEstado(s)} className={`tag ${estado===s?'active':''}`}>
                {s === 'todos' ? 'Todos' : s[0].toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          <div className="ml-auto text-[11.5px] font-mono text-ink-mute">{filtered.length} resultados</div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Plan</th>
              <th>Estado</th>
              <th>Vencimiento</th>
              <th>Clases</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map(a => {
              const d = D.diffDays(a.fecha_vencimiento);
              return (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.nombre} size={28}/>
                      <div>
                        <div className="font-semibold">{a.nombre}</div>
                        <div className="text-[11px] text-ink-mute">{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-[12px]">{D.Planes[a.plan_id-1].nombre}</td>
                  <td><PaymentStatusBadge estado={a.estado_pago}/></td>
                  <td>
                    <div className="font-mono text-[12px]">{D.fmtDate(a.fecha_vencimiento)}</div>
                    <div className="text-[11px] text-ink-mute">
                      {d >= 0 ? `en ${d} días` : `hace ${-d} días`}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {a.clases_inscripto.slice(0,2).map(cid => {
                        const c = D.Clases.find(x => x.id === cid);
                        const disc = D.Disciplinas.find(d => d.id === c.disciplina_id);
                        return <span key={cid} className="tag" style={{ borderColor: disc.color, color: disc.color }}>{disc.nombre}</span>;
                      })}
                      {a.clases_inscripto.length > 2 && <span className="tag">+{a.clases_inscripto.length - 2}</span>}
                    </div>
                  </td>
                  <td className="text-right">
                    <button className="btn-ghost btn btn-sm"><Icon.Eye size={13}/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ---------- Clases (dueño, read-only) ----------
function DuenoClases({ globalState }) {
  const [disc, setDisc] = useState('todas');
  const [dia, setDia] = useState('todos');
  if (globalState === 'loading') return <LoadingState/>;
  if (globalState === 'error') return <ErrorState/>;

  const filtered = D.Clases.filter(c => {
    if (disc !== 'todas' && c.disciplina_id !== +disc) return false;
    if (dia !== 'todos' && c.dia !== +dia) return false;
    return true;
  });

  return (
    <div>
      <PageHeader eyebrow="Catálogo" title="Clases" subtitle="Todas las clases programadas en la sucursal."/>
      <Card padded={false}>
        <div className="flex items-center gap-3 p-4 border-b border-line flex-wrap">
          <select className="input max-w-[180px]" value={disc} onChange={e=>setDisc(e.target.value)}>
            <option value="todas">Todas las disciplinas</option>
            {D.Disciplinas.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
          <select className="input max-w-[140px]" value={dia} onChange={e=>setDia(e.target.value)}>
            <option value="todos">Todos los días</option>
            {D.DOW_FULL.map((d,i) => <option key={i} value={i}>{d}</option>)}
          </select>
          <div className="ml-auto text-[11.5px] font-mono text-ink-mute">{filtered.length} clases</div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Disciplina</th>
              <th>Día</th>
              <th>Horario</th>
              <th>Profesor</th>
              <th>Espacio</th>
              <th>Cupos</th>
              <th>Ocupación</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const disc = D.Disciplinas.find(d => d.id === c.disciplina_id);
              const prof = D.Profesores.find(p => p.id === c.profesor_id);
              const ocup = c.cupos_ocup / c.cupos_max;
              return (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-1 h-6" style={{ background: disc.color }}/>
                      <span className="font-semibold">{disc.nombre}</span>
                    </div>
                  </td>
                  <td>{D.DOW_FULL[c.dia]}</td>
                  <td className="font-mono">{c.hora_ini} – {c.hora_fin}</td>
                  <td>
                    <div className="flex items-center gap-2"><Avatar name={prof.nombre} size={24}/> <span className="text-[12.5px]">{prof.nombre}</span></div>
                  </td>
                  <td className="text-[12.5px]">{c.espacio}</td>
                  <td className="font-mono">{c.cupos_ocup}/{c.cupos_max}</td>
                  <td>
                    <div className="flex items-center gap-2 w-[150px]">
                      <div className={`prog flex-1 ${ocup > 0.9 ? 'bad' : ocup > 0.7 ? 'warn' : ''}`}>
                        <i style={{ width: (ocup * 100) + '%' }}/>
                      </div>
                      <span className="text-[11px] font-mono text-ink-soft w-9 text-right">{Math.round(ocup*100)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ---------- Disciplinas (dueño) ----------
function DuenoDisciplinas({ globalState }) {
  const [editEsp, setEditEsp] = useState(null);
  const [newEspOpen, setNewEspOpen] = useState(false);
  const [espacios, setEspacios] = useState(D.Espacios);
  const toast = useToast();
  if (globalState === 'loading') return <LoadingState/>;
  if (globalState === 'error') return <ErrorState/>;
  return (
    <div>
      <PageHeader eyebrow="Catálogo" title="Disciplinas y espacios"
        subtitle="Configuración de disciplinas activas y salas habilitadas con sus capacidades."
        actions={<button className="btn btn-primary"><Icon.Plus size={14}/> Nueva disciplina</button>}/>

      <div className="eyebrow mb-3">Disciplinas · {D.Disciplinas.length}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {D.Disciplinas.map(d => (
          <div key={d.id} className="card relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: d.color }}/>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="eyebrow" style={{ color: d.color }}>Disciplina</div>
                  <div className="font-display font-bold text-[26px] tracking-tight mt-1">{d.nombre}</div>
                </div>
                <button className="btn-ghost btn btn-icon"><Icon.Edit size={14}/></button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 pt-5 border-t border-line">
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider text-ink-mute">Alumnos</div>
                  <div className="font-display font-bold text-[24px] tabular">{d.alumnos}</div>
                </div>
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider text-ink-mute">Clases / semana</div>
                  <div className="font-display font-bold text-[24px] tabular">{d.clases}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1">
                {D.Profesores.filter(p => p.disciplinas.includes(d.id)).map(p => (
                  <span key={p.id} className="tag"><Avatar name={p.nombre} size={16}/> {p.nombre}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Espacios */}
      <div className="mt-10 flex items-end justify-between mb-3">
        <div>
          <div className="eyebrow">Configuración</div>
          <h2 className="font-display font-bold text-[22px] mt-1">Espacios / Salas · {espacios.length}</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setNewEspOpen(true)}><Icon.Plus size={14}/> Nuevo espacio</button>
      </div>
      <Card padded={false}>
        <table className="tbl">
          <thead><tr><th>Nombre</th><th>Capacidad</th><th>Descripción</th><th>Clases asignadas</th><th className="text-right">Acciones</th></tr></thead>
          <tbody>
            {espacios.map(e => {
              const clasesAqui = D.Clases.filter(c => c.espacio === e.nombre).length;
              return (
                <tr key={e.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 border border-line-strong flex items-center justify-center"><Icon.Building size={14}/></div>
                      <span className="font-semibold">{e.nombre}</span>
                    </div>
                  </td>
                  <td>
                    <div className="font-mono font-semibold tabular">{e.capacidad}</div>
                    <div className="text-[10.5px] text-ink-mute uppercase tracking-wider">personas</div>
                  </td>
                  <td className="text-[12.5px] text-ink-soft">{e.descripcion}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="font-mono">{clasesAqui}</div>
                      <span className="text-[11px] text-ink-mute">clases / semana</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <button className="btn btn-sm" onClick={() => setEditEsp(e)}><Icon.Edit size={13}/> Editar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {(editEsp || newEspOpen) && (
        <EspacioFormModal
          editing={editEsp}
          onClose={() => { setEditEsp(null); setNewEspOpen(false); }}
          onSubmit={(payload) => {
            if (editEsp) {
              setEspacios(cur => cur.map(x => x.id === editEsp.id ? { ...x, ...payload } : x));
              toast.push(`Espacio "${payload.nombre}" actualizado`, 'ok');
            } else {
              setEspacios(cur => [...cur, { ...payload, id: Date.now() }]);
              toast.push(`Espacio "${payload.nombre}" creado`, 'ok');
            }
            setEditEsp(null); setNewEspOpen(false);
          }}
        />
      )}
    </div>
  );
}

function EspacioFormModal({ editing, onClose, onSubmit }) {
  const [nombre, setNombre] = useState(editing?.nombre || '');
  const [capacidad, setCapacidad] = useState(editing?.capacidad || 16);
  const [descripcion, setDescripcion] = useState(editing?.descripcion || '');
  return (
    <Modal open={true} onClose={onClose} title={editing ? 'Editar espacio' : 'Nuevo espacio'} subtitle="La capacidad limita el cupo máximo de cualquier clase asignada al espacio."
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" disabled={!nombre} onClick={() => onSubmit({ nombre, capacidad: +capacidad, descripcion })}>
          {editing ? 'Guardar cambios' : 'Crear espacio'}
        </button>
      </>}>
      <div className="space-y-4">
        <Field label="Nombre" required>
          <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Sala A, Ring 02, Pileta…"/>
        </Field>
        <Field label="Capacidad máxima" required hint="Cantidad de personas que la sala admite a la vez">
          <input className="input" type="number" min={1} max={200} value={capacidad} onChange={e => setCapacidad(e.target.value)}/>
        </Field>
        <Field label="Descripción">
          <textarea className="input" rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Equipamiento, características…"/>
        </Field>
        {editing && (
          <div className="border border-line p-3 bg-bg-soft text-[12px] text-ink-soft">
            <span className="eyebrow">Tip</span> Si bajás la capacidad por debajo del cupo de alguna clase, esa clase quedará marcada para revisión.
          </div>
        )}
      </div>
    </Modal>
  );
}

// ---------- Pagos (dueño, read-only) ----------
function DuenoPagos({ globalState }) {
  if (globalState === 'loading') return <LoadingState/>;
  if (globalState === 'error') return <ErrorState/>;
  const totalMes = D.Pagos.filter(p => p.estado === 'pagado' && D.diffDays(p.fecha_pago) >= -30).reduce((s,p)=>s+p.monto, 0);
  const cobranzaTasa = Math.round(100 * D.Pagos.filter(p => p.estado === 'pagado').length / D.Pagos.length);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finanzas" title="Pagos" subtitle="Vista de solo lectura del flujo de caja."/>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiCard label="Cobrado últimos 30 días" value={D.fmtMoney(totalMes)} sub="Pagos confirmados" trend="up"/>
        <KpiCard label="Tasa de cobranza" value={cobranzaTasa + '%'} sub="Promedio histórico" intent={cobranzaTasa < 80 ? 'warn' : null}/>
        <KpiCard label="Ticket promedio" value={D.fmtMoney(totalMes / Math.max(1, D.Pagos.filter(p => p.estado === 'pagado' && D.diffDays(p.fecha_pago) >= -30).length))} sub="por alumno"/>
      </div>
      <Card padded={false}>
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <div className="font-display font-bold text-[18px]">Movimientos recientes</div>
          <span className="text-[11.5px] font-mono text-ink-mute">Últimos 25</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Fecha</th><th>Alumno</th><th>Plan</th><th>Monto</th><th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {D.Pagos.slice().sort((a,b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio)).slice(0,25).map(p => {
              const a = D.Alumnos.find(x => x.id === p.alumno_id);
              return (
                <tr key={p.id}>
                  <td className="font-mono text-[12px]">{D.fmtDate(p.fecha_pago || p.fecha_inicio)}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.nombre} size={26}/>
                      <span className="font-semibold">{a.nombre}</span>
                    </div>
                  </td>
                  <td className="text-[12.5px]">{D.Planes[p.plan_id-1].nombre}</td>
                  <td className="font-mono tabular font-semibold">{D.fmtMoney(p.monto)}</td>
                  <td><PaymentStatusBadge estado={p.estado}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

window.DuenoPages = { DuenoDashboard, DuenoAlumnos, DuenoClases, DuenoDisciplinas, DuenoPagos };
Object.assign(window, window.DuenoPages);
