let whitelist = ["http://192.168.11.89:3000", "http://localhost:3001", "http://192.168.11.67:3000", "http://192.168.11.67:3001", "http://192.168.11.89:3001" ,"http://192.168.1.72:3000", "http://192.168.1.72:3001" ,"http://192.168.11.65:3000" , "http://192.168.11.65:3001", "http://192.168.11.81:3000" , "http://192.168.11.81:3001", "http://192.168.11.94:3001", "http://192.168.11.94:3000" , "http://localhost:3001"];
let corsMiddleware = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log({klkkl:"kllkl"})
      callback(null, true);
    } else {
      console.log({klkkl:"fail"})

      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus:200

};

export default corsMiddleware;
