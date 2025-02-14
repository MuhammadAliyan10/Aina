"use client";

import { initFacebookSDK } from "@/app/(main)/action";
import { useEffect, useState } from "react";
import LoadingButton from "./LoadingButton";
import { getFacebookTokenExpiry } from "@/utils/facebook";
import { useToast } from "@/hooks/use-toast";

const LoginFacebook: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      initFacebookSDK().then(() => {
        console.log("Facebook SDK Initialized");
      });
    }
  }, []);

  const handleLogin = async () => {
    if (!window.FB) {
      console.error("Facebook SDK not initialized.");
      setErrorMessage("Facebook SDK not initialized, Kindly refresh the page.");
      toast({
        title: " Facebook SDK Initialized",
        description: "Facebook SDK not initialized, Kindly refresh the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await new Promise<void>((resolve, reject) => {
        window.FB.login(
          (response: any) => {
            if (response.authResponse) {
              const accessToken = response.authResponse.accessToken;
              window.FB.api(
                "/me",
                { fields: "id", access_token: accessToken },
                (userResponse: any) => {
                  if (userResponse && userResponse.id) {
                    handleTokenGeneration(userResponse.id, accessToken);
                    resolve();
                  } else {
                    console.error("Failed to fetch Facebook user details.");
                    toast({
                      title: " Facebook",
                      description:
                        "Failed to fetch Facebook user details. Kindly login again.",
                      variant: "destructive",
                    });
                    setErrorMessage("Failed to fetch Facebook user details.");
                    reject(new Error("Failed to fetch Facebook user details."));
                  }
                }
              );
            } else {
              console.error("User cancelled login or did not fully authorize.");
              toast({
                title: "Facebook",
                description: "User cancelled login or did not fully authorize.",
                variant: "destructive",
              });
              setErrorMessage(
                "User cancelled login or did not fully authorize."
              );
              reject(
                new Error("User cancelled login or did not fully authorize.")
              );
            }
          },
          { scope: "public_profile" }
        );
      });
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred during login.");
      toast({
        title: "Facebook",
        description: "An error occurred during login. Kindly try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenGeneration = async (
    facebook_id: string,
    accessToken: string
  ) => {
    try {
      const { expiresAt: tokenExpiry, isValid } = await getFacebookTokenExpiry(
        accessToken
      );

      if (!isValid || !tokenExpiry) {
        throw new Error("Invalid or expired access token.");
      }
      const res = await fetch("/api/auth/facebook/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken() || "",
        },
        body: JSON.stringify({ accessToken, facebook_id, tokenExpiry }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("authToken", data.token);
      } else {
        console.error(
          "Failed to generate token:",
          data.message || "Unknown error"
        );
        setErrorMessage("Failed to generate token.");
      }
    } catch (error) {
      console.log("Error while generating token:", error);
      setErrorMessage("Error generating token.");
    }
  };

  const getCSRFToken = (): string | null => {
    // Implement logic to retrieve CSRF token securely (from cookies, for example)
    return document.cookie.replace(
      /(?:(?:^|.*;\s*)csrf_token\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
  };

  return (
    <div>
      <LoadingButton
        loading={isLoading}
        onClick={handleLogin}
        className="my-6"
        type="submit"
      >
        Login with Facebook
      </LoadingButton>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </div>
  );
};

export default LoginFacebook;
