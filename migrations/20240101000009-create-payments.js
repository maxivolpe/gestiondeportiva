'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      alumno_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      plan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'payment_plans', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      fecha_inicio: { type: Sequelize.DATEONLY, allowNull: false },
      fecha_vencimiento: { type: Sequelize.DATEONLY, allowNull: false },
      fecha_pago: { type: Sequelize.DATEONLY, allowNull: true },
      estado: {
        type: Sequelize.ENUM('pendiente', 'pagado', 'vencido'),
        defaultValue: 'pendiente',
      },
      monto_final: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      notas: { type: Sequelize.TEXT, allowNull: true },
      registrado_por: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('payments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_estado";');
  },
};
