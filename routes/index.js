const express = require('express');

const router = express.Router();
const habitsRouter = require('./habits');
const usersRouter = require('./users');

const homeController = require('../controllers/home_controller');

router.get('/', homeController.welcome);
router.get('/login', homeController.loginForm);
router.get('/signup', homeController.signupForm);


router.use('/habits', habitsRouter);
router.use('/users', usersRouter);

module.exports = router;