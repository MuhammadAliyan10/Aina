declare global {
  interface Window {
    fbAsyncInit?: () => void;
  }
}

export const initFacebookSDK = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.FB) {
      console.log("Facebook SDK already initialized.");
      resolve();
    } else {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID as string,
          cookie: true,
          xfbml: true,
          version: "v16.0", // Update to the required version
        });
        console.log("Facebook SDK Initialized");
        resolve();
      };
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  });
};
