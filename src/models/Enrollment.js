const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Enrollment extends Model {}

  Enrollment.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      alumno_id: { type: DataTypes.INTEGER, allowNull: false },
      class_id: { type: DataTypes.INTEGER, allowNull: false },
      fecha_desde: { type: DataTypes.DATEONLY, allowNull: false },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'Enrollment',
      tableName: 'enrollments',
      underscored: true,
      timestamps: true,
      indexes: [{ unique: true, fields: ['alumno_id', 'class_id'] }],
    }
  );

  return Enrollment;
};
