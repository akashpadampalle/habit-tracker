const express = require('express');
const passport = require('passport');
const router = express.Router();

const homeController = require('../controllers/home_controller');
const userController = require('../controllers/user_controller');
const habitController = require('../controllers/habit_controller');

router.get('/', homeController.welcome);
router.get('/login', homeController.loginForm);
router.get('/signup', homeController.signupForm);
router.get('/logout', passport.checkAuthentication, userController.logout);
router.post('/create-habit', passport.checkAuthentication, habitController.create);
router.get('/get-habits', passport.checkAuthentication, habitController.get);


router.post('/update-title', passport.checkAuthentication, habitController.updateTitle);
router.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), userController.login);
router.post('/signup', userController.signup);


module.exports = router;