import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const code = searchParams.get('code')

    console.log('Callback params:', { token_hash, type, code })

    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type: type as 'invite' | 'email' | 'magiclink' | 'recovery' | 'email_change',
            token_hash,
        })

        console.log('Verify OTP error:', error)

        if (!error) {
            return NextResponse.redirect(`${origin}/merchant/setup`)
        }
    }

    console.log('Falling back to login')
    return NextResponse.redirect(`${origin}/merchant/login`)
}