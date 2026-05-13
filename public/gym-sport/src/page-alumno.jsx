// Alumno pages: Mi Horario (week grid), Solicitar Recupero (modal), Mis Pagos
const Da = window.GymData;

function AlumnoHorario({ globalState, user }) {
  const alumnoId = user.id;
  const alumno = Da.Alumnos.find(a => a.id === alumnoId);
  const [recOpen, setRecOpen] = useState(false);
  const [recOriginClase, setRecOriginClase] = useState(null);
  const [recList, setRecList] = useState(Da.Recuperos.filter(r => r.alumno_id === alumnoId));
  const toast = useToast();
  if (globalState === 'loading') return <LoadingState/>;
  if (globalState === 'error') return <ErrorState/>;

  const misClases = alumno.clases_inscripto.map(cid => Da.Clases.find(c => c.id === cid));

  // Generate attendance history — last 8 weeks per inscribed class
  const attendance = useMemo(() => {
    const out = [];
    misClases.forEach((c) => {
      for (let w = 7; w >= 0; w--) {
        // Date of the class for that week
        const today = new Date();
        const diff = (c.dia + 1 - (today.getDay() || 7));
        const baseClassDate = Da.addDays(today, diff - w * 7);
        if (baseClassDate > today) continue;
        // Deterministic attendance: ~88% attendance rate; recent week may include the absence
        const seed = (alumnoId + c.id + w * 13) % 100;
        const status = seed < 80 ? 'presente' : seed < 92 ? 'ausente' : 'recuperada';
        out.push({ claseId: c.id, fecha: baseClassDate.toISOString(), status });
      }
    });
    return out.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [alumnoId]);

  // Ausencias sin recupero solicitado: para mostrar el botón de "Recuperar"
  const recuperoSolicitudKeys = new Set(
    recList.map(r => `${r.clase_origen}|${new Date(r.fecha_origen).toDateString()}`)
  );
  const ausenciasAbiertas = attendance.filter(a => a.status === 'ausente'
    && !recuperoSolicitudKeys.has(`${a.claseId}|${new Date(a.fecha).toDateString()}`));

  const totalPres = attendance.filter(a => a.status === 'presente').length;
  const totalAus = attendance.filter(a => a.status === 'ausente').length;
  const totalRec = attendance.filter(a => a.status === 'recuperada').length;
  const pctAsist = attendance.length ? Math.round(100 * (totalPres + totalRec) / attendance.length) : 0;

  const hours = [...new Set(misClases.map(c => c.hora_ini))].sort();

  const openRecupero = (clase, fechaAusencia) => {
    setRecOriginClase({ clase, fecha: fechaAusencia });
    setRecOpen(true);
  };

  const submitRecupero = (data) => {
    const newRec = {
      id: 9000 + Math.floor(Math.random() * 10000),
      alumno_id: alumnoId,
      clase_origen: data.origen,
      clase_destino: data.destino,
      fecha_origen: data.fecha_origen,
      fecha_destino: data.fecha_destino,
      estado: 'pendiente',
      solicitado: new Date().toISOString(),
    };
    setRecList(cur => [newRec, ...cur]);
    toast.push('Solicitud de recupero enviada', 'ok');
    setRecOpen(false);
  };

  return (
    <div>
      <PageHeader eyebrow={`Alumno · ${alumno.nombre}`} title="Mi Horario"
        subtitle="Tu calendario semanal. Tocá una clase para pedir un recupero si faltaste."/>

      {/* Quick info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card p-5">
          <div className="eyebrow">Mi plan</div>
          <div className="font-display font-bold text-[24px] tracking-tight mt-3 leading-none">{Da.Planes[alumno.plan_id-1].nombre}</div>
          <div className="text-[12.5px] text-ink-soft mt-2 font-mono">{Da.fmtMoney(Da.Planes[alumno.plan_id-1].precio)} / mes</div>
        </div>
        <div className="card p-5">
          <div className="eyebrow">Asistencia (8 sem)</div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="stat-num tabular">{pctAsist}<span className="text-ink-mute text-[24px]">%</span></div>
          </div>
          <div className="prog mt-3"><i style={{ width: pctAsist + '%', background: pctAsist >= 80 ? 'var(--ok)' : pctAsist >= 60 ? 'var(--warn)' : 'var(--bad)' }}/></div>
          <div className="flex gap-3 mt-2 text-[11px] font-mono text-ink-mute">
            <span><span className="dot" style={{color:'var(--ok)'}}/> {totalPres} pres.</span>
            <span><span className="dot" style={{color:'var(--bad)'}}/> {totalAus} aus.</span>
            <span><span className="dot" style={{color:'var(--info)'}}/> {totalRec} rec.</span>
          </div>
        </div>
        <div className="card p-5">
          <div className="eyebrow">Estado de cuota</div>
          <div className="mt-3"><PaymentStatusBadge estado={alumno.estado_pago}/></div>
          <div className="font-mono text-[12px] text-ink-soft mt-2">Vence {Da.fmtDate(alumno.fecha_vencimiento)}</div>
        </div>
        <KpiCard label="Faltas sin recuperar" value={ausenciasAbiertas.length}
                 sub={ausenciasAbiertas.length ? 'Podés solicitar recupero' : 'Estás al día'}
                 intent={ausenciasAbiertas.length ? 'warn' : null}/>
      </div>

      {/* Banner if overdue */}
      {alumno.estado_pago === 'vencido' && (
        <div className="border-l-2 border-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-3 mb-5 flex items-start gap-3">
          <Icon.Alert size={18} className="text-red-600 mt-0.5"/>
          <div>
            <div className="font-semibold text-red-900 dark:text-red-200">Tu cuota está vencida</div>
            <div className="text-[12.5px] text-red-800 dark:text-red-300">Pasá por secretaría o regularizá online para seguir asistiendo a clases.</div>
          </div>
          <button className="btn btn-sm ml-auto">Cómo pagar</button>
        </div>
      )}

      {/* Week grid */}
      <Card padded={false}>
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <div className="font-display font-bold text-[18px]">Semana actual</div>
          <div className="flex gap-1">
            <button className="btn-icon btn btn-sm"><Icon.ChevronLeft size={14}/></button>
            <button className="btn btn-sm">Hoy</button>
            <button className="btn-icon btn btn-sm"><Icon.ChevronRight size={14}/></button>
          </div>
        </div>
        <div className="overflow-x-auto">
        <div className="week-grid">
          <div className="week-cell" style={{ minHeight: 36 }}/>
          {Da.DOW.map((d, i) => (
            <div key={d} className="week-cell px-3 py-2" style={{ minHeight: 36 }}>
              <div className="text-[10.5px] uppercase tracking-wider text-ink-mute font-semibold">{d}</div>
              <div className="font-mono text-[12px]">{Da.fmtDateShort(Da.addDays(new Date(), i - (new Date().getDay()||7)+1))}</div>
            </div>
          ))}
          {hours.map(hr => (
            <React.Fragment key={hr}>
              <div className="week-cell flex items-start justify-end pr-2 pt-2">
                <span className="text-[11px] font-mono text-ink-mute">{hr}</span>
              </div>
              {Da.DOW.map((_, di) => {
                const clase = misClases.find(c => c.dia === di && c.hora_ini === hr);
                if (!clase) return <div key={di} className="week-cell"/>;
                const disc = Da.Disciplinas.find(d => d.id === clase.disciplina_id);
                const prof = Da.Profesores.find(p => p.id === clase.profesor_id);
                // Last attendance for this class
                const last = attendance.find(a => a.claseId === clase.id);
                const openAbs = ausenciasAbiertas.find(a => a.claseId === clase.id);
                return (
                  <div key={di} className="week-cell p-1.5">
                    <div className="h-full p-2 border-l-2 cursor-pointer hover:bg-bg-soft transition-colors" style={{ borderLeftColor: disc.color }}>
                      <div className="text-[11.5px] font-display font-bold leading-tight">{disc.nombre}</div>
                      <div className="text-[10.5px] text-ink-soft font-mono mt-0.5">{clase.hora_ini}–{clase.hora_fin}</div>
                      <div className="text-[10.5px] text-ink-mute mt-1 truncate">{clase.espacio}</div>
                      <div className="text-[10.5px] text-ink-mute truncate">{prof.nombre}</div>
                      {last && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px]">
                          <span className="dot" style={{ color: last.status === 'presente' ? 'var(--ok)' : last.status === 'recuperada' ? 'var(--info)' : 'var(--bad)' }}/>
                          <span className="text-ink-mute uppercase tracking-wider font-semibold">Última: {last.status === 'presente' ? 'Asistió' : last.status === 'recuperada' ? 'Recuperada' : 'Faltó'}</span>
                        </div>
                      )}
                      {openAbs && (
                        <button onClick={() => openRecupero(clase, openAbs.fecha)} className="mt-2 w-full text-[10px] font-semibold uppercase tracking-wider px-1.5 py-1 bg-red-100 text-red-700 border border-red-300 hover:bg-red-200">
                          Recuperar falta
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        </div>{/* overflow-x-auto */}
      </Card>

      {/* Attendance history */}
      <div className="mt-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="eyebrow">Asistencia</div>
            <h2 className="font-display font-bold text-[22px] mt-1">Mi historial</h2>
          </div>
          <div className="text-[11.5px] font-mono text-ink-mute">Últimas 8 semanas</div>
        </div>
        <Card padded={false}>
          <table className="tbl">
            <thead>
              <tr><th>Fecha</th><th>Clase</th><th>Profesor</th><th>Espacio</th><th>Estado</th><th className="text-right">Acción</th></tr>
            </thead>
            <tbody>
              {attendance.slice(0, 12).map((a, i) => {
                const c = Da.Clases.find(x => x.id === a.claseId);
                const disc = Da.Disciplinas.find(d => d.id === c.disciplina_id);
                const prof = Da.Profesores.find(p => p.id === c.profesor_id);
                const recSolicitado = recuperoSolicitudKeys.has(`${a.claseId}|${new Date(a.fecha).toDateString()}`);
                return (
                  <tr key={i}>
                    <td>
                      <div className="font-mono text-[12px]">{Da.fmtDate(a.fecha)}</div>
                      <div className="text-[11px] text-ink-mute">{Da.DOW_FULL[c.dia]} · {c.hora_ini}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-1 h-7" style={{ background: disc.color }}/>
                        <span className="font-semibold">{disc.nombre}</span>
                      </div>
                    </td>
                    <td className="text-[12.5px]">{prof.nombre}</td>
                    <td className="text-[12.5px]">{c.espacio}</td>
                    <td>
                      {a.status === 'presente' && <Badge kind="ok" dot>Asistió</Badge>}
                      {a.status === 'ausente'  && <Badge kind="bad" dot>Faltó</Badge>}
                      {a.status === 'recuperada' && <Badge kind="info" dot>Recuperada</Badge>}
                    </td>
                    <td className="text-right">
                      {a.status === 'ausente' && !recSolicitado && (
                        <button className="btn btn-sm" onClick={() => openRecupero(c, a.fecha)}>
                          <Icon.Cycle size={12}/> Solicitar recupero
                        </button>
                      )}
                      {a.status === 'ausente' && recSolicitado && (
                        <span className="text-[11px] text-ink-mute font-mono">Solicitado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      {/* My makeup requests */}
      <div className="mt-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="eyebrow">Mis recuperos</div>
            <h2 className="font-display font-bold text-[22px] mt-1">Solicitudes recientes</h2>
          </div>
          <button className="btn btn-primary" onClick={() => { setRecOriginClase(null); setRecOpen(true); }}>
            <Icon.Plus size={14}/> Solicitar recupero
          </button>
        </div>
        {recList.length === 0 ? (
          <EmptyState icon={Icon.Cycle} title="Aún no solicitaste recuperos"
            message="Si faltaste a una clase, podés pedir recuperarla. Sujeto a disponibilidad de cupos."
            action={<button className="btn btn-primary" onClick={() => setRecOpen(true)}>Solicitar el primero</button>}/>
        ) : (
          <Card padded={false}>
            <table className="tbl">
              <thead>
                <tr><th>Clase perdida</th><th>Clase de recupero</th><th>Solicitado</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {recList.map(r => {
                  const co = Da.Clases.find(c => c.id === r.clase_origen);
                  const cd = Da.Clases.find(c => c.id === r.clase_destino);
                  const co_d = Da.Disciplinas.find(d => d.id === co.disciplina_id);
                  const cd_d = Da.Disciplinas.find(d => d.id === cd.disciplina_id);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="font-semibold" style={{ color: co_d.color }}>{co_d.nombre}</div>
                        <div className="font-mono text-[11px] text-ink-soft">{Da.fmtDate(r.fecha_origen)}</div>
                      </td>
                      <td>
                        <div className="font-semibold" style={{ color: cd_d.color }}>{cd_d.nombre}</div>
                        <div className="font-mono text-[11px] text-ink-soft">{Da.fmtDate(r.fecha_destino)} · {cd.hora_ini}</div>
                      </td>
                      <td className="font-mono text-[12px]">{Da.fmtDate(r.solicitado)}</td>
                      <td>
                        {r.estado === 'pendiente' && <Badge kind="warn" dot>Pendiente</Badge>}
                        {r.estado === 'aprobada' && <Badge kind="ok" dot>Aprobada</Badge>}
                        {r.estado === 'rechazada' && <Badge kind="bad" dot>Rechazada</Badge>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {recOpen && <SolicitarRecuperoModal alumno={alumno}
        originClase={recOriginClase?.clase || null}
        originFecha={recOriginClase?.fecha || null}
        onClose={() => setRecOpen(false)} onSubmit={submitRecupero}/>}
    </div>
  );
}

function SolicitarRecuperoModal({ alumno, originClase, originFecha, onClose, onSubmit }) {
  const [origen, setOrigen] = useState(originClase?.id || alumno.clases_inscripto[0]);
  const [destino, setDestino] = useState('');
  const [fechaOrigen, setFechaOrigen] = useState((originFecha ? new Date(originFecha) : Da.addDays(new Date(), -2)).toISOString().slice(0,10));
  const [fechaDestino, setFechaDestino] = useState(Da.addDays(new Date(), 2).toISOString().slice(0,10));
  const [error, setError] = useState(null);

  const claseO = Da.Clases.find(c => c.id === +origen);
  const discO = claseO ? Da.Disciplinas.find(d => d.id === claseO.disciplina_id) : null;

  // Available: same discipline, has space, not the original one
  const available = Da.Clases.filter(c => discO && c.disciplina_id === discO.id && c.id !== claseO.id && c.cupos_ocup < c.cupos_max);

  const submit = () => {
    setError(null);
    if (!destino) { setError('Seleccioná una clase de recupero'); return; }
    if (new Date(fechaOrigen) > new Date()) { setError('La fecha que faltaste no puede ser futura'); return; }
    if (new Date(fechaDestino) < new Date()) { setError('La fecha de recupero no puede ser pasada'); return; }
    onSubmit({ origen: +origen, destino: +destino, fecha_origen: new Date(fechaOrigen).toISOString(), fecha_destino: new Date(fechaDestino).toISOString() });
  };

  return (
    <Modal open={true} onClose={onClose} title="Solicitar recupero"
      subtitle="Pedile a secretaría recuperar una clase a la que faltaste."
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={submit}><Icon.Cycle size={14}/> Enviar solicitud</button>
      </>}>
      <div className="space-y-4">
        <Field label="Clase a la que faltaste" required>
          <select className="input" value={origen} onChange={e => { setOrigen(e.target.value); setDestino(''); }}>
            {alumno.clases_inscripto.map(cid => {
              const c = Da.Clases.find(x => x.id === cid);
              const d = Da.Disciplinas.find(x => x.id === c.disciplina_id);
              return <option key={cid} value={cid}>{d.nombre} · {Da.DOW[c.dia]} {c.hora_ini}</option>;
            })}
          </select>
        </Field>
        <Field label="Fecha que faltaste" required hint="No podés seleccionar fechas futuras">
          <input className="input" type="date" value={fechaOrigen} onChange={e => setFechaOrigen(e.target.value)} max={new Date().toISOString().slice(0,10)}/>
        </Field>
        <div className="hr-rule"/>
        <Field label="Clase para recuperar" required hint={available.length ? `Solo se muestran clases de ${discO.nombre} con cupos disponibles` : 'No hay clases disponibles para esa disciplina'}>
          {available.length ? (
            <select className="input" value={destino} onChange={e => setDestino(e.target.value)}>
              <option value="">— Elegí una clase —</option>
              {available.map(c => {
                const prof = Da.Profesores.find(p => p.id === c.profesor_id);
                return <option key={c.id} value={c.id}>{Da.DOW[c.dia]} {c.hora_ini} · {prof.nombre} · {c.cupos_max - c.cupos_ocup} cupos</option>;
              })}
            </select>
          ) : (
            <div className="border border-line p-3 text-[12.5px] text-ink-soft bg-bg-soft">No hay alternativas con cupo. Probá la próxima semana.</div>
          )}
        </Field>
        <Field label="Fecha de recupero" required hint="Debe coincidir con el día de la semana de la clase elegida">
          <input className="input" type="date" value={fechaDestino} onChange={e => setFechaDestino(e.target.value)} min={new Date().toISOString().slice(0,10)}/>
        </Field>
        {error && <div className="text-[12.5px] text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</div>}
      </div>
    </Modal>
  );
}

function AlumnoPagos({ globalState, user }) {
  const alumnoId = user.id;
  const alumno = Da.Alumnos.find(a => a.id === alumnoId);
  if (globalState === 'loading') return <LoadingState/>;
  if (globalState === 'error') return <ErrorState/>;

  const pagos = Da.Pagos.filter(p => p.alumno_id === alumnoId).sort((a,b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
  const d = Da.diffDays(alumno.fecha_vencimiento);

  return (
    <div>
      <PageHeader eyebrow={`Alumno · ${alumno.nombre}`} title="Mis Pagos"
        subtitle="Historial completo de tus cuotas y comprobantes."/>

      {/* Banner */}
      {alumno.estado_pago === 'vencido' ? (
        <div className="border-l-2 border-red-500 bg-red-50 px-4 py-4 mb-5 flex items-start gap-3">
          <Icon.Alert size={20} className="text-red-600 mt-0.5"/>
          <div className="flex-1">
            <div className="font-display font-bold text-[18px] text-red-900">Cuota vencida hace {-d} días</div>
            <div className="text-[13px] text-red-800 mt-1">Regularizá tu cuota para mantener acceso al gimnasio.</div>
          </div>
          <button className="btn btn-primary">Pagar ahora <Icon.ArrowRight size={14}/></button>
        </div>
      ) : d <= 7 && d >= 0 ? (
        <div className="border-l-2 border-amber-500 bg-amber-50 px-4 py-3 mb-5 flex items-start gap-3">
          <Icon.Clock size={18} className="text-amber-700 mt-0.5"/>
          <div className="flex-1">
            <div className="font-semibold text-amber-900">Tu cuota vence en {d} días</div>
            <div className="text-[12.5px] text-amber-800">El {Da.fmtDate(alumno.fecha_vencimiento)}. Podés pagar ahora para no perder días.</div>
          </div>
          <button className="btn btn-sm">Pagar</button>
        </div>
      ) : null}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Card>
          <div className="eyebrow">Plan activo</div>
          <div className="font-display font-bold text-[24px] mt-2">{Da.Planes[alumno.plan_id-1].nombre}</div>
          <div className="font-mono text-[12.5px] text-ink-soft mt-1">{Da.fmtMoney(Da.Planes[alumno.plan_id-1].precio)} / mes</div>
        </Card>
        <Card>
          <div className="eyebrow">Próximo vencimiento</div>
          <div className="font-display font-bold text-[24px] mt-2">{Da.fmtDate(alumno.fecha_vencimiento)}</div>
          <div className="text-[12.5px] text-ink-soft mt-1">{d >= 0 ? `en ${d} días` : `vencido hace ${-d} días`}</div>
        </Card>
        <Card>
          <div className="eyebrow">Total pagado</div>
          <div className="font-display font-bold text-[24px] mt-2 tabular">{Da.fmtMoney(pagos.filter(p => p.estado === 'pagado').reduce((s,p)=>s+p.monto, 0))}</div>
          <div className="text-[12.5px] text-ink-soft mt-1">en {pagos.filter(p => p.estado === 'pagado').length} pagos</div>
        </Card>
      </div>

      {/* Pago cards */}
      <div className="eyebrow mb-3">Historial</div>
      <div className="space-y-2">
        {pagos.map(p => (
          <div key={p.id} className="card p-4 flex items-center gap-5">
            <div className="text-center min-w-[64px]">
              <div className="text-[10.5px] uppercase tracking-wider text-ink-mute">{new Date(p.fecha_inicio).toLocaleDateString('es-AR', { month: 'short' }).toUpperCase()}</div>
              <div className="font-display font-bold text-[28px] tabular leading-none">{new Date(p.fecha_inicio).getDate()}</div>
            </div>
            <div className="w-px h-12 bg-line"/>
            <div className="flex-1">
              <div className="font-display font-bold text-[16px]">{Da.Planes[p.plan_id-1].nombre}</div>
              <div className="text-[12px] text-ink-soft mt-0.5 font-mono">
                {Da.fmtDate(p.fecha_inicio)} → {Da.fmtDate(p.fecha_vencimiento)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-bold text-[22px] tabular">{Da.fmtMoney(p.monto)}</div>
              {p.fecha_pago && <div className="text-[11px] font-mono text-ink-mute mt-0.5">Pagado {Da.fmtDate(p.fecha_pago)}</div>}
            </div>
            <PaymentStatusBadge estado={p.estado}/>
            <button className="btn btn-sm"><Icon.Download size={13}/> Recibo</button>
          </div>
        ))}
      </div>
    </div>
  );
}

window.AlumnoPages = { AlumnoHorario, AlumnoPagos };
Object.assign(window, window.AlumnoPages);
