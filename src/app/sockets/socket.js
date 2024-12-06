import { Server } from "socket.io";
import { verifyToken } from "../../utils/validations/socketValidation.js";
import { Notification } from "../../database/models/Notification.js";
import { UserHistory } from "../../database/models/UserHistory.js";
import User from "../../database/models/userModel.js";
import { AppHistoryEntry } from "../../database/models/AppHistoryEntry.js";
import { ImageUpload } from "../../database/models/ImageUpload.js";
import { Sequelize } from "sequelize";
import appInfo from "../../database/models/AppInfo.js";
import blockedWebsites from "../../database/models/WebsiteInfo.js";

User.hasMany(UserHistory, { foreignKey: "userId" });
User.hasMany(AppHistoryEntry, { foreignKey: "userId" });


const setupSocketIO = (httpServer) => {
  const io = new Server(httpServer);

  // Middleware for Socket.IO authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.headers.authorization;
      if (!token) throw new Error("Authorization token is required");

      const userData = verifyToken(token);
      if (!userData) throw new Error("Invalid token");

      socket.user = userData;
      next();
    } catch (error) {
      console.error("Authentication error:", error.message);
      next(new Error("Authentication failed"));
    }
  });

  // Connection event

  io.on("connection", async (socket) => {
    let userData = await User.findOne({ where: { id: socket.user.userId } });
    if (User) {
      userData.socket_id = socket.id;
      await userData.save();
    }
    if (socket.user.isAdmin) {
      handleAdminSocket(socket, io);
    } else {
      handleUserSocket(socket, io);
    }
  });

  return io;
};

// Admin-specific handlers
const handleAdminSocket = (socket, io) => {
  console.log("Admin connected:", socket.user.userId);
  socket.join("Admin");

  // Example: Health check event
  socket.on("check", () => socket.emit("pong"));

  // Notify admin of unread notifications
  const sendAdminNotifications = async () => {
    try {
      const notificationCount = await Notification.count({
        where: { is_read: 0 },
      });
      socket.emit("newNotification", { notificationCount });
    } catch (error) {
      console.error("Error fetching admin notifications:", error.message);
    }
  };
  sendAdminNotifications();

  socket.on("getRecentNotifications", async () => {
    try {
      let notifications = await Notification.findAll({
        where: {},
        order: [["createdAt", "DESC"]],
        limit: 5,
      });
      await Notification.update(
        { is_read: 1 },
        { where: { id: notifications.map((n) => n.id) } }
      );

      socket.emit("recentNotifications", { notifications });
    } catch (error) {
      console.error("Error fetching recent notifications:", error.message);
      socket.emit("error", {
        message: `Error fetching notifications: ${error.message}`,
      });
    }
  });

  socket.on("getUserStats", async (data) => {
    try {
      await adminController.updateUsers(socket);
      await adminController.updateAppsStats(socket);
      await adminController.updateURLHostStats(socket);
    } catch (error) {
      console.error("Error fetching stats:", error.message);
      socket.emit("error", {
        message: `Error fetching stats: ${error.message}`,
      });
    }
  });

  socket.on("getUserReport", async (data) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const user = await User.findOne({
        include: [
          {
            model: UserHistory,
            where: { date: today },
            required: false,
          },
          {
            model: AppHistoryEntry,
            where: { date: today },
            required: false,
          },
        ],
        where: { id: data.userId },
      });
      if (!user) {
        return socket.emit("error", {
          message: "User not found",
        });
      }
      const response = {
        message: "User report fetched successfully",
        data: user,
      };
      socket.emit("getUserReport", response);
    } catch (error) {
      console.error("Error fetching stats:", error.message);
      socket.emit("error", {
        message: `Error fetching stats: ${error.message}`,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Admin disconnected:", socket.user.userId);
  });
};

// User-specific handlers
const handleUserSocket = (socket, io) => {
  console.log("User connected:", socket.user.userId);
  socket.join(`User ${socket.user.userId}`);

  // Notify admin of user login
  const notifyAdmin = async (message) => {
    try {
      await Notification.create({
        userId: socket.user.userId,
        message,
        title: message,
      });
      const notificationCount = await Notification.count({
        where: { is_read: 0 },
      });
      io.to("Admin").emit("newNotification", { notificationCount });
    } catch (error) {
      console.error("Error notifying admin:", error.message);
    }
  };
  notifyAdmin("User Login successfully");

  socket.on("uploadHistory", async (data) => {
    try {
      const { url, title, visitTime } = data;
      const userId = socket.user.userId;

      if (!url || !title || !visitTime) {
        socket.emit("historyError", { message: "Invalid data" });
        return;
      }

      const user = await User.findByPk(userId);
      if (!user) {
        socket.emit("historyError", { message: "Unauthorized access" });
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const parsedVisitTime = isNaN(new Date(visitTime))
        ? new Date()
        : new Date(visitTime);

      await UserHistory.create({
        userId,
        date: today,
        url,
        title,
        visitTime: parsedVisitTime,
      });
      socket.emit("historySuccess", {
        message: "History uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading history:", error.message);
      socket.emit("historyError", { message: "Failed to upload history" });
    }
  });

  socket.on("uploadAppHistory", async (data) => {
    let { histories } = data;
    let userId = socket.user.userId;

    let user = await User.findOne({ where: { id: userId } });
    if (!user) {
      socket.emit("appHistoryError", { message: "Unauthorized access" });
      return;
    }

    if (!histories || histories.length === 0) {
      socket.emit("appHistoryError", { message: "Invalid data" });
      return;
    }

    let today = new Date().toISOString().split("T")[0];

    // let [userAppHistory] = await UserAppHistory.findOrCreate({
    //   where: { userId: user.id, date: today },
    //   defaults: { userId: user.id, date: today },
    // });

    for (let history of histories) {
      let { appName, startTime, endTime } = history;

      if (!appName || !startTime || !endTime) {
        continue;
      }

      await AppHistoryEntry.findOne({
        where: {
          userId: user.id,
          date: today,
          appName,
          startTime: new Date(startTime),
        },
      });

      // let existingEntry = await AppHistoryEntry.findOne({
      //   where: {
      //     userId: user.id,
      //     date: today,
      //     appName,
      //     startTime: new Date(startTime),
      //   },
      // });

      // if (existingEntry) {
      //   existingEntry.endTime = new Date(endTime);
      //   await existingEntry.save();
      // } else {
      //   await AppHistoryEntry.create({
      //     userAppHistoryId: userAppHistory.id,
      //     appName,
      //     startTime: new Date(startTime),
      //     endTime: new Date(endTime),
      //   });
      // }
    }
    socket.emit("appHistorySuccess", {
      message: "App history uploaded successfully",
    });

    // Notify to admin
    emitUserDataToSpecificAdmins(user.id);
  });

  socket.on("uploadImage", async (data) => {
    try {
      let { images } = data;
      let userId = socket.user.userId;

      let user = await User.findOne({ where: { id: userId } });
      if (!user) {
        socket.emit("imageError", { message: "Unauthorized access" });
        return;
      }

      if (!images || images.length == 0) {
        console.log("Invalid data received from the client");
        socket.emit("imageError", { message: "Invalid data" });
        return;
      }
      let uploadPromises = images.map(async (image) => {
        console.log({ image });


        // let timestamp = new Date();
        // let buffer = Buffer.from(image.data, "base64");

        return ImageUpload.create({
          userId: user.id,
          content: image,
        });
      });

      let results = await Promise.all(uploadPromises);

      socket.emit("imageSuccess", {
        message: "Images uploaded successfully",
        results,
      });

      // Notify admins
      // emitUserDataToSpecificAdmins(user.id);
    } catch (error) {
      console.error("Error uploading images:", error);
      socket.emit("imageError", { message: "Failed to upload images" });
    }
  });

  socket.on("getUserSettings", async () => {
    try {     
      let userId = socket.user.userId;
      let user = await User.findOne({ where: { id: userId } });
      if (!user) {
        socket.emit("userSettingsError", { message: "User not found" });
        return;
      }      
      socket.emit("getUserSettings", {message: "User Setting Update",user});
    } catch (error) {
      console.error("Error fetching user settings:", error);
      socket.emit("userSettingsError", {message: "Failed to fetch user settings"});
    }
  });

  socket.on("disconnect", async () => {
    try {
      console.log("User disconnected:", socket.user.userId);
      await Notification.create({
        userId: socket.user.userId,
        message: "User Logout successfully",
        title: "User Logout",
      });
      const notificationCount = await Notification.count({
        where: { is_read: 0 },
      });
      io.to("Admin").emit("newNotification", { notificationCount });
    } catch (error) {
      console.error("Error during user disconnection:", error.message);
    }
  });
};

export default setupSocketIO;

// AdminController (modularized)
export const adminController = {
  async updateUsers(socket) {
    try {
      let users = await User.findAll();
      let totalUsers = users.length;
      let activeUsers = users.filter((user) => user.current_status == 1).length;
      let inactiveUsers = users.filter(
        (user) => user.current_status == 0
      ).length;

      socket.emit("userCount", { totalUsers, activeUsers, inactiveUsers });
    } catch (error) {
      console.error("Error updating users:", error.message);
    }
  },

  async updateAppsStats(socket) {
    try {
      let today = new Date().toISOString().split("T")[0];

      let findAll = await AppHistoryEntry.findAll({
        where: { date: today },
      });

      socket.emit("appUsageStats", findAll);
    } catch (error) {
      console.error("Error updating app stats:", error.message);
    }
  },

  async updateURLHostStats(socket) {
    try {
      let today = new Date().toISOString().split("T")[0];
      let urlStats = await UserHistory.findAll({
        where: { date: today },
        attributes: [
          [
            Sequelize.fn(
              "REGEXP_SUBSTR",
              Sequelize.col("url"),
              "^(?:https?:\\/\\/)?(?:[^@\\/\n]+@)?(?:www\\.)?([^:\\/?\n]+)"
            ),
            "host",
          ],
          [Sequelize.fn("COUNT", Sequelize.col("url")), "count"],
        ],
        group: ["host"],
        order: [[Sequelize.literal("count"), "DESC"]],
      });
      // console.log(urlStats);

      socket.emit("urlHostUsageStats", urlStats);
    } catch (error) {
      console.error("Error updating URL host stats:", error.message);
    }
  },
};
