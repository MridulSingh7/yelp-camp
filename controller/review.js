const Review = require('../models/review.js')
const campground = require('../models/campground.js')

module.exports.createReview =  async(req,res)=>{
    const {id} = req.params;
    const camp = await campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
     await review.save();
     await camp.save();
     req.flash('success', 'successfully made a new review')
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteReview = async(req,res,next)=>{
    const {id,reviewId} = req.params;
    await campground.findByIdAndUpdate(id, {$pull : { review: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'successfully deleted the review')
    res.redirect(`/campgrounds/${id}`);
}