/*eslint-disable*/
import '@babel/polyfill';
import { bookTour } from './stripe';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { userSettings } from './userSettings';
import { showAlert } from './alerts';
import { signup } from './signup';
import { toggleReviewForm, createReview, updateReview } from './review';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const bookTourButton = document.getElementById('book-tour');
const signupForm = document.querySelector('.form--signup');
const newReviewBtn = document.querySelector('.btn--review');
const reviewForm = document.getElementById('review-form');
const closeReviewForm = document.querySelector('.dialog__close');
const overlay = document.querySelector('.dialog__overlay');
const editReview = document.querySelector('.my-review__edit');

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

if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        document.querySelector('.btn-green--signup').textContent =
            'Please wait...';
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('confirm_password')
            .value;
        await signup({ name, email, password, passwordConfirm });

        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        document.getElementById('confirm_password').value = '';

        document.querySelector('.btn-green--signup').textContent = 'Sign up';
    });
}

if (newReviewBtn) {
    newReviewBtn.addEventListener('click', toggleReviewForm);
}
if (editReview) {
    editReview.addEventListener('click', toggleReviewForm);
}

if (closeReviewForm || overlay) {
    closeReviewForm.addEventListener('click', toggleReviewForm);
    overlay.addEventListener('click', toggleReviewForm);
}
if (reviewForm) {
    reviewForm.addEventListener('submit', async e => {
        e.preventDefault();
        const rating = document.getElementById('new_rating').value;
        const review = document.getElementById('new_review').value;

        if (editReview) {
            const reviewID = editReview.dataset.reviewid;
            await updateReview({ reviewID, rating, review });
        } else {
            const tourID = reviewForm.dataset.tourid;
            await createReview({ tourID, rating, review });
        }

        document.getElementById('new_rating').value = '';
        document.getElementById('new_review').value = '';
    });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 15);
