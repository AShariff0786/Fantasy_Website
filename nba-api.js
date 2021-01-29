const axios = require('axios');
const Team = require('./models/teams');
const Player = require('./models/players');
const SeasonAvg = require('./models/seasonavgs');
const SeasonStats = require('./models/seasonstats');
const SeasonStatsTotal = require('./models/seasonstatstotal');
const knicksSeasonStats = require('../models/knicksSeasonStats');
const TeamGame = require('./models/teamgames');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'https://www.balldontlie.io/api/v1/';

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
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


async function addAllTeams() {
    teamsURL = API_URL + 'teams'; 
    let teamsData;

    try{
        const {data } = await axios.get(teamsURL);
        teamsData = data.data;
    } catch (err) {
        console.log(err);
    }

    for(const element of teamsData) {
        if (/\s/.test(element.name)) {
            element.name = element.name.split(" ").join("_");
        }
        const team = new Team({
            teamNumber: element.id,
            abbreviation: element.abbreviation,
            city: element.city,
            conference: element.conference,
            division: element.division,
            full_name: element.full_name,
            name: element.name
        });
        await team.save();
        console.log(`Saved Team ${team.teamNumber} to database.`);
    }

}

async function addAllPlayers() {
    const playersURL = API_URL + 'players?per_page=100';
    let totalPages;
    try {
        const { data } = await axios.get(playersURL);
        totalPages = data.meta.total_pages;
    } catch (err) {
        console.log(err);
    }
    
    for(let i = 1; i <= totalPages; i++) {
        setTimeout(async function addPlayers() {
            const tempURL = playersURL + '&page=' + String(i);
            try {
                const newData = await axios.get(tempURL);
                for(const element of newData.data.data) {
                    const player = new Player({
                        playerNumber: element.id,
                        first_name: element.first_name,
                        height_feet: element.height_feet,
                        height_inches: element.height_inches,
                        last_name: element.last_name,
                        position: element.position,
                        teamNumber: element.team.id,
                        teamAbbreviation: element.team.abbreviation,
                        weight_pounds: element.weight_pounds
                    });
                    await player.save();
                    console.log(`Saved Player ${player.playerNumber} to database.`);
                }
            } catch (err) {
                console.log(err);
            }
        }, i * 5000);
    }
    console.log('Adding all players done.');
}

async function addAllPlayerSeasonAveragesBySeason(season) {
    const seasonUrl = `${API_URL}season_averages?season=${season}&player_ids[]=`;
    const players = await Player.find();
    let playerIDs = [];
    for(const player of players) {
        playerIDs.push(player.playerNumber);
    }
    const midpoint = Math.ceil(playerIDs.length / 2);
    const playerIDs1 = playerIDs.slice(0, midpoint);
    const playerIDs2 = playerIDs.slice(midpoint, playerIDs.length);
    const playerIDsArr = [ playerIDs1, playerIDs2];
    const seasonNumber = `${season}-${String(Number(season) + 1)}`;
    for(const arr of playerIDsArr) {
        const tempUrl = seasonUrl + arr.toString();
        const result = await axios.get(tempUrl);
        const data = result.data.data;
        if(data.length == 0) {
            continue;
        } else {
            for(const element of result.data.data) {
                const seasonAvg = new SeasonAvg({
                    seasonNumber: seasonNumber,
                    games_played: element.games_played,
                    player_id: element.player_id,
                    season: element.season,
                    min: element.min,
                    fgm: element.fgm,
                    fga: element.fga,
                    fg3m: element.fg3m,
                    fg3a: element.fg3a,
                    ftm: element.ftm,
                    fta: element.fta,
                    oreb: element.oreb,
                    dreb: element.dreb,
                    reb: element.reb,
                    ast: element.ast,
                    stl: element.stl,
                    blk: element.blk,
                    turnover: element.turnover,
                    pf: element.pf,
                    pts: element.pts,
                    fg_pct: element.fg_pct,
                    fg3_pct: element.fg3_pct,
                    ft_pct: element.ft_pct
                });
                await seasonAvg.save();
                console.log(`Saved Season Average of Player ID ${seasonAvg.player_id} for Season ${seasonAvg.seasonNumber} to database.`);
            }
        }
    }
}

async function addAllPlayerSeasonStatsBySeason(season) {
    const statsUrl = API_URL + `stats?seasons[]=${season}&per_page=100`;
    let totalPages;
    try {
        const { data } = await axios.get(statsUrl);
        totalPages = data.meta.total_pages;
    } catch (err) {
        console.log(err);
    }
    for(let i = 1; i <= totalPages; i++) {
        setTimeout(async function addPlayerStats() {
            const tempURL = statsUrl + '&page=' + String(i);
            try {
                const result = await axios.get(tempURL);
                for (const element of result.data.data) {
                    const seasonstats = new SeasonStats({
                        ast: element.ast,
                        blk: element.blk,
                        dreb: element.dreb,
                        fg3_pct: element.fg3_pct,
                        fg3a: element.fg3a,
                        fg3m: element.fg3m,
                        fg_pct: element.fg_pct,
                        fga: element.fga,
                        fgm: element.fgm,
                        ft_pct: element.ft_pct,
                        fta: element.fta,
                        ftm: element.ftm,
                        game: element.game,
                        min: element.min,
                        oreb: element.oreb,
                        pf: element.pf,
                        player: element.player,
                        pts: element.pts,
                        reb: element.reb,
                        stl: element.stl,
                        team: element.team,
                        turnover: element.turnover
                    });
                    await seasonstats.save();
                    console.log(`Saved Stats for Player ID ${seasonstats.player.id} for Season ${season} to database.`);
                }
            } catch (err) {
                console.error(err);
            }
        }, i * 5000);
    }
}

async function addAllPlayerSeasonStatsByDate(date) {
    const statsUrl = API_URL + `stats?per_page=100&dates[]=${date}`;
    let totalPages;
    try {
        const { data } = await axios.get(statsUrl);
        totalPages = data.meta.total_pages;
    } catch (err) {
        console.log(err);
    }
    for(let i = 1; i <= totalPages; i++) {
        setTimeout(async function addPlayerStats() {
            const tempURL = statsUrl + '&page=' + String(i);
            try {
                const result = await axios.get(tempURL);
                for (const element of result.data.data) {
                    const seasonstats = new SeasonStats({
                        ast: element.ast,
                        blk: element.blk,
                        dreb: element.dreb,
                        fg3_pct: element.fg3_pct,
                        fg3a: element.fg3a,
                        fg3m: element.fg3m,
                        fg_pct: element.fg_pct,
                        fga: element.fga,
                        fgm: element.fgm,
                        ft_pct: element.ft_pct,
                        fta: element.fta,
                        ftm: element.ftm,
                        game: element.game,
                        min: element.min,
                        oreb: element.oreb,
                        pf: element.pf,
                        player: element.player,
                        pts: element.pts,
                        reb: element.reb,
                        stl: element.stl,
                        team: element.team,
                        turnover: element.turnover
                    });
                    await seasonstats.save();
                    console.log(`Saved Stats for Player ID ${seasonstats.player.id} for Date ${date} to database.`);
                }
            } catch (err) {
                console.error(err);
            }
        }, i * 5000);
    }
}

async function addAllTeamGames(season) {
    const teamGamesUrl = API_URL + `games?seasons[]=${season}&team_ids[]=`;
    for(let i = 1; i <= 30; i++) {
        setTimeout(async function addPlayers() {
            const tempUrl = teamGamesUrl + String(i) + '&per_page=100';
            try {
                const result = await axios.get(tempUrl);
                for(const element of result.data.data) {
                    const teamgame = new TeamGame({
                        teamNumber: i,
                        game: element
                    });
                    await teamgame.save();
                    console.log(`Saved a game for team ID ${i} for the ${season} Season.`);
                }

            } catch (error) {
                console.error(error);
            }
        }, i * 5000);
    }
}

async function addAllPlayersSeasonStatsTotals(season) {
    const seasonStats = await SeasonStats.find({"game.season": season});
    for(const element of seasonStats) {
        const playerID = element.player.id;
        const filter = {"player.id": playerID, "game.season": season};
        const check = await SeasonStatsTotal.find(filter);
        if(check.length == 0) {
            const seasonstatstotal = new SeasonStatsTotal({
                ast: element.ast,
                blk: element.blk,
                dreb: element.dreb,
                fg3_pct: element.fg3_pct,
                fg3a: element.fg3a,
                fg3m: element.fg3m,
                fg_pct: element.fg_pct,
                fga: element.fga,
                fgm: element.fgm,
                ft_pct: element.ft_pct,
                fta: element.fta,
                ftm: element.ftm,
                game: element.game,
                min: element.min,
                oreb: element.oreb,
                pf: element.pf,
                player: element.player,
                pts: element.pts,
                reb: element.reb,
                stl: element.stl,
                team: element.team,
                turnover: element.turnover,
                games_played: 1
            });
            await seasonstatstotal.save();
            console.log(`Saved Stats for Player ID ${seasonstatstotal.player.id} for Season ${season} to database.`);
        } else {
            const update = {
                ast: check[0]._doc.ast + element.ast,
                blk: check[0]._doc.blk + element.blk,
                dreb: check[0]._doc.dreb + element.dreb,
                fg3_pct: check[0]._doc.fg3_pct + element.fg3_pct,
                fg3a: check[0]._doc.fg3a + element.fg3a,
                fg3m: check[0]._doc.fg3m + element.fg3m,
                fg_pct: check[0]._doc.fg_pct + element.fg_pct,
                fga: check[0]._doc.fga + element.fga,
                fgm: check[0]._doc.fgm + element.fgm,
                ft_pct: check[0]._doc.ft_pct + element.ft_pct,
                fta: check[0]._doc.fta + element.fta,
                ftm: check[0]._doc.ftm + element.ftm,
                min: check[0]._doc.min + element.min,
                game: element.game,
                oreb: check[0]._doc.oreb + element.oreb,
                pf: check[0]._doc.pf + element.pf,
                pts: check[0]._doc.pts + element.pts,
                reb: check[0]._doc.reb + element.reb,
                stl: check[0]._doc.stl + element.stl,
                turnover: check[0]._doc.turnover + element.turnover,
                games_played: check[0]._doc.games_played + 1
            }
            await SeasonStatsTotal.findOneAndUpdate(filter, update);
            console.log(`Adding Stats for Player ID ${check[0]._doc.player.id} for Season ${season} Totals to database.`);
        }
    }
}

async function knicksSeasonStats(season) {
     const teamGamesUrl = API_URL + `games?seasons[]=${season}&team_ids[]=20`;
        setTimeout(async function addPlayers() {
            const tempUrl = teamGamesUrl + '&per_page=100';
            try {
                const result = await axios.get(tempUrl);
                for(const element of result.data.data) {
                    const knicksSeasonStats = new Knicks({
                        teamNumber: 20,
                        game: element
                    });
                    await teamgame.save();
                    console.log(`Saved a game for team ID ${20} for the ${season} Season.`);
                }

            } catch (error) {
                console.error(error);
            }
        }, i * 5000);
    
}

//TODO: SEASONS 2019-1998
//DONT PASS IN 2020
//addAllPlayerSeasonStatsBySeason('2020');
//addAllPlayerSeasonStatsByDate('2021-01-28');
//addAllTeamGames('2020');
//addAllPlayersSeasonStatsTotals('2020');