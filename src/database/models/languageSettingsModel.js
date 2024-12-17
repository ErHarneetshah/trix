import { DataTypes } from 'sequelize';
import sequelize from '../queries/dbConnection.js';

const languageSettings = sequelize.define('language_settings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    language_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '1=>english_id'
    },
    theme_id: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '1=>LTR,2=>RTL'
    }
}, {
    timestamps: true,
    underscored: false,
});

// await languageSettings.sync({alter:1});
export default languageSettings;
