const express = require('express');
const mongoose = require('mongoose');
const nbaRouter = require('./routes/nba');
const databaseRouter = require('./routes/database');
require('dotenv').config();

const middlewares = require('./middlewares');

const app = express();

//Handle Database connection along with connection errors
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

db.once('open', () => {
    console.log('Connected to the database.');
});
db.on('error', (error) => {
    console.error(`Something went wrong with the database: ${error}`);
});
db.on('disconnected', function () {
    console.log('Mongoose default connection to Database disconnected.');
});
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(express.static(__dirname + '/public'));
app.use('/nba', nbaRouter);
app.use('/database', databaseRouter);

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
})