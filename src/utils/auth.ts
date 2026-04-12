import axios from 'axios';

type RefreshResponse = {
    success: boolean;
    message: string;
    accessToken: string | null;
};

const AUTH_BASE_URL = process.env.REACT_APP_AUTH_BASE_URL;

export async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        return null;
    }

    try {
        const response = await axios.post<RefreshResponse>(
            `${AUTH_BASE_URL}/refresh`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                },
            },
        );

        const newAccessToken = response.data.accessToken;

        if (!newAccessToken) {
            return null;
        }

        localStorage.setItem('accessToken', newAccessToken);
        return newAccessToken;
    } catch (error) {
        return null;
    }
}
