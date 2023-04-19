const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const User = require('../models/user');

passport.use(new localStrategy(async (email, password, done) => {
    
    try {
        // find user by its email ID
        const user = await User.findOne({email: email});

        //if we don't find email return from here saying authentication false
        if(!user || user.password != password)
            return done(null, false);

        return(null, user);
        

    } catch (error) {
        console.error('Error: ', error);
        return done(null, false);
    } 

}));


passport.serializeUser((user, done) => {
    done(null, user.id);
});


passport.deserializeUser((id, done) => {

    User.findOne(id, (err, user) => {
        done(err, user);
    });

})


passport.checkAuthentication = function (req, res, next){
    
    if(req.isAuthenticated()){
        return next();
    }

    return res.redirect('/login');
}


passport.setAuthenticatedUser = function (red, res, next){
    
    if(req.isAuthenticated()){
        res.locals.user = req.user;
    }

    next();
}


module.exports = passport;