/*eslint-disable*/

import axios from 'axios';
import { showAlert } from './alerts';

//type is 'data' or 'password'
export async function userSettings(data, type) {
    try {
        const url =
            type === 'password'
                ? 'http://127.0.0.1:8000/api/v1/users/updatePassword'
                : 'http://127.0.0.1:8000/api/v1/users/updateMe';
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated!`);
            location.reload();
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}
