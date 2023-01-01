const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-campDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author:'63af0251ebe1882bf3cd2d01',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry:{
                type:'Point',
                coordinates:[cities[random1000].longitude,cities[random1000].latitude] 
            },
            images:{
                url: 'https://res.cloudinary.com/dfeeehx1e/image/upload/v1672468861/YelpCamp/lttoas814hx6ghwtfjlb.jpg',    
                filename: 'YelpCamp/lttoas814hx6ghwtfjlb'
              },
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex vitae quam pariatur sit, asperiores repellendus. Odio veniam facere possimus dicta! Similique recusandae perferendis suscipit possimus aut alias maiores corrupti iusto."
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})