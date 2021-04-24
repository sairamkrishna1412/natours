/*eslint-disable*/

import axios from 'axios';
import { showAlert } from './alerts';
import { login } from './login';

exports.signup = async function(user) {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name: user.name,
                email: user.email,
                password: user.password,
                passwordConfirm: user.passwordConfirm
            }
        });
        if (response.data.status === 'success') {
            showAlert('Sign up successful');
            login(user.email, user.password);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};
