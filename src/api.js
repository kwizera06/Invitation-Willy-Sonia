import axios from 'axios';

// The URL for the Google Apps Script Web App
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdbhIKOo5zOrF9ovp9wvaj8FMAiNOgxhQ1HuX7Blab7Ptu60_ng-25wB12Mrcpc0lM/exec';

const api = axios.create({
  baseURL: GOOGLE_SCRIPT_URL,
  headers: { 'Content-Type': 'text/plain;charset=utf-8' }
});

// Intercept responses to throw if Google Apps Script returned { error: '...' } 
// Since GAS always returns HTTP 200, we must catch frontend-side errors manually.
axios.interceptors.response.use(response => {
  if (response.data && response.data.error) {
    const err = new Error(response.data.error);
    err.response = { data: { error: response.data.error } };
    throw err;
  }
  return response;
});

export const submitRsvp = (data) =>
  axios.post(GOOGLE_SCRIPT_URL, JSON.stringify({ action: 'submitRsvp', ...data }), {
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });

export const getAllGuests = (user, pass) =>
  axios.post(GOOGLE_SCRIPT_URL, JSON.stringify({ action: 'getAllGuests', user, pass }), {
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });

export const verifyAdmin = async (user, pass) => {
  // Hardcoded Admin credentials to avoid hitting Google Sheets for login
  const ADMIN_USER = 'Willy';
  const ADMIN_PASS = 'Sonia'; // Change this if needed

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return { data: { success: true } };
  } else {
    const error = new Error('Invalid username or password.');
    error.response = { status: 401 };
    throw error;
  }
};

export const acceptGuest = (id, user, pass) =>
  axios.post(GOOGLE_SCRIPT_URL, JSON.stringify({ action: 'updateStatus', id, status: 'ACCEPTED', user, pass }), {
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });

export const rejectGuest = (id, user, pass) =>
  axios.post(GOOGLE_SCRIPT_URL, JSON.stringify({ action: 'updateStatus', id, status: 'REJECTED', user, pass }), {
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  });

export default api;
