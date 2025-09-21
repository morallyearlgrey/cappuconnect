import { AuthOptions } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt'; 

export const authOptions: AuthOptions = {
    adapter: MongoDBAdapter(clientPromise),

    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' }
        },
      
        // basically sees that the user exists, and if so, returns a user object to create a session
      async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) return null;

  const client = await clientPromise;
  const users = client.db("cappuconnect").collection("users");

  const user = await users.findOne({ email: credentials.email.toLowerCase() });
  if (!user || !user.password) return null;

  const isPasswordValid = await compare(credentials.password, user.password);
  if (!isPasswordValid) return null;

  // return the user object (no password)
  return {
    id: user._id.toString(),
    email: user.email,
    name: `${user.firstname || ""} ${user.lastname || ""}`.trim(),
  };
}
    })
  ],

   session: {
      strategy: "jwt", // jwt means sessions are stored as json web tokens rather than in the db
      maxAge: 60*60, // 1 hour session age lol
    },
    pages: {
  signIn: "/auth/signin",
},

    callbacks: {
        async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
        }
        return token;
        },
         async session({ session, token }) {
            return {
              ...session,
              user: {
                ...session.user,
                id: token.id as string,
              }
            }
        }
  },
};