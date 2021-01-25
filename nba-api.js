const axios = require('axios');
const Team = require('./models/teams');
const Player = require('./models/players')
const mongoose = require('mongoose');

const API_URL = 'https://www.balldontlie.io/api/v1/';

mongoose.connect('mongodb+srv://trasik:rhino1234@cluster0.vmwam.mongodb.net/FantasyApp?retryWrites=true&w=majority', {
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