import sequelize from "../queries/dbConnection.js";
import role from "../models/roleModel.js";
import department from "../models/departmentModel.js";
import designation from "../models/designationModel.js";
import shift from "../models/shiftModel.js";
import team from "../models/teamModel.js";
import User from "../models/userModel.js";
import company from "../models/companyModel.js";
import rolePermission from "../models/rolePermissionModel.js";

export default async function seedDatabase() {
  try {
    //__________________________________----------------------------COMPANIES START------------------------------------------------------

    const destroyTables = async () => {
      try {
        await company.destroy({ where: {} });
        await role.destroy({ where: {} });
        await department.destroy({ where: {} });
        await designation.destroy({ where: {} });
        await shift.destroy({ where: {} });
        await rolePermission.destroy({ where: {} });

        const resetQueries = [
          sequelize.query(`ALTER TABLE ${company.getTableName()} AUTO_INCREMENT=1`),
          sequelize.query(`ALTER TABLE ${role.getTableName()} AUTO_INCREMENT = 1`),
          sequelize.query(`ALTER TABLE ${department.getTableName()} AUTO_INCREMENT = 1`),
          sequelize.query(`ALTER TABLE ${designation.getTableName()} AUTO_INCREMENT = 1`),
          sequelize.query(`ALTER TABLE ${shift.getTableName()} AUTO_INCREMENT = 1`),
        ];

        await Promise.all(resetQueries);

        console.log("All tables cleared and auto-increment reset!");
      } catch (error) {
        console.error("Error while destroying tables:", error.message);
      }
    };

    (async () => {
      await destroyTables();
    })();

    const createdCompanies = await company.bulkCreate(
      [
        { name: "LBM Solutions", employeeNumber: 120 },
        { name: "ApniCars", employeeNumber: 160 },
        { name: "Digimon", employeeNumber: 250 },
        { name: "OceanWorks", employeeNumber: 50 },
      ],
      { returning: true }
    ); // 'returning: true' ensures the inserted rows are returned

    let companyMapping = {};

    let rolesToCreate = [];
    let departmentsToCreate = [];
    let designationsToCreate = [];
    let shiftsToCreate = [];

    const roleNames = [
      "Admin",
      "Super Admin",
      "Team Leader",
      "Manager",
      "User",
      "Project Manager",
      "Product Manager",
      "HR Manager",
      "Technical Lead",
      "QA Lead",
      "Developer",
      "Tester",
      "UI/UX Designer",
      "DevOps Engineer",
      "Database Administrator",
      "System Analyst",
      "Network Engineer",
      "IT Support",
      "Intern",
    ];

    const departmentName = ["Development Department", "HR Department", "Marketing Department", "Sales Department", "Server & Hardware Department"];

    const designationNames = [
      "MD (Managing Director)",
      "CEO (Chief Executive Officer)",
      "CTO (Chief Technical Officer)",
      "CIO (Chief Information Officer)",
      "TL (Team Leader)",
      "PC (Project Coordinator)",
      "SD (Software Developer)",
      "QA Engineer (Quality Assurance)",
      "DevOps Engineer",
      "System Analyst",
      "UI/UX Designer",
      "Web Designer (WD)",
      "Database Administrator (DBA)",
      "Network Engineer",
      "Technical Writer",
      "Product Manager",
      "Project Manager",
      "Scrum Master",
      "AI/ML Engineer",
      "Security Analyst",
      "Cloud Engineer",
      "IT Support Specialist",
      "Intern",
    ];

    const shiftTemplates = [
      {
        name: "Morning Shift",
        start_time: "08:00",
        end_time: "16:00",
        days: ["mon", "tue", "wed", "thu", "fri"],
        total_hours: 8,
      },
      {
        name: "Evening Shift",
        start_time: "16:00",
        end_time: "00:00",
        days: ["mon", "tue", "wed", "thu", "fri"],
        total_hours: 8,
      },
      {
        name: "Night Shift",
        start_time: "00:00",
        end_time: "08:00",
        days: ["mon", "tue", "wed", "thu", "fri"],
        total_hours: 8,
      },
      {
        name: "Weekend Shift",
        start_time: "10:00",
        end_time: "18:00",
        days: ["sat", "sun"],
        total_hours: 8,
      },
      {
        name: "Split Shift",
        start_time: "09:00",
        end_time: "13:00",
        days: ["mon", "tue", "wed", "thu", "fri"],
        total_hours: 4,
      },
      {
        name: "Flexible Shift",
        start_time: "10:00",
        end_time: "16:00",
        days: ["mon", "tue", "wed", "fri"],
        total_hours: 6,
      },
      {
        name: "Part-Time Shift",
        start_time: "14:00",
        end_time: "18:00",
        days: ["mon", "tue", "wed", "thu", "fri"],
        total_hours: 4,
      },
      {
        name: "24/7 Support Shift",
        start_time: "06:00",
        end_time: "14:00",
        days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        total_hours: 8,
      },
    ];
    

    for (const comp of createdCompanies) {
      companyMapping[comp.name] = comp.id; // Map company names to their IDs

      // Insert roles and map their IDs
      const createdRoles = await role.bulkCreate(
        roleNames.map((roleName) => ({
          name: roleName,
          company_id: comp.id,
        })),
        { returning: true }
      );

      let roleId = [];
      createdRoles.forEach((role) => {
        roleId.push(role.id);
      });

      // Insert departments and map their IDs
      const createdDepartments = await department.bulkCreate(
        departmentName.map((department) => ({
          name: department,
          company_id: comp.id,
        })),
        { returning: true }
      );

      let deptId = [];
      createdDepartments.forEach((department) => {
        deptId.push(department.id);
      });

      // Insert designations and map their IDs
      const createdDesignations = await designation.bulkCreate(
        designationNames.map((designation) => ({
          name: designation,
          company_id: comp.id,
        })),
        { returning: true }
      );

      let desigId = [];
      createdDesignations.forEach((designation) => {
        desigId.push(designation.id);
      });

      // Insert shifts and map their IDs
      const createdShifts = await shift.bulkCreate(
        shiftTemplates.map((shift) => ({
          ...shift,
          company_id: comp.id,
        })),
        { returning: true }
      );

      let shiftId = [];
      createdShifts.forEach((shift) => {
        shiftId.push(shift.id);
      });
    }

    //***__________________________________----------------------------TEAMS START------------------------------------------------------

    // await team.destroy({
    //   where: {},
    // });

    // await sequelize.query(`ALTER TABLE ${team.getTableName()} AUTO_INCREMENT=1`);

    // await team.bulkCreate([
    //   {
    //     name: "Development Team",
    //     company_id: 101,
    //     departmentId: 1,
    //     shiftId: 1,
    //   },
    //   {
    //     name: "QA Team",
    //     company_id: 101,
    //     departmentId: 2,
    //     shiftId: 2,
    //   },
    //   {
    //     name: "Support Team",
    //     company_id: 101,
    //     departmentId: 3,
    //     shiftId: 3,
    //   },
    //   {
    //     name: "Design Team",
    //     company_id: 101,
    //     departmentId: 4,
    //     shiftId: 4,
    //   },
    //   {
    //     name: "Ops Team",
    //     company_id: 101,
    //     departmentId: 5,
    //     shiftId: 5,
    //   },
    //   {
    //     name: "Research Team",
    //     company_id: 101,
    //     departmentId: 6,
    //     shiftId: 6,
    //   },
    //   {
    //     name: "Part-Time Support Team",
    //     company_id: 101,
    //     departmentId: 3,
    //     shiftId: 7,
    //   },
    //   {
    //     name: "24/7 Support Team",
    //     company_id: 101,
    //     departmentId: 3,
    //     shiftId: 8,
    //   },
    // ]);

    //__________________________________----------------------------TEAMS END------------------------------------------------------

    //===================================================== Users SEEDING START
    // await User.destroy({
    //   where: {},
    // });

    // await sequelize.query(`ALTER TABLE ${User.getTableName()} AUTO_INCREMENT=1`);

    // //const plaintextPassword = "user123";
    // await User.bulkCreate([
    //   {
    //     company_id: 101,
    //     fullname: "Alice Johnson",
    //     email: "alice.johnson@example.com",
    //     mobile: "9876543210",
    //     departmentId: 1, // Engineering
    //     designationId: 5, // Software Developer
    //     roleId: 3, // User
    //     teamId: 1, // Team associated with Engineering
    //     password: "$2b$10$zibJitw0JGi5S8AklV3G5eS2FtBaTLog2udfMmHbANb3F44vQXjJa", // Placeholder hashed password //aBcD1234
    //   },
    //   {
    //     company_id: 101,
    //     fullname: "Bob Smith",
    //     email: "bob.smith@example.com",
    //     mobile: "8765432109",
    //     departmentId: 2, // Marketing
    //     designationId: 6, // Team Leader
    //     roleId: 2, // Team Leader
    //     teamId: 2, // Team associated with Marketing
    //     password: "$2b$10$zibJitw0JGi5S8AklV3G5eS2FtBaTLog2udfMmHbANb3F44vQXjJa",
    //   },
    //   {
    //     company_id: 101,
    //     fullname: "Carol Davis",
    //     email: "carol.davis@example.com",
    //     mobile: "7654321098",
    //     departmentId: 3, // HR
    //     designationId: 8, // HR Manager
    //     roleId: 3, // User
    //     teamId: 3, // Team associated with HR
    //     password: "$2b$10$zibJitw0JGi5S8AklV3G5eS2FtBaTLog2udfMmHbANb3F44vQXjJa",
    //   },
    //   {
    //     company_id: 101,
    //     fullname: "David Miller",
    //     email: "david.miller@example.com",
    //     mobile: "6543210987",
    //     departmentId: 4, // Finance
    //     designationId: 7, // Project Manager
    //     roleId: 1, // Admin
    //     teamId: 4, // Team associated with Finance
    //     password: "$2b$10$zibJitw0JGi5S8AklV3G5eS2FtBaTLog2udfMmHbANb3F44vQXjJa",
    //   },
    //   {
    //     company_id: 101,
    //     fullname: "Eve Brown",
    //     email: "eve.brown@example.com",
    //     mobile: "5432109876",
    //     departmentId: 5, // Sales
    //     designationId: 9, // Sales Executive
    //     roleId: 3, // User
    //     teamId: 5, // Team associated with Sales
    //     password: "$2b$10$zibJitw0JGi5S8AklV3G5eS2FtBaTLog2udfMmHbANb3F44vQXjJa",
    //   },
    //   {
    //     company_id: 101,
    //     fullname: "Frank Wilson",
    //     email: "frank.wilson@example.com",
    //     mobile: "4321098765",
    //     departmentId: 1, // Engineering
    //     designationId: 5, // Software Developer
    //     roleId: 3, // User
    //     teamId: 1, // Team associated with Engineering
    //     password: "$2b$10$zibJitw0JGi5S8AklV3G5eS2FtBaTLog2udfMmHbANb3F44vQXjJa",
    //   },
    //   {
    //     company_id: 101,
    //     fullname: "Grace Lee",
    //     email: "grace.lee@example.com",
    //     mobile: "3210987654",
    //     departmentId: 2, // Marketing
    //     designationId: 10, // Marketing Coordinator
    //     roleId: 3, // User
    //     teamId: 2, // Team associated with Marketing
    //     password: "$2b$10$zibJitw0JGi5S8AklV3G5eS2FtBaTLog2udfMmHbANb3F44vQXjJa",
    //   },
    //   {
    //     company_id: 101,
    //     fullname: "Henry Clark",
    //     email: "henry.clark@example.com",
    //     mobile: "2109876543",
    //     departmentId: 3, // HR
    //     designationId: 8, // HR Manager
    //     roleId: 2, // Team Leader
    //     teamId: 3, // Team associated with HR
    //     password: "$2b$10$zibJitw0JGi5S8AklV3G5eS2FtBaTLog2udfMmHbANb3F44vQXjJa",
    //   },
    //   {
    //     company_id: 101,
    //     fullname: "Ivy Adams",
    //     email: "ivy.adams@example.com",
    //     mobile: "1098765432",
    //     departmentId: 4, // Finance
    //     designationId: 11, // Financial Analyst
    //     roleId: 3, // User
    //     teamId: 4, // Team associated with Finance
    //     password: "$2b$10$zibJitw0JGi5S8AklV3G5eS2FtBaTLog2udfMmHbANb3F44vQXjJa",
    //   },
    //   {
    //     company_id: 101,
    //     fullname: "Jack Thompson",
    //     email: "jack.thompson@example.com",
    //     mobile: "1987654321",
    //     departmentId: 1, // Engineering
    //     designationId: 5, // Software Developer
    //     roleId: 3, // User
    //     teamId: 1, // Team associated with Engineering
    //     password: "$2b$10$zibJitw0JGi5S8AklV3G5eS2FtBaTLog2udfMmHbANb3F44vQXjJa",
    //   },
    // ]);
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}
