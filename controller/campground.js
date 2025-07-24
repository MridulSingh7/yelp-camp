//maps step 1
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


const campground = require('../models/campground');
const {cloudinary} = require('../cloudinary')
const Review = require('../models/review.js')
module.exports.index = async (req,res)=>{
    const campgrounds = await campground.find({});
    res.render('campgrounds/index', {campgrounds});//this is sent to index.ejs wale file 
}

module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new');
}

module.exports.createNewCampground = async (req, res)=>{
    
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const camp = new campground(req.body.campground);
    camp.geometry.type = geoData.features[0].geometry.type;
    camp.geometry.coordinates = geoData.features[0].geometry.coordinates;
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    if(req.user){
    camp.author = req.user._id;
    }
    console.log(camp);
    await camp.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${camp._id}`)

}



module.exports.showCampground = async(req,res)=>{
   // const camp = await campground.findById(req.params.id).populate('reviews').populate('author'); //populate reviews added bad me, why? to show reviews
   //this was old, we do nested populations so to store reviews and their author too
   const camp = await campground.findById(req.params.id).populate({path:'reviews',populate:{path:'author'}}).populate('author') 
   //this is how to populate, populate path reviews pehle review ko populate karo uske author se, fir us campground ko populate karo uske author se
   
   if(!camp){
        req.flash("error", "oops, couldnt find that campground")
        return res.redirect("campgrounds");
    }
    res.render('campgrounds/show', {camp});
}

module.exports.renderEditForm = async(req,res)=>{
    const camp = await campground.findById(req.params.id)
    if(!camp){
        req.flash("error", "oops, couldnt find that campground")
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/edit', {camp});    
}

module.exports.editCampground = async(req,res)=>{
    const {id} = req.params;
    const camp = await campground.findByIdAndUpdate(
        id,
        { ...req.body.campground },
        { new: true, runValidators: true }
    );
    const imgs = req.files.map(f => ({url: f.path , fileName : f.filename}));
    camp.images.push(...imgs);
    console.log(req.body.deleteImages)
//now for deleting, we run a loop, pehle we pull it from the cloudinary and then we take it out of the camogrounds
     if(req.body.deleteImages){
        
        //to delete from the cloudinary, a predefined function, uses cloudinary package
        for(let fileName of req.body.deleteImages){
        await cloudinary.uploader.destroy(fileName);
        }
        await camp.updateOne({$pull : {images:{fileName:{$in:req.body.deleteImages}}}});
        //i.e if there exist any image in the delete image request 
        //then pull out, images me se, jiska filename , is inside request body deleteImages array
     }



    await camp.save();
    req.flash('success', 'successfully updated the campground')
    res.redirect(`/campgrounds/${camp._id}`);

}

module.exports.deleteCampground = async (req,res)=>{
    const {id} = req.params;
    await campground.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted the campground')
    res.redirect('/campgrounds');
}