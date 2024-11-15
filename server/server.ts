import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { User } from "../src/models/userModel";
import { connectToDatabase } from "../src/lib/connectDB";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

connectToDatabase();

const onlineUsers = new Map();
const rooms = new Map();

io.on("connection", async (socket: Socket) => {
  const username = socket.handshake.query.username as string;

  if (username) {
    try {
      let user = await User.findOne({ name: username });
      if (!user) {
        user = new User({ name: username, isOnline: true });
        await user.save();
      } else {
        user.isOnline = true;
        await user.save();
      }
      onlineUsers.set(socket.id, user);
      socket.broadcast.emit("userConnected", user);
    } catch (error) {
      console.error("Error handling user connection:", error);
    }
  }

  socket.on("disconnect", async () => {
    if (onlineUsers.has(socket.id)) {
      const user = onlineUsers.get(socket.id);
      onlineUsers.delete(socket.id);
      try {
        user.isOnline = false;
        await user.save();
        io.emit("userDisconnected", user._id);
      } catch (error) {
        console.error("Error handling user disconnection:", error);
      }
    }
  });

  socket.on("getUsers", async () => {
    try {
      const users = await User.find({});
      const userList = users.map((user) => ({
        ...user.toObject(),
        isOnline: onlineUsers.has(user._id.toString()),
      }));
      socket.emit("userList", userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  });

  socket.on("askHelp", ({ student, teacher, studentCode }) => {
    const teacherSocket = Array.from(io.sockets.sockets.values()).find(
      (s) => s.handshake.query.username === teacher
    );
    if (teacherSocket) {
      teacherSocket.emit("helpRequest", { student, teacher, studentCode });
    }
  });

  socket.on("helpResponse", ({ student, teacher, accepted, teacherCode }) => {
    const studentSocket = Array.from(io.sockets.sockets.values()).find(
      (s) => s.handshake.query.username === student
    );
    if (studentSocket) {
      studentSocket.emit("helpResponseReceived", {
        teacher,
        accepted,
        teacherCode,
      });
      if (accepted) {
        const roomId = `${student}-${teacher}`;
        rooms.set(roomId, { student, teacher, code: teacherCode });
        studentSocket.join(roomId);
        socket.join(roomId);
        io.to(roomId).emit("joinRoom", roomId, teacherCode);
      }
    }
  });

  socket.on("updateCode", ({ roomId, code }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).code = code;
      socket.to(roomId).emit("codeUpdated", code);
    }
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    const room = rooms.get(roomId);
    if (room) {
      const otherUser = room.student === username ? room.teacher : room.student;
      const otherSocket = Array.from(io.sockets.sockets.values()).find(
        (s) => s.handshake.query.username === otherUser
      );
      if (otherSocket) {
        otherSocket.emit("userLeftRoom", username);
        otherSocket.leave(roomId);
      }
      rooms.delete(roomId);
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
