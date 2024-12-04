import sequelize from '../queries/dbConnection.js';
import module from '../models/moduleModel.js';

const generateDummyData = async (transaction) => {
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
  ];
  
  // Insert into the database
  for (const requestData of moduleData) {
    await module.create({
      name:requestData
    }, { transaction });
  }
  console.log("Dummy data inserted successfully!");
};

(async () => {
  const transaction = await sequelize.transaction();
  try {
    await generateDummyData(transaction);
    await transaction.commit();
    console.error("Seeding Modules Completed");
  } catch (error) {
    console.error("Error inserting dummy data:", error.message);
    await transaction.rollback();
  }
})();
