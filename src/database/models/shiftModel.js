import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";
import variables from "../../app/config/variableConfig.js";
import helper from "../../utils/services/helper.js";

const shift = sequelize.define(
  "shifts",
  {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total_hours: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    days: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt columns
    underscored: false,
    hooks: {
      async beforeCreate(shift) {
        try {
          let calTotalHrTime = await calTotalHr(shift.start_time, shift.end_time);
          if (calTotalHr < 5) return helper.failed(res, variables.ValidationError, "Start Time and End Time Must have a difference of 5 hours or more");

          shift.total_hours = calTotalHrTime;
        } catch (error) {
          return helper.failed(res, variables.BadRequest, error.message);
        }
      },
      async beforeUpdate(shift) {
        if (shift.changed("start_time") || shift.changed("end_time")) {
          try {
            let calTotalHrTime = await calTotalHr(shift.start_time, shift.end_time);
            if (calTotalHrTime < 5) throw new Error("Start & End Time Must have atleast 5 hours difference");

            shift.total_hours = calTotalHrTime;
          } catch (error) {
            throw new Error(error.message);
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

  // //console.log(totalMinutes/60);
  return totalMinutes / 60;
};

// await shift.sync({alter:1});

export default shift;
