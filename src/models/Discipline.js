const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Discipline extends Model {}

  Discipline.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      descripcion: { type: DataTypes.TEXT },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'Discipline',
      tableName: 'disciplines',
      underscored: true,
      timestamps: true,
    }
  );

  return Discipline;
};
