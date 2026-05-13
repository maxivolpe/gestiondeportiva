const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class MakeupRequest extends Model {}

  MakeupRequest.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      alumno_id: { type: DataTypes.INTEGER, allowNull: false },
      class_origen_id: { type: DataTypes.INTEGER, allowNull: false },
      class_destino_id: { type: DataTypes.INTEGER, allowNull: false },
      fecha_clase_origen: { type: DataTypes.DATEONLY, allowNull: false },
      fecha_clase_destino: { type: DataTypes.DATEONLY, allowNull: false },
      estado: {
        type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
        defaultValue: 'pendiente',
      },
      aprobado_por: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      sequelize,
      modelName: 'MakeupRequest',
      tableName: 'makeup_requests',
      underscored: true,
      timestamps: true,
    }
  );

  return MakeupRequest;
};
