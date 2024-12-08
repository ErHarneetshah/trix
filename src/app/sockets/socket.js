import { verifyToken } from "../../utils/validations/socketValidation.js";
import { Notification } from "../../database/models/Notification.js";
import { UserHistory } from "../../database/models/UserHistory.js";
import User from "../../database/models/userModel.js";
import { AppHistoryEntry } from "../../database/models/AppHistoryEntry.js";
import { ImageUpload } from "../../database/models/ImageUpload.js";
import { Op, Sequelize } from "sequelize";
import ProductiveApp from "../../database/models/ProductiveApp.js";
import ProductiveWebsite from "../../database/models/ProductiveWebsite.js";
import Model from "../../database/queries/dbConnection.js";
import { QueryTypes } from "@sequelize/core";
import { System } from "../../database/models/System.js";
import helper from "../../utils/services/helper.js";





User.hasMany(UserHistory, { foreignKey: "userId", as: "web" });
User.hasMany(AppHistoryEntry, { foreignKey: "userId", as: "app" });

const setupSocketIO = (io) => {
  // Middleware for Socket.IO authentication

  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.headers.authorization;
      if (!token) {
        token = socket.handshake.query.authToken;
      }
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
      userData.socket_id = socket.id; // Save socket id into user table
      await userData.save();
    }
    socket.join("Admin");
    if (socket.user.isAdmin) {
      handleAdminSocket(socket, io);
    } else {
      handleUserSocket(socket, io);
    }
  });

  return io;
};

export const getUserStats = async () => {
  try {
    await adminController.updateUsers(io);
    await adminController.updateAppsStats(io);
    await adminController.updateURLHostStats(io);
  } catch (error) {
    console.error("Error fetching admin getuserstats:", error.message);
  }
};


// Admin-specific handlers
const handleAdminSocket = (socket, io) => {
  // User Report :
  const userReport = async (id) => {
    try {
      let user = await User.findOne({ where: { id } });
      let today = new Date().toISOString().split("T")[0];

      let web_query = `SELECT url , count(id) as visits FROM user_histories where date = "${today}" AND userId = ${id} GROUP by url`;
      let userHistories = await Model.query(web_query, {
        type: QueryTypes.SELECT,
      });

      let app_query = `SELECT appName , count(id) as visits FROM app_histories where date = "${today}" AND userId = ${id} GROUP by appName`;
      let appHistories = await Model.query(app_query, {
        type: QueryTypes.SELECT,
      });

      let image_query = `SELECT content FROM image_uploads where date = "${today}" AND userId = ${id}`;
      let image = await Model.query(image_query, { type: QueryTypes.SELECT });

      if (!user) {
        return socket.emit("error", {
          message: "User not found",
        });
      }
      let response = {
        status: 1,
        message: "User Report fetched successfully",
        data: {
          user,
          image,
          userHistories,
          appHistories,
        },
      };
      io.to("privateRoom_" + id).emit("userReport", response);
    } catch (error) {
      console.log("Error fetching stats:", error);
      socket.emit("error", {
        message: `Error fetching stats: ${error.message}`,
      });
    }
  };

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

  socket.on("getRecentNotifications", async (data = {}) => {
    try {
      // Destructuring with default values for limit and page
      let { limit = 5, page = 1 } = data;
      let offset = (page - 1) * limit;

      let notifications = await Notification.findAndCountAll({
        where: {},
        order: [["id", "DESC"]],
        limit,
        offset,
      });

      socket.emit("recentNotifications", { notifications });
    } catch (error) {
      console.error("Error fetching recent notifications:", error.message);
      socket.emit("error", {
        message: `Error fetching notifications: ${error.message}`,
      });
    }
  });

  socket.on("isRead", async (data) => {
    try {
      let find = await Notification.findOne({ where: { id: data.id } });
      if (!find) {
        socket.emit("isRead", { message: "Notification Not Found", status: 0 });
      } else {
        find.is_read = 1;
        await find.save();
        let notificationCount = await Notification.count({
          where: { is_read: 0 },
        });
        socket.emit("isRead", {
          message: "Notification Read Successfully",
          status: 1,
        });
        io.emit("newNotification", { notificationCount });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
      socket.emit("error", {
        message: `Error marking notification as read: ${error.message}`,
      });
    }
  });

  const getUserStats = async () => {
    try {
      await adminController.updateUsers(io);
      await adminController.updateAppsStats(io);
      await adminController.updateURLHostStats(io);
    } catch (error) {
      console.error("Error fetching admin getuserstats:", error.message);
    }
  };
  getUserStats();

  // socket.on("getUserStats", async (data) => {
  //   try {
  //     await adminController.updateUsers(socket);
  //     await adminController.updateAppsStats(socket);
  //     await adminController.updateURLHostStats(socket);
  //   } catch (error) {
  //     console.error("Error fetching stats:", error.message);
  //     socket.emit("error", {
  //       message: `Error fetching stats: ${error.message}`,
  //     });
  //   }
  // });

  socket.on("getUserReport", async (data) => {
    try {
      let user = await User.findOne({ where: { id: data.userId } });
      socket.join("privateRoom_" + data.userId);
      io.to(user.socket_id).socketsJoin("privateRoom");

      let today;
      if (data.date) {
        today = new Date(data.date).toISOString().split("T")[0];
      } else {
        today = new Date().toISOString().split("T")[0];
      }

      let web_query = `SELECT url , count(id) as visits FROM user_histories where date = "${today}" AND userId = ${data.userId} GROUP by url`;
      let userHistories = await Model.query(web_query, {
        type: QueryTypes.SELECT,
      });

      let app_query = `SELECT appName , count(id) as visits FROM app_histories where date = "${today}" AND userId = ${data.userId} GROUP by appName`;
      let appHistories = await Model.query(app_query, {
        type: QueryTypes.SELECT,
      });

      let image_query = `SELECT content FROM image_uploads where date = "${today}" AND userId = ${data.userId}`;
      let image = await Model.query(image_query, { type: QueryTypes.SELECT });

      if (!user) {
        return socket.emit("error", {
          message: "User not found",
        });
      }
      let response = {
        status: 1,
        message: "User Report fetched successfully",
        data: {
          user,
          image,
          userHistories,
          appHistories,
        },
      };
      // io.to("Admin").emit("getUserReport", response);
      io.to("privateRoom").emit("userReport", response);
    } catch (error) {
      console.log("Error fetching stats:", error);
      socket.emit("error", {
        message: `Error fetching stats: ${error.message}`,
      });
    }
  });

  socket.on("getSystemConfig", async (data = {}) => {
    try {
      let { limit = 9, page = 1 } = data;
      let offset = (page - 1) * limit;

      let systemData = await System.findAll({
        attributes: ["id","user_id","ram","rom","fan_speed","memory"],
        where: {
          id: {[Op.in]: Sequelize.literal(`(SELECT MAX(id) FROM systems GROUP BY user_id)`)},
        },
        order: [["user_id", "ASC"]],
        offset
      });

      socket.emit("getSystemConfig", systemData);
    } catch (error) {
      console.error("Error fetching recent notifications:", error.message);
      socket.emit("getSystemConfig", {
        message: `Error fetching notifications: ${error.message}`,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Admin disconnected:", socket.user.userId);
  });
};

// User-specific handlers
const handleUserSocket = (socket, io) => {
  socket.join(`privateRoom_${socket.user.userId}`);

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

  socket.on("ping", async () => {
    socket.emit("pong");
  });

  const userReport = async (id) => {
    try {
      let user = await User.findOne({ where: { id } });
      let today = new Date().toISOString().split("T")[0];

      let web_query = `SELECT url , count(id) as visits FROM user_histories where date = "${today}" AND userId = ${id} GROUP by url`;
      let userHistories = await Model.query(web_query, {
        type: QueryTypes.SELECT,
      });

      let app_query = `SELECT appName , count(id) as visits FROM app_histories where date = "${today}" AND userId = ${id} GROUP by appName`;
      let appHistories = await Model.query(app_query, {
        type: QueryTypes.SELECT,
      });

      let image_query = `SELECT content FROM image_uploads where date = "${today}" AND userId = ${id}`;
      let image = await Model.query(image_query, { type: QueryTypes.SELECT });

      if (!user) {
        return socket.emit("error", {
          message: "User not found",
        });
      }
      let response = {
        status: 1,
        message: "User Report fetched successfully",
        data: {
          user,
          image,
          userHistories,
          appHistories,
        },
      };
      io.to("privateRoom_" + id).emit("userReport", response);
    } catch (error) {
      console.log("Error fetching stats:", error);
      socket.emit("error", {
        message: `Error fetching stats: ${error.message}`,
      });
    }
  };

  socket.on("uploadImage", async (data) => {
    try {
      let today = new Date().toISOString().split("T")[0];
      let userId = socket.user.userId;

      let user = await User.findOne({ where: { id: userId } });
      if (!user) {
        socket.emit("imageError", { message: "Unauthorized access" });
        return;
      }
      let companyId = user?.company_id;
      console.log(data);
      
      if (!data.images || data.images.length === 0) {
        socket.emit("imageError", { message: "Invalid data" });
        return;
      }
      console.log(data);
      
      await Promise.all(
        data.images.map((image) =>
          ImageUpload.create({
            userId,
            date: today,
            companyId,
            content: `${image.data}`
            // content: `data:image/png;base64,${image.data}`,
          })
        )
      );

      socket.emit("imageSuccess", { message: "Images uploaded successfully" });
      userReport(userId);
    } catch (error) {
      console.log("Error uploading images:", error);
      socket.emit("imageError", { message: "Failed to upload images" });
    }
  });

  socket.on("uploadHistory", async (data) => {
    try {
      let { url, title, visitTime } = data;
      let userId = socket.user.userId;

      if (!url || !title || !visitTime) {
        socket.emit("historyError", { message: "Invalid data" });
        return;
      }

      let user = await User.findByPk(userId);
      if (!user) {
        socket.emit("historyError", { message: "Unauthorized access" });
        return;
      }

      let today = new Date().toISOString().split("T")[0];
      let parsedVisitTime = isNaN(new Date(visitTime))
        ? new Date()
        : new Date(visitTime);
      
      let website_name = helper.extractWebsiteName(url);

      let companyId = user?.company_id;

      await UserHistory.create({
        userId,
        date: today,
        website_name,
        url,
        title,
        companyId,
        visitTime: parsedVisitTime,
      });

      socket.emit("historySuccess", {
        message: "History uploaded successfully",
      });
      await userReport(userId);
    } catch (error) {
      console.error("Error uploading history:", error.message);
      socket.emit("historyError", { message: "Failed to upload history" });
    }
  });

  socket.on("uploadAppHistory", async (data) => {
    try {
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
      let companyId = user?.company_id;
      for (let history of histories) {
        let { appName, startTime, endTime } = history;

        if (!appName || !startTime || !endTime) {
          continue;
        }

        let existingEntry = await AppHistoryEntry.findOne({
          where: {
            userId: user.id,
            companyId,
            date: today,
            appName,
            startTime: new Date(startTime),
          },
        });

        if (existingEntry) {
          existingEntry.endTime = new Date(endTime);
          await existingEntry.save();
        } else {
          await AppHistoryEntry.create({
            userId: user.id,
            appName,
            date: today,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
          });
        }
      }

      socket.emit("appHistorySuccess", {
        message: "App history uploaded successfully",
      });
      await userReport(userId);
    } catch (error) {
      console.error("Error uploading app history:", error.message);
      socket.emit("appHistoryError", {
        message: "Failed to upload app history",
      });
    }
  });

  socket.on("getUserSettings", async () => {
    try {
      let userId = socket.user.userId;
      let user = await User.findOne({
        where: { id: userId },
        attributes: [
          "screen_capture_time",
          "broswer_capture_time",
          "app_capture_time",
        ],
      });
      if (!user) {
        socket.emit("userSettingsError", { message: "User not found" });
        return;
      }
      socket.emit("getUserSettings", { message: "User Setting Update", user });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      socket.emit("userSettingsError", {
        message: "Failed to fetch user settings",
      });
    }
  });

  socket.on("getStatus", async () => {
    try {
      let id = socket.user.userId;
      let user = await User.findByPk(id);
      if (!user) {
        socket.emit("statusError", { message: "User not found" });
        return;
      }
      socket.emit("statusUpdate", {
        userId: user.id,
        status: user.current_status,
      });
    } catch (error) {
      console.error("Error fetching user status:", error);
      socket.emit("statusError", { message: "Failed to fetch user status" });
    }
  });

  socket.on("uploadSystemConfig", async (data) => {
    try {
      let { user_id, fan_speed, rom, ram, memory } = data;
      if (!user_id || !fan_speed || !rom || !ram || !memory) {
        socket.emit("uploadSystemConfig", { message: "Invalid data" });
        return;
      }
      await System.create(data);
      socket.emit("uploadSystemConfig", {
        message: "System Configration updated Successfully",
      });
      io.to("Admin").emit("getSystemConfig", data);
    } catch (error) {
      console.error("Error fetching user status:", error);
      socket.emit("uploadSystemConfig", {
        message: "Failed to update system configration",
      });
    }
  });

  socket.on("getBlockedWebsites", async () => {
    try {      
      let userId = socket.user.userId;
      let user = await User.findOne({where: { id: userId }});
      if (!user) {
        socket.emit("getBlockedWebsites", { message: "User not found" });
        return;
      }
      let blockedWebsites = await BlockedWebsites.findByPk(user?.company_id)

      socket.emit("getBlockedWebsites", { message: "Blocked website", user });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      socket.emit("getBlockedWebsites", {
        message: "Failed to fetch user settings",
      });
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
  async updateUsers(io) {
    try {
      let users = await User.findAll();
      let totalUsers = users.length;
      let activeUsers = users.filter((user) => user.current_status == 1).length;
      let inactiveUsers = users.filter(
        (user) => user.current_status == 0
      ).length;

      io.to("Admin").emit("userCount", {
        totalUsers,
        activeUsers,
        inactiveUsers,
      });

      // socket.emit("userCount", { totalUsers, activeUsers, inactiveUsers });
    } catch (error) {
      console.error("Error updating users:", error.message);
    }
  },

  async updateAppsStats(io) {
    try {
      let today = new Date().toISOString().split("T")[0];

      let findAll = await AppHistoryEntry.findAll({
        where: { date: today },
      });
      // socket.emit("appUsageStats", findAll);
      io.to("Admin").emit("appUsageStats", findAll);
    } catch (error) {
      console.log("Error updating app stats:", error);
    }
  },

  async updateURLHostStats(io) {
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
      io.to("Admin").emit("urlHostUsageStats", urlStats);
      // socket.emit("urlHostUsageStats", urlStats);
    } catch (error) {
      console.error("Error updating URL host stats:", error.message);
    }
  },
};
