import Joi from "joi";

class authValidationSchema {
  static passwordSchema = Joi.string().min(6).required().messages({
    "any.required": "Password is required",
    "string.base": "Password must be a String",
    "string.min": "Password must be at least 6 characters long",
  });

  static authSchema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.email": "Please provide a valid email",
    }),

    phoneNumber: Joi.string().min(10).required().messages({
      "any.required": "Phone Number is required",
      "string.min": "Phone Number must be at least 10 characters long",
    }),
    deviceId: Joi.string().messages({
      "any.required": "Device Id is required",
    }),
    deviceName: Joi.string().messages({
      "any.required": "Device Name is required",
    }),
    country: Joi.string().required().messages({
      "any.required": "Country is required",
    }),
    password: Joi.string().min(6).required().messages({
      "any.required": "Password is required",
      "string.min": "Password must be at least 6 characters long",
    }),
    username: Joi.string().required().messages({
      "any.required": "Username is required",
    }),
    department: Joi.string().required().messages({
      "any.required": "Department is required",
    }),
    designation: Joi.string().required().messages({
      "any.required": "Designation is required",
    }),
  });
  static userLoginSchema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.email": "Please provide a valid email",
    }),
    password: this.passwordSchema,
  });
}

export default authValidationSchema;
