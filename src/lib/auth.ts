import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import LinkedInProvider from 'next-auth/providers/linkedin'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'

// Extend NextAuth types to include custom fields
declare module 'next-auth' {
  interface User {
    id?: string
    role?: string
    companyId?: string | null
    isApproved?: boolean
    subscriptionPlan?: string
    isNewUser?: boolean
    trialStatus?: string
  }

  interface Session {
    user: User & {
      name?: string | null
      email?: string | null
      image?: string | null
      id?: string
      role?: string
      companyId?: string | null
      isApproved?: boolean
      subscriptionPlan?: string
      isNewUser?: boolean
      trialStatus?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    companyId?: string | null
    isApproved?: boolean
    subscriptionPlan?: string
    isNewUser?: boolean
    trialStatus?: string
  }
}

// ---------------------------------------------------------------------------
// Demo accounts — DISABLED IN PRODUCTION, development-only
// ---------------------------------------------------------------------------
const DEMO_USERS: Record<string, { id: string; name: string; role: string; companyId: string | null }> = 
  process.env.NODE_ENV === 'development' 
    ? {
      'admin@ipoready.com': { id: 'demo-admin', name: 'Admin User',    role: 'system_admin', companyId: null },
      'ceo@techcorp.com':   { id: 'demo-ceo',   name: 'Sarah Johnson', role: 'ceo',          companyId: 'demo-company' },
    }
    : {}

// ---------------------------------------------------------------------------
// Helper — upsert an OAuth user, return their DB row
// ---------------------------------------------------------------------------
async function upsertOAuthUser(params: {
  provider: string
  providerAccountId: string
  email: string
  name: string
  avatarUrl?: string
}): Promise<{
  id: string
  role: string
  companyId: string | null
  isApproved: boolean
  subscriptionPlan: string
  trialStatus: string
  isNewUser: boolean
}> {
  const { provider, providerAccountId, email, name, avatarUrl } = params

  // 1. Try to find by oauth_provider + oauth_id (returning user via same provider)
  const existing = await sql`
    SELECT u.id, u.role, u.company_id, u.is_approved,
           COALESCE(c.subscription_plan, 'starter') AS subscription_plan,
           COALESCE(c.trial_status, 'none') AS trial_status
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.oauth_provider = ${provider} AND u.oauth_id = ${providerAccountId}
    LIMIT 1
  `

  if (existing.length > 0) {
    const row = existing[0] as any
    return {
      id: row.id,
      role: row.role,
      companyId: row.company_id,
      isApproved: row.is_approved,
      subscriptionPlan: row.subscription_plan ?? 'starter',
      trialStatus: row.trial_status ?? 'none',
      isNewUser: false,
    }
  }

  // 2. Try to find by email (user may have registered via credentials first)
  const byEmail = await sql`
    SELECT u.id, u.role, u.company_id, u.is_approved,
           COALESCE(c.subscription_plan, 'starter') AS subscription_plan,
           COALESCE(c.trial_status, 'none') AS trial_status
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.email = ${email.toLowerCase()}
    LIMIT 1
  `

  if (byEmail.length > 0) {
    const row = byEmail[0] as any
    // Link the oauth provider to their existing account
    await sql`
      UPDATE users
      SET oauth_provider = ${provider},
          oauth_id       = ${providerAccountId},
          avatar_url     = COALESCE(avatar_url, ${avatarUrl ?? null}),
          updated_at     = NOW()
      WHERE id = ${row.id}
    `
    return {
      id: row.id,
      role: row.role,
      companyId: row.company_id,
      isApproved: row.is_approved,
      subscriptionPlan: row.subscription_plan ?? 'starter',
      trialStatus: row.trial_status ?? 'none',
      isNewUser: false,
    }
  }

  // 3. Brand-new user — create their account (pending approval)
  const inserted = await sql`
    INSERT INTO users (
      email, name, role, is_approved,
      oauth_provider, oauth_id, avatar_url,
      language, currency, is_new_user, created_at, updated_at
    )
    VALUES (
      ${email.toLowerCase()}, ${name}, 'ceo', FALSE,
      ${provider}, ${providerAccountId}, ${avatarUrl ?? null},
      'en', 'CAD', TRUE, NOW(), NOW()
    )
    RETURNING id, role, company_id, is_approved
  `

  const row = inserted[0] as any
  return {
    id: row.id,
    role: row.role,
    companyId: row.company_id ?? null,
    isApproved: false,
    subscriptionPlan: 'starter',
    trialStatus: 'none',
    isNewUser: true,
  }
}

// ---------------------------------------------------------------------------
// Auth options
// ---------------------------------------------------------------------------
export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: 'select_account',
            scope: 'openid email profile',
          },
        },
      }),
    ] : []),

    ...(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET ? [
      LinkedInProvider({
        clientId:     process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        // next-auth v4.24 LinkedIn uses OIDC — requires "Sign In with LinkedIn
        // using OpenID Connect" product enabled in LinkedIn Developer portal
        authorization: {
          params: { scope: 'openid profile email' },
        },
        issuer: 'https://www.linkedin.com',
        jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
        profile(profile: any) {
          return {
            id:    profile.sub,
            name:  [profile.given_name, profile.family_name].filter(Boolean).join(' '),
            email: profile.email,
            image: profile.picture,
          }
        },
      } as any),
    ] : []),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = credentials.email.toLowerCase().trim()

        // Demo credentials — development-only for internal testing
        if (process.env.NODE_ENV === 'development' && credentials.password === 'demo123' && DEMO_USERS[email]) {
          const d = DEMO_USERS[email]
          return { id: d.id, email, name: d.name, role: d.role, companyId: d.companyId, isApproved: true }
        }

        // DB lookup
        try {
          const rows = await sql`
            SELECT u.id, u.email, u.name, u.password_hash, u.role,
                   u.company_id, u.is_approved,
                   COALESCE(c.subscription_plan, 'starter') AS subscription_plan
            FROM users u
            LEFT JOIN companies c ON c.id = u.company_id
            WHERE u.email = ${email}
            LIMIT 1
          `
          if (rows.length === 0) return null
          const user = rows[0] as any
          if (!user.password_hash) return null          // OAuth-only account
          const valid = await bcrypt.compare(credentials.password, user.password_hash)
          if (!valid) return null
          return {
            id:               user.id,
            email:            user.email,
            name:             user.name,
            role:             user.role,
            companyId:        user.company_id,
            isApproved:       user.is_approved,
            subscriptionPlan: user.subscription_plan,
          }
        } catch {
          return null
        }
      },
    }),
  ],

  // -------------------------------------------------------------------------
  // signIn callback — runs for EVERY sign-in (OAuth + Credentials)
  // -------------------------------------------------------------------------
  callbacks: {
    async signIn({ user, account }) {
      // Credentials sign-ins are handled in `authorize()` above
      if (account?.provider === 'credentials') return true

      // OAuth sign-in — upsert into DB
      if (!user.email) return '/login?error=NoEmail'

      try {
        const dbUser = await upsertOAuthUser({
          provider:          account!.provider,
          providerAccountId: account!.providerAccountId,
          email:             user.email,
          name:              user.name ?? user.email.split('@')[0],
          avatarUrl:         user.image ?? undefined,
        })

        // Attach DB data onto the user object so jwt() can read it
        ;(user as any).id              = dbUser.id
        ;(user as any).role            = dbUser.role
        ;(user as any).companyId       = dbUser.companyId
        ;(user as any).isApproved      = dbUser.isApproved
        ;(user as any).subscriptionPlan = dbUser.subscriptionPlan
        ;(user as any).trialStatus     = dbUser.trialStatus
        ;(user as any).isNewUser       = dbUser.isNewUser

        return true
      } catch (err) {
        console.error('[signIn] OAuth upsert failed:', err)
        return '/login?error=DatabaseError'
      }
    },

    // -----------------------------------------------------------------------
    // jwt callback — persists data from signIn into the JWT token
    // -----------------------------------------------------------------------
    async jwt({ token, user }) {
      if (user) {
        token.id              = (user as any).id ?? token.sub
        token.role            = (user as any).role
        token.companyId       = (user as any).companyId
        token.isApproved      = (user as any).isApproved
        token.subscriptionPlan = (user as any).subscriptionPlan ?? 'starter'
        token.trialStatus     = (user as any).trialStatus ?? 'none'
        token.isNewUser       = (user as any).isNewUser ?? false
      }
      return token
    },

    // -----------------------------------------------------------------------
    // session callback — exposes safe fields to the client
    // -----------------------------------------------------------------------
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id              = token.id ?? token.sub
        ;(session.user as any).role            = token.role
        ;(session.user as any).companyId       = token.companyId
        ;(session.user as any).isApproved      = token.isApproved
        ;(session.user as any).subscriptionPlan = token.subscriptionPlan ?? 'starter'
        ;(session.user as any).trialStatus     = token.trialStatus ?? 'none'
        ;(session.user as any).isNewUser       = token.isNewUser ?? false
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: {
    strategy: 'jwt',
    // Production: 1 hour (3600s), Development: 30 days for easier testing
    maxAge:   process.env.NODE_ENV === 'production' 
      ? 60 * 60  // 1 hour for production
      : 30 * 24 * 60 * 60, // 30 days for development
  },

  secret: process.env.NEXTAUTH_SECRET,
}
