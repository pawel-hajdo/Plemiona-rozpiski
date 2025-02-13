import axios from 'axios';
import {getTokenFromCookies} from "@/lib/utils";

const api = axios.create({
    // baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    baseURL: 'https://plemionarozpiski.pl/api'
});

api.interceptors.request.use(
    (config) => {
        if (!config.headers.skipAuth) {
            const token = getTokenFromCookies();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getPlayerCommands = async (playerId: string) => {
    const response = await api.get(`/commands/player/${playerId}?page=0&size=2500`);
    return response.data;
};

export const getDeletedCommands = async (playerId: string) => {
    const response = await api.get(`/commands/player/${playerId}/deleted?page=0&size=2500`);
    return response.data;
}
export const softDeleteCommands = async (commandIds: any, playerId: string) => {
    const response = await api.delete(`/commands/player/${playerId}`, {
        data: { commandIds }
    });
    return response.data;
}

export const restoreCommands = async (commandIds: any, playerId: string) => {
    const response = await api.put(`/commands/player/${playerId}`, { commandIds });
    return response.data;
}

export const authUser = async (login: string, password: string) => {
    const response = await api.post('/users/auth', {
        "name": login,
        "password": password,
    }, {
        headers: {
            skipAuth: true
        }
    });
    return response.data;
}

export const registerUser = async (login: string, password: string, code: string, world: string) => {
    const response = await api.post('/users', {
        "name": login,
        "password": password,
        "code": code,
        "world": world
    }, {
        headers: {
            skipAuth: true
        }
    });
    return response.data;
}

export const updateUser = async (login: string, oldPassword:string, newPassword: string) => {
    const response = await api.put('/users', {
        "name": login,
        "oldPassword": oldPassword,
        "newPassword": newPassword,
    });
    return response.data;
}

export const resetPassword = async (login: string, password: string, code: string, world: string) => {
    const response = await api.post('/users/reset-password', {
        "name": login,
        "password": password,
        "code": code,
        "world": world
    }, {
        headers: {
            skipAuth: true
        }
    });
    return response.data;
}


export const getPlayerLinks = async (playerId: string) => {
    const response = await api.get(`/links/player/${playerId}`);
    return response.data;
};

export const getSourceVillagesByType = async (playerId: string, type: string) => {
    const response = await api.get(`/commands/player/${playerId}/sourceVillages?type=${type}`)
    return response.data;
}

export const setAccountSitter = async (playerId: string, sitterName: string, world: string) => {
    const response = await api.post(`/sittings/owner/${playerId}`, {
        "sitterName": sitterName,
        "world": world
    })
    return response.data;
}

export const getAccountSitters = async (playerId: string) => {
    const response = await api.get(`/sittings/owner/${playerId}`);
    return response.data;
}

export const getAccountSittings = async (sitterId: string) => {
    const response = await api.get(`/sittings/sitter/${sitterId}`);
    return response.data;
}

export const cancelSittingRequest = async (playerId: string, sittingId: number) => {
    const response = await api.put(`/sittings/${sittingId}/cancel/owner/${playerId}`);
    return response.data;
}

export const rejectSittingRequest = async (playerId: string, sittingId: number) => {
    const response = await api.put(`/sittings/${sittingId}/reject/sitter/${playerId}`);
    return response.data;
}

export const acceptSittingRequest = async (playerId: string, sittingId: number) => {
    const response = await api.put(`/sittings/${sittingId}/accept/sitter/${playerId}`);
    return response.data;
}

export const endSitting = async (playerId: string, sittingId: number) => {
    const response = await api.delete(`/sittings/${sittingId}/player/${playerId}`);
    return response.data;
}

export const getSittingsCommands = async (playerId: string) => {
    const response = await api.get(`/commands/sitter/${playerId}`);
    return response.data;
}

export const getSittingsDeletedCommands = async (playerId: string) => {
    const response = await api.get(`/commands/sitter/${playerId}/deleted`);
    return response.data;
}

export const sendReports = async (playerId: string, reports: string[]) => {
    const response = await api.post(`/reports/${playerId}`, {
        "reportIds": reports
    });
    return response.data;
};

export const getLatestReports = async (page = 0, size = 100, sortBy = 'createdAt', ascending = false, playerId: string | null = null) => {
    const params = {
        page,
        size,
        sortBy,
        ascending,
        playerId,
    };

    const response = await api.get('/reports', { params });
    return response.data;
};

export const getPlayersWithReports = async () => {
    const response = await api.get('/reports/players');
    return response.data;
}

export const downloadReports = async (date: string | null = null) => {
    const params = date ? { date } : {};
    const response = await api.get('/reports/download', { params, responseType: 'blob' });

    const contentDisposition = response.headers['content-disposition'];

    const fileNameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
    const fileName = fileNameMatch && fileNameMatch[1] ? fileNameMatch[1] : 'reports.txt';

    const file = new Blob([response.data], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = fileName;
    link.click();
};



export default api;
