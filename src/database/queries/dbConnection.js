import Sequelize from "sequelize";
import mysql from "mysql2/promise";
import appConfig from "../../app/config/appConfig.js";

const dbConfig = new appConfig().getConfig();

async function ensureDatabaseExists() {
  const { host, username, password, database, collation } = dbConfig;

  // Create a connection to the MySQL server
  const connectionConfig = { host, user: username, password };
  const connection = await mysql.createConnection(connectionConfig);

  try {
    const [databases] = await connection.query("SHOW DATABASES;");
    const dbExists = databases.some((db) => db.Database === database);

    if (!dbExists) {
      await connection.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE ${collation};`);
    } else {
      console.log(`Database "${database}" already exists.`);
    }
  } finally {
    await connection.end();
  }
}

// Ensure the database exists before initializing Sequelize
await ensureDatabaseExists();

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: "mysql",
  logging: false,
  timezone: "+05:30", // Asia/Kolkata timezone
  dialectOptions: {
    connectTimeout: 60000, // 60 seconds
  },
  pool: {
    max: 40,
    min: 10,
    acquire: 120000,
    idle: 60000,
  },
});

try {
  await sequelize.authenticate();
  console.log("Connection has been established successfully ----------------------");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

export default sequelize;
