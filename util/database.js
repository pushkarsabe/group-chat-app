require('dotenv').config();

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.MYSQLSCHEMA, process.env.MYSQLUSERNAME, process.env.MYSQLPASSWORD, {
    dialect: process.env.MYSQDIALECT,
    host: process.env.HOST
});

module.exports = sequelize;