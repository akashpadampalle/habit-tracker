const User = require('../models/user');

module.exports.login = function (req, res){
    return res.redirect('/');
}

/**
 * create user and store it into mongodb
 * extracting user details such as name email and password from reques body
 * if any of the field is empty redirecting it to back
 * checking if user entered password and confirm password are same or not if they are not same redirecting to back
 * if everything goes according to plan we just store user into db and redirecting user to login page
*/
module.exports.signup = async function (req, res){
    try {
        const { name , email, password, cpassword } = req.body;
        //check if any field is empty
        if(!name || !email || !password){
            console.log(req.body);
            throw new Error('Error: Empty field recieved --> signup');
        }
        // check password and confirm password are the same
        if(password != cpassword){ throw new Error('Error: password != confirm password --> signup'); }
        const createdUser = await User.create({name, email, password});
        // checking user is created successfully or not
        if(!createdUser){ throw new Error('Error: not able to create an user --> signup'); }
        return res.redirect('/login');

    } catch (error) {
        console.error("Error: ", error);
        return res.redirect('/signup');
    }
}

module.exports.logout = function(req, res){
    const username = req.user;
    req.logout(function (err){
        if(err) { return console.log("unable to logout -> ", username); }
        console.log(username, "logout successfull");
        res.redirect('/');
    });
}