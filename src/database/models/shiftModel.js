import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";

const shift = sequelize.define(
  "shifts",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    start_time: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    end_time: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    total_hours: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    days: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt columns
    hooks: {
      async beforeCreate(shift) {
        try {
          shift.total_hours = await calTotalHr(shift.start_time, shift.end_time);
        } catch (error) {
          throw new Error("Error calculating total hours: " + error.message);
        }
      },
      async beforeUpdate(shift) {
        if (shift.changed("start_time") || shift.changed("end_time")) {
          try {
            shift.total_hours = await calTotalHr(shift.start_time, shift.end_time);
          } catch (error) {
            throw new Error("Error recalculating total hours: " + error.message);
          }
        }
      },
    },
  }
);

const calTotalHr = async (start_time, end_time) => {
  const [startHour, startMinute] = start_time.split(":").map(Number);
  const [endHour, endMinute] = end_time.split(":").map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  let totalMinutes;
  if (endTotalMinutes >= startTotalMinutes) {
    totalMinutes = endTotalMinutes - startTotalMinutes;
  } else {
    totalMinutes = 24 * 60 - startTotalMinutes + endTotalMinutes;
  }

  return totalMinutes / 60;
};

export default shift;
