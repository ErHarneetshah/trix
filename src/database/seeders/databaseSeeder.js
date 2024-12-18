import sequelize from "../queries/dbConnection.js";
import role from "../models/roleModel.js";
import department from "../models/departmentModel.js";
import designation from "../models/designationModel.js";
import shift from "../models/shiftModel.js";
import team from "../models/teamModel.js";
import User from "../models/userModel.js";
import company from "../models/company.js";
import rolePermission from "../models/rolePermissionModel.js";
import reportSettings from "../models/reportSettingsModel.js";
import app_modules from "../models/moduleModel.js";
import AppHistoryEntry from "../models/AppHistoryEntry.js";
import { UpdatedAt } from "@sequelize/core/decorators-legacy";
import { BlockedWebsites } from "../models/BlockedWebsite.js";
import { Device } from "../models/device.js";
import ProductiveWebsite from "../models/ProductiveWebsite.js";
import { ProductiveApp } from "../models/ProductiveApp.js";
import workReports from "../models/workReportsModel.js";
import { UserHistory } from "../models/UserHistory.js";
import TimeLog from "../models/timeLogsModel.js";
import { addMonths } from "date-fns";
import exportReports from "../models/exportReportsModel.js";

export default async function seedDatabase() {
  try {
    const currentDate = new Date().toISOString().split("T")[0];

    await company.destroy({ where: {} });
    await sequelize.query(`ALTER TABLE ${company.getTableName()} AUTO_INCREMENT=1`);
    await company.bulkCreate([
      { name: "LBM Solutions", email: "admin1@example.com", employeeNumber: 120 },
      { name: "ApniCars", email: "admin2@example.com", employeeNumber: 160 },
      { name: "Digimon", email: "admin3@example.com", employeeNumber: 250 },
      { name: "OceanWorks", email: "admin4@example.com", employeeNumber: 50 },
    ]);

    await role.destroy({ where: {} });
    await sequelize.query(`ALTER TABLE ${role.getTableName()} AUTO_INCREMENT=1`);

    await rolePermission.destroy({ where: {} });
    await sequelize.query(`ALTER TABLE ${rolePermission.getTableName()} AUTO_INCREMENT=1`);

    await department.destroy({ where: {} });
    await sequelize.query(`ALTER TABLE ${department.getTableName()} AUTO_INCREMENT=1`);

    await designation.destroy({ where: {} });
    await sequelize.query(`ALTER TABLE ${designation.getTableName()} AUTO_INCREMENT=1`);

    await shift.destroy({ where: {} });
    await sequelize.query(`ALTER TABLE ${shift.getTableName()} AUTO_INCREMENT=1`);

    await team.destroy({ where: {} });
    await sequelize.query(`ALTER TABLE ${team.getTableName()} AUTO_INCREMENT=1`);

    await User.destroy({ where: {} });
    await sequelize.query(`ALTER TABLE ${User.getTableName()} AUTO_INCREMENT=1`);

    await reportSettings.destroy({ where: {} });
    await sequelize.query(`ALTER TABLE ${reportSettings.getTableName()} AUTO_INCREMENT=1`);

    await app_modules.destroy({ where: {} });
    await sequelize.query(`ALTER TABLE ${app_modules.getTableName()} AUTO_INCREMENT=1`);

    await exportReports.destroy({ where: {} });
    await sequelize.query(`ALTER TABLE ${exportReports.getTableName()} AUTO_INCREMENT=1`);

    const rootModules = await app_modules.bulkCreate([
      { name: "role" },
      { name: "reportingManager" },
      { name: "team" },
      { name: "shifts" },
      { name: "teamMembers" },
      { name: "department" },
      { name: "designation" },
      { name: "adminAuth" },
      { name: "userSettings" },
      { name: "permissions" },
      { name: "blockedWebsite" },
      { name: "productiveApp" },
      { name: "reportSettings" },
      { name: "user" },
      { name: "dashboard" },
      { name: "allTeamMemberDashboard" },
    ]);

    const rootExportReports = await exportReports.bulkCreate([
      {
        name: "Productivity Report",
        content:
          "The Productive Report provides an analysis of user activity, highlighting the time spent on productive applications and tasks.",
      },
      {
        name: "Attendance Report",
        content:
          "The Attendance Report presents a detailed overview of user attendance, including logged-in and logged-out times, etc.",
      },
      {
        name: "Browser Activity Report",
        content:
          "The Browser Activity Report provides a comprehensive summary of users' browsing activities.",
      },
      {
        name: "Application Usage",
        content:
          "The Application Usage Report provides an overview of the applications used by users, including the time spent on each app.",
      },
      {
        name: "Department Performance Report",
        content:
          "The Department Performance Report evaluates the overall productivity and efficiency of each department.",
      },
      {
        name: "Unauthorized Websites Access Report",
        content:
          "The Unauthorized Websites Access Report tracks and identifies instances where users accessed websites categorized as unauthorized or restricted.",
      },
    ]);

    for (let a = 1; a <= 4; a++) {
      //*________________--------------- ROLE -------------_____________________
      const rootRole = await role.bulkCreate([
        { name: "Admin", company_id: a },
        { name: "Team Leader", company_id: a },
        { name: "Manager", company_id: a },
        { name: "User", company_id: a },
        { name: "Project Manager", company_id: a },
        { name: "Product Manager", company_id: a },
        { name: "Project Coordinator Manager", company_id: a },
        { name: "Technical Lead", company_id: a },
        { name: "QA Lead", company_id: a },
        { name: "Developer", company_id: a },
        { name: "DevOps Engineer", company_id: a },
        { name: "Tester", company_id: a },
        { name: "UI/UX Designer", company_id: a },
        { name: "Employee", company_id: a },
        { name: "Database Administrator", company_id: a },
        { name: "System Analyst", company_id: a },
        { name: "Network Engineer", company_id: a },
        { name: "IT Support", company_id: a },
        { name: "Intern", company_id: a },
      ]);

      const roleMap = rootRole.reduce((map, role) => {
        map[role.name] = role.id;
        return map;
      }, {});

      const roleIds = rootRole.map((role) => role.id);

      //*________________--------------- ROLE PERMISSIONS -------------_____________________
      //? Super Admin Role Permissions
      await rolePermission.bulkCreate([
        { company_id: a, roleId: roleIds[0], modules: "role", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
        { company_id: a, roleId: roleIds[0], modules: "reportingManager", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
        { company_id: a, roleId: roleIds[0], modules: "team", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
        { company_id: a, roleId: roleIds[0], modules: "shifts", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
        { company_id: a, roleId: roleIds[0], modules: "teamMembers", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
        { company_id: a, roleId: roleIds[0], modules: "department", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
        { company_id: a, roleId: roleIds[0], modules: "designation", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
        { company_id: a, roleId: roleIds[0], modules: "adminAuth", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
        { company_id: a, roleId: roleIds[0], modules: "userSettings", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
        { company_id: a, roleId: roleIds[0], modules: "permissions", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
        { company_id: a, roleId: roleIds[0], modules: "blockedWebsite", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
        { company_id: a, roleId: roleIds[0], modules: "productiveApp", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
        { company_id: a, roleId: roleIds[0], modules: "reportSettings", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
        { company_id: a, roleId: roleIds[0], modules: "user", permissions: { POST: true, GET: true, PUT: true, DELETE: true } },
      ]);

      for (let b = 1; b < roleIds.length; b++) {
        await rolePermission.bulkCreate([
          { company_id: a, roleId: roleIds[b], modules: "role", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: roleIds[b], modules: "reportingManager", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: roleIds[b], modules: "team", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: roleIds[b], modules: "shifts", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: roleIds[b], modules: "teamMembers", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: roleIds[b], modules: "department", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: roleIds[b], modules: "designation", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: roleIds[b], modules: "adminAuth", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: roleIds[b], modules: "userSettings", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: roleIds[b], modules: "permissions", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: roleIds[b], modules: "blockedWebsite", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: roleIds[b], modules: "productiveApp", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: roleIds[b], modules: "reportSettings", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: roleIds[b], modules: "user", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
        ]);
      }

      //*________________--------------- DEPARTMENTS -------------_____________________
      // Step 1: Bulk create root-level departments
      const rootDepartments = await department.bulkCreate(
        [
          { name: "Upper Management", company_id: a, isRootId: 1 },
          { name: "Development Department", company_id: a },
          { name: "Project Coordinator Department", company_id: a },
          { name: "Marketing Department", company_id: a },
          { name: "Sales Department", company_id: a },
          { name: "Server And Hardware Department", company_id: a },
        ],
        { returning: true }
      );

      const departmentMap = rootDepartments.reduce((map, dept) => {
        map[dept.name] = dept.id;
        return map;
      }, {});

      const deptIds = rootDepartments.map((dept) => dept.id);
      const deptData = rootDepartments.map((dept) => ({
        deptId: dept.id,
        companyId: dept.company_id, // Replace `company_id` with the actual key in your data if different
      }));

      // Step 2: Add parent-child relationships dynamically
      const updates = [
        { name: "Development Department", parentDeptId: departmentMap["Upper Management"] },
        { name: "Project Coordinator Department", parentDeptId: departmentMap["Upper Management"] },
        { name: "Marketing Department", parentDeptId: departmentMap["Sales Department"] },
        { name: "Sales Department", parentDeptId: departmentMap["Upper Management Department"] },
        { name: "Server And Hardware Department", parentDeptId: departmentMap["Development Department"] },
      ];

      // Update parentDeptId in the database
      for (const update of updates) {
        await department.update({ parentDeptId: update.parentDeptId }, { where: { name: update.name, company_id: a } });
      }

      console.log("Departments Data created successfully.");

      //*________________--------------- DESIGNATIONS -------------_____________________
      const rootDesignations = await designation.bulkCreate(
        [
          { name: "MD (Managing Director)", company_id: a },
          { name: "CEO (Chief Executive Officer)", company_id: a },
          { name: "CTO (Chief Technical Officer)", company_id: a },
          { name: "CIO (Chief Information Officer)", company_id: a },
          { name: "Team Leader", company_id: a },
          { name: "PC (Project Coordinator)", company_id: a },
          { name: "SD (Software Developer)", company_id: a },
          { name: "QA Engineer (Quality Assurance)", company_id: a },
          { name: "Employee", company_id: a },
          { name: "System Analyst Engineer", company_id: a },
          { name: "UI/UX Designer", company_id: a },
          { name: "Web Designer (WD)", company_id: a },
          { name: "Database Administrator (DBA)", company_id: a },
          { name: "Network Engineer", company_id: a },
          { name: "Technical Writer", company_id: a },
          { name: "Product Manager", company_id: a },
          { name: "Project Manager", company_id: a },
          { name: "Scrum Master", company_id: a },
          { name: "AI/ML Engineer", company_id: a },
          { name: "Security Analyst", company_id: a },
          { name: "Cloud Engineer", company_id: a },
          { name: "IT Support Specialist", company_id: a },
          { name: "Intern", company_id: a },
        ],
        { returning: true }
      );

      const designationMap = rootDesignations.reduce((map, desig) => {
        map[desig.name] = desig.id;
        return map;
      }, {});

      const designationIds = rootDesignations.map((designation) => designation.id);

      console.log("Designations Data Created successfully.");
      //*________________--------------- SHIFTS -------------_____________________
      const rootShift = await shift.bulkCreate([
        {
          name: "Morning Shift",
          company_id: a,
          start_time: "08:00",
          end_time: "16:00",
          days: ["mon", "tue", "wed", "thu", "fri"],
          total_hours: 8,
        },
        {
          name: "Evening Shift",
          company_id: a,
          start_time: "16:00",
          end_time: "00:00",
          days: ["mon", "tue", "wed", "thu", "fri"],
          total_hours: 8,
        },
        {
          name: "Night Shift",
          company_id: a,
          start_time: "00:00",
          end_time: "08:00",
          days: ["mon", "tue", "wed", "thu", "fri"],
          total_hours: 8,
        },
        {
          name: "Weekend Shift",
          company_id: a,
          start_time: "10:00",
          end_time: "18:00",
          days: ["sat", "sun"],
          total_hours: 8,
        },
        {
          name: "Split Shift",
          company_id: a,
          start_time: "09:00",
          end_time: "13:00",
          days: ["mon", "tue", "wed", "thu", "fri"],
          total_hours: 4,
        },
        {
          name: "Flexible Shift",
          company_id: a,
          start_time: "10:00",
          end_time: "16:00",
          days: ["mon", "tue", "wed", "fri"],
          total_hours: 6,
        },
        {
          name: "Part-Time Shift",
          company_id: a,
          start_time: "14:00",
          end_time: "20:00",
          days: ["mon", "tue", "wed", "thu", "fri"],
          total_hours: 4,
        },
        {
          name: "24/7 Support Shift",
          company_id: a,
          start_time: "06:00",
          end_time: "14:00",
          days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
          total_hours: 8,
        },
      ]);

      const shiftMap = rootShift.reduce((map, shift) => {
        map[shift.name] = shift.id;
        return map;
      }, {});

      const shiftIds = rootShift.map((shift) => shift.id);

      console.log("Shifts Data Created successfully.");
      //*________________--------------- TEAMS -------------_____________________
      const rootTeam = await team.bulkCreate([
        {
          name: "Upper Management Team",
          company_id: a,
          departmentId: departmentMap["Upper Management"],
          shiftId: shiftMap["Morning Shift"],
        },
        {
          name: "Development Team",
          company_id: a,
          departmentId: departmentMap["Development Department"],
          shiftId: shiftMap["Morning Shift"],
        },
        {
          name: "QA Team",
          company_id: a,
          departmentId: departmentMap["Development Department"],
          shiftId: shiftMap["Morning Shift"],
        },
        {
          name: "Support Team",
          company_id: a,
          departmentId: departmentMap["Sales Department"],
          shiftId: shiftMap["Night Shift"],
        },
        {
          name: "Design Team",
          company_id: a,
          departmentId: departmentMap["Development Department"],
          shiftId: shiftMap["Evening Shift"],
        },
        {
          name: "Ops Team",
          company_id: a,
          departmentId: departmentMap["Server And Hardware Department"],
          shiftId: shiftMap["Evening Shift"],
        },
        {
          name: "Research Team",
          company_id: a,
          departmentId: departmentMap["Marketing Department"],
          shiftId: shiftMap["Split Shift"],
        },
        {
          name: "Part-Time Support Team",
          company_id: a,
          departmentId: departmentMap["Sales Department"],
          shiftId: shiftMap["Part-Time Shift"],
        },
        {
          name: "24/7 Support Team",
          company_id: a,
          departmentId: departmentMap["Sales Department"],
          shiftId: shiftMap["24/7 Support Shift"],
        },
      ]);

      const teamMap = rootTeam.reduce((map, team) => {
        map[team.name] = team.id;
        return map;
      }, {});

      const teamIds = rootTeam.map((team) => team.id);

      console.log("Teams Data Created successfully.");
      const today = new Date();
      const nextMonthDate = addMonths(today, 1);
      //*________________--------------- USERS -------------_____________________
      const rootUser = await User.bulkCreate([
        {
          company_id: a,
          fullname: `Admin ${a}`,
          email: `admin${a}@example.com`,
          mobile: (Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000).toString(),
          departmentId: departmentMap["Upper Management"],
          designationId: designationMap["MD (Managing Director)"],
          roleId: roleMap["Admin"],
          teamId: teamMap["Upper Management Team"],
          password: "$2b$10$moBYrpFMk0DJemIgdUqlgO4LXj5nUj0FK1zzV7GpEEmqh2yhcShVK", // Test@123
          isAdmin: 1,
          country: "India",
          screen_capture_time: 60,
          browser_capture_time: 60,
          app_capture_time: 60,
          next_reports_schedule_date: nextMonthDate.toLocaleDateString(),
        },
        {
          company_id: a,
          fullname: `Bob Smith ${a}`,
          email: `bob${a}.smith@example.com`,
          mobile: (Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000).toString(),
          departmentId: departmentMap["Development Department"], // Marketing
          designationId: designationMap["SD (Software Developer)"], // Team Leader
          roleId: roleMap["Developer"], // Team Leader
          teamId: teamMap["Development Team"], // Team associated with Marketing
          password: "$2b$10$moBYrpFMk0DJemIgdUqlgO4LXj5nUj0FK1zzV7GpEEmqh2yhcShVK",
          country: "India",
          screen_capture_time: 60,
          browser_capture_time: 60,
          app_capture_time: 60,
        },
        {
          company_id: a,
          fullname: `Carol Davis ${a}`,
          email: `carol${a}.davis@example.com`,
          mobile: (Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000).toString(),
          departmentId: departmentMap["Project Coordinator Department"],
          designationId: designationMap["PC (Project Coordinator)"],
          roleId: roleMap["Project Manager"], // User
          teamId: teamMap["Support Team"], // Team associated with Project Coordinator
          password: "$2b$10$moBYrpFMk0DJemIgdUqlgO4LXj5nUj0FK1zzV7GpEEmqh2yhcShVK",
          country: "India",
          screen_capture_time: 60,
          browser_capture_time: 60,
          app_capture_time: 60,
        },
        {
          company_id: a,
          fullname: `David Miller ${a}`,
          email: `david${a}.miller@example.com`,
          mobile: (Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000).toString(),
          departmentId: departmentMap["Marketing Department"],
          designationId: designationMap["Employee"],
          roleId: roleMap["User"],
          teamId: teamMap["Research Team"],
          password: "$2b$10$moBYrpFMk0DJemIgdUqlgO4LXj5nUj0FK1zzV7GpEEmqh2yhcShVK",
          country: "India",
          screen_capture_time: 60,
          browser_capture_time: 60,
          app_capture_time: 60,
        },
        {
          company_id: a,
          fullname: `Eve Brown ${a}`,
          email: `eve${a}.brown@example.com`,
          mobile: (Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000).toString(),
          departmentId: departmentMap["Sales Department"],
          designationId: designationMap["Team Leader"],
          roleId: roleMap["Team Leader"],
          teamId: teamMap["Support Team"],
          password: "$2b$10$moBYrpFMk0DJemIgdUqlgO4LXj5nUj0FK1zzV7GpEEmqh2yhcShVK",
          country: "India",
          screen_capture_time: 60,
          browser_capture_time: 60,
          app_capture_time: 60,
        },
        {
          company_id: a,
          fullname: `Frank Wilson ${a}`,
          email: `frank${a}.wilson@example.com`,
          mobile: (Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000).toString(),
          departmentId: departmentMap["Development Department"],
          designationId: designationMap["Team Leader"],
          roleId: roleMap["Team Leader"],
          teamId: teamMap["Development Team"],
          password: "$2b$10$moBYrpFMk0DJemIgdUqlgO4LXj5nUj0FK1zzV7GpEEmqh2yhcShVK",
          country: "India",
          screen_capture_time: 60,
          browser_capture_time: 60,
          app_capture_time: 60,
        },
        {
          company_id: a,
          fullname: `Grace Lee ${a}`,
          email: `grace${a}.lee@example.com`,
          mobile: (Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000).toString(),
          departmentId: departmentMap["Upper Management"],
          designationId: designationMap["CEO (Chief Executive Officer)"],
          roleId: roleMap["Manager"],
          teamId: teamMap["Upper Management Team"],
          password: "$2b$10$moBYrpFMk0DJemIgdUqlgO4LXj5nUj0FK1zzV7GpEEmqh2yhcShVK",
          country: "India",
          screen_capture_time: 60,
          browser_capture_time: 60,
          app_capture_time: 60,
        },
        {
          company_id: a,
          fullname: `Henry Clark ${a}`,
          email: `henry${a}.clark@example.com`,
          mobile: (Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000).toString(),
          departmentId: departmentMap["Upper Management"],
          designationId: designationMap["CTO (Chief Technical Officer)"],
          roleId: roleMap["Manager"],
          teamId: teamMap["Upper Management Team"],
          password: "$2b$10$moBYrpFMk0DJemIgdUqlgO4LXj5nUj0FK1zzV7GpEEmqh2yhcShVK",
          country: "India",
          screen_capture_time: 60,
          browser_capture_time: 60,
          app_capture_time: 60,
        },
        {
          company_id: a,
          fullname: `Ivy Adams ${a}`,
          email: `ivy${a}.adams@example.com`,
          mobile: (Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000).toString(),
          departmentId: departmentMap["Upper Management"],
          designationId: designationMap["CIO (Chief Information Officer)"],
          roleId: roleMap["Manager"],
          teamId: teamMap["Upper Management Team"],
          password: "$2b$10$moBYrpFMk0DJemIgdUqlgO4LXj5nUj0FK1zzV7GpEEmqh2yhcShVK",
          country: "India",
          screen_capture_time: 60,
          browser_capture_time: 60,
          app_capture_time: 60,
        },
        {
          company_id: a,
          fullname: `Jack Thompson ${a}`,
          email: `jack${a}.thompson@example.com`,
          mobile: (Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000).toString(),
          departmentId: departmentMap["Server And Hardware Department"],
          designationId: designationMap["System Analyst Engineer"],
          roleId: roleMap["DevOps Engineer"],
          teamId: teamMap["Ops Team"],
          password: "$2b$10$moBYrpFMk0DJemIgdUqlgO4LXj5nUj0FK1zzV7GpEEmqh2yhcShVK",
          country: "India",
          screen_capture_time: 60,
          browser_capture_time: 60,
          app_capture_time: 60,
        },
      ]);

      const userIds = rootUser.map((user) => user.id);
      const userData = rootDepartments.map((user) => ({
        userId: user.id,
        companyId: user.company_id, // Replace `company_id` with the actual key in your data if different
      }));

      console.log("User Data Created successfully.");

      //*________________--------------- REPORT SETTINGS -------------_____________________
      const rootReportSettings = await reportSettings.bulkCreate([{ company_id: a }]);
      console.log("Report Settings Data Created successfully.");

      //*________________--------------- APP HISTORY -------------_____________________

      userIds.forEach(async (id) => {
        let rootAppHistories = await AppHistoryEntry.bulkCreate([
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Postman`,
            startTime: `${currentDate} 09:39:35`,
            endTime: `${currentDate} 09:40:35`,
            createdAt: `${currentDate} 09:39:35`,
            updatedAt: `${currentDate} 09:40:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Google Chrome`,
            startTime: `${currentDate} 09:39:35`,
            endTime: `${currentDate} 09:40:35`,
            createdAt: `${currentDate} 09:39:35`,
            updatedAt: `${currentDate} 09:40:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Android Studio`,
            startTime: `${currentDate} 09:39:35`,
            endTime: `${currentDate} 09:40:35`,
            createdAt: `${currentDate} 09:39:35`,
            updatedAt: `${currentDate} 09:40:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Finder`,
            startTime: `${currentDate} 09:39:35`,
            endTime: `${currentDate} 09:40:35`,
            createdAt: `${currentDate} 09:39:35`,
            updatedAt: `${currentDate} 09:40:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Cliq`,
            startTime: `${currentDate} 09:39:35`,
            endTime: `${currentDate} 09:40:35`,
            createdAt: `${currentDate} 09:39:35`,
            updatedAt: `${currentDate} 09:40:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `MongoDB Compass`,
            startTime: `${currentDate} 09:39:35`,
            endTime: `${currentDate} 09:40:35`,
            createdAt: `${currentDate} 09:39:35`,
            updatedAt: `${currentDate} 09:40:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Calendar`,
            startTime: `${currentDate} 09:39:35`,
            endTime: `${currentDate} 09:40:35`,
            createdAt: `${currentDate} 09:39:35`,
            updatedAt: `${currentDate} 09:40:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Code`,
            startTime: `${currentDate} 09:39:35`,
            endTime: `${currentDate} 09:40:35`,
            createdAt: `${currentDate} 09:39:35`,
            updatedAt: `${currentDate} 09:40:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `E-Monitrix`,
            startTime: `${currentDate} 09:39:35`,
            endTime: `${currentDate} 09:40:35`,
            createdAt: `${currentDate} 09:39:35`,
            updatedAt: `${currentDate} 09:40:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Postman`,
            startTime: `${currentDate} 09:40:59`,
            endTime: `${currentDate} 09:40:59`,
            createdAt: `${currentDate} 09:40:59`,
            updatedAt: `${currentDate} 09:40:59`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Google Chrome`,
            startTime: `${currentDate} 09:40:59`,
            endTime: `${currentDate} 09:40:59`,
            createdAt: `${currentDate} 09:40:59`,
            updatedAt: `${currentDate} 09:40:59`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Android Studio`,
            startTime: `${currentDate} 09:40:59`,
            endTime: `${currentDate} 09:40:59`,
            createdAt: `${currentDate} 09:40:59`,
            updatedAt: `${currentDate} 09:40:59`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Finder`,
            startTime: `${currentDate} 09:40:59`,
            endTime: `${currentDate} 09:40:59`,
            createdAt: `${currentDate} 09:40:59`,
            updatedAt: `${currentDate} 09:40:59`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Cliq`,
            startTime: `${currentDate} 09:40:59`,
            endTime: `${currentDate} 09:40:59`,
            createdAt: `${currentDate} 09:40:59`,
            updatedAt: `${currentDate} 09:40:59`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `MongoDB Compass`,
            startTime: `${currentDate} 09:40:59`,
            endTime: `${currentDate} 09:40:59`,
            createdAt: `${currentDate} 09:40:59`,
            updatedAt: `${currentDate} 09:40:59`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Calendar`,
            startTime: `${currentDate} 09:40:59`,
            endTime: `${currentDate} 09:40:59`,
            createdAt: `${currentDate} 09:40:59`,
            updatedAt: `${currentDate} 09:40:59`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Code`,
            startTime: `${currentDate} 09:40:59`,
            endTime: `${currentDate} 09:40:59`,
            createdAt: `${currentDate} 09:40:59`,
            updatedAt: `${currentDate} 09:40:59`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `E-Monitrix`,
            startTime: `${currentDate} 09:40:59`,
            endTime: `${currentDate} 09:40:59`,
            createdAt: `${currentDate} 09:40:59`,
            updatedAt: `${currentDate} 09:40:59`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Postman`,
            startTime: `${currentDate} 09:41:31`,
            endTime: `${currentDate} 09:44:31`,
            createdAt: `${currentDate} 09:41:31`,
            updatedAt: `${currentDate} 09:44:31`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Google Chrome`,
            startTime: `${currentDate} 09:41:31`,
            endTime: `${currentDate} 09:44:31`,
            createdAt: `${currentDate} 09:41:31`,
            updatedAt: `${currentDate} 09:44:31`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Android Studio`,
            startTime: `${currentDate} 09:41:31`,
            endTime: `${currentDate} 09:44:31`,
            createdAt: `${currentDate} 09:41:31`,
            updatedAt: `${currentDate} 09:44:31`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Finder`,
            startTime: `${currentDate} 09:41:31`,
            endTime: `${currentDate} 09:44:31`,
            createdAt: `${currentDate} 09:41:31`,
            updatedAt: `${currentDate} 09:44:31`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Cliq`,
            startTime: `${currentDate} 09:41:31`,
            endTime: `${currentDate} 09:44:31`,
            createdAt: `${currentDate} 09:41:31`,
            updatedAt: `${currentDate} 09:44:31`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `MongoDB Compass`,
            startTime: `${currentDate} 09:41:31`,
            endTime: `${currentDate} 09:44:31`,
            createdAt: `${currentDate} 09:41:31`,
            updatedAt: `${currentDate} 09:44:31`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Calendar`,
            startTime: `${currentDate} 09:41:31`,
            endTime: `${currentDate} 09:44:31`,
            createdAt: `${currentDate} 09:41:31`,
            updatedAt: `${currentDate} 09:44:31`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Code`,
            startTime: `${currentDate} 09:41:31`,
            endTime: `${currentDate} 09:44:31`,
            createdAt: `${currentDate} 09:41:31`,
            updatedAt: `${currentDate} 09:44:31`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `E-Monitrix`,
            startTime: `${currentDate} 09:41:31`,
            endTime: `${currentDate} 09:44:31`,
            createdAt: `${currentDate} 09:41:32`,
            updatedAt: `${currentDate} 09:44:31`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Postman`,
            startTime: `${currentDate} 09:47:48`,
            endTime: `${currentDate} 09:49:48`,
            createdAt: `${currentDate} 09:48:48`,
            updatedAt: `${currentDate} 09:49:48`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Google Chrome`,
            startTime: `${currentDate} 09:47:48`,
            endTime: `${currentDate} 09:49:48`,
            createdAt: `${currentDate} 09:48:48`,
            updatedAt: `${currentDate} 09:49:48`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Android Studio`,
            startTime: `${currentDate} 09:47:48`,
            endTime: `${currentDate} 09:49:48`,
            createdAt: `${currentDate} 09:48:48`,
            updatedAt: `${currentDate} 09:49:48`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Finder`,
            startTime: `${currentDate} 09:47:48`,
            endTime: `${currentDate} 09:49:48`,
            createdAt: `${currentDate} 09:48:48`,
            updatedAt: `${currentDate} 09:49:48`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Cliq`,
            startTime: `${currentDate} 09:47:48`,
            endTime: `${currentDate} 09:49:48`,
            createdAt: `${currentDate} 09:48:48`,
            updatedAt: `${currentDate} 09:49:48`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `MongoDB Compass`,
            startTime: `${currentDate} 09:47:48`,
            endTime: `${currentDate} 09:49:48`,
            createdAt: `${currentDate} 09:48:48`,
            updatedAt: `${currentDate} 09:49:48`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Calendar`,
            startTime: `${currentDate} 09:47:48`,
            endTime: `${currentDate} 09:49:48`,
            createdAt: `${currentDate} 09:48:48`,
            updatedAt: `${currentDate} 09:49:48`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Code`,
            startTime: `${currentDate} 09:47:48`,
            endTime: `${currentDate} 09:49:48`,
            createdAt: `${currentDate} 09:48:48`,
            updatedAt: `${currentDate} 09:49:48`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `E-Monitrix`,
            startTime: `${currentDate} 09:47:48`,
            endTime: `${currentDate} 09:49:48`,
            createdAt: `${currentDate} 09:48:48`,
            updatedAt: `${currentDate} 09:49:48`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `ApplicationFrameHost`,
            startTime: `${currentDate} 09:57:47`,
            endTime: `${currentDate} 09:57:47`,
            createdAt: `${currentDate} 09:57:47`,
            updatedAt: `${currentDate} 09:57:47`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `chrome`,
            startTime: `${currentDate} 09:57:47`,
            endTime: `${currentDate} 09:57:47`,
            createdAt: `${currentDate} 09:57:47`,
            updatedAt: `${currentDate} 09:57:47`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Cliq`,
            startTime: `${currentDate} 09:57:47`,
            endTime: `${currentDate} 09:57:47`,
            createdAt: `${currentDate} 09:57:47`,
            updatedAt: `${currentDate} 09:57:47`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Code`,
            startTime: `${currentDate} 09:57:47`,
            endTime: `${currentDate} 09:57:47`,
            createdAt: `${currentDate} 09:57:47`,
            updatedAt: `${currentDate} 09:57:47`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `explorer`,
            startTime: `${currentDate} 09:57:47`,
            endTime: `${currentDate} 09:57:47`,
            createdAt: `${currentDate} 09:57:47`,
            updatedAt: `${currentDate} 09:57:47`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `monitrix`,
            startTime: `${currentDate} 09:57:47`,
            endTime: `${currentDate} 09:57:47`,
            createdAt: `${currentDate} 09:57:47`,
            updatedAt: `${currentDate} 09:57:47`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Postman`,
            startTime: `${currentDate} 09:57:47`,
            endTime: `${currentDate} 09:57:47`,
            createdAt: `${currentDate} 09:57:47`,
            updatedAt: `${currentDate} 09:57:47`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `qemu-system-x86_64`,
            startTime: `${currentDate} 09:57:47`,
            endTime: `${currentDate} 09:57:47`,
            createdAt: `${currentDate} 09:57:47`,
            updatedAt: `${currentDate} 09:57:47`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `SystemSettings`,
            startTime: `${currentDate} 09:57:47`,
            endTime: `${currentDate} 09:57:47`,
            createdAt: `${currentDate} 09:57:47`,
            updatedAt: `${currentDate} 09:57:47`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `TextInputHost`,
            startTime: `${currentDate} 09:57:47`,
            endTime: `${currentDate} 09:57:47`,
            createdAt: `${currentDate} 09:57:47`,
            updatedAt: `${currentDate} 09:57:47`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `ApplicationFrameHost`,
            startTime: `${currentDate} 11:01:34`,
            endTime: `${currentDate} 11:02:34`,
            createdAt: `${currentDate} 11:01:34`,
            updatedAt: `${currentDate} 11:02:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `chrome`,
            startTime: `${currentDate} 11:01:34`,
            endTime: `${currentDate} 11:02:34`,
            createdAt: `${currentDate} 11:01:34`,
            updatedAt: `${currentDate} 11:02:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Cliq`,
            startTime: `${currentDate} 11:01:34`,
            endTime: `${currentDate} 11:02:34`,
            createdAt: `${currentDate} 11:01:34`,
            updatedAt: `${currentDate} 11:02:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `Code`,
            startTime: `${currentDate} 11:01:34`,
            endTime: `${currentDate} 11:02:34`,
            createdAt: `${currentDate} 11:01:34`,
            updatedAt: `${currentDate} 11:02:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `monitrix`,
            startTime: `${currentDate} 11:01:34`,
            endTime: `${currentDate} 11:02:34`,
            createdAt: `${currentDate} 11:01:34`,
            updatedAt: `${currentDate} 11:02:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `qemu-system-x86_64`,
            startTime: `${currentDate} 11:01:34`,
            endTime: `${currentDate} 11:02:34`,
            createdAt: `${currentDate} 11:01:34`,
            updatedAt: `${currentDate} 11:02:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `SystemSettings`,
            startTime: `${currentDate} 11:01:34`,
            endTime: `${currentDate} 11:02:34`,
            createdAt: `${currentDate} 11:01:34`,
            updatedAt: `${currentDate} 11:02:35`,
          },
          {
            userId: id,
            company_id: a,
            date: currentDate,
            appName: `TextInputHost`,
            startTime: `${currentDate} 11:01:34`,
            endTime: `${currentDate} 11:02:34`,
            createdAt: `${currentDate} 11:01:34`,
            updatedAt: `${currentDate} 11:02:35`,
          },
        ]);

        let rootWorkReports = await workReports.bulkCreate([
          {
            company_id: a,
            user_id: id,
            description: "Project Name:- Blazecoint1)Create a api for get admin profile info.2)Create a api for update admin information.3)Create a api for adding blocked websites.",
            status: 2,
            remarks: "",
            date: currentDate,
          },
          {
            company_id: a,
            user_id: id,
            description: "Project Name:- Emonitrix 1)Create a api for get admin profile info.2)Create a api for update admin information.3)Create a api for adding blocked websites.",
            status: 1,
            remarks: "",
            date: currentDate,
          },
          {
            company_id: a,
            user_id: id,
            description: "Project Name:- DBank 1)Create a api for get admin profile info.2)Create a api for update admin information.3)Create a api for adding blocked websites.",
            status: 1,
            remarks: "",
            date: currentDate,
          },
        ]);

        let rootUserHistories = await UserHistory.bulkCreate([
          {
            userId: id,
            company_id: a,
            date: currentDate,
            website_name: "lbmsolutions.keka.com",
            url: "https://lbmsolutions.keka.com/#/me/attendance/logs",
            title: "Me | Attendance | Logs",
            visitTime: `${currentDate} 11:01:59`,
            createdAt: `${currentDate} 11:02:34`,
            updatedAt: `${currentDate} 11:02:34`,
          },
        ]);
      });

      deptIds.forEach(async (deptId) => {
        let rootBlockedWebsites = await BlockedWebsites.bulkCreate([
          { companyId: a, departmentId: deptId, website_name: "www.open.ai", website: "https://www.open.ai", logo: "https://www.open.ai/favicon.ico", status: 1 },
          {
            companyId: a,
            departmentId: deptId,
            website_name: "lbmsolutions.keka.com",
            website: "https://lbmsolutions.keka.com/",
            logo: "https://cdn.kekastatic.net/shared/branding/logo/favicon.ico",
            status: 1,
          },
          { companyId: a, departmentId: deptId, website_name: "hh.keka.com", website: "https://hh.keka.com/", logo: "https://cdn.kekastatic.net/shared/branding/logo/favicon.ico", status: 1 },
          { companyId: a, departmentId: deptId, website_name: "fff.keka.com", website: "https://fff.keka.com/", logo: "https://cdn.kekastatic.net/shared/branding/logo/favicon.ico", status: 1 },
        ]);

        let rootProductiveWebsite = await ProductiveWebsite.bulkCreate([
          { company_id: a, department_id: deptId, website_name: "vsipl.in", website: "https://vsipl.in/", logo: "https://vsipl.in/favicon.ico" },
          { company_id: a, department_id: deptId, website_name: "www.w3schools.com", website: "https://www.w3schools.com/", logo: "https://www.w3schools.com/favicon.ico" },
          { company_id: a, department_id: deptId, website_name: "chatgpt.com", website: "https://chatgpt.com/", logo: "/images/logos/app1.png" },
          { company_id: a, department_id: deptId, website_name: "Facebook", website: "google.co.in", logo: "/images/logos/app2.png" },
        ]);

        let rootProductiveApps = await ProductiveApp.bulkCreate([
          { company_id: a, department_id: deptId, app_name: "spotify" },
          { company_id: a, department_id: deptId, app_name: "test" },
          { company_id: a, department_id: deptId, app_name: "testing2" },
          { company_id: a, department_id: deptId, app_name: "testing5" },
          { company_id: a, department_id: deptId, app_name: "testing6" },
          { company_id: a, department_id: deptId, app_name: "testing9" },
          { company_id: a, department_id: deptId, app_name: "teslaa1" },
          { company_id: a, department_id: deptId, app_name: "teslaa2" },
          { company_id: a, department_id: deptId, app_name: "teslaa3" },
          { company_id: a, department_id: deptId, app_name: "teslaa4" },
          { company_id: a, department_id: deptId, app_name: "teslaa5" },
          { company_id: a, department_id: deptId, app_name: "teslaa888", app_logo: "1733927994878.png" },
          { company_id: a, department_id: deptId, app_name: "lamborgini" },
          { company_id: a, department_id: deptId, app_name: "lamborgini2", app_logo: "1733978573070.jpg" },
          { company_id: a, department_id: deptId, app_name: "cliq\r\n", app_logo: "/images/logos/app1.png" },
          { company_id: a, department_id: deptId, app_name: "chrome", app_logo: "/images/logos/app2.png" },
          { company_id: a, department_id: deptId, app_name: "Emon", app_logo: "1734008068247.png" },
          { company_id: a, department_id: deptId, app_name: "dsfsdfsdf", app_logo: "1734084843158.png" },
          { company_id: a, department_id: deptId, app_name: "dsfsdddfsdf", app_logo: "1734084944465.png" },
          { company_id: a, department_id: deptId, app_name: "gggg", app_logo: "1734085269400.png" },
          { company_id: a, department_id: deptId, app_name: "02d256562a", app_logo: "1734085471916.png" },
          { company_id: a, department_id: deptId, app_name: "reetika", app_logo: "1734085503747.png" },
          { company_id: a, department_id: deptId, app_name: "wewe", app_logo: "1734085754382.png" },
          { company_id: a, department_id: deptId, app_name: "tytyty", app_logo: "1734085805813.png" },
          { company_id: a, department_id: deptId, app_name: "dsgf", app_logo: "1734085850035.png" },
          { company_id: a, department_id: deptId, app_name: "gjhgj", app_logo: "1734086183986.png" },
        ]);
      });

      // let rootTimeLogs = await TimeLog.bulkCreate([
      //   { user_id: id, shift_Id: 1, company_id: a, logged_in_time: '10:17', active_time: 0, late_coming_duration: 0, logged_out_time: NULL, late_coming: 1, early_going: 0, spare_time: 0, idle_time: 0, date: '2024-12-10'},
      // ]);

      //! For loop of COMPANY Ends here
    }
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}
