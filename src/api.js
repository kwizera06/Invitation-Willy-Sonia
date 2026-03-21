import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/rsvp';

// Public API — no auth needed
export const submitRsvp = (data) => axios.post(BASE_URL, data);

// Admin API helpers — pass base64 credentials
const adminHeaders = (username, password) => ({
  headers: {
    Authorization: 'Basic ' + btoa(`${username}:${password}`),
    'Content-Type': 'application/json',
  },
});

export const verifyAdmin = (username, password) =>
  axios.get(BASE_URL, adminHeaders(username, password));

export const getAllGuests = (username, password) =>
  axios.get(BASE_URL, adminHeaders(username, password));

export const acceptGuest = (id, username, password) =>
  axios.put(`${BASE_URL}/${id}/accept`, {}, adminHeaders(username, password));

export const rejectGuest = (id, username, password) =>
  axios.put(`${BASE_URL}/${id}/reject`, {}, adminHeaders(username, password));
