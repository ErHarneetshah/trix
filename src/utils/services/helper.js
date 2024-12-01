import { ACCESS_TOKEN } from "../config.js";
import appConfig from "../../app/config/appConfig.js";
import JWT from "jsonwebtoken";
import fs from 'fs';

export default { 
    sendResponse: (res, statusCode, data, message,) => {
        res.status(statusCode).json({
            status: 1,
            message: message || 'Success',
            data: data || null,
        });
    },   
    jwtToken: (id) => {
        return JWT.sign({
            userInfo: {
                id: id
            },
        }, ACCESS_TOKEN, { expiresIn: "1m" })
    },
    
    deleteFile: (filePath)=> {
        try {
            fs.unlink(filePath, (err) => {                
                if (err) {
                    console.error('Failed to delete file', err);
                } else {
                    console.log('File deleted successfully.');
                }
            });
        } catch (error) {
            console.log({ "del_file_error": error });
            return { message: `Unable to delete file at this moment`, status: 0 };
        }
    }    
}
