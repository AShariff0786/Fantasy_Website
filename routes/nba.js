const express = require('express');
const mongoose = require('mongoose');
const Team = require('../models/teams');
const Player = require('../models/players');
const SeasonAvg = require('../models/seasonavgs');
const SeasonStats = require('../models/seasonstats');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const API_URL = 'https://www.balldontlie.io/api/v1/';

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
const gracefulExit = function() { 
    db.close(function () {
        console.log('Mongoose default connection with the Database disconnected through app termination.');
        process.exit(0);
    });
}

db.on('error', (error) => {
    console.error(`Something went wrong with the database: ${error}`);
});
db.once('open', () => {
    console.log('Connected to the database.');
});
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

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

router.get('/', async(req, res) => {
    res.render('nba.ejs');
});

router.get('/stats', async (req, res, next) => {
    const seasonstats = await SeasonStats.find({"game.season": 2020});
    const pointsSeasonLeaders = seasonstats.sort(function(a, b) {
        return b.pts - a.pts;
    }).slice(0, 5);
    const reboundsSeasonLeaders = seasonstats.sort(function(a, b) {
        return b.reb - a.reb;
    }).slice(0, 5);
    const assistsSeasonLeaders = seasonstats.sort(function(a, b) {
        return b.ast - a.ast;
    }).slice(0, 5);
    res.render('stats.ejs', { 
        pointsSeasonLeaders: pointsSeasonLeaders,
        reboundsSeasonLeaders: reboundsSeasonLeaders,
        assistsSeasonLeaders: assistsSeasonLeaders
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

module.exports = router;