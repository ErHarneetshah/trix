// import sequelize from "../../../database/queries/dbConnection.js";
// import helper from "../../../utils/services/helper.js";
// import variables from "../../config/variableConfig.js";
// import teamMemberDailyLog from "../../../database/models/teamMemberDailyLogModel.js";

// class teamMemberController {
//   getAllTeamMemberDailyLog = async (req, res) => {
//     try {
//       const alldata = await teamMemberDailyLog.findAll({
//         attributes: { exclude: ['createdAt', 'updatedAt'] }, // Exclude the password field
//       });
//       if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");

//       return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
//     catch (error) {
//       return helper.failed(res, variables.BadRequest, error.message);
//     }
//   };

//   addTempTeamMemberDailyLog = async (req, res) => {
//     const dbTransaction = await sequelize.transaction();
//     try {
      

     
//       // Create and save the new user
//       const teamMember = await teamMemberDailyLog.create(requestData, {
//         transaction: dbTransaction,
//       });

      
//         await dbTransaction.commit();
//         return helper.success(res, variables.Success, "Team Member Daily Logs Added Successfully");
//       // } else {
//       //   await dbTransaction.rollback();
//       //   return helper.failed(res, variables.UnknownError, "Unknow Error Occured While creating User Setting");
//       // }
//     } catch (error) {
//       if (dbTransaction) await dbTransaction.rollback();
//       console.log(error.message);
//       return helper.failed(res, variables.BadRequest, error.message);
//     }
//   };

//   searchTeamMemberDailyLog = async (req, res) => {}

//   searchFilterTeamMemberDailyLog = async (req, res) => {}
// }

// export default teamMemberController;
