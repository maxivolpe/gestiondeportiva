const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RefreshToken extends Model {}

  RefreshToken.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      token_hash: { type: DataTypes.STRING, allowNull: false, unique: true },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      revocado: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: 'RefreshToken',
      tableName: 'refresh_tokens',
      underscored: true,
      timestamps: true,
    }
  );

  return RefreshToken;
};
