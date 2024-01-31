const { Server } = require('socket.io');

const io = new Server();
const tokenNamespace = io.of('/token-space');
var Socket = {

    emitToken: function (event, data) {

        tokenNamespace.to("token")
            .emit(
                "token",
                data
            );
    },
};

tokenNamespace.on('connection', function (socket) {
    console.log(
        'A client connected'
    );
    socket.join("token");
});

exports.Socket = Socket;
exports.io = io;