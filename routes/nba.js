const express = require('express');
const mongoose = require('mongoose');
const Team = require('../models/teams');
const Player = require('../models/players');
const SeasonAvg = require('../models/seasonavgs');
const SeasonStats = require('../models/seasonstats');
const SeasonStatsTotal = require('../models/seasonstatstotal');
const TeamGame = require('../models/teamgames');
const Record = require('../models/records');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const API_URL = 'https://www.balldontlie.io/api/v1/';

function getDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

async function joinSeasonAverageAndPlayers() {
    const result = await SeasonAvg.aggregate([{
        $match: { season : 2020 }
        }, {
        $lookup: {
            from: 'players',
            localField: 'player_id',
            foreignField: 'playerNumber',
            as: 'playerdetails'
        }
    }]);
    return result;
}

router.get('/', async(req, res) => {
    res.render('nba.ejs');
});

router.get('/stats', async (req, res, next) => {
    const seasonstatstotals = await SeasonStatsTotal.find({"game.season": 2020});
    const pointsSeasonLeaders = seasonstatstotals.sort(function(a, b) {
        return b.pts - a.pts;
    }).slice(0, 5);
    const reboundsSeasonLeaders = seasonstatstotals.sort(function(a, b) {
        return b.reb - a.reb;
    }).slice(0, 5);
    const assistsSeasonLeaders = seasonstatstotals.sort(function(a, b) {
        return b.ast - a.ast;
    }).slice(0, 5);
    const blocksSeasonLeaders = seasonstatstotals.sort(function(a, b) {
        return b.blk - a.blk;
    }).slice(0, 5);
    const stealsSeasonLeaders = seasonstatstotals.sort(function(a, b) {
        return b.stl - a.stl;
    }).slice(0, 5);
    const threePointersMadeSeasonLeaders = seasonstatstotals.sort(function(a, b) {
        return b.fg3m - a.fg3m;
    }).slice(0, 5);

    const seasonAvg = await joinSeasonAverageAndPlayers();

    res.render('stats.ejs', {
        pointsSeasonLeaders: pointsSeasonLeaders,
        reboundsSeasonLeaders: reboundsSeasonLeaders,
        assistsSeasonLeaders: assistsSeasonLeaders,
        blocksSeasonLeaders: blocksSeasonLeaders,
        stealsSeasonLeaders: stealsSeasonLeaders,
        threePointersMadeSeasonLeaders: threePointersMadeSeasonLeaders,
        seasonAvg: seasonAvg
    });
});

router.get('/players', async (req, res, next) => {
    let playersData;
    try {
        playersData = await Player.find();
    } catch (err) {
        next(err);
    }
    res.render('players.ejs', {players: playersData});
});

router.get('/schedule', async (req, res, next) => {
    var date = getDate();
    gamesURL = API_URL + `games?dates[]=${date}`;
    let gamesData;
    try {
        const { data } = await axios.get(gamesURL);
        gamesData = data.data;
    } catch (err) {
        next(err);
    }
    gamesData.forEach(element => {
        if (/\s/.test(element.visitor_team.name)) {
            element.visitor_team.name = element.visitor_team.name.split(" ").join("_");
        }
        if (/\s/.test(element.home_team.name)) {
            element.home_team.name = element.home_team.name.split(" ").join("_");
        }
    });
    res.render('schedule.ejs', {games: gamesData});
});

router.get('/teams', async (req, res, next) => {
    const teamsData = await Team.find();
    res.render('teams.ejs', {teams: teamsData});
});

router.get('/standings', async (req, res, next) => {
    const teamgames = await TeamGame.find({"game.season": 2019});

    for(let i=1; i<+30; i++){
        

	}

    //res.render('standings.ejs', {teams: test});

});

module.exports = router;