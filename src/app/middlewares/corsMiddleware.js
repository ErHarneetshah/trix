// let whitelist = ["http://192.168.11.89:3000", "http://localhost:3001", "http://192.168.11.90:3000", "http://192.168.11.90:3001", "http://192.168.11.67:3000", "http://192.168.11.67:3001", "http://192.168.11.89:3001" ,"http://192.168.1.72:3000", "http://192.168.1.72:3001" ,"http://192.168.11.65:3000" , "http://192.168.11.65:3001", "http://192.168.11.81:3000" , "http://192.168.11.81:3001", "http://192.168.11.94:3001", "http://192.168.11.94:3000" , "http://localhost:3001", "http://192.168.11.48:3000", "http://192.168.11.48:3001", "http://192.168.11.71:5173", "http://192.168.11.97:3000", "http://192.168.11.97:3001"];
// let corsMiddleware = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
//   optionsSuccessStatus:200

// };

// export default corsMiddleware;

let corsMiddleware = {
  origin: true, // Allows all origins
  credentials: true, // Include credentials like cookies in the request
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

export default corsMiddleware;
