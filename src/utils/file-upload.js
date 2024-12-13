import { log } from "console";
import multer from "multer";
import path from "path";
import helper from "../utils/services/helper.js";
import variables from "../app/config/variableConfig.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

            console.log({'pathnameeeeeeeeee':req.headers.mypath})
        cb(null, `./assets/${req.headers.mypath}`);
    },
    filename: function (req, file, cb) {
        let extensionFile = path.extname(file.originalname);
        
        let saveFileName = `${Date.now()}${extensionFile}`;
        cb(null, saveFileName);                                        
    }
});

const checkFileType = (file, cb) => {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf' && ext !== '.xlsx' && ext !== '.svg') {
        return cb(new Error('Only png, jpg , jpeg , svg and pdf are allowed'));
    }

    return cb(null, true);
}

const upload = multer({
    storage: storage, fileFilter: (req, file, cb) => { checkFileType(file, cb) }
}).single("file");

const fileUpload = async (req, res, next) => {
 try {
    upload(req, res, (err) => {
   

        if (err) {
            // let result = helper.failed(res , variables.InternalServerError , err);
            let result = {
                status: 0,
                message: err,
             };
            req.filedata = result;
            next();
        }

      
        if (req.file == undefined) {
            console.log('inside undefined')
            req.filedata = {
                status: 0,
                message: "Invalid Data!!",
             }
            // req.filedata = reply.failed("Invalid Data!!");
            next();
        }


        req.filedata = {
            status: 1,
            message: "success",
            data: req.file?.filename
         };
        // req.filedata = reply.success(req.file?.filename);
        next();
    });
 } catch (error) {
    console.log(error)
 }
}





export default fileUpload;