import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const UserTask = sequelize.define("UserTask", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

export default UserTask;
