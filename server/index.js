const express = require("express");
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('../client/views/index.ejs');
});

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
})