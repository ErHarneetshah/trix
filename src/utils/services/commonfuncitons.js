import multer from "multer";
import uploadImage from "../file-upload.js";

async function uploadPhotos(req, res, folder, imageArr) {
  try {
    const storage = multer.memoryStorage();
    const upload = multer({ storage }).fields(imageArr);

    return new Promise((resolve, reject) => {
      upload(req, res, async (err) => {
        if (err) {
          return reject(err);
        }

        const imagePaths = [];

        for (const image of imageArr) {
          if (req.files && req.files[image.name]) {
            for (const file of req.files[image.name]) {
              const imagePath = await uploadImage(req, folder, file);
              if (imagePath) {
                imagePaths.push(imagePath);
              }
            }
          } else {
            return reject(`Field '${image.name}' is not found in request.`);
          }
        }
        resolve(imagePaths);
      });
    });
  } catch (error) {
    logger.info(error.message);
    throw new Error("Upload failed: " + error.message);
  }
}

const getNextMonthDate = () => {
  const today = new Date();
  // const today = new Date('Wed Jan 01 2025 00:00:00 GMT+0530');

  const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return nextMonthDate.toLocaleDateString("en-CA");
  // nextMonthDate.setHours(0, 0, 0, 0);
  // return nextMonthDate.toISOString().split("T")[0];
};

const getNextMondayDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilNextMonday = (8 - dayOfWeek) % 7;
  const nextMondayDate = new Date(today);
  nextMondayDate.setDate(today.getDate() + daysUntilNextMonday);
  return nextMondayDate.toISOString().split("T")[0];
};

const getTomorrowDate = () => {
  const today = new Date();
  const tomorrowDate = new Date(today);
  tomorrowDate.setDate(today.getDate() + 1);
  return tomorrowDate.toISOString().split("T")[0];
};

const createResponse = (inputData) => {
  return inputData.map((data) => {
    let productiveTime, totalTime, totalProductiveTime, nonProductiveTime, totalNonProductiveTime, activeTimeThreshold, idleTimeThreshold, isProductive, isSlacking;

    if (data.user.productivity.length != 0) {
      totalTime = data.user.productivity.reduce(
        (totals, item) => {
          const timeSpent = calculateTimeInSeconds(item.startTime, item.endTime).toString();
          const seconds = parseInt(timeSpent, 10);

          if (!isNaN(seconds)) {
            if (item.is_productive) {
              totals.productiveTime += seconds; // Add to productive total
            } else {
              totals.nonProductiveTime += seconds; // Add to non-productive total
            }
          }
          return totals;
        },
        { productiveTime: 0, nonProductiveTime: 0 } // Initial values for both totals
      );

      totalProductiveTime = totalTime.productiveTime;
      totalNonProductiveTime = totalTime.nonProductiveTime;

      const prodresult = convertSecondsToHMS(totalProductiveTime);
      const nonProdresult = convertSecondsToHMS(totalNonProductiveTime);

      let prodhours, prodminutes, prodseconds;
      let nonProdhours, nonProdminutes, nonProdseconds;

      //Productive
      if (prodresult == 0) {
        productiveTime = 0;
      } else {
        prodhours = prodresult.hours;
        prodminutes = prodresult.minutes;
        prodseconds = prodresult.seconds;

        productiveTime = `${prodhours}h ${prodminutes}m ${prodseconds}s`;
      }

      //Non productive
      if (nonProdresult == 0) {
        nonProductiveTime = 0;
      } else {
        nonProdhours = nonProdresult.hours;
        nonProdminutes = nonProdresult.minutes;
        nonProdseconds = nonProdresult.seconds;

        nonProductiveTime = `${nonProdhours}h ${nonProdminutes}m ${nonProdseconds}s`;
      }

      activeTimeThreshold = Math.floor((data.active_time + data.spare_time + data.idle_time) * 60 * 0.6);
      idleTimeThreshold = Math.floor((data.active_time + data.spare_time + data.idle_time) * 0.4);
      isProductive = totalProductiveTime >= activeTimeThreshold;
      isSlacking = data.idle_time >= idleTimeThreshold;
    } else {
      totalProductiveTime = 0;
      totalNonProductiveTime = 0;
      productiveTime = 0;
      nonProductiveTime = 0;

      activeTimeThreshold = Math.floor((data.active_time + data.spare_time + data.idle_time) * 60 * 0.6);
      idleTimeThreshold = Math.floor((data.active_time + data.spare_time + data.idle_time) * 0.4);
      isProductive = totalProductiveTime >= activeTimeThreshold;
      isSlacking = data.idle_time >= idleTimeThreshold;
    }

    const outputData = {
      // id: data.id,
      user_id: data.user_id,
      shift_id: data.shift_id,
      company_id: data.company_id,
      logged_in_time: data.logged_in_time,
      active_time: data.active_time,
      // late_coming_duration: data.late_coming_duration,
      logged_out_time: data.logged_out_time,
      early_going: data.early_going,
      late_coming: data.late_coming,
      // spare_time: data.spare_time,
      // idle_time: data.idle_time,
      // date: data.date,
      user: {
        id: data.user.id,
        fullname: data.user.fullname,
        currentStatus: data.user.currentStatus,
        productiveTime: productiveTime,
        nonProductiveTime: nonProductiveTime,
        is_productive: isProductive,
        is_slacking: isSlacking,
      },
      shift: data.shift,
    };

    return outputData;
  });
};

const createResponse2 = (inputData) => {
  return inputData.map((data) => {
    const totalProductiveTimeSeconds = parseInt(data?.total_productive_time_seconds, 10) || 0;
    const totalNonProductiveTimeSeconds = parseInt(data?.total_non_productive_time_seconds, 10) || 0;

    // Helper function to convert seconds to HH:MM:SS format
    const convertSecondsToHMS = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return { hours, minutes, seconds: secs };
    };

    // Formatting productive and non-productive time
    const formatTime = (hms) => {
      return `${hms.hours}h ${hms.minutes}m ${hms.seconds}s`;
    };

    const productiveTime = totalProductiveTimeSeconds > 0 ? formatTime(convertSecondsToHMS(totalProductiveTimeSeconds)) : "0h 0m 0s";

    const nonProductiveTime = totalNonProductiveTimeSeconds > 0 ? formatTime(convertSecondsToHMS(totalNonProductiveTimeSeconds)) : "0h 0m 0s";

    // Calculate thresholds
    const activeTime = data.active_time + data.spare_time + data.idle_time;
    const activeTimeThreshold = Math.floor(activeTime * 0.6);
    const idleTimeThreshold = Math.floor(activeTime * 0.4);

    let isProductive;
    let isSlacking;

    if (activeTimeThreshold != 0) {
      isProductive = totalProductiveTimeSeconds >= activeTimeThreshold;
      isSlacking = activeTime >= idleTimeThreshold;
    } else {
      isProductive = false;
      isSlacking = false;
    }
    // Constructing the response object
    return {
      user_id: data.userId,
      shift_id: data.shiftId,
      logged_in_time: data.logged_in_time,
      active_time: data.active_time,
      logged_out_time: data.logged_out_time,
      early_going: data.early_going,
      late_coming: data.late_coming,
      user: {
        id: data.userId,
        fullname: data.name,
        productiveTime: productiveTime,
        nonProductiveTime: nonProductiveTime,
        is_productive: isProductive,
        is_slacking: isSlacking,
      },
      shift:{
        start_time: data.startTime,
        end_time: data.endTime,
      }
    };
  });
};

const calculateTimeInSeconds = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.floor((end - start) / 1000); // Convert milliseconds to seconds
};

const convertSecondsToHMS = (totalSeconds) => {
  if (!totalSeconds || totalSeconds < 0) {
    return 0; // Handle invalid or negative input gracefully
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds }; // Return an object with the calculated values
};

export default { uploadPhotos, getNextMonthDate, getNextMondayDate, getTomorrowDate, createResponse, createResponse2, convertSecondsToHMS, calculateTimeInSeconds };
