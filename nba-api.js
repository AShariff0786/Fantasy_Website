const axios = require('axios');
const Team = require('./models/teams');
const Player = require('./models/players');
const SeasonAvg = require('./models/seasonavgs');
const mongoose = require('mongoose');
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