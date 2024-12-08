// import { ACCESS_TOKEN } from "../config.js";
import appConfig from "../../app/config/appConfig.js";
import JWT from "jsonwebtoken";
import fs from 'fs';
import { parse } from 'tldts';



const ACCESS_TOKEN = new appConfig().getJwtConfig();

export default { 
    sendResponse: (res, statusCode, status, data, message,) => {
        res.status(statusCode).json({
            status: status,
            message: message ||  (status === 1 ? 'Success' : 'Error'),
            data: data || null,
        });
    },   
    // jwtToken: (id) => {
    //     return JWT.sign({
    //         userInfo: {
    //             id: id
    //         },
    //     }, ACCESS_TOKEN, { expiresIn: "1m" })
    // },
    
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
    }    ,

    extractWebsiteName: (url)=> {
        try {
            const parsed = parse(url);
            return parsed.domain 
          } catch (error) {
            console.error('Invalid URL:', url);
            return null;
          }
      }
}
