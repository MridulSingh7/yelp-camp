const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')


//last lecture
/*
pehle image schema banae aur usko pass kiye campgrounds schema me
then virtual property define kie, thumbnail define kiye uska function banae
thumbnail.url ko modify kiye, for all thumbnail, /uploads ko /uploads/w_200 kardiya
isse sabka width 200px hojaega, this is used from cloudinary transform;
a method to lower the resolution in order to load images or files fast
this is helpful because kabhi kabhi we just need a thumbnial and nota real image

now edit form me youll have access to img.thumbnail because we defined thumbnail
*/
const ImageSchema = new Schema({
        url:String,
        fileName:String
    })
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title:String,
    price:String,
    images:[ImageSchema],
    description:String,
    location:String, 
    author : {
        type : Schema.Types.ObjectId ,
        ref : 'User'
    },
    reviews: [{
        type : Schema.Types.ObjectId,
        ref: "Review"
    }],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }}},opts)


        CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
            return `
            <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
            <p>${this.description.substring(0, 20)}...</p>`
        });
        
        

CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in : doc.reviews
            }
        })
    }
})//
// what does it do?
// if document that was deleted, review . delete many , id if id was in document ka reviews, then delete that id 
//i.e this will only delete the id that was available in the doc.reviews

module.exports= mongoose.model('Campground', CampgroundSchema);