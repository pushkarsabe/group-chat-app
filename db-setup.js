require('dotenv').config();

const sequelize = require('./util/database');
// Import all models so sequelize.sync() knows about them
require('./model/user');
require('./model/chat');
require('./model/group');
require('./model/admin');
require('./model/archivedChat');

// Force table creation/updates based on model definitions
sequelize.sync({
    // force: false ensures we don't drop existing tables
    // alter: true ensures tables are created if missing or columns are updated
    alter: true
})
    .then(() => {
        console.log('Database synchronization complete. Tables are ready for migrations.');
        process.exit(0);
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
        process.exit(1);
    });