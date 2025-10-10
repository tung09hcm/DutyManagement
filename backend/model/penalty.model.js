import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Penalty = sequelize.define('Penalty', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});



export default Penalty;