// Caja diaria (Secretaría) + vista de lectura para Dueño.
const Dc = window.GymData;

function CajaDiaria({ globalState, readOnly = false }) {
  const [estado, setEstado] = useState(Dc.CajaHoy.estado);
  const [movs, setMovs] = useState(Dc.CajaHoy.movimientos);
  const [egresoOpen, setEgresoOpen] = useState(false);
  const [cierreOpen, setCierreOpen] = useState(false);
  const [aperturaOpen, setAperturaOpen] = useState(false);
  const toast = useToast();

  if (globalState === 'loading') return <LoadingState/>;
  if (globalState === 'error') return <ErrorState/>;

  // Totales
  const ingresos = movs.filter(m => m.tipo === 'ingreso');
  const egresos = movs.filter(m => m.tipo === 'egreso');
  const totIngresos = ingresos.reduce((s, m) => s + m.monto, 0);
  const totEgresos = egresos.reduce((s, m) => s + m.monto, 0);
  const neto = totIngresos - totEgresos;

  // Por método
  const porMetodo = Dc.METODOS_PAGO.map(m => ({
    metodo: m,
    monto: ingresos.filter(x => x.metodo === m).reduce((s, x) => s + x.monto, 0),
    count: ingresos.filter(x => x.metodo === m).length,
  }));

  // Efectivo en caja: apertura + ingresos efectivo - egresos efectivo
  const efectivoEnCaja = Dc.CajaHoy.apertura
    + ingresos.filter(m => m.metodo === 'Efectivo').reduce((s, m) => s + m.monto, 0)
    - egresos.filter(m => m.metodo === 'Efectivo').reduce((s, m) => s + m.monto, 0);

  const registrarEgreso = (payload) => {
    const nm = {
      id: Date.now(), hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      tipo: 'egreso', ...payload, responsable: 'Valeria Donati',
    };
    setMovs(cur => [...cur, nm].sort((a, b) => a.hora.localeCompare(b.hora)));
    toast.push(`Egreso registrado · ${Dc.fmtMoney(payload.monto)}`, 'warn');
    setEgresoOpen(false);
  };

  const cerrarCaja = (arqueoEfectivo) => {
    const diff = arqueoEfectivo - efectivoEnCaja;
    setEstado('cerrada');
    toast.push(diff === 0 ? 'Caja cerrada · Arqueo OK' : `Caja cerrada · Diferencia ${diff > 0 ? '+' : ''}${Dc.fmtMoney(diff)}`,
               diff === 0 ? 'ok' : 'warn');
    setCierreOpen(false);
  };

  return (
    <div>
      <PageHeader
        eyebrow={readOnly ? 'Finanzas · Lectura' : 'Operativa diaria'}
        title="Caja diaria"
        subtitle="Movimientos del día, totales por método y arqueo de cierre."
        actions={!readOnly && (estado === 'abierta' ? <>
          <button className="btn" onClick={() => setEgresoOpen(true)}><Icon.Plus size={14}/> Registrar egreso</button>
          <button className="btn btn-primary" onClick={() => setCierreOpen(true)}><Icon.Lock size={14}/> Cerrar caja</button>
        </> : <button className="btn btn-primary" onClick={() => setAperturaOpen(true)}><Icon.Plus size={14}/> Abrir nueva caja</button>)}
      />

      {/* Status banner */}
      <div className={`mb-5 border-l-2 px-4 py-3 flex items-center gap-3 ${estado === 'abierta' ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-950/30' : 'bg-bg-soft border-line-strong'}`}>
        {estado === 'abierta'
          ? <>
              <span className="dot text-emerald-600"/>
              <div className="flex-1">
                <div className="font-semibold text-emerald-900 dark:text-emerald-100">Caja abierta</div>
                <div className="text-[12px] text-emerald-800 dark:text-emerald-200">Desde las {movs.find(m => m.tipo === 'apertura')?.hora || '08:30'} · Responsable: {Dc.CajaHoy.responsable}</div>
              </div>
              <div className="font-mono text-[12px] text-emerald-900 dark:text-emerald-100">{Dc.fmtDate(Dc.CajaHoy.fecha)}</div>
            </>
          : <>
              <Icon.Lock size={16} className="text-ink-soft"/>
              <div className="flex-1">
                <div className="font-semibold">Caja cerrada</div>
                <div className="text-[12px] text-ink-soft">La caja del día está cerrada. Abrí una nueva para empezar a operar.</div>
              </div>
            </>}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Ingresos del día" value={Dc.fmtMoney(totIngresos)} sub={`${ingresos.length} operaciones`} trend="up"/>
        <KpiCard label="Egresos del día" value={Dc.fmtMoney(totEgresos)} sub={`${egresos.length} operaciones`} intent={totEgresos > 0 ? 'warn' : null}/>
        <KpiCard label="Neto del día" value={Dc.fmtMoney(neto)} sub="Ingresos − egresos" trend="up"/>
        <KpiCard label="Efectivo en caja" value={Dc.fmtMoney(efectivoEnCaja)} sub={`Apertura ${Dc.fmtMoney(Dc.CajaHoy.apertura)}`}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        {/* Por método */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="eyebrow">Ingresos por método</div>
            <span className="text-[11.5px] font-mono text-ink-mute">{ingresos.length} cobros</span>
          </div>
          <div className="space-y-3">
            {porMetodo.map(pm => {
              const pct = totIngresos ? (pm.monto / totIngresos * 100) : 0;
              return (
                <div key={pm.metodo} className="flex items-center gap-4">
                  <div className="w-[120px] text-[13px] font-semibold">{pm.metodo}</div>
                  <div className="flex-1">
                    <div className="prog" style={{ height: 8 }}>
                      <i style={{ width: pct + '%' }}/>
                    </div>
                  </div>
                  <div className="text-right w-[140px]">
                    <div className="font-mono font-semibold tabular text-[13px]">{Dc.fmtMoney(pm.monto)}</div>
                    <div className="text-[10.5px] text-ink-mute">{pm.count} ops · {Math.round(pct)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        {/* Cuadre */}
        <Card>
          <div className="eyebrow">Cuadre esperado</div>
          <div className="mt-3 space-y-2.5 text-[13px]">
            <div className="flex justify-between"><span className="text-ink-soft">Apertura</span><span className="font-mono tabular">{Dc.fmtMoney(Dc.CajaHoy.apertura)}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">+ Efectivo cobrado</span><span className="font-mono tabular text-emerald-700">+{Dc.fmtMoney(ingresos.filter(m => m.metodo === 'Efectivo').reduce((s,m)=>s+m.monto,0))}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">− Egresos en efectivo</span><span className="font-mono tabular text-red-700">−{Dc.fmtMoney(egresos.filter(m => m.metodo === 'Efectivo').reduce((s,m)=>s+m.monto,0))}</span></div>
            <div className="hr-strong"/>
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">Efectivo esperado</span>
              <span className="font-display font-bold text-[22px] tabular">{Dc.fmtMoney(efectivoEnCaja)}</span>
            </div>
            <div className="text-[11.5px] text-ink-mute font-mono mt-1">Para arqueo al cierre</div>
          </div>
        </Card>
      </div>

      {/* Movimientos */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="eyebrow">Movimientos del día</div>
          <h2 className="font-display font-bold text-[22px] mt-1">{movs.length} operaciones</h2>
        </div>
      </div>
      <Card padded={false}>
        <table className="tbl">
          <thead>
            <tr><th>Hora</th><th>Tipo</th><th>Concepto</th><th>Método</th><th>Responsable</th><th className="text-right">Monto</th></tr>
          </thead>
          <tbody>
            {movs.map(m => (
              <tr key={m.id}>
                <td className="font-mono text-[12.5px]">{m.hora}</td>
                <td>
                  {m.tipo === 'apertura' && <Badge kind="info">Apertura</Badge>}
                  {m.tipo === 'ingreso' && <Badge kind="ok" dot>Ingreso</Badge>}
                  {m.tipo === 'egreso' && <Badge kind="bad" dot>Egreso</Badge>}
                </td>
                <td className="text-[13px]">{m.descripcion}</td>
                <td className="text-[12.5px]">{m.metodo}</td>
                <td className="text-[12px] text-ink-soft">{m.responsable}</td>
                <td className={`text-right font-mono font-semibold tabular ${m.tipo === 'egreso' ? 'text-red-700' : ''}`}>
                  {m.tipo === 'egreso' ? '−' : ''}{Dc.fmtMoney(m.monto)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Historial */}
      <div className="mt-8">
        <div className="eyebrow mb-3">Últimas cajas cerradas</div>
        <Card padded={false}>
          <table className="tbl">
            <thead><tr><th>Fecha</th><th>Operaciones</th><th>Ingresos</th><th>Egresos</th><th>Neto</th><th>Arqueo</th></tr></thead>
            <tbody>
              {Dc.CajaHoy.historial.map((h, i) => (
                <tr key={i}>
                  <td className="font-mono text-[12.5px]">{Dc.fmtDate(h.fecha)}</td>
                  <td className="font-mono">{h.mov_count}</td>
                  <td className="font-mono tabular text-emerald-700">+{Dc.fmtMoney(h.ingresos)}</td>
                  <td className="font-mono tabular text-red-700">−{Dc.fmtMoney(h.egresos)}</td>
                  <td className="font-mono tabular font-semibold">{Dc.fmtMoney(h.neto)}</td>
                  <td>
                    {h.arqueo_diferencia === 0
                      ? <Badge kind="ok" dot>OK</Badge>
                      : <Badge kind="warn" dot>{h.arqueo_diferencia > 0 ? '+' : ''}{Dc.fmtMoney(h.arqueo_diferencia)}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Modals */}
      {egresoOpen && <EgresoModal onClose={() => setEgresoOpen(false)} onSubmit={registrarEgreso}/>}
      {cierreOpen && <CierreModal efectivoEsperado={efectivoEnCaja} onClose={() => setCierreOpen(false)} onSubmit={cerrarCaja}/>}
      {aperturaOpen && <AperturaModal onClose={() => setAperturaOpen(false)} onSubmit={() => { setEstado('abierta'); setMovs([{ id: Date.now(), hora: '09:00', tipo: 'apertura', monto: 30000, metodo: 'Efectivo', descripcion: 'Apertura de caja', responsable: 'Valeria Donati' }]); toast.push('Caja abierta', 'ok'); setAperturaOpen(false); }}/>}
    </div>
  );
}

function EgresoModal({ onClose, onSubmit }) {
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('Efectivo');
  const [descripcion, setDescripcion] = useState('');
  return (
    <Modal open={true} onClose={onClose} title="Registrar egreso" subtitle="Salida de caja: compras, devoluciones, etc."
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" disabled={!monto || !descripcion} onClick={() => onSubmit({ monto: +monto, metodo, descripcion })}>
          Registrar
        </button>
      </>}>
      <div className="space-y-4">
        <Field label="Concepto" required>
          <input className="input" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: Reposición artículos limpieza"/>
        </Field>
        <Field label="Monto" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute font-mono text-[13px]">$</span>
            <input className="input pl-7 font-mono" type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0"/>
          </div>
        </Field>
        <Field label="Método" required>
          <div className="flex gap-1 flex-wrap">
            {Dc.METODOS_PAGO.map(m => (
              <button key={m} onClick={() => setMetodo(m)} className={`tag ${metodo === m ? 'active' : ''}`}>{m}</button>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

function CierreModal({ efectivoEsperado, onClose, onSubmit }) {
  const [contado, setContado] = useState('');
  const diff = contado === '' ? null : (+contado - efectivoEsperado);
  return (
    <Modal open={true} onClose={onClose} title="Cerrar caja" subtitle="Hacé el arqueo final contando el efectivo físico."
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" disabled={contado === ''} onClick={() => onSubmit(+contado)}>
          Cerrar caja
        </button>
      </>}>
      <div className="space-y-4">
        <div className="card p-4 bg-bg-soft">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] text-ink-soft">Efectivo esperado en caja</span>
            <span className="font-display font-bold text-[26px] tabular">{Dc.fmtMoney(efectivoEsperado)}</span>
          </div>
        </div>
        <Field label="Efectivo contado físicamente" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute font-mono text-[13px]">$</span>
            <input className="input pl-7 font-mono text-[16px]" type="number" value={contado} onChange={e => setContado(e.target.value)} placeholder="0" autoFocus/>
          </div>
        </Field>
        {diff !== null && diff !== 0 && (
          <div className={`border-l-2 px-3 py-2 text-[12.5px] ${diff > 0 ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-red-500 bg-red-50 text-red-900'}`}>
            <b>Diferencia: {diff > 0 ? '+' : ''}{Dc.fmtMoney(diff)}</b> · {diff > 0 ? 'Hay efectivo de más' : 'Falta efectivo'}. El cierre quedará registrado con esta diferencia.
          </div>
        )}
        {diff === 0 && (
          <div className="border-l-2 px-3 py-2 text-[12.5px] border-emerald-500 bg-emerald-50 text-emerald-900">
            <b>Arqueo OK</b> · El cierre cuadra perfecto.
          </div>
        )}
      </div>
    </Modal>
  );
}

function AperturaModal({ onClose, onSubmit }) {
  return (
    <Modal open={true} onClose={onClose} title="Abrir caja" subtitle="Cargá el efectivo inicial que vas a tener en caja al empezar el día."
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={onSubmit}>Abrir caja</button>
      </>}>
      <Field label="Efectivo inicial" required>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute font-mono text-[13px]">$</span>
          <input className="input pl-7 font-mono text-[16px]" type="number" defaultValue={30000}/>
        </div>
      </Field>
    </Modal>
  );
}

window.CajaPage = { CajaDiaria };
Object.assign(window, window.CajaPage);
