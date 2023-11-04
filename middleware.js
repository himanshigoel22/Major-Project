const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingschema , reviewschema} = require("./schema.js");
const review = require("./models/review.js");

module.exports.isLoggedIn = (req , res, next) =>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error" , "You must be logged in to create a listing!")
        return res.redirect("/login");
      }
      next();
};

module.exports.saveRedirectUrl = (req , res, next) =>{
  if(req.session.redirectUrl){
      res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async(req , res, next) =>{
  let {id} = req.params;
  let listing = await Listing.findById(id);
  if(!listing.owner._id.equals(res.locals.currUser._id)){
    req.flash("error" , "You don't have access to this Listing!");
    return res.redirect(`/listing/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async(req , res, next) =>{
  let {id ,reviewId} = req.params;
  let Review = await review.findById(reviewId);
  if(!Review.author.equals(res.locals.currUser._id)){
    req.flash("error" , "You don't have access to delete this review!");
    return res.redirect(`/listing/${id}`);
  }
  next();
};

module.exports.validateListing = (req , res , next) =>{
  let {error} = listingschema.validate(req.body);
  if(error){
   let errMsg = error.details.map((el) => el.message).join(",");
   throw new ExpressError(400 ,error);
  }
  else{
    next();
  }};

module.exports.validateReview = (req , res , next) =>{
  let {error} = reviewschema.validate(req.body);
  if(error){
   let errMsg = error.details.map((el) => el.message).join(",");
   throw new ExpressError(400 ,error);
  }
  else{
    next();
  }};
