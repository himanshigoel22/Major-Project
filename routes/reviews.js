const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listing.js");
const review = require("../models/review.js");
const {validateReview, isLoggedIn , isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

//review post model
router.post("/", isLoggedIn,
 validateReview , wrapAsync(reviewController.createReview));

//review delete route
router.delete("/:reviewId" , isLoggedIn,
isReviewAuthor,
wrapAsync(reviewController.destroyReview));

module.exports = router;