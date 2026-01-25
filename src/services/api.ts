import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_FURUKSONG2_SERVER_URL;

export const request = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Para requisições multipart/form-data
export const requestMultipart = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
