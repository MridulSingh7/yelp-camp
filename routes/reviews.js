const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const review = require('../models/review')
const {isLoggedIn,isReviewAuthor,validateReview} = require('../middleware.js');
const reviews = require('../controller/review.js')
const ExpressErrors = require('../utils/ExpressErrors.js');
const campground = require('../models/campground.js')

router.route("/")
.post(isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))



router.get('/favicon.ico', (req, res) => res.status(204).end());
router.get('/dfsmfodmsf', (req, res) => res.status(204).end());

module.exports = router;