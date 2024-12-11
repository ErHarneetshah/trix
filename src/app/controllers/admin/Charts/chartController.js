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
                  SUM(TIMESTAMPDIFF(MINUTE, ah.startTime, ah.endTime)) AS total_time_minutes
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
                  SUM(TIMESTAMPDIFF(MINUTE, ah.startTime, ah.endTime)) AS total_time_minutes
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
                  SUM(TIMESTAMPDIFF(MINUTE, ah.startTime, ah.endTime)) AS total_time_minutes
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
        logging: console.log,
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
      logging: console.log,
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
      logging: console.log,
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
            COALESCE(SUM(TIMESTAMPDIFF(SECONDS, ah.startTime, ah.endTime)), 0) AS total_time_seconds
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
            COALESCE(SUM(TIMESTAMPDIFF(SECONDS, ah.startTime, ah.endTime)), 0) AS total_time_seconds
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
            COALESCE(SUM(TIMESTAMPDIFF(SECONDS, ah.startTime, ah.endTime)), 0) AS total_time_seconds
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
        logging: console.log,
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
        logging: console.log,
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
        logging: console.log,
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
        logging: console.log,
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
const productiveAppsAndproductiveWebsites = async (req, res, next) => {
  try {
    const { filterType, dateOption } = req.query;

    const productiveAppsData = await productiveAppsChart('', '', '', 'function', { filterType, dateOption });
    const productiveWebsiteData = await productiveWebsiteChart('', '', '', 'function', { filterType, dateOption });

    if (!Array.isArray(productiveAppsData) || !Array.isArray(productiveWebsiteData)) {
      return helper.failed(res, 400, "Invalid data format", []);
    }

    const combinedData = productiveAppsData.map(item1 => {
      const item2 = productiveWebsiteData.find(item => item.period === item1.period); // Match by period
      return {
        period: item1.period,
        productive_apps_total_time: parseFloat(item1.total_time || '0.0'),
        productive_websites_total_time: parseFloat(item2?.total_time || '0.0')
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
const productiveWebsiteAndNonproductiveWebsites = async (req, res, next) => {
  try {
    const { filterType, dateOption } = req.query;

    const nonProductiveWebsitesData = await NonProductiveWebsiteChart('', '', '', 'function', { filterType, dateOption });
    const productiveWebsiteData = await productiveWebsiteChart('', '', '', 'function', { filterType, dateOption });

    if (!Array.isArray(nonProductiveWebsitesData) || !Array.isArray(productiveWebsiteData)) {
      return helper.failed(res, 400, "Invalid data format", []);
    }

    const combinedData = nonProductiveWebsitesData.map(item1 => {
      const item2 = productiveWebsiteData.find(item => item.period === item1.period); // Match by period
      return {
        period: item1.period,
        non_productive_websites_total_time: parseFloat(item1.total_time || '0.0'),
        productive_websites_total_time: parseFloat(item2?.total_time || '0.0')
      };
    });

    // Success response
    return helper.success(res, variables.Success, "Data Fetched Successfully", combinedData);
  } catch (error) {
    console.error("Error in productiveAppsAndproductiveWebsites:", error);
    return helper.failed(res, 500, "Internal Server Error", []);
  }
};


//function for productive apps and non productive apps chart
const productiveAppAndNonproductiveApps = async (req, res, next) => {
  try {
    const { filterType, dateOption } = req.query;

    const nonProductiveAppsData = await nonProductiveAppsChart('', '', '', 'function', { filterType, dateOption });
    const productiveAppsData = await productiveAppsChart('', '', '', 'function', { filterType, dateOption });

    if (!Array.isArray(nonProductiveAppsData) || !Array.isArray(productiveAppsData)) {
      return helper.failed(res, 400, "Invalid data format", []);
    }

    const combinedData = nonProductiveAppsData.map(item1 => {
      const item2 = productiveAppsData.find(item => item.period === item1.period); // Match by period
      return {
        period: item1.period,
        non_productive_apps_total_time: parseFloat(item1.total_time || '0.0'),
        productive_apps_total_time: parseFloat(item2?.total_time || '0.0')
      };
    });

    // Success response
    return helper.success(res, variables.Success, "Data Fetched Successfully", combinedData);
  } catch (error) {
    console.error("Error in productiveAppsAndproductiveapps:", error);
    return helper.failed(res, 500, "Internal Server Error", []);
  }
};

//function for activity type trends

const activityData = async (req, res, next) => {
  try {
    const { filterType, dateOption } = req.query;




    const productiveAppsData = await productiveAppsChart('', '', '', 'function', { filterType, dateOption });
    const productiveWebsiteData = await productiveWebsiteChart('', '', '', 'function', { filterType, dateOption });
    const nonProductiveAppsData = await nonProductiveAppsChart('', '', '', 'function', { filterType, dateOption });
    const nonProductiveWebsiteData = await NonProductiveWebsiteChart('', '', '', 'function', { filterType, dateOption });



    // if (!Array.isArray(nonProductiveAppsData) || !Array.isArray(productiveAppsData)) {
    //   return helper.failed(res, 400, "Invalid data format", []);
    // }

    // const combinedData = nonProductiveAppsData.map(item1 => {
    //   const item2 = productiveAppsData.find(item => item.period === item1.period); // Match by period
    //   return {
    //     period: item1.period,
    //     non_productive_apps_total_time: parseFloat(item1.total_time || '0.0'),
    //     productive_apps_total_time: parseFloat(item2?.total_time || '0.0')
    //   };
    // });

    // Success response
    return helper.success(res, variables.Success, "Data Fetched Successfully", combinedData);
  } catch (error) {
    console.error("Error in productiveAppsAndproductiveapps:", error);
    return helper.failed(res, 500, "Internal Server Error", []);
  }
};







export default { productiveChart, topApplicationChart, topWebsiteChart, productiveAppsChart, productiveWebsiteChart, NonProductiveWebsiteChart, nonProductiveAppsChart, productiveAppsAndproductiveWebsites, productiveWebsiteAndNonproductiveWebsites, productiveAppAndNonproductiveApps };
