/*eslint-disable*/
import '@babel/polyfill';
import { bookTour } from './stripe';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { userSettings } from './userSettings';
import { showAlert } from './alerts';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const bookTourButton = document.getElementById('book-tour');
//DELEGATION
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        userSettings(form, 'data');
    });
}

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent =
            'Updating...';
        const password = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const newPasswordConfirm = document.getElementById('password-confirm')
            .value;
        await userSettings(
            { password, newPassword, newPasswordConfirm },
            'password'
        );

        document.querySelector('.btn--save-password').textContent =
            'SAVE PASSWORD';

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

if (bookTourButton) {
    bookTourButton.addEventListener('click', e => {
        e.target.textContent = 'processing...';
        const tourID = bookTourButton.dataset.tourid;
        bookTour(tourID);
    });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 15);
