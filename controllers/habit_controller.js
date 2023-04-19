const Habit = require('../models/habit');

function validateRecord() { }

module.exports.create = function (req, res) {

    try {

        const { title } = req.body; // getting title from user
        const userId = req.user._id; // extracting user from request
        const today = (new Date).setHours(0, 0, 0, 0) // getting todays date without extra time
        const oneDayInMilli = 1000 * 60 * 60 * 24; // getting milliseconds in one day

        if(!title){
            throw new Error('Error: creating habit --> title is empty');
        }

        let records = [];
        // this will fill record date with previous 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(today.getTime() - (i * oneDayInMilli));
            records.unshift({ date: date });
        }

        const newHabit = Habit.create({ title, userId, records });

        console.log(newHabit);

        res.json(200, {
            message: 'habit has been created',
            data: [newHabit],
        })

    } catch (error) {

        console.error(error);

        res.json(500, {
            message: "unable to create habit",
            data: []
        })
    }
}