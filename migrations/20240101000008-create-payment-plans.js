'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payment_plans', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      nombre: { type: Sequelize.STRING, allowNull: false },
      duracion_dias: { type: Sequelize.INTEGER, allowNull: false },
      precio_base: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      descuento_porcentaje: { type: Sequelize.FLOAT, defaultValue: 0 },
      activo: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('payment_plans');
  },
};
