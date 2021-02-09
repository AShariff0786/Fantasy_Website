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
        }, {
            $lookup: {
                from: 'seasonstats',
                localField: 'playerNumber',
                foreignField: 'player.id',
                as: 'seasonstats'
            }
        }
    ]);
    return result;
}

function getTeamRGBColors(team) {
    const colorTemplate = {
        'ATL': {
            r: 255,
            g: 68,
            b: 52
        },
        'BOS': {
            r: 0,
            g: 122,
            b: 51
        },
        'BKN': {
            r: 0,
            g: 0,
            b: 0
        },
        'CHA': {
            r: 29,
            g: 17,
            b: 96
        },
        'CHI': {
            r: 206,
            g: 17,
            b: 65
        },
        'CLE': {
            r: 134,
            g: 0,
            b: 56
        },
        'DAL': {
            r: 0,
            g: 83,
            b: 188
        },
        'DEN': {
            r: 13,
            g: 34,
            b: 64
        },
        'DET': {
            r: 29,
            g: 66,
            b: 138
        },
        'GSW': {
            r: 0,
            g: 107,
            b: 182
        },
        'HOU': {
            r: 206,
            g: 17,
            b: 65
        },
        'IND': {
            r: 0,
            g: 45,
            b: 98
        },
        'LAC': {
            r: 29,
            g: 66,
            b: 148
        },
        'LAL': {
            r: 85,
            g: 37,
            b: 130
        },
        'MEM': {
            r: 93,
            g: 118,
            b: 169
        },
        'MIA': {
            r: 152,
            g: 0,
            b: 46
        },
        'MIL': {
            r: 0,
            g: 71,
            b: 27
        },
        'MIN': {
            r: 12,
            g: 35,
            b: 64
        },
        'NOP': {
            r: 0,
            g: 22,
            b: 65
        },
        'NYK': {
            r: 0,
            g: 107,
            b: 182
        },
        'OKC': {
            r: 0,
            g: 125,
            b: 195
        },
        'ORL': {
            r: 0,
            g: 125,
            b: 197
        },
        'PHI': {
            r: 0,
            g: 107,
            b: 182
        },
        'PHX': {
            r: 29,
            g: 17,
            b: 96
        },
        'POR': {
            r: 224,
            g: 58,
            b: 62
        },
        'SAC': {
            r: 91,
            g: 43,
            b: 130
        },
        'SAS': {
            r: 196,
            g: 206,
            b: 211
        },
        'TOR': {
            r: 206,
            g: 17,
            b: 65
        },
        'UTA': {
            r: 0,
            g: 43,
            b: 92
        },
        'WAS': {
            r: 0,
            g: 43,
            b: 92
        }
    }
    return colorTemplate[team];
}

router.get('/', async(req, res) => {
    res.render('nba.ejs');
});

router.get('/fantasy', async (req, res, next) => {
    const multipliers = {
        point: 1,
        fg3m: 1,
        fga: -1,
        fgm: 2,
        fta: -1,
        ftm: 1,
        reb: 1,
        ast: 2,
        stl: 4,
        blk: 4,
        tov: -2,
        dd: 3,
        td: 3
    }
    const seasonTotals = await SeasonStatsTotal.find({ 'game.season': 2020});
    let fantasyLeaders = [];
    for(let total of seasonTotals) {
        const fpts = (total.pts * multipliers.point) + (total.fg3m * multipliers.fg3m) + 
                     (total.fga * multipliers.fga) + (total.fgm * multipliers.fgm) + 
                     (total.fta * multipliers.fta) + (total.ftm * multipliers.ftm) + 
                     (total.reb * multipliers.reb) + (total.ast * multipliers.ast) + 
                     (total.stl * multipliers.stl) + (total.blk * multipliers.blk) + 
                     (total.turnover * multipliers.tov) + (total.totaldd * multipliers.dd) + 
                     (total.totaltd * multipliers.td);
        const leader = {
            full_name: `${total.player.first_name} ${total.player.last_name}`,
            team: total.team.abbreviation,
            position: total.player.position,
            pts: total.pts,
            reb: total.reb,
            ast: total.ast,
            blk: total.blk,
            stl: total.stl,
            fga: total.fga,
            fgm: total.fgm,
            fta: total.fta,
            ftm: total.ftm,
            fg3m: total.fg3m,
            tov: total.turnover,
            dd: total.totaldd,
            td: total.totaltd,
            fpts: fpts
        }
        let temp = leader.full_name.toLowerCase().replace(/ /g, "-");
        temp = temp.replace(/'/g, "");
        temp = temp.replace(/\./g , "");
        let image_name;
        try {
            await fs.promises.access('./public/images/headshots/260x190/' + temp + '.png');
            image_name = temp + '.png';
        } catch (error) {
            image_name = 'logoman.png';
        }
        leader.image_name = image_name;
        fantasyLeaders.push(leader);
    }
    res.render('fantasy.ejs', {
        fantasyLeaders: fantasyLeaders,
        multipliers: multipliers
    });
});

router.post('/fantasy', async (req, res, next) => {
    const multipliers = {
        point: req.body.ptsText,
        fg3m: req.body.fg3mText,
        fga: req.body.fgaText,
        fgm: req.body.fgmText,
        fta: req.body.ftaText,
        ftm: req.body.ftmText,
        reb: req.body.rebText,
        ast: req.body.astText,
        stl: req.body.stlText,
        blk: req.body.blkText,
        tov: req.body.tovText,
        dd: req.body.ddText,
        td: req.body.tdText
    }
    const seasonTotals = await SeasonStatsTotal.find({ 'game.season': 2020});
    let fantasyLeaders = [];
    for(let total of seasonTotals) {
        const fpts = (total.pts * multipliers.point) + (total.fg3m * multipliers.fg3m) + 
                     (total.fga * multipliers.fga) + (total.fgm * multipliers.fgm) + 
                     (total.fta * multipliers.fta) + (total.ftm * multipliers.ftm) + 
                     (total.reb * multipliers.reb) + (total.ast * multipliers.ast) + 
                     (total.stl * multipliers.stl) + (total.blk * multipliers.blk) + 
                     (total.turnover * multipliers.tov) + (total.totaldd * multipliers.dd) + 
                     (total.totaltd * multipliers.td);
        const leader = {
            full_name: `${total.player.first_name} ${total.player.last_name}`,
            team: total.team.abbreviation,
            position: total.player.position,
            pts: total.pts,
            reb: total.reb,
            ast: total.ast,
            blk: total.blk,
            stl: total.stl,
            fga: total.fga,
            fgm: total.fgm,
            fta: total.fta,
            ftm: total.ftm,
            fg3m: total.fg3m,
            tov: total.turnover,
            dd: total.totaldd,
            td: total.totaltd,
            fpts: fpts
        }
        let temp = leader.full_name.toLowerCase().replace(/ /g, "-");
        temp = temp.replace(/'/g, "");
        temp = temp.replace(/\./g , "");
        let image_name;
        try {
            await fs.promises.access('./public/images/headshots/260x190/' + temp + '.png');
            image_name = temp + '.png';
        } catch (error) {
            image_name = 'logoman.png';
        }
        leader.image_name = image_name;
        fantasyLeaders.push(leader);
    }
    res.render('fantasy.ejs', {
        fantasyLeaders: fantasyLeaders,
        multipliers: multipliers
    });
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
    const colors = getTeamRGBColors(moreInfo[0].teaminfo[0].abbreviation);
    for(const player of moreInfo) {
        player.full_name = `${player.first_name} ${player.last_name}`;
        let temp = player.full_name.toLowerCase().replace(/ /g, "-");
        temp = temp.replace(/'/g, "");
        temp = temp.replace(/\./g , "");
        let image_name;
        try {
            await fs.promises.access('./public/images/headshots/1040x760/' + temp + '.png');
            image_name = temp + '.png';
        } catch (error) {
            image_name = 'logoman.png';
        }
        player.image_name = image_name;
        player.teamColors = colors;
    }
    const last5Games = moreInfo[0].seasonstats.sort(function(a, b) {
        return new Date(b.game.date) - new Date(a.game.date);
    }).slice(0, 5);
    
    res.render('../views/templates/_player.ejs', {
        playerInfo: moreInfo,
        last5Games: last5Games
    });
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
    const sortedStandings = records.sort(function(a,b){
        if(a.record.wins > b.record.wins)
            return -1;
        else return 1;
    });
    res.render('standings.ejs', {teams: sortedStandings});

});

module.exports = router;