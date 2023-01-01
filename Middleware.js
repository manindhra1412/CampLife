const {campgroundSchema,reviewSchema}=require('./Joivalidation')
const ExpressError=require('./ErrorHandling/ExpressError')
const Campground=require('./models/campground')
const Review = require('./models/review')

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl
        req.flash('error','You must logged in first')
        res.redirect('/users/login')
        return;
    }
    next()
}

module.exports.validateCampground=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body)
    if(error){
        const message=error.details[0].message
        console.log(message);
        throw new ExpressError(message,400)
    }else{
        next();
    }
}

module.exports.isAuthor=async (req,res,next)=>{
    const {id}=req.params
    const campground=await Campground.findById(id)
    if(!campground.author.equals(req.user.id)){
        req.flash('error','You do not have the permission to do it');
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.isReviewAuthor=async (req,res,next)=>{
    const {id,reviewId}=req.params
    const review=await Review.findById(reviewId)
    if(!review.author.equals(req.user.id)){
        req.flash('error','You do not have the permission to do it');
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body)
    if(error){
        const message=error.details[0].message
        console.log(message);
        throw new ExpressError(message,400)
    }else{
        next()
    }
}
