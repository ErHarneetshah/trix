import cron from 'node-cron';
import cronFunctions  from './cronFunctions.js';

cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running scheduled task at midnight');
  
      // Place your function or task here
      await cronFunctions.sendEmailWithReports();
  
      console.log('Task completed successfully');
    } catch (error) {
      console.error('Error running scheduled task:', error);
    }
  });