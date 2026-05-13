const sequelize = require('../config/database');

const User = require('./User')(sequelize);
const Discipline = require('./Discipline')(sequelize);
const Space = require('./Space')(sequelize);
const Class = require('./Class')(sequelize);
const Enrollment = require('./Enrollment')(sequelize);
const MakeupRequest = require('./MakeupRequest')(sequelize);
const Attendance = require('./Attendance')(sequelize);
const PaymentPlan = require('./PaymentPlan')(sequelize);
const Payment = require('./Payment')(sequelize);
const RefreshToken = require('./RefreshToken')(sequelize);

// User
User.hasMany(Enrollment, { foreignKey: 'alumno_id', as: 'enrollments' });
User.hasMany(Class, { foreignKey: 'profesor_id', as: 'clases' });
User.hasMany(MakeupRequest, { foreignKey: 'alumno_id', as: 'makeupRequests' });
User.hasMany(Payment, { foreignKey: 'alumno_id', as: 'payments' });
User.hasMany(RefreshToken, { foreignKey: 'user_id' });

// Discipline ↔ Space
Discipline.hasMany(Space, { foreignKey: 'discipline_id', as: 'spaces' });
Space.belongsTo(Discipline, { foreignKey: 'discipline_id', as: 'discipline' });

// Space ↔ Class
Space.hasMany(Class, { foreignKey: 'space_id', as: 'classes' });
Class.belongsTo(Space, { foreignKey: 'space_id', as: 'space' });

// Class associations
Class.hasMany(Enrollment, { foreignKey: 'class_id', as: 'enrollments' });
Class.hasMany(MakeupRequest, { as: 'makeupOrigen', foreignKey: 'class_origen_id' });
Class.hasMany(MakeupRequest, { as: 'makeupDestino', foreignKey: 'class_destino_id' });
Class.hasMany(Attendance, { foreignKey: 'class_id', as: 'attendances' });
Class.belongsTo(User, { as: 'profesor', foreignKey: 'profesor_id' });

// Enrollment
Enrollment.belongsTo(User, { as: 'alumno', foreignKey: 'alumno_id' });
Enrollment.belongsTo(Class, { as: 'clase', foreignKey: 'class_id' });

// MakeupRequest
MakeupRequest.belongsTo(User, { as: 'alumno', foreignKey: 'alumno_id' });
MakeupRequest.belongsTo(Class, { as: 'claseOrigen', foreignKey: 'class_origen_id' });
MakeupRequest.belongsTo(Class, { as: 'claseDestino', foreignKey: 'class_destino_id' });
MakeupRequest.belongsTo(User, { as: 'aprobador', foreignKey: 'aprobado_por' });

// Attendance
Attendance.belongsTo(User, { as: 'alumno', foreignKey: 'alumno_id' });
Attendance.belongsTo(Class, { as: 'clase', foreignKey: 'class_id' });

// Payment
Payment.belongsTo(User, { as: 'alumno', foreignKey: 'alumno_id' });
Payment.belongsTo(User, { as: 'registrador', foreignKey: 'registrado_por' });
Payment.belongsTo(PaymentPlan, { as: 'plan', foreignKey: 'plan_id' });
PaymentPlan.hasMany(Payment, { foreignKey: 'plan_id', as: 'payments' });

// RefreshToken
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Discipline,
  Space,
  Class,
  Enrollment,
  MakeupRequest,
  Attendance,
  PaymentPlan,
  Payment,
  RefreshToken,
};
