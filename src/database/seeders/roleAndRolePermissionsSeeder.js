import sequelize from '../queries/dbConnection.js';
import role from '../models/roleModel.js';
import rolePermission from '../models/rolePermissionModel.js';
import company from '../models/company.js';
import { attribute } from '@sequelize/core/_non-semver-use-at-your-own-risk_/expression-builders/attribute.js';


const generateDummyData = async (transaction) => {
  await role.destroy({ where: {} });
  await sequelize.query(`ALTER TABLE ${role.getTableName()} AUTO_INCREMENT=1`);

  await rolePermission.destroy({ where: {} });
  await sequelize.query(`ALTER TABLE ${rolePermission.getTableName()} AUTO_INCREMENT=1`);

  const companyIds = await company.findAll({
    attribute: ["id"],
  })

  for (let a = 1; a <= 4; a++) {
    //*________________--------------- ROLE -------------_____________________
    const rootRole = await role.bulkCreate([
      { name: "Super Admin", company_id: companyIds[a] },
      { name: "Admin", company_id: companyIds[a] },
      { name: "Team Leader", company_id: companyIds[a] },
      { name: "Manager", company_id: companyIds[a] },
      { name: "User", company_id: companyIds[a] },
      { name: "Project Manager", company_id: companyIds[a] },
      { name: "Product Manager", company_id: companyIds[a] },
      { name: "Project Coordinator Manager", company_id: companyIds[a] },
      { name: "Technical Lead", company_id: companyIds[a] },
      { name: "QA Lead", company_id: companyIds[a] },
      { name: "Developer", company_id: companyIds[a] },
      { name: "DevOps Engineer", company_id: companyIds[a] },
      { name: "Tester", company_id: companyIds[a] },
      { name: "UI/UX Designer", company_id: companyIds[a] },
      { name: "Employee", company_id: companyIds[a] },
      { name: "Database Administrator", company_id: companyIds[a] },
      { name: "System Analyst", company_id: companyIds[a] },
      { name: "Network Engineer", company_id: companyIds[a] },
      { name: "IT Support", company_id: companyIds[a] },
      { name: "Intern", company_id: companyIds[a] },
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
  }
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
