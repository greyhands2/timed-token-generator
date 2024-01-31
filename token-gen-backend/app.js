const express = require('express');
const app = express();
const cors = require('cors');
const tokenArr = require('./tokens.js');

// Use middleware to parse JSON and handle CORS
app.use(express.json({ limit: '5mb' }));
app.use(cors());
app.options('*', cors());

/*** Endpoints ***/
app.get('/', (req, res) => {
    // Simple success response for the root route
    res.status(200).json({
        status: 'success',
        message: 'Why Are You Here 🙄🙄🙄🙄',
    });
});

// Example route with placeholder function
app.get('/token-gen/fetchToken', (req, res)=>{
    // we want to randomly select a token from the token array
    let randomIndex = Math.floor(Math.random() * tokenArr.length);
    res.status(200).json({
        status: 'success',
        data: tokenArr[randomIndex]
    })
});

/**** Error Handling ****/
// Custom 404 handler
app.all('*', (req, res, next) => {
    next(new Error(`Can't find ${req.originalUrl} on this server!!! 😫`, 404));
});

// Default error handler
app.use((err, req, res, next) => {
    console.error(err);

    // Respond with an error message and status code
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            statusCode: err.status || 500,
        },
    });
});


module.exports = app;
