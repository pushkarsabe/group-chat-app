const Group = require('../model/group');

exports.postAddGroups = async (req, res) => {
    try {
        console.log("inside postAddGroups");
        const groupName = req.body.groupName;
        const groupUserNames = req.body.groupUserNames;
        const groupUserIDS = req.body.groupUserIDS;
        const groupPhoneNumbers = req.body.groupPhoneNumbers;
        console.log('userid = ' + req.user.id);
        console.log('groupName = ' + groupName);
        console.log('groupUserNames = ' + groupUserNames);
        console.log('groupUserIDS = ' + groupUserIDS);
        console.log('groupPhoneNumbers = ' + groupPhoneNumbers);

        const submittedGroupData = await Group.create({
            groupName: groupName,
            groupUserNames: groupUserNames,
            groupUserIDS: groupUserIDS,
            groupPhoneNumbers: groupPhoneNumbers,
            userId: req.user.id
        });

        res.status(200).json({ message: 'success', submittedGroupData: submittedGroupData })

    } catch (err) {
        console.log("post group error = ", JSON.stringify(err));
        res.status(500).json({
            error: err,
        })
    }
}

exports.getAllGroupData = async (req, res) => {
    try {
        console.log("inside getAllGroupData");
        console.log("allGroupData userid ", req.user.id);
        const allGroupData = await Group.findAll({ where: { userId: req.user.id } });
        console.log("allGroupData ", allGroupData);

        res.status(200).json({ message: 'success', allGroupData: allGroupData })

    } catch (err) {
        console.log("get group error = ", JSON.stringify(err));
        res.status(500).json({
            error: err,
        })
    }
}

exports.deleteGroupData = async (req, res) => {
    try {
        console.log("inside deleteGroupData");
        const { groupId, selectedContacts } = req.body;

        console.log('groupId = ' + groupId);
        console.log('selectedContacts = ' + JSON.stringify(selectedContacts));

        if (!groupId || selectedContacts.length == 0) {
            return res.status(400).json({ message: 'Provided data is incomplete' });
        }

        const selectedGroupData = await Group.findOne({ where: { id: groupId } });
        if (!selectedGroupData) {
            return res.status(404).json({ message: 'Group not found' });
        }
        console.log('selectedGroupData = ' + JSON.stringify(selectedGroupData));

        // Split the comma-separated strings into arrays
        let groupUserIDS = selectedGroupData.groupUserIDS.split(",");
        console.log('array groupUserIDS = ' + JSON.stringify(groupUserIDS));
        let groupUserNames = selectedGroupData.groupUserNames.split(",");
        console.log('array groupUserNames = ' + JSON.stringify(groupUserNames));
        let groupPhoneNumbers = selectedGroupData.groupPhoneNumbers.split(",");
        console.log('array groupPhoneNumbers = ' + JSON.stringify(groupPhoneNumbers));

        //remove the matching id of selectedContacts from selectedGroupData
        selectedContacts.forEach(contact => {
            const contactIndex = groupUserIDS.indexOf(String(contact.id));
            console.log('contactIndex = ' + contactIndex);

            if (contactIndex !== -1) {
                groupUserIDS.splice(contactIndex, 1);
                groupUserNames.splice(contactIndex, 1);
                groupPhoneNumbers.splice(contactIndex, 1);
            }
        });
        // Join the arrays back to comma-separated strings
        selectedGroupData.groupUserIDS = groupUserIDS.join(',');
        selectedGroupData.groupUserNames = groupUserNames.join(',');
        selectedGroupData.groupPhoneNumbers = groupPhoneNumbers.join(',');
        console.log('selectedGroupData = ' + JSON.stringify(selectedGroupData));

        const updatedData = await selectedGroupData.save();
        if (!updatedData) {
            return res.status(400).json({ message: 'Could not remove data' });
        }
        res.status(200).json({ message: 'Selected contacts removed successfully', group: updatedData });

    } catch (err) {
        console.log("delete group error = ", JSON.stringify(err));
        res.status(500).json({
            error: err,
        })
    }
}

exports.updateGroupData = async (req, res) => {
    try {
        console.log("inside updateGroupData");
        const { groupId, selectedContacts } = req.body;

        console.log('groupId = ' + groupId);
        console.log('selectedContacts = ' + JSON.stringify(selectedContacts));

        if (!groupId || selectedContacts.length == 0) {
            return res.status(400).json({ message: 'Provided data is incomplete' });
        }

        const selectedGroupData = await Group.findOne({ where: { id: groupId } });
        if (!selectedGroupData) {
            return res.status(404).json({ message: 'Group not found' });
        }
        console.log('selectedGroupData = ' + JSON.stringify(selectedGroupData));

        // Split the comma-separated strings into arrays
        let existingUserIDs = selectedGroupData.groupUserIDS.split(",");
        console.log('array existingUserIDs  = ' + JSON.stringify(existingUserIDs));

        let existingUserNames = selectedGroupData.groupUserNames.split(",");
        console.log('array existingUserNames  = ' + JSON.stringify(existingUserNames));

        let existingPhoneNumbers = selectedGroupData.groupPhoneNumbers.split(",");
        console.log('array existingPhoneNumbers  = ' + JSON.stringify(existingPhoneNumbers));

        selectedContacts.forEach(contact => {
            existingUserIDs.push(String(contact.id));
            existingUserNames.push(contact.name);
            existingPhoneNumbers.push(contact.phoneNumber);
        })
        console.log('array existingUserIDs  = ' + JSON.stringify(existingUserIDs));
        console.log('array existingUserNames  = ' + JSON.stringify(existingUserNames));
        console.log('array existingPhoneNumbers  = ' + JSON.stringify(existingPhoneNumbers));


        // Join the updated arrays back into comma-separated strings
        const updatedUserIDs = existingUserIDs.join(',');
        const updatedUserNames = existingUserNames.join(',');
        const updatedPhoneNumbers = existingPhoneNumbers.join(',');
        console.log('array updatedUserIDs  = ' + JSON.stringify(updatedUserIDs));
        console.log('array updatedUserNames  = ' + JSON.stringify(updatedUserNames));
        console.log('array updatedPhoneNumbers  = ' + JSON.stringify(updatedPhoneNumbers));

        // Update the group with the new data
        selectedGroupData.groupUserIDS = updatedUserIDs;
        selectedGroupData.groupUserNames = updatedUserNames;
        selectedGroupData.groupPhoneNumbers = updatedPhoneNumbers;
        console.log('selectedGroupData = ' + JSON.stringify(selectedGroupData));

        const updatedGroupData = await selectedGroupData.save();

        if (!updatedGroupData) {
            return res.status(400).json({ message: 'Could not add group data' });
        }
        res.status(200).json({ message: 'Selected contacts added successfully', group: updatedGroupData });

    } catch (err) {
        console.log("update group error = ", JSON.stringify(err));
        res.status(500).json({
            error: err,
        })
    }
}

exports.updateGroupColumn = async (req, res) => {
    try {
        console.log("inside updateGroupColumn");
        const groupId = req.body.groupId;
        console.log('groupId = ', groupId);

        if (!groupId) {
            return res.status(400).json({ message: 'Provided data is incomplete' });
        }

        const groupData = await Group.findOne({ where: { id: groupId } });
        console.log('groupData = ', JSON.stringify(groupData));
        //update the data
        groupData.isDeleted = true;

        //save the data
        const updatedData = await groupData.save();

        res.status(200).json({ message: "Data removed", updatedData: updatedData });

    } catch (err) {
        console.log("updateGroupColumn error = ", JSON.stringify(err));
        res.status(500).json({
            error: err,
        })
    }
}
