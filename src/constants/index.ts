export const APP_NAME = 'ideaHub';
export const ALLOWED_EMAIL_DOMAIN = '@dtu.ac.in';

export const ROUTES = {
  HOME: '/',
  SIGNUP: '/signup',
  FEED: '/feed',
  POST: '/post',
  PROFILE: '/profile',
} as const;

export const STORAGE_KEYS = {
  USER: 'user',
  IDEAS: 'ideas',
  USERS: 'users',
} as const;

export const ERROR_MESSAGES = {
  INVALID_EMAIL: `Only ${ALLOWED_EMAIL_DOMAIN} emails are allowed`,
  EMAIL_REQUIRED: 'Please enter your email',
  TITLE_REQUIRED: 'Title is required',
  DESCRIPTION_REQUIRED: 'Description is required',
} as const;
