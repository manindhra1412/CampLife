const exp = require('constants')
const mongoose=require('mongoose')
const Review=require('./review')
const User=require('./user')

const ImageSchema = new mongoose.Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema=new mongoose.Schema({
    title:String,
    images:[ImageSchema],
    price:Number,
    description:String,
    location:String,
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,ref:'User'
    },
    reviews:[{
        type:mongoose.Schema.Types.ObjectId,ref:'Review'
    }]
},opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>`
});

CampgroundSchema.post('findOneAndDelete',async (doc)=>{
    if(doc){
        await Review.remove({
            $in:doc.reviews
        })
    }
})

const Campground=new mongoose.model('Campground',CampgroundSchema)
module.exports=Campground