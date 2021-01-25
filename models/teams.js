const mongoose = require('mongoose');

const requiredString = {
    type: String,
    required: true
};

const teamSchema = new mongoose.Schema({
    teamNumber: {
        type: Number,
        required: true
    },
    abbreviation: requiredString,
    city: requiredString,
    conference: requiredString,
    division: requiredString,
	full_name: requiredString,
	name: requiredString
});

module.exports = mongoose.model('Team', teamSchema);