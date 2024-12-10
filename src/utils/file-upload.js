import path from 'path';
import fs from 'fs';

const uploadImage = (req, folder, file) => {
    return new Promise((resolve, reject) => {
        try {
            // Define the folder path where the file will be stored
            const uploadPath = path.join(__dirname, `../uploads/${folder}`);

            // Check if the folder exists, if not, create it
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            // Define the file path
            const filename = file.fieldname + '-' + Date.now() + '-' + Math.floor(Math.random() * 9999999) + path.extname(file.originalname);
            const filePath = path.join(uploadPath, filename);

            // Save the file to the folder
            fs.writeFile(filePath, file.buffer, (err) => {
                if (err) {
                    return reject("Error uploading file: " + err.message);
                }

                // Return the URL or path to the uploaded file
                const fileUrl = `/uploads/${folder}/${filename}`;
                resolve(fileUrl);
            });
        } catch (error) {
            console.log(error.message);
            reject("Error in uploadImage: " + error.message);
        }
    });
};

export default { uploadImage }
