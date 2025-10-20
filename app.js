require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const sequelize = require('./util/database');
const cron = require('./cronJob');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const User = require("./model/user")
const Chat = require('./model/chat');
const Group = require('./model/group');
const Admin = require('./model/admin');

const userRoute = require('./routes/user');
const chatRoute = require('./routes/chat');
const groupRoute = require('./routes/group');
const adminRoute = require('./routes/admin');

//user signup and login
app.use("/user", userRoute);

//chats
app.use("/chat", chatRoute);

//groups
app.use('/groups', groupRoute);

//admin
app.use('/admin', adminRoute);

// This allows external resources (like Axios from cdn.jsdelivr.net) to be used without being blocked.
// app.use((req, res, next) => {
//     res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self'");
//     next();
// });

// Serve static files from the public folder
// app.use(express.static(path.join(__dirname, 'public')));

// app.use((req, res) => {
//     console.log("url... = " + req.url);
//     res.sendFile(path.join(__dirname, `public/${req.url}`));
// });

// Create an HTTP server for Socket.IO and Express
const server = http.createServer(app);

// Import the Socket.IO initialization function
const { initializeSocket } = require('./socket');

// Initialize Socket.IO
initializeSocket(server);

//set up socket.io
// const io = require('socket.io')(server, {
//     cors: {
//         origin: "*",// Allow all origins
//     }
// });

// io.on('connection', (socket) => {
//     console.log("User connected with socket id: ", socket.id);

//     // Allow users to join rooms corresponding to a groupId
//     socket.on('join-group', (groupId) => {
//         socket.join(groupId);
//         console.log(`User with socket ID: ${socket.id} joined group: ${groupId}`);
//     });

//     socket.on('send-message', (message) => {
//         console.log('message = ' + message);
//     });

//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//     });
// });

// When a new message is added, broadcast it to all clients in the same group
// const sendMessageToGroup = (groupId, message) => {
//     io.to(groupId).emit('newMessage', message);
// };

// User and Chat relationship
User.hasMany(Chat, { foreignKey: 'signupId' });

// User and Group relationship
User.hasMany(Group, { foreignKey: 'userId' });

//chat and group relationship
Chat.belongsTo(Group, { foreignKey: 'groupId' });

//chat and group relationship
Admin.belongsTo(Group, { foreignKey: 'groupId' });

let runServer = async () => {
    try {
        await sequelize.sync();
        console.log(`server started running at port ${process.env.PORT}`);
        server.listen(process.env.PORT || 3000);
    }
    catch (err) {
        console.log(err);
    }
}
runServer();
