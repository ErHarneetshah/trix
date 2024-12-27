import { DataTypes } from 'sequelize';
import sequelize from '../queries/dbConnection.js';

const emailGateway = sequelize.define('email_gateways', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    protocol: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50], 
        },
        comment: 'Protocol type (e.g., SMTP, HTTP)',
    },
    host: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50], // Ensures length between 2 and 50
        },
        comment: 'Host address of the email gateway',
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
        comment: 'Username (email address) for authentication',
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Password for authentication',
    },
    port: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50], // Ensures length between 2 and 50
        },
        comment: 'Port number for connection',
    },
    encryption: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50], // Ensures length between 2 and 50
        },
        comment: 'Encryption type (e.g., SSL, TLS)',
    }, is_active: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '1 => Active, 0 => Not Active',
    },fromUsername: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: true,
    // Prevent Sequelize from auto-creating foreign keys
    underscored: false,
});

// await emailGateway.sync({alter:1});

export default emailGateway;
