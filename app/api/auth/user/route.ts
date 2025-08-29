import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabaseAdmin } from '@/lib/supabase';

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

    // Special case: Admin email always has access
    if (session.user.email === 'cufy.online@gmail.com') {
      // Try to get admin user, create if doesn't exist
      let { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (error && error.code === 'PGRST116') {
        // Admin user doesn't exist, create it
        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert([{
            email: session.user.email,
            full_name: session.user.name || 'Admin User',
            age: 25,
            gender: 'male',
            university: 'Admin University',
            bio: 'System Administrator',
            is_admin: true,
            subscription_status: 'active',
            payment_confirmed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating admin user:', createError);
          return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
        }
        user = newUser;
      } else if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      return NextResponse.json({ 
        exists: true, 
        user: {
          ...user,
          is_admin: true
        }
      });
    }

    // For non-admin users, check if user exists in our database
    const { data: user, error } = await supabaseAdmin
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

    // User exists
    return NextResponse.json({ 
      exists: true, 
      user: {
        ...user,
        is_admin: user.is_admin || false
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
