import NextAuth from "next-auth";
import Spotify from "next-auth/providers/spotify";

declare module "next-auth" {
  interface Session {
    access_token?: string;
    account_id?: string;
    access_token_expires_at?: number;
    refresh_token?: string;
  }
}

const baseConfig = {
  providers: [
    Spotify({
      authorization: `https://accounts.spotify.com/authorize?scope=${encodeURIComponent("playlist-read-private playlist-modify-public playlist-modify-private user-modify-playback-state user-read-playback-state user-read-currently-playing streaming")}`,
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: any; account: any }) {
      // https://authjs.dev/guides/refresh-token-rotation
      if (account) {
        return {
          ...token,
          access_token: account.access_token,
          access_token_expires_at: account.expires_at,
          refresh_token: account.refresh_token,
          account_id: account.providerAccountId,
        };
      } else if (Date.now() < token.access_token_expires_at * 1000) {
        return token;
      } else {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: token.refresh_token!,
            client_id: process.env.AUTH_SPOTIFY_ID!,
          }),
        });

        const tokensOrError = await response.json();

        if (!response.ok) throw tokensOrError;

        const newTokens = tokensOrError as {
          access_token: string;
          expires_in: number;
          refresh_token?: string;
        };

        token.access_token = newTokens.access_token;
        token.access_token_expires_at = Math.floor(
          Date.now() / 1000 + newTokens.expires_in,
        );

        if (newTokens.refresh_token)
          token.refresh_token = newTokens.refresh_token;
        return token;
      }
    },
    session({ session, token }: { session: any; token: any }) {
      session.access_token = token.access_token;
      return session;
    },
    authorized({ auth, request }: { auth: any; request: any }) {
      console.log("authorized auth--->", auth);
      console.log("authorized request--->", request);
      return !!auth;
    },
  },
};
export const { handlers, signIn, signOut } = NextAuth(baseConfig);

const serverConfig = {
  ...baseConfig,
  callbacks: {
    session({ session, token }: { session: any; token: any }) {
      session.access_token = token.access_token;
      session.account_id = token.account_id;
      session.access_token_expires_at = token.access_token_expires_at;
      session.refresh_token = token.refresh_token;

      console.log("session callback--->", session);

      return session;
    },
  },
};

export const { auth } = NextAuth(serverConfig);
