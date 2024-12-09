import { DataTypes } from 'sequelize';
import sequelize from '../queries/dbConnection.js';

const reportSettings = sequelize.define('report_settings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: true,
        },
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '1 => Active ,0=>Not Active'
    }
}, {
    timestamps: true,
});

export default reportSettings;
