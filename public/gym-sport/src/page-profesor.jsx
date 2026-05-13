// Profesor pages: Mis Clases (week grid), Asistencia
const Dp = window.GymData;

function ProfClases({ globalState, user }) {
  const [newOpen, setNewOpen] = useState(false);
  const [editClase, setEditClase] = useState(null);
  const toast = useToast();
  if (globalState === 'loading') return <LoadingState/>;
  if (globalState === 'error') return <ErrorState/>;

  const profId = user.id;
  const profe = { nombre: user.nombre };
  const misClases = Dp.Clases.filter(c => c.profesor_id === profId);

  // Build time slots
  const allHours = [...new Set(misClases.map(c => c.hora_ini))].sort();
  const hours = allHours.length ? allHours : ['07:00','09:00','18:00','19:00'];

  return (
    <div>
      <PageHeader
        eyebrow={`Profesor · ${profe.nombre}`}
        title="Mis Clases"
        subtitle="Calendario semanal con las clases que tenés asignadas."
        actions={<>
          <button className="btn"><Icon.Filter size={14}/> Esta semana</button>
          <button className="btn btn-primary" onClick={() => setNewOpen(true)}><Icon.Plus size={14}/> Nueva clase</button>
        </>}
      />

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Clases semanales" value={misClases.length} sub="Próxima: hoy 19:00"/>
        <KpiCard label="Alumnos totales" value={misClases.reduce((s,c)=>s+c.cupos_ocup,0)} sub="Inscriptos activos"/>
        <KpiCard label="Ocupación promedio" value={Math.round(100 * misClases.reduce((s,c)=>s+c.cupos_ocup/c.cupos_max,0) / Math.max(1,misClases.length)) + '%'} />
        <KpiCard label="Asistencia mes" value="92%" sub="Promedio histórico" trend="up"/>
      </div>

      {/* Week grid */}
      <Card padded={false}>
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <div>
            <div className="font-display font-bold text-[18px]">Semana del {Dp.fmtDateShort(Dp.addDays(new Date(), -2))} – {Dp.fmtDateShort(Dp.addDays(new Date(), 4))}</div>
            <div className="text-[11.5px] text-ink-mute font-mono">7 días · {misClases.length} clases</div>
          </div>
          <div className="flex gap-1">
            <button className="btn-icon btn btn-sm"><Icon.ChevronLeft size={14}/></button>
            <button className="btn btn-sm">Hoy</button>
            <button className="btn-icon btn btn-sm"><Icon.ChevronRight size={14}/></button>
          </div>
        </div>

        <div className="overflow-x-auto">
        <div className="week-grid">
          {/* Header row */}
          <div className="week-cell" style={{ minHeight: 36, borderBottom: '1px solid var(--line)' }}></div>
          {Dp.DOW.map((d, i) => (
            <div key={d} className="week-cell px-3 py-2" style={{ minHeight: 36 }}>
              <div className="text-[10.5px] uppercase tracking-wider text-ink-mute font-semibold">{d}</div>
              <div className="font-mono text-[12px]">{Dp.fmtDateShort(Dp.addDays(new Date(), i - new Date().getDay() + 1))}</div>
            </div>
          ))}
          {/* time rows */}
          {hours.map((hr) => (
            <React.Fragment key={hr}>
              <div className="week-cell flex items-start justify-end pr-2 pt-2">
                <span className="text-[11px] font-mono text-ink-mute">{hr}</span>
              </div>
              {Dp.DOW.map((_, di) => {
                const clase = misClases.find(c => c.dia === di && c.hora_ini === hr);
                if (!clase) return <div key={di} className="week-cell"/>;
                const disc = Dp.Disciplinas.find(d => d.id === clase.disciplina_id);
                const ocup = clase.cupos_ocup / clase.cupos_max;
                return (
                  <div key={di} className="week-cell p-1.5 cursor-pointer hover:bg-bg-soft" onClick={() => setEditClase(clase)}>
                    <div className="h-full p-2 border-l-2" style={{ background: 'var(--surface)', borderLeftColor: disc.color }}>
                      <div className="text-[11.5px] font-display font-bold leading-tight">{disc.nombre}</div>
                      <div className="text-[10.5px] text-ink-soft font-mono mt-0.5">{clase.hora_ini}–{clase.hora_fin}</div>
                      <div className="text-[10.5px] text-ink-mute mt-1">{clase.espacio}</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className={`prog flex-1 ${ocup > 0.9 ? 'bad' : ocup > 0.7 ? 'warn' : ''}`} style={{ height: 3 }}>
                          <i style={{ width: (ocup*100)+'%' }}/>
                        </div>
                        <span className="text-[10px] font-mono text-ink-soft">{clase.cupos_ocup}/{clase.cupos_max}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        </div>{/* overflow-x-auto */}
      </Card>

      {/* Cards list */}
      <div className="eyebrow mt-8 mb-3">Detalle de clases</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {misClases.map(c => {
          const disc = Dp.Disciplinas.find(d => d.id === c.disciplina_id);
          const ocup = c.cupos_ocup / c.cupos_max;
          return (
            <div key={c.id} className="card p-5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: disc.color }}/>
              <div className="flex items-start justify-between">
                <div>
                  <div className="eyebrow" style={{ color: disc.color }}>{disc.nombre}</div>
                  <div className="font-display font-bold text-[20px] mt-1">{Dp.DOW_FULL[c.dia]}</div>
                  <div className="font-mono text-[13px] text-ink-soft mt-0.5">{c.hora_ini}–{c.hora_fin} · {c.espacio}</div>
                </div>
                <button className="btn-ghost btn btn-icon" onClick={() => setEditClase(c)}><Icon.Edit size={14}/></button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Donut value={ocup*100} size={64} strokeWidth={8} label={`${c.cupos_ocup}`}/>
                <div className="text-[12px] text-ink-soft">
                  <div><span className="font-mono">{c.cupos_ocup}/{c.cupos_max}</span> cupos ocupados</div>
                  <div className="text-ink-mute mt-1">{Math.round(ocup*100)}% de ocupación</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ClaseFormModal open={newOpen} onClose={() => setNewOpen(false)} onSubmit={() => { setNewOpen(false); toast.push('Clase creada', 'ok'); }}/>
      {editClase && <ClaseFormModal open={true} editing={editClase} onClose={() => setEditClase(null)} onSubmit={() => { setEditClase(null); toast.push('Clase actualizada', 'ok'); }}/>}
    </div>
  );
}

function ClaseFormModal({ open, editing, onClose, onSubmit }) {
  const initEsp = editing ? Dp.Espacios.find(e => e.nombre === editing.espacio)?.id || Dp.Espacios[0].id : Dp.Espacios[0].id;
  const [espId, setEspId] = useState(initEsp);
  const [cupos, setCupos] = useState(editing?.cupos_max || Dp.Espacios[0].capacidad);
  if (!open) return null;
  const esp = Dp.Espacios.find(e => e.id === +espId);
  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar clase' : 'Nueva clase'} subtitle="Configurá los detalles de la clase."
      footer={<>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={onSubmit}>{editing ? 'Guardar cambios' : 'Crear clase'}</button>
      </>}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Disciplina" required>
          <select className="input" defaultValue={editing?.disciplina_id || 1}>
            {Dp.Disciplinas.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
        </Field>
        <Field label="Espacio" required hint={`Capacidad de la sala: ${esp.capacidad} personas`}>
          <select className="input" value={espId} onChange={e => { const id = +e.target.value; setEspId(id); const ne = Dp.Espacios.find(x => x.id === id); if (cupos > ne.capacidad) setCupos(ne.capacidad); }}>
            {Dp.Espacios.map(e => <option key={e.id} value={e.id}>{e.nombre} · cap. {e.capacidad}</option>)}
          </select>
        </Field>
        <Field label="Día" required>
          <select className="input" defaultValue={editing?.dia || 0}>
            {Dp.DOW_FULL.map((d,i) => <option key={i} value={i}>{d}</option>)}
          </select>
        </Field>
        <Field label="Cupos máximos" required hint={cupos === esp.capacidad ? `Tope: capacidad de la sala` : `Máx. ${esp.capacidad} (capacidad de ${esp.nombre})`}>
          <input className="input" type="number" min={1} max={esp.capacidad} value={cupos} onChange={e => setCupos(Math.min(esp.capacidad, +e.target.value || 0))}/>
        </Field>
        <Field label="Hora inicio" required>
          <input className="input" type="time" defaultValue={editing?.hora_ini || '18:00'}/>
        </Field>
        <Field label="Hora fin" required>
          <input className="input" type="time" defaultValue={editing?.hora_fin || '19:00'}/>
        </Field>
      </div>
      {editing && (
        <div className="mt-4 border border-line p-3 bg-bg-soft flex items-center justify-between">
          <div className="text-[12.5px] text-ink-soft">Esta clase tiene <b>{editing.cupos_ocup} alumnos inscriptos</b></div>
          <button className="btn btn-sm">Ver lista</button>
        </div>
      )}
    </Modal>
  );
}

// ---------- Profesor Asistencia ----------
function ProfAsistencia({ globalState, user }) {
  const profId = user.id;
  const profe = { nombre: user.nombre };
  const sus = Dp.Clases.filter(c => c.profesor_id === profId);
  const [claseId, setClaseId] = useState(sus[0]?.id || Dp.Clases[0].id);
  const [presentes, setPresentes] = useState({});
  const toast = useToast();
  if (globalState === 'loading') return <LoadingState/>;
  if (globalState === 'error') return <ErrorState/>;

  const clase = Dp.Clases.find(c => c.id === +claseId);
  const disc = Dp.Disciplinas.find(d => d.id === clase.disciplina_id);
  const inscriptos = Dp.Alumnos.filter(a => a.clases_inscripto.includes(clase.id));
  const recupAprob = Dp.Recuperos
    .filter(r => r.estado === 'aprobada' && r.clase_destino === clase.id)
    .map(r => Dp.Alumnos.find(a => a.id === r.alumno_id))
    .filter(Boolean);
  const lista = [...inscriptos.map(a => ({...a, kind:'inscripto'})), ...recupAprob.map(a => ({...a, kind:'recupero'}))];

  const presCount = lista.filter(a => presentes[a.id]).length;

  return (
    <div>
      <PageHeader eyebrow={`Profesor · ${profe.nombre}`} title="Asistencia"
        subtitle="Solo se muestran tus clases."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Card className="lg:col-span-2 p-0">
          <div className="p-4 border-b border-line">
            <div className="eyebrow mb-3">Mis clases</div>
            <div className="flex gap-2 flex-wrap">
              {sus.map(c => {
                const d = Dp.Disciplinas.find(x => x.id === c.disciplina_id);
                const active = c.id === claseId;
                return (
                  <button key={c.id} onClick={() => { setClaseId(c.id); setPresentes({}); }}
                    className={`px-3 py-2 border text-left ${active ? 'border-ink bg-bg-soft' : 'border-line'}`}>
                    <div className="text-[10.5px] uppercase tracking-wider font-semibold" style={{ color: d.color }}>{d.nombre}</div>
                    <div className="text-[11.5px] font-mono text-ink-soft">{Dp.DOW[c.dia]} {c.hora_ini}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-2 h-12" style={{ background: disc.color }}/>
            <div className="flex-1">
              <div className="text-[10.5px] uppercase tracking-wider text-ink-mute">Hoy</div>
              <div className="font-display font-bold text-[20px]">{disc.nombre}</div>
              <div className="text-[11.5px] text-ink-soft font-mono">{Dp.DOW_FULL[clase.dia]} · {clase.hora_ini}</div>
            </div>
            <div className="text-right">
              <div className="font-display font-bold text-[32px] tabular leading-none">{presCount}<span className="text-ink-mute">/{lista.length}</span></div>
              <div className="text-[10.5px] uppercase tracking-wider text-ink-mute mt-1">presentes</div>
            </div>
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-line flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="eyebrow">Lista del día</div>
            <Badge kind="neutral">{inscriptos.length} inscriptos</Badge>
            {recupAprob.length > 0 && <Badge kind="info" dot>+ {recupAprob.length} recuperos</Badge>}
          </div>
          <div className="flex gap-1">
            <button className="btn btn-sm" onClick={() => setPresentes(lista.reduce((acc,a) => ({...acc, [a.id]: true}), {}))}>Marcar todos</button>
            <button className="btn btn-sm" onClick={() => setPresentes({})}>Limpiar</button>
          </div>
        </div>
        {lista.length === 0 ? (
          <div className="p-2"><EmptyState icon={Icon.Users} title="Esta clase no tiene alumnos" message="Cuando se inscriban alumnos aparecerán acá."/></div>
        ) : (
        <table className="tbl">
          <tbody>
            {lista.map(a => (
              <tr key={a.id + '-' + a.kind}>
                <td style={{ width: 60 }}>
                  <div className={`chk ${presentes[a.id] ? 'checked' : ''}`} onClick={() => setPresentes(c => ({...c, [a.id]: !c[a.id]}))}>
                    {presentes[a.id] && <Icon.Check size={12}/>}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={a.nombre} size={28}/>
                    <span className="font-semibold">{a.nombre}</span>
                  </div>
                </td>
                <td>
                  {a.kind === 'recupero' ? <Badge kind="info" dot>Recupero</Badge> : <Badge kind="neutral">Inscripto</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </Card>

      <div className="mt-5 flex justify-end gap-2">
        <button className="btn">Descartar</button>
        <button className="btn btn-primary" onClick={() => toast.push(`Asistencia guardada · ${presCount}/${lista.length}`, 'ok')}>
          <Icon.Check size={14}/> Guardar asistencia
        </button>
      </div>
    </div>
  );
}

window.ProfPages = { ProfClases, ProfAsistencia };
Object.assign(window, window.ProfPages);
