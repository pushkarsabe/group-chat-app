const contactForm = document.querySelector('#contactForm');
const name = document.querySelector('#name');
const email = document.querySelector('#email');
const phone = document.querySelector('#phone');
const message = document.querySelector('#message');

const URL = 'http://${HOST}:3000';

contactForm.addEventListener("submit", onsubmit);


function onsubmit(e) {
    e.preventDefault();
    let uuid = Date.now().toString();
    console.log("uuid = " + uuid);
    console.log(name.value);
    console.log(email.value);
    console.log(phone.value);
    console.log(message.value);

    if (name.value == "" || email.value == "" || phone.value == "" || message.value == "") {
        console.log("empty input");
    }
    else {
        let obj = {
            name: name.value,
            email: email.value,
            phone: phone.value,
            message: message.value
        }
        localStorage.setItem(uuid, JSON.stringify(obj));
        console.log("Message Sent")

        setTimeout(() => {
            windodw.location.href = "/whatsappHome.html";
        }, 3000);
    }
    name.value = "";
    email.value = "";
    phone.value = "";
    message.value = "";
}