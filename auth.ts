import NextAuth from "next-auth";
import Spotify from "next-auth/providers/spotify";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    accountId?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Spotify({
      authorization: `https://accounts.spotify.com/authorize?scope=${encodeURIComponent("playlist-read-private playlist-modify-public playlist-modify-private")}`,
    }),
  ],
  callbacks: {
    jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          accountId: account.providerAccountId,
        };
      }

      return token;
    },
    session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken;
      session.accountId = token.accountId;

      return session;
    },
  },
});
