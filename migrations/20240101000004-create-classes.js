'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('classes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      space_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'spaces', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      profesor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      dia_semana: {
        type: Sequelize.ENUM(
          'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'
        ),
        allowNull: false,
      },
      hora_inicio: { type: Sequelize.TIME, allowNull: false },
      hora_fin: { type: Sequelize.TIME, allowNull: false },
      cupos_maximos: { type: Sequelize.INTEGER, allowNull: false },
      activo: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('classes');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_classes_dia_semana";');
  },
};
