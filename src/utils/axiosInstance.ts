import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { refreshAccessToken } from './auth';
import { toast } from 'react-toastify';
import { config } from 'process';
import { useNavigate } from 'react-router-dom';


export const axiosJoinAccess = axios.create({
    baseURL: process.env.REACT_APP_FRM_BASE_URL,
    timeout: 5000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const axiosBoard = axios.create({
    baseURL: process.env.REACT_APP_BOARD_BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    }
})

export const axiosTwofa = axios.create({
    baseURL: process.env.REACT_APP_AUTH_BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const axiosAuthJoinAccess = axios.create({
    baseURL: process.env.REACT_APP_AUTH_BASE_URL,
    timeout: 5000,
})

export const axiosLogin = axios.create({
    baseURL: process.env.REACT_APP_AUTH_BASE_URL,
    timeout: 5000,
})

export const axiosLogout = axios.create({
    baseURL: process.env.REACT_APP_AUTH_BASE_URL,
    timeout: 5000,
});

axiosLogout.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

export const api: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_DBFILE_BASE_URL,
    timeout: 5000,
});

//보호된 api 접근 요청시, 헤더에 토큰붙여서 요청하기
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    console.log('[request interceptor] url =', config.url);
    console.log('[request interceptor] token =', accessToken);

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

// Access토큰 만료 후, Refresh토큰을 이용한 Access토큰 재발급과정
let isRefreshing = false;

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const response = error.response;
        const request = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // 서버 응답이 없는 에러 처리
        if (!response) {
            return Promise.reject(error);
        }

        if (response.status === 401 && !request?._retry) {
            if (isRefreshing) {
                return Promise.reject(error);
            }

            isRefreshing = true;
            request._retry = true;

            try {
                const newAccessToken = await refreshAccessToken();

                if (newAccessToken) {
                    toast.warning('인증이 만료되어 세션을 갱신합니다.');

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);

                    return Promise.reject(error);
                }

                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                sessionStorage.removeItem('preAuthToken');

                toast.error('세션 갱신에 실패했습니다. 다시 로그인해주세요.');

                setTimeout(() => {
                    window.location.href = '/frm/FrmLogin';
                }, 1000);

                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);
