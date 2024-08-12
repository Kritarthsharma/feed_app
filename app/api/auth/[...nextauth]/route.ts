import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth";

// Next auth credentials config to authenticate user.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
