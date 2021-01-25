const mongoose = require('mongoose');

const requiredString = {
    type: String,
    required: true
};

const playerSchema = new mongoose.Schema({
    playerNumber: {
        type: Number,
        required: true
    },
    first_name: requiredString,
    height_feet: {
        type: Number
    },
    height_inches: {
        type: Number
    },
    last_name: requiredString,
    position: {
        type: String
    },
    teamNumber: {
        type: Number,
        required: true
    },
    teamAbbreviation: requiredString,
	weight_pounds: {
        type: Number
    }
});

module.exports = mongoose.model('Player', playerSchema);