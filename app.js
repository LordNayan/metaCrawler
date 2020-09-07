const express = require("express");
const app = express();
const indexRouter = require('./src/routes/index');
const metaRouter = require('./src/routes/metaCrawl');
const config = require("./src/config/config");
const port = config.port;

//Express Methods
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Route Locations
app.use('/', indexRouter);
app.use('/meta', metaRouter);

app.listen(port, () => console.log(`Server started on port ${port}`));

//Default error Handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    console.error(err.stack);
    res.render('error');
})

module.exports = app;