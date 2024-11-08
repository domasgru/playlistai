import NextAuth from "next-auth";
import Spotify from "next-auth/providers/spotify";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    accountId?: string;
  }
}

const baseConfig = {
  providers: [
    Spotify({
      authorization: `https://accounts.spotify.com/authorize?scope=${encodeURIComponent("playlist-read-private playlist-modify-public playlist-modify-private")}`,
    }),
  ],
  callbacks: {
    jwt({ token, account }: { token: any; account: any }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          accountId: account.providerAccountId,
        };
      }

      return token;
    },
  },
};
export const { handlers, signIn, signOut } = NextAuth(baseConfig);

const serverConfig = {
  ...baseConfig,
  callbacks: {
    session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken;
      session.accountId = token.accountId;

      return session;
    },
  },
};
export const { auth } = NextAuth(serverConfig);

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [
//     Spotify({
//       authorization: `https://accounts.spotify.com/authorize?scope=${encodeURIComponent("playlist-read-private playlist-modify-public playlist-modify-private")}`,
//     }),
//   ],
//   callbacks: {
//     jwt({ token, account }) {
//       if (account) {
//         return {
//           ...token,
//           accessToken: account.access_token,
//           accountId: account.providerAccountId,
//         };
//       }

//       return token;
//     },
//     session({ session, token }: { session: any; token: any }) {
//       session.accessToken = token.accessToken;
//       session.accountId = token.accountId;

//       return session;
//     },
//   },
// });
