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
    logged_in_time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    total_active_duration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    late_coming_duration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    early_going_duration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logged_out_time: {
      type: DataTypes.STRING,
      allowNull: true
    },
    late_coming: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
    early_going: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    }
  },
  {
    timestamps: true,
    // Prevent Sequelize from auto-creating foreign keys
    underscored: false,
  }
);

await TimeLog.sync({ alter: 1 });

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
      { total_active_duration: `${totalHours}:${totalMinutes}` },
      { where: { id: timeLog.id } }
    );
  }
 }
});

await TimeLog.sync({alter:1});

export default TimeLog;
