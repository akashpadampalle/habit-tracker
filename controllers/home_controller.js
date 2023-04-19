

module.exports.welcome = function (req, res) {
    try {
        res.render('index');
    } catch (error) {
        console.log(error);
        res.end('<h1>welcome...</h1>')
    }
} 


module.exports.loginForm = function (req, res){
    try {
        res.render('form_login', {title: "Login | Habit Tracker"});
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
}


module.exports.signupForm = function (req, res){
    try {
        res.render('form_signup', {title: "Sign Up | Habit Tracker"});
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
}