const checkbox = document.querySelector('#checkbox');
const password = document.querySelector('#password');

checkbox.addEventListener('click', myFunction);

function myFunction() {
    if (password.type === "password") {
      password.type = "text";
    } else {
      password.type = "password";
    }
}