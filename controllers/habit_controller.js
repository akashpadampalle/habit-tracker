const Habit = require('../models/habit');
const User = require('../models/user');

/** 
 * controller action to create Habit
 * takes title from user and user id from request
 * create records of previous  7 days (non editable)
 * return an json object with created habit 
 * if error accurs it returns json object with empty data 
*/
module.exports.create = async function (req, res) {

    try {

        const { title } = req.body; // getting title from user
        const userId = req.user._id; // extracting user from request
        const today = (new Date).setHours(0, 0, 0, 0) // getting todays date without extra time
        const oneDayInMilli = 1000 * 60 * 60 * 24; // getting milliseconds in one day

        if (!title) { throw new Error('Error: creating habit --> title is empty'); }
        let records = [];

        // this will fill record date with previous 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(today - (i * oneDayInMilli));
            records.unshift({ date: date });
        }

        const newHabit = await Habit.create({ title, userId, records }); // adding habit DB

        //pushing object id of created habit into user db
        await User.findByIdAndUpdate(userId, { $push: { habits: newHabit } });

        res.status(200).json({
            message: 'habit has created',
            status: "successful",
            data: [newHabit],
        })

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "unable to create habit",
            status: "failure",
            data: []
        })
    }
}




/**
 * get action is use to retun the habits of user with last seven records
 * we get user from request and finds all habits of user
 * then we pass all habits of user to validateHabits
 * validate habits check all habit records if records are behind current date (today)
 * then we add new records till current date
 * and return only last 7 records to the user
 * any error will be handled by try-catch block
 */
module.exports.get = async function (req, res) {
    try {

        const uid = req.user.id;
        const habits = await Habit.find({ userId: uid });
        await validateHabits(habits);

        res.status(200).json({
            message: "successfully fetched habits",
            status: "successful",
            data: habits
        });

    } catch (error) {
        console.log("Error: while getting habits", error);
        res.status(500).json({
            message: "unable to get habits",
            status: "failure",
            data: []
        });
    }
}

/**
 * validateHabits takes the habits array loop over it and sends records array of habit and its id for correction
 * correction is done using habitRecordCorrection i.e if records are not uptodate it updates all records till current date
 * and return array of last 7 records
 * we take this 7 records and replace habits whole record array to it
 * so we can send it to user (only last 7 records)
 */
async function validateHabits(habits) {
    for (let i = 0; i < habits.length; i++) {
        const records = await habitRecordCorrection(habits[i].records, habits[i].id);
        habits[i].records = records;
    }
}

/**
 * in habitRecordCorrection we take records array and habitId
 * then we find current date without extra hours
 * next we create newDate using last record date + one day
 * then check new date is lesser or equal to today if yes we add new record to habit using habitid
 * then we fetch updated habit, take its record pass it to returnLastSevenEntries 
 * from habitRecordCorrection we return array of seven records 
 */
async function habitRecordCorrection(records, habitId) {

    const today = (new Date()).setHours(0, 0, 0, 0); // date without extra time
    const oneDayMilliSec = 1000 * 60 * 60 * 24;
    let newDate = records[records.length - 1].date.getTime() + oneDayMilliSec;

    while (newDate <= today) {
        await Habit.findByIdAndUpdate(habitId, { $push: { records: { date: newDate } } });
        newDate += oneDayMilliSec;
    }

    const habit = await Habit.findById(habitId);
    return returnLastSevenEntries(habit.records);
}

/**
 * returnLastSevenEntries is a basic function which takes array of 7 or more elements
 * and return last 7 elements
 */
async function returnLastSevenEntries(arr) {
    if (arr.length < 7) { throw new Error('given array is smaller than 7 entries'); }
    let finalArr = [];
    for (let i = arr.length - 7; i < arr.length; i++) { finalArr.push(arr[i]); }
    return finalArr;
}


module.exports.updateTitle = async function (req, res) {
    try {
        const { newTitle, habitId } = req.body;
        const userId = req.user.id;

        const habit = await Habit.findById(habitId);
        if (habit.userId != userId) {
            return res.status(401).json({
                message: "user does not have access to change",
                status: "failure",
                data: []
            });
        }

        const updatedHabit = await Habit.findByIdAndUpdate(habitId, { title: newTitle });

        return res.status(200).json({
            message: "successfully changed title",
            status: "successful",
            data: [updatedHabit]
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "internal server error",
            status: "failure",
            data: []
        });
    }

}


module.exports.updateStatus = async function (req, res) {
    try {
        const { newStatus, habitId, recordsId } = req.body;
        const userId = req.user.id;

        if(!newStatus || !habitId || !recordsId){
            return res.status(400).json({
                message: "insufficient data",
                status: "failure",
                data: []
            });
        }

        const habit = await Habit.findById(habitId);
        const isRecordBelongToHabit = habit.records.some(record => record.id == recordsId);

        if (!isRecordBelongToHabit || userId != habit.userId) {
            return res.status(401).json({
                message: "unauthorized request",
                status: "failure",
                data: []
            });
        }


        

        const newRecord = await Habit.updateOne({_id: habitId, 'records._id': recordsId},{$set: {'records.$.status': newStatus}});

        return res.status(200).json({
            message: "successfully changed status",
            status: "successfull",
            data: [newRecord]
        });

    } catch (error) {
        console.log("ERROR: Update status", error);
        return res.status(500).json({
            message: "internal server error",
            status: "failure",
            data: []
        })
    }
}

