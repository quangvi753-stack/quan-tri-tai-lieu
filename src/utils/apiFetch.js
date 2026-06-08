// src/utils/apiFetch.js
// Global fetch interceptor — automatically appends Authorization header.
// Does NOT force Content-Type so that FormData (multipart) uploads work correctly.

const originalFetch = window.fetch;

export const apiFetch = (url, options = {}) => {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const token = user.token;

  // If the caller provides a FormData body, let the browser set Content-Type automatically
  // (it needs to include the multipart boundary). Otherwise default to JSON.
  const isFormData = options.body instanceof FormData;
  
  const defaultHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return originalFetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,  // caller's headers override defaults (except FormData boundary)
    },
  });
};
