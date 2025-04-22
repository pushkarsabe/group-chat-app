const Admin = require('../model/admin');

exports.postAddAdmin = async (req, res) => {
    console.log("req.user.id = " + req.user.id);

    try {
        console.log("inside postAddAdmin");
        const groupAdminIDS = req.body.groupAdminIDS;
        const groupId = req.body.groupId;
        console.log('groupAdminIDS = ' + groupAdminIDS);
        console.log('groupId = ' + groupId);

        const adminData = await Admin.create({
            groupAdminIDS: groupAdminIDS,
            groupId: groupId
        })

        res.status(200).json({ success: true, adminData: adminData, message: 'New admin added' });

    } catch (err) {
        console.log("postAddAdmin error = " + JSON.stringify(err));
        res.status(500).json({
            error: err,
        })
    }
}


exports.getAdmin = async (req, res) => {
    console.log("inside getAdmin");

    try {
        const groupId = req.query.groupId;
        console.log('groupId = ' + groupId);

        const allAdminData = await Admin.findAll({ where: { groupId: groupId } });

        res.status(200).json({ success: true, allAdminData: allAdminData });

    } catch (err) {
        console.log("getAdmin error = " + JSON.stringify(err));
        res.status(500).json({
            error: err,
        })
    }
}

exports.addNewAdmin = async (req, res) => {
    console.log("inside add New Admin");
    try {
        const { groupId, selectedContacts } = req.body;

        console.log('groupId = ' + groupId);
        console.log('selectedContacts = ' + JSON.stringify(selectedContacts));

        if (!groupId || selectedContacts.length == 0) {
            return res.status(400).json({ message: 'Provided data is incomplete' });
        }

        const adminData = await Admin.findOne({ where: { groupId: groupId } });
        if (!adminData) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        console.log('adminData = ' + JSON.stringify(adminData));

        let existingGroupAdminIDS = adminData.groupAdminIDS.split(",");;
        console.log('array existingGroupAdminIDS  = ' + JSON.stringify(existingGroupAdminIDS));

        selectedContacts.forEach(contact => {
            existingGroupAdminIDS.push(String(contact.id));
        });
        console.log('array existingGroupAdminIDS  = ' + JSON.stringify(existingGroupAdminIDS));

        let updatedGroupAdminIDS = existingGroupAdminIDS.join(",");
        console.log('array updatedGroupAdminIDS  = ' + JSON.stringify(updatedGroupAdminIDS));

        adminData.groupAdminIDS = updatedGroupAdminIDS;

        const addedAdminData = await adminData.save();
        if (!addedAdminData) {
            return res.status(400).json({ message: 'Could not promote to admin' });
        }

        res.status(200).json({ message: 'Selected contacts promoted successfully', addedAdminData: addedAdminData });

    } catch (err) {
        console.log("addNewAdmin error = " + JSON.stringify(err));
        res.status(500).json({
            error: err,
        })
    }
}   