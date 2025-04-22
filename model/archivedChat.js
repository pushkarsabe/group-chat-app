const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const ArchivedChat = sequelize.define('archivedChat', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    chatName: {
        type: Sequelize.STRING
    },
    groupId: {
        type: Sequelize.INTEGER
    },
}, { timestamps: false });

module.exports = ArchivedChat;