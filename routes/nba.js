const express = require('express');
const fs = require('fs');
const Team = require('../models/teams');
const Player = require('../models/players');
const SeasonAvg = require('../models/seasonavgs');
const SeasonStats = require('../models/seasonstats');
const SeasonStatsTotal = require('../models/seasonstatstotal');
const TeamGame = require('../models/teamgames');
const TeamRecord = require('../models/records');
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

async function getMorePlayerInformation(id) {
    const result = await Player.aggregate([
        {
            $match: { playerNumber: id }
        }, {
            $lookup: {
                from: 'teams',
                localField: 'teamNumber',
                foreignField: 'teamNumber',
                as: 'teaminfo'
            }
        }, {
            $lookup: {
                from: 'seasonavgs',
                localField: 'playerNumber',
                foreignField: 'player_id',
                as: 'seasonavgs'
            }
        }
    ]);
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
    for(const player of playersData) {
        player.full_name = `${player.first_name} ${player.last_name}`;
        let temp = player.full_name.toLowerCase().replace(/ /g, "-");
        temp = temp.replace(/'/g, "");
        temp = temp.replace(/\./g , "");
        let image_name;
        try {
            await fs.promises.access('./public/images/headshots/260x190/' + temp + '.png');
            image_name = temp + '.png';
        } catch (error) {
            image_name = 'logoman.png';
        }
        player.image_name = image_name;
    }
    res.render('players.ejs', {players: playersData});
});

router.post('/players', async (req, res, next) => {
    const id = req.body.playerID;
    const moreInfo = await getMorePlayerInformation(Number(id));
    res.render('../views/templates/_player.ejs', {playerInfo: moreInfo});
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
    const records = await TeamRecord.find({"record.year": 2020});
    res.render('standings.ejs', {teams: records});

});

module.exports = router;