import axios from 'axios';

// Replace this with your Google Apps Script Web App URL after deployment
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzKg8SlZDdOYNMp37NPeg4OsI7XiEtNvKlVH4ugq1AkpLX34qJbqIHruIa94EJ1e9wB/exec';

// Handle RSVP Submission (POST)
export const submitRsvp = (data) =>
  axios.post(GOOGLE_SCRIPT_URL, JSON.stringify(data), {
    headers: { 'Content-Type': 'text/plain' } // Essential for Apps Script
  });

// Handle Fetching Guests for Dashboard (GET)
export const getAllGuests = () =>
  axios.get(GOOGLE_SCRIPT_URL);

// Admin functionality (Simplified)
export const verifyAdmin = (user, pass) => {
  // For serverless, we can check against hardcoded values or sheet settings
  if (user === 'Willy' && pass === 'Sonia') return Promise.resolve({ data: 'success' });
  return Promise.reject({ response: { status: 401 } });
};

// Accept/Reject are handled via the Google Sheet directly for total serverless simplicity
export const acceptGuest = () => Promise.resolve();
export const rejectGuest = () => Promise.resolve();
