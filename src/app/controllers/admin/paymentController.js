import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import axios from "axios";
import company from "../../../database/models/company.js";
import sequelize from "../../../database/queries/dbConnection.js";
import paymentLog from "../../../database/models/paymentLogModel.js";
import rolePermissionController from "./rolePermissionController.js";
import appConfig from "../../config/appConfig.js";
import H from "../../../utils/Mail.js";

class paymentController extends appConfig {
  getPaymentPlans = async (req, res) => {
    try {
      const privateKey = process.env.EMONITRIX_PRIVATE_KEY.replace(/"/g, "");

      const response = await axios.get(`${this.getSuperAdminUrl()}/api/product/getProductPlans?api_key=${privateKey}`);

      if (!response.data) return helper.failed(res, variables.BadRequest, "Unable to Retrieve Plan List");

      const companyDetails = await company.findOne({
        where: { id: req.user.company_id },
      });

      if (!companyDetails) {
        return helper.failed(res, variables.BadRequest, "Company details not found");
      }

      let activePlanId;
      response.data.data.data.forEach((plan) => {
        plan.currentPlan = plan.id === companyDetails.currentPlanId ? "true" : "false";
        if(plan.currentPlan)
        {
          activePlanId = plan.id;
        }
      });
      const isAdvanceExists = await paymentLog.count({
        where: {company_id: req.user.company_id, planId: activePlanId, status: 0}
      })
      if(isAdvanceExists)
      {
        response.data.data.advanceBought = true;  
      }else{
        response.data.data.advanceBought = false;  
      }

      response.data.data.activePlanId = activePlanId;
      return helper.success(res, variables.Success, "Plan List Retrieved", response.data.data);
    } catch (error) {
      console.error("Error in Payment Controller:", error.message);
      // helper.logger(res, "Payment Controller -> getPlaymentPlans", error);
      return helper.failed(res, variables.BadRequest, "Unable to Retrieve Plan List");
    }
  };

  buyPaymentPlan = async (req, res) => {
    try {
      let { planId } = req.body;
      if (!req.user.isAdmin) return helper.failed(res, variables.ValidationError, "You are not authorized");
      if (!planId || isNaN(planId)) return helper.failed(res, variables.ValidationError, "Select a Plan to Buy");

      let planDetails;
      try {
        planDetails = await axios.get(`${this.getSuperAdminUrl()}/api/product/viewPlan?plan_id=${planId}`);
      } catch (error) {
        if (error.response) {
          console.error("API Error Message:", error.response.data.message || error.response.data);
          console.error("Status Code:", error.response.status);
          console.error("Headers:", error.response.headers);
          return helper.failed(res, variables.BadRequest, error.response.data.message);
        } else if (error.request) {
          console.error("No Response from API:", error.request);
          return helper.failed(res, variables.BadRequest, error.request);
        } else {
          console.error("Error Setting Up Request:", error.message);
          return helper.failed(res, variables.BadRequest, "Error Setting Up Request");
        }
      }
      const companyDetails = await company.findOne({ where: { id: req.user.company_id } });
      if (planDetails.data.data.userCount) {
        if (companyDetails.employeeCount > planDetails.data.data.userCount) {
          return helper.failed(res, variables.BadRequest, "Number of Employees in your Company Exceeds the Plan's Limit. Please Select different plan");
        }

        let previousBoughtPlan = await paymentLog.findOne({
          where: { company_id: req.user.company_id, status: 0 },
        });
        if (previousBoughtPlan) {
          return helper.failed(res, variables.BadRequest, "Already Bought A Plan in Advance");
        }
      } else {
        return helper.failed(res, variables.BadRequest, "Unable to Retrieve Plan Details. Please Try Again");
      }

      let gateway_id;
      let paymentGateways = (planDetails = await axios.get(`${this.getSuperAdminUrl()}/api/gateway/paymentGateways`));
      paymentGateways.data.data.forEach((gateway) => {
        if (gateway.status) {
          gateway_id = gateway.id;
        }
      });
      const privateKey = process.env.EMONITRIX_PRIVATE_KEY.replace(/"/g, "");
      const redirect_url = `${this.getRedirectUrl()}`;

      const response = await axios({
        method: "post",
        url: `${this.getSuperAdminUrl()}/api/subscription/purchaseSubscription`,
        data: {
          plan_id: `${planId}`,
          api_key: `${privateKey}`,
          email: `${req.user.email}`,
          gateway_id: `${gateway_id}`,
          redirect_url: `${redirect_url}`,
        },
      });

      if (!response.data) return helper.failed(res, variables.BadRequest, "Unable to Purchase Plan.Try again later!");

      return helper.success(res, variables.Success, "Plan Purchased Successfully", response.data.data);
    } catch (error) {
      console.error("Error in Payment Controller:", error.message);
      return helper.failed(res, variables.BadRequest, "Unable to Process Payment Request");
    }
  };

  confirmPayment = async (req, res) => {
    try {
      const dbTransaction = await sequelize.transaction();
      const permissionInstance = new rolePermissionController();
      let { id, name, price, duration, userCount, api_key, userData } = req.body.plan;
      console.log("Test1");
      if (process.env.EMONITRIX_PRIVATE_KEY == api_key) {
        let companyDetails = await company.findOne({ where: { email: userData.email }, dbTransaction });
        console.log("Test2");

        //* If new plan id is the same as of current plan id
        if (companyDetails.currentPlanId == userData.plan_id) {
          const today = new Date();
          const dateOnly = today.toISOString().split("T")[0];
          //* If plan end date is less than todays's date, then update the paymnet log and companies table
          console.log("Test3");
          if (companyDetails.planEndDate < dateOnly) {
            console.log("Test4");
            await paymentLog.update(
              {
                status: 2,
              },
              {
                where: {
                  company_id: companyDetails.id,
                  companyName: companyDetails.name,
                  companyEmail: companyDetails.email,
                  status: 1,
                },
                transaction: dbTransaction,
              }
            );

            console.log("Test5");
            await paymentLog.create(
              {
                company_id: companyDetails.id,
                companyName: companyDetails.name,
                companyEmail: companyDetails.email,
                planId: id,
                planName: name,
                amountPaid: price,
                allowedEmployeeCount: userCount,
                startDate: userData.start_date,
                endDate: userData.end_date,
                status: 1,
              },
              { transaction: dbTransaction }
            );

            console.log("Test6");
            await company.update(
              {
                currentPlanId: id,
                planEmployeeCount: userCount,
                planStartDate: userData.start_date,
                planEndDate: userData.end_date,
                status: 1,
              },
              {
                where: { id: companyDetails.id, email: companyDetails.email },
                transaction: dbTransaction,
              }
            );

            await permissionInstance.allowRolePermissions(companyDetails.id);
          } else {
            //* else update the paymnet log only
            console.log("Test7");
            await paymentLog.create(
              {
                company_id: companyDetails.id,
                companyName: companyDetails.name,
                companyEmail: companyDetails.email,
                planId: id,
                planName: name,
                amountPaid: price,
                allowedEmployeeCount: userCount,
                startDate: userData.start_date.split("T")[0],
                endDate: userData.end_date.split("T")[0],
                status: 0,
              },
              { transaction: dbTransaction }
            );
          }
        } else {
          //* If new plan id is not the same as of current plan id
          console.log("Test8");
          await paymentLog.update(
            {
              status: 3,
            },
            {
              where: {
                company_id: companyDetails.id,
                companyName: companyDetails.name,
                companyEmail: companyDetails.email,
                status: 1,
              },
              transaction: dbTransaction,
            }
          );

          console.log("Test9");
          await paymentLog.create(
            {
              company_id: companyDetails.id,
              companyName: companyDetails.name,
              companyEmail: companyDetails.email,
              planId: id,
              planName: name,
              amountPaid: price,
              allowedEmployeeCount: userCount,
              startDate: userData.start_date,
              endDate: userData.end_date,
              status: 1,
            },
            { transaction: dbTransaction }
          );

          console.log("Test10");
          await company.update(
            {
              currentPlanId: id,
              planEmployeeCount: userCount,
              planStartDate: userData.start_date,
              planEndDate: userData.end_date,
              status: 1,
            },
            {
              where: { id: companyDetails.id, email: companyDetails.email },
              transaction: dbTransaction,
            }
          );
        }

        console.log("Test11");
        await permissionInstance.allowRolePermissions(companyDetails.id);

        let textMessage = `Congratulations ${companyDetails.name},\n\nYou have successfully bought the Emonitrix Plan Pack ${name} and it will be valid for ${duration} days. \n\nBest regards`;

        let subject = "Emonitrix Monthly Subscription";
        let sendmail = await H.sendM(companyDetails.id, companyDetails.email, subject, textMessage);

        console.log("Test12");
        if (!sendmail.success) {
          console.log("Test13");
          await dbTransaction.rollback();
          return { status: false, message: "Please Set the Email Credentials First" };
        }

        console.log("Test14");
        await dbTransaction.commit();
        return { status: true, message: "Plan Purchased Successfully" };
      } else {
        return { status: false, message: "Request Submitted did not belongs to Emonitrix" };
      }
    } catch (error) {
      console.error("Error in Payment Controller:", error);
      return { status: false, message: "Unable to Retrieve Plan List" };
    }
  };
}

export default paymentController;
