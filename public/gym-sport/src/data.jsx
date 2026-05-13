// Mock data layer — gym management. All strings in Spanish.
// Names original; no real-world brand references.

const today = new Date();
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtDate = (d) => new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtDateShort = (d) => new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
const fmtMoney = (n) => '$' + Math.round(n).toLocaleString('es-AR');
const diffDays = (a, b = new Date()) => Math.round((new Date(a) - new Date(b)) / 86400000);
const DOW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DOW_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const Disciplinas = [
  { id: 1, nombre: 'CrossTraining',  color: '#dc2626', alumnos: 86, clases: 8 },
  { id: 2, nombre: 'Boxeo',          color: '#0e0e0c', alumnos: 54, clases: 6 },
  { id: 3, nombre: 'Yoga',           color: '#15803d', alumnos: 47, clases: 5 },
  { id: 4, nombre: 'Spinning',       color: '#1d4ed8', alumnos: 38, clases: 4 },
  { id: 5, nombre: 'Pilates',        color: '#a16207', alumnos: 31, clases: 4 },
  { id: 6, nombre: 'Funcional',      color: '#7c3aed', alumnos: 42, clases: 5 },
];

const Espacios = [
  { id: 1, nombre: 'Sala A',        capacidad: 22, descripcion: 'Sala principal — piso de goma, bastidor' },
  { id: 2, nombre: 'Sala B',        capacidad: 18, descripcion: 'Sala secundaria — multifuncional' },
  { id: 3, nombre: 'Ring 01',       capacidad: 14, descripcion: 'Ring de boxeo profesional 6×6m' },
  { id: 4, nombre: 'Sala Espejos',  capacidad: 16, descripcion: 'Sala con pared espejada y barra' },
  { id: 5, nombre: 'Sala Cardio',   capacidad: 24, descripcion: 'Bicicletas fijas, cintas, elípticos' },
  { id: 6, nombre: 'Sala Mat',      capacidad: 16, descripcion: 'Mat, bloques y accesorios para yoga/pilates' },
];

const Profesores = [
  { id: 1, nombre: 'Mariana Ledesma',  disciplinas: [1, 6], iniciales: 'ML' },
  { id: 2, nombre: 'Tomás Quintana',   disciplinas: [2],    iniciales: 'TQ' },
  { id: 3, nombre: 'Sofía Pacheco',    disciplinas: [3, 5], iniciales: 'SP' },
  { id: 4, nombre: 'Bruno Albanesi',   disciplinas: [4, 6], iniciales: 'BA' },
  { id: 5, nombre: 'Lucila Mendoza',   disciplinas: [3, 5], iniciales: 'LM' },
];

const Planes = [
  { id: 1, nombre: '1× semana',  precio: 12500, clases_semana: 1 },
  { id: 2, nombre: '2× semana',  precio: 18900, clases_semana: 2 },
  { id: 3, nombre: '3× semana',  precio: 24500, clases_semana: 3 },
  { id: 4, nombre: 'Libre',      precio: 32900, clases_semana: 7 },
];

// Class schedule (anchored to dia_semana 0=Mon..6=Sun)
const Clases = [
  { id: 101, disciplina_id: 1, profesor_id: 1, espacio: 'Sala A',       dia: 0, hora_ini: '07:00', hora_fin: '08:00', cupos_max: 18, cupos_ocup: 16 },
  { id: 102, disciplina_id: 1, profesor_id: 1, espacio: 'Sala A',       dia: 0, hora_ini: '18:30', hora_fin: '19:30', cupos_max: 18, cupos_ocup: 18 },
  { id: 103, disciplina_id: 2, profesor_id: 2, espacio: 'Ring 01',      dia: 0, hora_ini: '19:00', hora_fin: '20:00', cupos_max: 14, cupos_ocup: 9 },
  { id: 104, disciplina_id: 3, profesor_id: 3, espacio: 'Sala Mat',     dia: 0, hora_ini: '09:30', hora_fin: '10:30', cupos_max: 16, cupos_ocup: 11 },
  { id: 105, disciplina_id: 4, profesor_id: 4, espacio: 'Sala Cardio',  dia: 1, hora_ini: '07:00', hora_fin: '07:45', cupos_max: 20, cupos_ocup: 17 },
  { id: 106, disciplina_id: 1, profesor_id: 1, espacio: 'Sala A',       dia: 1, hora_ini: '19:00', hora_fin: '20:00', cupos_max: 18, cupos_ocup: 15 },
  { id: 107, disciplina_id: 5, profesor_id: 5, espacio: 'Sala Espejos', dia: 1, hora_ini: '10:00', hora_fin: '11:00', cupos_max: 14, cupos_ocup: 8 },
  { id: 108, disciplina_id: 6, profesor_id: 4, espacio: 'Sala B',       dia: 1, hora_ini: '18:00', hora_fin: '19:00', cupos_max: 16, cupos_ocup: 16 },
  { id: 109, disciplina_id: 1, profesor_id: 1, espacio: 'Sala A',       dia: 2, hora_ini: '07:00', hora_fin: '08:00', cupos_max: 18, cupos_ocup: 14 },
  { id: 110, disciplina_id: 3, profesor_id: 3, espacio: 'Sala Mat',     dia: 2, hora_ini: '18:00', hora_fin: '19:00', cupos_max: 16, cupos_ocup: 12 },
  { id: 111, disciplina_id: 2, profesor_id: 2, espacio: 'Ring 01',      dia: 2, hora_ini: '20:00', hora_fin: '21:00', cupos_max: 14, cupos_ocup: 13 },
  { id: 112, disciplina_id: 6, profesor_id: 1, espacio: 'Sala B',       dia: 3, hora_ini: '08:00', hora_fin: '09:00', cupos_max: 16, cupos_ocup: 10 },
  { id: 113, disciplina_id: 4, profesor_id: 4, espacio: 'Sala Cardio',  dia: 3, hora_ini: '19:00', hora_fin: '19:45', cupos_max: 20, cupos_ocup: 19 },
  { id: 114, disciplina_id: 1, profesor_id: 1, espacio: 'Sala A',       dia: 3, hora_ini: '18:30', hora_fin: '19:30', cupos_max: 18, cupos_ocup: 17 },
  { id: 115, disciplina_id: 5, profesor_id: 5, espacio: 'Sala Espejos', dia: 4, hora_ini: '10:00', hora_fin: '11:00', cupos_max: 14, cupos_ocup: 9 },
  { id: 116, disciplina_id: 3, profesor_id: 3, espacio: 'Sala Mat',     dia: 4, hora_ini: '18:30', hora_fin: '19:30', cupos_max: 16, cupos_ocup: 14 },
  { id: 117, disciplina_id: 1, profesor_id: 1, espacio: 'Sala A',       dia: 4, hora_ini: '07:00', hora_fin: '08:00', cupos_max: 18, cupos_ocup: 16 },
  { id: 118, disciplina_id: 2, profesor_id: 2, espacio: 'Ring 01',      dia: 5, hora_ini: '11:00', hora_fin: '12:00', cupos_max: 14, cupos_ocup: 12 },
  { id: 119, disciplina_id: 1, profesor_id: 1, espacio: 'Sala A',       dia: 5, hora_ini: '09:00', hora_fin: '10:00', cupos_max: 18, cupos_ocup: 18 },
  { id: 120, disciplina_id: 6, profesor_id: 4, espacio: 'Sala B',       dia: 5, hora_ini: '10:30', hora_fin: '11:30', cupos_max: 16, cupos_ocup: 11 },
];

const ALUMNO_NAMES = [
  'Camila Ortega', 'Joaquín Saavedra', 'Renata Vilches', 'Mateo Bonafede',
  'Antonella Riquelme', 'Ezequiel Marchetti', 'Pilar Echeverría', 'Bautista Galván',
  'Delfina Carrasco', 'Lautaro Solano', 'Trinidad Bouzas', 'Ignacio Quesada',
  'Lara Buschiazzo', 'Felipe Aramburu', 'Catalina Pizarro', 'Nicolás Tagliani',
  'Mora Vergara', 'Santino Casullo', 'Olivia Fioravanti', 'Diego Berardo',
  'Agostina Pérez', 'Tobías Lemos', 'Victoria Sánchez', 'Lucas Iglesias',
  'Brenda Cardozo', 'Maximiliano Funes', 'Sol Bianchi', 'Ramiro Ledesma',
  'Florencia Maidana', 'Gonzalo Aristegui',
];

// 30 alumnos
const Alumnos = ALUMNO_NAMES.map((nombre, i) => {
  const claseCount = 1 + (i % 4);
  const claseIds = [];
  while (claseIds.length < claseCount) {
    const cid = Clases[(i * 3 + claseIds.length * 7) % Clases.length].id;
    if (!claseIds.includes(cid)) claseIds.push(cid);
  }
  const planId = ((i % 4) + 1);
  // estado pago: 60% pagado, 20% vence pronto, 15% vencido, 5% pendiente
  const r = (i * 137) % 100;
  let estado, vencDelta;
  if (r < 60) { estado = 'pagado'; vencDelta = 15 + (r % 14); }
  else if (r < 80) { estado = 'pagado'; vencDelta = 1 + (r % 6); }     // vence pronto
  else if (r < 95) { estado = 'vencido'; vencDelta = -(2 + (r % 10)); }
  else { estado = 'pendiente'; vencDelta = -(1 + (r % 3)); }
  return {
    id: 1000 + i,
    nombre,
    email: nombre.toLowerCase().replace(/\s+/g, '.').replace(/[áéíóú]/g, m => ({á:'a',é:'e',í:'i',ó:'o',ú:'u'})[m]) + '@mail.com',
    telefono: '+54 11 ' + (4000 + i * 13).toString().slice(0, 4) + '-' + (1000 + i * 17).toString().slice(0, 4),
    iniciales: nombre.split(' ').map(s => s[0]).join('').slice(0, 2),
    plan_id: planId,
    estado_pago: estado,
    fecha_vencimiento: addDays(today, vencDelta).toISOString(),
    clases_inscripto: claseIds,
    desde: addDays(today, -200 - i * 11).toISOString(),
  };
});

// Sync cupos_ocup con cantidad real de inscriptos
Clases.forEach(c => {
  c.cupos_ocup = Alumnos.filter(a => a.clases_inscripto.includes(c.id)).length;
});

// Pagos histórico
const Pagos = [];
let pagoId = 5000;
Alumnos.forEach((a) => {
  const months = 3 + (a.id % 4);
  for (let m = months; m >= 1; m--) {
    const fechaIni = addDays(today, -30 * m);
    const fechaVenc = addDays(fechaIni, 30);
    const fechaPago = m === 1 && a.estado_pago !== 'pagado' ? null : addDays(fechaIni, (a.id % 5)).toISOString();
    const estado = (m > 1) ? 'pagado'
                : (a.estado_pago === 'vencido' ? 'vencido'
                : a.estado_pago === 'pendiente' ? 'pendiente'
                : 'pagado');
    Pagos.push({
      id: pagoId++,
      alumno_id: a.id,
      plan_id: a.plan_id,
      monto: Planes[a.plan_id - 1].precio,
      fecha_inicio: fechaIni.toISOString(),
      fecha_vencimiento: fechaVenc.toISOString(),
      fecha_pago: fechaPago,
      estado,
    });
  }
});

// Recuperos
const Recuperos = [
  { id: 9001, alumno_id: 1003, clase_origen: 109, clase_destino: 117, fecha_origen: addDays(today, -3).toISOString(), fecha_destino: addDays(today, 2).toISOString(), estado: 'pendiente', solicitado: addDays(today, -1).toISOString() },
  { id: 9002, alumno_id: 1007, clase_origen: 105, clase_destino: 113, fecha_origen: addDays(today, -2).toISOString(), fecha_destino: addDays(today, 1).toISOString(), estado: 'pendiente', solicitado: addDays(today, -1).toISOString() },
  { id: 9003, alumno_id: 1012, clase_origen: 104, clase_destino: 110, fecha_origen: addDays(today, -5).toISOString(), fecha_destino: addDays(today, 2).toISOString(), estado: 'pendiente', solicitado: addDays(today, -2).toISOString() },
  { id: 9004, alumno_id: 1018, clase_origen: 102, clase_destino: 106, fecha_origen: addDays(today, -6).toISOString(), fecha_destino: addDays(today, 1).toISOString(), estado: 'pendiente', solicitado: addDays(today, -3).toISOString() },
  { id: 9005, alumno_id: 1021, clase_origen: 108, clase_destino: 112, fecha_origen: addDays(today, -7).toISOString(), fecha_destino: addDays(today, 0).toISOString(), estado: 'pendiente', solicitado: addDays(today, -2).toISOString() },
  { id: 9006, alumno_id: 1005, clase_origen: 105, clase_destino: 113, fecha_origen: addDays(today, -10).toISOString(), fecha_destino: addDays(today, -3).toISOString(), estado: 'aprobada', solicitado: addDays(today, -12).toISOString() },
  { id: 9007, alumno_id: 1009, clase_origen: 103, clase_destino: 111, fecha_origen: addDays(today, -14).toISOString(), fecha_destino: addDays(today, -7).toISOString(), estado: 'aprobada', solicitado: addDays(today, -15).toISOString() },
  { id: 9008, alumno_id: 1015, clase_origen: 116, clase_destino: 110, fecha_origen: addDays(today, -20).toISOString(), fecha_destino: addDays(today, -13).toISOString(), estado: 'rechazada', solicitado: addDays(today, -22).toISOString() },
];

// Users (login)
const Users = [
  { id: 1, nombre: 'Federica Salerno', email: 'dueno@ironatlas.com',      password: '123456', rol: 'dueno' },
  { id: 2, nombre: 'Valeria Donati',   email: 'secretaria@ironatlas.com', password: '123456', rol: 'secretario' },
  { id: 3, nombre: 'Mariana Ledesma',  email: 'mariana@ironatlas.com',    password: '123456', rol: 'profesor', profesor_id: 1 },
  { id: 4, nombre: 'Camila Ortega',    email: 'camila@ironatlas.com',     password: '123456', rol: 'alumno', alumno_id: 1000 },
];

// Listas de espera: alumnos esperando un cupo en una clase llena
const ListasEspera = [
  { id: 7001, alumno_id: 1004, clase_id: 102, posicion: 1, solicitado: addDays(today, -2).toISOString() },
  { id: 7002, alumno_id: 1011, clase_id: 102, posicion: 2, solicitado: addDays(today, -1).toISOString() },
  { id: 7003, alumno_id: 1019, clase_id: 119, posicion: 1, solicitado: addDays(today, -3).toISOString() },
];

// Suspensiones de cuota (vacaciones, lesión, etc.)
const Suspensiones = [
  { id: 8001, alumno_id: 1006, desde: addDays(today, -10).toISOString(), hasta: addDays(today, -3).toISOString(), motivo: 'Vacaciones', estado: 'finalizada' },
  { id: 8002, alumno_id: 1014, desde: addDays(today, -2).toISOString(),  hasta: addDays(today, 12).toISOString(), motivo: 'Viaje familiar', estado: 'activa' },
  { id: 8003, alumno_id: 1022, desde: addDays(today, -45).toISOString(), hasta: addDays(today, -15).toISOString(), motivo: 'Lesión rodilla', estado: 'finalizada' },
];

// Métodos de pago para caja
const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta', 'MercadoPago'];

const _movsHoy = [];
let _movId = 6000;
_movsHoy.push({ id: _movId++, hora: '08:30', tipo: 'apertura', monto: 25000, metodo: 'Efectivo', descripcion: 'Apertura de caja', responsable: 'Valeria Donati' });
const _horas = ['09:14', '10:42', '11:08', '12:33', '14:21', '15:48', '17:55', '18:40', '19:12'];
Pagos.filter(p => p.estado === 'pagado').slice(0, 7).forEach((p, i) => {
  const a = Alumnos.find(x => x.id === p.alumno_id);
  _movsHoy.push({
    id: _movId++, hora: _horas[i] || '15:00',
    tipo: 'ingreso', monto: p.monto,
    metodo: METODOS_PAGO[i % METODOS_PAGO.length],
    descripcion: `Cuota mensual · ${a.nombre}`,
    responsable: 'Valeria Donati',
    alumno_id: p.alumno_id,
  });
});
_movsHoy.push({ id: _movId++, hora: '10:15', tipo: 'egreso', monto: 3200, metodo: 'Efectivo', descripcion: 'Agua y café para la sala', responsable: 'Valeria Donati' });
_movsHoy.push({ id: _movId++, hora: '16:40', tipo: 'egreso', monto: 8500, metodo: 'Efectivo', descripcion: 'Reposición de elementos de limpieza', responsable: 'Valeria Donati' });

const CajaHoy = {
  fecha: today.toISOString(),
  estado: 'abierta',
  apertura: 25000,
  responsable: 'Valeria Donati',
  movimientos: _movsHoy.sort((a, b) => a.hora.localeCompare(b.hora)),
  historial: Array.from({ length: 6 }, (_, i) => {
    const d = addDays(today, -(i + 1));
    const ingresos = 80000 + ((i * 113) % 90) * 1500;
    const egresos = 3000 + ((i * 41) % 50) * 200;
    return {
      fecha: d.toISOString(),
      ingresos, egresos,
      neto: ingresos - egresos,
      mov_count: 6 + (i % 5),
      arqueo_diferencia: i === 2 ? -250 : 0,
    };
  }),
};

// Dashboard summary
const dashboardSummary = () => {
  const activos = Alumnos.length;
  const vencidos = Alumnos.filter(a => a.estado_pago === 'vencido').length;
  const venceProximo = Alumnos.filter(a => a.estado_pago === 'pagado' && diffDays(a.fecha_vencimiento) <= 7 && diffDays(a.fecha_vencimiento) >= 0).length;
  const mesActual = Pagos.filter(p => p.estado === 'pagado' && diffDays(p.fecha_pago, addDays(today, -30)) >= 0).reduce((s, p) => s + p.monto, 0);
  const mesAnterior = Pagos.filter(p => p.estado === 'pagado' && diffDays(p.fecha_pago, addDays(today, -60)) >= 0 && diffDays(p.fecha_pago, addDays(today, -30)) < 0).reduce((s, p) => s + p.monto, 0);
  const clasesActivas = Clases.length;
  const ocupacion = Math.round(100 * Clases.reduce((s, c) => s + c.cupos_ocup / c.cupos_max, 0) / Clases.length);
  const recuperosPend = Recuperos.filter(r => r.estado === 'pendiente').length;
  return { activos, vencidos, venceProximo, mesActual, mesAnterior, clasesActivas, ocupacion, recuperosPend };
};

// Daily revenue series for last 14 days
const revenueSeries = () => {
  const out = [];
  for (let i = 13; i >= 0; i--) {
    const d = addDays(today, -i);
    const v = Pagos.filter(p => p.fecha_pago && new Date(p.fecha_pago).toDateString() === d.toDateString())
                   .reduce((s, p) => s + p.monto, 0);
    out.push({ date: d, value: v });
  }
  // Sprinkle some data so chart isn't empty
  return out.map((p, i) => ({ ...p, value: p.value || (45000 + ((i * 73) % 60) * 1200) }));
};

// Attendance demo: pre-existing records for today
const Asistencia = {
  // keyed by `claseId-yyyymmdd`
};

window.GymData = {
  today, addDays, fmtDate, fmtDateShort, fmtMoney, diffDays, DOW, DOW_FULL,
  Disciplinas, Espacios, Profesores, Planes, Clases, Alumnos, Pagos, Recuperos, Users,
  ListasEspera, Suspensiones, CajaHoy, METODOS_PAGO,
  Asistencia, dashboardSummary, revenueSeries,
};
