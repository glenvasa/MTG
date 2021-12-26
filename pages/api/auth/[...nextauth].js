import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import spotifyApi, { LOGIN_URL } from "../../../lib/spotify";

async function refreshAccessToken(token) {
  try {
    spotifyApi.setAccessToken(token.accessToken);
    spotifyApi.setRefreshToken(token.refreshToken);

    const { body: refreshedToken } = await spotifyApi.refreshAccessToken();
    console.log("Refreshed Token Is", refreshedToken);

    return {
      ...token,
      accessToken: refreshedToken.access_token,
      accessTokenExpires: Date.now() + refreshedToken.expires_in * 1000, // = 1 hour
      refreshToken: refreshedToken.refresh_token ?? token.refreshToken, // replace if new one came back, else use old refesh token
    };
  } catch (error) {
    console.error(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default NextAuth({
  // configure one or more auth providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization: LOGIN_URL,
    }),
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at * 1000, // expire times handled in ms
        };
      }

      // return previous token if the access token has not yet expired and user
      // logs in again
      if (Date.now() < token.accessTokenExpires) {
        console.log("Existing Access Token is Valid");
        return token;
      }

      // Access token has expired; need to refresh
      console.log("Access Token has Expired, Refreshing...");
      return await refreshAccessToken(token);
    },

    async session({session, token}) {
        // connects to what client can see in the session
        session.user.accessToken = token.accessToken
        session.user.refreshToken = token.refreshToken,
        session.user.username = token.username

        return session
    }
  },
});
