const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Attendance extends Model {}

  Attendance.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      alumno_id: { type: DataTypes.INTEGER, allowNull: false },
      class_id: { type: DataTypes.INTEGER, allowNull: false },
      fecha: { type: DataTypes.DATEONLY, allowNull: false },
      tipo: { type: DataTypes.ENUM('regular', 'recupero'), allowNull: false },
      presente: { type: DataTypes.BOOLEAN, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Attendance',
      tableName: 'attendances',
      underscored: true,
      timestamps: true,
      indexes: [{ unique: true, fields: ['alumno_id', 'class_id', 'fecha'] }],
    }
  );

  return Attendance;
};
