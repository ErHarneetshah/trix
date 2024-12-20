import multer from 'multer';
import uploadImage from '../file-upload.js';

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

const getNextMonthDate = () => {
    const today = new Date();
    // const today = new Date('Wed Jan 01 2025 00:00:00 GMT+0530');
    
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
     return nextMonthDate.toLocaleDateString('en-CA');
};

const getNextMondayDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilNextMonday = (8 - dayOfWeek) % 7;
    const nextMondayDate = new Date(today);
    nextMondayDate.setDate(today.getDate() + daysUntilNextMonday);
    return nextMondayDate.toISOString().split('T')[0];
};

const getTomorrowDate = () => {
    const today = new Date();
    const tomorrowDate = new Date(today);
    tomorrowDate.setDate(today.getDate() + 1);
    return tomorrowDate.toISOString().split('T')[0];
};
export default { uploadPhotos, getNextMonthDate, getNextMondayDate, getTomorrowDate }
