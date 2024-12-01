import Joi from "joi";

class reportManagerValidationSchema {
  static addReportManagerSchema = Joi.object({
    userId: Joi.number()
      .required()
      // .custom(async (value, helpers) => {
      //   try {
      //     const user = await User.findOne({ where: { id: value } });
      //     if (!user) {
      //       return helpers.error("any.invalid", {
      //         message: "User ID does not exist in the system",
      //       });
      //     }
      //     return value;
      //   } catch (error) {
      //     console.error("Database Query Error:", error);
      //     return helpers.error("any.custom", {
      //       message: "User ID does not exist in the system",
      //     });
      //   }
      // }, "User ID existence validation")
      .messages({
        "any.required": "userId is required",
      }),

    teamId: Joi.number()
      .required()
      // .custom(async (value, helpers) => {
      //   try {
      //     const teamExists = await team.findOne({ where: { id: value } });
      //     if (!teamExists) {
      //       throw new error("Team ID does not exist in the system");
      //     }
      //     return value;
      //   } catch (error) {
      //     console.error("Database Query Error:", error);
      //     return error;
      //   }
      // }, "Team ID existence validation")
      .messages({
        "any.required": "teamId is required",
      }),
  });

  static updateReportManagerSchema = Joi.object({
    userId: Joi.number().required().messages({
      "any.required": "User Id is required",
    }),

    teamId: Joi.number().required().messages({
      "any.required": "Team Id is required",
    }),
  });

  static loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.email": "Please provide a valid email",
    }),
    password: Joi.required().messages({
      "any.required": "Password is required",
    }),
  });
}

export default reportManagerValidationSchema;
