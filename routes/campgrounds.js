const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');
const ExpressErrors = require('../utils/ExpressErrors');
const catchAsync = require('../utils/catchAsync');
const {campgroundSchema } = require('../schemas.js')
const {isLoggedIn, storeReturnTo, isAuthor,validateCampground} = require('../utils/middleware.js');
const campgrounds = require('../controller/campground.js')
const multer = require('multer');
const storage = require('../cloudinary/index') 
const upload = multer(storage) 

router.route('/')
.get(catchAsync(campgrounds.index))
.post(isLoggedIn,upload.array('images'), catchAsync(campgrounds.createNewCampground));

router.route('/new')
.get(isLoggedIn,campgrounds.renderNewForm);

router.route('/:id')
.get(catchAsync(campgrounds.showCampground))
.put(isLoggedIn,isAuthor, upload.array('images'),catchAsync(campgrounds.editCampground))
.delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground))

router.route('/:id/edit')
.get(isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm));


router.get('/favicon.ico', (req, res) => res.status(204).end());
router.get('/dfsmfodmsf', (req, res) => res.status(204).end());


module.exports = router;