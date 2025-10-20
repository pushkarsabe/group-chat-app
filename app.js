require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const sequelize = require('./util/database');
const path = require('path');
// const cron = require('./cronJob');

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

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


//user signup and login
app.use("/user", userRoute);

//chats
app.use("/chat", chatRoute);

//groups
app.use('/groups', groupRoute);

//admin
app.use('/admin', adminRoute);

// Create an HTTP server for Socket.IO and Express
const server = http.createServer(app);

// Import the Socket.IO initialization function
const { initializeSocket } = require('./socket');

// Initialize Socket.IO
initializeSocket(server);

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
