import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import axios from "axios";

class paymentController {
  getPaymentPlans = async (req, res) => {
    try {
      const privateKey = process.env.EMONITRIX_PRIVATE_KEY.replace(/"/g, "");
      console.log(privateKey);
      const response = await axios.get(`${process.env.SuperAdmin_BASE_URL}/api/product/getProductPlans?api_key=${privateKey}`);

      if (!response.data) return helper.failed(res, variables.BadRequest, "Unable to Retrieve Plan List");

      return helper.success(res, variables.Success, "Plan List Retrieved", response.data.data);
    } catch (error) {
      console.error("Error in Payment Controller:", error.message);
      return helper.failed(res, variables.BadRequest, "Unable to Retrieve Plan List");
    }
  };

  buyPaymentPlan = async (req, res) => {
    try {
      let { planId } = req.body;
      if(!req.user.isAdmin) return helper.failed(res, variables.ValidationError, "You are not authorized");
      if(!planId || isNaN(planId)) return helper.failed(res, variables.ValidationError, "Select a Plan to Buy");
      // if(!productId || isNaN(productId)) return helper.failed(res, variables.ValidationError, "Unable to Identify Product Request");

      const gateway_id = `${process.env.GATEWAY_ID}`;
      const privateKey = process.env.EMONITRIX_PRIVATE_KEY.replace(/"/g, "");
      const redirect_url = `${process.env.DEMO_URL}/dashboard`;      

      console.log({
        url: `${process.env.SuperAdmin_BASE_URL}/api/subscription/purchaseSubscription`,
        plan_id: `${planId}`,
        api_key: `${privateKey}`,
        email: `${req.user.email}`,
        gateway_id: `${gateway_id}`,
        redirect_url: `${redirect_url}`,
      })

      const response = await axios({
        method: "post",
        url: `${process.env.SuperAdmin_BASE_URL}/api/subscription/purchaseSubscription`,
        data: {
          plan_id: `${planId}`,
          api_key: `${privateKey}`,
          email: `${req.user.email}`,
          gateway_id: `${gateway_id}`,
          redirect_url: `${redirect_url}`,
        },
      });

      if (!response.data) return helper.failed(res, variables.BadRequest, "Unable to Retrieve Plan List");

      return helper.success(res, variables.Success, "Plan List Retrieved", response.data.data);
    } catch (error) {
      console.error("Error in Payment Controller:", error.message);
      return helper.failed(res, variables.BadRequest, "Unable to Retrieve Plan List");
    }
  };
}

export default paymentController;
