/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        if (response.data.status === 'success') {
            showAlert('success', 'Logging In! Please wait...');
            location.assign('/');
            // window.setTimeout(() => {
            // }, 1000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const logout = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        });
        if (response.data.status === 'success') {
            showAlert('success', 'Logged out!');
            if (window.location.pathname === '/me')
                return location.assign('/login');
            location.reload();
        }
    } catch (err) {
        showAlert('error', 'Log out failed. please try again!');
    }
};
