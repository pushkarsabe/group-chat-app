const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Admin = sequelize.define('admin', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    groupAdminIDS: {
        type: Sequelize.STRING,
        allowNull: false
    },
    canAddUser: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    canDeleteUser: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    canAddUser: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    canDeleteGroup: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    }

});

module.exports = Admin;