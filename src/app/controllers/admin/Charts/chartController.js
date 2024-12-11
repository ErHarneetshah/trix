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



export default { productiveChart };
