import axios from "axios";

const FACEBOOK_GRAPH_API_URL = "https://graph.facebook.com/v14.0/";

export async function getFacebookUserData(token: string) {
  try {
    const { data } = await axios.get(`${FACEBOOK_GRAPH_API_URL}me`, {
      params: {
        access_token: token,
        fields: "public_profile",
      },
    });

    return data;
  } catch (error) {
    throw new Error("Error fetching data from Facebook");
  }
}
