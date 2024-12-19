import { Op, Sequelize } from "sequelize";
import User from "../../../../database/models/userModel.js";
import helper from "../../../../utils/services/helper.js";
import _ from 'lodash';
import variables from "../../../config/variableConfig.js";

import sequelize from "../../../../database/queries/dbConnection.js";
// import { format, startOfWeek, addDays, isAfter, startOfYear, addMonths, isThisYear, endOfMonth } from 'date-fns';


//helper function for getting the week days  

import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  addMonths
} from 'date-fns';
import team from "../../../../database/models/teamModel.js";
import shift from "../../../../database/models/shiftModel.js";

// Get weeks for a specific month
function getWeeksInMonth(year = '2024', month = '12') {
  try {
    const startOfMonthDate = new Date(year, month - 1, 1);
    const monthEnd = endOfMonth(startOfMonthDate);
    const weeks = [];
    let currentWeekStart = startOfWeek(startOfMonthDate, { weekStartsOn: 0 });

    while (currentWeekStart <= monthEnd) {
      const currentWeekEnd = addDays(currentWeekStart, 6);
      weeks.push({
        start: format(currentWeekStart, 'yyyy-MM-dd'),
        end: format(currentWeekEnd > monthEnd ? monthEnd : currentWeekEnd, 'yyyy-MM-dd'),
      });
      currentWeekStart = addDays(currentWeekStart, 7);
    }

    return weeks;
  } catch (error) {
    console.error('Error getting weeks in month:', error.message);
    return [];
  }
}

// Get full months in a year
function getYearMonths(yearType = 'current') {
  try {
    const today = new Date();
    const yearStart = yearType === 'last'
      ? startOfYear(new Date(today.getFullYear() - 1, 0, 1))
      : startOfYear(today);

    const yearMonths = [];
    for (let i = 0; i < 12; i++) {
      const currentMonth = addMonths(yearStart, i);

      if (yearType === 'current' && currentMonth > today) {
        break;
      }

      yearMonths.push({
        month: format(currentMonth, 'MMMM'),
        date: format(currentMonth, 'yyyy-MM'),
      });
    }

    return yearMonths;
  } catch (error) {
    console.error('Error getting months:', error.message);
    return [];
  }
}

// Get days for a specific week
function getWeekDays(weekType = 'current') {
  try {
    const today = new Date();
    const weekStart = weekType === 'current'
      ? startOfWeek(today, { weekStartsOn: 0 })
      : startOfWeek(addDays(today, -7), { weekStartsOn: 0 });

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(weekStart, i);
      if (weekType === 'current' && currentDay > today) break;

      weekDays.push({
        day: format(currentDay, 'EEEE'),
        date: format(currentDay, 'yyyy-MM-dd'),
      });
    }

    return weekDays;
  } catch (error) {
    console.error('Error getting week days:', error.message);
    return [];
  }
}

// Main function for productiveChart
const productiveChart = async (req, res) => {
  try {
    const { filterType, dateOption } = req.query; // `dateOption` to handle weekly/monthly options
    let queryParams = {};
    let dateInstances = [];

    // Weekly handling
    if (filterType === 'weekly') {
      dateInstances = getWeekDays(dateOption || 'last'); // 'current' or 'last'
      queryParams.filterType = filterType;

      // Monthly handling
    } else if (filterType === 'monthly') {
      if (dateOption === 'weeks') {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // Current month
        dateInstances = getWeeksInMonth(year, month);
      } else if (dateOption === 'months') {
        dateInstances = getYearMonths('current'); // Or 'last' for previous year
      } else {
        return res.status(400).json({ status: 'error', message: 'Invalid date option.' });
      }

    } else {
      return res.status(400).json({ status: 'error', message: 'Invalid filter type.' });
    }

    const valueArray = [];
    for (const item of dateInstances) {
      let query;
      if (filterType === 'weekly') {
        queryParams.date = item.date;
        query = `
                SELECT 
                  ah.appName, 
                  SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_time_seconds
                FROM 
                  app_histories AS ah
                INNER JOIN 
                  productive_apps AS ap 
                ON 
                  ap.app_name = ah.appName
                WHERE 
                  DATE(ah.createdAt) = :date
                GROUP BY 
                  ah.appName`;
      } else if (filterType === 'monthly' && dateOption === 'weeks') {
        queryParams.start = item.start;
        queryParams.end = item.end;
        query = `
                SELECT 
                  ah.appName, 
                  SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_time_seconds
                FROM 
                  app_histories AS ah
                INNER JOIN 
                  productive_apps AS ap 
                ON 
                  ap.app_name = ah.appName
                WHERE 
                  ah.createdAt BETWEEN :start AND :end
                GROUP BY 
                  ah.appName`;
      } else if (filterType === 'monthly' && dateOption === 'months') {
        const [year, month] = item.date.split('-');
        queryParams.month = month;
        queryParams.year = year;
        query = `
                SELECT 
                  ah.appName, 
                  SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_time_seconds
                FROM 
                  app_histories AS ah
                INNER JOIN 
                  productive_apps AS ap 
                ON 
                  ap.app_name = ah.appName
                WHERE 
                  MONTH(ah.createdAt) = :month
                  AND YEAR(ah.createdAt) = :year
                GROUP BY 
                  ah.appName`;
      }

      // Execute query
      const results = await sequelize.query(query, {
        replacements: queryParams,
        type: Sequelize.QueryTypes.SELECT,
      });

      valueArray.push({
        period: item.day || item.start || item.month,
        data: results,
      });
    }

    return res.json({ status: 'success', data: valueArray });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};



//*top application chart 
// const pieChartData = [
//   { name: "Team A", value: 24.9 },
//   { name: "Team B", value: 31.1 },
//   { name: "Team C", value: 7.3 },
//   { name: "Team D", value: 24.3 },
//   { name: "Team E", value: 12.4 },
//   ];
const topApplicationChart = async (req, res, next) => {
  const { filterType } = req.query;
  let dateCondition = "";

  if (filterType === "weekly") {
    dateCondition = "WHERE ah.createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
  } else if (filterType === "monthly") {
    dateCondition = "WHERE ah.createdAt >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
  }

  const query = `
    SELECT 
        ah.appName AS name,
        (COUNT(ah.id) * 100.0 / (SELECT COUNT(id) FROM app_histories ${dateCondition})) AS value
    FROM 
        app_histories AS ah
    ${dateCondition}
    GROUP BY 
        ah.appName;
  `;

  try {
    const results = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const pieChartData = results.map(result => ({
      name: result.name,
      value: result.value ? parseFloat(result.value).toFixed(1) : 0, // Ensure value is numeric
    }));

    return helper.success(res, variables.Success, "Top Application Chart Fetched Successfully", pieChartData);
  } catch (error) {
    return helper.failed(res, variables.badGateway, error.message);
  }
};

//*top websites chart 
// const pieChartData = [
//   { name: "Team A", value: 24.9 },
//   { name: "Team B", value: 31.1 },
//   { name: "Team C", value: 7.3 },
//   { name: "Team D", value: 24.3 },
//   { name: "Team E", value: 12.4 },
//   ];
const topWebsiteChart = async (req, res, next) => {
  const { filterType } = req.query;
  let dateCondition = "";

  if (filterType === "weekly") {
    dateCondition = "WHERE uh.createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
  } else if (filterType === "monthly") {
    dateCondition = "WHERE uh.createdAt >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
  }

  const query = `
    SELECT 
        uh.website_name AS name,
        (COUNT(uh.id) * 100.0 / (SELECT COUNT(id) FROM user_histories ${dateCondition})) AS value
    FROM 
        user_histories AS uh
    ${dateCondition}
    GROUP BY 
        uh.website_name;
  `;

  try {
    const results = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const pieChartData = results.map(result => ({
      name: result.name,
      value: result.value ? parseFloat(result.value).toFixed(1) : 0, // Ensure value is numeric
    }));

    return helper.success(res, variables.Success, "Top Websites Chart Fetched Successfully", pieChartData);
  } catch (error) {
    return helper.failed(res, variables.badGateway, error.message);
  }
};



// productive apps chart

const productiveAppsChart = async (req, res, next, type = 'api', obj = {}) => {
  try {
    let filterType, dateOption;
    if (type === 'api') {
      ({ filterType, dateOption } = req.query); // Destructure from req.query
    } else {
      ({ filterType, dateOption } = obj); // Destructure from obj
    }
    let queryParams = {};
    let dateInstances = [];

    if (filterType === 'weekly') {
      dateInstances = getWeekDays(dateOption || 'last'); // 'current' or 'last'

    } else if (filterType === 'monthly') {
      if (dateOption === 'weeks') {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        dateInstances = getWeeksInMonth(year, month);
      } else if (dateOption === 'months') {
        dateInstances = getYearMonths('current');
      } else {
        console.error('Error:', 'Invalid date option.');
        return (type == 'api') ? helper.failed(res, 400, 'Invalid date option.') : false;

        // return (type == 'api') ? res.status(400).json({ status: 'error', message: 'Invalid date option.' }) : false;
      }
    } else {
      console.error('Error:', 'Invalid filter type.');
      return (type == 'api') ? helper.failed(res, 400, 'Invalid filter type.') : false;

      // return (type == 'api') ? res.status(400).json({ status: 'error', message: 'Invalid filter type.' }) : false;
    }

    const valueArray = [];

    for (const item of dateInstances) {
      let query;
      if (filterType === 'weekly') {
        queryParams.date = item.date;
        query = `
          SELECT 
            COALESCE(SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)), 0) AS total_time_seconds
          FROM 
            app_histories AS ah
          INNER JOIN 
            productive_apps AS ap 
          ON 
            ap.app_name = ah.appName
          WHERE DATE(ah.createdAt) = :date
        `;
      } else if (filterType === 'monthly' && dateOption === 'weeks') {
        queryParams.start = item.start;
        queryParams.end = item.end;
        query = `
          SELECT 
            COALESCE(SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)), 0) AS total_time_seconds
          FROM 
            app_histories AS ah
          INNER JOIN 
            productive_apps AS ap 
          ON 
            ap.app_name = ah.appName
          WHERE DATE(ah.createdAt) BETWEEN :start AND :end
        `;
      } else if (filterType === 'monthly' && dateOption === 'months') {
        const [year, month] = item.date.split('-');
        queryParams.month = month;
        queryParams.year = year;
        query = `
          SELECT 
            COALESCE(SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)), 0) AS total_time_seconds
          FROM 
            app_histories AS ah
          INNER JOIN 
            productive_apps AS ap 
          ON 
            ap.app_name = ah.appName
          WHERE MONTH(ah.createdAt) = :month
          AND YEAR(ah.createdAt) = :year
        `;
      }

      const results = await sequelize.query(query, {
        replacements: queryParams,
        type: Sequelize.QueryTypes.SELECT,
      });

      valueArray.push({
        period: item.day || item.start || item.month,
        total_time_seconds: results[0]?.total_time_seconds || 0,
      });
    }

    const pieChartData = valueArray.map(result => ({
      period: result.period,
      total_time: parseFloat(result.total_time_seconds).toFixed(1),
    }));

    return (type == 'api') ? helper.success(res, variables.Success, "Productive Apps Data Fetched Successfully", pieChartData) : pieChartData;

  } catch (error) {
    console.error('Error:', error.message);
    return (type == 'api') ? helper.failed(res, 400, error.message) : false;

    // return res.status(500).json({ status: 'error', message: error.message });
  }
};

//productive website chart

const productiveWebsiteChart = async (req, res, next, type = 'api', obj = {}) => {
  try {
    let filterType, dateOption;

    if (type === 'api') {
      ({ filterType, dateOption } = req.query);
    } else {
      ({ filterType, dateOption } = obj);
    }
    let queryParams = {};
    let dateInstances = [];

    if (filterType === 'weekly') {
      dateInstances = getWeekDays(dateOption || 'last'); // 'current' or 'last'

    } else if (filterType === 'monthly') {
      if (dateOption === 'weeks') {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        dateInstances = getWeeksInMonth(year, month);
      } else if (dateOption === 'months') {
        dateInstances = getYearMonths('current');
      } else {
        return (type == 'api') ? helper.failed(res, 400, 'Invalid date option.') : false;

        // return res.status(400).json({ status: 'error', message: 'Invalid date option.' });
      }
    } else {
      return (type == 'api') ? helper.failed(res, 400, 'Invalid filter type.') : false;

      // return res.status(400).json({ status: 'error', message: 'Invalid filter type.' });
    }

    const valueArray = [];

    for (const item of dateInstances) {
      let query;
      if (filterType === 'weekly') {
        queryParams.date = item.date;
        query = `
        select COALESCE(count(id),0) as total_counts from user_histories as uh where uh.website_name in(select website_name from productive_websites) and DATE(uh.createdAt)=:date
        `;
      } else if (filterType === 'monthly' && dateOption === 'weeks') {
        queryParams.start = item.start;
        queryParams.end = item.end;
        query = `
        select COALESCE(count(id),0) as total_counts from user_histories as uh where uh.website_name in(select website_name from productive_websites) and DATE(uh.createdAt) BETWEEN :start AND :end
        `;
      } else if (filterType === 'monthly' && dateOption === 'months') {
        const [year, month] = item.date.split('-');
        queryParams.month = month;
        queryParams.year = year;
        query = `
        select COALESCE(count(id),0) as total_counts from user_histories as uh where uh.website_name in(select website_name from productive_websites) and MONTH(uh.createdAt)= :month
          AND YEAR(uh.createdAt) = :year
        `;
      }

      const results = await sequelize.query(query, {
        replacements: queryParams,
        type: Sequelize.QueryTypes.SELECT,
      });
      valueArray.push({
        period: item.day || item.start || item.month,
        total: results[0]?.total_counts || 0,
      });
    }
    const pieChartData = valueArray.map(result => ({
      period: result.period,
      total_time: parseFloat(result.total).toFixed(1), // Ensure value is numeric
    }));

    return (type == 'api') ? helper.success(res, variables.Success, "Productive Websites Data Fetched Successfully", pieChartData) : pieChartData;

    // return res.json({ status: 'success', pieChartData });

  } catch (error) {
    console.error('Error:', error.message);
    return (type == 'api') ? helper.failed(res, 400, error.message) : false;

  }
};


//non productive apps chart

const nonProductiveAppsChart = async (req, res, next, type = 'api', obj = {}) => {
  try {
    let filterType, dateOption;

    if (type === 'api') {
      ({ filterType, dateOption } = req.query); // Destructure from req.query
    } else {
      ({ filterType, dateOption } = obj); // Destructure from obj
    }
    let queryParams = {};
    let dateInstances = [];

    if (filterType === 'weekly') {
      dateInstances = getWeekDays(dateOption || 'last'); // 'current' or 'last'

    } else if (filterType === 'monthly') {
      if (dateOption === 'weeks') {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        dateInstances = getWeeksInMonth(year, month);
      } else if (dateOption === 'months') {
        dateInstances = getYearMonths('current');
      } else {
        return (type == 'api') ? helper.failed(res, 400, 'Invalid date option.') : false;

        // return res.status(400).json({ status: 'error', message: 'Invalid date option.' });
      }
    } else {
      return (type == 'api') ? helper.failed(res, 400, 'Invalid filter type.') : false;

      // return res.status(400).json({ status: 'error', message: 'Invalid filter type.' });
    }

    const valueArray = [];

    for (const item of dateInstances) {
      let query;
      if (filterType === 'weekly') {
        queryParams.date = item.date;
        query = `
        SELECT ah.appName, 
    COALESCE(SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)),0) AS total_time_seconds FROM app_histories as ah where appName not in(select app_name from productive_apps) and DATE(ah.createdAt) = :date`;
      } else if (filterType === 'monthly' && dateOption === 'weeks') {
        queryParams.start = item.start;
        queryParams.end = item.end;
        query = `
        SELECT ah.appName, 
        COALESCE(SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)),0) AS total_time_seconds FROM app_histories as ah where appName not in(select app_name from productive_apps) and DATE(ah.createdAt) BETWEEN :start AND :end`;
      } else if (filterType === 'monthly' && dateOption === 'months') {
        const [year, month] = item.date.split('-');
        queryParams.month = month;
        queryParams.year = year;
        query = `
        SELECT ah.appName, 
        COALESCE(SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)),0) AS total_time_seconds FROM app_histories as ah where appName not in(select app_name from productive_apps) and MONTH(ah.createdAt) = :month
          AND YEAR(ah.createdAt) = :year
        `;
      }

      // Execute the query and store the result
      const results = await sequelize.query(query, {
        replacements: queryParams,
        type: Sequelize.QueryTypes.SELECT,
      });

      // Push the result into the value array
      valueArray.push({
        period: item.day || item.start || item.month,
        total_time_seconds: results[0]?.total_time_seconds || 0,
      });
    }

    // Map the results to match the desired pie chart data format
    const pieChartData = valueArray.map(result => ({
      period: result.period,
      total_time: parseFloat(result.total_time_seconds).toFixed(1), // Ensure value is numeric
    }));

    // return res.json({ status: 'success', pieChartData });
    return (type == 'api') ? helper.success(res, variables.Success, "Non Productive Apps Data Fetched Successfully", pieChartData) : pieChartData;


  } catch (error) {
    console.error('Error:', error.message);
    return (type == 'api') ? helper.failed(res, 400, error.message) : false;

    // return res.status(500).json({ status: 'error', message: error.message });
  }
};


//non productive website chart

const NonProductiveWebsiteChart = async (req, res, next, type = 'api', obj = {}) => {
  try {
    let filterType, dateOption;

    if (type === 'api') {
      ({ filterType, dateOption } = req.query); // Destructure from req.query
    } else {
      ({ filterType, dateOption } = obj); // Destructure from obj
    }
    let queryParams = {};
    let dateInstances = [];

    if (filterType === 'weekly') {
      dateInstances = getWeekDays(dateOption || 'last'); // 'current' or 'last'

    } else if (filterType === 'monthly') {
      if (dateOption === 'weeks') {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        dateInstances = getWeeksInMonth(year, month);
      } else if (dateOption === 'months') {
        dateInstances = getYearMonths('current');
      } else {
        return (type == 'api') ? helper.failed(res, 400, 'Invalid date option.') : false;

        // return res.status(400).json({ status: 'error', message: 'Invalid date option.' });
      }
    } else {
      return (type == 'api') ? helper.failed(res, 400, 'Invalid filter type.') : false;

      // return res.status(400).json({ status: 'error', message: 'Invalid filter type.' });
    }

    const valueArray = [];

    for (const item of dateInstances) {
      let query;
      if (filterType === 'weekly') {
        queryParams.date = item.date;
        query = `SELECT count(uh.id) as total_counts FROM user_histories as uh where website_name not in(select website_name from productive_websites) and DATE(uh.createdAt)=:date
        `;
      } else if (filterType === 'monthly' && dateOption === 'weeks') {
        queryParams.start = item.start;
        queryParams.end = item.end;
        query = `SELECT count(uh.id) as total_counts FROM user_histories as uh where website_name not in(select website_name from productive_websites) and DATE(uh.createdAt) BETWEEN :start AND :end
        `;
      } else if (filterType === 'monthly' && dateOption === 'months') {
        const [year, month] = item.date.split('-');
        queryParams.month = month;
        queryParams.year = year;
        query = `SELECT count(uh.id) as total_counts FROM user_histories as uh where website_name not in(select website_name from productive_websites) and MONTH(uh.createdAt)= :month
          AND YEAR(uh.createdAt) = :year
        `;
      }

      const results = await sequelize.query(query, {
        replacements: queryParams,
        type: Sequelize.QueryTypes.SELECT,
      });
      valueArray.push({
        period: item.day || item.start || item.month,
        total: results[0]?.total_counts || 0,
      });
    }
    const pieChartData = valueArray.map(result => ({
      period: result.period,
      total_time: parseFloat(result.total).toFixed(1), // Ensure value is numeric
    }));

    return (type == 'api') ? helper.success(res, variables.Success, "Productive Websites Data Fetched Successfully", pieChartData) : pieChartData;

    // return res.json({ status: 'success', pieChartData });

  } catch (error) {
    console.error('Error:', error.message);
    return (type == 'api') ? helper.failed(res, 400, error.message) : false;

    // return res.status(500).json({ status: 'error', message: error.message });
  }
};



//function for productive apps and productive websites chart
// const productiveAppsAndproductiveWebsites = async (req, res, next) => {
//   try {
//     const { filterType, dateOption } = req.query;

//     const productiveAppsData = await productiveAppsChart('', '', '', 'function', { filterType, dateOption });
//     const productiveWebsiteData = await productiveWebsiteChart('', '', '', 'function', { filterType, dateOption });
//     console.log(productiveAppsData);
//     console.log(productiveWebsiteData);

//     if (!Array.isArray(productiveAppsData) || !Array.isArray(productiveWebsiteData)) {
//       return helper.failed(res, 400, "Invalid data format", []);
//     }

//     const combinedData = productiveAppsData.map(item1 => {
//       const item2 = productiveWebsiteData.find(item => item.period === item1.period); // Match by period
//       return {
//         period: item1.period,
//         productive_apps_total_time: parseFloat(item1.total_time || '0.0'),
//         productive_websites_total_time: parseFloat(item2?.total_time || '0.0')
//       };
//     });

//     // Success response
//     return helper.success(res, variables.Success, "Data Fetched Successfully", combinedData);
//   } catch (error) {
//     console.error("Error in productiveAppsAndproductiveWebsites:", error);
//     return helper.failed(res, 500, "Internal Server Error", []);
//   }
// };

const productiveAppsAndproductiveWebsites = async (req, res, next) => {
  try {
    const { filterType, dateOption } = req.query;

    // Fetch data for productive apps and websites
    const productiveAppsData = await productiveAppsChart('', '', '', 'function', { filterType, dateOption });
    const productiveWebsiteData = await productiveWebsiteChart('', '', '', 'function', { filterType, dateOption });

    console.log(productiveAppsData);
    console.log(productiveWebsiteData);

    // Validate data format
    if (!Array.isArray(productiveAppsData) || !Array.isArray(productiveWebsiteData)) {
      return helper.failed(res, 400, "Invalid data format", []);
    }

    // Determine which dataset is larger and iterate over it
    const [primaryData, secondaryData, primaryKey, secondaryKey] =
      productiveAppsData.length >= productiveWebsiteData.length
        ? [productiveAppsData, productiveWebsiteData, 'productive_apps_total_time', 'productive_websites_total_time']
        : [productiveWebsiteData, productiveAppsData, 'productive_websites_total_time', 'productive_apps_total_time'];

    // Combine data based on the larger dataset
    const combinedData = primaryData.map(primaryItem => {
      const matchingSecondaryItem = secondaryData.find(
        secondaryItem => secondaryItem.period === primaryItem.period // Match by period
      );
      return {
        period: primaryItem.period,
        [primaryKey]: parseFloat(primaryItem.total_time || '0.0'),
        [secondaryKey]: parseFloat(matchingSecondaryItem?.total_time || '0.0'),
      };
    });

    // Success response
    return helper.success(res, variables.Success, "Data Fetched Successfully", combinedData);
  } catch (error) {
    console.error("Error in productiveAppsAndproductiveWebsites:", error);
    return helper.failed(res, 500, "Internal Server Error", []);
  }
};


//function for productive apps and productive websites chart
//browser history 
const productiveWebsiteAndNonproductiveWebsites = async (req, res, next) => {
  try {
    const { filterType, dateOption } = req.query;

    // Fetch data for non-productive and productive websites
    const nonProductiveWebsitesData = await NonProductiveWebsiteChart('', '', '', 'function', { filterType, dateOption });
    const productiveWebsiteData = await productiveWebsiteChart('', '', '', 'function', { filterType, dateOption });

    // Validate data format
    if (!Array.isArray(nonProductiveWebsitesData) || !Array.isArray(productiveWebsiteData)) {
      return helper.failed(res, 400, "Invalid data format", []);
    }

    // Determine which dataset is larger and iterate over it
    const [primaryData, secondaryData, primaryKey, secondaryKey] =
      nonProductiveWebsitesData.length >= productiveWebsiteData.length
        ? [nonProductiveWebsitesData, productiveWebsiteData, 'non_productive_websites_total_time', 'productive_websites_total_time']
        : [productiveWebsiteData, nonProductiveWebsitesData, 'productive_websites_total_time', 'non_productive_websites_total_time'];

    // Combine data based on the larger dataset
    const combinedData = primaryData.map(primaryItem => {
      const matchingSecondaryItem = secondaryData.find(
        secondaryItem => secondaryItem.period === primaryItem.period // Match by period
      );
      return {
        period: primaryItem.period,
        [primaryKey]: parseFloat(primaryItem.total_time || '0.0'),
        [secondaryKey]: parseFloat(matchingSecondaryItem?.total_time || '0.0'),
      };
    });

    // Success response
    return helper.success(res, variables.Success, "Data Fetched Successfully", combinedData);
  } catch (error) {
    console.error("Error in productiveWebsiteAndNonproductiveWebsites:", error);
    return helper.failed(res, 500, "Internal Server Error", []);
  }
};



//function for productive apps and non productive apps chart
const productiveAppAndNonproductiveApps = async (req, res, next) => {
  try {
    const { filterType, dateOption } = req.query;

    // Fetch data for non-productive and productive apps
    const nonProductiveAppsData = await nonProductiveAppsChart('', '', '', 'function', { filterType, dateOption });
    const productiveAppsData = await productiveAppsChart('', '', '', 'function', { filterType, dateOption });

    // Validate data format
    if (!Array.isArray(nonProductiveAppsData) || !Array.isArray(productiveAppsData)) {
      return helper.failed(res, 400, "Invalid data format", []);
    }

    // Determine which dataset is larger and iterate over it
    const [primaryData, secondaryData, primaryKey, secondaryKey] =
      nonProductiveAppsData.length >= productiveAppsData.length
        ? [nonProductiveAppsData, productiveAppsData, 'non_productive_apps_total_time', 'productive_apps_total_time']
        : [productiveAppsData, nonProductiveAppsData, 'productive_apps_total_time', 'non_productive_apps_total_time'];

    // Combine data based on the larger dataset
    const combinedData = primaryData.map(primaryItem => {
      const matchingSecondaryItem = secondaryData.find(
        secondaryItem => secondaryItem.period === primaryItem.period // Match by period
      );
      return {
        period: primaryItem.period,
        [primaryKey]: parseFloat(primaryItem.total_time || '0.0'),
        [secondaryKey]: parseFloat(matchingSecondaryItem?.total_time || '0.0'),
      };
    });

    // Success response
    return helper.success(res, variables.Success, "Data Fetched Successfully", combinedData);
  } catch (error) {
    console.error("Error in productiveAppAndNonproductiveApps:", error);
    return helper.failed(res, 500, "Internal Server Error", []);
  }
};



//helper function for transform data
const transformData = (response, name) => {
  return {
    name: name,
    data: response.map((item) => parseFloat(item.total_time)),
  };
};
//function for activity type trends

const activityData = async (req, res, next) => {
  try {
    const { filterType, dateOption } = req.query;




    const productiveAppsData = await productiveAppsChart('', '', '', 'function', { filterType, dateOption });
    const productiveWebsiteData = await productiveWebsiteChart('', '', '', 'function', { filterType, dateOption });
    const nonProductiveAppsData = await nonProductiveAppsChart('', '', '', 'function', { filterType, dateOption });
    const nonProductiveWebsiteData = await NonProductiveWebsiteChart('', '', '', 'function', { filterType, dateOption });

    const periods = productiveAppsData.map((item) => item.period);
    // Transform data for seriesData
    const seriesData = [
      transformData(productiveAppsData, "Productive Apps Data"),
      transformData(productiveWebsiteData, "Productive Website Data"),
      transformData(nonProductiveAppsData, "Non-Productive Apps Data"),
      transformData(nonProductiveWebsiteData, "Non-Productive Website Data"),
    ];

    // return { periods, seriesData };

    // Success response
    return helper.success(res, variables.Success, "Data Fetched Successfully", { periods, seriesData });
  } catch (error) {
    console.error("Error in productiveAppsAndproductiveapps:", error);
    return helper.failed(res, 500, "Internal Server Error", []);
  }
};






//tested(helper function)
const singleUserProductiveAppData = async (req, res, next, type = 'api', obj = {}) => {
  try {
    const { userId, date } = type === 'api' ? req.query : obj;
    const { company_id, departmentId } = type === 'api' ? req.user : obj;
    if (!userId || !date) {
      const message = "userId and date are required.";
      return type === 'api' ? helper.failed(res, 400, message) : false;
    }

    const userInfo = await User.findOne({ where: { id: userId, company_id: company_id } });
    if (!userInfo) {
      const message = "User does not exist.";
      return type === 'api' ? helper.failed(res, 404, message) : false;
    }

    // Fetch team information
    const teamInfo = await team.findOne({
      where: { id: userInfo.teamId, status: 1, company_id: company_id },
    });
    if (!teamInfo) {
      const message = "Team is invalid or inactive.";
      return type === 'api' ? helper.failed(res, 404, message) : false;
    }

    // Fetch shift information
    const shiftInfo = await shift.findOne({
      where: { id: teamInfo.shiftId, status: 1, company_id: company_id },
    });
    if (!shiftInfo) {
      const message = "Shift is invalid or inactive.";
      return type === 'api' ? helper.failed(res, 404, message) : false;
    }

    // SQL query to fetch productive app data grouped by hour
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
          AND ah.company_id = :company_id
      GROUP BY
          DATE_FORMAT(ah.startTime, '%H:00')
      ORDER BY
          hour;
    `;

    // Execute query with replacements
    const results = await sequelize.query(query, {
      replacements: { date, userId, company_id, department_id: departmentId },
      type: Sequelize.QueryTypes.SELECT,
    });

    // Format results for pie chart data
    const pieChartData = results.map((result) => ({
      name: result.hour,
      value: result.total_duration ? parseFloat((result.total_duration)) : 0, // Convert seconds to hours
    }));

    // Return success response
    const successMessage = "Productive app data fetched successfully.";
    return type === 'api'
      ? helper.success(res, variables.Success, successMessage, pieChartData)
      : pieChartData;
  } catch (error) {
    // Log error and return failure response
    console.error("Error fetching productive app data:", error.message);
    return type === 'api'
      ? helper.failed(res, 500, error.message)
      : false;
  }
};

//tested(helper function)
const singleUserNonProductiveAppData = async (req, res, next, type = 'api', obj = {}) => {
  try {
    // Extract `userId` and `date` based on the type of request
    console.log(req.user);
    const { userId, date } = type === 'api' ? req.query : obj;
    const { company_id, departmentId } = type === 'api' ? req.user : obj;

    // Validate required parameters
    if (!userId || !date) {
      const message = "userId and date are required.";
      return type === 'api' ? helper.failed(res, 400, message) : false;
    }

    // Fetch user information
    const userInfo = await User.findOne({ where: { id: userId, company_id: company_id } });
    if (!userInfo) {
      const message = "User does not exist.";
      return type === 'api' ? helper.failed(res, 404, message) : false;
    }

    // Fetch team information
    const teamInfo = await team.findOne({
      where: { id: userInfo.teamId, status: 1, company_id: company_id },
    });
    if (!teamInfo) {
      const message = "Team is invalid or inactive.";
      return type === 'api' ? helper.failed(res, 404, message) : false;
    }

    // Fetch shift information
    const shiftInfo = await shift.findOne({
      where: { id: teamInfo.shiftId, status: 1, company_id: company_id },
    });
    if (!shiftInfo) {
      const message = "Shift is invalid or inactive.";
      return type === 'api' ? helper.failed(res, 404, message) : false;
    }

    // SQL query to fetch productive app data grouped by hour
    const query = `
    SELECT
    DATE_FORMAT(ah.startTime, '%H:00') AS hour,
    SUM(TIMESTAMPDIFF(SECOND, ah.startTime, ah.endTime)) AS total_duration
FROM
    app_histories AS ah
WHERE
    ah.appName NOT IN (
        SELECT app_name
        FROM productive_apps
        WHERE company_id = :company_id and department_id=:department_id
    )
 AND date(createdAt)=:date
    AND ah.userId = 2
    AND ah.company_id = :company_id
GROUP BY
    DATE_FORMAT(ah.startTime, '%H:00')
ORDER BY
    hour;
    `;

    // Execute query with replacements
    const results = await sequelize.query(query, {
      replacements: { date, userId, company_id, department_id: departmentId },
      type: Sequelize.QueryTypes.SELECT,
    });

    // Format results for pie chart data
    const pieChartData = results.map((result) => ({
      name: result.hour,
      value: result.total_duration ? parseFloat((result.total_duration)) : 0, // Convert seconds to hours
    }));

    // Return success response
    const successMessage = "Non Productive app data fetched successfully.";
    return type === 'api'
      ? helper.success(res, variables.Success, successMessage, pieChartData)
      : pieChartData;
  } catch (error) {
    // Log error and return failure response
    console.error("Error fetching non productive app data:", error.message);
    return type === 'api'
      ? helper.failed(res, 500, error.message)
      : false;
  }
};


//tested(helper function)
const singleUserProductiveWebsiteData = async (req, res, next, type = 'api', obj = {}) => {
  try {
    const { userId, date } = type === 'api' ? req.query : obj;
    const { company_id, departmentId } = type === 'api' ? req.user : obj;
    // Validate required parameters
    if (!userId || !date) {
      const message = "userId and date are required.";
      return type === 'api' ? helper.failed(res, 400, message) : false;
    }

    // Fetch user information
    const userInfo = await User.findOne({ where: { id: userId, company_id: company_id } });
    if (!userInfo) {
      const message = "User does not exist.";
      return type === 'api' ? helper.failed(res, 404, message) : false;
    }

    // Fetch team information
    const teamInfo = await team.findOne({
      where: { id: userInfo.teamId, status: 1, company_id: company_id },
    });
    if (!teamInfo) {
      const message = "Team is invalid or inactive.";
      return type === 'api' ? helper.failed(res, 404, message) : false;
    }

    // Fetch shift information
    const shiftInfo = await shift.findOne({
      where: { id: teamInfo.shiftId, status: 1, company_id: company_id },
    });
    if (!shiftInfo) {
      const message = "Shift is invalid or inactive.";
      return type === 'api' ? helper.failed(res, 404, message) : false;
    }

    // SQL query to fetch productive website data grouped by hour
    const query = `
      SELECT 
        COUNT(uh.id) AS total_counts,
        DATE_FORMAT(uh.visitTime, '%H:00') AS hour 
      FROM user_histories AS uh 
      INNER JOIN productive_websites AS pw 
        ON pw.website_name = uh.website_name and pw.department_id=:department_id
      WHERE 
        uh.userId = :userId 
        AND uh.company_id = :company_id 
        AND DATE(uh.createdAt) = :date 
      GROUP BY DATE_FORMAT(uh.visitTime, '%H:00') 
      ORDER BY hour;
    `;

    // Execute query with replacements
    const results = await sequelize.query(query, {
      replacements: { date, userId, company_id, department_id: departmentId },
      type: Sequelize.QueryTypes.SELECT,
    });

    // Format results for pie chart data
    const pieChartData = results.map((result) => ({
      name: result.hour,
      value: result.total_counts ? parseInt(result.total_counts, 10) : 0,
    }));

    // Return success response
    const successMessage = "Productive website data fetched successfully.";
    return type === 'api'
      ? helper.success(res, variables.Success, successMessage, pieChartData)
      : pieChartData;
  } catch (error) {
    // Log error with context
    console.error("Error fetching productive website data:", {
      message: error.message,
    });
    return type === 'api'
      ? helper.failed(res, 500, error.message)
      : false;
  }
};


// tested(helper function)
const singleUserNonProductiveWebsiteData = async (req, res, next, type = 'api', obj = {}) => {
  try {
    const { userId, date } = type === 'api' ? req.query : obj;
    const { company_id, departmentId } = type === 'api' ? req.user : obj;

    if (!userId || !date) {
      const message = "userId and date are required.";
      return type === 'api' ? helper.failed(res, 400, message) : false;
    }

    // Fetch user information
    const userInfo = await User.findOne({ where: { id: userId, company_id: company_id } });
    if (!userInfo) {
      const message = "User does not exist.";
      return type === 'api' ? helper.failed(res, 404, message) : false;
    }

    // Fetch team information
    const teamInfo = await team.findOne({
      where: { id: userInfo.teamId, status: 1, company_id: company_id },
    });
    if (!teamInfo) {
      const message = "Team is invalid or inactive.";
      return type === 'api' ? helper.failed(res, 404, message) : false;
    }

    // Fetch shift information
    const shiftInfo = await shift.findOne({
      where: { id: teamInfo.shiftId, status: 1, company_id: company_id },
    });
    if (!shiftInfo) {
      const message = "Shift is invalid or inactive.";
      return type === 'api' ? helper.failed(res, 404, message) : false;
    }

    const query = `
    SELECT 
    COUNT(uh.id) AS total_counts,
    DATE_FORMAT(uh.visitTime, '%H:00') AS hour 
  FROM user_histories AS uh 
   
  WHERE uh.website_name not in(select website_name from productive_websites where company_id=:company_id and department_id=:department_id) and
    uh.userId = :userId
    AND uh.company_id = :company_id
    AND DATE(uh.createdAt) = :date
  GROUP BY DATE_FORMAT(uh.visitTime, '%H:00') 
  ORDER BY hour;
    `;

    // Execute query with replacements
    const results = await sequelize.query(query, {
      replacements: { date, userId, company_id, department_id: departmentId },
      type: Sequelize.QueryTypes.SELECT,
      logging: console.log
    });

    // Format results for pie chart data
    const pieChartData = results.map((result) => ({
      name: result.hour,
      value: result.total_counts ? parseInt(result.total_counts, 10) : 0,
    }));

    // Return success response
    const successMessage = "Non Productive website data fetched successfully.";
    return type === 'api'
      ? helper.success(res, variables.Success, successMessage, pieChartData)
      : pieChartData;
  } catch (error) {
    // Log error with context
    console.error("Error fetching non productive website data:", {
      message: error.message,
    });
    return type === 'api'
      ? helper.failed(res, 500, error.message)
      : false;
  }
};


//hourly productive and non productive website chart data
const singleUserProductiveWebsitesAndNonproductiveWebsites = async (req, res, next) => {
  try {
    const { userId, date } = req.query;

    const { company_id, departmentId } = req.user;
    // Fetch data for non-productive and productive websites
    const nonProductiveWebsitesData = await singleUserNonProductiveWebsiteData('', '', '', 'function', { userId, date, company_id, departmentId });
    const productiveWebsitesData = await singleUserProductiveWebsiteData('', '', '', 'function', { userId, date, company_id, departmentId });

    console.log(nonProductiveWebsitesData);
    console.log(productiveWebsitesData);

    // Validate data format
    if (!Array.isArray(nonProductiveWebsitesData) || !Array.isArray(productiveWebsitesData)) {
      return helper.failed(res, 400, "Invalid data format", []);
    }

    // Determine which dataset is larger and iterate over it
    const [primaryData, secondaryData, primaryKey, secondaryKey] =
      nonProductiveWebsitesData.length >= productiveWebsitesData.length
        ? [nonProductiveWebsitesData, productiveWebsitesData, 'non_productive_websites_total_time', 'productive_websites_value']
        : [productiveWebsitesData, nonProductiveWebsitesData, 'productive_websites_value', 'non_productive_websites_total_time'];

    // Combine data based on the larger dataset
    const combinedData = primaryData.map(primaryItem => {
      const matchingSecondaryItem = secondaryData.find(
        secondaryItem => secondaryItem.name === primaryItem.name // Match by period
      );
      return {
        period: primaryItem.name,
        [primaryKey]: parseFloat(primaryItem.value || '0.0'),
        [secondaryKey]: parseFloat(matchingSecondaryItem?.value || '0.0'),
      };
    });

    // Success response
    return helper.success(res, variables.Success, "Data Fetched Successfully", combinedData);
  } catch (error) {
    console.error("Error in singleUserProductiveWebsitesAndNonproductiveWebsites:", error);
    return helper.failed(res, 500, "Internal Server Error", []);
  }
};

//hourly productive app and non productive chart data 
const singleUserProductiveAppAndNonproductiveApps = async (req, res, next) => {
  try {
    const { userId, date } = req.query;
    const { company_id, departmentId } = req.user;
    const nonProductiveAppsData = await singleUserProductiveAppData('', '', '', 'function', { userId, date, company_id, departmentId });
    const productiveAppsData = await singleUserNonProductiveAppData('', '', '', 'function', { userId, date, company_id, departmentId });

    if (!Array.isArray(nonProductiveAppsData) || !Array.isArray(productiveAppsData)) {
      return helper.failed(res, 400, "Invalid data format", []);
    }

    const [primaryData, secondaryData, primaryKey, secondaryKey] =
      nonProductiveAppsData.length >= productiveAppsData.length
        ? [nonProductiveAppsData, productiveAppsData, 'non_productive_apps_total_time', 'productive_apps_value']
        : [productiveAppsData, nonProductiveAppsData, 'productive_apps_value', 'non_productive_apps_total_time'];

    // Combine data based on the larger array
    const combinedData = primaryData.map(primaryItem => {
      const matchingSecondaryItem = secondaryData.find(
        secondaryItem => secondaryItem.name === primaryItem.name // Match by period
      );
      return {
        period: primaryItem.name,
        [primaryKey]: parseFloat(primaryItem.value || '0.0'),
        [secondaryKey]: parseFloat(matchingSecondaryItem?.value || '0.0'),
      };
    });

    // Success response
    return helper.success(res, variables.Success, "Data Fetched Successfully", combinedData);
  } catch (error) {
    console.error("Error in productiveAppsAndproductiveapps:", error);
    return helper.failed(res, 500, "Internal Server Error", []);
  }
};



export default { productiveChart, topApplicationChart, topWebsiteChart, productiveAppsChart, productiveWebsiteChart, NonProductiveWebsiteChart, nonProductiveAppsChart, productiveAppsAndproductiveWebsites, productiveWebsiteAndNonproductiveWebsites, productiveAppAndNonproductiveApps, activityData, singleUserProductiveAppData, singleUserNonProductiveAppData, singleUserProductiveWebsiteData, singleUserNonProductiveWebsiteData, singleUserProductiveAppAndNonproductiveApps, singleUserProductiveWebsitesAndNonproductiveWebsites };
