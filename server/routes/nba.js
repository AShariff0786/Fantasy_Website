const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_URL = 'https://www.balldontlie.io/api/v1/players';

router.get('/', async (req, res) => {
    try {
        const { data } = await axios.get(API_URL);
        res.json(data);
    } catch (err) {
        res.json({
            message: "Our hamsters are busy at the moment."
        })
    }
});

module.exports = router;