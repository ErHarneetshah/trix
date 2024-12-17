import { DataTypes } from 'sequelize';
import sequelize from '../queries/dbConnection.js';

const languageDropdown = sequelize.define('languages', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    language: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    }
}, {
    timestamps: true,
    underscored: false,
});

// await languageDropdown.sync({alter:1});
export default languageDropdown;
