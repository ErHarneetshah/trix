let whitelist = ["https://www.google.com", "http://192.168.11.89:3000" ,"http://192.168.1.72:3000" /*Home*/ ,"http://192.168.11.65:3000" , "http://192.168.11.65:3000", "http://192.168.11.94:3001", "http://192.168.11.94:3000"];
let corsMiddleware = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus:200

};

export default corsMiddleware;
