const APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "";
const APP_SECRET = process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET || "";

/**
 * @param userAccessToken
 * @returns
 */
export async function getFacebookTokenExpiry(userAccessToken: string) {
  const appAccessToken = `${APP_ID}|${APP_SECRET}`;

  const url = `https://graph.facebook.com/debug_token?input_token=${userAccessToken}&access_token=${appAccessToken}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to inspect token: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const { expires_at, is_valid } = data.data;

    return {
      expiresAt: new Date(expires_at * 1000),
      isValid: is_valid,
    };
  } catch (error) {
    console.error("Error checking token:", error);
    throw new Error("Failed to validate Facebook access token.");
  }
}
