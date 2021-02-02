const express = require('express');
const mongoose = require('mongoose');
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

router.get('/', async(req, res) => {
    renderMessage(res, true, "Please remember to add the Season Stats By Date for yesterday's date in the format of YYYY-MM-DD and also update the Season Average for current season 2020. TODO SHOW COLLECTIONS" , "success");
});

router.post('/', async(req, res) => {
    let query = req.body.queryText;
    const option = req.body.queryOption;
    if(option == "addSeasonStatsBySeason") {
        const result = await addAllPlayerSeasonStatsBySeason(query);
        if (result == "error1") {
            renderMessage(res, true, "Invalid query input for a season e.g. 2020.", "error");
        } else if (result == "error2") {
            renderMessage(res, true, `The database already contains the data for the ${query} season, try the 'Add All Seasons Stats By Season' option with a specific date.`, "error");
        } else if (result == "error3") {
            renderMessage(res, true, `Something went wrong, please check the console logs!`, "error");
        } else if (result == "error4") {
            renderMessage(res, true, `The API returned with no data, try again later.`, "error");
        } else {
            renderMessage(res, true, `Success: All players stats have been added to the database for the ${query} season.`, "success");
        }
    } else if(option == "addSeasonStatsByDate") {
        const result = await addAllPlayerSeasonStatsByDate(query);
        if (result == "error1") {
            renderMessage(res, true, "Invalid query input for a date e.g. 2021-01-01 must follow format YYYY-MM-DD.", "error");
        } else if (result == "error2") {
            renderMessage(res, true, `The database contains the games for the date of ${query}.`, "error");
        } else if (result == "error3") {
            renderMessage(res, true, `Something went wrong, please check the console logs!`, "error");
        } else if (result == "error4") {
            renderMessage(res, true, `The API returned with no data, try again later.`, "error");
        } else {
            renderMessage(res, true, `Success: All players stats have been added to the database for the date of ${query}.`, "success");
        }
    } else if(option == "addSeasonAveragesBySeason") {
        const result = await addAllPlayerSeasonAveragesBySeason(query);
        if (result == "error1") {
            renderMessage(res, true, "Invalid query input for a season e.g. 2020.", "error");
        } else if (result == "error2") {
            renderMessage(res, true, `The database already contains the season averages of all players for the ${query} season.`, "error");
        } else if (result == "error3") {
            renderMessage(res, true, `Something went wrong, please check the console logs!`, "error");
        } else {
            renderMessage(res, true, `Success: All Season Averages have been added to the database for the ${query} season.`, "success");
        }
    } else if(option == "addSeasonTotalsBySeason") {
        const result = await addAllPlayersSeasonStatsTotalsBySeason(query);
        if (result == "error1") {
            renderMessage(res, true, "Invalid query input for a season e.g. 2020.", "error");
        } else if (result == "error2") {
            renderMessage(res, true, `Something went wrong, please check the console logs!`, "error");
        } else if (result == "error3") {
            renderMessage(res, true, `The database already contains the current season totals of all players for the ${query} season.`, "error");
        } else {
            renderMessage(res, true, `Success: All Season Stat Totals have been added to the database for the ${query} season.`, "success");
        }
    } else if(option == "addAllTeams") {
        const result = await addAllTeams();
        if (result == "error1") {
            renderMessage(res, true, "It seems that the teams are already added within the database.", "error");
        } else if (result == "error2") {
            renderMessage(res, true, "Something went wrong, please check the console logs!", "error");
        } else if (result == "error3") {
            renderMessage(res, true, `The API returned with no data, try again later.`, "error");
        } else {
            renderMessage(res, true, "Success: All teams have been added to the database.", "success");
        }
    } else if(option == "addAllPlayers") {
        const result = await addAllPlayers();
        if (result == "error1") {
            renderMessage(res, true, "It seems that all players up to the 2020 season are already added within the database.", "error");
        } else if (result == "error2") {
            renderMessage(res, true, "Something went wrong, please check the console logs!", "error");
        } else if (result == "error3") {
            renderMessage(res, true, `The API returned with no data, try again later.`, "error");
        } else {
            renderMessage(res, true, "Success: All players have been added to the database.", "success");
        }
    } else if(option == "addAllTeamGamesBySeason") {
        const result = await addAllTeamGamesBySeason(query);
        if (result == "error1") {
            renderMessage(res, true, "Invalid query input for a season e.g. 2020", "error");
        } else if (result == "error2") {
            renderMessage(res, true, `The database contains some games for the ${query} season, try the 'Add All Team Games By Date' option with a specific date.`, "error");
        } else if (result == "error3") {
            renderMessage(res, true, "Something went wrong, please check the console logs!", "error");
        } else if (result == "error4") {
            renderMessage(res, true, `The API returned with no data found with the season of ${query}, try again later.`, "error");
        } else {
            renderMessage(res, true, `Success: All Team Games have been added to the database for the ${query} season.`, "success");
        }
    } else if(option == "addAllTeamGamesByDate") {
        const result = await addAllTeamGamesByDate(query);
        if (result == "error1") {
            renderMessage(res, true, "Invalid query input for a date e.g. 2021-01-01 must follow format YYYY-MM-DD", "error");
        } else if (result == "error2") {
            renderMessage(res, true, `The database contains the games for the date of ${query}.`, "error");
        } else if (result == "error3") {
            renderMessage(res, true, "Something went wrong, please check the console logs!", "error");
        } else if (result == "error4") {
            renderMessage(res, true, `The API returned with no data found with the date of ${query}, try again later.`, "error");
        } else {
            renderMessage(res, true, `Success: All Team Games have been added to the database for the date of ${query}.`, "success");
        }
    } else if(option == "updateRecordsBySeason") {
        const result = await updateRecordsBySeason(query);
        if (result == "error1") {
            renderMessage(res, true, "Invalid query input for a season e.g. 2020", "error");
        } else if (result == "error2") {
            renderMessage(res, true, `The database contains the Team Records for the ${query} season, try Update Records By Date.`, "error");
        } else if (result == "error3") {
            renderMessage(res, true, "Something went wrong, please check the console logs!", "error");
        } else {
            renderMessage(res, true, `Success: All Standings have been added/updated to the database for the ${query} season.`, "success");
        }
    } else if(option == "updateRecordsByDate") {
        const result = await updateRecordsByDate(query);
        if (result == "error1") {
            renderMessage(res, true, "Invalid query input for a date e.g. 2021-01-01 must follow format YYYY-MM-DD", "error");
        } else if (result == "error2") {
            renderMessage(res, true, `The database contains the Team Records that were last updated on the date of ${query}.`, "error");
        } else if (result == "error3") {
            renderMessage(res, true, "It appears there are no Team Games with this date in database to update records, please add them!", "error");
        } else if (result == "error4") {
            renderMessage(res, true, "Something went wrong, please check the console logs!", "error");
        } else {
            renderMessage(res, true, `Success: All Standings have been added/updated to the database for the date of ${query}.`, "success");
        }
    } else {
        renderMessage(res, true, "No option was selected in dropdown.", "error");
    }
});

function renderMessage(res, status, text, state) {
    const message = {
        status: status,
        text: text,
        state: state
    }
    res.render('database.ejs', { message: message});
}

function validateSeason(season) {
    const regex = new RegExp(/^\d{4}$/);
    if(!regex.test(season)) return false;
    return true;
}

function validateDate(date) {
    const regex = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
    if(!regex.test(date)) return false;
    const d = new Date(date);
    var dNum = d.getTime();
    if(!dNum && dNum !== 0) return false;
    return d.toISOString().slice(0,10) === date;
}

function addMinTime(min1, min2) {
    let a = min1.split(":");
    let b = min2.split(":");
    let minutes = Number(a[0]) + Number(b[0]);
    let seconds = Number(a[1]) + Number(b[1]);
    if(isNaN(minutes)) minutes = 0;
    if(isNaN(seconds)) seconds = 0
    const result = `${minutes}:${seconds}`;
    return result;
}

async function addAllPlayerSeasonStatsBySeason(season) {
    if(validateSeason(season)) {
        const check = await SeasonStats.find({ "game.season": season});
        if(check.length == 0) {
            const statsUrl = API_URL + `stats?seasons[]=${season}&per_page=100`;
            let totalPages;
            let dataCheck;
            try {
                const { data } = await axios.get(statsUrl);
                totalPages = data.meta.total_pages;
                dataCheck = data.data;
            } catch (err) {
                console.error(err);
                return "error3";
            }
            if(dataCheck.length == 0) {
                return "error4";
            } else {
                for(let i = 1; i <= totalPages; i++) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
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
                        return "error3";
                    }
                }
            }
        } else {
            return "error2";
        }
    } else {
        return "error1";
    }
}

async function addAllPlayerSeasonStatsByDate(date) {
    if(validateDate(date)) {
        const checkDate = new Date(date).toISOString();
        const check = await SeasonStats.find({ "game.date": checkDate });
        if(check.length == 0) {
            const statsUrl = API_URL + `stats?per_page=100&dates[]=${date}`;
            let totalPages;
            let dataCheck;
            try {
                const { data } = await axios.get(statsUrl);
                totalPages = data.meta.total_pages;
                dataCheck = data.data;
            } catch (err) {
                console.error(err);
                return "error3";
            }
            if(dataCheck.length == 0) {
                return "error4";
            } else {
                for(let i = 1; i <= totalPages; i++) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
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
                        return "error3";
                    }
                }
                await updateSeasonStatsTotalsByDate(checkDate);
            }
        } else {
            return "error2";
        }
    } else {
        return "error1";
    }
}

async function updateSeasonStatsTotalsByDate(date) {
    try {
        const stats = await SeasonStats.find({ "game.date": date });
        for (const stat of stats) {
            const playerID = stat.player.id;
            const filter = {"player.id": playerID};
            const total = await SeasonStatsTotal.findOne(filter);
            if (!total) {
                continue;
            } else {
                update = {
                    ast: total.ast + stat.ast,
                    blk: total.blk + stat.blk,
                    dreb: total.dreb + stat.dreb,
                    fg3_pct: total.fg3_pct + stat.fg3_pct,
                    fg3a: total.fg3a + stat.fg3a,
                    fg3m: total.fg3m + stat.fg3m,
                    fg_pct: total.fg_pct + stat.fg_pct,
                    fga: total.fga + stat.fga,
                    fgm: total.fgm + stat.fgm,
                    ft_pct: total.ft_pct + stat.ft_pct,
                    fta: total.fta + stat.fta,
                    ftm: total.ftm + stat.ftm,
                    min: total.min + stat.min,
                    game: stat.game,
                    oreb: total.oreb + stat.oreb,
                    pf: total.pf + stat.pf,
                    pts: total.pts + stat.pts,
                    reb: total.reb + stat.reb,
                    stl: total.stl + stat.stl,
                    turnover: total.turnover + stat.turnover,
                    games_played: total.games_played + 1
                }
                await SeasonStatsTotal.findOneAndUpdate(filter, update);
                console.log(`Adding Stats for Player ID ${total.player.id} for date of ${date} Totals to database.`);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function addAllPlayerSeasonAveragesBySeason(season) {
    if(season == '2020') {
        const averages = await SeasonAvg.find( {"season":season} );
        const seasonUrl = `${API_URL}season_averages?season=${season}&player_ids[]=`;
        const playerIDs = []
        for(const avg of averages) {
            playerIDs.push(avg.player_id);
        }
        const tempUrl = `${seasonUrl}${playerIDs.toString()}`;
        try {
            const result = await axios.get(tempUrl);
            const data = result.data.data;
            if(data.length == 0) {
                return "error4";
            } else {
                for(const element of data) {
                    const id = element.player_id;
                    const update = {
                        games_played: element.games_played,
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
                    }
                    await SeasonAvg.findOneAndUpdate({player_id: id}, update);
                    console.log(`Updated Season Average of Player ID ${id} for the ${season} Season to database.`);
                }
            }
        } catch (error) {
            console.error(error);
            return "error3";
        }
    } else {
        if(validateSeason(season)) {
            const check = await SeasonAvg.find( {"season":season} );
            if(check.length == 0) {
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
                    try {
                        const result = await axios.get(tempUrl);
                        const data = result.data.data;
                        if(data.length == 0) {
                            continue;
                        } else {
                            for(const element of data) {
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
                    } catch (error) {
                        console.error(error);
                        return "error3";
                    }
                }
            } else {
                return "error2";
            }
        } else {
            return "error1";
        }
    }
}

async function addAllPlayersSeasonStatsTotalsBySeason(season) {
    if(validateSeason(season)) {
        try {
            const totalsCheck = await SeasonStatsTotal.find({"game.season": season});
            if(totalsCheck.length == 0) {
                const seasonStats = await SeasonStats.find({"game.season": season});
                for(const element of seasonStats) {
                    const playerID = element.player.id;
                    const filter = {"player.id": playerID, "game.season": season};
                    const check = await SeasonStatsTotal.findOne(filter);
                    if(!check) {
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
                        console.log(`Saved Total Stats for Player ID ${seasonstatstotal.player.id} for Season ${season} to database.`);
                    } else {
                        let update;
                        const date1 = new Date(element.game.date);
                        const date2 = new Date(check.game.date);
                        const minutes = addMinTime(check.min, element.min);
                        if(date1 > date2) {
                            update = {
                                ast: check.ast + element.ast,
                                blk: check.blk + element.blk,
                                dreb: check.dreb + element.dreb,
                                fg3_pct: check.fg3_pct + element.fg3_pct,
                                fg3a: check.fg3a + element.fg3a,
                                fg3m: check.fg3m + element.fg3m,
                                fg_pct: check.fg_pct + element.fg_pct,
                                fga: check.fga + element.fga,
                                fgm: check.fgm + element.fgm,
                                ft_pct: check.ft_pct + element.ft_pct,
                                fta: check.fta + element.fta,
                                ftm: check.ftm + element.ftm,
                                min: minutes,
                                game: element.game,
                                oreb: check.oreb + element.oreb,
                                pf: check.pf + element.pf,
                                pts: check.pts + element.pts,
                                reb: check.reb + element.reb,
                                stl: check.stl + element.stl,
                                turnover: check.turnover + element.turnover,
                                games_played: check.games_played + 1
                            }
                        } else {
                            update = {
                                ast: check.ast + element.ast,
                                blk: check.blk + element.blk,
                                dreb: check.dreb + element.dreb,
                                fg3_pct: check.fg3_pct + element.fg3_pct,
                                fg3a: check.fg3a + element.fg3a,
                                fg3m: check.fg3m + element.fg3m,
                                fg_pct: check.fg_pct + element.fg_pct,
                                fga: check.fga + element.fga,
                                fgm: check.fgm + element.fgm,
                                ft_pct: check.ft_pct + element.ft_pct,
                                fta: check.fta + element.fta,
                                ftm: check.ftm + element.ftm,
                                min: minutes,
                                oreb: check.oreb + element.oreb,
                                pf: check.pf + element.pf,
                                pts: check.pts + element.pts,
                                reb: check.reb + element.reb,
                                stl: check.stl + element.stl,
                                turnover: check.turnover + element.turnover,
                                games_played: check.games_played + 1
                            }
                        }
                        await SeasonStatsTotal.findOneAndUpdate(filter, update);
                        console.log(`Adding Stats for Player ID ${check.player.id} Totals for Season ${season} Totals to database.`);
                    }
                }
            } else {
                return "error3";
            }
        } catch (error) {
            console.error(error);
            return "error2";
        }
    } else {
        return "error1";
    }
}

async function addAllTeams() {
    const check = await Team.find();
    if(check.length == 0) {
        teamsURL = API_URL + 'teams'; 
        let teamsData;
        try {
            const {data } = await axios.get(teamsURL);
            teamsData = data.data;
        } catch (err) {
            console.error(err);
            return "error2";
        }
        if(teamsData.length == 0) {
            return "error3";
        } else {
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
                try {
                    await team.save();
                    console.log(`Saved Team ${team.teamNumber} to database.`);
                } catch (error) {
                    console.error(error);
                    return "error2";
                }
            }
        }
    } else {
        return "error1";
    }
}

async function addAllPlayers() {
    const check = await Player.find();
    if(check.length == 0) {
        const playersURL = API_URL + 'players?per_page=100';
        let totalPages;
        try {
            const { data } = await axios.get(playersURL);
            totalPages = data.meta.total_pages;
        } catch (err) {
            console.error(err);
            return "error2";
        }
        
        for(let i = 1; i <= totalPages; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const tempURL = playersURL + '&page=' + String(i);
            try {
                const newData = await axios.get(tempURL);
                if(newData.data.data.length == 0) {
                    return "error3";
                } else {
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
                }
            } catch (err) {
                console.error(err);
                return "error2";
            }
        }
    } else {
        return "error1";
    }
}

async function addAllTeamGamesBySeason(season) {
    if(validateSeason(season)) {
        const check = await TeamGame.find({ "game.season": season });
        if(check.length == 0) {
            const teamGamesUrl = API_URL + `games?seasons[]=${season}&team_ids[]=`;
            for(let i = 1; i <= 30; i++) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                const tempUrl = teamGamesUrl + String(i) + '&per_page=100';
                try {
                    const result = await axios.get(tempUrl);
                    if(result.data.data.length == 0) {
                        return "error4";
                    } else {
                        for(const element of result.data.data) {
                            const teamgame = new TeamGame({
                                teamNumber: i,
                                game: element
                            });
                            await teamgame.save();
                            console.log(`Saved a game for team ID ${i} for the ${season} Season.`);
                        }
                    }
                } catch (error) {
                    console.error(error);
                    return "error3";
                }
            }
        } else {
            return "error2";
        }
    } else {
        return "error1";
    }
}

async function addAllTeamGamesByDate(date) {
    if(validateDate(date)) {
        const checkDate = new Date(date).toISOString();
        const check = await TeamGame.find({ "game.date": checkDate });
        if(check.length == 0) {
            const teamGamesUrl = API_URL + `games?dates[]=${date}&team_ids[]=`;
            for(let i = 1; i <= 30; i++) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                const tempUrl = teamGamesUrl + String(i) + '&per_page=100';
                try {
                    const result = await axios.get(tempUrl);
                    if(result.data.data.length == 0) {
                        return "error4";
                    } else {
                        for(const element of result.data.data) {
                            const teamgame = new TeamGame({
                                teamNumber: i,
                                game: element
                            });
                            await teamgame.save();
                            console.log(`Saved a game for team ID ${i} for the date of ${date}.`);

                        }
                    }
                } catch (error) {
                    console.error(error);
                    return "error3";
                }
            }
        } else {
            return "error2";
        }
    } else {
        return "error1";
    }
}

async function updateTeamGamesByDate(date) {
    if(validateDate(date)) {
        const checkDate = new Date(date).toISOString();
        const check = await TeamGame.find({ "game.date": checkDate });
        if(check.length != 0) {
            const teamGamesUrl = API_URL + `games?dates[]=${date}&team_ids[]=`;
            for(let i = 1; i <= 30; i++) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                const tempUrl = teamGamesUrl + String(i) + '&per_page=100';
                try {
                    const result = await axios.get(tempUrl);
                    if(result.data.data.length == 0) {
                        continue;
                    } else {
                        for(const element of result.data.data) {
                            const filter = {teamNumber: i, "game.date": checkDate };
                            const update = {
                                game: element
                            };
                            await TeamRecord.findOneAndUpdate(filter, update);
                            console.log(`Updating Team Game for Team ID ${i} for the date of ${checkDate}.`);
                        }
                    }
                } catch (error) {
                    console.error(error);
                    return "error3";
                }
            }
        } else {
            return "error2";
        }
    } else {
        return "error1";
    }
}

//Fixed this up for you and left comments to help understand a little bit better how the database works - T.R
async function updateRecordsBySeason(season) {
    //First validate the season to make sure there is no harmful query input
    if(validateSeason(season)) {
        const recordCheck = await TeamRecord.findOne({'record.year': season});
        if(!recordCheck) {
            //Find all Team Games present within the collection where the season = to the given season parameter
            const teamGames = await TeamGame.find( {"game.season": season} ).sort({"game.date": 1});
            //Loop through each model
            for(const element of teamGames) {
                //Anyone of the database reads or writes can throw an error so surround with try catch.
                try {
                    //If any of the games haven't been played yet don't count them.
                    if(element.game.period == 0) continue;
                    //Get current team games team id.
                    const teamID = element.teamNumber;
                    //Filter to search the Team Record database to check if one exists with certain constaints
                    const filter = {"teamNumber": teamID, "record.year": season};
                    const check = await TeamRecord.findOne(filter);
                    //Find out whether the current team is either the home team or vistor team
                    let homeTeamCheck = false;
                    if(element.teamNumber == element.game.home_team.id) homeTeamCheck = true;
                    const lastUpdatedDate = element.game.date;
                    //If there isn't a record already here then create it
                    if(!check) {
                        let record;
                        //If the team is the home team check if their score is higher than visitor
                        if(homeTeamCheck) {
                            if(element.game.home_team_score > element.game.visitor_team_score) {
                                record = new TeamRecord({
                                    teamNumber : teamID,
                                    record : {
                                        year: season,
                                        wins: 1,
                                        loss: 0
                                    },
                                    lastUpdatedDate: lastUpdatedDate
                                });
                            } else {
                                record = new TeamRecord({
                                    teamNumber : teamID,
                                    record: {
                                        year: season,
                                        wins: 0,
                                        loss: 1
                                    },
                                    lastUpdatedDate: lastUpdatedDate
                                });
                            }
                        //This means that the current team is the visitor team then reverse check
                        } else {
                            if(element.game.visitor_team_score > element.game.home_team_score) {
                                record = new TeamRecord({
                                    teamNumber : teamID,
                                    record : {
                                        year: season,
                                        wins: 1,
                                        loss: 0
                                    },
                                    lastUpdatedDate: lastUpdatedDate
                                });
                            } else {
                                record = new TeamRecord({
                                    teamNumber : teamID,
                                    record: {
                                        year: season,
                                        wins: 0,
                                        loss: 1
                                    },
                                    lastUpdatedDate: lastUpdatedDate
                                });
                            }
                        }
                        await record.save();
                        console.log(`Saved new record for team ID ${teamID} for the ${season} Season.`);           
                    } else {
                        //Record exists so time to update
                        let update;
                        //Do the same check for if the current team is the home team
                        if(homeTeamCheck) {
                            if(element.game.home_team_score > element.game.visitor_team_score){
                                update = {
                                    "record.wins": check.record.wins + 1,
                                    lastUpdatedDate: lastUpdatedDate
                                }
                            } else {
                                update = {
                                    "record.loss": check.record.loss + 1,
                                    lastUpdatedDate: lastUpdatedDate
                                }
                            }
                        } else {
                            if(element.game.visitor_team_score > element.game.home_team_score){
                                update = {
                                    "record.wins": check.record.wins + 1,
                                    lastUpdatedDate: lastUpdatedDate
                                }
                            } else {
                                update = {
                                    "record.loss": check.record.loss + 1,
                                    lastUpdatedDate: lastUpdatedDate
                                }
                            }
                        }
                        //Find the same record based on the given filter above and update the fields
                        await TeamRecord.findOneAndUpdate(filter, update);
                        console.log(`Updating Team Record for Team ID ${check.teamNumber} for the ${season} Season.`);
                    }
                } catch (error) {
                    console.error(error);
                    return "error3";
                }
            }
        } else {
            return "error2";
        }
    } else {
        return "error1";
    }
}

async function updateRecordsByDate(date){
    await updateTeamGamesByDate(date);
    if(validateSeason(date)) {
        const checkDate = new Date(date).toISOString();
        const recordCheck = await TeamRecord.findOne({'lastUpdatedDate': checkDate});
        if(!recordCheck) {
            const teamGamesCheck = await TeamGame.find( {"game.date": checkDate} );
            if(teamGamesCheck.length != 0) {
                for(const element of teamGamesCheck) {
                    const teamID = element.teamNumber;
                    let homeTeamCheck = false;
                    if(teamID == element.game.home_team.id) homeTeamCheck = true;
                    const lastUpdatedDate = element.game.date;
                    let update;
                    if(homeTeamCheck) {
                        if(element.game.home_team_score > element.game.visitor_team_score){
                            update = {
                                "record.wins": check.record.wins + 1,
                                lastUpdatedDate: lastUpdatedDate
                            }
                        } else {
                            update = {
                                "record.loss": check.record.loss + 1,
                                lastUpdatedDate: lastUpdatedDate
                            }
                        }
                    } else {
                        if(element.game.visitor_team_score > element.game.home_team_score){
                            update = {
                                "record.wins": check.record.wins + 1,
                                lastUpdatedDate: lastUpdatedDate
                            }
                        } else {
                            update = {
                                "record.loss": check.record.loss + 1,
                                lastUpdatedDate: lastUpdatedDate
                            }
                        }
                    }
                    try {
                        const filter = {"teamNumber": teamID, "lastUpdatedDate": lastUpdatedDate};
                        await TeamRecord.findOneAndUpdate(filter, update);
                        console.log(`Updating Team Record for Team ID ${teamID} for the date of ${date}.`);
                    } catch (error) {
                        console.error(error);
                        return "error4";
                    }
                }
            } else {
                return "error3";
            } 
        } else {
            return "error2";
        }
    } else {
        return "error1";
    }
}

module.exports = router;
