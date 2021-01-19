const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: 'In nba router'
    });
});

module.exports = router;