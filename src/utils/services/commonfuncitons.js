import multer from 'multer';
import  uploadImage from '../file-upload.js';

async function uploadPhotos(req, res, folder, imageArr) {
    try {
        const storage = multer.memoryStorage();
        const upload = multer({ storage }).fields(imageArr);

        return new Promise((resolve, reject) => {
            upload(req, res, async (err) => {
                if (err) {
                    return reject(err);
                }

                const imagePaths = [];

                for (const image of imageArr) {
                    if (req.files && req.files[image.name]) {
                        for (const file of req.files[image.name]) {
                            const imagePath = await uploadImage(req, folder, file);
                            if (imagePath) {
                                imagePaths.push(imagePath);
                            }
                        }
                    } else {
                        return reject(`Field '${image.name}' is not found in request.`);
                    }
                }
                resolve(imagePaths);
            });
        });
    } catch (error) {
        logger.info(error.message);
        throw new Error('Upload failed: ' + error.message);
    }
}
export default { uploadPhotos }
