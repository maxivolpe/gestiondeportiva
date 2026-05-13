const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Class extends Model {}

  Class.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      space_id: { type: DataTypes.INTEGER, allowNull: false },
      profesor_id: { type: DataTypes.INTEGER, allowNull: false },
      dia_semana: {
        type: DataTypes.ENUM(
          'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'
        ),
        allowNull: false,
      },
      hora_inicio: { type: DataTypes.TIME, allowNull: false },
      hora_fin: { type: DataTypes.TIME, allowNull: false },
      cupos_maximos: { type: DataTypes.INTEGER, allowNull: false },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'Class',
      tableName: 'classes',
      underscored: true,
      timestamps: true,
    }
  );

  return Class;
};
