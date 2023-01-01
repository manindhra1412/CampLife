const router=require('express').Router({mergeParams:true})
const catchAsync=require('../ErrorHandling/CatchAsync')
const ExpressError=require('../ErrorHandling/ExpressError')

const Campground=require('../models/campground')
const Review=require('../models/review')
const {validateReview, isLoggedIn, isAuthor, isReviewAuthor}=require('../Middleware')

router.post('/',isLoggedIn,validateReview,async (req,res)=>{
    const campground=await Campground.findById(req.params.id)
    const review =new Review({
        body:req.body.body,
        rating:req.body.rating
    })
    review.author=req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success','Successfully posted the Review')
    res.redirect(`/campgrounds/${campground._id}`)
})

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(async (req,res)=>{
    await Campground.findByIdAndUpdate(req.params.id,{$pull:{reviews:req.params.reviewId}})
    await Review.findByIdAndDelete(req.params.reviewId)
    req.flash('success','Successfully deleted the Review')
    res.redirect(`/campgrounds/${req.params.id}`)   
}))

module.exports=router