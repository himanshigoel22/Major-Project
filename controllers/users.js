const User = require("../models/user.js");

module.exports.renderSignUpForm = (req,res) =>{
    res.render("users/signUp.ejs");
};

module.exports.signUp = async(req,res) =>{
    try{
    let {username , email , password} = req.body;
    let newUser = User({username , email});
    let regUser = await User.register(newUser, password);
    console.log(regUser);
    req.login(regUser , (err) =>{
        if(err){
            return next(err);
        }
        req.flash("success" , "Welcome to WanderLust!");
        res.redirect("/listing");
    });
} catch(e) {
        req.flash("error" , "e.message");
        res.redirect("/listing");
}};

module.exports.renderLogInForm = (req,res) =>{
    res.render("users/login.ejs");
   };

module.exports.LogIn = async(req,res) => {
    req.flash("success" ,"Welcome back to WanderLust!");
   let redirectUrl = res.locals.redirectUrl || "/listing";
    res.redirect(redirectUrl);
   };

module.exports.logOut =  (req,res,next) => {
    req.logOut( (err) => {
       if(err){
           return next(err);
       }
       req.flash("success" ,"You are Logged Out!");
       res.redirect("/listing");
    });
   };