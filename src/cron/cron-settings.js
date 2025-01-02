import cron from 'node-cron';
import cronFunctions  from './cronFunctions.js';

cron.schedule('0 0 * * *', async () => {
    try {
  
      // Place your function or task here
      await cronFunctions.sendEmailWithReports();
  
    } catch (error) {
      console.error('Error running scheduled task:', error);
    }
  });