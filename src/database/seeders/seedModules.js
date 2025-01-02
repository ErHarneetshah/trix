import sequelize from '../queries/dbConnection.js';
import app_modules from '../models/moduleModel.js';
import languageDropdown from '../models/languageModel.js';

const generateDummyData = async (transaction) => {
  await app_modules.destroy({ where: {} });
  await sequelize.query(`ALTER TABLE ${app_modules.getTableName()} AUTO_INCREMENT=1`);

  const moduleData = [
    // { name: "role", aliasName: "Role" },
    // { name: "reportingManager", aliasName: "Reporting Manager" },
    // { name: "team", aliasName: "Team" },
    // { name: "shifts", aliasName: "Shifts" },
    // { name: "teamMembers", aliasName: "Team Members" },
    // { name: "department", aliasName: "Department" },
    // { name: "designation", aliasName: "Designation" },
    // { name: "rolePermissions", aliasName: "Role Permissions" },
    // { name: "blockedWebsite", aliasName: "Blocked Website" },
    // { name: "productiveApp", aliasName: "Productive Application" },
    // { name: "reportSettings", aliasName: "Report Settings" },
    // { name: "dashboard", aliasName: "Dashboard" },
    // { name: "allTeamMemberDashboard", aliasName: "All Team Member Dashboard" },
    // { name: "auth", aliasName: "Authentication" },
    // { name: "exportReports", aliasName: "Export Report" },
    // { name: "tree", aliasName: "Team Structure" },
    // { name: "ai", aliasName: "AI Reports" },
    // { name: "compare", aliasName: "Compare Reports" },
    // { name: "workReports", aliasName: "Work Reports" },

    { name: "Role" },
    { name: "Reporting Manager" },
    { name: "Team" },
    { name: "Shifts" },
    { name: "Team Members" },
    { name: "Department" },
    { name: "Designation" },
    { name: "Role Permissions" },
    { name: "Blocked Website" },
    { name: "Productive Application" },
    { name: "Report Settings" },
    { name: "Dashboard" },
    { name: "All Team Member Dashboard" },
    { name: "Authentication" },
    { name: "Export Report" },
    { name: "Team Structure" },
    { name: "AI Reports" },
    { name: "Compare Reports" },
    { name: "Work Reports" },

  ];
  
  // Insert into the database
  for (const requestData of moduleData) {
    await app_modules.create({
      name: requestData.name,
      aliasName: requestData.aliasName, // Save aliasName along with name
    }, { transaction });
  }
  
  //console.log("Dummy data inserted successfully!");
};

const generateLanguageSeeder = async (transaction) => {
  await languageDropdown.destroy({ where: {} });
  await sequelize.query(`ALTER TABLE ${languageDropdown.getTableName()} AUTO_INCREMENT=1`);

  const languageToCountryCode = {
    English: "gb",
    Spanish: "es",
    Hindi: "in",
    French: "fr",
    Punjabi: "in",
  };

  const flagBaseUrl = "https://flagcdn.com/w320";

  const languageData = [
    "English",
    "Spanish",
    "Hindi",
    "French",
    "Punjabi",
  ];

  for (const language of languageData) {
    const countryCode = languageToCountryCode[language];
    const image = countryCode
      ? `${flagBaseUrl}/${countryCode}.png`
      : "/images/default_logo.png";

    // Create the language entry with the image URL
    await languageDropdown.create(
      {
        language,
        image,
      },
      { transaction }
    );
  }
};

(async () => {
  const transaction = await sequelize.transaction();
  try {
    await generateDummyData(transaction);
    await generateLanguageSeeder(transaction);
    await transaction.commit();
    console.error("Seeding Modules Completed");
  } catch (error) {
    console.error("Error inserting dummy data:", error.message);
    await transaction.rollback();
  }
})();
