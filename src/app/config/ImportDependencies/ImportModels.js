import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importAndSyncAllModels() {
    try {
        const models = {};
        const modelsPath = path.resolve(__dirname, '../../../database/models');

        const files = fs.readdirSync(modelsPath).filter(file => file.endsWith('.js') && file !== 'app.js');

        for (const file of files) {
            const modelName = file.split('.')[0]; // Extract model name from the filename
            const modelPath = path.join(modelsPath, file);

            const module = await import(modelPath);
            const model = module.default || module; // Ensure we get the model (check for default export)

            // Models defined using sequelize.define don't require init()
            if (typeof model === 'function') {
                models[modelName] = model; // Assign directly if it's a `sequelize.define` model
            }
        }

        Object.values(models).forEach(model => {
            if (model.associate) {
                model.associate(models); // Call the associate method for relationships
            }
        });

        return models; // Return the models so they can be used elsewhere
    } catch (error) {
        console.error('Error during model import and sync:', error);
        throw error; // Rethrow error if necessary
    }
}

export default importAndSyncAllModels;
