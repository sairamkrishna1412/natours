/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
    'pk_test_51IiO5MSDYL41xcuSBydjlawnERZkKhRex2SgSXRaGYaMTKkVFNg6D4zvI9YaUFvSRgZJSMwwL6hyj96dlwUVMSbu00dwhYWG2w'
);

export const bookTour = async function(tourID) {
    try {
        //1) get session from API
        const session = await axios(
            `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourID}`
        );
        //2)make transaction from credit card.
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};
