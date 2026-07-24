//initiate server
//use the middleware,api routes created

const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors")
const passport = require("./config/passport.config")

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(passport.initialize());

/* require all the routes here*/
const authRouter = require("./routes/auth.routes");
const interviewRouter=require("./routes/interview.routes")

/* using all the routes here*/
app.use("/api/auth", authRouter);
app.use("/api/interview",interviewRouter);



module.exports = app;