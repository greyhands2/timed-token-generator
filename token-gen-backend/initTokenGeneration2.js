// Importing the randStringGen function from 'osas-string-utils'
const { randStringGen } = require('osas-string-utils');
// Importing the tokenArr array and the Socket object
const tokenArr = require('./tokens.js');
const { Socket } = require('./socket.js');

// Constants for token generation
const TOKEN_LENGTH = 6;
const TOKEN_EXPIRY_TIME = 60; // 60 seconds
const INTERVAL_DURATION = 1000; // 1 second
const TOKEN_TYPE = '1b' // Alphanumeric
// Function to emit a token for a given index
const emitToken = async (index) => {
    try {
        // Generate a random token using randStringGen
        const token = await randStringGen(TOKEN_LENGTH, TOKEN_TYPE);
        // Create an object representing the token with its expiration time
        const tokenObj = { token, time: TOKEN_EXPIRY_TIME };

        // Assign the token object to the tokenArr at the specified index
        tokenArr[index] = tokenObj;
        // Emit the token object to the 'token' event using Socket.io
        Socket.emitToken('token', tokenObj);

        // Set up an interval to decrement the token expiration time
        const intervalId = setInterval(() => {
            tokenArr[index]['time'] -= 1;

            // If the token expires, clear the interval and generate a new token
            if (tokenArr[index]['time'] === 0) {
                clearInterval(intervalId);
                emitToken(index);
            }
        }, INTERVAL_DURATION);
    } catch (err) {
        // Handle errors during token generation or emission
        console.error('Error generating or emitting token:', err);
    }
};

// Function to start the token generation process
const startTokenGen = async () => {
    // Create an array of promises using Array.from for token generation
    const promises = Array.from({ length: 6 }, (_, index) => emitToken(index));
    // Wait for all promises to resolve using Promise.all
    await Promise.all(promises);
};

// Export the startTokenGen function for external use
module.exports = startTokenGen;
