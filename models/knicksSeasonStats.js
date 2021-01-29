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
    id: Number,
    date: String,
    home_team_id: Number,
    home_team_score: Number,
    period: Number,
    postseason: Boolean,
    season: Number,
    status: String,
    time: String,
    visitor_team_id: Number,
    visitor_team_score: Number
});
const knicksSchema = new mongoose.Schema({
    teamNumber: {
        type: Number,
        required: true
    },
    game: gameSchema
});

module.exports = mongoose.model('knicksSeasonStats', knicksSchema);