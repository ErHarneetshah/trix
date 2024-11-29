import Joi from "joi";

class teamValidationSchema {
  static teamSchema = Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Name is required",
    }),
    username: Joi.string().required().messages({
      "any.required": "Username is required",
    }),
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.email": "Please provide a valid email",
    }),
    password: Joi.string()
      .min(8)
      .required()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
      )
      .messages({
        "any.required": "Password is required",
        "string.min": "Password must be at least 6 characters long",
      }),
    mobile: Joi.string().min(10).required().messages({
      "any.required": "Mobile Number is required",
      "string.min": "Mobile Number must be at least 10 characters long",
    }),
    departmentId: Joi.required().messages({
      "any.required": "Department Id is required",
    }),
    // workstationId: Joi.required().messages({
    //   "any.required": "Workstation Id is required",
    // }),
    designationId: Joi.required().messages({
      "any.required": "Designation Id is required",
    }),
    roleId: Joi.required().messages({
      "any.required": "Role Id is required",
    }),
    // teamId: Joi.required().messages({
    //   "any.required": "Team Id is required",
    // }),
    country: Joi.string().required().messages({
      "any.required": "Country is required",
    }),
  });
  
  static loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.email": "Please provide a valid email",
    }),
    password: Joi.required().messages({
      "any.required": "Password is required"
    })
  });
}

export default teamValidationSchema;
