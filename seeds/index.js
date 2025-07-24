const mongoose = require('mongoose');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');
const Campground = require('../models/campground'); //we have our 

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');


const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("database connected");
});

//we create a separate function to have random title name form our array
const sample = (array)=>{
//array ka random index ko return karega to use it in a joining title name
    return array[Math.floor(Math.random()*array.length)];
//how to call? sample(arrayname) = will return the value at that random index of the array
}


const seedDB = async () => {
    await Campground.deleteMany({});
    
    for(let i=0; i<75;i++){
        const price = Math.floor(Math.random()*20)+10;
        const random1000 = Math.floor(Math.random()*1000);
        const camp = new Campground({
            location : `${cities[random1000].city}, ${cities[random1000].state}`,
            author : '68792075c636c38f200818ec',
            //what will this do? new Campground will create new data entry jiska location ka value will be
            // city array ka random index ka city,state ex city[0].city + city[0].state ex gaya,bihar if city[0]=gaya bihar
            title : `${sample(descriptors)} ${sample(places)}`,

            geometry:{
              type:"Point",
              coordinates:[
                cities[random1000].longitude,cities[random1000].latitude
              ]
            },
            images: [
              {
                url: 'https://res.cloudinary.com/deejncx7h/image/upload/v1753118606/YelpCamp/qbhx3r6yxwgkkqx9tgye.jpg',
                fileName: 'YelpCamp/ohcjb7k4vc3uvfxdme9i',
              },
                {
                  url: 'https://res.cloudinary.com/deejncx7h/image/upload/v1753118618/YelpCamp/dq9sxk6vhieorelfbcum.jpg',
                  fileName: 'YelpCamp/kcxrvxgtyhrenuyoko3e',
                },
                {
                  url: 'https://res.cloudinary.com/deejncx7h/image/upload/v1753118613/YelpCamp/bkeolrhzhe7tewwo6siy.jpg',
                  fileName: 'YelpCamp/ptsjwhid1bvmvfuai5gq',
                },
                {
                  url: 'https://res.cloudinary.com/deejncx7h/image/upload/v1753118611/YelpCamp/znlyesuomdyzgpyfqks4.jpg',
                  fileName: 'YelpCamp/sbodvfuaeazjw4npjghp',
                }
              ],
              description : "Nestled in the heart of a lush forest, this secluded campground offers a perfect escape from the noise of the city. Surrounded by towering pines and the gentle sound of a nearby stream, it’s ideal for both seasoned hikers and first-time campers. Spend your evenings under a sky full of stars, roasting marshmallows over a crackling fire. With miles of scenic trails, abundant wildlife, and breathtaking sunrise views, this location blends adventure and tranquility. Whether you seek quiet reflection or exciting outdoor activities, this campground provides a serene backdrop for unforgettable memories in natures embrace."
              ,price
        })
        await camp.save(); //this will save our data in the Campground database
    }
}


 //we need to execute the function in order to seed the data, this is a must
seedDB().then(()=>{
    mongoose.connection.close();
    //after seeding we close the connection to the database 
});