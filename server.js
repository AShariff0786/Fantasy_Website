const express = require('express');
const nbaRouter = require('./routes/nba');
require('dotenv').config();

const middlewares = require('./middlewares');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use('/nba', nbaRouter);

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
})