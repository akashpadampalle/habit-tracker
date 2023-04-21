const express = require('express');
const router = express.Router();
const passport = require('passport');

const habitController = require('../controllers/habit_controller');

router.post('/create', passport.checkAuthentication, habitController.create);  // create habit
router.get('/get', passport.checkAuthentication, habitController.get); // get all haits of user
router.post('/update-title', passport.checkAuthentication, habitController.updateTitle); // upate title of habit
router.post('/update-status', passport.checkAuthentication, habitController.updateStatus); // upate status of habit -> record -> status


module.exports = router;