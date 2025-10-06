import { DataTypes } from 'sequelize';
import sequelize from '../lib/db';

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    penalty: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    proof: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    penalty_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: false
    }
});



export default Task;