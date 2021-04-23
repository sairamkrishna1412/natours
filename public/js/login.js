/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    try {
        const response = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        if (response.data.status === 'success') {
            showAlert('success', 'Logging In! Please wait...');
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const logout = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:8000/api/v1/users/logout'
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
