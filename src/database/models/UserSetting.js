// import { DataTypes, sequelize } from "sequelize";
// import { emitUserDataToSpecificAdmins, io } from "../sockets/socket.js";


// export const UserSettings = sequelize.define("user_setting",
//   {
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       unique: true
//     },
//     screenshotTime: {
//       type: DataTypes.INTEGER,
//       defaultValue: 300, 
//     },
//     appHistoryTime: {
//       type: DataTypes.INTEGER,
//       defaultValue: 300, 
//     },
//     browsingHistoryTime: {
//       type: DataTypes.INTEGER,
//       defaultValue: 300, 
//     },
//   },
//   {
//     timestamps: true, 
//   }
// );

// UserSettings.afterSave(async (userSettings, options) => {
//   try {
//     const userId = userSettings.userId;
//     console.log("User settings user ID -", typeof userId);
//     if (io && userId) {
//       io.to(userId.toString()).emit("userSettingsUpdated", {
//         message: "User settings have been updated",
//         userSettings,
//       });

//       await emitUserDataToSpecificAdmins(userId);
//     }
//   } catch (error) {
//     console.error("Error in afterSave hook for UserSettings:", error);
//   }
// });

// export default UserSettings;
