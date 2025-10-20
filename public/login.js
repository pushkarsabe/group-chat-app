//local variables
const HOST = 'localhost';
const URL = 'http://${HOST}:3000';
console.log('login.js loaded');

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    console.log('HOST = ' + HOST);
    console.log('Submit event triggered');
    submitData();
});
document.getElementById('signupBtn').addEventListener('click', function () {
    window.location.href = './signup.html';
});

//function to display the message
function showMessage(msgText, className) {
    return new Promise(resolve => {
        const msg = document.getElementById('message');
        const div = document.createElement('div');
        const textNode = document.createTextNode(msgText);
        div.appendChild(textNode);
        msg.appendChild(div);
        msg.classList.add(className);

        setTimeout(() => {
            msg.classList.remove(className);
            msg.removeChild(div);
            resolve();
        }, 2000);
    })
}

async function submitData() {
    // event.preventDefault();
    console.log('inside submitData login');
    // Get values from the form
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;
    console.log('HOST = ' + HOST);
    console.log('email = ' + email);
    console.log('password = ' + password);

    if (email == "" || password == "") {
        console.log("Empty user fields");
    }
    else {
        const obj = {
            email: email,
            password: password
        }

        try {
            const response = await axios.post(`${URL}/user/login`, obj);
            console.log('response data = ' + JSON.stringify(response.data));
            //this will give the data inside the array
            console.log('email = ' + response.data.userDetails.email);
            console.log('phoneNumber = ' + response.data.userDetails.phoneNumber);
            console.log('password = ' + response.data.userDetails.password);
            console.log('token = ' + response.data.token);
            localStorage.setItem('token', response.data.token);

            await showMessage('Email and Password verified', 'succesMessage');
            //user will be redirected to home page after 2 sec of login
            setTimeout(() => {
                window.location.href = './whatsappHome.html';
            }, 2000);
        }
        catch (error) {
            let errorMessage = 'An unexpected error occurred';

            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        errorMessage = 'Invalid credentials';
                        break;
                    case 403:
                        errorMessage = 'Access forbidden';
                        break;
                    case 404:
                        errorMessage = 'User not found';
                        break;
                    default:
                        errorMessage = error.response.data.message || 'Server error';
                }
            } else if (error.request) {
                errorMessage = 'No response from server';
            }
            await showMessage(errorMessage, 'failureMessage');
        }
    }

    //to clear the fields
    document.getElementById('inputEmail').value = "";
    document.getElementById('inputPassword').value = "";
}//submitData
