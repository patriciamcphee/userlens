// src/utils/azure/authConfig.ts
import { Configuration, PopupRequest } from "@azure/msal-browser";

// Helper to get environment variables
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || "";
  }
  return "";
};

// External ID (CIAM) configuration
export const AZURE_TENANT_ID = getEnvVar("VITE_AZURE_TENANT_ID");
export const AZURE_CLIENT_ID = getEnvVar("VITE_AZURE_CLIENT_ID");
export const AZURE_TENANT_SUBDOMAIN = getEnvVar("VITE_AZURE_TENANT_SUBDOMAIN");

// Check if Azure External ID is configured
export const isAzureAuthEnabled = !!AZURE_TENANT_SUBDOMAIN && !!AZURE_CLIENT_ID;

// MSAL configuration for External ID (CIAM)
// Note: CIAM uses ciamlogin.com domain instead of b2clogin.com
export const msalConfig: Configuration = {
  auth: {
    clientId: AZURE_CLIENT_ID || "placeholder-client-id",
    // External ID authority format
    authority: AZURE_TENANT_SUBDOMAIN
      ? `https://${AZURE_TENANT_SUBDOMAIN}.ciamlogin.com/`
      : "",
    knownAuthorities: AZURE_TENANT_SUBDOMAIN 
      ? [`${AZURE_TENANT_SUBDOMAIN}.ciamlogin.com`] 
      : [],
    redirectUri: typeof window !== 'undefined' ? window.location.origin : "",
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : "",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

// Login request scopes
export const loginRequest: PopupRequest = {
  scopes: ["openid", "profile", "email"],
};

// For future use: API scopes if you expose a custom API
export const apiRequest: PopupRequest = {
  scopes: AZURE_CLIENT_ID 
    ? [`api://${AZURE_CLIENT_ID}/access_as_user`]
    : [],
};

// Legacy exports for backward compatibility during migration
export const AZURE_TENANT_NAME = AZURE_TENANT_SUBDOMAIN;