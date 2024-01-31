const { randStringGen } = require('osas-string-utils');
const tokenArr = require('./tokens.js');
const { Socket } = require('./socket.js');

// Constants for configuration
const CONTROL_INITIAL_STATE = {
    status: 0,
    timeoutId: null,
};
const TOKEN_LENGTH = 6;
const TOKEN_EXPIRY_TIME = 60; // seconds
const INTERVAL_DURATION = 1000; // milliseconds
const BATCH_SIZE = 6;
const CLEAR_INTERVAL_TIME = 65000; // milliseconds
const TOKEN_TYPE = '1b' // Alphanumeric
// Initial control state
const control = { ...CONTROL_INITIAL_STATE };

// Handler for the proxy object
const handler = {
    set(target, property, value) {
        target[property] = value;

        // Check for the condition to start a new token generation
        if (property === 'status' && target[property] === BATCH_SIZE) {
            if (target.timeoutId) {
                clearTimeout(target.timeoutId);
            }
            target.timeoutId = setTimeout(startTokenGen, INTERVAL_DURATION);
        }

        return true;
    },
};

// Proxy object to control token generation
const proxyControl = new Proxy(control, handler);

// Function to emit a token and handle its expiration
const emitToken = async (index, intervalIds) => {
    try {
        // Generate a new token
        const token = await randStringGen(TOKEN_LENGTH, TOKEN_TYPE);
        const tokenObj = { token, time: TOKEN_EXPIRY_TIME };
        tokenArr.push(tokenObj);
        Socket.emitToken('token', tokenObj);

        // Set up an interval to handle token expiration
        const intervalId = setInterval(() => {
            tokenArr[index].time -= 1;

            if (tokenArr[index].time === 0) {
                proxyControl.status += 1;
                clearInterval(intervalId);
            }
        }, INTERVAL_DURATION);

        // Store the interval ID for cleanup
        intervalIds.push(intervalId);
    } catch (err) {
        console.error('Error generating or emitting token:', err);
    }
};

// Function to start the token generation process
const startTokenGen = async () => {
    // Reset tokenArr and control state
    tokenArr.length = 0;
    control.status = 0;
    control.timeoutId = null;

    // Array to store interval IDs for cleanup
    const intervalIds = [];

    // Create an array of promises for token generation
    const promises = Array.from({ length: BATCH_SIZE }, (_, index) => {
        emitToken(index, intervalIds);
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    // Function to clear all intervals just incase to prevent any funny behavior
    const clearAllIntervals = () => {
        intervalIds.forEach((id) => clearInterval(id));
    };

    // Example usage: clear all intervals after a specified time
    setTimeout(clearAllIntervals, CLEAR_INTERVAL_TIME);
};

// Export the main function
module.exports = startTokenGen;
