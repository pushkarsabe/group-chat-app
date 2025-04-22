const express = require('express');

const router = express.Router();

const adminController = require('../controller/admin');

const userAuthorization = require('../middleware/auth');

//to post the user deatils
router.post('/save-admin', userAuthorization.authenticate, adminController.postAddAdmin);

//to get the user deatils
router.get('/get-admin', userAuthorization.authenticate, adminController.getAdmin);

//to add the new admin
router.post('/add-admin', userAuthorization.authenticate, adminController.addNewAdmin);

module.exports = router;