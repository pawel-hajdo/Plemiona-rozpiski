import axios from 'axios';
import {getTokenFromCookies} from "@/lib/utils";

const api = axios.create({
   // baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    baseURL: 'https://plemionarozpiski.pl/api'
    //baseURL: 'http://localhost:8080/api'
});

export const getPlayerCommands = async (playerId: string) => {
    const response = await api.get(`/commands/player/${playerId}?page=0&size=500`, {
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`
        }});
    return response.data;
};

export const getDeletedCommands = async (playerId: string) => {
    const response = await api.get(`/commands/player/${playerId}/deleted?page=0&size=100`, {
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`
    }});
    return response.data;
}
export const softDeleteCommands = async (commandIds: any, playerId: string) => {
    const response = await api.delete(`/commands/player/${playerId}`, {
        data: { commandIds },
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`
        }
    });
    return response.data;
}

export const restoreCommands = async (commandIds: any, playerId: string) => {
    const response = await api.put(`/commands/player/${playerId}`, { commandIds }, {
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`
        }
    });
    return response.data;
}

export const authUser = async (login: string, password: string) => {
    const response = await api.post('/users/auth', {
        "name": login,
        "password": password,
    })
    return response.data;
}

export const registerUser = async (login: string, password: string, code: string, world: string) => {
    const response = await api.post('/users', {
        "name": login,
        "password": password,
        "code": code,
        "world": world
    })

    return response.data;
}

export const updateUser = async (login: string, oldPassword:string, newPassword: string) => {
    const response = await api.put('/users', {
        "name": login,
        "oldPassword": oldPassword,
        "newPassword": newPassword,
    }, {
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`
        }
    });
    return response.data;
}

export const getPlayerLinks = async (playerId: string) => {
    const response = await api.get(`/links/player/${playerId}`, {
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`
        }});
    return response.data;
};

export default api;
