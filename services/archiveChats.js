const { Op, where } = require('sequelize');
const Chat = require('../model/chat');
const ArchivedChat = require('../model/archivedChat');
const sequelize = require('../util/database');

async function archiveOldChats() {

    const transaction = await sequelize.transaction;
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        console.log('oneDayAgo =  ', oneDayAgo);

        const oldChats = await Chat.findAll({
            where: {
                creacreatedAt: { [Op.lt]: oneDayAgo }
            },
            transaction
        });
        console.log('oldChats =  ', oldChats);

        if (oldChats.length > 0) {
            console.log(`Found ${oldChats.length} chat(s) to archive.`);
            //move the data from chat to ArchivedChat table
            const archiveData = oldChats.map(chat => ({
                id: chat.id,
                chatName: chat.chatName,
                groupId: chat.groupId,
                createdAt: chat.createdAt
            }));

            await ArchivedChat.bulkCreate(archiveData, { transaction });

            //delete old chats 
            await Chat.destroy({
                where: { createdAt: { [Op.lt]: oneDayAgo } },
                transaction
            });

            await transaction.commit();
            console.log('Archived and deleted old chats.');
        }
        else {
            console.log('No old chats found.');
            await transaction.commit();
        }
    }
    catch (error) {
        await transaction.rollback();
        console.error('Error during archiving:', error);
    }
}

module.exports = archiveOldChats;























