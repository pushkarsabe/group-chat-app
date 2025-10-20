//local variables
const URL = 'http://localhost:3000';
console.log('login.js loaded');

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
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
        // Ensure the message element is empty before adding a new one
        msg.innerHTML = '';

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
    console.log('inside submitData login');
    // Get values from the form
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;
    console.log('email = ', email);
    console.log('password = ', password);

    if (email === "" || password === "") {
        await showMessage('Please enter both email and password', 'failureMessage');
    }
    else {
        const obj = {
            email: email,
            password: password
        }

        try {
            // Note: You must have imported axios via a script tag in your HTML for this to work.
            const response = await axios.post(`${URL}/user/login`, obj);
            console.log('response data = ' + JSON.stringify(response.data));

            // Checking the response structure here for safety
            if (response.data && response.data.userDetails && response.data.token) {
                console.log('email = ' + response.data.userDetails.email);
                console.log('token = ' + response.data.token);
                localStorage.setItem('token', response.data.token);

                await showMessage('Email and Password verified', 'succesMessage');

                //user will be redirected to home page after 2 sec of login
                setTimeout(() => {
                    window.location.href = './whatsappHome.html';
                }, 2000);
            } else {
                await showMessage('Login succeeded, but unexpected data structure', 'failureMessage');
            }
        }
        catch (error) {
            // *** IMPORTANT: LOG THE FULL ERROR OBJECT HERE ***
            console.error('Login Request Failed:', error);

            let errorMessage = 'An unexpected error occurred'; // Default failure message

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
                        // Use server message if available, otherwise 'Server error'
                        errorMessage = error.response.data?.message || 'Server error (Status: ' + error.response.status + ')';
                }
            } else if (error.request) {
                // The request was made but no response was received (server down/unreachable)
                errorMessage = 'No response from server (Check backend)';
            }

            // If none of the above, it keeps the default: 'An unexpected error occurred'
            await showMessage(errorMessage, 'failureMessage');
        }
    }

    //to clear the fields
    document.getElementById('inputEmail').value = "";
    document.getElementById('inputPassword').value = "";
}//submitData
