import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, isAzureAuthEnabled } from "../utils/azure/authConfig";
import { ReactNode, useEffect, useState } from "react";

let msalInstance: PublicClientApplication | null = null;

// Only initialize MSAL if Azure auth is enabled
if (isAzureAuthEnabled) {
  try {
    msalInstance = new PublicClientApplication(msalConfig);
  } catch (error) {
    console.error("Failed to initialize MSAL:", error);
  }
}

interface AzureAuthProviderProps {
  children: ReactNode;
}

export function AzureAuthProvider({ children }: AzureAuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeMsal = async () => {
      if (msalInstance && isAzureAuthEnabled) {
        try {
          await msalInstance.initialize();
        } catch (error) {
          console.error("MSAL initialization error:", error);
        }
      }
      setIsInitialized(true);
    };

    initializeMsal();
  }, []);

  // If Azure auth is not enabled, just render children without MSAL provider
  if (!isAzureAuthEnabled) {
    return <>{children}</>;
  }

  // If MSAL failed to initialize, render children without provider
  if (!msalInstance) {
    console.warn("MSAL instance not available, Azure auth disabled");
    return <>{children}</>;
  }

  // Wait for MSAL to initialize before rendering
  if (!isInitialized) {
    return null;
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
