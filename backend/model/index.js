import sequelize from '../lib/db.js';

// Import tất cả các model đã định nghĩa
import User from './user.model.js';
import Organization from './organization.model.js';
import Task from './task.model.js';
import RefreshToken from './refreshToken.model.js';
import UserOrgTask from './userOrgTask.model.js';
import Penalty from './penalty.model.js'; // <-- Thêm model Penalty

const db = {
    sequelize,
    User,
    Organization,
    Task,
    RefreshToken,
    UserOrgTask,
    Penalty
};

// --- THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS) ---

// 1. User <-> RefreshToken (One-to-Many)
// Một User có thể có nhiều RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

// 2. User <-> Organization (Many-to-Many through UserOrgTask)
// Một User có thể thuộc nhiều Organization, và một Organization có nhiều User.
// Bảng trung gian UserOrgTask chứa thông tin bổ sung là "role".
User.belongsToMany(Organization, { through: UserOrgTask, foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Organization.belongsToMany(User, { through: UserOrgTask, foreignKey: 'organizationId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
UserOrgTask.belongsTo(User, { foreignKey: "userId" });
UserOrgTask.belongsTo(Organization, { foreignKey: "organizationId" });
User.hasMany(UserOrgTask, { foreignKey: "userId" });
Organization.hasMany(UserOrgTask, { foreignKey: "organizationId" });
// 3. Organization <-> Task (One-to-Many)
// Một Organization có nhiều Task, nhưng một Task chỉ thuộc về một Organization.
Organization.hasMany(Task, { foreignKey: 'organizationId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Task.belongsTo(Organization, { foreignKey: 'organizationId' });

// 4. User <-> Task (Many-to-Many)
// Một User có thể được giao nhiều Task, và một Task có thể có nhiều User thực hiện.
// Sequelize sẽ tự động tạo bảng trung gian 'UserTasks'.
User.belongsToMany(Task, { through: 'UserTasks', foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Task.belongsToMany(User, { through: 'UserTasks', foreignKey: 'taskId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// 5. User/Task -> Penalty (One-to-Many from both)
// Một User có thể có nhiều Penalty. Một Task cũng có thể có nhiều Penalty.
// Mỗi bản ghi Penalty thuộc về MỘT User và MỘT Task.
User.hasMany(Penalty, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Penalty.belongsTo(User, { foreignKey: 'userId' });

Task.hasMany(Penalty, { foreignKey: 'taskId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Penalty.belongsTo(Task, { foreignKey: 'taskId' });


// Đồng bộ tất cả các model với cơ sở dữ liệu
(async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to synchronize the models with the database:', error);
    }
})();

export {
    sequelize,
    User,
    Organization,
    Task,
    RefreshToken,
    UserOrgTask,
    Penalty
};