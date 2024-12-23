import sequelize from '../queries/dbConnection.js';
import app_modules from '../models/moduleModel.js';
import languageDropdown from '../models/languageModel.js';

const generateDummyData = async (transaction) => {
  await app_modules.destroy({ where: {} });
  await sequelize.query(`ALTER TABLE ${app_modules.getTableName()} AUTO_INCREMENT=1`);

  const moduleData = [
      "role",
      "reportingManager",
      "team",
      "shifts",
      "teamMembers",
      "department",
      "designation",
      "adminAuth",
      "userSettings",
      "permissions",
      "blockedWebsite",
      "productiveApp",
      "reportSettings",
      "user",
      "dashboard",
      "allTeamMemberDashboard",
  ];

  // Insert into the database
  for (const requestData of moduleData) {
    await app_modules.create({
      name: requestData
    },
   { transaction });
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
