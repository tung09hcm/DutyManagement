import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const UserOrgTask  = sequelize.define('UserOrgTask', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});



export default UserOrgTask ;