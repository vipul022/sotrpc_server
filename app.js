const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const userRouter = require("./routes/user_routes");
const classRouter = require("./routes/pottery_classes_routes");
const photoRouter = require("./routes/photo_routes");
const MongoStore = require("connect-mongo")(session)
const passport = require("passport");
const aws = require('aws-sdk');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Cors
const whitelist = ["https://southoftheriverpottersclub.herokuapp.com/", "https://sotrpc-server.herokuapp.com/", "http://localhost:3001", "http://localhost:3000"]
app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
      // Check each url in whitelist and see if it includes the origin (instead of matching exact string)
      const whitelistIndex = whitelist.findIndex((url) => url.includes(origin));
      callback(null, whitelistIndex > -1);
    },
  })
);

// Session storage
app.use(session({
    secret: "This better work, Vader",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: 3600000,
      // sameSite: 'none',
      // secure: true,
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
    }),
  })
);

// Database connection
const dbConn = process.env.MONGODB_URI || "mongodb://localhost/SOTRPC";
mongoose.connect(dbConn, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    },
    (err) => {
        if (err) {
            console.log("Error connecting to database", err);
        } else {
            console.log("Connected to database", dbConn);
        }
});
// Passport initialize
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

// S3 initialize
aws.config.update({
  region: 'ap-southeast-2', // Put your aws region here
  // Configure aws with your accessKeyId and your secretAccessKey
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey
})

//Routes
app.use("/users", userRouter);
app.use("/classes", classRouter);
app.use("/photos", photoRouter);

// Home page test
app.get("/", (req, res) => {
    res.send("Welcome")
})

// Port
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`SOTRPC app listening on port ${port}`)
})
