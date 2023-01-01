const router=require('express').Router()
const User=require('../models/user')
const catchAsync=require('../ErrorHandling/CatchAsync')
const passport=require('passport')


router.get('/register',(req,res)=>{
    res.render('users/register')
})
router.post('/register',catchAsync(async (req,res)=>{
    try{
        const {username,email,password}=req.body
        const user=new User({email:email,username:username});
        const registerUser=await User.register(user,password)
        req.flash('success','Successfully Registered')
        res.redirect('/users/login')
    }catch(e){
        req.flash('error',e.message)
        res.redirect('/users/register')
    }
}))

router.get('/login',(req,res)=>{
    res.render('users/login')
})
router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/users/login'}),catchAsync(async (req,res)=>{
    req.flash('success','Successful Login')
    const redirectUrl=req.session.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
}))

router.get('/logout',(req,res)=>{
    req.logout(function(err) {
        if (err) {
            return next(err); 
        }
        req.flash('success','Successfully LoggedOut')
        res.redirect('/users/login')
      });
})

module.exports=router