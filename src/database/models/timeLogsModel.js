import { DataTypes } from 'sequelize';
import sequelize  from '../queries/dbConnection.js';

// Define TimeLog model
const TimeLog = sequelize.define('timelogs',{
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shift_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    company_id:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    logged_in_time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    late_coming_duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    logged_out_time: {
      type: DataTypes.STRING,
      allowNull: true
    },
    early_going: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
    late_coming: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
    spare_time:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idle_time:{
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: false,
  }
);

TimeLog.afterUpdate(async (timeLog) => {
 if(timeLog){
  let { logged_in_time, logged_out_time } = timeLog;

  // Ensure both logged_in_time and logged_out_time are present
  if (logged_in_time && logged_out_time) {
    let [loginHours, loginMinutes] = logged_in_time.split(":").map(Number);
    let [logoutHours, logoutMinutes] = logged_out_time.split(":").map(Number);

    let loginTimeInMinutes = loginHours * 60 + loginMinutes;
    let logoutTimeInMinutes = logoutHours * 60 + logoutMinutes;

    let totalDurationInMinutes = logoutTimeInMinutes - loginTimeInMinutes;

    let totalHours = Math.floor(totalDurationInMinutes / 60);
    let totalMinutes = totalDurationInMinutes % 60;
    await TimeLog.update(
      { active_time: `${totalHours}:${totalMinutes}` },
      { where: { id: timeLog.id } }
    );
  }
 }
});

await TimeLog.sync({ alter: 1 });

export default TimeLog;
