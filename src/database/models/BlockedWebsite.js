import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

export const BlockedWebsites = sequelize.define(
  "blocked_websites",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    website_name:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    website: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '1 => Blocked Websites,0=>Unblock Websites'
    },
  },
  {
    timestamps: true,
    // Prevent Sequelize from auto-creating foreign keys
    underscored: false,
    hooks: {
        async afterUpdate(user, options) {
          io.to('Admin').emit("getBlockedWebsites", {
            message: "Blocked website updated",
          });
          
        },
      },
  }
);


// await BlockedWebsites.sync({alter:1}); 

// BlockedWebsites.afterUpdate(()=>{
  
// })