'use strict';

const bcrypt = require('bcrypt');

// Helper: date string offset from today
const d = (offsetDays) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + offsetDays);
  return dt.toISOString().slice(0, 10);
};

const ALUMNO_NAMES = [
  ['Joaquín',    'Saavedra',   'joaquin.saavedra@mail.com'],
  ['Renata',     'Vilches',    'renata.vilches@mail.com'],
  ['Mateo',      'Bonafede',   'mateo.bonafede@mail.com'],
  ['Antonella',  'Riquelme',   'antonella.riquelme@mail.com'],
  ['Ezequiel',   'Marchetti',  'ezequiel.marchetti@mail.com'],
  ['Pilar',      'Echeverría', 'pilar.echeverria@mail.com'],
  ['Bautista',   'Galván',     'bautista.galvan@mail.com'],
  ['Delfina',    'Carrasco',   'delfina.carrasco@mail.com'],
  ['Lautaro',    'Solano',     'lautaro.solano@mail.com'],
  ['Trinidad',   'Bouzas',     'trinidad.bouzas@mail.com'],
  ['Ignacio',    'Quesada',    'ignacio.quesada@mail.com'],
  ['Lara',       'Buschiazzo', 'lara.buschiazzo@mail.com'],
  ['Felipe',     'Aramburu',   'felipe.aramburu@mail.com'],
  ['Catalina',   'Pizarro',    'catalina.pizarro@mail.com'],
  ['Nicolás',    'Tagliani',   'nicolas.tagliani@mail.com'],
  ['Mora',       'Vergara',    'mora.vergara@mail.com'],
  ['Santino',    'Casullo',    'santino.casullo@mail.com'],
  ['Olivia',     'Fioravanti', 'olivia.fioravanti@mail.com'],
  ['Diego',      'Berardo',    'diego.berardo@mail.com'],
  ['Agostina',   'Pérez',      'agostina.perez@mail.com'],
  ['Tobías',     'Lemos',      'tobias.lemos@mail.com'],
  ['Victoria',   'Sánchez',    'victoria.sanchez@mail.com'],
  ['Lucas',      'Iglesias',   'lucas.iglesias@mail.com'],
  ['Brenda',     'Cardozo',    'brenda.cardozo@mail.com'],
  ['Maximiliano','Funes',      'maximiliano.funes@mail.com'],
  ['Sol',        'Bianchi',    'sol.bianchi@mail.com'],
  ['Ramiro',     'Ledesma',    'ramiro.ledesma@mail.com'],
  ['Florencia',  'Maidana',    'florencia.maidana@mail.com'],
  ['Gonzalo',    'Aristegui',  'gonzalo.aristegui@mail.com'],
];

const PROF_EXTRAS = [
  ['Tomás',  'Quintana', 'tomas@ironatlas.com'],
  ['Sofía',  'Pacheco',  'sofia@ironatlas.com'],
  ['Bruno',  'Albanesi', 'bruno@ironatlas.com'],
  ['Lucila', 'Mendoza',  'lucila@ironatlas.com'],
];

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    const alumnoHash = await bcrypt.hash('123456', 10); // lighter hash for bulk
    const q = (sql, opts) => queryInterface.sequelize.query(sql, { type: queryInterface.sequelize.QueryTypes.SELECT, ...opts });

    // ── 1. Extra profesores ────────────────────────────────────────────────
    for (const [nombre, apellido, email] of PROF_EXTRAS) {
      await queryInterface.sequelize.query(
        `INSERT INTO users (nombre, email, password_hash, rol, activo, created_at, updated_at)
         VALUES (:nombre, :email, :hash, 'profesor', true, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING`,
        { replacements: { nombre: `${nombre} ${apellido}`, email, hash: alumnoHash } }
      );
    }

    // ── 2. Alumnos ─────────────────────────────────────────────────────────
    for (const [nombre, apellido, email] of ALUMNO_NAMES) {
      await queryInterface.sequelize.query(
        `INSERT INTO users (nombre, email, password_hash, rol, activo, created_at, updated_at)
         VALUES (:nombre, :email, :hash, 'alumno', true, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING`,
        { replacements: { nombre: `${nombre} ${apellido}`, email, hash: alumnoHash } }
      );
    }

    // ── 3. Resolve user IDs ────────────────────────────────────────────────
    const adminRow     = await q(`SELECT id FROM users WHERE email='admin@gimnasio.com' LIMIT 1`);
    const secretRow    = await q(`SELECT id FROM users WHERE email='secretaria@ironatlas.com' LIMIT 1`);
    const marianaRow   = await q(`SELECT id FROM users WHERE email='mariana@ironatlas.com' LIMIT 1`);
    const tomasRow     = await q(`SELECT id FROM users WHERE email='tomas@ironatlas.com' LIMIT 1`);
    const sofiaRow     = await q(`SELECT id FROM users WHERE email='sofia@ironatlas.com' LIMIT 1`);
    const brunoRow     = await q(`SELECT id FROM users WHERE email='bruno@ironatlas.com' LIMIT 1`);
    const lucilaRow    = await q(`SELECT id FROM users WHERE email='lucila@ironatlas.com' LIMIT 1`);

    const ADMIN_ID   = adminRow[0].id;
    const profIds = {
      mariana: marianaRow[0].id,
      tomas:   tomasRow[0].id,
      sofia:   sofiaRow[0].id,
      bruno:   brunoRow[0].id,
      lucila:  lucilaRow[0].id,
    };

    // Alumno IDs (all 29 + camila from seeder 2)
    const camilaRow = await q(`SELECT id FROM users WHERE email='camila@ironatlas.com' LIMIT 1`);
    const alumnoEmails = ALUMNO_NAMES.map(r => r[2]);
    const alumnoRows   = await q(
      `SELECT id, email FROM users WHERE email IN (${alumnoEmails.map(e => `'${e}'`).join(',')}) ORDER BY id ASC`
    );
    // Full list: camila first, then the rest
    const allAlumnoIds = [camilaRow[0].id, ...alumnoRows.map(r => r.id)];

    // Plan IDs
    const planRows = await q(`SELECT id, nombre, precio_base, duracion_dias FROM payment_plans WHERE activo=true ORDER BY id ASC`);
    const planIds = planRows.map(r => r.id);

    // ── 4. Disciplines ────────────────────────────────────────────────────
    const disciplineData = [
      ['CrossTraining', 'Entrenamiento funcional de alta intensidad'],
      ['Boxeo',         'Técnica y sparring, todos los niveles'],
      ['Yoga',          'Hatha y Vinyasa, equilibrio cuerpo-mente'],
      ['Spinning',      'Ciclismo indoor con música y ritmo'],
      ['Pilates',       'Método Pilates mat y accesorios'],
      ['Funcional',     'Circuitos funcionales y movilidad'],
    ];
    for (const [nombre, descripcion] of disciplineData) {
      await queryInterface.sequelize.query(
        `INSERT INTO disciplines (nombre, descripcion, activo, created_at, updated_at)
         VALUES (:nombre, :desc, true, NOW(), NOW())
         ON CONFLICT (nombre) DO NOTHING`,
        { replacements: { nombre, desc: descripcion } }
      );
    }
    const discRows = await q(`SELECT id, nombre FROM disciplines WHERE activo=true ORDER BY id ASC`);
    const discId = {};
    discRows.forEach(d => { discId[d.nombre] = d.id; });

    // ── 5. Spaces (one per discipline) ────────────────────────────────────
    const spaceData = [
      ['Sala A',        discId['CrossTraining'], 18],
      ['Ring 01',       discId['Boxeo'],         14],
      ['Sala Mat',      discId['Yoga'],           16],
      ['Sala Cardio',   discId['Spinning'],       20],
      ['Sala Espejos',  discId['Pilates'],        14],
      ['Sala B',        discId['Funcional'],      16],
    ];
    for (const [nombre, discipline_id, cap] of spaceData) {
      await queryInterface.sequelize.query(
        `INSERT INTO spaces (discipline_id, nombre, capacidad_maxima, created_at, updated_at)
         VALUES (:disc, :nombre, :cap, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        { replacements: { disc: discipline_id, nombre, cap } }
      );
    }
    const spaceRows = await q(`SELECT id, nombre FROM spaces ORDER BY id ASC`);
    const spaceId = {};
    spaceRows.forEach(s => { spaceId[s.nombre] = s.id; });

    // ── 6. Classes ────────────────────────────────────────────────────────
    // [space_name, profesor_key, dia_semana, hora_inicio, hora_fin, cupos_maximos]
    const classData = [
      ['Sala A',       'mariana', 'lunes',     '07:00', '08:00', 18],
      ['Sala A',       'mariana', 'lunes',     '18:30', '19:30', 18],
      ['Ring 01',      'tomas',   'lunes',     '19:00', '20:00', 14],
      ['Sala Mat',     'sofia',   'lunes',     '09:30', '10:30', 16],
      ['Sala Cardio',  'bruno',   'martes',    '07:00', '07:45', 20],
      ['Sala A',       'mariana', 'martes',    '19:00', '20:00', 18],
      ['Sala Espejos', 'lucila',  'martes',    '10:00', '11:00', 14],
      ['Sala B',       'bruno',   'martes',    '18:00', '19:00', 16],
      ['Sala A',       'mariana', 'miercoles', '07:00', '08:00', 18],
      ['Sala Mat',     'sofia',   'miercoles', '18:00', '19:00', 16],
      ['Ring 01',      'tomas',   'miercoles', '20:00', '21:00', 14],
      ['Sala B',       'mariana', 'jueves',    '08:00', '09:00', 16],
      ['Sala Cardio',  'bruno',   'jueves',    '19:00', '19:45', 20],
      ['Sala A',       'mariana', 'jueves',    '18:30', '19:30', 18],
      ['Sala Espejos', 'lucila',  'viernes',   '10:00', '11:00', 14],
      ['Sala Mat',     'sofia',   'viernes',   '18:30', '19:30', 16],
      ['Sala A',       'mariana', 'viernes',   '07:00', '08:00', 18],
      ['Ring 01',      'tomas',   'sabado',    '11:00', '12:00', 14],
      ['Sala A',       'mariana', 'sabado',    '09:00', '10:00', 18],
      ['Sala B',       'bruno',   'sabado',    '10:30', '11:30', 16],
    ];

    for (const [spaceName, profKey, dia, ini, fin, cupos] of classData) {
      await queryInterface.sequelize.query(
        `INSERT INTO classes (space_id, profesor_id, dia_semana, hora_inicio, hora_fin, cupos_maximos, activo, created_at, updated_at)
         VALUES (:space, :prof, :dia, :ini, :fin, :cupos, true, NOW(), NOW())`,
        { replacements: { space: spaceId[spaceName], prof: profIds[profKey], dia, ini, fin, cupos } }
      );
    }
    const classRows = await q(`SELECT id FROM classes WHERE activo=true ORDER BY id ASC`);
    const classIds = classRows.map(r => r.id); // 20 classes

    // ── 7. Enrollments ────────────────────────────────────────────────────
    // Each alumno gets 1-4 classes, deterministic but varied
    const startDate = d(-180);
    for (let i = 0; i < allAlumnoIds.length; i++) {
      const alumnoId = allAlumnoIds[i];
      const count = 1 + (i % 4); // 1,2,3,4,1,2,...
      const enrolled = new Set();
      for (let j = 0; j < count; j++) {
        const cid = classIds[(i * 3 + j * 7) % classIds.length];
        if (!enrolled.has(cid)) {
          enrolled.add(cid);
          await queryInterface.sequelize.query(
            `INSERT INTO enrollments (alumno_id, class_id, fecha_desde, activo, created_at, updated_at)
             VALUES (:a, :c, :f, true, NOW(), NOW())
             ON CONFLICT (alumno_id, class_id) DO NOTHING`,
            { replacements: { a: alumnoId, c: cid, f: startDate } }
          );
        }
      }
    }

    // ── 8. Payments ───────────────────────────────────────────────────────
    // 3 months history per alumno + current month with mixed states
    const planIdArr = planIds.length >= 4 ? planIds : [planIds[0], planIds[0], planIds[0], planIds[0]];

    for (let i = 0; i < allAlumnoIds.length; i++) {
      const alumnoId = allAlumnoIds[i];
      const planId   = planIdArr[i % planIdArr.length];
      // Use matching plan price
      const planRow  = planRows[i % planRows.length];
      const precio   = parseFloat(planRow.precio_base);
      const duracion = planRow.duracion_dias;

      // Past 3 months — all pagado
      for (let m = 3; m >= 1; m--) {
        const fi  = d(-duracion * m);
        const fv  = d(-duracion * m + duracion);
        const fp  = d(-duracion * m + (i % 5));
        await queryInterface.sequelize.query(
          `INSERT INTO payments (alumno_id, plan_id, fecha_inicio, fecha_vencimiento, fecha_pago, estado, monto_final, registrado_por, created_at, updated_at)
           VALUES (:a, :p, :fi, :fv, :fp, 'pagado', :monto, :reg, NOW(), NOW())`,
          { replacements: { a: alumnoId, p: planId, fi, fv, fp, monto: precio.toFixed(2), reg: ADMIN_ID } }
        );
      }

      // Current period — mixed states
      const r = (i * 137) % 100;
      let estado, fechaPago, fechaVenc;
      fechaVenc = d(duracion);

      if (r < 55) {
        // pagado — vence en 10-29 días
        estado = 'pagado';
        fechaPago = d(-(i % 5));
        fechaVenc = d(15 + (r % 14));
      } else if (r < 75) {
        // pagado pero vence pronto (1-7 días)
        estado = 'pagado';
        fechaPago = d(-10 - (i % 5));
        fechaVenc = d(1 + (r % 6));
      } else if (r < 90) {
        // vencido
        estado = 'vencido';
        fechaPago = null;
        fechaVenc = d(-(2 + (r % 10)));
      } else {
        // pendiente
        estado = 'pendiente';
        fechaPago = null;
        fechaVenc = d(duracion);
      }

      const fi = d(-duracion);
      await queryInterface.sequelize.query(
        `INSERT INTO payments (alumno_id, plan_id, fecha_inicio, fecha_vencimiento, fecha_pago, estado, monto_final, registrado_por, created_at, updated_at)
         VALUES (:a, :p, :fi, :fv, :fp, :estado, :monto, :reg, NOW(), NOW())`,
        { replacements: {
            a: alumnoId, p: planId, fi, fv: fechaVenc,
            fp: fechaPago, estado, monto: precio.toFixed(2), reg: ADMIN_ID
        }}
      );
    }

    // ── 9. Makeup requests ───────────────────────────────────────────────
    const makeupData = [
      // [alumnoIdx, origenClassIdx, destinoClassIdx, origenDelta, destinoDelta, estado]
      [2,  0,  16, -3,  2, 'pendiente'],
      [6,  4,  12, -2,  1, 'pendiente'],
      [11, 3,   9, -5,  2, 'pendiente'],
      [17, 1,   5, -6,  1, 'pendiente'],
      [20, 7,  11, -7,  0, 'pendiente'],
      [4,  4,  12, -10,-3, 'aprobada'],
      [8,  2,  10, -14,-7, 'aprobada'],
      [14, 15,  9, -20,-13,'rechazada'],
    ];

    for (const [ai, oci, dci, od, dd, estado] of makeupData) {
      const alumnoId = allAlumnoIds[ai % allAlumnoIds.length];
      const origenId  = classIds[oci % classIds.length];
      const destinoId = classIds[dci % classIds.length];
      await queryInterface.sequelize.query(
        `INSERT INTO makeup_requests (alumno_id, class_origen_id, class_destino_id, fecha_clase_origen, fecha_clase_destino, estado, created_at, updated_at)
         VALUES (:a, :o, :dest, :fo, :fd, :estado, NOW(), NOW())`,
        { replacements: {
            a: alumnoId, o: origenId, dest: destinoId,
            fo: d(od), fd: d(dd), estado
        }}
      );
    }

    console.log('✓ Demo data seeded: disciplines, spaces, classes, enrollments, payments, makeups');
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`DELETE FROM makeup_requests WHERE id > 0`);
    await queryInterface.sequelize.query(`DELETE FROM payments WHERE id > 0`);
    await queryInterface.sequelize.query(`DELETE FROM enrollments WHERE id > 0`);
    await queryInterface.sequelize.query(`DELETE FROM classes WHERE id > 0`);
    await queryInterface.sequelize.query(`DELETE FROM spaces WHERE id > 0`);
    await queryInterface.sequelize.query(`DELETE FROM disciplines WHERE id > 0`);

    const extraEmails = [
      ...['tomas@ironatlas.com','sofia@ironatlas.com','bruno@ironatlas.com','lucila@ironatlas.com'],
      ...['joaquin.saavedra@mail.com','renata.vilches@mail.com','mateo.bonafede@mail.com',
          'antonella.riquelme@mail.com','ezequiel.marchetti@mail.com','pilar.echeverria@mail.com',
          'bautista.galvan@mail.com','delfina.carrasco@mail.com','lautaro.solano@mail.com',
          'trinidad.bouzas@mail.com','ignacio.quesada@mail.com','lara.buschiazzo@mail.com',
          'felipe.aramburu@mail.com','catalina.pizarro@mail.com','nicolas.tagliani@mail.com',
          'mora.vergara@mail.com','santino.casullo@mail.com','olivia.fioravanti@mail.com',
          'diego.berardo@mail.com','agostina.perez@mail.com','tobias.lemos@mail.com',
          'victoria.sanchez@mail.com','lucas.iglesias@mail.com','brenda.cardozo@mail.com',
          'maximiliano.funes@mail.com','sol.bianchi@mail.com','ramiro.ledesma@mail.com',
          'florencia.maidana@mail.com','gonzalo.aristegui@mail.com'],
    ];
    await queryInterface.sequelize.query(
      `DELETE FROM users WHERE email IN (${extraEmails.map(e => `'${e}'`).join(',')})`
    );
  },
};
