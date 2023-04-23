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
    const oneDayMilliSec = 1000 * 60 * 60 * 24; // one day time in millisecond
    let newDate = records[records.length - 1].date.getTime() + oneDayMilliSec; // last record date + one day

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

/**
 * updateTitle action is use to update the title of habit
 * takes new title and habit id from request body and user id from user (passport -> request)
 * first we check the requesting user and ower of habit are same if not we send respose from here unauthorise access
 * if both users are same then we find the habit and update its title 
 * and return updated habit in the form of json
 * if error accures in all of the above situation we send json response with message internal server error
 */
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

        //herer {new: true} -> returns newly updated habit
        const updatedHabit = await Habit.findByIdAndUpdate(habitId, { title: newTitle }, {new: true});

        const trimedRecords = await returnLastSevenEntries(updatedHabit.records);
        updatedHabit.records = trimedRecords;

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

/**
 * updateStatus action is use to update ( habit -> records -> record -> status )
 * first we takes new status, habit id and record id from the request body and id from request user (given by passport)
 * checking any of the above field is empty if it empty return respose with message insuffiecient data
 * then we find habit into DB using habit id by using this habit we find out our record and get record date from there
 * in any case we didn't find habit or user id of habit doesn't match with requested user we send response with unauthorised request
 * if everything is corret then we check is record editable [if record is created before habit creation or record is older than 7 days then it is not editable]
 * if record is not editable then we send response with message not allowed to update
 * if everything goes according to plan we update status of record and send response accordingly
 */
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

        let recordDate = undefined;
        const habit = await Habit.findById(habitId);
        // some method loops over every record return true if any of record.id is equal to recordsId
        const isRecordBelongToHabit = habit.records.some((record) => {
            if(record.id == recordsId){
                recordDate = record.date.getTime(); //taking record date and converting into milliseconds
                return true;
            }

            return false;
        });

        if (!isRecordBelongToHabit || userId != habit.userId) {
            return res.status(401).json({
                message: "unauthorized request",
                status: "failure",
                data: []
            });
        }

        const today = (new Date()).setHours(0,0,0,0); // date without extra hours
        const habitCreationDate = habit.createdAt.setHours(0,0,0,0); // habit creationg date in millisecond
        const updateTimeLimit = recordDate + (1000*60*60*24*7); // record date + 7 days

        if(recordDate < habitCreationDate || updateTimeLimit < today){
            return res.status(400).json({
                message: "Not allowed to update status which is before creation of habit or records of day 7 days before",
                status: "failure",
                data: []
            });
        }

        // we find habit using habit id furether finds record having record id then we set founded record status with new status
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


/**
 * delete action is used for deleteing habit from the DB
 * takes the habit id from request body and user id from request
 * finds habit using habit id if we didn't get habit or the owner of habit and requested user doesn't 
 * return respose with massage unauthorized request
 * if everything is okay we find user and remove habit id from habits array of user
 * next we delete habit using habit id
 * return response with message deleted successfully
 */
module.exports.delete = async function(req, res){
    
    try {
        const {habitId} = req.body;
        const userId = req.user.id;

        const habit = await Habit.findById(habitId);

        if(!habit || habit.userId != userId){
            return res.status(400).json({
                message: "unauthorized request",
                status: "failure",
                data: []
            });
        }

        await User.findByIdAndUpdate(userId, {$pull: {habits: habitId}});
        await Habit.findByIdAndDelete(habitId);

        return res.status(200).json({
            message: "habit deleted successfully",
            status: "successfull",
            data: []
        });

    } catch (error) {
        console.log("Error: delete habit ", error);
        res.status(500).json({
            message: "Internal Server Error",
            status: "failure",
            data: []
        });
    }

}

