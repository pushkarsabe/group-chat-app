const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Group = sequelize.define('group', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    groupName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    groupUserNames: {
        type: Sequelize.STRING,
    },
    groupUserIDS: {
        type: Sequelize.STRING,
    },
    groupPhoneNumbers: {
        type: Sequelize.STRING,
    },
    isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Group;