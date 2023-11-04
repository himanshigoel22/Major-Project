if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
};

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate= require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const mongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const reviewsRouter = require("./routes/reviews.js");
const listingsRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(dbUrl);
}

// app.get("/" , (req , res) =>{
//     res.send(" hi am root");
// });

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname , "/public")));

const store = mongoStore.create({
    mongoUrl : dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24*3600
});

store.on("error" , () => {
    console.log("ERROR in Mongo session store" , err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized:true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listing" , listingsRouter);
app.use("/listing/:id/reviews" , reviewsRouter);
app.use("/" , userRouter);

app.all("*" , (req,res,next) => {
  next(new ExpressError(404 , "page not found!"));
});
 //error handling
app.use((err, req, res, next) => {
  let {StatusCode = 500 , message ="something went wrong!"} = err;
  res.status(StatusCode).render("listings/error.ejs" , {message});
 });

app.listen(8080 , () =>{
    console.log("app is listening");
});