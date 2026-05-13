const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PaymentPlan extends Model {}

  PaymentPlan.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING, allowNull: false },
      duracion_dias: { type: DataTypes.INTEGER, allowNull: false },
      precio_base: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      descuento_porcentaje: { type: DataTypes.FLOAT, defaultValue: 0 },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'PaymentPlan',
      tableName: 'payment_plans',
      underscored: true,
      timestamps: true,
    }
  );

  return PaymentPlan;
};
