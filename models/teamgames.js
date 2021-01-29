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

const gameSchema = new mongoose.Schema({
    date: String,
    home_team: teamSchema,
    home_team_score: Number,
    period: Number,
    postseason: Boolean,
    season: Number,
    status: String,
    time: String,
    visitor_team: teamSchema,
    visitor_team_score: Number
});

const teamGameSchema = new mongoose.Schema({
    teamNumber: {
        type: Number,
        required: true
    },
    game: gameSchema
});

module.exports = mongoose.model('TeamGame', teamGameSchema);