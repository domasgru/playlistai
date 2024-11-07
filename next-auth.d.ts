import "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    account_id?: string;
  }
}
