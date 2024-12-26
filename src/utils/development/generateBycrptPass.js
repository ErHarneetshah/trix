import bcrypt from "bcrypt";

const password = await bcrypt.hash("Test@123", 10);
//console.log("Generated Password: " + password);