const socketIO = require('socket.io');

class Socket {
  static load(server) {
    const io = socketIO(server).of('/api');

    io.on('connection', (socket) => {
      console.log('connected');

      socket.on('disconnect', () => {
        console.log('browser disconnected');
      });

      socket.on('connect company', (data) => {
        if (data.company) {
          socket.join(`/priv/${data.company._id}`);
        }
      });

      socket.on('msg', (data) => {
        const {
          chatId, company, owner, message,
        } = data;

        socket.in(`/priv/${company._id}`).emit('msg', {
          company: owner,
          lastMessage: message,
          _id: chatId,
        });
      });
    });
    Socket.io = io;
  }

  static emitToCompany(company, event, data) {
    Socket.io.in(`/priv/${company._id}`).emit(event, data);
  }
}

module.exports = Socket;
