import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabase } from '@/lib/supabase';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user exists in our database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!user) {
      // User doesn't exist in our database
      return NextResponse.json({ 
        exists: false, 
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      });
    }

    // User exists, check if they're admin
    const isAdmin = user.is_admin || session.user.email === 'cufy.online@gmail.com';

    return NextResponse.json({ 
      exists: true, 
      user: {
        ...user,
        is_admin: isAdmin
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
