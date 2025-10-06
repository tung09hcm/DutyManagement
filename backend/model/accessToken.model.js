import { DataTypes } from 'sequelize';
import sequelize from '../lib/db';

const AccessToken = sequelize.define('AccessToken', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});



export default AccessToken;