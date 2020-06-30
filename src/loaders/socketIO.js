const socketIO = require('socket.io');

module.exports = {
  load: (server) => {
    const io = socketIO(server);

    io.of('/api').on('connection', (socket) => {
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
  },
};
