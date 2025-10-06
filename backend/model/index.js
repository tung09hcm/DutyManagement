import sequelize from '../lib/db.js';
import User from './user.model.js';
import Organization from './organization.model.js';
import Task from './task.model.js';
import AccessToken from './accessToken.model.js';
import RefreshToken from './refreshToken.model.js';
import UserOrganization from './userOrganization.model.js';

User.hasMany(AccessToken, { foreignKey: 'userId' });
AccessToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

User.belongsToMany(Organization, { through: UserOrganization });
Organization.belongsToMany(User, { through: UserOrganization });

Organization.hasMany(Task, { foreignKey: 'organizationId' });
Task.belongsTo(Organization, { foreignKey: 'organizationId' });

User.belongsToMany(Task, { through: 'UserTask' });
Task.belongsToMany(User, { through: 'UserTask' });

await sequelize.sync({ alter: true });
console.log('All models synced successfully');

export {
  sequelize,
  User,
  Organization,
  Task,
  AccessToken,
  RefreshToken,
  UserOrganization
};


