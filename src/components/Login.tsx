import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useAzureAuth } from "../hooks/useAzureAuth";
import { isAzureAuthEnabled } from "../utils/azure/authConfig";
import { Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export function Login() {
  const { signIn } = useAzureAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn();
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAzureAuthEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">UL</span>
            </div>
            <CardTitle className="text-2xl">Azure AD Not Configured</CardTitle>
            <CardDescription>
              Azure AD B2C authentication is not configured for this application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuration Required</AlertTitle>
              <AlertDescription>
                Please set up Azure AD B2C environment variables to enable authentication.
                See AZURE_AUTH_SETUP.md for instructions.
              </AlertDescription>
            </Alert>
            <p className="text-xs text-center text-slate-600">
              Missing: VITE_AZURE_CLIENT_ID and VITE_AZURE_TENANT_NAME
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">UL</span>
          </div>
          <CardTitle className="text-2xl">Welcome to ParticipantLens</CardTitle>
          <CardDescription>
            Sign in to access your user research projects and synthesis dashboards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleSignIn} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in with Azure AD"
            )}
          </Button>
          <p className="text-xs text-center text-slate-600">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
