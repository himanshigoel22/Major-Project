const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router.route("/signUp")
.get( userController.renderSignUpForm)
.post( wrapAsync(userController.signUp));

router.route("/login")
.get( userController.renderLogInForm)
.post(saveRedirectUrl , 
passport.authenticate("local" , {
    failureFlash: true,
    failureRedirect: "/login"}) , 
    userController.LogIn
);

router.get("/logOut" , userController.logOut);

module.exports = router;