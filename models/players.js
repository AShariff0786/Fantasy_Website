const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    playerNumber: {
        type: Number,
        required: true
    },
    first_name: String,
    height_feet: Number,
    height_inches: Number,
    last_name: String,
    position: String,
    teamNumber: Number,
    teamAbbreviation: String,
	weight_pounds: Number
});

module.exports = mongoose.model('Player', playerSchema);