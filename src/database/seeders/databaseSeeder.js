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
import module from "../models/moduleModel.js";

export default async function seedDatabase() {
  try {
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

    await module.destroy({ where: {} });
    await sequelize.query(`ALTER TABLE ${module.getTableName()} AUTO_INCREMENT=1`);

    const rootModules = await module.bulkCreate([
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
    ]);

    for (let a = 1; a <= 4; a++) {
      //*________________--------------- ROLE -------------_____________________
      const rootRole = await role.bulkCreate([
        { name: "Super Admin", company_id: a },
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

      //*________________--------------- ROLE PERMISSIONS -------------_____________________
      for (let b = 1; b <= 19; b++) {
        await rolePermission.bulkCreate([
          { company_id: a, roleId: b, modules: "role", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: b, modules: "reportingManager", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: b, modules: "team", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: b, modules: "shifts", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: b, modules: "teamMembers", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: b, modules: "department", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: b, modules: "designation", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: b, modules: "adminAuth", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: b, modules: "userSettings", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: b, modules: "permissions", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: b, modules: "blockedWebsite", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: b, modules: "productiveApp", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: b, modules: "reportSettings", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
          { company_id: a, roleId: b, modules: "user", permissions: { POST: false, GET: false, PUT: false, DELETE: false } },
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

      console.log("Teams Data Created successfully.");

      //*________________--------------- USERS -------------_____________________
      const rootUser = await User.bulkCreate([
        {
          company_id: a,
          fullname: `Admin ${a}`,
          email: `admin${a}@example.com`,
          mobile: (Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000).toString(),
          departmentId: departmentMap["Upper Management"],
          designationId: designationMap["MD (Managing Director)"],
          roleId: roleMap["Super Admin"],
          teamId: teamMap["Upper Management Team"],
          password: "$2b$10$moBYrpFMk0DJemIgdUqlgO4LXj5nUj0FK1zzV7GpEEmqh2yhcShVK", // Test@123
          isAdmin: 1,
          country: "India",
          screen_capture_time: 60,
          browser_capture_time: 60,
          app_capture_time: 60,
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

      console.log("User Data Created successfully.");

      //*________________--------------- REPORT SETTINGS -------------_____________________
      const rootReportSettings = await reportSettings.bulkCreate([{ company_id: a }]);
      console.log("Report Settings Data Created successfully.");

      //*________________--------------- APP HISTORY -------------_____________________

      userIds.forEach((id) => {
        console.log(`Processing user with ID: ${id}`);

        (id, a, "2024-12-13", "Postman", "2024-12-13 09:39:35", "2024-12-13 09:40:35", "2024-12-13 09:39:35", "2024-12-13 09:40:35"),
          (id, a, "2024-12-13", "Google Chrome", "2024-12-13 09:39:35", "2024-12-13 09:40:35", "2024-12-13 09:39:35", "2024-12-13 09:40:35"),
          (id, a, "2024-12-13", "Android Studio", "2024-12-13 09:39:35", "2024-12-13 09:40:35", "2024-12-13 09:39:35", "2024-12-13 09:40:35"),
          (id, a, "2024-12-13", "Finder", "2024-12-13 09:39:35", "2024-12-13 09:40:35", "2024-12-13 09:39:35", "2024-12-13 09:40:35"),
          (id, a, "2024-12-13", "Cliq", "2024-12-13 09:39:35", "2024-12-13 09:40:35", "2024-12-13 09:39:35", "2024-12-13 09:40:35"),
          (id, a, "2024-12-13", "MongoDB Compass", "2024-12-13 09:39:35", "2024-12-13 09:40:35", "2024-12-13 09:39:35", "2024-12-13 09:40:35"),
          (id, a, "2024-12-13", "Calendar", "2024-12-13 09:39:35", "2024-12-13 09:40:35", "2024-12-13 09:39:35", "2024-12-13 09:40:35"),
          (id, a, "2024-12-13", "Code", "2024-12-13 09:39:35", "2024-12-13 09:40:35", "2024-12-13 09:39:35", "2024-12-13 09:40:35"),
          (id, a, "2024-12-13", "E-Monitrix", "2024-12-13 09:39:35", "2024-12-13 09:40:35", "2024-12-13 09:39:35", "2024-12-13 09:40:35"),
          (id, a, "2024-12-13", "Postman", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59"),
          (id, a, "2024-12-13", "Google Chrome", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59"),
          (id, a, "2024-12-13", "Android Studio", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59"),
          (id, a, "2024-12-13", "Finder", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59"),
          (id, a, "2024-12-13", "Cliq", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59"),
          (id, a, "2024-12-13", "MongoDB Compass", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59"),
          (id, a, "2024-12-13", "Calendar", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59"),
          (id, a, "2024-12-13", "Code", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59"),
          (id, a, "2024-12-13", "E-Monitrix", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59", "2024-12-13 09:40:59"),
          (id, a, "2024-12-13", "Postman", "2024-12-13 09:41:31", "2024-12-13 09:44:31", "2024-12-13 09:41:31", "2024-12-13 09:44:31"),
          (id, a, "2024-12-13", "Google Chrome", "2024-12-13 09:41:31", "2024-12-13 09:44:31", "2024-12-13 09:41:31", "2024-12-13 09:44:31"),
          (id, a, "2024-12-13", "Android Studio", "2024-12-13 09:41:31", "2024-12-13 09:44:31", "2024-12-13 09:41:31", "2024-12-13 09:44:31"),
          (id, a, "2024-12-13", "Finder", "2024-12-13 09:41:31", "2024-12-13 09:44:31", "2024-12-13 09:41:31", "2024-12-13 09:44:31"),
          (id, a, "2024-12-13", "Cliq", "2024-12-13 09:41:31", "2024-12-13 09:44:31", "2024-12-13 09:41:31", "2024-12-13 09:44:31"),
          (id, a, "2024-12-13", "MongoDB Compass", "2024-12-13 09:41:31", "2024-12-13 09:44:31", "2024-12-13 09:41:31", "2024-12-13 09:44:31"),
          (id, a, "2024-12-13", "Calendar", "2024-12-13 09:41:31", "2024-12-13 09:44:31", "2024-12-13 09:41:31", "2024-12-13 09:44:31"),
          (id, a, "2024-12-13", "Code", "2024-12-13 09:41:31", "2024-12-13 09:44:31", "2024-12-13 09:41:31", "2024-12-13 09:44:31"),
          (id, a, "2024-12-13", "E-Monitrix", "2024-12-13 09:41:31", "2024-12-13 09:44:31", "2024-12-13 09:41:32", "2024-12-13 09:44:31"),
          (id, a, "2024-12-13", "Postman", "2024-12-13 09:47:48", "2024-12-13 09:49:48", "2024-12-13 09:48:48", "2024-12-13 09:49:48"),
          (id, a, "2024-12-13", "Google Chrome", "2024-12-13 09:47:48", "2024-12-13 09:49:48", "2024-12-13 09:48:48", "2024-12-13 09:49:48"),
          (id, a, "2024-12-13", "Android Studio", "2024-12-13 09:47:48", "2024-12-13 09:49:48", "2024-12-13 09:48:48", "2024-12-13 09:49:48"),
          (id, a, "2024-12-13", "Finder", "2024-12-13 09:47:48", "2024-12-13 09:49:48", "2024-12-13 09:48:48", "2024-12-13 09:49:48"),
          (id, a, "2024-12-13", "Cliq", "2024-12-13 09:47:48", "2024-12-13 09:49:48", "2024-12-13 09:48:48", "2024-12-13 09:49:48"),
          (id, a, "2024-12-13", "MongoDB Compass", "2024-12-13 09:47:48", "2024-12-13 09:49:48", "2024-12-13 09:48:48", "2024-12-13 09:49:48"),
          (id, a, "2024-12-13", "Calendar", "2024-12-13 09:47:48", "2024-12-13 09:49:48", "2024-12-13 09:48:48", "2024-12-13 09:49:48"),
          (id, a, "2024-12-13", "Code", "2024-12-13 09:47:48", "2024-12-13 09:49:48", "2024-12-13 09:48:48", "2024-12-13 09:49:48"),
          (id, a, "2024-12-13", "E-Monitrix", "2024-12-13 09:47:48", "2024-12-13 09:49:48", "2024-12-13 09:48:48", "2024-12-13 09:49:48"),
          (id, a, "2024-12-13", "ApplicationFrameHost", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47"),
          (id, a, "2024-12-13", "chrome", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47"),
          (id, a, "2024-12-13", "Cliq", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47"),
          (id, a, "2024-12-13", "Code", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47"),
          (id, a, "2024-12-13", "explorer", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47"),
          (id, a, "2024-12-13", "monitrix", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47"),
          (id, a, "2024-12-13", "Postman", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47"),
          (id, a, "2024-12-13", "qemu-system-x86_64", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47"),
          (id, a, "2024-12-13", "SystemSettings", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47"),
          (id, a, "2024-12-13", "TextInputHost", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47", "2024-12-13 09:57:47"),
          (id, a, "2024-12-13", "ApplicationFrameHost", "2024-12-13 11:01:34", "2024-12-13 11:02:34", "2024-12-13 11:01:34", "2024-12-13 11:02:35"),
          (id, a, "2024-12-13", "chrome", "2024-12-13 11:01:34", "2024-12-13 11:02:34", "2024-12-13 11:01:34", "2024-12-13 11:02:35"),
          (id, a, "2024-12-13", "Cliq", "2024-12-13 11:01:34", "2024-12-13 11:02:34", "2024-12-13 11:01:34", "2024-12-13 11:02:35"),
          (id, a, "2024-12-13", "Code", "2024-12-13 11:01:34", "2024-12-13 11:02:34", "2024-12-13 11:01:34", "2024-12-13 11:02:35"),
          (id, a, "2024-12-13", "monitrix", "2024-12-13 11:01:34", "2024-12-13 11:02:34", "2024-12-13 11:01:34", "2024-12-13 11:02:35"),
          (id, a, "2024-12-13", "qemu-system-x86_64", "2024-12-13 11:01:34", "2024-12-13 11:02:34", "2024-12-13 11:01:34", "2024-12-13 11:02:35"),
          (id, a, "2024-12-13", "SystemSettings", "2024-12-13 11:01:34", "2024-12-13 11:02:34", "2024-12-13 11:01:34", "2024-12-13 11:02:35"),
          (id, a, "2024-12-13", "TextInputHost", "2024-12-13 11:01:34", "2024-12-13 11:02:34", "2024-12-13 11:01:34", "2024-12-13 11:02:35");
      });

      //! For loop of COMPANY Ends here
    }
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}
