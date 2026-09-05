const rawKeycloak = (import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8181').trim().replace(/\/+$/, '');
const KEYCLOAK_BASE_URL = rawKeycloak;
const rawAppUrl = (typeof window !== 'undefined' ? window.location.origin : (import.meta.env.VITE_APP_URL || 'http://localhost:3000')).trim().replace(/\/+$/, '');
const APP_BASE_URL = rawAppUrl;

export const authConfig = {
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'oauth2-pkce-client',

  authorizationEndpoint:
    `${KEYCLOAK_BASE_URL}/realms/fitness-oauth2/protocol/openid-connect/auth`,

  tokenEndpoint:
    `${KEYCLOAK_BASE_URL}/realms/fitness-oauth2/protocol/openid-connect/token`,

  logoutEndpoint:
    `${KEYCLOAK_BASE_URL}/realms/fitness-oauth2/protocol/openid-connect/logout`,

  logoutRedirect: `${APP_BASE_URL}/`,

  redirectUri: `${APP_BASE_URL}/`,

  scope: 'openid profile email offline_access',

  storage: 'local',

  refreshTokenExpiryStrategy: 'renewable',

  autoLogin: false,

  decodeToken: true,

  onRefreshTokenExpire: (event) => event.logIn(),
};