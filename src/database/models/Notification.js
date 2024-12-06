import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const Notification = sequelize.define("notification_log",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING, 
      allowNull: false,
    },
    is_read:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false, 
  }
);

await Notification.sync()

export { sequelize, Notification };














// import { sequelize, DataTypes, Model } from "sequelize";
// import { adminSocket } from "../sockets/adminSocket"; // Assuming this remains the same

// // Define Notification Model
// class Notification extends Model {}

// Notification.init(
//   {
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     message: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     username: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     userId: {
//       type: DataTypes.STRING, // Consider using INTEGER if user IDs are numeric
//       allowNull: false,
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//   },
//   {
//     timestamps: false, // Disable default Sequelize timestamps
//   }
// );

// // Middleware Equivalent: Sequelize Hooks
// Notification.afterCreate(async (notification) => {
//   try {
//     if (adminSocket) {
//       adminSocket.emit("newNotification", { notification });
//     }
//   } catch (error) {
//     console.error("Error emitting new notification event:", error);
//   }
// });

// export { sequelize, Notification };
