import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { Pool } from "pg"

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.DB_SSL_CA,
  },
})

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      // Add the required credentials property
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          return null
        }

        const result = await pool.query(
          "SELECT id, login, first_name, last_name, email, password_hash, role, avatar, created_at FROM users WHERE login = $1",
          [credentials.login],
        )

        if (result.rows.length === 0) {
          return null
        }

        const user = result.rows[0]
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id.toString(),
          login: user.login,
          name: `${user.first_name} ${user.last_name}`.trim(),
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          created_at: user.created_at,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.login = user.login
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.role = user.role
        token.avatar = user.avatar
        token.created_at = user.created_at
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.login = token.login
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.role = token.role
        session.user.avatar = token.avatar
        session.user.created_at = token.created_at
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Remove trustHost if it's not supported in your NextAuth version
  // If you need it, you might need to update NextAuth
}

