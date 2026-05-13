'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    const hash = await bcrypt.hash('123456', 12);

    await queryInterface.bulkInsert('users', [
      {
        nombre: 'Valeria Donati',
        email: 'secretaria@ironatlas.com',
        password_hash: hash,
        rol: 'secretario',
        activo: true,
        created_at: now,
        updated_at: now,
      },
      {
        nombre: 'Mariana Ledesma',
        email: 'mariana@ironatlas.com',
        password_hash: hash,
        rol: 'profesor',
        activo: true,
        created_at: now,
        updated_at: now,
      },
      {
        nombre: 'Camila Ortega',
        email: 'camila@ironatlas.com',
        password_hash: hash,
        rol: 'alumno',
        activo: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', {
      email: ['secretaria@ironatlas.com', 'mariana@ironatlas.com', 'camila@ironatlas.com'],
    }, {});
  },
};
