import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Organization = sequelize.define('Organization', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    avatarLink: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    backgroundLink: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});



export default Organization;