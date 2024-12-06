import sequelize from "../queries/dbConnection.js";
import role from "../models/roleModel.js";
import department from "../models/departmentModel.js";
import designation from "../models/designationModel.js";
import shift from "../models/shiftModel.js";
import team from "../models/teamModel.js";
import User from "../models/userModel.js";

export default async function seedDatabase() {
    try {
        //__________________________________----------------------------ROLE START------------------------------------------------------

        await role.destroy({
            where: {}
        });

        await sequelize.query(`ALTER TABLE ${role.getTableName()} AUTO_INCREMENT=1`);


        await role.bulkCreate([
            { name: "Admin" },
            { name: "Super Admin" },
            { name: "Team Leader" },
            { name: "Manager" },
            { name: "User" },
            { name: "Project Manager" },
            { name: "Product Manager" },
            { name: "HR Manager" },
            { name: "Technical Lead" },
            { name: "QA Lead" },
            { name: "Developer" },
            { name: "Tester" },
            { name: "UI/UX Designer" },
            { name: "DevOps Engineer" },
            { name: "Database Administrator" },
            { name: "System Analyst" },
            { name: "Network Engineer" },
            { name: "IT Support" },
            { name: "Intern" }
        ]);


        //__________________________________----------------------------ROLE END------------------------------------------------------

        //__________________________________----------------------------DEPARTMENT START------------------------------------------------------


        await department.destroy({
            where: {}
        });

        await sequelize.query(`ALTER TABLE ${department.getTableName()} AUTO_INCREMENT=1`);

        await department.bulkCreate([
            { name: "Development Department" },
            { name: "HR Department" },
            { name: "Marketing Department" },
            { name: "Sales Department" },
            { name: "Server & Hardware Department" }
        ]);


        //__________________________________----------------------------DEPARTMENT END------------------------------------------------------



        //__________________________________----------------------------DESIGNATION START------------------------------------------------------

        await designation.destroy({
            where: {}
        });

        await sequelize.query(`ALTER TABLE ${designation.getTableName()} AUTO_INCREMENT=1`);

        await designation.bulkCreate([
            { name: "MD (Managing Director)" },
            { name: "CEO (Chief Executive Officer)" },
            { name: "CTO (Chief Technical Officer)" },
            { name: "CIO (Chief Information Officer)" },
            { name: "TL (Team Leader)" },
            { name: "PC (Project Coordinator)" },
            { name: "SD (Software Developer)" },
            { name: "QA Engineer (Quality Assurance)" },
            { name: "DevOps Engineer" },
            { name: "System Analyst" },
            { name: "UI/UX Designer" },
            { name: "Web Designer (WD)" },
            { name: "Database Administrator (DBA)" },
            { name: "Network Engineer" },
            { name: "Technical Writer" },
            { name: "Product Manager" },
            { name: "Project Manager" },
            { name: "Scrum Master" },
            { name: "AI/ML Engineer" },
            { name: "Security Analyst" },
            { name: "Cloud Engineer" },
            { name: "IT Support Specialist" },
            { name: "Intern" }
        ]);

        //__________________________________----------------------------DESIGNATION END------------------------------------------------------


        //__________________________________----------------------------SHIFT START------------------------------------------------------


        await shift.destroy({
            where: {}
        });

        await sequelize.query(`ALTER TABLE ${shift.getTableName()} AUTO_INCREMENT=1`);

        await shift.bulkCreate([
            {
                name: "Morning Shift",
                start_time: "08:00 AM",
                end_time: "04:00 PM",
                days: ['mon', 'tue', 'wed', 'thu', 'fri'],
                total_hours: 8
            },
            {
                name: "Evening Shift",
                start_time: "04:00 PM",
                end_time: "12:00 AM",
                days: ['mon', 'tue', 'wed', 'thu', 'fri'],
                total_hours: 8
            },
            {
                name: "Night Shift",
                start_time: "12:00 AM",
                end_time: "08:00 AM",
                days: ['mon', 'tue', 'wed', 'thu', 'fri'],
                total_hours: 8
            },
            {
                name: "Weekend Shift",
                start_time: "10:00 AM",
                end_time: "06:00 PM",
                days: ['sat', 'sun'],
                total_hours: 8
            },
            {
                name: "Split Shift",
                start_time: "09:00 AM",
                end_time: "01:00 PM",
                days: ['mon', 'tue', 'wed', 'thu', 'fri'],
                total_hours: 4
            },
            {
                name: "Flexible Shift",
                start_time: "10:00 AM",
                end_time: "04:00 PM",
                days: ['mon', 'tue', 'wed', 'fri'],
                total_hours: 6
            },
            {
                name: "Part-Time Shift",
                start_time: "02:00 PM",
                end_time: "06:00 PM",
                days: ['mon', 'tue', 'wed', 'thu', 'fri'],
                total_hours: 4
            },
            {
                name: "24/7 Support Shift",
                start_time: "06:00 AM",
                end_time: "02:00 PM",
                days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
                total_hours: 8
            }
        ]);

        //__________________________________----------------------------SHIFT END------------------------------------------------------



        //__________________________________----------------------------TEAMS START------------------------------------------------------

        await team.destroy({
            where: {}
        });

        await sequelize.query(`ALTER TABLE ${team.getTableName()} AUTO_INCREMENT=1`);

        await team.bulkCreate([
            {
                name: "Development Team",
                departmentId: 1,
                shiftId: 1
            },
            {
                name: "QA Team",
                departmentId: 2,
                shiftId: 2
            },
            {
                name: "Support Team",
                departmentId: 3,
                shiftId: 3
            },
            {
                name: "Design Team",
                departmentId: 4,
                shiftId: 4
            },
            {
                name: "Ops Team",
                departmentId: 5,
                shiftId: 5
            },
            {
                name: "Research Team",
                departmentId: 6,
                shiftId: 6
            },
            {
                name: "Part-Time Support Team",
                departmentId: 3,
                shiftId: 7
            },
            {
                name: "24/7 Support Team",
                departmentId: 3,
                shiftId: 8
            }
        ]);


        //__________________________________----------------------------TEAMS END------------------------------------------------------


        //===================================================== Users SEEDING START
        await User.destroy({
            where: {}
        });

        await sequelize.query(`ALTER TABLE ${User.getTableName()} AUTO_INCREMENT=1`);

        //const plaintextPassword = "user123"; 
        await User.bulkCreate([
            {
                fullname: "Alice Johnson",
                email: "alice.johnson@example.com",
                mobile: "9876543210",
                departmentId: 1, // Engineering
                designationId: 5, // Software Developer
                roleId: 3, // User
                teamId: 1, // Team associated with Engineering
                password: "$2a$10$abcdefghijklmnopqrstuv12345" // Placeholder hashed password
            },
            {
                fullname: "Bob Smith",
                email: "bob.smith@example.com",
                mobile: "8765432109",
                departmentId: 2, // Marketing
                designationId: 6, // Team Leader
                roleId: 2, // Team Leader
                teamId: 2, // Team associated with Marketing
                password: "$2a$10$abcdefghijklmnopqrstuv12345"
            },
            {
                fullname: "Carol Davis",
                email: "carol.davis@example.com",
                mobile: "7654321098",
                departmentId: 3, // HR
                designationId: 8, // HR Manager
                roleId: 3, // User
                teamId: 3, // Team associated with HR
                password: "$2a$10$abcdefghijklmnopqrstuv12345"
            },
            {
                fullname: "David Miller",
                email: "david.miller@example.com",
                mobile: "6543210987",
                departmentId: 4, // Finance
                designationId: 7, // Project Manager
                roleId: 1, // Admin
                teamId: 4, // Team associated with Finance
                password: "$2a$10$abcdefghijklmnopqrstuv12345"
            },
            {
                fullname: "Eve Brown",
                email: "eve.brown@example.com",
                mobile: "5432109876",
                departmentId: 5, // Sales
                designationId: 9, // Sales Executive
                roleId: 3, // User
                teamId: 5, // Team associated with Sales
                password: "$2a$10$abcdefghijklmnopqrstuv12345"
            },
            {
                fullname: "Frank Wilson",
                email: "frank.wilson@example.com",
                mobile: "4321098765",
                departmentId: 1, // Engineering
                designationId: 5, // Software Developer
                roleId: 3, // User
                teamId: 1, // Team associated with Engineering
                password: "$2a$10$abcdefghijklmnopqrstuv12345"
            },
            {
                fullname: "Grace Lee",
                email: "grace.lee@example.com",
                mobile: "3210987654",
                departmentId: 2, // Marketing
                designationId: 10, // Marketing Coordinator
                roleId: 3, // User
                teamId: 2, // Team associated with Marketing
                password: "$2a$10$abcdefghijklmnopqrstuv12345"
            },
            {
                fullname: "Henry Clark",
                email: "henry.clark@example.com",
                mobile: "2109876543",
                departmentId: 3, // HR
                designationId: 8, // HR Manager
                roleId: 2, // Team Leader
                teamId: 3, // Team associated with HR
                password: "$2a$10$abcdefghijklmnopqrstuv12345"
            },
            {
                fullname: "Ivy Adams",
                email: "ivy.adams@example.com",
                mobile: "1098765432",
                departmentId: 4, // Finance
                designationId: 11, // Financial Analyst
                roleId: 3, // User
                teamId: 4, // Team associated with Finance
                password: "$2a$10$abcdefghijklmnopqrstuv12345"
            },
            {
                fullname: "Jack Thompson",
                email: "jack.thompson@example.com",
                mobile: "1987654321",
                departmentId: 1, // Engineering
                designationId: 5, // Software Developer
                roleId: 3, // User
                teamId: 1, // Team associated with Engineering
                password: "$2a$10$abcdefghijklmnopqrstuv12345"
            }
        ]);



    } catch (error) {
        console.error('Failed to seed database:', error);
    }
}
