
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // The `cookies().set()` method can only be called from a Server Component or Route Handler.
            // This error `cookies().set()` is ignored if you're processing a Request with Middleware or a Client Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // The `cookies().set()` method can only be called from a Server Component or Route Handler.
            // This error `cookies().set()` is ignored if you're processing a Request with Middleware or a Client Component
          }
        },
      },
    }
  )
}
