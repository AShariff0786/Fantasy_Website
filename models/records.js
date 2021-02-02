const mongoose = require('mongoose');

const requiredString = {
    type: String,
    required: true
};

const teamSchema = new mongoose.Schema({
    teamID: Number,
    abbreviation: String,
    city: String,
    conference: String,
    division: String,
    full_name: String,
    name: String
});

const recordSchema = new mongoose.Schema({
    year: Number,
    wins: Number,
    loss: Number
});

const teamRecordSchema = new mongoose.Schema({
    teamNumber: {
        type: Number,
        required: true
    },
    record: recordSchema,
    lastUpdatedDate: String,
    game: teamSchema
});

module.exports = mongoose.model('TeamRecord', teamRecordSchema);