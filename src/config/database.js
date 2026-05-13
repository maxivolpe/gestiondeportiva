const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging:
    process.env.NODE_ENV === 'development'
      ? (sql) => console.log(JSON.stringify({ level: 'sql', message: sql }))
      : false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

module.exports = sequelize;
