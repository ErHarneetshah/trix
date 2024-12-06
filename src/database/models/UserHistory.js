import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";


export const UserHistory = sequelize.define("user_history", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  visitTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

await UserHistory.sync()

































// import { DataTypes } from "sequelize";
// import sequelize from "../queries/dbConnection.js";
// import adminController from "../../sockets/adminSocket.js"; 

// // Define the HistoryEntry Model
// const HistoryEntry = sequelize.define("HistoryEntry",
//   {
//     url: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     visitTime: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//   },
//   {
//     timestamps: false, 
//   }
// );

// // Define the UserHistory Model
// const UserHistory = sequelize.define(
//   "UserHistory",
//   {
//     user: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: "Users", key: "id" }, 
//     },
//     date: {
//       type: DataTypes.STRING, 
//       allowNull: false,
//     },
//   },
//   {
//     timestamps: true, 
//   }
// );


// // Middleware Equivalent: Sequelize Hooks
// UserHistory.addHook("afterSave", async () => {
//   try {
//     await adminController.updateURLHostStats(); // Emit stats update after saving
//   } catch (error) {
//     console.error("Error in afterSave hook:", error.message);
//   }
// });

// UserHistory.addHook("afterUpdate", async () => {
//   try {
//     await adminController.updateURLHostStats(); // Emit stats update after updating
//   } catch (error) {
//     console.error("Error in afterUpdate hook:", error.message);
//   }
// });

// export { sequelize, UserHistory, HistoryEntry };
