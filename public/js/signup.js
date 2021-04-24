/*eslint-disable*/

import axios from 'axios';
import { showAlert } from './alerts';
import { login } from './login';

export const signup = async function(user) {
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
        // console.log(response);
        if (response.data.status === 'success') {
            showAlert('success', 'Sign up successful');
            login(user.email, user.password);
            // window.setTimeout(async () => {
            //     await login(user.email, user.password);
            //     // location.assign('/login');
            // }, 1000);
        }
    } catch (error) {
        // console.error(error);
        showAlert('error', error.response.data.message);
    }
};
