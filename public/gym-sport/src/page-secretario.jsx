// Secretario pages: Alumnos, Recuperos, Pagos, Asistencia
const Ds = window.GymData;

// ---------- Alumnos (full crud + payment) ----------
function SecAlumnos({ globalState }) {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('todos');
  const [detail, setDetail] = useState(null);
  const [paymentFor, setPaymentFor] = useState(null);
  const [newOpen, setNewOpen] = useState(false);
  const [alumnos, setAlumnos] = useState(Ds.Alumnos);
  const toast = useToast();

  const filtered = useMemo(() => alumnos.filter(a => {
    if (q && !(a.nombre + ' ' + a.email).toLowerCase().includes(q.toLowerCase())) return false;
    if (estado !== 'todos') {
      if (estado === 'vencido' && a.estado_pago !== 'vencido') return false;
      if (estado === 'pronto' && !(a.estado_pago === 'pagado' && Ds.diffDays(a.fecha_vencimiento) <= 7 && Ds.diffDays(a.fecha_vencimiento) >= 0)) return false;
      if (estado === 'pagado' && !(a.estado_pago === 'pagado' && Ds.diffDays(a.fecha_vencimiento) > 7)) return false;
    }
    return true;
  }), [alumnos, q, estado]);

  if (globalState === 'loading') return <LoadingState rows={8}/>;
  if (globalState === 'error') return <ErrorState/>;

  const registrarPago = async (alumno, planId) => {
    const plan = Ds.Planes.find(p => p.id === planId);
    try {
      const fechaInicio = new Date().toISOString().slice(0, 10);
      const res = await GymAPI.pagos.create({ alumno_id: alumno.id, plan_id: planId, fecha_inicio: fechaInicio });
      const pagoId = res.data?.id;
      if (pagoId) await GymAPI.pagos.markPaid(pagoId);
      const duracion = plan.duracion_dias || 30;
      setAlumnos(cur => cur.map(a => a.id === alumno.id ? {
        ...a,
        estado_pago: 'pagado',
        plan_id: planId,
        fecha_vencimiento: Ds.addDays(new Date(), duracion).toISOString(),
      } : a));
      toast.push(`Pago registrado · ${alumno.nombre} · ${Ds.fmtMoney(plan.precio)}`, 'ok');
      setPaymentFor(null);
    } catch (err) {
      toast.push(err.message || 'Error al registrar pago', 'bad');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operaciones"
        title="Alumnos"
        subtitle="Gestioná la base de alumnos: pagos, planes y vencimientos."
        actions={<>
          <button className="btn"><Icon.Download size={14}/> Exportar</button>
          <button className="btn btn-primary" onClick={() => setNewOpen(true)}><Icon.Plus size={14}/> Nuevo alumno</button>
        </>}
      />

      <Card padded={false}>
        <div className="p-4 border-b border-line flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Icon.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"/>
            <input className="input pl-9" placeholder="Buscar por nombre o email…" value={q} onChange={e=>setQ(e.target.value)}/>
          </div>
          <Tabs value={estado} onChange={setEstado} items={[
            { value: 'todos', label: 'Todos', count: alumnos.length },
            { value: 'pagado', label: 'Al día', count: alumnos.filter(a => a.estado_pago === 'pagado' && Ds.diffDays(a.fecha_vencimiento) > 7).length },
            { value: 'pronto', label: 'Vence pronto', count: alumnos.filter(a => a.estado_pago === 'pagado' && Ds.diffDays(a.fecha_vencimiento) <= 7 && Ds.diffDays(a.fecha_vencimiento) >= 0).length },
            { value: 'vencido', label: 'Vencidos', count: alumnos.filter(a => a.estado_pago === 'vencido').length },
          ]}/>
          <div className="ml-auto text-[11.5px] font-mono text-ink-mute">{filtered.length} de {alumnos.length}</div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Icon.Users} title="Ningún alumno coincide" message="Probá limpiar los filtros."/>
        ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Plan</th>
              <th>Estado</th>
              <th>Vencimiento</th>
              <th>Clases</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const d = Ds.diffDays(a.fecha_vencimiento);
              const rowAttn = a.estado_pago === 'vencido';
              return (
                <tr key={a.id} className={rowAttn ? 'bg-red-50/40' : ''}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.nombre} size={28}/>
                      <div>
                        <div className="font-semibold">{a.nombre}</div>
                        <div className="text-[11px] text-ink-mute">{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-[12.5px]">{Ds.Planes[a.plan_id-1].nombre}</td>
                  <td><PaymentStatusBadge estado={a.estado_pago}/></td>
                  <td>
                    <div className="font-mono text-[12px]">{Ds.fmtDate(a.fecha_vencimiento)}</div>
                    <div className={`text-[11px] ${d < 0 ? 'text-red-600 font-semibold' : d <= 7 ? 'text-amber-700' : 'text-ink-mute'}`}>
                      {d < 0 ? `Vencido hace ${-d} d` : `Vence en ${d} d`}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {a.clases_inscripto.slice(0,2).map(cid => {
                        const c = Ds.Clases.find(x => x.id === cid);
                        const disc = Ds.Disciplinas.find(d => d.id === c.disciplina_id);
                        return <span key={cid} className="tag" style={{ borderColor: disc.color, color: disc.color }}>{disc.nombre}</span>;
                      })}
                      {a.clases_inscripto.length > 2 && <span className="tag">+{a.clases_inscripto.length - 2}</span>}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className="btn btn-sm" onClick={() => setDetail(a)}>Ver detalle</button>
                      <button className="btn btn-primary btn-sm" onClick={() => setPaymentFor(a)}>Cobrar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </Card>

      {/* Detail Modal */}
      {detail && <AlumnoDetailModal alumno={detail} onClose={() => setDetail(null)} onCobrar={() => { setPaymentFor(detail); setDetail(null); }}/>}
      {/* Payment Modal */}
      {paymentFor && <PaymentFormModal alumno={paymentFor} onClose={() => setPaymentFor(null)} onSubmit={registrarPago}/>}
      {/* New alumno */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Nuevo alumno" subtitle="Cargá los datos básicos. Podés registrar el primer pago a continuación."
        footer={<>
          <button className="btn" onClick={() => setNewOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { setNewOpen(false); toast.push('Alumno creado', 'ok'); }}>Crear alumno</button>
        </>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre completo" required><input className="input" defaultValue=""/></Field>
          <Field label="Email" required><input className="input" type="email"/></Field>
          <Field label="Teléfono"><input className="input" placeholder="+54 11 …"/></Field>
          <Field label="Fecha nacimiento"><input className="input" type="date"/></Field>
          <Field label="Plan" required>
            <select className="input">
              {Ds.Planes.map(p => <option key={p.id} value={p.id}>{p.nombre} — {Ds.fmtMoney(p.precio)}</option>)}
            </select>
          </Field>
          <Field label="Disciplina principal">
            <select className="input">
              {Ds.Disciplinas.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}

function AlumnoDetailModal({ alumno, onClose, onCobrar }) {
  const [tab, setTab] = useState('resumen');
  const [enrollments, setEnrollments] = useState(alumno.clases_inscripto);
  const [waitlist, setWaitlist] = useState(Ds.ListasEspera.filter(w => w.alumno_id === alumno.id));
  const [suspensiones, setSuspensiones] = useState(Ds.Suspensiones.filter(s => s.alumno_id === alumno.id));
  const [suspOpen, setSuspOpen] = useState(false);
  const toast = useToast();

  const pagos = Ds.Pagos.filter(p => p.alumno_id === alumno.id).sort((a,b)=> new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
  const suspActiva = suspensiones.find(s => s.estado === 'activa');

  const inscribir = (claseId) => {
    setEnrollments(cur => [...cur, claseId]);
    toast.push('Alumno inscripto a la clase', 'ok');
  };
  const desinscribir = (claseId) => {
    setEnrollments(cur => cur.filter(c => c !== claseId));
    toast.push('Alumno desinscripto', 'warn');
  };
  const anotarListaEspera = (claseId) => {
    const posicion = Ds.ListasEspera.filter(w => w.clase_id === claseId).length + waitlist.filter(w => w.clase_id === claseId).length + 1;
    setWaitlist(cur => [...cur, { id: Date.now(), alumno_id: alumno.id, clase_id: claseId, posicion, solicitado: new Date().toISOString() }]);
    toast.push(`Anotado en lista de espera · Posición ${posicion}`, 'ok');
  };
  const quitarListaEspera = (claseId) => {
    setWaitlist(cur => cur.filter(w => w.clase_id !== claseId));
    toast.push('Removido de la lista de espera', 'warn');
  };
  const crearSuspension = (payload) => {
    setSuspensiones(cur => [...cur, { id: Date.now(), alumno_id: alumno.id, ...payload, estado: 'activa' }]);
    toast.push(`Cuota suspendida hasta ${Ds.fmtDate(payload.hasta)}`, 'warn');
    setSuspOpen(false);
  };
  const finalizarSuspension = (id) => {
    setSuspensiones(cur => cur.map(s => s.id === id ? { ...s, estado: 'finalizada', hasta: new Date().toISOString() } : s));
    toast.push('Suspensión finalizada anticipadamente', 'ok');
  };

  return (
    <Modal open={true} onClose={onClose} title={alumno.nombre} subtitle={alumno.email} size="lg"
      footer={<>
        <button className="btn" onClick={onClose}>Cerrar</button>
        <button className="btn btn-primary" onClick={onCobrar}>Registrar pago</button>
      </>}>
      <Tabs value={tab} onChange={setTab} items={[
        { value: 'resumen', label: 'Resumen' },
        { value: 'pagos', label: 'Pagos', count: pagos.length },
        { value: 'clases', label: 'Clases', count: enrollments.length },
        { value: 'suspensiones', label: 'Suspensiones', count: suspensiones.length },
      ]}/>

      <div className="mt-5">
        {tab === 'resumen' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-4">
              <div className="eyebrow">Plan actual</div>
              <div className="font-display font-bold text-[18px] mt-1">{Ds.Planes[alumno.plan_id-1].nombre}</div>
              <div className="font-mono text-[12px] text-ink-soft mt-0.5">{Ds.fmtMoney(Ds.Planes[alumno.plan_id-1].precio)} / mes</div>
            </div>
            <div className="card p-4">
              <div className="eyebrow">Estado</div>
              <div className="mt-2"><PaymentStatusBadge estado={alumno.estado_pago}/></div>
              <div className="font-mono text-[12px] text-ink-soft mt-1.5">Vence {Ds.fmtDate(alumno.fecha_vencimiento)}</div>
            </div>
            <div className="card p-4">
              <div className="eyebrow">Alumno desde</div>
              <div className="font-display font-bold text-[18px] mt-1">{Ds.fmtDate(alumno.desde)}</div>
              <div className="font-mono text-[12px] text-ink-soft mt-0.5">{Math.round((new Date() - new Date(alumno.desde)) / 86400000)} días</div>
            </div>
            {suspActiva && (
              <div className="col-span-3 border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 flex items-center gap-3">
                <Icon.Clock size={16} className="text-amber-700"/>
                <div className="flex-1 text-[12.5px]">
                  <span className="font-semibold text-amber-900">Cuota suspendida</span>
                  <span className="text-amber-800"> hasta {Ds.fmtDate(suspActiva.hasta)} · {suspActiva.motivo}</span>
                </div>
                <button className="btn btn-sm" onClick={() => finalizarSuspension(suspActiva.id)}>Reactivar</button>
              </div>
            )}
            <div className="col-span-3">
              <div className="eyebrow mb-2">Contacto</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-[13px]"><Icon.Mail size={13} className="text-ink-mute"/> {alumno.email}</div>
                <div className="flex items-center gap-2 text-[13px] font-mono"><Icon.Bell size={13} className="text-ink-mute"/> {alumno.telefono}</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'pagos' && (
          <div className="card p-0">
            <table className="tbl">
              <thead><tr><th>Período</th><th>Plan</th><th>Monto</th><th>Estado</th></tr></thead>
              <tbody>
                {pagos.map(p => (
                  <tr key={p.id}>
                    <td className="font-mono text-[12px]">{Ds.fmtDate(p.fecha_inicio)} – {Ds.fmtDate(p.fecha_vencimiento)}</td>
                    <td className="text-[12.5px]">{Ds.Planes[p.plan_id-1].nombre}</td>
                    <td className="font-mono font-semibold">{Ds.fmtMoney(p.monto)}</td>
                    <td><PaymentStatusBadge estado={p.estado}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'clases' && (
          <ClasesEnrollment
            alumno={alumno}
            enrollments={enrollments}
            waitlist={waitlist}
            onInscribir={inscribir}
            onDesinscribir={desinscribir}
            onAnotarEspera={anotarListaEspera}
            onQuitarEspera={quitarListaEspera}
          />
        )}

        {tab === 'suspensiones' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[12.5px] text-ink-soft">Pausar la cuota por vacaciones, lesión u otros motivos. No se cobra durante la suspensión.</div>
              <button className="btn btn-primary btn-sm" disabled={!!suspActiva} onClick={() => setSuspOpen(true)}>
                <Icon.Plus size={13}/> Nueva suspensión
              </button>
            </div>
            {suspActiva && (
              <div className="border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 mb-3 text-[12.5px]">
                Ya hay una suspensión activa hasta {Ds.fmtDate(suspActiva.hasta)}. Reactivá la cuota desde Resumen para crear una nueva.
              </div>
            )}
            {suspensiones.length === 0 ? (
              <EmptyState icon={Icon.Clock} title="Sin suspensiones" message="Este alumno nunca tuvo la cuota suspendida."/>
            ) : (
              <div className="card p-0">
                <table className="tbl">
                  <thead><tr><th>Desde</th><th>Hasta</th><th>Días</th><th>Motivo</th><th>Estado</th></tr></thead>
                  <tbody>
                    {suspensiones.sort((a,b) => new Date(b.desde) - new Date(a.desde)).map(s => {
                      const dias = Math.round((new Date(s.hasta) - new Date(s.desde)) / 86400000);
                      return (
                        <tr key={s.id}>
                          <td className="font-mono text-[12px]">{Ds.fmtDate(s.desde)}</td>
                          <td className="font-mono text-[12px]">{Ds.fmtDate(s.hasta)}</td>
                          <td className="font-mono">{dias} d</td>
                          <td className="text-[12.5px]">{s.motivo}</td>
                          <td>{s.estado === 'activa' ? <Badge kind="warn" dot>Activa</Badge> : <Badge kind="neutral">Finalizada</Badge>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {suspOpen && <SuspensionFormModal onClose={() => setSuspOpen(false)} onSubmit={crearSuspension}/>}
    </Modal>
  );
}

function ClasesEnrollment({ alumno, enrollments, waitlist, onInscribir, onDesinscribir, onAnotarEspera, onQuitarEspera, hideHeader = false }) {
  const [discFiltro, setDiscFiltro] = useState('todas');
  const filtered = Ds.Clases.filter(c => discFiltro === 'todas' || c.disciplina_id === +discFiltro);

  return (
    <div>
      {!hideHeader && (
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <div className="text-[12.5px] text-ink-soft">
            Inscripto a <b>{enrollments.length}</b> clases · En espera <b>{waitlist.length}</b>
          </div>
          <select className="input max-w-[200px] ml-auto" value={discFiltro} onChange={e => setDiscFiltro(e.target.value)}>
            <option value="todas">Todas las disciplinas</option>
            {Ds.Disciplinas.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(c => {
          const disc = Ds.Disciplinas.find(d => d.id === c.disciplina_id);
          const prof = Ds.Profesores.find(p => p.id === c.profesor_id);
          const isEnrolled = enrollments.includes(c.id);
          const isWaiting = waitlist.find(w => w.clase_id === c.id);
          // Compute "real" current occupancy considering this alumno's tentative enrollment
          const realCupos = c.cupos_ocup + (isEnrolled && !alumno.clases_inscripto.includes(c.id) ? 1 : 0)
                          - (!isEnrolled && alumno.clases_inscripto.includes(c.id) ? 1 : 0);
          const isFull = realCupos >= c.cupos_max && !isEnrolled;
          const totalEspera = Ds.ListasEspera.filter(w => w.clase_id === c.id).length;

          return (
            <div key={c.id} className="card p-3 flex items-center gap-4">
              <div className="w-1 h-12" style={{ background: disc.color }}/>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[15px]" style={{ color: disc.color }}>{disc.nombre}</div>
                <div className="text-[11.5px] text-ink-soft font-mono">{Ds.DOW_FULL[c.dia]} · {c.hora_ini}–{c.hora_fin} · {c.espacio}</div>
                <div className="text-[11px] text-ink-mute">Prof. {prof.nombre}</div>
              </div>
              <div className="w-[140px]">
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="font-mono">{realCupos}/{c.cupos_max}</span>
                  {isFull && <Badge kind="bad">Llena</Badge>}
                </div>
                <div className={`prog mt-1 ${realCupos / c.cupos_max > 0.9 ? 'bad' : realCupos / c.cupos_max > 0.7 ? 'warn' : ''}`} style={{ height: 4 }}>
                  <i style={{ width: (realCupos / c.cupos_max * 100) + '%' }}/>
                </div>
              </div>
              <div className="w-[180px] text-right">
                {isEnrolled ? (
                  <div className="flex flex-col gap-1 items-end">
                    <Badge kind="ok" dot>Inscripto</Badge>
                    <button className="text-[11px] text-red-600 hover:underline font-semibold" onClick={() => onDesinscribir(c.id)}>Desinscribir</button>
                  </div>
                ) : isWaiting ? (
                  <div className="flex flex-col gap-1 items-end">
                    <Badge kind="warn" dot>Lista #{isWaiting.posicion}</Badge>
                    <button className="text-[11px] text-red-600 hover:underline font-semibold" onClick={() => onQuitarEspera(c.id)}>Quitarme</button>
                  </div>
                ) : isFull ? (
                  <button className="btn btn-sm" onClick={() => onAnotarEspera(c.id)}>
                    <Icon.Clock size={12}/> Lista de espera ({totalEspera})
                  </button>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => onInscribir(c.id)}>
                    <Icon.Plus size={12}/> Inscribir
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SuspensionFormModal({ onClose, onSubmit }) {
  const [desde, setDesde] = useState(new Date().toISOString().slice(0,10));
  const [hasta, setHasta] = useState(Ds.addDays(new Date(), 14).toISOString().slice(0,10));
  const [motivo, setMotivo] = useState('');
  const dias = Math.round((new Date(hasta) - new Date(desde)) / 86400000);
  return (
    <Modal open={true} onClose={onClose} title="Suspender cuota" subtitle="La facturación se pausa durante el período indicado."
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" disabled={!motivo || dias <= 0} onClick={() => onSubmit({ desde, hasta, motivo })}>
          Suspender por {dias} días
        </button>
      </>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Desde" required><input className="input" type="date" value={desde} onChange={e => setDesde(e.target.value)} min={new Date().toISOString().slice(0,10)}/></Field>
          <Field label="Hasta" required><input className="input" type="date" value={hasta} onChange={e => setHasta(e.target.value)} min={desde}/></Field>
        </div>
        <Field label="Motivo" required>
          <select className="input" value={motivo} onChange={e => setMotivo(e.target.value)}>
            <option value="">Seleccionar motivo…</option>
            <option>Vacaciones</option>
            <option>Viaje</option>
            <option>Lesión</option>
            <option>Tratamiento médico</option>
            <option>Mudanza</option>
            <option>Otro</option>
          </select>
        </Field>
        {dias > 0 && (
          <div className="border border-line p-3 bg-bg-soft flex items-center justify-between">
            <span className="text-[12.5px] text-ink-soft">Duración total</span>
            <span className="font-display font-bold text-[22px] tabular">{dias} días</span>
          </div>
        )}
      </div>
    </Modal>
  );
}

function PaymentFormModal({ alumno, onClose, onSubmit }) {
  const [planId, setPlanId] = useState(alumno.plan_id);
  const [notas, setNotas] = useState('');
  const plan = Ds.Planes.find(p => p.id === +planId);
  return (
    <Modal open={true} onClose={onClose} title="Registrar pago" subtitle={`Alumno: ${alumno.nombre}`}
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onSubmit(alumno, +planId)}>Confirmar · {Ds.fmtMoney(plan.precio)}</button>
      </>}>
      <div className="space-y-4">
        <Field label="Plan" required>
          <select className="input" value={planId} onChange={e => setPlanId(e.target.value)}>
            {Ds.Planes.map(p => <option key={p.id} value={p.id}>{p.nombre} — {Ds.fmtMoney(p.precio)}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha de inicio" required><input className="input" type="date" defaultValue={new Date().toISOString().slice(0,10)}/></Field>
          <Field label="Vencimiento" hint={`Auto-calculado a ${plan.duracion_dias || 30} días`}><input className="input bg-bg-soft" disabled value={Ds.fmtDate(Ds.addDays(new Date(), plan.duracion_dias || 30))}/></Field>
        </div>
        <Field label="Método de pago">
          <div className="flex gap-1">
            {['Efectivo','Transferencia','Tarjeta','MercadoPago'].map((m,i) => (
              <button key={m} className={`tag ${i===0?'active':''}`}>{m}</button>
            ))}
          </div>
        </Field>
        <Field label="Notas (opcional)">
          <textarea className="input" rows={3} value={notas} onChange={e => setNotas(e.target.value)} placeholder="Ej: pagó con vuelto pendiente…"/>
        </Field>
        <div className="border border-line p-3 bg-bg-soft">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] text-ink-soft">Total a cobrar</span>
            <span className="font-display font-bold text-[26px] tabular">{Ds.fmtMoney(plan.precio)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Recuperos ----------
function SecRecuperos({ globalState }) {
  const [tab, setTab] = useState('pendiente');
  const [recs, setRecs] = useState(Ds.Recuperos);
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();
  if (globalState === 'loading') return <LoadingState/>;
  if (globalState === 'error') return <ErrorState/>;

  const filtered = recs.filter(r => r.estado === tab);

  const process = async (rec, decision) => {
    try {
      if (decision === 'aprobar') {
        await GymAPI.makeups.approve(rec.id);
      } else {
        await GymAPI.makeups.reject(rec.id);
      }
      setRecs(cur => cur.map(r => r.id === rec.id ? { ...r, estado: decision === 'aprobar' ? 'aprobada' : 'rechazada' } : r));
      const al = Ds.Alumnos.find(a => a.id === rec.alumno_id);
      const nombre = al ? al.nombre : (rec._alumno?.nombre || 'Alumno');
      toast.push(`Recupero de ${nombre} ${decision === 'aprobar' ? 'aprobado' : 'rechazado'}`, decision === 'aprobar' ? 'ok' : 'warn');
      setConfirm(null);
    } catch (err) {
      toast.push(err.message || 'Error al procesar recupero', 'bad');
      setConfirm(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Solicitudes"
        title="Recuperos"
        subtitle="Revisá y resolvé los pedidos de recuperación de clases perdidas."
      />
      <Card padded={false}>
        <div className="p-4 border-b border-line">
          <Tabs value={tab} onChange={setTab} items={[
            { value: 'pendiente', label: 'Pendientes', count: recs.filter(r => r.estado === 'pendiente').length },
            { value: 'aprobada', label: 'Aprobadas', count: recs.filter(r => r.estado === 'aprobada').length },
            { value: 'rechazada', label: 'Rechazadas', count: recs.filter(r => r.estado === 'rechazada').length },
          ]}/>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Icon.Check}
            title={tab === 'pendiente' ? 'Nada pendiente' : `Sin recuperos ${tab}s`}
            message={tab === 'pendiente' ? 'Todos los pedidos están resueltos. Buen trabajo.' : 'Cambiá de pestaña para ver el resto.'}/>
        ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Clase perdida</th>
              <th>Clase de recupero</th>
              <th>Solicitado</th>
              {tab === 'pendiente' && <th className="text-right">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const al = Ds.Alumnos.find(a => a.id === r.alumno_id);
              const co = Ds.Clases.find(c => c.id === r.clase_origen);
              const cd = Ds.Clases.find(c => c.id === r.clase_destino);
              const co_d = Ds.Disciplinas.find(d => d.id === co.disciplina_id);
              const cd_d = Ds.Disciplinas.find(d => d.id === cd.disciplina_id);
              return (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={al.nombre} size={28}/>
                      <div>
                        <div className="font-semibold">{al.nombre}</div>
                        <div className="text-[11px] text-ink-mute font-mono">{Ds.Planes[al.plan_id-1].nombre}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-[12.5px] font-semibold" style={{ color: co_d.color }}>{co_d.nombre}</div>
                    <div className="font-mono text-[11px] text-ink-soft">{Ds.fmtDate(r.fecha_origen)} · {co.hora_ini}</div>
                  </td>
                  <td>
                    <div className="text-[12.5px] font-semibold" style={{ color: cd_d.color }}>{cd_d.nombre}</div>
                    <div className="font-mono text-[11px] text-ink-soft">{Ds.fmtDate(r.fecha_destino)} · {cd.hora_ini}</div>
                  </td>
                  <td>
                    <div className="font-mono text-[12px]">{Ds.fmtDate(r.solicitado)}</div>
                    <div className="text-[11px] text-ink-mute">hace {-Ds.diffDays(r.solicitado)} d</div>
                  </td>
                  {tab === 'pendiente' && (
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button className="btn btn-sm" onClick={() => setConfirm({ rec: r, decision: 'rechazar' })}>
                          <Icon.X size={13}/> Rechazar
                        </button>
                        <button className="btn btn-success btn-sm" onClick={() => setConfirm({ rec: r, decision: 'aprobar' })}>
                          <Icon.Check size={13}/> Aprobar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </Card>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.decision === 'aprobar' ? 'Aprobar recupero' : 'Rechazar recupero'}
        message={confirm ? (confirm.decision === 'aprobar'
          ? `Se permitirá al alumno asistir a la clase de recupero seleccionada.`
          : `El alumno será notificado del rechazo. Esta acción se puede revertir.`) : ''}
        confirmLabel={confirm?.decision === 'aprobar' ? 'Sí, aprobar' : 'Sí, rechazar'}
        danger={confirm?.decision === 'rechazar'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => process(confirm.rec, confirm.decision)}
      />
    </div>
  );
}

// ---------- Pagos (secretario) ----------
function SecPagos({ globalState }) {
  const [estado, setEstado] = useState('todos');
  const [q, setQ] = useState('');
  const [pagos, setPagos] = useState(Ds.Pagos);
  const toast = useToast();
  if (globalState === 'loading') return <LoadingState/>;
  if (globalState === 'error') return <ErrorState/>;

  const filtered = pagos.filter(p => {
    if (estado !== 'todos' && p.estado !== estado) return false;
    if (q) {
      const a = Ds.Alumnos.find(x => x.id === p.alumno_id);
      if (!a.nombre.toLowerCase().includes(q.toLowerCase())) return false;
    }
    return true;
  }).slice(0, 30);

  const changeState = (id, next) => {
    setPagos(cur => cur.map(p => p.id === id ? { ...p, estado: next, fecha_pago: next === 'pagado' ? new Date().toISOString() : p.fecha_pago } : p));
    toast.push(`Pago marcado como ${next}`, 'ok');
  };

  return (
    <div>
      <PageHeader eyebrow="Finanzas" title="Pagos"
        subtitle="Gestioná el estado de cada pago. Las filas vencidas resaltan automáticamente."
        actions={<button className="btn btn-primary"><Icon.Plus size={14}/> Registrar pago</button>}
      />
      <Card padded={false}>
        <div className="p-4 border-b border-line flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Icon.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"/>
            <input className="input pl-9" placeholder="Buscar alumno…" value={q} onChange={e=>setQ(e.target.value)}/>
          </div>
          <div className="flex gap-1">
            {[['todos','Todos'],['pagado','Pagados'],['pendiente','Pendientes'],['vencido','Vencidos']].map(([k,l]) => (
              <button key={k} onClick={()=>setEstado(k)} className={`tag ${estado===k?'active':''}`}>{l}</button>
            ))}
          </div>
          <div className="ml-auto text-[11.5px] font-mono text-ink-mute">{filtered.length} pagos</div>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>Vencimiento</th><th>Alumno</th><th>Plan</th><th>Monto</th><th>Pago</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const a = Ds.Alumnos.find(x => x.id === p.alumno_id);
              const overdue = p.estado !== 'pagado' && Ds.diffDays(p.fecha_vencimiento) < 0;
              return (
                <tr key={p.id} className={overdue ? 'bg-red-50/50' : ''}>
                  <td className="font-mono text-[12px]">
                    {Ds.fmtDate(p.fecha_vencimiento)}
                    {overdue && <span className="ml-2 text-red-600 font-semibold">↺</span>}
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.nombre} size={26}/>
                      <span className="font-semibold">{a.nombre}</span>
                    </div>
                  </td>
                  <td className="text-[12.5px]">{Ds.Planes[p.plan_id-1].nombre}</td>
                  <td className="font-mono font-semibold tabular">{Ds.fmtMoney(p.monto)}</td>
                  <td className="font-mono text-[12px] text-ink-soft">{p.fecha_pago ? Ds.fmtDate(p.fecha_pago) : '—'}</td>
                  <td>
                    <select className="input py-1.5 text-[12px] w-[130px]" value={p.estado} onChange={e => changeState(p.id, e.target.value)}>
                      <option value="pagado">Pagado</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="vencido">Vencido</option>
                    </select>
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

// ---------- Asistencia ----------
function SecAsistencia({ globalState }) {
  const [claseId, setClaseId] = useState(Ds.Clases[0].id);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0,10));
  const [presentes, setPresentes] = useState({});
  const toast = useToast();
  if (globalState === 'loading') return <LoadingState/>;
  if (globalState === 'error') return <ErrorState/>;

  const clase = Ds.Clases.find(c => c.id === +claseId);
  const disc = Ds.Disciplinas.find(d => d.id === clase.disciplina_id);
  const prof = Ds.Profesores.find(p => p.id === clase.profesor_id);
  const inscriptos = Ds.Alumnos.filter(a => a.clases_inscripto.includes(clase.id));
  const recupAprob = Ds.Recuperos
    .filter(r => r.estado === 'aprobada' && r.clase_destino === clase.id)
    .map(r => Ds.Alumnos.find(a => a.id === r.alumno_id))
    .filter(Boolean);

  const lista = [
    ...inscriptos.map(a => ({ ...a, kind: 'inscripto' })),
    ...recupAprob.map(a => ({ ...a, kind: 'recupero' })),
  ];

  const toggle = (id) => setPresentes(cur => ({ ...cur, [id]: !cur[id] }));
  const setAll = (val) => setPresentes(lista.reduce((acc, a) => ({ ...acc, [a.id]: val }), {}));

  const guardar = () => {
    const pres = lista.filter(a => presentes[a.id]).length;
    toast.push(`Asistencia guardada · ${pres} presentes de ${lista.length}`, 'ok');
  };

  const presCount = lista.filter(a => presentes[a.id]).length;

  return (
    <div>
      <PageHeader eyebrow="Operativa diaria" title="Asistencia"
        subtitle="Registrá quiénes asistieron a cada clase. Los alumnos con recupero aprobado aparecen marcados."
      />

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Clase">
            <select className="input" value={claseId} onChange={e=>{setClaseId(+e.target.value); setPresentes({});}}>
              {Ds.Clases.map(c => {
                const d = Ds.Disciplinas.find(x => x.id === c.disciplina_id);
                return <option key={c.id} value={c.id}>{d.nombre} · {Ds.DOW[c.dia]} {c.hora_ini} · {c.espacio} · {c.cupos_ocup}/{c.cupos_max} cupos</option>;
              })}
            </select>
          </Field>
          <Field label="Fecha">
            <input className="input" type="date" value={fecha} onChange={e=>setFecha(e.target.value)}/>
          </Field>
          <div className="flex items-end">
            <div className="card p-3 w-full bg-bg-soft">
              <div className="flex items-center gap-3">
                <div className="w-2 h-10" style={{ background: disc.color }}/>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-[18px] truncate">{disc.nombre}</div>
                  <div className="text-[11.5px] text-ink-soft font-mono truncate">{prof.nombre} · {clase.hora_ini}–{clase.hora_fin}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-[26px] tabular leading-none">{presCount}<span className="text-ink-mute">/{lista.length}</span></div>
                  <div className="text-[10.5px] uppercase tracking-wider text-ink-mute mt-1">presentes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Contract banner: scope of who can be marked */}
      <div className="mt-4 flex items-center gap-3 flex-wrap text-[12px] text-ink-soft">
        <span className="eyebrow">Alcance</span>
        <Badge kind="neutral">{inscriptos.length} inscriptos fijos</Badge>
        {recupAprob.length > 0 && <Badge kind="info" dot>+ {recupAprob.length} con recupero aprobado</Badge>}
        <span className="ml-auto text-[11.5px] font-mono text-ink-mute">Cupo de la clase: {clase.cupos_ocup}/{clase.cupos_max}</span>
      </div>

      {lista.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={Icon.Users}
            title="Esta clase no tiene alumnos"
            message="Cuando se inscriban alumnos a esta clase aparecerán acá. Los alumnos con recupero aprobado para esta fecha también se sumarán automáticamente."/>
        </div>
      ) : (<>
      <div className="mt-4 flex items-center justify-between mb-3">
        <div className="eyebrow">Lista del día · {lista.length} alumnos</div>
        <div className="flex gap-1">
          <button className="btn btn-sm" onClick={() => setAll(true)}>Marcar todos</button>
          <button className="btn btn-sm" onClick={() => setAll(false)}>Limpiar</button>
        </div>
      </div>

      <Card padded={false}>
        <table className="tbl">
          <thead>
            <tr><th style={{ width: 60 }}></th><th>Alumno</th><th>Plan</th><th>Origen</th></tr>
          </thead>
          <tbody>
            {lista.map(a => (
              <tr key={a.id + '-' + a.kind}>
                <td>
                  <div className={`chk ${presentes[a.id] ? 'checked' : ''}`} onClick={() => toggle(a.id)}>
                    {presentes[a.id] && <Icon.Check size={12}/>}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={a.nombre} size={28}/>
                    <span className="font-semibold">{a.nombre}</span>
                  </div>
                </td>
                <td className="text-[12.5px]">{Ds.Planes[a.plan_id-1].nombre}</td>
                <td>
                  {a.kind === 'recupero'
                    ? <Badge kind="info" dot>Recupero</Badge>
                    : <Badge kind="neutral">Inscripto</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-5 flex justify-end gap-2">
        <button className="btn">Descartar</button>
        <button className="btn btn-primary" onClick={guardar}><Icon.Check size={14}/> Guardar asistencia</button>
      </div>
      </>)}
    </div>
  );
}

window.SecPages = { SecAlumnos, SecRecuperos, SecPagos, SecAsistencia };
Object.assign(window, window.SecPages);
