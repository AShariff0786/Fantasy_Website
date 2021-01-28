const mongoose = require('mongoose');

const requiredString = {
    type: String,
    required: true
};

const seasonAvgSchema = new mongoose.Schema({
    seasonNumber: requiredString,
    games_played: Number,
	player_id: Number,
	season: Number,
	min: String,
	fgm: Number,
	fga: Number,
	fg3m: Number,
	fg3a: Number,
	ftm: Number,
	fta: Number,
	oreb: Number,
	dreb: Number,
	reb: Number,
	ast: Number,
	stl: Number,
	blk: Number,
	turnover: Number,
	pf: Number,
	pts: Number,
	fg_pct: Number,
	fg3_pct: Number,
	ft_pct: Number
});

module.exports = mongoose.model('SeasonAvg', seasonAvgSchema);