require('dotenv').config();
const express =require('express')
const app=express()
const ejs=require('ejs')
const ejsmate=require('ejs-mate')
const methodOverride=require('method-override')
const bodyParser=require('body-parser')
const joi=require('joi')
const path=require('path')
const session=require('express-session')
const flash=require('connect-flash')
const mongoSanitize = require('express-mongo-sanitize');
const passport=require('passport')
const LocalStrategy=require('passport-local')
const MongoDBStore = require("connect-mongo")(session);
const helmet = require('helmet');
app.use(express.urlencoded({extended:true}))

const Campground=require('./models/campground')
const Review=require('./models/review')
const User=require('./models/user')

const campgroundRoutes=require('./routes/campgrounds')
const reviewRoutes=require('./routes/reviews')
const userRoutes=require('./routes/users')

const catchAsync=require('./ErrorHandling/CatchAsync')
const ExpressError=require('./ErrorHandling/ExpressError')// Custom exception
const review = require('./models/review')

app.use(methodOverride('_method'))
app.use(express.static('public'))
app.set('view engine','ejs')
app.engine('ejs',ejsmate)
app.set('views',path.join(__dirname,'views'))
app.set('public',path.join(__dirname,'public'))
app.use(bodyParser.json())
app.use(mongoSanitize({
    replaceWith: '_'
}))
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-campDB';
const mongoose=require('mongoose')
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db=mongoose.connection
db.on('error',console.error.bind(console,"connection error:"))
db.once("open",()=>{
    console.log("Database Connected");
})
// Session config
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js",
    "https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.css ",
    "https://api.mapbox.com/",
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://api.tiles.mapbox.com/ https://fonts.googleapis.com/ https://use.fontawesome.com/",
    "https://kit-free.fontawesome.com/",
];
app.use(helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: ["'unsafe-eval'", "'self'","https://stackpath.bootstrapcdn.com"],
    scriptSrc: ["'unsafe-eval'", "'self'", "https://stackpath.bootstrapcdn.com", "https://cdn.jsdelivr.net"],
    imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
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
            "https://res.cloudinary.com/dfeeehx1e/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
            "https://images.unsplash.com/",
        ],
            fontSrc: ["'self'", ...fontSrcUrls],
  }
}));

// Passport setup
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
});
app.use((req,res,next)=>{
    res.locals.currentUser=req.user
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next()
})

app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)
app.use('/users',userRoutes)

app.get('/',(req,res)=>{
    res.render('home.ejs')
})
app.get('/loaderio-ae5714581d570cf63dfe796716877820/',(req,res)=>{
    res.render('home.ejs')
})
app.get('/about',(req,res)=>{
    res.render('about.ejs')
})
app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

// Error handler
app.use((err,req,res,next)=>{
    const {statusCode=500,message='Something went wrong'}=err;
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is running on ${port}...`);
})