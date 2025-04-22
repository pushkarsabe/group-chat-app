const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');

const groupController = require('../controller/group');

//to post the group details
router.post('/save-data', auth.authenticate, groupController.postAddGroups);

//to get the all groups
router.get('/get-data', auth.authenticate, groupController.getAllGroupData);

//to remove the contact from group
router.post('/delete-data', auth.authenticate, groupController.deleteGroupData);

//to add the contacts in group
router.post('/update-data', auth.authenticate, groupController.updateGroupData);

//to update the delete column inside group table
router.put('/update-group', auth.authenticate, groupController.updateGroupColumn);

module.exports = router;