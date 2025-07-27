const {campgroundSchema, reviewSchema} = require('../schemas.js')//thse are joi schemas,validates schemas from req.body
const ExpressErrors = require('./ExpressErrors.js');
const campground = require('../models/campground.js');
const Review = require('../models/review.js');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.user) {
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};


module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    //destructured the error from here
    if (error) { //only if any error is found
        const msg = error.details.map(el => el.message).join(',') //we create a custom message to throw it as error
        throw new ExpressErrors(msg, 400) //throw express error we creaeted the model (expressErrors.js)
    } else {
        next(); //if there is no error make sure to use next() because this function is a middleware function hence it needs to be passed on
    }
}

module.exports.isAuthor = async(req,res,next)=>{
    const {id}=req.params; //will fetch the id of campground
    const camp = await campground.findById(id);
    if(!camp.author.equals(req.user._id)){
        req.flash('error', 'you cannot do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}   


module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId}=req.params; //will fetch the id of campground
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'you cannot do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}   

module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressErrors(msg,400)
    }
    else{
        next();
    }
}