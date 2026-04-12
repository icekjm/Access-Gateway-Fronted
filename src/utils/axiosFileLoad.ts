import axios from 'axios';

export const axiosDbFile = axios.create({
    baseURL: process.env.REACT_APP_DBFILE_BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});
