'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('attendances', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      alumno_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'classes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      fecha: { type: Sequelize.DATEONLY, allowNull: false },
      tipo: { type: Sequelize.ENUM('regular', 'recupero'), allowNull: false },
      presente: { type: Sequelize.BOOLEAN, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('attendances', ['alumno_id', 'class_id', 'fecha'], { unique: true });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('attendances');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_attendances_tipo";');
  },
};
