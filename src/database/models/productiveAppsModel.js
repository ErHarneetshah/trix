import { DataTypes } from 'sequelize';
import sequelize from '../queries/dbConnection.js';

const appInfo = sequelize.define('productive_apps', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    // app_logo: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    // },
    app_name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: true,
});

export default appInfo;
