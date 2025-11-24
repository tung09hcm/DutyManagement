import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: false, 
  timezone: '+07:00'
});

try{
    await sequelize.authenticate();
    console.log("Connect to Mysql database successfully");
}
catch(e){
    console.log("Cant connect to Mysql database: " + e);
}

export default sequelize;