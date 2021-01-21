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

router.get('/', async (req, res, next) => {
    var date = getDate();
    gamesURL = API_URL + `games?dates[]=${date}`;
    let gamesData;
    try {
        const { data } = await axios.get(gamesURL);
        gamesData = data.data;
    } catch (err) {
        next(err);
    }

    res.render('nba.ejs', {games: gamesData});
});

router.get('/', async (req, res, next) => {
    teamsURL = API_URL + 'teams'; 
    let teamsData;

    try{
        const {data } = await axios.get(teamsURL);
        teamsData = data.data;
    }catch (err) {
        next(err);
    }
    
    res.render('nba.ejs', {teams: teamsData});
});

module.exports = router;