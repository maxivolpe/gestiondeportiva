'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    // Dueño inicial
    const password_hash = await bcrypt.hash('Admin1234!', 12);
    await queryInterface.bulkInsert('users', [
      {
        nombre: 'Administrador',
        email: 'admin@gimnasio.com',
        password_hash,
        rol: 'dueno',
        activo: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    // Planes de pago base
    await queryInterface.bulkInsert('payment_plans', [
      {
        nombre: 'Mensual',
        duracion_dias: 30,
        precio_base: 10000.00,
        descuento_porcentaje: 0,
        activo: true,
        created_at: now,
        updated_at: now,
      },
      {
        nombre: 'Trimestral',
        duracion_dias: 90,
        precio_base: 27000.00,
        descuento_porcentaje: 10,
        activo: true,
        created_at: now,
        updated_at: now,
      },
      {
        nombre: 'Semestral',
        duracion_dias: 180,
        precio_base: 50000.00,
        descuento_porcentaje: 16.67,
        activo: true,
        created_at: now,
        updated_at: now,
      },
      {
        nombre: 'Anual',
        duracion_dias: 365,
        precio_base: 90000.00,
        descuento_porcentaje: 25,
        activo: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('payment_plans', null, {});
    await queryInterface.bulkDelete('users', { email: 'admin@gimnasio.com' }, {});
  },
};
