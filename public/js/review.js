/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

const reviewDialog = document.querySelector('.dialog__review');
const overlay = document.querySelector('.dialog__overlay');

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
            location.reload();
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const updateReview = async function(data) {
    try {
        const response = await axios({
            method: 'PATCH',
            url: `/api/v1/reviews/${data.reviewID}`,
            data: {
                rating: data.rating,
                review: data.review
            }
        });
        if (response.data.status === 'success') {
            toggleReviewForm();
            showAlert('success', 'Review updated!');
            location.reload();
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
