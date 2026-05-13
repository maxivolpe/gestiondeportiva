const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Payment extends Model {}

  Payment.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      alumno_id: { type: DataTypes.INTEGER, allowNull: false },
      plan_id: { type: DataTypes.INTEGER, allowNull: false },
      fecha_inicio: { type: DataTypes.DATEONLY, allowNull: false },
      fecha_vencimiento: { type: DataTypes.DATEONLY, allowNull: false },
      fecha_pago: { type: DataTypes.DATEONLY, allowNull: true },
      estado: {
        type: DataTypes.ENUM('pendiente', 'pagado', 'vencido'),
        defaultValue: 'pendiente',
      },
      monto_final: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      notas: { type: DataTypes.TEXT, allowNull: true },
      registrado_por: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Payment',
      tableName: 'payments',
      underscored: true,
      timestamps: true,
    }
  );

  return Payment;
};
