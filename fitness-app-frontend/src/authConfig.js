const KEYCLOAK_BASE_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8181';
const APP_BASE_URL = typeof window !== 'undefined' ? window.location.origin : (import.meta.env.VITE_APP_URL || 'http://localhost:3000');

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

  onRefreshTokenExpire: (event) => event.logIn(),
};