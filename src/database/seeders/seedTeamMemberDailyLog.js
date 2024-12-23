import teamMemberDailyLog from '../models/teamMemberDailyLogModel.js';
import sequelize from '../queries/dbConnection.js';

const generateRandomTime = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  const randomMinutes = Math.floor(
    Math.random() * (endTotalMinutes - startTotalMinutes) + startTotalMinutes
  );

  const randomHour = Math.floor(randomMinutes / 60);
  const randomMinute = randomMinutes % 60;

  return `${String(randomHour).padStart(2, "0")}:${String(randomMinute).padStart(2, "0")}`;
};

const generateDummyData = async (transaction) => {
  const dummyData = [];
  const empNames = ["Alice", "Bob", "Charlie", "David", "Eve"];
  const shifts = [
    ["09:00", "18:00"],
    ["10:00", "19:00"],
    ["08:30", "17:30"],
    ["11:00", "20:00"],
    ["07:00", "16:00"],
  ];

  for (let i = 1; i <= 30; i++) {
    const empId = 1000 + i;
    const empName = empNames[i % empNames.length];
    const shift = shifts[i % shifts.length];
    const shiftStart = shift[0];
    const shiftEnd = shift[1];
    const shiftTime = `${shiftStart} - ${shiftEnd}`;

    const arrivedTime = generateRandomTime(shiftStart, shiftEnd);
    const leftAt = generateRandomTime(arrivedTime, shiftEnd);

    const productiveTimeMinutes =
      (parseInt(leftAt.split(":")[0]) - parseInt(arrivedTime.split(":")[0])) * 60 +
      (parseInt(leftAt.split(":")[1]) - parseInt(arrivedTime.split(":")[1]));

    const productiveTime =
      productiveTimeMinutes > 0
        ? `${Math.floor(productiveTimeMinutes / 60)
            .toString()
            .padStart(2, "0")}:${(productiveTimeMinutes % 60)
            .toString()
            .padStart(2, "0")}`
        : "00:00";

    const status = i % 2 === 0; // Alternating boolean values (true/false)

    dummyData.push({
      id: i,
      empId: empId.toString(),
      empName,
      status,
      productiveTime,
      shiftTime,
      arrivedTime,
      leftAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Insert into the database
  for (const requestData of dummyData) {
    await teamMemberDailyLog.create(requestData, { transaction });
  }

  //console.log("Dummy data inserted successfully!");
};

(async () => {
  const transaction = await sequelize.transaction();
  try {
    await generateDummyData(transaction);
    await transaction.commit();
    console.error("Seeding Modules Completed");
  } catch (error) {
    console.error("Error inserting dummy data:", error.message);
    await transaction.rollback();
  }
})();
