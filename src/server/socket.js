// Add these handlers to your socket.io server

// Store active rooms and their users
const rooms = new Map();
let totalConnections = 0;

io.on('connection', (socket) => {
  totalConnections++;
  console.log(`New connection: ${socket.id}. Total connections: ${totalConnections}`);
  
  // Join room
  socket.on('joinRoom', ({ roomId, userId, name, role }) => {
    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    
    // Add user to room
    rooms.get(roomId).set(userId, {
      userId,
      name,
      role,
      socketId: socket.id
    });
    
    // Join socket.io room
    socket.join(roomId);
    
    // Send all users in the room to the new user
    const usersInRoom = Array.from(rooms.get(roomId).values());
    socket.emit('allUsers', usersInRoom);
    
    // Notify other users in the room
    socket.to(roomId).emit('userJoined', { userId, name, role });
    
    // Send updated user count to all users in the room
    io.to(roomId).emit('userCount', { count: rooms.get(roomId).size });
    
    console.log(`User ${userId} joined room ${roomId}. Room now has ${rooms.get(roomId).size} users.`);
  });
  
  // Send signal to specific user
  socket.on('sendSignal', ({ roomId, userId, receiverId, signal }) => {
    const room = rooms.get(roomId);
    if (room) {
      const receiver = room.get(receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit('receiveSignal', {
          userId,
          signal
        });
      }
    }
  });
  
  // Leave room
  socket.on('leaveRoom', ({ roomId, userId }) => {
    if (rooms.has(roomId)) {
      // Remove user from room
      rooms.get(roomId).delete(userId);
      
      // Delete room if empty
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      } else {
        // Notify other users
        socket.to(roomId).emit('userLeft', { userId });
        
        // Send updated user count to all users in the room
        io.to(roomId).emit('userCount', { count: rooms.get(roomId).size });
        
        console.log(`Room ${roomId} now has ${rooms.get(roomId).size} users`);
      }
    }
    
    // Leave socket.io room
    socket.leave(roomId);
    
    console.log(`User ${userId} left room ${roomId}`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    totalConnections--;
    console.log(`User disconnected: ${socket.id}. Total connections: ${totalConnections}`);
    
    // Find user in all rooms
    rooms.forEach((users, roomId) => {
      let userIdToRemove = null;
      
      users.forEach((user, userId) => {
        if (user.socketId === socket.id) {
          userIdToRemove = userId;
        }
      });
      
      if (userIdToRemove) {
        // Remove user from room
        users.delete(userIdToRemove);
        
        // Notify other users
        socket.to(roomId).emit('userLeft', { userId: userIdToRemove });
        
        // Send updated user count to all users in the room
        if (users.size > 0) {
          io.to(roomId).emit('userCount', { count: users.size });
        }
        
        // Delete room if empty
        if (users.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty after disconnect)`);
        } else {
          console.log(`Room ${roomId} now has ${users.size} users after disconnect`);
        }
      }
    });
  });
  
  // Add a new event to get current user count
  socket.on('getUserCount', ({ roomId }, callback) => {
    const count = rooms.has(roomId) ? rooms.get(roomId).size : 0;
    const totalRooms = rooms.size;
    
    if (callback) {
      callback({
        roomCount: count,
        totalConnections,
        totalRooms
      });
    }
  });
});