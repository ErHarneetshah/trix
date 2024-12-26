import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";
// import { getUserStats } from "../../app/sockets/socket.js";

export const ImageUpload = sequelize.define(
  "image_upload",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    company_id:{
      type: DataTypes.INTEGER,
      allowNull:false
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    // Prevent Sequelize from auto-creating foreign keys
    underscored: false,
    // hooks: {
    //   afterCreate: (imageUpload, options) => {
    //     getUserStats();
    //   },
    // },
  }
);

// await ImageUpload.sync({ alter: 1 });