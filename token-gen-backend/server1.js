(async () => {
    const app = require('./app.js');
    const http = require('http');
    let tokenGenServer = http.createServer(app);
    const startTokenGen = require('./initTokenGeneration1.js');
    let { io } = require('./socket.js');
    io.attach(tokenGenServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    const port = 3100 || process.env.PORT;
    const server = tokenGenServer.listen(
        port,
        () => {
            console.log(
                `app running on port ${port}`
            );
            startTokenGen();
        }
    );

})();