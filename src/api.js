import axios from 'axios';

// The URL for the Google Apps Script Web App
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyR6F6q_v987vS-6_H_XUfC_C2oYpizk6A4hlyT6D0-4m76U0vYfG_7M7XJz9z_Y8k/exec';

const api = axios.create({
  baseURL: GOOGLE_SCRIPT_URL,
  headers: { 'Content-Type': 'text/plain;charset=utf-8' }
});

export const submitRsvp = (data) => axios.post(GOOGLE_SCRIPT_URL, { action: 'submitRsvp', ...data });
export const getAllGuests = (user, pass) => axios.post(GOOGLE_SCRIPT_URL, { action: 'getAllGuests', user, pass });

// Simple admin verification (can just try to catch guests or have a specific ping)
export const verifyAdmin = (user, pass) => axios.post(GOOGLE_SCRIPT_URL, { action: 'verifyAdmin', user, pass });

export const acceptGuest = (id, user, pass) => axios.post(GOOGLE_SCRIPT_URL, { action: 'updateStatus', id, status: 'ACCEPTED', user, pass });
export const rejectGuest = (id, user, pass) => axios.post(GOOGLE_SCRIPT_URL, { action: 'updateStatus', id, status: 'REJECTED', user, pass });

export default api;
