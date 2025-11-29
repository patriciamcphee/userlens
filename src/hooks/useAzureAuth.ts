import { useMsal } from "@azure/msal-react";
import { loginRequest, isAzureAuthEnabled } from "../utils/azure/authConfig";
import { AccountInfo } from "@azure/msal-browser";

export interface AzureUser {
  id: string;
  email: string;
  name: string;
  organizationId?: string;
  role?: string;
}

export function useAzureAuth() {
  // If Azure auth is not enabled, return a mock auth object
  if (!isAzureAuthEnabled) {
    return {
      isAuthenticated: false,
      user: null,
      signIn: async () => {},
      signOut: async () => {},
      getAccessToken: async () => null,
    };
  }

  const { instance, accounts } = useMsal();
  const account = accounts[0];

  const signIn = async () => {
    try {
      const response = await instance.loginPopup(loginRequest);
      return response;
    } catch (error) {
      console.error("Azure AD sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await instance.logoutPopup({
        account: account,
      });
    } catch (error) {
      console.error("Azure AD sign out error:", error);
      throw error;
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (!account) return null;

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      });
      return response.accessToken;
    } catch (error) {
      console.error("Failed to acquire token silently:", error);
      try {
        const response = await instance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (popupError) {
        console.error("Failed to acquire token via popup:", popupError);
        return null;
      }
    }
  };

  const getCurrentUser = (): AzureUser | null => {
    if (!account) return null;

    return {
      id: account.localAccountId,
      email: account.username,
      name: account.name || account.username,
      organizationId: (account.idTokenClaims as any)?.extension_organizationId,
      role: (account.idTokenClaims as any)?.extension_role || "member",
    };
  };

  return {
    isAuthenticated: !!account,
    user: getCurrentUser(),
    signIn,
    signOut,
    getAccessToken,
  };
}
