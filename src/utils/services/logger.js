// import fs from 'fs';
// import path from 'path';

// export const logError = (res,errorMessage) => {
//     let filePath = res.req?.originalUrl || 'Unknown URL';
//     const errorLogPath = path.resolve(__dirname, 'err.txt');
//     const timestamp = new Date().toISOString();
//     const logEntry = `[${timestamp}] File: ${filePath}\nError: ${errorMessage.stack}\n\n`;
//     // Read the existing log file and add the new entry at the top
//     fs.readFile(errorLogPath, 'utf8', (err, data) => {
//         if (err && err.code !== 'ENOENT') {
//             console.error("Failed to read err.txt:", err.message);
//             return;
//         }
//         // Sort by newest entry first
//         const updatedLog = logEntry + (data || '');
//         // Write back the sorted log
//         fs.writeFile(errorLogPath, updatedLog, (writeErr) => {
//             if (writeErr) {
//                 console.error("Failed to write to err.txt:", writeErr.message);
//             } 
//         });
//     });
//     return failed(res,errorMessage.message,500)
//   };
//   export const clearErrorLog = () => {
//     const errorLogPath = path.resolve(__dirname, 'err.txt');
    
//     fs.writeFile(errorLogPath, '', (err) => {
//         if (err) {
//             console.error("Failed to clear err.txt:", err.message);
//         } else {
//             console.log("Error log cleared successfully.");
//         }
//     });
//   };
  