import { DataTypes } from 'sequelize';
import sequelize from '../queries/dbConnection.js';

const reportSettings = sequelize.define('report_settings', {
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
    // name: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    //     validate: {
    //         notEmpty: true,
    //     },
    // },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '1=>Monthly,2=>Weekly,3=>Daily'
    }
}, {
    timestamps: true,
    underscored: false,
});

// await reportSettings.sync({alter:1});
export default reportSettings;
