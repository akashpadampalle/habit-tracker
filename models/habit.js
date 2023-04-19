const mongoose =  require('mongoose');

const habitSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    records: [{
        date:{
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["done", "not done", "none"],
            default: "none",
        }
    }]
});

const Habit = mongoose.model('habit', habitSchema);

module.exports = Habit;