import { Configuration, PopupRequest } from "@azure/msal-browser";

// Check if Azure auth is configured
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || "";
  }
  return "";
};

export const AZURE_TENANT_NAME = getEnvVar("VITE_AZURE_TENANT_NAME");
export const AZURE_CLIENT_ID = getEnvVar("VITE_AZURE_CLIENT_ID");
export const AZURE_SIGN_IN_POLICY = getEnvVar("VITE_AZURE_SIGN_IN_POLICY") || "B2C_1_signupsignin1";
export const AZURE_EDIT_PROFILE_POLICY = getEnvVar("VITE_AZURE_EDIT_PROFILE_POLICY") || "B2C_1_profileediting1";

// Check if Azure AD B2C is configured
export const isAzureAuthEnabled = !!AZURE_TENANT_NAME && !!AZURE_CLIENT_ID;

export const msalConfig: Configuration = {
  auth: {
    clientId: AZURE_CLIENT_ID || "placeholder-client-id",
    authority: AZURE_TENANT_NAME 
      ? `https://${AZURE_TENANT_NAME}.b2clogin.com/${AZURE_TENANT_NAME}.onmicrosoft.com/${AZURE_SIGN_IN_POLICY}`
      : "",
    knownAuthorities: AZURE_TENANT_NAME ? [`${AZURE_TENANT_NAME}.b2clogin.com`] : [],
    redirectUri: typeof window !== 'undefined' ? window.location.origin : "",
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : "",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ["openid", "profile", "email"],
};

export const editProfileRequest: PopupRequest = {
  authority: AZURE_TENANT_NAME
    ? `https://${AZURE_TENANT_NAME}.b2clogin.com/${AZURE_TENANT_NAME}.onmicrosoft.com/${AZURE_EDIT_PROFILE_POLICY}`
    : "",
  scopes: ["openid", "profile", "email"],
};
