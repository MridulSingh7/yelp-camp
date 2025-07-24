const User = require('../models/user')


module.exports.renderRegister =  (req,res)=>{
    res.render('users/register');
}
module.exports.registerNewUser = async(req,res)=>{ 
try{  
    const {email,username,password} = req.body;
    const user = new User({email,username});
    const registeredUser = await User.register(user,password);
    //for directly logging in after creating a new account
    req.login(registeredUser, err=>{
        if(err) return next(err);
        req.flash('success', 'Welcome to YelpCamp!');
        const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl); 
    })
    
}catch(e){
    req.flash('error', e.message);
    res.redirect('register')
}
}

module.exports.renderLoginPage = (req,res)=>{
    res.render('users/login');
}

module.exports.loginUser = async(req,res)=>{
    req.flash("success", 'welcome back')
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl); 
    
}
module.exports.logoutUser =  (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'logged you out succesfully');
        res.redirect('/');
    });
}