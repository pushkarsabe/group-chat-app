const { CronJob } = require('cron');
const archivedOldChat = require('./services/archiveChats');

const job = new CronJob('0 2 * * *', () => {
    console.log('Running archive task at 2 AM...');
    archivedOldChat();
});

job.start();
console.log('Cron job scheduled for 2 AM daily.');
