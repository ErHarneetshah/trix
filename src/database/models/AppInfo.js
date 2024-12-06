import { DataTypes } from 'sequelize';
import sequelize from '../queries/dbConnection.js';

const appInfo = sequelize.define('productive_nonproductive_apps', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    app_logo: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    appname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    website_url: {  
        type: DataTypes.TEXT,
        allowNull: false,
    },
    is_productive: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '1 => Productive App,0=>Non Productive Apps'
    }
}, {
    timestamps: true,
});

await appInfo.sync({ alter: true})

export default appInfo;
