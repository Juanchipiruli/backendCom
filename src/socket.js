// socket.js
let io;

module.exports = {
  init: (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Cliente conectado via WebSocket');

      socket.on('disconnect', () => {
        console.log('Cliente desconectado');
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io no ha sido inicializado");
    }
    return io;
  }
};
