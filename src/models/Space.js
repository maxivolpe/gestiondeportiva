const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Space extends Model {}

  Space.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      discipline_id: { type: DataTypes.INTEGER, allowNull: false },
      nombre: { type: DataTypes.STRING, allowNull: false },
      capacidad_maxima: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Space',
      tableName: 'spaces',
      underscored: true,
      timestamps: true,
    }
  );

  return Space;
};
