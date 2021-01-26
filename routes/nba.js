const express = require('express');
const mongoose = require('mongoose');
const Team = require('../models/teams');
const Player = require('../models/players');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const API_URL = 'https://www.balldontlie.io/api/v1/';
const DB_CONNECTION = {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS
};
const DB_URL = `mongodb+srv://${DB_CONNECTION.user}:${DB_CONNECTION.pass}@cluster0.vmwam.mongodb.net/${DB_CONNECTION.name}?retryWrites=true&w=majority`;


mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
   console.log("Connected to database.");
});

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
    seasonAvgURL = API_URL + 'season_averages';
    playersURL = API_URL + 'players';
    let seasonAvgData, playersData;
    try {
        const { data } = await axios.get(seasonAvgURL);
        seasonAvgData = data.data;
    } catch (err) {
        next(err);
    }
    try {
        const { data } = await axios.get(playersURL);
        playersData = data.data;
    } catch (err) {
        next(err);
    }

    res.render('stats.ejs', JSON.stringify( { players: playersData, seasonAvgs: seasonAvgData}));
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

router.get('/playerstats', async (req, res, next) => {
    statsURL = API_URL + 'stats';
    let statsData;
    try {
        const { data } = await axios.get(statsURL);
        statsData = data.data;
    } catch (err) {
        next(err);
    }
    res.render('playersStats.ejs', {stats: statsData});
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