export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL_REMOTE
  : process.env.REACT_APP_API_URL_LOCAL; 