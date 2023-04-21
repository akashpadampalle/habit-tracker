const express = require('express');
const router = express.Router();

const passport = require('passport');

const userController = require('../controllers/user_controller');

router.get('/logout', passport.checkAuthentication, userController.logout); // use to signout user
router.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), userController.login); // use to login or authentication using passport
router.post('/signup', userController.signup);



module.exports = router;