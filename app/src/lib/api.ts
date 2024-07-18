import axios from 'axios';
import {getTokenFromCookies} from "@/lib/utils";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

export const getPlayerCommands = async (playerId) => {
    const response = await api.get(`/commands/player/${playerId}`, {
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`
        }});
    return response.data;
};

export const getDeletedCommands = async (playerId) => {
    const response = await api.get(`/commands/player/${playerId}/deleted`, {
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`
    }});
    return response.data;
}
export const softDeleteCommands = async (commandIds) => {
    const response = await api.delete('/commands', {
        data: { commandIds },
        headers: {
            Authorization: `Bearer ${getTokenFromCookies()}`
        }
    });
    return response.data;
}

export const restoreCommands = async (commandIds) => {
    const response = await api.put('/commands', { commandIds }, {
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

export const registerUser = async (login: string, password: string, code: string) => {
    const response = await api.post('users', {
        "name": login,
        "password": password,
        "code": code
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
export default api;
