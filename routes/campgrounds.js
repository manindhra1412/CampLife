const router=require('express').Router()
const catchAsync=require('../ErrorHandling/CatchAsync')
const ExpressError=require('../ErrorHandling/ExpressError')
const {isLoggedIn,isAuthor,validateCampground}=require('../Middleware')
const Campground=require('../models/campground')
const Review=require('../models/review')
const {campgroundSchema}=require('../Joivalidation')
const multer=require('multer')
const {storage}=require('../Cloudinary/cloudinary')
const upload=multer({storage})
const {cloudinary}=require('../Cloudinary/cloudinary')

// Geocoding
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder=mbxGeocoding({accessToken:process.env.MAPBOX_TOKEN})


router.get('/',isLoggedIn,catchAsync(async (req,res)=>{
    const campgrounds=await Campground.find({})
    res.render('campground/index',{campgrounds})
}))

router.get('/new',isLoggedIn,(req,res)=>{
    res.render('campground/new')
})

router.post('/',isLoggedIn,upload.array('image'),validateCampground,catchAsync(async(req,res)=>{
    const geoData=await geocoder.forwardGeocode({
        query:req.body.location,
        limit:1
    }).send()
    const cg={
        title:req.body.title,description:req.body.description,
        price:req.body.price,location:req.body.location
    }
    const campground=new Campground(cg)
    campground.geometry=geoData.body.features[0].geometry;
    campground.images=req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.author=req.user._id;
    await campground.save();
    req.flash('success','Successfully made a new Campground')
    res.redirect(`campgrounds/${campground._id}`)
}))

router.get('/:id',isLoggedIn,catchAsync(async (req,res)=>{
    const campground=await Campground.findById(req.params.id).populate({path:'reviews',populate:{
        path:'author'
    }}).populate('author')
    if(!campground){
        req.flash('error','Cannot find the Campground')
        return res.redirect('/campgrounds')
    }
    res.render('campground/show',{campground})
}))

router.put('/:id',isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(async (req,res)=>{
    const {id}=req.params
    const campground=await Campground.findByIdAndUpdate(id,{title:req.body.title,location:req.body.location,
    image:req.body.image,
    description:req.body.description,
    price:req.body.price})
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}))
    campground.images.push(...imgs)
    await campground.save()
    if(req.body.deleteImages){
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
    }
    req.flash('success','Successfully updated Campground')
    res.redirect(`/campgrounds/${id}`)
}))

router.delete('/:id',isLoggedIn,isAuthor,catchAsync(async (req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted the Campground')
    res.redirect(`/campgrounds`)
}))

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(async (req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id)
    if(!campground){
        req.flash('error','Cannot find the Campground')
        return res.redirect('/campgrounds')
    }
    res.render('campground/edit',{campground})
}))

module.exports=router