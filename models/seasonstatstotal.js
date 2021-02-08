const mongoose = require('mongoose');

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

const playerSchema = new mongoose.Schema({
    id: Number,
    first_name: String,
    height_feet: Number,
    height_inches: Number,
    last_name:String,
    position: String,
    team_id: Number,
    weight_pounds: Number
});

const teamSchema = new mongoose.Schema({
    id: Number,
    abbreviation: String,
    city: String,
    conference: String,
    division: String,
    full_name: String,
    name: String
});

const seasonStatsTotalSchema = new mongoose.Schema({
    ast: Number,
    blk: Number,
    dreb: Number,
    fg3_pct: Number,
    fg3a: Number,
    fg3m: Number,
    fg_pct: Number,
    fga: Number,
    fgm: Number,
    ft_pct: Number,
    fta: Number,
    ftm: Number,
    game: gameSchema,
    min: String,
    oreb:Number,
    pf: Number,
    player: playerSchema,
    pts: Number,
    reb: Number,
    stl: Number,
    team: teamSchema,
    turnover: Number,
    games_played: Number,
    totaldd: Number,
    totaltd: Number,
    totalqd: Number
});

module.exports = mongoose.model('SeasonStatsTotal', seasonStatsTotalSchema);