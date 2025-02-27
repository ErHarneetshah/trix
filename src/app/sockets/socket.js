import { getShiftData, verifyToken } from "../../utils/validations/socketValidation.js";
import { Notification, sequelize } from "../../database/models/Notification.js";
import { UserHistory } from "../../database/models/UserHistory.js";
import User from "../../database/models/userModel.js";
import AppHistoryEntry from "../../database/models/AppHistoryEntry.js";
import { ImageUpload } from "../../database/models/ImageUpload.js";
import { Op, Sequelize } from "sequelize";
import Model from "../../database/queries/dbConnection.js";
import { QueryTypes } from "@sequelize/core";
import TimeLog from "../../database/models/timeLogsModel.js";
import { Device } from "../../database/models/device.js";
import company from "../../database/models/company.js";
import dbRelations from "../../database/queries/dbRelations.js";
import team from "../../database/models/teamModel.js";
import shift from "../../database/models/shiftModel.js";
import department from "../../database/models/departmentModel.js";
import designation from "../../database/models/designationModel.js";
import helper from "../../utils/services/helper.js";
import axios from "axios";
import bucketStorageController from "../controllers/admin/bucketStorageController.js";
import { bucketImageUpload } from "../../database/models/bucketImageModel.js";
import { BucketCredentialsModel } from "../../database/models/BucketCredentialModel.js";

const userData = async (id) => {
  let user = await User.findOne({
    where: { id: id },
    include: [
      {
        model: department,
        as: "department",
        attributes: ["name"],
      },
      {
        model: designation,
        as: "designation",
        attributes: ["name"],
      },
    ],
  });

  let today = new Date().toISOString().split("T")[0];

  let web_query = `SELECT url, createdAt, count(id) as visits FROM user_histories where date = "${today}" AND userId = ${id} GROUP by url`;
  let userHistories = await Model.query(web_query, {
    type: QueryTypes.SELECT,
  });

  let app_query = `SELECT appName, createdAt, count(id) as visits FROM app_histories where date = "${today}" AND userId = ${id} GROUP by appName`;
  let appHistories = await Model.query(app_query, {
    type: QueryTypes.SELECT,
  });

  // let image_query = `SELECT content FROM image_uploads where date = "${today}" AND userId = ${id}`;
  // let image = await Model.query(image_query, { type: QueryTypes.SELECT });
  let image = await retrieveBucketImagesSeparate(user.company_id, id, today);

  // Fetch productive and non-productive app data
  const productiveAndNonProductiveData = await singleUserProductiveAppAndNonproductiveApps(id, today);

  // Fetch productive and non-productive website data
  const productiveAndNonProductiveWebData = await singleUserProductiveWebsitesAndNonproductiveWebsites(id, today);

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
      productiveAndNonProductiveData: productiveAndNonProductiveData || [],
      productiveAndNonProductiveWebData: productiveAndNonProductiveWebData || [],
    },
  };
  return response;
};

const getUserScreenshots = async (data) => {
  let user = await User.findOne({
    where: { id: data.id },
  });

  if (!user) {
    return socket.emit("error", {
      message: "User not found",
    });
  }

  let date;
  if (!data.date || data.date.trim() === "") {
    const currentDate = new Date();
    date = currentDate.toISOString().split("T")[0];
  } else {
    date = data.date;
  }

  // ___________----------------------------------------------________________

  // const data = await ImageUpload.findAndCountAll({
  //   where: where,
  //   offset: offset,
  //   limit: limit,
  //   order: [["id", "DESC"]],
  //   attributes: ["content"],
  // });
  // if (!data) data = null;

  let image = await bucketStorageController.retrieveBucketImages(data.company_id, data.id, date, data.limit, data.page);
  console.log("Get User Screenshots: ", image)

  let response = {
    status: 1,
    message: "User Screenshots fetched successfully",
    image,
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

  io.on("connection", async (socket) => {
    socket.join(`Admin_${socket.user.company_id}`);
    if (socket.user.isAdmin) {
      let userData = await User.findOne({ where: { id: socket.user.userId } });
      userData.socket_id = socket.id;
      userData.currentStatus = 1;
      userData.save();
      handleAdminSocket(socket, io);
    } else {
      let today = new Date().toISOString().split("T")[0];

      let user = await User.findOne({ where: { id: socket.user.userId } });

      let now = new Date();
      let currentHours = now.getHours();
      let currentMinutes = now.getMinutes();
      let currentTotalMinutes = currentHours * 60 + currentMinutes;

      let shiftData = await getShiftData(user.teamId);

      let [shiftHours, shiftMinutes] = shiftData.start_time.split(":").map(Number);
      let [endHours, endMinutes] = shiftData.end_time.split(":").map(Number);

      let shiftStartTotalMinutes = shiftHours * 60 + shiftMinutes;
      let shiftEndTotalMinutes = endHours * 60 + endMinutes;

      if (shiftEndTotalMinutes < shiftStartTotalMinutes) {
        shiftEndTotalMinutes += 1440;
        if (currentTotalMinutes < shiftStartTotalMinutes) {
          currentTotalMinutes += 1440;
        }
      }

      let logicalShiftDate = now.getHours() >= shiftHours ? today : new Date(now - 86400000).toISOString().split("T")[0];

      let timeLog = await TimeLog.findOne({
        where: {
          user_id: user.id,
          date: logicalShiftDate,
          shift_id: shiftData.id,
        },
        order: [["createdAt", "DESC"]],
      });

      let lateComing = 0;
      let lateMinutes = 0;
      let lateComingDuration = "00:00";

      if (timeLog) {
        if (timeLog.logged_out_time != null) {
          const [logoutHours, logoutMinutes] = timeLog.logged_out_time.split(":").map(Number);
          let logoutTotalMinutes = logoutHours * 60 + logoutMinutes;

          if (logoutTotalMinutes < shiftStartTotalMinutes) {
            logoutTotalMinutes += 1440;
          }

          let spareMinutes = currentTotalMinutes - logoutTotalMinutes;
          timeLog.spare_time += parseInt(spareMinutes);
        }

        timeLog.logged_out_time = null;
        timeLog.early_going = 0;
        await timeLog.save();
      } else {
        if (currentTotalMinutes > shiftStartTotalMinutes) {
          lateMinutes = currentTotalMinutes - shiftStartTotalMinutes;
          lateComing = 1;
          lateComingDuration = `${Math.floor(lateMinutes / 60)
            .toString()
            .padStart(2, "0")}:${(lateMinutes % 60).toString().padStart(2, "0")}`;
        }

        let formattedHours = String(currentHours % 24).padStart(2, "0");
        let formattedMinutes = String(currentMinutes).padStart(2, "0");

        await TimeLog.create({
          user_id: user.id,
          shift_id: shiftData.id,
          company_id: user.company_id,
          logged_in_time: `${formattedHours}:${formattedMinutes}`,
          late_coming: lateComing,
          late_coming_duration: lateMinutes,
          spare_time: 0,
          active_time: 0,
          date: logicalShiftDate,
        });
      }

      user.socket_id = socket.id;
      user.currentStatus = 1;
      await user.save();

      handleUserSocket(socket, io);
    }
  });
  return io;
};

// Admin specific handlers
const handleAdminSocket = async (socket, io) => {
  socket.on("check", () => socket.emit("pong"));

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

  socket.on("getRecentNotifications", async (data) => {
    let result1 = await getRecentNotifications(data, socket);
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
  const adminRooms = {};

  socket.on("getUserReport", async (data) => {
    try {
      console.log("Emit Socket: ", data.id);
      const adminId = socket.userId;

      if (adminRooms[adminId]) {
        const previousRoom = adminRooms[adminId];
        socket.leave(previousRoom);
      }

      const newRoom = `privateRoom_${data.id}`;
      adminRooms[adminId] = newRoom;

      socket.join(newRoom);

      const socketsInRoom = await io.in(newRoom).fetchSockets();
      for (const clientSocket of socketsInRoom) {
        if (clientSocket.id !== socket.id) {
          clientSocket.leave(newRoom);
        }
      }
      const response = await getUserReport(data);
      io.to(newRoom).emit("getUserReport", response);
    } catch (error) {
      socket.emit("getUserReport", {
        message: "Failed to fetch user report for admin.",
      });
    }
  });

  socket.on("getUserScreenshots", async (data) => {
    try {
      const adminId = socket.userId;

      if (adminRooms[adminId]) {
        const previousRoom = adminRooms[adminId];
        socket.leave(previousRoom);
      }

      const newRoom = `privateRoom_${data.id}`;
      adminRooms[adminId] = newRoom;

      socket.join(newRoom);

      const socketsInRoom = await io.in(newRoom).fetchSockets();
      for (const clientSocket of socketsInRoom) {
        if (clientSocket.id !== socket.id) {
          clientSocket.leave(newRoom);
        }
      }
      console.log("Get User Screeshots Emit: ", data)
      const response = await getUserScreenshots(data);
      io.to(newRoom).emit("getUserScreenshots", response);
    } catch (error) {
      console.log({ error });

      socket.emit("getUserScreenshots", {
        message: "Failed to fetch user report for admin.",
      });
    }
  });

  socket.on("disconnect", async () => {
    let userData = await User.findOne({ where: { id: socket.user.userId } });
    userData.currentStatus = 0;
    userData.socket_id = null;
    await userData.save();
  });
};

// Admin specific function
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

const getRecentNotifications = async (data, socket) => {
  try {
    const notifications = await Notification.findAndCountAll({
      where: { is_read: 0, company_id: socket.user.company_id },
      order: [["id", "DESC"]],
      limit: 5,
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
    const whereCondition = { companyId: socket.user.company_id };

    if (data?.id) {
      whereCondition.departmentId = data.id;
    }
    if (data?.date) {
      whereCondition.date = data.date;
    }

    const page = data?.page || 1;
    const limit = data?.limit || 10;
    const offset = (page - 1) * limit;

    const totalCount = await Device.count({
      where: whereCondition,
      include: [
        {
          model: User,
          where: { currentStatus: 1 },
          required: true,
        },
      ],
    });

    const systemDetail = await Device.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          where: {
            currentStatus: 1,
          },
          attributes: ["id", "fullname"],
          required: true,
        },
      ],
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    return {
      totalCount,
      page,
      limit,
      data: systemDetail,
    };
  } catch (error) {
    console.error("Error getting system detail:", error.message);
    return { error: "Error getting system detail" };
  }
};

const getUserStats = async (io, socket) => {
  try {
    await adminController.updateUsers(io, socket);
    await adminController.updateAppsStats(io, socket);
    await adminController.updateURLHostStats(io, socket);
  } catch (error) {
    console.log("Error fetching admin getuserstats:", error);
  }
};

const getUserReport = async (data) => {
  try {
    // data = JSON.parse(data);
    console.log("Get User Report: ", data);
    console.log(".................................................................");

    let user = await User.findOne({
      where: { id: data.id, company_id: data.company_id },
      include: [
        {
          model: department,
          as: "department",
          attributes: ["name"],
        },
        {
          model: designation,
          as: "designation",
          attributes: ["name"],
        },
      ],
    });

    if (!user) {
      return {
        status: 0,
        message: "User not found",
        data: null,
      };
    }

    let today = data.date ? new Date(data.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

    // Fetch web history
    let web_query = `SELECT url, createdAt, count(id) as visits FROM user_histories WHERE date = "${today}" AND userId = ${data.id} GROUP BY url`;
    let userHistories = await Model.query(web_query, {
      type: QueryTypes.SELECT,
    });

    // Fetch app history
    let app_query = `SELECT appName, createdAt, count(id) as visits FROM app_histories WHERE date = "${today}" AND userId = ${data.id} GROUP BY appName`;
    let appHistories = await Model.query(app_query, {
      type: QueryTypes.SELECT,
    });

    // Fetch image uploads
    let image = await retrieveBucketImagesSeparate(data.company_id, data.id, today);
    console.log("Get User Report Image: ", image);

    // Fetch productive and non-productive app data
    const productiveAndNonProductiveData = await singleUserProductiveAppAndNonproductiveApps(data.id, today);

    // Fetch productive and non-productive website data
    const productiveAndNonProductiveWebData = await singleUserProductiveWebsitesAndNonproductiveWebsites(data.id, today);
    // Combine the response data
    return {
      status: 1,
      message: "User Report fetched successfully",
      data: {
        user,
        image,
        userHistories,
        appHistories,
        productiveAndNonProductiveData: productiveAndNonProductiveData || [],
        productiveAndNonProductiveWebData: productiveAndNonProductiveWebData || [],
      },
    };
  } catch (error) {
    console.error("Error getting user report:", error);
    return { status: 0, message: "Error getting user report", data: null };
  }
};

// APP Data Calculate:  ----->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const retrieveBucketImagesSeparate = async (company_id, user_id, date) => {
  try {
    console.log("Retrieve Bucket Image: ",{company_id, user_id, date})
    let getBucketCredentials = await BucketCredentialsModel.findOne({
      where: { company_id: company_id },
    });
    if (!getBucketCredentials) {
      getBucketCredentials = {
        host: process.env.LINODE_HOST,
        region: process.env.LINODE_REGION,
        access_key: process.env.LINODE_ACCESS_KEY,
        secret_key: process.env.LINODE_SECRET_KEY,
        bucket_name: process.env.LINODE_BUCKET_NAME,
      };
    }

    let keys = [];

    const imageRecords = await bucketImageUpload.findAll({
      where: { user_id: user_id, company_id: company_id, date: date },
      order: [["createdAt", "DESC"]],
    });

    console.log("imageRecords.length: ",imageRecords.length);

    for (const record of imageRecords) {
      keys.push({ host: getBucketCredentials.host, region: getBucketCredentials.region, bucket_name: getBucketCredentials.bucket_name, path: record.image_upload_path, dateTime: record.createdAt });
    }
    console.log("Keys: ",keys);
    return keys;
  } catch (error) {
    console.log("Error in Bucket Controller (retrieveBucketImages): ", error.message);
    return [];
  }
};

const singleUserProductiveAppAndNonproductiveApps = async (userId, date) => {
  try {
    if (!userId || !date) {
      console.error("userId and date are required.");
      return {
        success: false,
        message: "userId and date are required.",
        data: [],
      };
    }

    const nonProductiveAppsData = await singleUserNonProductiveAppData({
      userId,
      date,
    });
    const productiveAppsData = await singleUserProductiveAppData({
      userId,
      date,
    });

    if (!Array.isArray(nonProductiveAppsData) || !Array.isArray(productiveAppsData)) {
      console.error("Invalid data format.");
      return { success: false, message: "User was absent on this date or the entered date.", data: [] };
    }

    const [primaryData, secondaryData, primaryKey, secondaryKey] =
      nonProductiveAppsData.length >= productiveAppsData.length
        ? [nonProductiveAppsData, productiveAppsData, "non_productive_apps_total_time", "productive_apps_value"]
        : [productiveAppsData, nonProductiveAppsData, "productive_apps_value", "non_productive_apps_total_time"];

    const combinedData = primaryData.map((primaryItem) => {
      const matchingSecondaryItem = secondaryData.find((secondaryItem) => secondaryItem.name === primaryItem.name);
      return {
        period: primaryItem.name,
        [primaryKey]: parseFloat(primaryItem.value || "0.0"),
        [secondaryKey]: parseFloat(matchingSecondaryItem?.value || "0.0"),
      };
    });

    return combinedData;
  } catch (error) {
    console.error("Error in singleUserProductiveAppAndNonproductiveApps:", error);
    return { success: false, message: "Internal Server Error", data: [] };
  }
};

const singleUserNonProductiveAppData = async ({ userId, date }) => {
  try {
    if (!userId || !date) {
      console.error("userId and date are required.");
      return false;
    }

    const userInfo = await User.findOne({
      where: { id: userId },
    });
    if (!userInfo) {
      const message = "User does not exist.";
      return { success: false, message };
    }

    const query = `
      SELECT
          DATE_FORMAT(ah.startTime, '%H:00') AS hour,
          SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_duration
      FROM
          app_histories AS ah
      WHERE
          ah.appName NOT IN (
              SELECT appName
              FROM productive_apps
              WHERE company_id = :companyId and department_id=:department_id
          )
          AND DATE(ah.createdAt) = :date
          AND ah.userId = :userId
          AND ah.company_id = :companyId
      GROUP BY
          DATE_FORMAT(ah.startTime, '%H:00')
      ORDER BY
          hour;
    `;
    let companyId = userInfo.company_id;
    let department_id = userInfo.departmentId;
    const results = await Model.query(query, {
      replacements: { date, userId, companyId, department_id },
      type: Sequelize.QueryTypes.SELECT,
    });

    return results.map((result) => ({
      name: result.hour,
      value: result.total_duration ? parseFloat(result.total_duration) : 0,
    }));
  } catch (error) {
    console.error("Error fetching non-productive app data:", error.message);
    return false;
  }
};

const singleUserProductiveAppData = async ({ userId, date }) => {
  try {
    if (!userId || !date) {
      console.error("userId and date are required.");
      return false;
    }

    const userInfo = await User.findOne({
      where: { id: userId },
    });
    if (!userInfo) {
      console.error("User does not exist.");
      return false;
    }

    const query = `
      SELECT
          DATE_FORMAT(ah.startTime, '%H:00') AS hour,
          SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_duration
      FROM
          app_histories AS ah
      INNER JOIN
          productive_apps ap ON ap.app_name = ah.appName and ap.department_id=:department_id
      WHERE
          DATE(ah.createdAt) = :date
          AND ah.userId = :userId
          AND ah.company_id = :companyId
      GROUP BY
          DATE_FORMAT(ah.startTime, '%H:00')
      ORDER BY
          hour;
    `;
    let companyId = userInfo.company_id;
    let department_id = userInfo.departmentId;

    const results = await Model.query(query, {
      replacements: { date, userId, companyId, department_id },
      type: Sequelize.QueryTypes.SELECT,
    });

    return results.map((result) => ({
      name: result.hour,
      value: result.total_duration ? parseFloat(result.total_duration) : 0,
    }));
  } catch (error) {
    console.error("Error fetching productive app data:", error.message);
    return false;
  }
};

// Website data Calculate: ----->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const singleUserProductiveWebsitesAndNonproductiveWebsites = async (userId, date) => {
  try {
    const nonProductiveWebsitesData = await singleUserNonProductiveWebsiteData({
      userId,
      date,
    });

    const productiveWebsitesData = await singleUserProductiveWebsiteData({
      userId,
      date,
    });

    if (!Array.isArray(nonProductiveWebsitesData) || !Array.isArray(productiveWebsitesData)) {
      return { success: false, message: "User was absent on this date or the entered date", data: [] };
    }

    const [primaryData, secondaryData, primaryKey, secondaryKey] =
      nonProductiveWebsitesData.length >= productiveWebsitesData.length
        ? [nonProductiveWebsitesData, productiveWebsitesData, "non_productive_websites_total_time", "productive_websites_value"]
        : [productiveWebsitesData, nonProductiveWebsitesData, "productive_websites_value", "non_productive_websites_total_time"];

    const combinedData = primaryData.map((primaryItem) => {
      const matchingSecondaryItem = secondaryData.find((secondaryItem) => secondaryItem.name === primaryItem.name);
      return {
        period: primaryItem.name,
        [primaryKey]: parseFloat(primaryItem.value || "0.0"),
        [secondaryKey]: parseFloat(matchingSecondaryItem?.value || "0.0"),
      };
    });

    return combinedData;
  } catch (error) {
    console.error("Error in singleUserProductiveWebsitesAndNonproductiveWebsites:", error);
    return { success: false, message: "Internal Server Error", data: [] };
  }
};

const singleUserNonProductiveWebsiteData = async ({ userId, date }) => {
  try {
    if (!userId || !date) {
      const message = "userId and date are required.";
      return { success: false, message };
    }

    const userInfo = await User.findOne({
      where: { id: userId },
    });
    if (!userInfo) {
      const message = "User does not exist.";
      return { success: false, message };
    }

    const teamInfo = await team.findOne({
      where: {
        id: userInfo.teamId,
        status: 1,
        company_id: userInfo.company_id,
      },
    });
    if (!teamInfo) {
      const message = "Team is invalid or inactive.";
      return { success: false, message };
    }

    const shiftInfo = await shift.findOne({
      where: {
        id: teamInfo.shiftId,
        status: 1,
        company_id: userInfo.company_id,
      },
    });
    if (!shiftInfo) {
      const message = "Shift is invalid or inactive.";
      return { success: false, message };
    }

    const query = `
    SELECT 
    COUNT(uh.id) AS total_counts,
    DATE_FORMAT(uh.visitTime, '%H:00') AS hour 
    FROM user_histories AS uh 
    WHERE uh.website_name NOT IN (
      SELECT website_name FROM productive_websites WHERE company_id=:companyId and department_id=:department_id
    )
    AND uh.userId = :userId
    AND uh.company_id = :companyId
    AND DATE(uh.createdAt) = :date
    GROUP BY DATE_FORMAT(uh.visitTime, '%H:00') 
    ORDER BY hour;
    `;

    let companyId = userInfo.company_id;
    let department_id = userInfo.departmentId;

    const results = await Model.query(query, {
      replacements: { date, userId, companyId, department_id },
      type: Sequelize.QueryTypes.SELECT,
    });

    const pieChartData = results.map((result) => ({
      name: result.hour,
      value: result.total_counts ? parseInt(result.total_counts, 10) : 0,
    }));

    return pieChartData;
  } catch (error) {
    console.error("Error in singleUserNonProductiveWebsiteData:", error);
    return {
      success: false,
      message: "An error occurred while fetching data.",
    };
  }
};

const singleUserProductiveWebsiteData = async ({ userId, date }) => {
  try {
    if (!userId || !date) {
      const message = "userId and date are required.";
      return { success: false, message };
    }

    const userInfo = await User.findOne({
      where: { id: userId },
    });
    if (!userInfo) {
      const message = "User does not exist.";
      return { success: false, message };
    }

    const teamInfo = await team.findOne({
      where: {
        id: userInfo.teamId,
        status: 1,
        company_id: userInfo.company_id,
      },
    });
    if (!teamInfo) {
      const message = "Team is invalid or inactive.";
      return { success: false, message };
    }

    const shiftInfo = await shift.findOne({
      where: {
        id: teamInfo.shiftId,
        status: 1,
        company_id: userInfo.company_id,
      },
    });
    if (!shiftInfo) {
      const message = "Shift is invalid or inactive.";
      return { success: false, message };
    }

    const query = `
      SELECT 
        COUNT(uh.id) AS total_counts,
        DATE_FORMAT(uh.visitTime, '%H:00') AS hour 
      FROM user_histories AS uh 
      INNER JOIN productive_websites AS pw 
        ON pw.website_name = uh.website_name  and pw.department_id=:department_id
      WHERE 
        uh.userId = :userId 
        AND uh.company_id = :companyId 
        AND DATE(uh.createdAt) = :date 
      GROUP BY DATE_FORMAT(uh.visitTime, '%H:00') 
      ORDER BY hour;
    `;

    let department_id = userInfo.departmentId;
    let companyId = userInfo.company_id;
    const results = await Model.query(query, {
      replacements: { date, userId, companyId, department_id },
      type: Sequelize.QueryTypes.SELECT,
    });

    const pieChartData = results.map((result) => ({
      name: result.hour,
      value: result.total_counts ? parseInt(result.total_counts, 10) : 0,
    }));

    return pieChartData;
  } catch (error) {
    console.error("Error in singleUserProductiveWebsiteData:", error);
    return {
      success: false,
      message: "An error occurred while fetching data.",
    };
  }
};

// AdminController (modularized)
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
      let inactiveUsers = users.filter((user) => user.currentStatus == 0).length;

      io.to(`Admin_${socket.user.company_id}`).emit("userCount", {
        totalUsers,
        activeUsers,
        inactiveUsers,
      });
    } catch (error) {
      console.error("Error updating users:", error.message);
    }
  },

  async updateAppsStats(io, socket) {
    try {
      let today = new Date().toISOString().split("T")[0];

      let findAll = await AppHistoryEntry.findAll({
        where: { date: today },
      });
      io.to(`Admin_${socket.user.company_id}`).emit("appUsageStats", findAll);
    } catch (error) {
      console.log("Error updating app stats:", error);
    }
  },

  async updateURLHostStats(io, socket) {
    try {
      let today = new Date().toISOString().split("T")[0];
      let urlStats = await UserHistory.findAll({
        where: { date: today },
        attributes: [
          [Sequelize.fn("REGEXP_SUBSTR", Sequelize.col("url"), "^(?:https?:\\/\\/)?(?:[^@\\/\n]+@)?(?:www\\.)?([^:\\/?\n]+)"), "host"],
          [Sequelize.fn("COUNT", Sequelize.col("url")), "count"],
        ],
        group: ["host"],
        order: [[Sequelize.literal("count"), "DESC"]],
      });
      io.to(`Admin_${socket.user.company_id}`).emit("urlHostUsageStats", urlStats);
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
    let notificationCount = await notifyAdmin(socket.user.userId, data.type, data.time, data.url);
    if (notificationCount.error) {
      socket.emit("newNotification", {
        message: "Failed to send notification",
      });
    } else {
      io.to(`Admin_${socket.user.company_id}`).emit("newNotification", {
        notificationCount,
      });
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
      let parsedVisitTime = isNaN(new Date(visitTime)) ? new Date() : new Date(visitTime);

      let company_id = user?.company_id;

      await UserHistory.create({
        userId,
        date: today,
        url,
        title,
        company_id,
        visitTime: parsedVisitTime,
      });
      io.to(`privateRoom_${userId}`).emit("getUserReport", await userData(userId));
      socket.emit("historySuccess", {
        message: "History uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading history:", error.message);
      socket.emit("historyError", { message: "Failed to upload history" });
    }
  });

  //! Commented For Now By Harneet
  socket.on("uploadImage", async (data) => {
    try {
      let today = new Date().toISOString().split("T")[0];
      let userId = socket.user.userId;

      let user = await User.findOne({ where: { id: userId } });
      if (!user) {
        socket.emit("imageError", { message: "Unauthorized access" });
        return;
      }
      let company_id = user?.company_id;

      const req = {
        body: {
          user_id: userId,
          company_id: company_id,
          data,
        },
      };

      const res = {
        status: (code) => ({
          json: (data) => {
          },
        }),
      };
      await bucketStorageController.uploadBucketImage(req, res);

      io.to(`privateRoom_${userId}`).emit("getUserReport", await userData(userId));
      socket.emit("imageSuccess", { message: "Images uploaded successfully" });
    } catch (error) {
      console.log("Error uploading images:", error);
      socket.emit("imageError", { message: "Failed to upload images" });
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
      io.to(`privateRoom_${userId}`).emit("getUserReport", await userData(userId));
      socket.emit("appHistorySuccess", {
        message: "App history uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading app history:", error.message);
      socket.emit("appHistoryError", {
        message: "Failed to upload app history",
      });
    }
  });

  socket.on("disconnect", async () => {
    let userData = await User.findOne({ where: { id: socket.user.userId } });
    let time_data = await TimeLog.findOne({
      where: { user_id: socket.user.userId },
      order: [["createdAt", "DESC"]],
    });

    userData.currentStatus = 0;
    userData.socket_id = null;
    await userData.save();

    if (time_data) {
      let loggedOutTime = new Date();
      let logoutHours = loggedOutTime.getHours();
      let logoutMinutes = loggedOutTime.getMinutes();

      let logoutTimeInMinutes = logoutHours * 60 + logoutMinutes;

      let shiftData = await getShiftData(userData.teamId);
      let [endHours, endMinutes] = shiftData.end_time.split(":").map(Number);
      let [loginHours, loginMinutes] = time_data.logged_in_time.split(":").map(Number);
      // console.log({ time_data: time_data.logged_in_time });

      let shiftEndTimeInMinutes = endHours * 60 + endMinutes;
      let loginTimeInMinutes = loginHours * 60 + loginMinutes;

      if (shiftEndTimeInMinutes < loginTimeInMinutes) {
        shiftEndTimeInMinutes += 1440;
      }
      if (logoutTimeInMinutes < loginTimeInMinutes) {
        logoutTimeInMinutes += 1440;
      }

      let duration = logoutTimeInMinutes - loginTimeInMinutes;
      let activeTime = parseInt(duration) - parseInt(time_data.spare_time || 0) - parseInt(time_data.idle_time || 0);

      let earlyGoing = logoutTimeInMinutes < shiftEndTimeInMinutes ? 1 : 0;

      let adjustedLogoutHours = Math.floor(logoutTimeInMinutes / 60) % 24;
      let adjustedLogoutMinutes = logoutTimeInMinutes % 60;

      let formattedLogoutTime = `${String(adjustedLogoutHours).padStart(2, "0")}:${String(adjustedLogoutMinutes).padStart(2, "0")}`;

      await time_data.update({
        logged_out_time: formattedLogoutTime,
        active_time: activeTime,
        early_going: earlyGoing,
      });
    }
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
      attributes: ["screen_capture_time", "broswer_capture_time", "app_capture_time", "screen_capture", "broswer_capture", "app_capture"],
    });
    if (!user) {
      return { error: "User not found" };
    }

    // let data = await company.findOne({
    //   where: { id: socket.user.company_id },
    //   attributes: ["screen_capture", "broswer_capture", "app_capture"],
    // });
    // user = {
    //   screen_capture_time: user.screen_capture_time,
    //   broswer_capture_time: user.broswer_capture_time,
    //   app_capture_time: user.app_capture_time,
    //   screen_capture: data.screen_capture,
    //   broswer_capture: data.broswer_capture,
    //   app_capture: data.app_capture,
    // };

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
        message: type == 1 ? `${user?.fullname} login successfully` : `${user?.fullname} logout successfully`,
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
