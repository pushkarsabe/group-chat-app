const contactList = document.getElementById('contactList');
const singleUserList = document.getElementById('singleUserList');
document.getElementById('chatForm').addEventListener('submit', submitChat);
let lastChatID = 0;
// const URL = 'http://localhost:3000';
const URL = 'https://group-chat-app-qxzo.onrender.com';

//load create new popup and close popup
document.getElementById('loadPopupbutton').addEventListener('click', loadCreateGroupPopupAndGetData);
document.getElementById('closeGroupPopup').addEventListener('click', closePopup);
document.getElementById('createGroup').addEventListener('click', createGroup);

//load create single user popup and close popup
document.getElementById('loadSingleUserPopupbutton').addEventListener('click', loadSingleUserPopup);
document.getElementById('closeSingleUserPopup').addEventListener('click', closeSingleUserPopup);
document.getElementById('createSingleUserGroup').addEventListener('click', createSingleUserGroup);

//load remove contact popup and close popup
document.getElementById('removeContactBtn').addEventListener('click', loadRemoveContactPopup);
document.getElementById('closeRemoveContactPopup').addEventListener('click', closeRemoveContactPopup);
document.getElementById('removeSelectedContacts').addEventListener('click', removeSelectedContacts);

//load add contact popup and close popup
document.getElementById('addContactBtn').addEventListener('click', loadAddContactPopup);
document.getElementById('closeAddContactPopup').addEventListener('click', closeAddContactPopup);
document.getElementById('addSelectedContacts').addEventListener('click', addSelectedContacts);

//load promote to admin popup and close popup
document.getElementById('addAdminBtn').addEventListener('click', loadAddAdminPopup);
document.getElementById('closeaddAdminPopup').addEventListener('click', closeaddAdminPopup);
document.getElementById('promoteToAdmin').addEventListener('click', promoteToAdmin);

//delete group or chat
document.getElementById('deleteGroup').addEventListener('click', deleteGroup);

//to log out from home 
document.getElementById('logoutBtn').addEventListener('click', logout);

// --- NEW LOGOUT FUNCTION ---
function logout() {
    console.log('User logging out...');

    localStorage.removeItem('token');
    localStorage.removeItem('userid');
    localStorage.removeItem('groupId');
    localStorage.removeItem('groupUserID');
    localStorage.removeItem('groupName');
    localStorage.removeItem('groupUserNames');
    localStorage.removeItem('ADMIN');

    // 2. Disconnect socket (if connected)
    if (typeof socket !== 'undefined' && socket.connected) {
        socket.disconnect();
    }

    // 3. Inform the user and redirect
    showMessage('info', 'Logging out...');

    setTimeout(() => {
        // Redirect to the login page
        window.location.href = './login.html';
    }, 500);
}

function showMessage(type, message) {
    const existing = document.querySelector('.custom-toast');
    if (existing) existing.remove(); // Remove existing toast if any

    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
    }, 1500);
    // Ensure it gets removed from DOM even if transition fails
    setTimeout(() => {
        toast.remove();
    }, 2000);

}


function decodeJwt(token) {
    console.log('inside decodeJwt...');
    console.log("token = " + token);

    const parts = token.split(".");

    if (parts.length != 3) {
        console.log("invalid token");
        return;
    }
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    // console.log('Header:', header);
    // console.log('Payload:', payload);

    return { header, payload };
}//decodeJwt

function checkGroupSelected(actionName) {
    const groupId = localStorage.getItem('groupId');
    if (!groupId) {
        showMessage('failure', `Please select a group or chat first to ${actionName}.`);
        return false;
    }
    return true;
}//checkGroupSelected

function filterContacts(contactList, searchValue, appendContactContainer) {
    console.log('inside filterContacts:');
    console.log("contactList = " + JSON.stringify(contactList));

    const filteredContacts = contactList.filter(contact =>
        contact.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        contact.phoneNumber.includes(searchValue)
    );
    // Display filtered contacts
    displayContacts(filteredContacts, appendContactContainer);
}//filterContacts

//this will create a div with checkbx and list of users 
function displayContacts(contactList, displayContainer) {
    displayContainer.innerHTML = ''; // Clear any existing list

    contactList.forEach(contact => {
        const div = document.createElement('div');
        div.classList.add('contact-item');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = contact.id;

        const label = document.createElement('label');
        label.htmlFor = contact.name;
        label.textContent = `${contact.name}, Phone: ${contact.phoneNumber}`;

        div.appendChild(checkbox);
        div.appendChild(label);
        displayContainer.appendChild(div);
    });
}//displayContacts

async function loadCreateGroupPopupAndGetData() {
    document.getElementById('groupPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    console.log('inside loadCreateGroupPopupAndGetData...');
    //call the method to get all user data and append the user inside list
    getAllUserData(contactList);
}//loadCreateGroupPopupAndGetData

function closePopup() {
    document.getElementById('groupPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

async function getAllUserData(ListContainer) {
    console.log('inside getAllUserData...');
    let userid = localStorage.getItem('userid');
    console.log('userid =' + userid);

    let token = localStorage.getItem('token');
    if (!token) {
        console.log("Token not found. Please log in.");
        return;
    }
    try {
        const response = await fetch(`${URL}/user/user-data`, {
            method: 'GET',
            headers: {
                "Authorization": token
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let chatData = data.allUserData;
        localStorage.setItem('chatData', JSON.stringify(chatData));
        console.log("chatData = " + JSON.stringify(chatData));

        // we will filter the search only for single user chat and not for group popup
        if (ListContainer === singleUserContactList) {
            console.log(" single User Contact List");
            let filteredSingleUsers = chatData.filter(chat => chat.id != userid);
            console.log("filteredSingleUsers = " + JSON.stringify(filteredSingleUsers));

            displayContacts(filteredSingleUsers, ListContainer);

            // Add event listener to the search input to filter contacts in real-time
            document.getElementById('searchInputSingleUser').addEventListener('input', function () {
                console.log("this.value = " + this.value);
                filterContacts(chatData, this.value, singleUserContactList);
            });
        }
        else {
            //display the data on popup for group
            console.log(" contact List group");
            displayContacts(chatData, ListContainer);
        }

    }
    catch (err) {
        console.log("loadCreateGroupPopupAndGetData error = " + err);
        showMessage('failure', 'Failed to load user data.');
    }
}//getAllUserData

async function loadSingleUserPopup() {
    document.getElementById('singleUserPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    console.log('inside loadSingleUserPopup...');
    //call the method to get all user data and append the user inside list
    const singleUserContactList = document.getElementById('singleUserContactList');
    getAllUserData(singleUserContactList);
}//loadSingleUserPopup
function closeSingleUserPopup() {
    document.getElementById('singleUserPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

async function createSingleUserGroup() {
    console.log('inside createSingleUserGroup...');
    const chatData = JSON.parse(localStorage.getItem('chatData'));
    let userid = localStorage.getItem('userid');
    console.log("userid = " + userid);
    console.log("chatData = " + JSON.stringify(chatData));

    const selectedContacts = [];
    const checkboxes = document.querySelectorAll("#singleUserContactList input[type ='checkbox']:checked");
    console.log("checkboxes = " + JSON.stringify(checkboxes));

    checkboxes.forEach(checkbox => {
        const contactId = checkbox.id;
        console.log("contactId = " + contactId);
        const contact = chatData.find(c => c.id === Number(contactId)); // Assuming chatData is available

        if (contact) {
            selectedContacts.push({
                id: contact.id,
                name: contact.name,
                phoneNumber: contact.phoneNumber
            });
        }
    });
    console.log("selectedContacts = " + JSON.stringify(selectedContacts));

    if (selectedContacts.length > 0) {
        //only one contact is needed for single user chat
        if (selectedContacts.length == 1) {
            console.log("selectedContacts = " + JSON.stringify(selectedContacts));
            let groupName = 'q4X7nA6F8sT9mK3jY0dWvR1pZ5cG2bH';
            let groupUserNames = selectedContacts[0].name;
            let groupUserIDS = selectedContacts[0].id;
            let groupPhoneNumbers = selectedContacts[0].phoneNumber;
            console.log("groupName = " + groupName);
            console.log("groupUserNames = " + groupUserNames);
            console.log("groupUserIDS = " + groupUserIDS);
            console.log("groupPhoneNumbers = " + groupPhoneNumbers);
            const obj = {
                groupName: groupName,
                groupUserNames: groupUserNames,
                groupUserIDS: groupUserIDS,
                groupPhoneNumbers: groupPhoneNumbers,
            };

            let token = localStorage.getItem('token');
            if (!token) {
                showMessage('failure', 'Token not found. Please log in.');
                return;
            }
            try {
                const response = await fetch(`${URL}/groups/save-data`, {
                    method: 'POST',
                    headers: {
                        "Authorization": token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(obj)
                });

                let res;
                try {
                    res = await response.json();
                } catch (e) {
                    throw new Error(response.ok ? "Success, but failed to parse response." : `Server error (Status: ${response.status})`);
                }

                if (!response.ok) {
                    throw new Error(res.message || res.error || `Server responded with status ${response.status}`);
                }

                console.log("res = " + JSON.stringify(res));
                console.log('userId = ' + res.submittedGroupData.userId);
                const data = res.submittedGroupData;
                console.log("data = " + JSON.stringify(data));

                const li = document.createElement('li');
                li.appendChild(document.createTextNode(`${res.submittedGroupData.groupUserNames}`));
                li.style.cursor = "pointer";
                li.addEventListener('click', () => {
                    loadChatPage(data.id, data.groupUserIDS, data.groupName, data.groupUserNames);
                })
                singleUserList.appendChild(li);

                //save the data of the user as admin 
                saveAdminData(res.submittedGroupData.userId, res.submittedGroupData.id);

                closeSingleUserPopup();

                showMessage('success', 'Chat created successfully!');

            } catch (err) {
                console.log("createSingleUserGroup error = " + err.message);
                showMessage('failure', `Error: ${err.message}`);
            }
        }
        else {
            showMessage('failure', 'Multiple contact selected,only select one contact');
        }
    }
    else {
        showMessage('failure', 'No contact selected.');
    }

}//createSingleUserGroup   

async function createGroup() {
    console.log('inside createGroup...');
    const groupName = document.getElementById('groupName').value;
    const groupList = document.getElementById('groupList');
    const chatData = JSON.parse(localStorage.getItem('chatData'));
    localStorage.setItem('chatData', JSON.stringify(chatData));
    const selectedContacts = [];
    const checkboxes = document.querySelectorAll("#contactList input[type ='checkbox']:checked");
    console.log("checkboxes = " + JSON.stringify(checkboxes));

    checkboxes.forEach(checkbox => {
        const contactId = checkbox.id;
        console.log("contactId = " + contactId);
        const contact = chatData.find(c => c.id === Number(contactId)); // Assuming chatData is available

        if (contact) {
            selectedContacts.push({
                id: contact.id,
                name: contact.name,
                phoneNumber: contact.phoneNumber
            });
        }
    });
    console.log("selectedContacts = " + JSON.stringify(selectedContacts));

    //to check if the user altleast selected one user
    if (groupName && selectedContacts.length > 0) {

        let groupUserNames = "", groupUserIDS = "", groupPhoneNumbers = "";

        for (let i = 0; i < selectedContacts.length; i++) {
            groupUserNames += selectedContacts[i].name + ",";
            groupUserIDS += selectedContacts[i].id + ",";
            groupPhoneNumbers += selectedContacts[i].phoneNumber + ",";
        }
        console.log('before trailing...');
        console.log("groupName = " + groupName);
        console.log("groupUserNames = " + groupUserNames);
        console.log("groupUserIDS = " + groupUserIDS);
        console.log("groupPhoneNumbers = " + groupPhoneNumbers);
        groupUserNames = groupUserNames.slice(0, -1);
        groupUserIDS = groupUserIDS.slice(0, -1);
        groupPhoneNumbers = groupPhoneNumbers.slice(0, -1);
        console.log('after trailing...');
        console.log("groupUserNames = " + groupUserNames);
        console.log("groupUserIDS = " + groupUserIDS);
        console.log("groupPhoneNumbers = " + groupPhoneNumbers);

        const obj = {
            groupName: groupName,
            groupUserNames: groupUserNames,
            groupUserIDS: groupUserIDS,
            groupPhoneNumbers: groupPhoneNumbers,
        };

        let token = localStorage.getItem('token');
        if (!token) {
            showMessage('failure', 'Token not found. Please log in.');
            return;
        }
        try {
            const response = await fetch(`${URL}/groups/save-data`, {
                method: 'POST',
                headers: {
                    "Authorization": token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            });

            let res;
            try {
                res = await response.json();
            } catch (e) {
                throw new Error(response.ok ? "Success, but failed to parse response." : `Server error (Status: ${response.status})`);
            }

            if (!response.ok) {
                throw new Error(res.message || res.error || `Server responded with status ${response.status}`);
            }

            console.log("res = " + JSON.stringify(res));
            console.log('userid = ' + res.submittedGroupData.userId);

            const data = res.submittedGroupData;

            const li = document.createElement('li');
            li.appendChild(document.createTextNode(`${groupName} : ${data.groupUserNames}`));
            li.style.cursor = "pointer";
            li.addEventListener('click', () => {
                loadChatPage(data.id, data.groupUserIDS, data.groupName, data.groupUserNames);
            })
            groupList.appendChild(li);

            saveAdminData(data.userId, data.id);

            document.getElementById('groupName').value = "";

            closePopup();

            showMessage('success', 'Group created successfully!');
        } catch (err) {
            console.log("createGrou pInBackend error = " + err.message);
            showMessage('failure', `Error creating group: ${err.message}`);
        }

    } else {
        showMessage("failure", "Please enter a group name and select at least one contact.");
    }
}//createGroup

async function saveAdminData(groupAdminIDS, groupId) {
    console.log('inside saveAdminData...');
    console.log("groupAdminIDS = " + groupAdminIDS);
    console.log("groupId = " + groupId);
    let obj = {
        groupAdminIDS: groupAdminIDS,
        groupId: groupId
    }
    let token = localStorage.getItem('token');
    if (!token) {
        console.log("Token not found. Please log in.");
        return;
    }
    try {
        const response = await fetch(`${URL}/admin/save-admin`, {
            method: 'POST',
            headers: {
                "Authorization": token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        });

        let res;
        try {
            res = await response.json();
        } catch (e) {
            throw new Error(response.ok ? "Success, but failed to parse response." : `Server error (Status: ${response.status})`);
        }

        if (!response.ok) {
            throw new Error(res.message || res.error || `Server responded with status ${response.status}`);
        }

        console.log("res = " + JSON.stringify(res));

    } catch (err) {
        console.log("saveAdminData error = " + err.message);
    }

}//saveAdminData

window.document.addEventListener('DOMContentLoaded', async () => {
    console.log('inside DOMContentLoaded...');
    let token = localStorage.getItem('token');
    console.log('token:', token);

    // Using alert is generally discouraged, replacing with showMessage toast
    if (!token) {
        // alert("Token not found. Please log in."); 
        showMessage('failure', 'Session expired. Please log in.');
        setTimeout(() => {
            window.location.href = "login.html";
        }, 50);
        return;
    }

    const { payload } = decodeJwt(token);
    console.log('Payload:', payload);
    console.log('userid = ', payload.userid);

    //save the userid of the user who is currently logged-in
    if (!payload.userid) {
        console.log("No userid found, Please log in.");
    }
    else
        localStorage.setItem('userid', payload.userid);

    try {
        const response = await fetch(`${URL}/groups/get-data`, {
            method: 'GET',
            headers: {
                "Authorization": token
            }
        });

        let res;
        try {
            res = await response.json();
        } catch (e) {
            throw new Error(response.ok ? "Success, but failed to parse response." : `Server error (Status: ${response.status})`);
        }

        if (!response.ok) {
            throw new Error(res.message || res.error || `Server responded with status ${response.status}`);
        }

        console.log("res = " + JSON.stringify(res));
        for (let i = 0; i < res.allGroupData.length; i++) {
            printallGroupDataOnFrontend(res.allGroupData[i]);
        }
        //inside printing the group data the functin is storing the values and you can use it here
        // Check if there's a previously selected group in localStorage
        const savedGroupId = localStorage.getItem('groupId');
        const savedGroupUserID = localStorage.getItem('groupUserID');
        const savedGroupName = localStorage.getItem('groupName');
        console.log('savedGroupId:', savedGroupId);
        console.log('savedGroupUserID:', savedGroupUserID);
        console.log('savedGroupName:', savedGroupName);

        //this will reload the old chat and group when user refreshes the page
        if (savedGroupId && savedGroupUserID) {
            await loadChatPage(savedGroupId, savedGroupUserID, savedGroupName);
        }

        const fileInput = document.getElementById("fileInput");
        fileInput.addEventListener("change", handleFileUpload);

    } catch (err) {
        console.log("createGroupInBackend error = " + err.message);
    }

})//DOMContentLoaded

function printallGroupDataOnFrontend(data) {
    console.log('inside printallGroupDataOnFrontend...');
    // console.log("data = " + JSON.stringify(data));

    //only undeleted data is shown on frontend
    if (data.isDeleted == false) {
        // before appending to frontend check if the data is for group or single user
        if (data.groupName === 'q4X7nA6F8sT9mK3jY0dWvR1pZ5cG2bH') {
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(`${data.groupUserNames}`));
            li.id = data.groupUserIDS;
            li.style.cursor = "pointer";
            li.addEventListener('click', () => {
                loadChatPage(data.id, data.groupUserIDS, data.groupName, data.groupUserNames);
            })

            singleUserList.appendChild(li);
        }
        else {
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(`${data.groupName} : ${data.groupUserNames}`));
            li.id = data.groupUserIDS;
            li.style.cursor = "pointer";
            li.addEventListener('click', () => {
                loadChatPage(data.id, data.groupUserIDS, data.groupName, data.groupUserNames);
            })
            groupList.appendChild(li);
        }
    }
}//printallGroupDataOnFrontend

async function loadChatPage(groupId, groupUserID, groupName, groupUserNames) {
    const chatArea = document.getElementById('chatArea');
    const chatContent = document.getElementById('chatContent');
    console.log('inside loadChatPage...');

    localStorage.setItem('groupId', groupId);
    localStorage.setItem('groupUserID', groupUserID);
    localStorage.setItem('groupName', groupName);
    localStorage.setItem('groupUserNames', groupUserNames);
    console.log('groupId = ' + groupId);
    console.log('groupUserID = ' + groupUserID);
    console.log('groupName = ' + groupName);
    console.log('groupUserNames = ' + groupUserNames);

    chatContent.innerHTML = '';

    const h3Element = chatArea.querySelector('h3');
    if (groupName == 'q4X7nA6F8sT9mK3jY0dWvR1pZ5cG2bH') {
        h3Element.textContent = `User : ${groupUserNames}`;
    }
    else {
        h3Element.textContent = `Group : ${groupName}`;
    }

    let token = localStorage.getItem('token');
    if (!token) {
        console.log("Token not found. Please log in.");
        return;
    }
    // Replacing alert with showMessage
    if (!groupId) {
        showMessage('failure', "Please select a group first");
    }

    if (socket) {
        socket.emit('join-group', groupId); // Use the numeric groupId as the room name
        console.log(`Socket joined room: ${groupId}`);
    }

    try {
        // Fetch Chat Data
        const chatResponse = await fetch(`${URL}/chat/get-chat?groupId=${groupId}`, {
            method: 'GET',
            headers: {
                "Authorization": token
            }
        });

        let chatDataRes;
        try {
            chatDataRes = await chatResponse.json();
        } catch (e) {
            throw new Error(chatResponse.ok ? "Chat fetch success, failed to parse response." : `Chat fetch server error (Status: ${chatResponse.status})`);
        }

        if (!chatResponse.ok) {
            throw new Error(chatDataRes.message || `Failed to fetch chats. Status: ${chatResponse.status}`);
        }

        // console.log('Chat data response:', chatDataRes.allChatData);

        chatDataRes.allChatData.forEach(chat => {
            displayMessage(chat.chatName);
        });

        // Fetch Admin Data
        const adminResponse = await fetch(`${URL}/admin/get-admin?groupId=${groupId}`, {
            method: 'GET',
            headers: {
                "Authorization": token
            }
        });

        let adminRes;
        try {
            adminRes = await adminResponse.json();
        } catch (e) {
            throw new Error(adminResponse.ok ? "Admin fetch success, failed to parse response." : `Admin fetch server error (Status: ${adminResponse.status})`);
        }

        if (!adminResponse.ok) {
            throw new Error(adminRes.message || `Failed to fetch admins. Status: ${adminResponse.status}`);
        }

        console.log('admin data response:', adminRes.allAdminData);
        const adminDataObj = adminRes.allAdminData[0];

        // Check if there is no data in the allAdminData array
        if (!adminRes.allAdminData || adminRes.allAdminData.length === 0) {
            console.log("No admin data received");
            localStorage.setItem("ADMIN", false);
        }
        else {
            let groupAdminIDS = adminDataObj.groupAdminIDS;
            console.log('groupAdminIDS = ' + groupAdminIDS);
            let userid = localStorage.getItem('userid');
            console.log('userid = ' + userid);

            let groupAdminIDSArray = groupAdminIDS.split(",");
            console.log('groupAdminIDSArray = ' + groupAdminIDSArray);

            if (groupAdminIDSArray.includes(userid)) {
                console.log("User is Admin inside this group, userId exists in groupAdminIDs");
                localStorage.setItem("ADMIN", true);
            } else {
                console.log("User is not a Admin inside this group, userId does not exist in groupAdminIDs");
                localStorage.setItem("ADMIN", false);
            }
        }

    } catch (err) {
        console.log("Error fetching chat/admin data:", err.message);
        chatContent.textContent = "Failed to load chat data.";
    }
}//loadChatPage

async function loadRemoveContactPopup() {
    console.log('inside loadRemoveContactPopup:');

    if (!checkGroupSelected('remove contacts')) return;

    let ADMIN = localStorage.getItem("ADMIN");
    let groupId = localStorage.getItem('groupId');
    let groupUserID = localStorage.getItem('groupUserID');
    let groupName = localStorage.getItem('groupName');

    if (groupName === 'q4X7nA6F8sT9mK3jY0dWvR1pZ5cG2bH') {
        showMessage('failure', "Can't remove contacts from a private chat.");
        return;
    }
    // Show the remove contact popup
    document.getElementById('removeContactPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    //get ADMIN value from LS, if the user is admin or not
    console.log("ADMIN = " + ADMIN);
    if (ADMIN == 'true') {
        console.log("ADMIN is true");

        console.log("groupId = " + groupId);
        console.log("groupUserID = " + groupUserID);
        //when the user clicks on delete button without selecting any groups
        if (groupId == null && groupUserID == null) {
            showMessage('failure', 'Please select a group first to remove contact from group');
        }
        else {

            let token = localStorage.getItem('token');
            if (!token && !groupId) {
                showMessage('failure', 'Token not found. Please log in.');
                return;
            }
            else {
                //if token is present then remove the user data from the array
                let { payload } = decodeJwt(token);
                let userid = payload.userid
                console.log("userid = ", userid);
                let arrayGroupUserID = groupUserID.split(",").map(num => parseInt(num)).filter(id => id != parseInt(userid));
                console.log("arrayGroupUserID = ", arrayGroupUserID);

                try {
                    const response = await fetch(`${URL}/user/user-data`, {
                        method: 'GET',
                        headers: {
                            "Authorization": token
                        }
                    });

                    let res;
                    try {
                        res = await response.json();
                    } catch (e) {
                        throw new Error(response.ok ? "User data fetch success, failed to parse response." : `User data fetch server error (Status: ${response.status})`);
                    }

                    if (!response.ok) {
                        throw new Error(res.message || `Failed to fetch user data. Status: ${response.status}`);
                    }

                    let allUserData = res.allUserData;
                    //get only the usesr which are in the group
                    let filteredUsersToRemove = allUserData.filter(user => arrayGroupUserID.includes(user.id));
                    console.log("filteredUsersToRemove = ", JSON.stringify(filteredUsersToRemove));
                    // Store filtered users in localStorage
                    localStorage.setItem('filteredUsersToRemove', JSON.stringify(filteredUsersToRemove));

                    // Populate the removeContactList with group members
                    const contactList = document.getElementById('removeContactList');
                    // Display the full contact list initially
                    displayContacts(filteredUsersToRemove, contactList);

                } catch (err) {
                    console.log("Error loading contacts:", err.message);
                    showMessage('failure', `Error loading contacts: ${err.message}`);
                }
            }
        }

    } else {
        console.log("ADMIN is false");
        showMessage('failure', 'User is not an Admin in this group');
        closeRemoveContactPopup();
    }

}//loadRemoveContactPopup

function closeRemoveContactPopup() {
    document.getElementById('removeContactPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}//closeRemoveContactPopup

async function removeSelectedContacts() {
    console.log('inside removeSelectedContacts...');
    let groupId = localStorage.getItem('groupId');
    let filteredUsersToRemove = JSON.parse(localStorage.getItem('filteredUsersToRemove'));
    console.log("groupId = " + groupId);
    console.log("filteredUsersToRemove = " + JSON.stringify(filteredUsersToRemove));
    const selectedContacts = [];
    const checkboxes = document.querySelectorAll("#removeContactList input[type ='checkbox']:checked");
    console.log("checkboxes = " + JSON.stringify(checkboxes));

    checkboxes.forEach(checkbox => {
        const contactId = checkbox.id;
        console.log("contactId = " + contactId);
        const contact = filteredUsersToRemove.find(c => c.id === Number(contactId));

        if (contact) {
            selectedContacts.push({
                id: contact.id,
                name: contact.name,
                phoneNumber: contact.phoneNumber
            });
        }
    });
    console.log("selectedContacts = " + JSON.stringify(selectedContacts));
    //check if the user has seletcted one contact
    if (selectedContacts.length <= 0) {
        showMessage('failure', 'Please select at least one user to remove');
    } else {

        let token = localStorage.getItem('token');

        if (!token && !groupId) {
            showMessage('failure', 'Token and group ID not found. Please log in.');
            return;
        } else {

            try {
                //Send selectedContacts in the request body
                const response = await fetch(`${URL}/groups/delete-data`, {
                    method: 'POST',
                    headers: {
                        "Authorization": token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        groupId: groupId,
                        selectedContacts: selectedContacts
                    })
                });

                let res;
                try {
                    res = await response.json();
                } catch (e) {
                    throw new Error(response.ok ? "Success, but failed to parse response." : `Server error (Status: ${response.status})`);
                }

                if (!response.ok) {
                    throw new Error(res.message || `Failed to remove contacts. Status: ${response.status}`);
                }

                console.log(res);
                console.log("res = " + res.message);

                closeRemoveContactPopup();

                showMessage('success', 'Selected contacts removed successfully');

            } catch (err) {
                console.log("Error removing contacts:", err.message);
                showMessage('failure', `Error removing contacts: ${err.message}`);
            }//try -catch block
        }

    }
}//removeSelectedContacts      

async function loadAddContactPopup() {
    console.log('inside loadAddContactPopup:');

    if (!checkGroupSelected('add contacts')) return;


    let ADMIN = localStorage.getItem("ADMIN");
    let groupId = localStorage.getItem('groupId');
    let groupUserID = localStorage.getItem('groupUserID');
    let groupName = localStorage.getItem('groupName');
    console.log("groupId = " + groupId);
    console.log("groupUserID = " + groupUserID);
    console.log("groupName = " + groupName);

    if (groupName === 'q4X7nA6F8sT9mK3jY0dWvR1pZ5cG2bH') {
        showMessage('failure', "Can't add new contact to a private chat.");
        return;
    }

    // Show the remove contact popup
    document.getElementById('addContactPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    //if user is not a admin of the group then he should not be able to add members inside group
    if (ADMIN == 'true') {
        console.log("ADMIN = " + ADMIN);
        console.log("ADMIN is true");

        //when the user clicks on add button without selecting any groups
        if (groupId == null && groupUserID == null) {
            showMessage('failure', 'Please select a group first to add contact to the group');
        }
        else {
            let arrayGroupUserID = groupUserID.split(",").map(num => parseInt(num));
            console.log("arrayGroupUserID = " + arrayGroupUserID);
            let token = localStorage.getItem('token');

            if (!token && !groupId) {
                console.log("Token not found. Please log in.");
                return;
            } else {
                try {
                    const response = await fetch(`${URL}/user/user-data`, {
                        method: 'GET',
                        headers: {
                            "Authorization": token
                        }
                    });

                    let res;
                    try {
                        res = await response.json();
                    } catch (e) {
                        throw new Error(response.ok ? "User data fetch success, failed to parse response." : `User data fetch server error (Status: ${response.status})`);
                    }

                    if (!response.ok) {
                        throw new Error(res.message || `Failed to fetch user data. Status: ${response.status}`);
                    }

                    let allUserData = res.allUserData;
                    //get only the usesr which are in the group
                    let filteredUsersToAdd = allUserData.filter(user => !arrayGroupUserID.includes(user.id));
                    // Store filtered users in localStorage
                    localStorage.setItem('filteredUsersToAdd', JSON.stringify(filteredUsersToAdd));

                    const addContactList = document.getElementById('addContactList');

                    // Display the full contact list initially
                    displayContacts(filteredUsersToAdd, addContactList);

                    // Add event listener to the search input to filter contacts in real-time
                    document.getElementById('searchInputAddContact').addEventListener('input', function () {
                        filterContacts(filteredUsersToAdd, this.value, addContactList);
                    });


                } catch (err) {
                    console.log("Error loading contacts:", err.message);
                    showMessage('failure', `Error loading contacts: ${err.message}`);
                }
            }
        }
    } else {
        console.log("ADMIN is false");
        showMessage('failure', 'User is not an Admin in this group');
        closeAddContactPopup();
    }


}//loadAddContactPopup

async function addSelectedContacts() {
    console.log('inside addSelectedContacts...');
    let groupId = localStorage.getItem('groupId');
    let groupUserID = localStorage.getItem('groupUserID');
    console.log("groupId = " + groupId);
    console.log("groupUserID = " + groupUserID);
    let filteredUsersToAdd = JSON.parse(localStorage.getItem('filteredUsersToAdd'));
    // console.log("filteredUsersToAdd = " + JSON.stringify(filteredUsersToAdd));
    const selectedContacts = [];
    let checkbox = document.querySelectorAll("#addContactList input[type ='checkbox']:checked");

    console.log("checkbox = " + JSON.stringify(checkbox));

    checkbox.forEach(checkbox => {
        const contactId = checkbox.id;
        console.log("contactId = " + contactId);
        const contact = filteredUsersToAdd.find(c => c.id === Number(contactId));
        if (contact) {
            selectedContacts.push({
                id: contact.id,
                name: contact.name,
                phoneNumber: contact.phoneNumber
            });
        }
    });
    console.log("selectedContacts = " + JSON.stringify(selectedContacts));

    //when the user clicks on delete button without selecting any groups
    if (selectedContacts.length <= 0 || Object.keys(checkbox).length === 0) {
        showMessage('failure', 'Please select a contact to add to the group');
    }
    else {
        let token = localStorage.getItem('token');

        if (!token && !groupId) {
            console.log("Token not found. Please log in.");
            return;
        } else {
            try {
                const response = await fetch(`${URL}/groups/update-data`, {
                    method: 'POST',
                    headers: {
                        "Authorization": token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        groupId: groupId,
                        selectedContacts: selectedContacts
                    })
                });

                let res;
                try {
                    res = await response.json();
                } catch (e) {
                    throw new Error(response.ok ? "Success, but failed to parse response." : `Server error (Status: ${response.status})`);
                }

                if (!response.ok) {
                    throw new Error(res.message || `Failed to add contacts. Status: ${response.status}`);
                }

                console.log("res = " + JSON.stringify(res));
                console.log("res = " + res.message);

                showMessage('success', 'Contacts added successfully to this group');

                closeAddContactPopup();
            } catch (err) {
                console.log("Error adding contacts:", err.message);
                showMessage('failure', `Error adding contacts: ${err.message}`);
            }
        }
    }

}//addSelectedContacts

function closeAddContactPopup() {
    document.getElementById('addContactPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}//closeRemoveContactPopup

async function loadAddAdminPopup() {
    console.log('inside loadAddAdminPopup');
    if (!checkGroupSelected('promote an admin')) return;

    let ADMIN = localStorage.getItem("ADMIN");
    let groupId = localStorage.getItem('groupId');
    let groupUserID = localStorage.getItem('groupUserID');
    let userid = localStorage.getItem('userid');
    let groupName = localStorage.getItem('groupName');
    console.log("userid = " + userid);
    console.log("groupId = " + groupId);
    console.log("groupUserID = " + groupUserID);
    console.log("groupName = " + groupName);

    if (groupName === 'q4X7nA6F8sT9mK3jY0dWvR1pZ5cG2bH') {
        showMessage('failure', "Can't make admin in a private chat.");
        return;
    }

    // Show the remove contact popup
    document.getElementById('addAdminPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    //if the user is admin of the group then only he can promote to admin
    if (ADMIN == 'true') {
        console.log("ADMIN = " + ADMIN);

        //when the user clicks on make admin button without selecting any groups
        if (groupId == null && groupUserID == null) {
            showMessage('failure', 'Please select a group first to promote contact from the group');
        } else {

            //remove the admins contact from popup, cause admin of the group can not prmote himself
            let arrayGroupUserID = groupUserID.split(",").map(num => parseInt(num));
            console.log("arrayGroupUserID = " + arrayGroupUserID);
            integerUserId = Number(userid);
            console.log("integerUserId = " + typeof (integerUserId));
            arrayGroupUserID = arrayGroupUserID.filter(id => id !== integerUserId);
            console.log("arrayGroupUserID = " + arrayGroupUserID);

            let token = localStorage.getItem('token');

            if (!token && !groupId) {
                console.log("Token not found. Please log in.");
                return;
            }
            else {
                try {

                    const response = await fetch(`${URL}/user/user-data`, {
                        method: 'GET',
                        headers: {
                            "Authorization": token
                        }
                    });

                    let res;
                    try {
                        res = await response.json();
                    } catch (e) {
                        throw new Error(response.ok ? "User data fetch success, failed to parse response." : `User data fetch server error (Status: ${response.status})`);
                    }

                    if (!response.ok) {
                        throw new Error(res.message || `Failed to fetch user data. Status: ${response.status}`);
                    }

                    let allUserData = res.allUserData;
                    //get only the usesr which are in the group
                    let filteredUsersTopromote = allUserData.filter(user => arrayGroupUserID.includes(user.id));
                    console.log("filteredUsersTopromote = " + JSON.stringify(filteredUsersTopromote));
                    // Store filtered users in localStorage
                    localStorage.setItem('filteredUsersTopromote', JSON.stringify(filteredUsersTopromote));

                    // // Populate the removeContactList with group members
                    const contactList = document.getElementById('addAdminList');
                    displayContacts(filteredUsersTopromote, contactList);

                } catch (err) {
                    console.log("Error loading contacts:", err.message);
                    showMessage('failure', `Error loading contacts: ${err.message}`);
                }
            }
        }
    }
    else {
        console.log("ADMIN = " + ADMIN);
        showMessage('failure', 'User is not an Admin in this group');
        closeaddAdminPopup();
    }

}//loadAddAdminPopup

function closeaddAdminPopup() {
    document.getElementById('addAdminPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}//closeRemoveContactPopup

async function promoteToAdmin() {
    console.log('inside promoteToAdmin...');
    let groupId = localStorage.getItem('groupId');
    let groupUserID = localStorage.getItem('groupUserID');
    console.log("groupId = " + groupId);
    console.log("groupUserID = " + groupUserID);
    let filteredUsersTopromote = JSON.parse(localStorage.getItem('filteredUsersTopromote'));
    console.log("filteredUsersTopromote = " + JSON.stringify(filteredUsersTopromote));
    const selectedContacts = [];
    let checkbox = document.querySelectorAll("#addAdminList input[type ='checkbox']:checked");

    console.log("checkbox = " + JSON.stringify(checkbox));

    checkbox.forEach(checkbox => {
        const contactId = checkbox.id;
        console.log("contactId = " + contactId);
        const contact = filteredUsersTopromote.find(c => c.id === Number(contactId));

        if (contact) {
            selectedContacts.push({
                id: contact.id,
                name: contact.name,
                phoneNumber: contact.phoneNumber
            });
        }
    });
    console.log("selectedContacts = " + JSON.stringify(selectedContacts));

    //when the user clicks on delete button without selecting any groups
    if (selectedContacts.length <= 0) {
        showMessage('failure', 'Please select a contact to promote to admin');
    }
    else {

        let token = localStorage.getItem('token');

        if (!token && !groupId) {
            showMessage('failure', "Token not found. Please log in.");
            return;
        } else {
            try {
                const response = await fetch(`${URL}/admin/add-admin`, {
                    method: 'POST',
                    headers: {
                        "Authorization": token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        groupId: groupId,
                        selectedContacts: selectedContacts
                    })
                });

                let res;
                try {
                    res = await response.json();
                } catch (e) {
                    throw new Error(response.ok ? "Success, but failed to parse response." : `Server error (Status: ${response.status})`);
                }

                if (!response.ok) {
                    throw new Error(res.message || `Failed to promote admin. Status: ${response.status}`);
                }

                console.log("res = " + JSON.stringify(res));
                console.log("message = " + res.message);
                console.log("addedAdminData = " + res.addedAdminData);

                closeaddAdminPopup();
                showMessage('success', 'User promoted to admin successfully');

            } catch (err) {
                console.log("Error promoting admin:", err.message);
                showMessage('failure', `Error promoting admin: ${err.message}`);
            }
        }
    }
}//promoteToAdmin


async function deleteGroup() {
    console.log('inside deleteGroup...');
    let groupId = localStorage.getItem('groupId');
    let groupUserID = localStorage.getItem('groupUserID');
    let groupName = localStorage.getItem('groupName');
    let ADMIN = localStorage.getItem("ADMIN");
    console.log("groupId = " + groupId);
    console.log("groupName = " + groupName);
    console.log("ADMIN = " + ADMIN);

    if (groupName === 'q4X7nA6F8sT9mK3jY0dWvR1pZ5cG2bH') {
        showMessage('failure', "You can not delete a private chat.");
        return;
    }

    if (ADMIN === 'true') {
        let token = localStorage.getItem('token');
        if (!token) {
            showMessage('failure', 'Token not found. Please log in.');
            return;
        }
        if (!groupId) {
            showMessage('failure', 'Please select a group first');
            return;
        }

        // Custom modal replacement for confirm()
        if (!window.confirm("Are you sure you want to remove this group?")) {
            return;
        }

        try {
            const response = await fetch(`${URL}/groups/update-group`, {
                method: 'PUT',
                headers: {
                    "Authorization": token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ groupId: groupId })
            });

            let res;
            try {
                res = await response.json();
            } catch (e) {
                throw new Error(response.ok ? "Success, but failed to parse response." : `Server error (Status: ${response.status})`);
            }

            if (!response.ok) {
                throw new Error(res.message || `Failed to delete group. Status: ${response.status}`);
            }

            console.log('delete response:', JSON.stringify(res));

            if (res.message === "Data removed") {
                showMessage('success', 'Group removed successfully');

                // first clear the existing list of groups and users
                document.getElementById('groupList').innerHTML = '';
                document.getElementById('singleUserList').innerHTML = '';

                // Clear group selection locally after deletion
                localStorage.removeItem('groupId');
                localStorage.removeItem('groupUserID');
                localStorage.removeItem('groupName');

                //fetch the new records after deleting a group and load the fresh data
                const updatedGroupsResponse = await fetch(`${URL}/groups/get-data`, {
                    method: 'GET',
                    headers: { "Authorization": token }
                });

                let updatedGroupsRes;
                try {
                    updatedGroupsRes = await updatedGroupsResponse.json();
                } catch (e) {
                    throw new Error(updatedGroupsResponse.ok ? "Groups fetch success, failed to parse response." : `Groups fetch server error (Status: ${updatedGroupsResponse.status})`);
                }

                if (!updatedGroupsResponse.ok) {
                    throw new Error(updatedGroupsRes.message || `Failed to fetch updated groups. Status: ${updatedGroupsResponse.status}`);
                }

                console.log("AFTER deleting group res = " + updatedGroupsRes);
                for (let i = 0; i < updatedGroupsRes.allGroupData.length; i++) {
                    printallGroupDataOnFrontend(updatedGroupsRes.allGroupData[i]);
                }
            }
            else {
                console.log("Group not deleted");
            }

        } catch (err) {
            console.log("Error deleting group data:", err.message);
            showMessage('failure', `Error deleting group: ${err.message}`);
        }
    }
    else {
        console.log("ADMIN = " + ADMIN);
        showMessage('failure', 'User is not a Admin in this group');
    }

}//deleteGroup

async function submitChat(event) {
    event.preventDefault();
    console.log('inside submitChat');
    let userChat = document.getElementById('userChat');
    console.log('userChat = ' + userChat.value);
    let token = localStorage.getItem('token');
    console.log('token = ' + token);
    let groupId = localStorage.getItem('groupId');
    console.log('groupId = ' + groupId);

    if (userChat.value == "" || groupId == null) {
        console.log("User fields and select any group or chat ");
    }
    else {
        try {
            const obj = {
                chat: userChat.value,
                groupId: groupId
            }
            if (!isNaN(groupId)) {

                const response = await fetch(`${URL}/chat/add-chat`, {
                    method: 'POST',
                    headers: {
                        "Authorization": token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(obj)
                });

                let data;
                try {
                    data = await response.json();
                } catch (e) {
                    throw new Error(response.ok ? "Success, but failed to parse chat response." : `Server error (Status: ${response.status})`);
                }

                if (!response.ok) {
                    throw new Error(data.message || `Failed to send chat. Status: ${response.status}`);
                }

                // Log the response for debugging
                console.log('response = ' + JSON.stringify(data.chatData));

                displayMessage(data.chatData.chatName);
                //send the chat to backend socket
                socket.emit('send-message', data.chatData); // Send full object as per typical Socket.IO use
                //update the id 
                lastChatID = data.chatData.id;
            }
        }
        catch (error) {
            console.error('Chat Submission Error:', error.message);
            showMessage('failure', `Failed to send chat: ${error.message}`);
        }
    }
    userChat.value = "";
}//submitChat

function displayMessage(chat) {
    console.log('inside displayMessage');
    // console.log('chat = ', chat);
    const chatContent = document.getElementById('chatContent');

    const chatItem = document.createElement('div');
    chatItem.classList.add('chatDataDIV');

    // Check if the input is a URL (for simplicity, assuming URLs start with "http")
    if (chat.startsWith('https://res.cloudinary.com')) {
        // Create an <img> element for images
        if (/\.(jpg|jpeg|png|gif)$/i.test(chat)) {
            const image = document.createElement('img');
            image.src = chat;
            image.alt = 'Uploaded file';
            image.style.maxWidth = '100px'; // Set appropriate size
            image.style.maxHeight = '100px';
            chatItem.appendChild(image);
        }
        // Create a <video> element for videos
        else if (/\.(mp4|webm|ogg)$/i.test(chat)) {
            const video = document.createElement('video');
            video.src = chat;
            video.controls = true;
            video.style.maxWidth = '200px'; // Set appropriate size
            video.style.maxHeight = '200px';
            chatItem.appendChild(video);
        }
    }
    else {
        chatItem.textContent = chat;
    }
    chatContent.appendChild(chatItem);
}//displayMessage

// NOTE: io() is assumed to be globally available from the socket.io.min.js script tag in your HTML
const socket = io(`${URL}`);
// When a new message is received from the server
socket.on('newMessage', function (message) {
    console.log('Received message:', message);
    // Assuming message is the full chat object, which has chatName property
    if (message && message.chatName) {
        displayMessage(message.chatName);
    }
});

function handleFileUpload(e) {
    e.preventDefault();
    console.log('handleFileUpload called');
    const files = e.target.files;
    console.log('file :', files);

    if (files.length === 0) {
        console.log("No file selected.");
        return;
    }
    const file = files[0];
    const fileType = file.type;
    console.log('fileType :', fileType);
    console.log("Selected file:", file);

    // Check if the file is an image or video
    if (fileType.startsWith("image/")) {
        console.log("File is an image.");
        uploadToCloudinary(file, "image");
    } else if (fileType.startsWith("video/")) {
        console.log("File is a video.");
        uploadToCloudinary(file, "video");
    } else {
        console.error("Unsupported file type. Please select an image or video.");
        showMessage('failure', "Unsupported file type. Please select an image or video.");
    }
}//handleFileUpload

function uploadToCloudinary(file, resourceType) {
    console.log('uploadToCloudinary called');
    console.log('file :', file);
    let groupId = localStorage.getItem('groupId');
    console.log('groupId = ' + groupId);;
    let token = localStorage.getItem('token');
    console.log('token = ' + token);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "pi13acgd");
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/chatmultimedia/${resourceType}/upload`;

    // Cloudinary upload using native fetch
    fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error.message || `Cloudinary upload failed with status ${response.status}`);
                });
            }
            return response.json();
        })
        .then(async (data) => {
            console.log("Uploaded successfully:", data);

            if (!data.secure_url) {
                throw new Error("Cloudinary did not return a secure URL.");
            }

            const obj = {
                chat: data.secure_url,
                groupId: groupId
            }

            // Post chat URL to backend using native fetch
            try {
                const response = await fetch(`${URL}/chat/add-chat`, {
                    method: 'POST',
                    headers: {
                        "Authorization": token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(obj)
                });

                let chatDataRes;
                try {
                    chatDataRes = await response.json();
                } catch (e) {
                    throw new Error(response.ok ? "Success, failed to parse chat post response." : `Server error (Status: ${response.status})`);
                }

                if (!response.ok) {
                    throw new Error(chatDataRes.message || `Failed to record chat. Status: ${response.status}`);
                }

                // Log the response for debugging
                console.log('response = ' + JSON.stringify(chatDataRes.chatData));
                displayMessage(chatDataRes.chatData.chatName);
                socket.emit('send-message', chatDataRes.chatData);

            } catch (err) {
                console.error('Error posting chat to server:', err.message);
                showMessage('failure', `Error sending file chat: ${err.message}`);
            }

        })
        .catch((error) => {
            console.error("Error uploading file:", error.message);
            showMessage('failure', `Error uploading file: ${error.message}. Please try again.`);
        });
}//handleFileUpload

function updateTimeAndImage() {
    const timeElement = document.querySelector('.time');
    const addImageElement = document.querySelector('.addImage');
    const now = new Date();
    const hours = now.getHours();
    // Update the time
    const formattedDate = now.toLocaleTimeString();
    // console.log('formattedDate :', formattedDate);
    timeElement.textContent = formattedDate;

    // Determine which image to show based on time
    let imageSrc = '';
    let altText = '';

    if (hours >= 6 && hours < 12) {
        // Morning (6 AM - 12 PM)
        imageSrc = 'good_morning.jpg';
        altText = 'Good Morning';
    } else if (hours >= 12 && hours < 18) {
        // Afternoon (12 PM - 6 PM)
        imageSrc = 'good_afternoon.jpg';
        altText = 'Good Afternoon';
    } else {
        // Evening / Night (6 PM - 6 AM)
        imageSrc = 'good_night.jpg';
        altText = 'Good Night';
    }
    addImageElement.innerHTML = `<img src="${imageSrc}" alt="${altText}" title="${altText}" />`;
}//updateTime

updateTimeAndImage();
setInterval(updateTimeAndImage, 1000);
