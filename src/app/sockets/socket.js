import { verifyToken } from "../../utils/validations/socketValidation.js";
import { Notification } from "../../database/models/Notification.js";
import { UserHistory } from "../../database/models/UserHistory.js";
import User from "../../database/models/userModel.js";
import AppHistoryEntry from "../../database/models/AppHistoryEntry.js";
import { ImageUpload } from "../../database/models/ImageUpload.js";
import { Op, Sequelize } from "sequelize";
import Model from "../../database/queries/dbConnection.js";
import { QueryTypes } from "@sequelize/core";
import TimeLog from "../../database/models/TimeLog.js";
import { Device } from "../../database/models/device.js";
import company from "../../database/models/companyModel.js";

const userData = async (id) => {
  let user = await User.findOne({ where: { id: id } });
  // socket.join("privateRoom_" + id);
  // console.log("privateRoom_" + id)
  // io.to(user.socket_id).socketsJoin("privateRoom");

  // let today;
  // if (data.date) {
  let today = new Date().toISOString().split("T")[0];
  // } else {
  //   today = new Date().toISOString().split("T")[0];
  // }

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
  return response;
};

const setupSocketIO = (io) => {
  // Middleware for Socket.IO authentication:
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

  // Connection event:
  io.on("connection", async (socket) => {
    let userData = await User.findOne({ where: { id: socket.user.userId } });
    if (userData) {
      userData.socket_id = socket.id; // Save socket id into user table
      await userData.save();
    }
    socket.join("Admin");
    if (socket.user.isAdmin) {
      console.log(`Admin ID ${socket.user.userId} connected `);
      handleAdminSocket(socket, io);
    } else {
      console.log(`User ID ${socket.user.userId} connected `);
      handleUserSocket(socket, io);
    }
  });

  return io;
};

// Admin specific handlers
const handleAdminSocket = async (socket, io) => {
  // socket.on("check", () => socket.emit("pong"));

  let result = await sendAdminNotifications(socket.user.userId);
  if (result.error) {
    socket.emit("newNotification", { message: result.error });
  } else {
    socket.emit("newNotification", { notificationCount: result });
  }

  let result1 = await getUserStats(io, socket);
  if (result.error) {
    socket.emit("getUserStats", { message: result.error });
  } else {
    socket.emit("getUserStats", { result1 });
  }

  socket.on("getSystemDetail", async (data) => {
    let result2 = await getSystemDetail(socket, data);
    if (result2.error) {
      socket.emit("getSystemDetail", { message: result2.error });
    } else {
      socket.emit("getSystemDetail", result2);
    }
  });

  socket.on("updatedSystemConfig", async () => {
    console.log("Data get successfully");
  });

  socket.on("getRecentNotifications", async (data) => {
    let result1 = await getRecentNotifications(data);
    if (result1.error) {
      socket.emit("getRecentNotifications", { message: result1.error });
    } else {
      socket.emit("getRecentNotifications", { notifications: result1 });
    }
  });

  socket.on("isRead", async (data) => {
    let result1 = await isRead(data, io);
    if (result1.error) {
      socket.emit("isRead", { message: result1.error });
    } else {
      socket.emit("isRead", { notifications: result1 });
    }
  });

  socket.on("getUserReport", async (data) => {
    let result1 = await getUserReport(data, io, socket);
    if (result1.error) {
      socket.emit("getUserReport", { message: result1.error });
    } else {
      socket.emit("getUserReport", result1);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Admin ID ${socket.user.userId} disconnected `);
  });
};

// // Admin specific function
const sendAdminNotifications = async (id) => {
  try {
    let user = await User.findOne({ where: { id } });
    if (!user) {
      return { error: "User not found" };
    }
    let result = await Notification.count({
      where: { is_read: 0, company_id: user?.company_id },
    });
    return result;
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return { error: "Failed to fetching admin notifications" };
  }
};

const getRecentNotifications = async (data) => {
  try {
    // const limit = parseInt(data.limit) || 5;
    // const page = parseInt(data.page) || 1;
    // const { date } = data;
    // const offset = (page - 1) * limit;
    // const whereCondition = {};
    // if (date) {
    //   whereCondition.date = date;
    // }

    // const notifications = await Notification.findAndCountAll({
    //   where: whereCondition,
    //   order: [["id", "DESC"]],
    //   limit,
    //   offset,
    // });
    const notifications = await Notification.findAndCountAll({
      where: { is_read: 0 },
      order: [["id", "DESC"]],
      limit: 5,
      // offset,
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching recent notifications:", error.message);
    return { error: "Failed to fetch recent notifications" };
  }
};

const isRead = async (data, io) => {
  try {
    let find = await Notification.findOne({ where: { id: data.id } });
    if (!find) {
      return { error: "notification not found" };
    } else {
      find.is_read = 1;
      await find.save();
      let notificationCount = await Notification.count({
        where: { is_read: 0, company_id: find.company_id },
      });
      io.emit("newNotification", { notificationCount });
      return true;
    }
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    return { error: "Error marking notification as read" };
  }
};

const getSystemDetail = async (socket, data) => {
  try {
    const limit = parseInt(data.limit) || 9;
    const page = parseInt(data.page) || 1;
    const { date } = data;
    const offset = (page - 1) * limit;
    const whereCondition = {};
    if (date) {
      whereCondition.date = date;
    }
    let systemDetail;
    if (data.id) {
      systemDetail = await Device.findAll({
        where: { companyId: socket.user.company_id, departmentId: data.id },
        order: [["id", "DESC"]],
        limit,
        offset,
      });
    } else {
      systemDetail = await Device.findAll({
        where: { companyId: socket.user.company_id },
        order: [["id", "DESC"]],
        limit,
        offset,
      });
    }
    return systemDetail;
  } catch (error) {
    console.error("Error getting system detail:", error.message);
    return { error: "Error getting system detail" };
  }
};

const getUserReport = async (data, io, socket) => {
  try {
    let user = await User.findOne({ where: { id: data.id } });
    socket.join("privateRoom_" + data.id);
    io.to(user.socket_id).socketsJoin("privateRoom");

    let today;
    if (data.date) {
      today = new Date(data.date).toISOString().split("T")[0];
    } else {
      today = new Date().toISOString().split("T")[0];
    }

    let web_query = `SELECT url , count(id) as visits FROM user_histories where date = "${today}" AND userId = ${data.id} GROUP by url`;
    let userHistories = await Model.query(web_query, {
      type: QueryTypes.SELECT,
    });

    let app_query = `SELECT appName , count(id) as visits FROM app_histories where date = "${today}" AND userId = ${data.id} GROUP by appName`;
    let appHistories = await Model.query(app_query, {
      type: QueryTypes.SELECT,
    });

    let image_query = `SELECT content FROM image_uploads where date = "${today}" AND userId = ${data.id}`;
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
    return response;
    // io.to("privateRoom").emit("userReport", response);
  } catch (error) {
    console.error("Error getting user report:", error.message);
    return { error: "Error getting user report" };
  }
};

const getUserStats = async (io, socket) => {
  try {
    await adminController.updateUsers(io, socket);
    await adminController.updateAppsStats(io);
    await adminController.updateURLHostStats(io);
  } catch (error) {
    console.log("Error fetching admin getuserstats:", error);
  }
};

// // AdminController (modularized)
export const adminController = {
  async updateUsers(io, socket) {
    try {
      let user_id = socket.user.userId;
      let user = await User.findByPk(user_id);
      let users = await User.findAll({
        where: { company_id: user.company_id, isAdmin: 0 },
      });
      let totalUsers = users.length;
      let activeUsers = users.filter((user) => user.currentStatus == 1).length;
      let inactiveUsers = users.filter(
        (user) => user.currentStatus == 0
      ).length;

      io.to("Admin").emit("userCount", {
        totalUsers,
        activeUsers,
        inactiveUsers,
      });
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

////////////////////////-------- USER SOCKET FUNCTION ------------/////////////////////////////////////

// User specific handlers:

const handleUserSocket = async (socket, io) => {
  socket.join(`privateRoom_${socket.user.userId}`);

  socket.on("newNotification", async (data) => {
    let notificationCount = await notifyAdmin(
      socket.user.userId,
      data.type,
      data.time,
      data.url
    );
    if (notificationCount.error) {
      socket.emit("newNotification", {
        message: "Failed to send notification",
      });
    } else {
      io.to("Admin").emit("newNotification", { notificationCount });
    }
  });

  socket.on("ping", async () => {
    socket.emit("pong");
  });

  let result2 = await getStatus(socket.user.userId);
  if (result2.error) {
    socket.emit("getStatus", { message: result2.error });
  } else {
    socket.emit("getStatus", result2);
  }

  let result3 = await getUserSettings(socket);
  if (result3.error) {
    socket.emit("getUserSettings", { message: result3.error });
  } else {
    socket.emit("getUserSettings", result3);
  }

  socket.on("uploadHistory", async (data) => {
    try {
      console.log("uploadHistory");

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

      let company_id = user?.company_id;

      await UserHistory.create({
        userId,
        date: today,
        url,
        title,
        company_id,
        visitTime: parsedVisitTime,
      });
      io.to(`privateRoom_${userId}`).emit(
        "getUserReport",
        await userData(userId)
      );
      socket.emit("historySuccess", {
        message: "History uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading history:", error.message);
      socket.emit("historyError", { message: "Failed to upload history" });
    }
  });

  socket.on("uploadImage", async (data) => {
    try {
      console.log("uploadImage");

      let today = new Date().toISOString().split("T")[0];
      let userId = socket.user.userId;

      let user = await User.findOne({ where: { id: userId } });
      if (!user) {
        socket.emit("imageError", { message: "Unauthorized access" });
        return;
      }
      let company_id = user?.company_id;

      if (!data.images || data.images.length === 0) {
        socket.emit("imageError", { message: "Invalid data" });
        return;
      }

      await Promise.all(
        data.images.map((image) =>
          ImageUpload.create({
            userId,
            date: today,
            company_id,
            content: `data:image/png;base64,${image.data}`,
          })
        )
      );
      io.to(`privateRoom_${userId}`).emit(
        "getUserReport",
        await userData(userId)
      );
      socket.emit("imageSuccess", { message: "Images uploaded successfully" });
      // userReport(userId);
    } catch (error) {
      console.log("Error uploading images:", error);
      socket.emit("imageError", { message: "Failed to upload images" });
    }
  });

  socket.on("uploadAppHistory", async (data) => {
    try {
      console.log("uploadAppHistory");

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
      let company_id = user?.company_id;

      for (let history of histories) {
        let { appName, startTime, endTime } = history;

        if (!appName || !startTime || !endTime) {
          continue;
        }

        let existingEntry = await AppHistoryEntry.findOne({
          where: {
            userId: user.id,
            company_id,
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
            company_id,
            date: today,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
          });
        }
      }
      io.to(`privateRoom_${userId}`).emit(
        "getUserReport",
        await userData(userId)
      );
      socket.emit("appHistorySuccess", {
        message: "App history uploaded successfully",
      });
      // await userReport(userId);
    } catch (error) {
      console.error("Error uploading app history:", error.message);
      socket.emit("appHistoryError", {
        message: "Failed to upload app history",
      });
    }
  });

  socket.on("disconnect", async () => {
    console.log(`User ID ${socket.user.userId} disconnected `);
  });
};

// User specific function:

const getStatus = async (userId) => {
  try {
    let user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return { error: "User not found" };
    }
    return {
      message: "User Status",
      userId: user.id,
      status: user.current_status,
    };
  } catch (error) {
    console.error("Error fetching User Status:", error);
    return { error: "Failed to fetch User Status" };
  }
};

const getUserSettings = async (socket) => {
  try {
    let user = await User.findOne({
      where: { id: socket.user.userId },
      attributes: [
        "screen_capture_time",
        "broswer_capture_time",
        "app_capture_time",
      ],
    });
    if (!user) {
      return { error: "User not found" };
    }
    
    let data = await company.findOne({
      where: { id: socket.user.company_id },
      attributes: ["screen_capture", "broswer_capture", "app_capture"],
    });
    user = {
      screen_capture_time: user.screen_capture_time,
      broswer_capture_time: user.broswer_capture_time,
      app_capture_time: user.app_capture_time,
      screen_capture: data.screen_capture,
      broswer_capture: data.broswer_capture,
      app_capture: data.app_capture,
    };

    return user;
  } catch (error) {
    console.error("Error fetching User Setting:", error);
    return { error: "Failed to fetch User Setting" };
  }
};

const notifyAdmin = async (id, type, time, url) => {
  try {
    let today = new Date().toISOString().split("T")[0];
    let user = await User.findOne({ where: { id } });
    if (!user) {
      return { error: "User not found" };
    }
    let company_id = user?.company_id;
    if (type == 1 || type == 2) {
      await Notification.create({
        userId: id,
        title: type == 1 ? "Login successful" : "Logout successful",
        company_id,
        date: today,
        message:
          type == 1
            ? `${user?.fullname} login successfully`
            : `${user?.fullname} logout successfully`,
      });
    } else if (type == 3) {
      if (!time) {
        return { error: "Invalid Data" };
      }
      await Notification.create({
        userId: id,
        title: "Idle Alert",
        message: `${user?.fullname} idle since ${time} minutes`,
        company_id,
        date: today,
      });
      let timeLog = await TimeLog.findOne({
        where: { user_id: id, date: today },
        order: [["createdAt", "DESC"]],
      });
      timeLog.idle_time = parseInt(timeLog.idle_time) + parseInt(time);
      timeLog.save();
    } else if (type == 4) {
      if (!url) {
        return { error: "Invalid Data" };
      }
      await Notification.create({
        userId: id,
        title: "Alert! Blocked Website",
        company_id,
        date: today,
        message: `${user?.fullname} attempted to access a blocked website ${url}`,
      });
    }
    let notificationCount = await Notification.count({
      where: { is_read: 0, company_id: user.company_id },
    });
    return notificationCount;
  } catch (error) {
    console.error("Error fetching Notification sent:", error);
    return { error: "Failed to fetch Notification sent" };
  }
};

export default setupSocketIO;
