/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

const reviewDialog = document.querySelector('.new-review-dialog');
const overlay = document.querySelector('.overlay');

export const toggleReviewForm = function() {
    reviewDialog.classList.toggle('hidden');
    overlay.classList.toggle('hidden');
};

export const createReview = async function(data) {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/reviews/',
            data: {
                // user: data.userID,
                tour: data.tourID,
                rating: data.rating,
                review: data.review
            }
        });

        if (response.data.status === 'success') {
            toggleReviewForm();
            showAlert('success', 'Thanks for your valuable review!');
            window.setTimeout(() => {
                location.reload();
            }, 1000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
