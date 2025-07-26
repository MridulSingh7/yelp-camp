if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}//if the coding isnt in production but in development then require the dotenv else not  


const express = require('express');
const mongoose = require('mongoose');
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const app = express();
app.set('query parser', 'extended');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressErrors = require('./utils/ExpressErrors');
const {campgroundSchema, reviewSchema} = require('./schemas.js') //modue.export wala hia joi object schema step 1 for joi validation
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user.js');
const { secureHeapUsed } = require('crypto');
const { createSecureServer } = require('http2');
const { name } = require('ejs');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');    
const DB_URL = process.env.DB_URL;
// mongodb://127.0.0.1:27017/yelp-camp
mongoose.connect(DB_URL);

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("database connected");
}); 

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));
app.use(sanitizeV5({ replaceWith: '_' }));
app.use(express.static(path.join(__dirname, 'public')));


const store = MongoStore.create({
    mongoUrl: DB_URL,
    collectionName:'session',
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

const sessionConfig = {
   store,
    name:"session", //name of cookie
    secret:'thisshouldbeabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        
        httpOnly:true,
        // secure:true, 
        //enable secure before deploying
        expires: Date.now() + 1000*60*60*24*7,
        maxAge :1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
"https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
"https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
// "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", 
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
                "https://res.cloudinary.com/deejncx7h/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'))
//method override for handling put request as post request because forms only accept get and post
//this is the middleware function we created from the joi step 2 for joi validation
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    //destructured the error from here
    if (error) { //only if any error is found
        const msg = error.details.map(el => el.message).join(',') //we create a custom message to throw it as error
        throw new ExpressErrors(msg, 400) //throw express error we creaeted the model (expressErrors.js)
    } else {
        next(); //if there is no error make sure to use next() because this function is a middleware function hence it needs to be passed on
    }
}
const validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressErrors(msg,400)
    }
    else{
        next();
    }
}

//we can set global elements here, yaha jo jo set karoge will be accesible everywhere
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.use('/',(req,res)=>{
res.render('home')
})

app.all( /(.*)/,(req, res, next) => {
    console.log('404 for:', req.originalUrl);
    next(new ExpressErrors('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

// npm install passport passport-local passport-local-mongoose

module.exports = (req, res) => {
    app(req, res);
  };