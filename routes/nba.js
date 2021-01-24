const express = require('express');
const axios = require('axios');
const router = express.Router();

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
    playersURL = API_URL + 'players?per_page=100';
    let totalPages;
    let playersData;
    try {
        const { data } = await axios.get(playersURL);
        playersData = data.data;
        totalPages = data.meta.total_pages;
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
    teamsURL = API_URL + 'teams'; 
    let teamsData;

    try{
        const {data } = await axios.get(teamsURL);
        teamsData = data.data;
    }catch (err) {
        next(err);
    }
    teamsData.forEach(element => {
        if (/\s/.test(element.name)) {
            element.name = element.name.split(" ").join("_");
        }
    });
    res.render('teams.ejs', {teams: teamsData});
});

module.exports = router;