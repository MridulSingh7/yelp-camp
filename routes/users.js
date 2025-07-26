const express = require('express');
const router = express.Router();
const passport = require('passport')
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controller/user')
const {storeReturnTo} = require('../utils/middleware.js');


router.route('/register')
.get(users.renderRegister)
.post(storeReturnTo, catchAsync(users.registerNewUser));

router.route('/login')
.get(users.renderLoginPage)
.post(storeReturnTo, passport.authenticate('local', {failureFlash:true, failureRedirect:'/login'}),users.loginUser);

router.route('/logout')
.get(users.logoutUser)

module.exports = router;





//controller routes
//how to set up 
/*
1.pehle controller folder banao usme users.js
2.module.exports.FunctionName = normal route ka jo function tha async se usko copy paste karo
3.router.route('path')jiske liey banae the
4. .get(middlewares in order, users.functionName)
5. .post(middlewares in order, users.functionName)
 (ek hi path (route) pe multiple get post aise bhej rahe )

 extra tip : make sure to include all the files needed , sabka patb may vary ye sab dekh ke karna
*/ 