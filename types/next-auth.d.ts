import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    login: string
    firstName?: string
    lastName?: string
    role?: string
    avatar?: string | null
    created_at?: Date
  }

  interface Session {
    user: {
      id: string
      login: string
      name?: string | null
      firstName?: string
      lastName?: string
      email?: string | null
      role?: string
      avatar?: string | null
      created_at?: Date
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    login: string
    firstName?: string
    lastName?: string
    role?: string
    avatar?: string | null
    created_at?: Date
  }
}

