const express = require('express');
const router = express.Router();

const homeController = require('../controllers/home_controller');

router.get('/', homeController.welcome);
router.get('/login', homeController.loginForm);
router.get('/signup', homeController.signupForm);


module.exports = router;